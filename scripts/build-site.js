#!/usr/bin/env node
/**
 * Kopi Kia — static site builder.
 *
 * Assembles the deployable `www/` directory:
 *   www/index.html      promo landing page
 *   www/roadmap.html    development status, from content/roadmap.json
 *   www/blog/           blog index + one page per post in content/posts/
 *   www/play/           the game itself (also the Capacitor iOS bundle root)
 *   www/privacy.html    unchanged App Store privacy policy URL
 *
 * No dependencies — run with `node scripts/build-site.js`.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const md = require('./md.js');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'www');
const PLAY = path.join(OUT, 'play');

const SITE = readJson(path.join(ROOT, 'content', 'site.json'));
const ROADMAP = readJson(path.join(ROOT, 'content', 'roadmap.json'));
const SITE_HOST = SITE.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

/* ==========================================================================
   Small helpers
   ========================================================================== */

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function copyInto(src, destDir) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(destDir, { recursive: true });
  fs.cpSync(src, path.join(destDir, path.basename(src)), { recursive: true });
  return true;
}

function write(relPath, contents) {
  const full = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents);
}

const esc = md.escapeHtml;

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function isoDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/** Pulls the game's own recipe and level data so the site can never drift from it. */
function loadGameData() {
  const source = fs.readFileSync(path.join(ROOT, 'js', 'recipes.js'), 'utf8');
  const sandbox = { window: undefined, Math };
  return vm.runInNewContext(
    source + ';({ DRINK_RECIPES, CAMPAIGN_LEVELS, CUSTOMERS })',
    sandbox,
    { filename: 'recipes.js' }
  );
}

/* ==========================================================================
   Page shell
   ========================================================================== */

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/roadmap.html', label: 'Roadmap' },
  { href: '/blog/', label: 'Devlog' },
  { href: SITE.playPath, label: 'Play' }
];

