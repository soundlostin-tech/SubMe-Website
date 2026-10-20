import https from 'https';
import fs from 'fs';

const channels = [
  { handle: '@TechnoGamerzOfficial', category: 'Gaming' },
  { handle: '@MrBeast', category: 'Entertainment' },
  { handle: '@liveinsaan', category: 'Gaming & Commentary' },
  { handle: '@AnshuBisht', category: 'Minecraft & Gaming' },
  { handle: '@souravjvlogs', category: 'Family Vlogs' },
  { handle: '@MRINDIANHACKER', category: 'Experiments & Science' },
  { handle: '@IShowSpeed', category: 'Live & Gaming' },
  { handle: '@TotalGaming093', category: 'Esports & Gaming' },
  { handle: '@ManojDey', category: 'Tech & YouTube Tips' }
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    };
    https.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractYtInitialData(html) {
  const match = html.match(/var ytInitialData\s*=\s*({.+?});<\/script>/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      // try looking for ytInitialData without strict regex
    }
  }
  const altMatch = html.match(/window\["ytInitialData"\]\s*=\s*({.+?});<\/script>/);
  if (altMatch) {
    try {
      return JSON.parse(altMatch[1]);
    } catch (e) {}
  }
  return null;
}

// Fallback regex extraction from HTML if JSON parse fails
function extractFromMeta(html) {
  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
  const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
  const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
  return {
    title: titleMatch ? titleMatch[1] : null,
    image: imageMatch ? imageMatch[1] : null,
    desc: descMatch ? descMatch[1] : null
  };
}

async function scrapeAll() {
  const results = [];
  for (const c of channels) {
    console.log(`Scraping ${c.handle}...`);
    try {
      const html = await fetchUrl(`https://www.youtube.com/${c.handle}`);
      const meta = extractFromMeta(html);
      const ytData = extractYtInitialData(html);

      let channelName = meta.title || c.handle;
      let avatar = meta.image;
      let banner = null;
      let subscribers = '10M+';
      let videos = [];
      let description = meta.desc || '';

      if (ytData) {
        // Find avatar & banner & subscribers in ytData
        try {
          const header = ytData.header;
          const pageHeader = header?.pageHeaderRenderer?.content?.pageHeaderViewModel;
          if (pageHeader) {
            const avatarSources = pageHeader.image?.decoratedAvatarViewModel?.avatar?.avatarViewModel?.image?.sources;
            if (avatarSources && avatarSources.length > 0) {
              avatar = avatarSources[avatarSources.length - 1].url;
            }
            const bannerSources = pageHeader.banner?.imageBannerViewModel?.image?.sources;
            if (bannerSources && bannerSources.length > 0) {
              banner = bannerSources[bannerSources.length - 1].url;
            }
            channelName = pageHeader.title?.dynamicTextViewModel?.text?.content || channelName;

            // metadata rows
            const rows = pageHeader.metadata?.contentMetadataViewModel?.metadataRows;
            if (rows) {
              for (const row of rows) {
                if (row.metadataParts) {
                  for (const part of row.metadataParts) {
                    const text = part.text?.content;
                    if (text && text.includes('subscriber')) {
                      subscribers = text.replace('subscribers', '').trim();
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error(`Error parsing header for ${c.handle}:`, err.message);
        }

        // Search for videoRenderers
        try {
          const jsonStr = JSON.stringify(ytData);
          const videoMatches = [...jsonStr.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)];
          const seen = new Set();
          const videoIds = [];
          for (const m of videoMatches) {
            const id = m[1];
            if (!seen.has(id)) {
              seen.add(id);
              videoIds.push(id);
              if (videoIds.length >= 3) break;
            }
          }
          videos = videoIds;
        } catch (err) {
          console.error(`Error finding videos for ${c.handle}:`, err.message);
        }
      }

      // If subscribers still not parsed, look in HTML
      if (subscribers === '10M+' || !subscribers) {
        const subMatch = html.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"/);
        if (subMatch) {
          subscribers = subMatch[1].replace('subscribers', '').trim();
        } else {
          const subMatch2 = html.match(/(\d+(\.\d+)?[MBK]?)\s+subscribers/i);
          if (subMatch2) {
            subscribers = subMatch2[1];
          }
        }
      }

      results.push({
        handle: c.handle,
        category: c.category,
        channelName,
        avatar,
        banner,
        subscribers,
        description,
        videos
      });
      console.log(`Success: ${channelName} | Subs: ${subscribers} | Videos: ${videos.length}`);
    } catch (e) {
      console.error(`Failed ${c.handle}:`, e.message);
    }
  }

  fs.writeFileSync('scraped_creators.json', JSON.stringify(results, null, 2));
  console.log('Saved scraped_creators.json');
}

scrapeAll();
