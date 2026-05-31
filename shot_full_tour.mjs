import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1800, height: 1100 } });
const p = await ctx.newPage();
await p.goto('http://localhost:4173/', { waitUntil: 'load' });
await p.waitForTimeout(1200);
const click = async (label) => p.evaluate((l) => {
  const btns = [...document.querySelectorAll('button')];
  (btns.find((b) => b.textContent?.trim() === l))?.click();
}, label);

const zones = [
  ['MAIN COFFEE BAR', 'main'],
  ['ENTRANCE', 'entrance'],
  ['AUDIOPHILE WALL', 'audiophile'],
  ['SEATING WALL', 'seating'],
];
for (const [label, slug] of zones) {
  await click(label);
  await p.waitForTimeout(1100);
  await p.screenshot({ path: `/tmp/final_${slug}.png` });
  console.log('shot', slug);
}
await b.close();
console.log('done');