function layout(opts) {
  const {
    title, description, canonical, bodyClass = '', current = '',
    image = SITE.coverImage, type = 'website', head = '', content
  } = opts;

  const absImage = /^https?:/.test(image) ? image : SITE.url + image;
  const absUrl = SITE.url + canonical;

  const nav = NAV.map(item => {
    const active = item.href === current ? ' aria-current="page"' : '';
    return `<a href="${item.href}"${active}>${esc(item.label)}</a>`;
  }).join('');

  const footerLinks = NAV.concat([{ href: '/privacy.html', label: 'Privacy' }, { href: '/feed.xml', label: 'RSS' }])
    .concat(SITE.links || [])
    .map(l => {
      const external = /^https?:/.test(l.url || l.href) && !(l.url || l.href).includes(SITE_HOST);
      const href = l.url || l.href;
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${href}"${attrs}>${esc(l.label)}</a>`;
    }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${absUrl}">

<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${esc(SITE.title)}">
<meta property="og:url" content="${absUrl}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${absImage}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${absImage}">

<link rel="icon" type="image/png" href="/play/favicon.png">
<link rel="apple-touch-icon" href="/play/apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="${esc(SITE.title)} Devlog" href="/feed.xml">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Playfair+Display:ital,wght@1,800;1,900&family=Noto+Serif+TC:wght@700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/site.css?v=1">
${head}
</head>
<body class="${bodyClass}">

<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/">
      <img class="brand-mark" src="/play/favicon.png" alt="" width="34" height="34">
      <span class="brand-name">${esc(SITE.title)}</span>
    </a>
    <nav class="site-nav" aria-label="Main">${nav}</nav>
  </div>
</header>

<main>
${content}
</main>

<footer class="site-footer">
  <div class="wrap footer-inner">
    <div>
      <div class="footer-links">${footerLinks}</div>
      <p class="footer-note">${esc(SITE.studio)} © Copyright ${esc(SITE.copyrightYear)}. Made in Singapore.</p>
    </div>
  </div>
</footer>

</body>
</html>
`;
}

function ctaStrip() {
  return `
<section class="cta-strip">
  <div class="wrap">
    <h2>Shift starts in 3… 2… 1…</h2>
    <p>No download, no account, no install. Open it in your browser and start brewing.</p>
    <a class="btn btn-primary btn-lg" href="${SITE.playPath}">☕ Play Kopi Kia Free</a>
  </div>
</section>`;
}

/* ==========================================================================
   Landing page
   ========================================================================== */

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen',
  'nineteen', 'twenty'];

/** Spells small numbers out, so prose counts always track the game's real data. */
function spell(n) {
  return NUMBER_WORDS[n] || String(n);
}

function features(drinkCount, levelCount) {
  return [
    { icon: '☕', title: 'Order like a local', text: `Kopi-C Siew Dai, Teh-O Kosong Peng, Yuan Yang. ${spell(drinkCount).replace(/^./, c => c.toUpperCase())} drinks in the real kopitiam shorthand, with the modifiers that actually change what lands in the cup.` },
    { icon: '🧊', title: 'A mug rendered in 3D', text: 'A live WebGL mug sits at the centre of the screen. Liquid layers stack and slosh, ice cubes bob, steam rises off a hot pour — you can see the drink you are building.' },
    { icon: '🗺️', title: `${spell(levelCount).replace(/^./, c => c.toUpperCase())} real hawker centres`, text: 'A campaign from a quiet Tiong Bahru corner stall to the Changi Village late shift, each with a tougher earnings target and a shorter clock.' },
    { icon: '👵', title: 'Regulars with opinions', text: 'Mdm Tan, Uncle Lim, Aunty Lee, Ah Seng and Kenneth each order from their own favourites — and three of them will tell you about it out loud.' },
    { icon: '⚡', title: 'Career upgrades', text: 'Bank your earnings between shifts and spend them on a faster strainer, gourmet beans, a turbo ice crusher, or the pure prestige of a golden mug.' },
    { icon: '📱', title: 'Runs on your phone', text: 'Installable as a home-screen app, full screen, with the notch and home indicator handled. An iOS build is on the way.' }
  ];
}

function buildIndex(game) {
  const { DRINK_RECIPES, CAMPAIGN_LEVELS } = game;

  const groups = [
    { title: 'Kopi', filter: r => r.type === 'brew' && r.kopi > 0 && r.teh === 0 },
    { title: 'Teh & Yuan Yang', filter: r => r.type === 'brew' && r.teh > 0 },
    { title: 'Cans & Dispenser', filter: r => r.type !== 'brew' }
  ];

  const menuColumns = groups.map(g => {
    const items = DRINK_RECIPES.filter(g.filter).map(r => `
        <li><span>${esc(r.name)}</span><span class="menu-dots"></span><span class="menu-price">$${r.price.toFixed(2)}</span></li>`).join('');
    return `
      <div class="menu-col">
        <h3>${esc(g.title)}</h3>
        <ul>${items}
        </ul>
      </div>`;
  }).join('');

  const levels = CAMPAIGN_LEVELS.map(l => `
      <li>
        <span class="level-num">${l.level}</span>
        <span class="level-name">${esc(l.name)}</span>
        <span class="level-goal">$${l.targetScore.toFixed(2)} / ${l.shiftSeconds}s</span>
      </li>`).join('');

  const featureCards = features(DRINK_RECIPES.length, CAMPAIGN_LEVELS.length).map(f => `
      <article class="feature-card">
        <div class="feature-icon" aria-hidden="true">${f.icon}</div>
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.text)}</p>
      </article>`).join('');

  const posts = loadPosts().slice(0, 2);
  const postCards = posts.length ? posts.map(postCard).join('') : '';

  const devlogSection = posts.length ? `
<section class="section">
  <div class="wrap">
    <div class="section-head">
      <p class="section-kicker">Devlog</p>
      <h2>Notes from building it</h2>
      <p>Kopi Kia was built almost entirely by talking to a large language model. These are the honest write-ups — what worked, what wasted time, and what shipped anyway.</p>
    </div>
    <ul class="post-list">${postCards}</ul>
    <p style="margin-top:1.75rem"><a class="btn btn-ghost" href="/blog/">Read the devlog →</a></p>
  </div>
