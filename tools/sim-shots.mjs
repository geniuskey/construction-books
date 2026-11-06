// Copyright (c) 2026 geniuskey and ConstructionBooks contributors. MIT.
// Capture the shelf-home experiment images: every `.experiment` card in index.html links to `<book>/chapters/<page>.html#<sim-id>`;
// this opens that page at 720 px, screenshots the simulator's view and saves it as the card's <img src> (JPEG).
// Usage: node tools/sim-shots.mjs   (Playwright). Rerun after changing a featured simulator.
import { chromium } from 'playwright';
import { createServer } from 'http';
import { createReadStream, existsSync, readFileSync } from 'fs';
import { dirname, extname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const home = readFileSync(join(root, 'index.html'), 'utf8');
const cards = [...home.matchAll(/<a class="experiment"[^>]*href="([^"#]+)#([^"]+)"[^>]*>.*?<img src="([^"]+)"/g)].map((m) => ({ page: m[1], sim: m[2], img: m[3] }));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = join(root, p);
  if (!file.startsWith(root) || !existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1180, height: 900 }, colorScheme: 'light', deviceScaleFactor: 1 });
for (const c of cards) {
  await page.goto(base + c.page, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const view = page.locator(`#${c.sim} .sim-view`).first();
  await view.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const box = await view.boundingBox();
  // Crop a 4:3 window (720 × 540 after scaling) from the top of the simulator view.
  const w = box.width, h = Math.min(box.height, w * 0.75);
  await page.screenshot({ path: join(root, c.img), type: 'jpeg', quality: 82, clip: { x: box.x, y: box.y, width: w, height: h } });
  console.log(`${c.img} ← ${c.page}#${c.sim} (${Math.round(w)}×${Math.round(h)})`);
}
await browser.close();
server.close();
