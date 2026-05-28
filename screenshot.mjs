import { chromium } from 'playwright';

const browser = await chromium.launch({
  args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
});
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.setDefaultTimeout(180000);

await page.goto('http://localhost:4173/', { waitUntil: 'load', timeout: 60000 });
await page.waitForSelector('canvas');
await page.waitForTimeout(3500);

await page.screenshot({ path: '/tmp/v3c-00-loading.png' });
console.log('00');

await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Enter');
  b?.click();
});
await page.waitForTimeout(2500);
await page.screenshot({ path: '/tmp/v3c-01-entrance.png' });
console.log('01');

for (const [id, label] of [
  ['bar', 'The Counter'],
  ['modbar', 'The Modbar'],
  ['speaker', 'The Speaker Wall'],
]) {
  await page.evaluate((t) => {
    const b = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes(t));
    b?.click();
  }, label);
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `/tmp/v3c-${id}.png` });
  console.log(id);
}

await browser.close();