</section>` : '';

  const liveCount = (ROADMAP.sections.find(s => s.id === 'live') || { items: [] }).items.length;
  const buildingCount = (ROADMAP.sections.find(s => s.id === 'building') || { items: [] }).items.length;

  const content = `
<section class="hero">
  <div class="hero-bg" style="background-image:url('${SITE.coverImage}')"></div>
  <div class="wrap hero-inner">
    <div>
      <span class="hero-eyebrow">Free · Browser · No install</span>
      <h1>${esc(SITE.title)}</h1>
      <p class="hero-chinese">${esc(SITE.chineseTitle)}</p>
      <p class="hero-lede">${esc(SITE.description)}</p>
      <div class="hero-actions">
        <a class="btn btn-primary btn-lg" href="${SITE.playPath}">☕ Play Free Now</a>
        <a class="btn btn-ghost btn-lg" href="/roadmap.html">See what's shipping</a>
      </div>
      <p class="hero-meta">
        <span>🏆 ${CAMPAIGN_LEVELS.length} hawker centres</span>
        <span>🥤 ${DRINK_RECIPES.length} drinks</span>
        <span>🎮 45-second shifts</span>
      </p>
    </div>
    <img class="hero-art" src="${SITE.coverImage}" alt="Kopi Kia cover art: a vintage Nanyang kopitiam" width="1280" height="714">
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <p class="section-kicker">The game</p>
      <h2>You are the kopi kia. The queue is not patient.</h2>
      <p>A shift is forty-five seconds long. Orders come in the real kopitiam shorthand, the mug fills in front of you, and Uncle Lim is watching. Get it right, get paid, move to the next stall.</p>
    </div>
    <div class="card-grid">${featureCards}</div>
  </div>
</section>

<section class="section section-tint">
  <div class="wrap">
    <div class="section-head">
      <p class="section-kicker">The menu</p>
      <h2>Every drink in the game</h2>
      <p>Pulled straight from the game's own recipe file, so this board is never out of date.</p>
    </div>
    <div class="menu-board">
      <div class="menu-columns">${menuColumns}</div>
      <p class="menu-note">O = no milk · C = evaporated milk · Kosong = no sugar · Siew Dai = less sweet · Peng = iced</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <p class="section-kicker">The campaign</p>
      <h2>Ten stalls, one reputation</h2>
      <p>Each level raises the earnings target and tightens the clock. Three stars means you beat it comfortably. Nobody beats Changi Village comfortably.</p>
    </div>
    <ul class="level-list">${levels}</ul>
  </div>
</section>

<section class="section section-tint">
  <div class="wrap">
    <div class="section-head">
      <p class="section-kicker">Built in the open</p>
      <h2>${liveCount} features live, ${buildingCount} in the works</h2>
      <p>The roadmap is public and kept honest, including the parts that are half-wired right now.</p>
    </div>
    <a class="btn btn-ghost" href="/roadmap.html">View the full roadmap →</a>
  </div>
</section>

${devlogSection}
${ctaStrip()}`;

  write('index.html', layout({
    title: `${SITE.title} | ${SITE.tagline} Game`,
    description: SITE.description,
    canonical: '/',
    current: '/',
    content
  }));
}

/* ==========================================================================
   Roadmap page
   ========================================================================== */

const STATUS_LABEL = { live: 'Live', building: 'In development', planned: 'Planned' };

function buildRoadmap() {
  const legend = ['live', 'building', 'planned'].map(s => `
      <li><span class="status-pill status-${s}"><span class="status-dot"></span>${STATUS_LABEL[s]}</span></li>`).join('');

  const sections = ROADMAP.sections.map(section => {
    const items = section.items.map(item => `
        <li>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.detail)}</p>
        </li>`).join('');

    return `
    <section class="roadmap-section" id="${esc(section.id)}">
      <div class="roadmap-section-head">
        <h2>${esc(section.title)}</h2>
        <span class="status-pill status-${esc(section.status)}"><span class="status-dot"></span>${section.items.length} ${section.items.length === 1 ? 'item' : 'items'}</span>
      </div>
      <p class="roadmap-blurb">${esc(section.blurb)}</p>
      <ul class="roadmap-items items-${esc(section.status)}">${items}
      </ul>
    </section>`;
  }).join('');

  const content = `
