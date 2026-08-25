# Kopi Kia

A Singapore hawker coffee simulation game, plus the promo site, roadmap and devlog that go with it.

Live at **[kopitiam.lol](https://kopitiam.lol)** — the game is at **[kopitiam.lol/play](https://kopitiam.lol/play/)**.

---

## What's in here

| Path | What it is |
| --- | --- |
| `index.html`, `style.css`, `js/`, `assets/` | The game itself. Plain HTML/CSS/JS, no framework. |
| `content/` | Everything the promo site reads: site config, roadmap data, blog posts, blog images. |
| `site/static/` | The promo site's stylesheet. Copied to the site root at build time. |
| `scripts/build-site.js` | The static site builder. Zero dependencies. |
| `scripts/build-preview.js` | Bundles the built site into a single shareable `preview.html`. |
| `scripts/md.js` | The markdown renderer the builder uses. |
| `ios/` | Capacitor iOS project. |
| `www/` | **Generated.** The deployable output. Never edit by hand; it is gitignored. |

## Build and preview

```
npm run build          # generates www/
npx serve www          # or any static server, then open http://localhost:3000
```

To share a look at the site without deploying it, `npm run preview` bundles every page
into a single self-contained `preview.html` — one file, no server, opens straight from
disk. The game is not included in that bundle; its Play buttons point at the live site.

`npm run build` produces:

```
www/
  index.html      promo landing page
  roadmap.html    development status
  blog/           blog index + one folder per post
  play/           the game (this is also the iOS app bundle root)
  privacy.html    App Store privacy policy — this URL must not move
  feed.xml, sitemap.xml, robots.txt
```

Vercel runs `npm run build` and serves `www/`, as configured in `vercel.json`.

---

## Writing a blog post

1. Copy `content/posts/_TEMPLATE.md` to `content/posts/YYYY-MM-DD-your-slug.md`.
2. Fill in the frontmatter block at the top — `title`, `date`, `summary` and `tags` are the ones that matter. The `summary` is what shows on the blog index and in the link preview when someone shares it.
3. Write the body in markdown. Headings, **bold**, *italic*, links, lists, blockquotes, code blocks and images all work.
4. `npm run build` and check it.

**Adding images:** drop the file into `content/images/`, then reference it by name. The alt text becomes the visible caption:

```markdown
![Uncle Lim yelling about a slow order](images/uncle-lim.jpg)
```

**Drafts:** add `draft: true` to the frontmatter and the post is left out of the blog index, the RSS feed and the sitemap. Remove the line to publish.

**URLs:** the filename becomes the URL with any leading date stripped, so `2026-09-01-my-post.md` publishes at `/blog/my-post/`. Renaming a file after publishing changes its URL and breaks existing links.

Files starting with `_` are ignored by the build.

## Updating the roadmap

Edit `content/roadmap.json`. Each item has a `title` and a `detail`, and each section has a `status` of `live`, `building` or `planned` (which controls the colour and the tick/half/circle marker). Bump the `updated` date at the top — it is shown on the page.

The item counts on the landing page (`15 features live, 5 in the works`) come from this file automatically, so there is nothing else to keep in sync.

## Site-wide settings

`content/site.json` holds the title, tagline, description, cover image and footer links. The description is used as the homepage meta description and social preview text.

---

## How the site stays accurate

The builder reads the game's own `js/recipes.js` at build time to generate the drinks menu, the level list and the counts in the prose ("sixteen drinks", "ten hawker centres"). Add a recipe or a level to the game and the site updates itself on the next build — there is no second copy of that data to forget about.

## Routing notes

- The promo site is at `/`; the game moved to `/play/`.
- `capacitor.config.json` sets `webDir` to `www/play`, so the iOS app bundles the game and not the marketing page. Verify with `npx cap copy ios` — it should report *"Copying web assets from play"*.
- The game's `manifest.json` uses `start_url` and `scope` of `/play/`, so home-screen installs open the game.
- `privacy.html` stays at the site root. That URL is registered with App Store Connect.
- `vercel.json` redirects `/game` to `/play/` as a convenience alias.

## iOS

```
npm run sync           # build + npx cap sync ios
npm run open:ios       # the above + open Xcode
```
