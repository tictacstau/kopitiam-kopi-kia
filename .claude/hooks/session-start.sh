#!/bin/bash
# Prepares a Claude Code on the web container for this repo.
# Containers start from a fresh clone with no node_modules, so install deps
# and produce www/ (the Vercel output dir, gitignored) before the session runs.
set -euo pipefail

# Local terminal sessions already have a working tree; nothing to do there.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# The repo pins playwright 1.62.x, but the container ships a different Chromium
# build number, so the bundled resolver misses. scripts/screenshot.js reads this.
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
echo 'export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1' >> "${CLAUDE_ENV_FILE:-/dev/null}"
echo 'export CHROMIUM_PATH=/opt/pw-browsers/chromium' >> "${CLAUDE_ENV_FILE:-/dev/null}"

npm install --no-audit --no-fund
npm run build

echo "Ready: $(ls www | wc -l) files in www/"