<section class="section">
  <div class="wrap">
    <div class="section-head">
      <p class="section-kicker">Development status</p>
      <h2>What works, what doesn't, and what's next</h2>
      <p>Kopi Kia is a one-person side project, so this page says plainly what is finished and what is still held together with tape. Last updated <strong>${formatDate(ROADMAP.updated)}</strong>.</p>
    </div>
    <ul class="roadmap-legend">${legend}</ul>
    ${sections}
    <p class="roadmap-updated">Something missing, or broken on your device? The source is on <a href="https://github.com/tictacstau/kopitiam-kopi-kia" target="_blank" rel="noopener noreferrer">GitHub</a> — issues welcome.</p>
  </div>
</section>
${ctaStrip()}`;

  write('roadmap.html', layout({
    title: `Roadmap | ${SITE.title}`,
    description: `What is working in Kopi Kia today, what is in development, and what is on the backlog. Updated ${formatDate(ROADMAP.updated)}.`,
    canonical: '/roadmap.html',
    current: '/roadmap.html',
    content
  }));
}

/* ==========================================================================
   Blog
   ========================================================================== */

let postCache = null;

function loadPosts() {
  if (postCache) return postCache;

  const dir = path.join(ROOT, 'content', 'posts');
  if (!fs.existsSync(dir)) return (postCache = []);

  postCache = fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .map(file => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const { data, body } = md.parseFrontmatter(raw);
      const slug = file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
      const plain = md.toPlainText(body);
      const words = plain ? plain.split(' ').length : 0;

      return {
        slug,
        file,
        url: `/blog/${slug}/`,
        title: data.title || slug,
        date: data.date || '1970-01-01',
        author: data.author || SITE.studio,
        summary: data.summary || plain.slice(0, 180) + '…',
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
        cover: data.cover || SITE.coverImage,
        draft: data.draft === true,
        body
      };
    })
    .filter(p => !p.draft)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return postCache;
}

function postCard(post) {
  const tags = post.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('');
  return `
      <li class="post-card">
        <div class="post-meta">
          <time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time>
          <span>${esc(post.author)}</span>
        </div>
        <h2><a href="${post.url}">${esc(post.title)}</a></h2>
        <p>${esc(post.summary)}</p>
        ${tags ? `<div class="tag-row">${tags}</div>` : ''}
      </li>`;
}

function buildBlog(game) {
  const posts = loadPosts();
  const drinkCount = game.DRINK_RECIPES.length;
  const levelCount = game.CAMPAIGN_LEVELS.length;

  const list = posts.length
    ? `<ul class="post-list">${posts.map(postCard).join('')}</ul>`
    : `<p>No posts yet. Drop a markdown file into <code>content/posts/</code> to publish one.</p>`;

  const indexContent = `
<section class="section">
  <div class="wrap narrow">
    <div class="section-head">
      <p class="section-kicker">Devlog</p>
      <h2>Building a kopitiam game with an LLM</h2>
      <p>Notes from making Kopi Kia — the parts that went fast, the parts that quietly went wrong, and what I would do differently.</p>
    </div>
    ${list}
  </div>
</section>
${ctaStrip()}`;

  write('blog/index.html', layout({
    title: `Devlog | ${SITE.title}`,
    description: 'Notes from building Kopi Kia, a Singapore kopitiam simulation game, almost entirely with a large language model.',
    canonical: '/blog/',
    current: '/blog/',
    content: indexContent
  }));

  posts.forEach(post => {
    const rendered = md.render(post.body, { imageBase: '/blog/images', siteHost: SITE_HOST });
    const tags = post.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('');
    const readMins = Math.max(1, Math.round(md.toPlainText(post.body).split(' ').length / 220));

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.summary,
      datePublished: isoDate(post.date),
      author: { '@type': 'Person', name: post.author },
      image: /^https?:/.test(post.cover) ? post.cover : SITE.url + post.cover,
      mainEntityOfPage: SITE.url + post.url
    };

    const content = `
