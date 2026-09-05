/**
 * Headless screenshot of the built game, for sessions with no display.
 *
 * Serves www/ and captures index.html at an iPhone-sized viewport, reporting
 * any console errors or uncaught exceptions the page threw on the way.
 *
 *   npm run build && node scripts/screenshot.js [outfile] [--url=...] [--wait=ms]
 */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'www');
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.svg': 'image/svg+xml',
};

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  // Port 0 lets the OS pick a free one, so a stray server never blocks a run.
  return new Promise((resolve) => server.listen(Number(process.env.SHOT_PORT) || 0, () => resolve(server)));
}

(async () => {
  if (!fs.existsSync(ROOT)) {
    console.error('www/ is missing - run `npm run build` first.');
    process.exit(1);
  }

  const out = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'screenshot.png';
  const server = await serve();
  const port = server.address().port;

  // The container's Chromium build number does not match what the pinned
  // playwright expects, so point at the preinstalled binary when it exists.
  const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
  const launch = fs.existsSync(executablePath) ? { executablePath } : {};

  const browser = await chromium.launch(launch);
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

  const problems = [];
  page.on('pageerror', (e) => problems.push(`uncaught: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));

  await page.goto(`http://localhost:${port}/${arg('url', 'index.html')}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(Number(arg('wait', 2500)));
  await page.screenshot({ path: out });

  console.log(`wrote ${out} (${await page.title()})`);
  console.log(problems.length ? `problems:\n  ${problems.join('\n  ')}` : 'no console errors');

  await browser.close();
  server.close();
})();
