#!/usr/bin/env bash
# Regenerates the seamless background-ambience loop from the full-length master.
#
#   ./scripts/make-ambient-loop.sh [START_SECONDS]
#
# Needs ffmpeg on PATH, or install one locally:  npm i --no-save ffmpeg-static
#
# The master (audio/kopitiam_ambient.mp3, ~34 min) is never shipped; only the
# 90-second loop written to assets/audio/ goes into the bundle and the iOS app.
#
# How the seam is made: take START..START+96s, then crossfade the final 6s into
# the 6s that PRECEDE the loop's own start. The end therefore fades into the
# material the start continues from, so the wrap is continuous rather than cut.
set -euo pipefail

cd "$(dirname "$0")/.."

MASTER="audio/kopitiam_ambient.mp3"
OUT="assets/audio/kopitiam_ambient.mp3"
START="${1:-30}"     # 00:30 measured as the steadiest stretch: least level
                     # variation and no standout one-off sound to repeat
LEN=90               # loop length in seconds
XF=6                 # crossfade length in seconds
BITRATE=80k

FFMPEG="$(command -v ffmpeg || echo node_modules/ffmpeg-static/ffmpeg)"
if [ ! -x "$FFMPEG" ]; then
  echo "ffmpeg not found. Install one with: npm i --no-save ffmpeg-static" >&2
  exit 1
fi

[ -f "$MASTER" ] || { echo "master not found: $MASTER" >&2; exit 1; }

"$FFMPEG" -hide_banner -loglevel error \
  -ss $((START + XF)) -t "$LEN" -i "$MASTER" \
  -ss "$START"        -t "$XF"  -i "$MASTER" \
  -filter_complex "[0:a][1:a]acrossfade=d=$XF:c1=tri:c2=tri[a]" \
  -map "[a]" -c:a libmp3lame -b:a "$BITRATE" -ar 44100 -ac 2 \
  "$OUT" -y

echo "wrote $OUT ($(du -h "$OUT" | cut -f1), ${LEN}s, from ${START}s)"
echo "note: js/audio.js loops this through the Web Audio graph and skips the"
echo "      MP3 encoder padding at runtime, which is what keeps the seam silent."