<article>
  <header class="post-header">
    <div class="wrap narrow">
      <a class="back-link" href="/blog/">← All posts</a>
      <h1>${esc(post.title)}</h1>
      <p class="post-summary">${esc(post.summary)}</p>
      <div class="post-meta">
        <time datetime="${isoDate(post.date)}">${formatDate(post.date)}</time>
        <span>${esc(post.author)}</span>
        <span>${readMins} min read</span>
      </div>
      ${tags ? `<div class="tag-row">${tags}</div>` : ''}
    </div>
  </header>

  <div class="wrap narrow prose">
    ${rendered.html}

    <div class="post-footer">
      <h3>Want to try the thing this is about?</h3>
      <p>Kopi Kia runs free in your browser. ${spell(levelCount).replace(/^./, c => c.toUpperCase())} hawker centres, ${spell(drinkCount)} drinks, one very impatient queue.</p>
      <a class="btn btn-primary" href="${SITE.playPath}">☕ Play Kopi Kia</a>
    </div>
  </div>
</article>
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;

    write(`blog/${post.slug}/index.html`, layout({
      title: `${post.title} | ${SITE.title} Devlog`,
      description: post.summary,
      canonical: post.url,
      current: '/blog/',
      type: 'article',
      image: post.cover,
      content
    }));
  });

  copyInto(path.join(ROOT, 'content', 'images'), path.join(OUT, 'blog'));
}

/* ==========================================================================
   Feeds
   ========================================================================== */

function buildFeeds() {
  const posts = loadPosts();

  const items = posts.map(p => `  <item>
    <title>${esc(p.title)}</title>
    <link>${SITE.url}${p.url}</link>
    <guid isPermaLink="true">${SITE.url}${p.url}</guid>
    <pubDate>${new Date(isoDate(p.date)).toUTCString()}</pubDate>
    <description>${esc(p.summary)}</description>
  </item>`).join('\n');

  write('feed.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${esc(SITE.title)} Devlog</title>
  <link>${SITE.url}/blog/</link>
  <description>Notes from building ${esc(SITE.title)}.</description>
  <language>en</language>
${items}
</channel>
</rss>
`);

  const urls = ['/', '/roadmap.html', '/blog/', SITE.playPath, '/privacy.html']
    .concat(posts.map(p => p.url))
    .map(u => `  <url><loc>${SITE.url}${u}</loc></url>`)
    .join('\n');

  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);

  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
}

/* ==========================================================================
   Game bundle
   ========================================================================== */

// The game loads its art from assets/sprites/. The only root-level image that
// ships is kopitiam_cover_art.jpg, because the game's og:image points at the
// absolute URL /play/kopitiam_cover_art.jpg; copying the others just duplicated
// ~1.3 MB into the bundle for nothing.
const GAME_FILES = [
  'index.html', 'style.css', 'js', 'assets', 'manifest.json',
  'favicon.png', 'apple-touch-icon.png', 'kopitiam_cover_art.jpg'
];

function buildGame() {
  fs.mkdirSync(PLAY, { recursive: true });
  let copied = 0;
  for (const f of GAME_FILES) {
    if (copyInto(path.join(ROOT, f), PLAY)) copied++;
  }

  // The privacy policy URL is registered with App Store Connect — it must stay at the root.
  copyInto(path.join(ROOT, 'privacy.html'), OUT);
  copyInto(path.join(ROOT, 'privacy'), OUT);

  return copied;
}

/* ==========================================================================
   Main
   ========================================================================== */

function main() {
  rmrf(OUT);
  fs.mkdirSync(OUT, { recursive: true });

  const gameFiles = buildGame();
  const game = loadGameData();

  buildBlog(game);  // populates the post cache used by the landing page
  buildIndex(game);
  buildRoadmap();
  buildFeeds();

  fs.cpSync(path.join(ROOT, 'site', 'static'), OUT, { recursive: true });

  const posts = loadPosts();
  console.log(`✓ built www/`);
  console.log(`  game bundle: ${gameFiles} entries → www/play/`);
  console.log(`  pages: index, roadmap, blog index, ${posts.length} post${posts.length === 1 ? '' : 's'}`);
  console.log(`  feeds: feed.xml, sitemap.xml, robots.txt`);
}

main();
