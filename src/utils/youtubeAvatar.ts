/**
 * YouTube Channel URL and Avatar Resolver Utility
 * Extracts official YouTube channel handles and resolves live channel avatar logos
 */

/**
 * Extracts a clean YouTube handle or identifier from various URL formats
 * Examples:
 * - https://www.youtube.com/@CarryMinati -> CarryMinati
 * - https://youtube.com/@triggeredinsaan -> triggeredinsaan
 * - https://www.youtube.com/c/TechnoGamerzOfficial -> TechnoGamerzOfficial
 * - @mrbeast -> mrbeast
 * - mrbeast -> mrbeast
 */
export const extractYouTubeHandle = (input: string): string => {
  if (!input) return '';
  const trimmed = input.trim();

  // 1. Matches @handle format anywhere in URL or text
  const atMatch = trimmed.match(/@([a-zA-Z0-9_.-]+)/);
  if (atMatch && atMatch[1]) {
    return atMatch[1];
  }

  // 2. Matches youtube.com/c/Name or youtube.com/user/Name
  const cMatch = trimmed.match(/youtube\.com\/(?:c\/|user\/|channel\/)?([a-zA-Z0-9_.-]+)/i);
  if (cMatch && cMatch[1]) {
    return cMatch[1];
  }

  // 3. Plain text handle without spaces or slashes
  if (!trimmed.includes('/') && !trimmed.includes('?') && !trimmed.includes('&')) {
    return trimmed.replace(/^@/, '');
  }

  return '';
};

/**
 * Returns a high-resolution live YouTube channel avatar logo URL
 * Falls back to a clean modern initial avatar if handle is invalid
 */
export const getYouTubeAvatarUrl = (channelUrlOrHandle: string, fallbackName: string = 'Creator'): string => {
  const handle = extractYouTubeHandle(channelUrlOrHandle);
  if (handle && handle.length >= 2) {
    // Official high-res YouTube channel avatar via Unavatar CDN
    return `https://unavatar.io/youtube/${encodeURIComponent(handle)}`;
  }

  // Clean initials avatar with SubMe theme colors (Deep Ocean #31465A & Matcha #C7DFA3)
  const encodedName = encodeURIComponent(fallbackName || 'Creator');
  return `https://ui-avatars.com/api/?name=${encodedName}&background=31465A&color=C7DFA3&bold=true&rounded=true&size=160`;
};
