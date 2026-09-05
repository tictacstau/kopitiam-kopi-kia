# Kopi Kia

Singapore kopitiam drink-serving game. Vanilla JS, no framework, no bundler —
the browser loads the source files directly. Live at https://kopitiam.lol,
and shipped to the iOS App Store as a Capacitor wrapper around the same files.

## Layout

- `index.html` — the whole UI: menus, stalls, HUD, modals. Script tags at the
  bottom carry `?v=` cache-busting query strings.
- `style.css` — all styling, same `?v=` convention.
- `js/game.js` — `GameEngine`: campaign levels, shift timer, order matching,
  upgrade shop, localStorage save data.
- `js/recipes.js` — `DRINK_RECIPES` and customer/order generation. A drink is
  matched on its full attribute set (kopi/teh counts, milk, sugar, water, ice),
  so a new recipe must differ from every existing one in at least one field.
- `js/audio.js` — ambient loop and character voice lines.
- `js/three_mug.js` — Three.js mug render (Three is loaded from cdnjs, not npm).
- `js/ux_agent.js` — self-audit overlay for touch targets and contrast.
- `assets/sprites`, `assets/audio` — art and sound referenced by relative path.

## Build and deploy

`npm run build` copies the shipped files into `www/`, which is gitignored and
is what Vercel serves (`vercel.json` sets `outputDirectory`). Capacitor also
reads `www/` as its `webDir`.

The build script ends in `|| true`, so it exits 0 even when a copy fails. It
will not tell you a file is missing — after adding an asset, confirm it landed
in `www/` rather than trusting the exit code. Anything new must be added to the
`build` script's copy list or it ships to production missing.

**Vercel deploys `main` to production automatically.** Work on a branch and let
a merge do the deploying; never push straight to `main`.

## iOS

`npx cap sync ios` runs anywhere, but building, signing, archiving, and
uploading need Xcode on macOS. Any change under `ios/` (including
`Info.plist`) can be edited here but has to be built and shipped from a Mac.

## Checking a change

There is no test suite or linter. Verify rendering directly:

```
npm run build && node scripts/screenshot.js shot.png
```

That serves `www/`, loads the page in headless Chromium at an iPhone viewport,
writes the image, and reports console errors and uncaught exceptions. Pass
`--url=privacy.html` or `--wait=5000` to aim it elsewhere or let animations
settle. Game state lives in localStorage, so each run starts from a fresh save.

In a Claude Code on the web container the headless browser cannot reach the
public internet, so `three.min.js` from cdnjs and the Google Fonts stylesheet
both fail to load. `THREE` is undefined and text renders in fallback fonts.
That is the container, not a bug — do not chase it. The 3D mug and the real
typography can only be judged in a local browser or on the deployed site.
