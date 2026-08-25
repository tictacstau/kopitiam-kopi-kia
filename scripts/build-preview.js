#!/usr/bin/env node
/**
 * Builds a single self-contained HTML preview of the site for sharing.
 *
 * It reads the real generated pages out of www/ and stitches them into one
 * document with client-side navigation, so the preview cannot drift from the
 * actual site — there is no second copy of the markup or the stylesheet.
 *
 *   npm run build && npm run preview
 *
 * Writes preview.html — one file, no server needed, open it straight from disk.
 * Pass a path to override the output location.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'www');

const outFile = process.argv[2] || path.join(ROOT, 'preview.html');

const LIVE_GAME = 'https://kopitiam.lol/';

function read(rel) {
  return fs.readFileSync(path.join(OUT, rel), 'utf8');
}

/** Everything between <body ...> and </body> — header, main and footer together. */
function bodyOf(html) {
  const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!m) throw new Error('no body found');
  return m[1];
}

function findPostPage() {
  const blogDir = path.join(OUT, 'blog');
  const slug = fs.readdirSync(blogDir)
    .find(f => fs.statSync(path.join(blogDir, f)).isDirectory() && f !== 'images');
  return slug ? { slug, html: read(`blog/${slug}/index.html`) } : null;
}

const post = findPostPage();

const PAGES = [
  { id: 'home', label: 'Home', file: 'index.html' },
  { id: 'roadmap', label: 'Roadmap', file: 'roadmap.html' },
  { id: 'devlog', label: 'Devlog', file: 'blog/index.html' }
].concat(post ? [{ id: 'post', label: 'Blog post', file: `blog/${post.slug}/index.html` }] : []);

function dataUri(rel, mime) {
  return `data:${mime};base64,` + fs.readFileSync(path.join(OUT, rel)).toString('base64');
}

const coverUri = dataUri('play/assets/sprites/kopitiam_cover_art.jpg', 'image/jpeg');
const faviconUri = dataUri('play/favicon.png', 'image/png');

/** Points the built page's absolute URLs at in-preview anchors or the live site. */
function rewrite(html) {
  let s = html;

  // Assets become inline data URIs — the preview has no server.
  s = s.split('/play/assets/sprites/kopitiam_cover_art.jpg').join(coverUri);
  s = s.split('/play/favicon.png').join(faviconUri);

  // Internal navigation becomes hash routing.
  s = s.replace(/href="\/"/g, 'href="#home" data-nav="home"');
  s = s.replace(/href="\/roadmap\.html"/g, 'href="#roadmap" data-nav="roadmap"');
  s = s.replace(/href="\/blog\/"/g, 'href="#devlog" data-nav="devlog"');
  if (post) {
    s = s.replace(new RegExp(`href="/blog/${post.slug}/"`, 'g'), 'href="#post" data-nav="post"');
  }

  // The game is not bundled here — send people to the version that is live today.
  s = s.replace(/href="\/play\/"/g, `href="${LIVE_GAME}" target="_blank" rel="noopener noreferrer"`);
  s = s.replace(/href="\/privacy\.html"/g, `href="${LIVE_GAME}privacy" target="_blank" rel="noopener noreferrer"`);

  // Feed and sitemap have no meaning inside a single file.
  s = s.replace(/href="\/feed\.xml"/g, 'href="#devlog" data-nav="devlog"');

  return s;
}

const pageMarkup = PAGES.map((p, i) => `
<div class="pv-page" id="pv-${p.id}"${i === 0 ? '' : ' hidden'}>
${rewrite(bodyOf(read(p.file)))}
</div>`).join('\n');

const tabs = PAGES.map((p, i) =>
  `<button class="pv-tab${i === 0 ? ' is-active' : ''}" data-nav="${p.id}" type="button">${p.label}</button>`
).join('');

const siteCss = read('site.css');

