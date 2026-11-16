#!/usr/bin/env bash
# Builds the whole film: soundtrack -> frames (with motion blur) -> final MP4.
set -euo pipefail
cd "$(dirname "$0")"
python3 audio.py
node render.mjs video 0 720 --workers 4 --name video
ffmpeg -y -loglevel error -i out/video.mp4 -i out/audio.wav \
  -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 256k -movflags +faststart -shortest halo-demo.mp4
echo "OK -> halo-demo.mp4"
