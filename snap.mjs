import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1800, height: 1100 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://localhost:4173/', { waitUntil: 'load', timeout: 30000 });
await p.waitForTimeout(1200);
await p.screenshot({ path: '/tmp/studio_shot.png' });
await b.close();
console.log('shot');