const html = `<title>Kopi Kia Site Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Playfair+Display:ital,wght@1,800;1,900&family=Noto+Serif+TC:wght@700;900&display=swap" rel="stylesheet">

<style>
/* ---- The site's own stylesheet, verbatim from www/site.css ---- */
${siteCss}

/* ---- Preview chrome only. Deliberately unlike the site, so it reads as a
        frame around the page rather than part of it. ---- */
:root {
  --pv-shell: #17120c;
  --pv-shell-2: #241c13;
  --pv-line: rgba(245, 158, 11, 0.22);
  --pv-text: #e8dcc8;
  --pv-dim: #a3927a;
  --pv-accent: #f59e0b;
}

body { margin: 0; }

.pv-bar {
  position: sticky;
  top: 0;
  z-index: 200;
  background: var(--pv-shell);
  border-bottom: 1px solid var(--pv-line);
  color: var(--pv-text);
  font-family: var(--font-body);
  padding-top: env(safe-area-inset-top);
}

.pv-bar-inner {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0.55rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem 1rem;
  flex-wrap: wrap;
}

.pv-label {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--pv-dim);
  margin-right: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pv-label::before {
  content: '';
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--pv-accent);
  flex: none;
}

.pv-tabs { display: flex; gap: 0.25rem; flex-wrap: wrap; }

.pv-tab {
  appearance: none;
  border: 1px solid transparent;
  background: transparent;
  color: var(--pv-dim);
  font: inherit;
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.pv-tab:hover { background: var(--pv-shell-2); color: var(--pv-text); }
.pv-tab.is-active { background: var(--pv-accent); color: #17120c; }
.pv-tab:focus-visible { outline: 2px solid var(--pv-accent); outline-offset: 2px; }

.pv-note {
  background: var(--pv-shell-2);
  border-bottom: 1px solid var(--pv-line);
  color: var(--pv-dim);
  font-family: var(--font-body);
  font-size: 0.82rem;
  line-height: 1.5;
  text-align: center;
  padding: 0.6rem 1.25rem;
}

.pv-note a { color: var(--pv-accent); }

/* The site header is sticky; inside the preview it sits below the chrome. */
.pv-page .site-header { top: 0; }

@media (max-width: 560px) {
  .pv-bar-inner { padding: 0.5rem 1rem; }
  .pv-label { width: 100%; margin-right: 0; }
  .pv-tab { font-size: 0.8rem; padding: 0.3rem 0.65rem; }
}

@media (prefers-reduced-motion: reduce) {
  .pv-tab { transition: none; }
}
</style>

<div class="pv-bar">
  <div class="pv-bar-inner">
    <span class="pv-label">Static preview</span>
    <nav class="pv-tabs" aria-label="Preview pages">${tabs}</nav>
  </div>
</div>

<p class="pv-note">
  These are the real generated pages. The game is not bundled here — Play buttons open
  <a href="${LIVE_GAME}" target="_blank" rel="noopener noreferrer">the version live today</a>,
  which still sits at the site root until this branch ships.
</p>

${pageMarkup}

<script>
(function () {
  var pages = ${JSON.stringify(PAGES.map(p => p.id))};

  function show(id) {
    if (pages.indexOf(id) === -1) id = pages[0];
    pages.forEach(function (p) {
      var el = document.getElementById('pv-' + p);
      if (el) el.hidden = (p !== id);
    });
    document.querySelectorAll('.pv-tab').forEach(function (t) {
      t.classList.toggle('is-active', t.getAttribute('data-nav') === id);
    });
    window.scrollTo(0, 0);
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-nav]');
    if (!el) return;
    e.preventDefault();
    var id = el.getAttribute('data-nav');
    show(id);
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  });

  window.addEventListener('hashchange', function () {
    show((location.hash || '').replace('#', '') || pages[0]);
  });

  show((location.hash || '').replace('#', '') || pages[0]);
})();
</script>
`;

fs.writeFileSync(outFile, html);
console.log(`✓ ${outFile} — ${(html.length / 1024).toFixed(0)} KB, ${PAGES.length} pages`);
