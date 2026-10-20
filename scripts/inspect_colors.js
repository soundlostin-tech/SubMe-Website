import fs from 'fs';

const js = fs.readFileSync('subme_reference.js', 'utf8');
const stringMatches = js.match(/"([^"\\]|\\.)*"/g) || [];
const colorClasses = new Set();
for (const s of stringMatches) {
  const unquoted = s.slice(1, -1);
  if (unquoted.includes('bg-') || unquoted.includes('text-') || unquoted.includes('border-')) {
    unquoted.split(/\s+/).forEach(t => {
      if (t.match(/^(bg|text|border|ring)-/)) colorClasses.add(t);
    });
  }
}
fs.writeFileSync('tokens.txt', Array.from(colorClasses).sort().join('\n'));
console.log('Saved tokens.txt');
