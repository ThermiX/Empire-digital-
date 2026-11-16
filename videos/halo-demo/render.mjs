// Renders the HALO film frame by frame with headless Chromium.
//   node render.mjs sheet 0 120 6        -> out/sheet.png  (contact sheet, frames 0..120 step 6)
//   node render.mjs still 30 60 [--full] -> out/still_0030.png ...
//   node render.mjs video [from to]      -> out/video.mp4  (no audio; motion blur by sub-frame sampling)
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const sharp = require('sharp');
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, 'out');
fs.mkdirSync(OUT, { recursive: true });
const W = 1080, H = 1920, FPS = 30, TOTAL = 720;
const args = process.argv.slice(2);
const mode = args[0];
const flag = n => args.includes('--' + n);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const nums = args.slice(1).filter(a => !a.startsWith('--') && !isNaN(parseFloat(a))).map(Number);

const browser = await chromium.launch({
  args: ['--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none', '--hide-scrollbars'],
});
async function newPage() {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.error('PAGE ERROR:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE:', m.text()); });
  await page.goto('file://' + path.join(DIR, 'index.html'));
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  const cdp = await ctx.newCDPSession(page);
  return { page, cdp };
}
async function shot({ page, cdp }, f) {
  await page.evaluate(f => {
    window.seek(f);
    return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  }, f);
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
  return Buffer.from(data, 'base64');
}
const toRaw = png => sharp(png).removeAlpha().raw().toBuffer();

// ---- gamma-correct accumulation for motion blur --------------------
const TO_LIN = new Float32Array(256);
for (let i = 0; i < 256; i++) TO_LIN[i] = Math.pow(i / 255, 2.2);
const TO_SRGB = new Uint8Array(4097);
for (let i = 0; i <= 4096; i++) TO_SRGB[i] = Math.round(255 * Math.pow(i / 4096, 1 / 2.2));
function motionAmount(a, b) {
  let s = 0, n = 0;
  for (let i = 0; i < a.length; i += 3 * 37) { s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]); n += 2; }
  return s / n;
}
const SHUTTER = 0.5;
let sampleCount = 0;
async function frameRaw(pg, f, blur) {
  const a = await toRaw(await shot(pg, f)); sampleCount++;
  if (!blur) return a;
  const b = await toRaw(await shot(pg, f + SHUTTER)); sampleCount++;
  const m = motionAmount(a, b);
  if (m < 1.2) return a;                       // calm frame: keep it razor sharp
  const n = m < 4 ? 4 : m < 10 ? 8 : m < 22 ? 14 : 22;
  const acc = new Float32Array(a.length);
  const add = buf => { for (let i = 0; i < buf.length; i++) acc[i] += TO_LIN[buf[i]]; };
  add(a); add(b);
  for (let k = 1; k < n; k++) { add(await toRaw(await shot(pg, f + SHUTTER * k / n))); sampleCount++; }
  const out = Buffer.allocUnsafe(a.length), inv = 4096 / (n + 1);
  for (let i = 0; i < out.length; i++) out[i] = TO_SRGB[Math.min(4096, (acc[i] * inv) | 0)];
  return out;
}

if (mode === 'still') {
  const pg = await newPage();
  for (const f of nums) {
    const png = await shot(pg, f);
    const file = path.join(OUT, `still_${String(Math.round(f)).padStart(4, '0')}.png`);
    if (flag('full')) fs.writeFileSync(file, png);
    else await sharp(png).resize({ width: 540 }).png().toFile(file);
    console.log(file);
  }
} else if (mode === 'sheet') {
  const [from = 0, to = TOTAL - 1, step = 10] = nums;
  const cols = +opt('cols', 6), tw = +opt('tw', 300), th = Math.round(tw * H / W);
  const pg = await newPage();
  const tiles = [];
  for (let f = from; f <= to; f += step) {
    const png = await shot(pg, f);
    const label = Buffer.from(`<svg width="${tw}" height="${th}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="74" height="30" fill="#000"/><text x="6" y="22" font-family="DejaVu Sans Mono" font-size="20" fill="#0f0">${f}</text></svg>`);
    tiles.push(await sharp(png).resize(tw, th).composite([{ input: label, left: 0, top: 0 }]).png().toBuffer());
  }
  const rows = Math.ceil(tiles.length / cols);
  const sheet = sharp({ create: { width: cols * (tw + 6) + 6, height: rows * (th + 6) + 6, channels: 3, background: '#333' } })
    .composite(tiles.map((input, i) => ({ input, left: 6 + (i % cols) * (tw + 6), top: 6 + Math.floor(i / cols) * (th + 6) })));
  const file = path.join(OUT, opt('name', 'sheet') + '.png');
  await sheet.png().toFile(file);
  console.log(file, `${tiles.length} frames`);
} else if (mode === 'video') {
  const [from = 0, to = TOTAL] = nums;
  const workers = +opt('workers', 4), blur = !flag('noblur');
  const name = opt('name', 'video');
  const per = Math.ceil((to - from) / workers);
  const t0 = Date.now();
  let done = 0;
  const segs = await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const a = from + w * per, b = Math.min(to, a + per);
    if (a >= b) return null;
    const seg = path.join(OUT, `seg_${name}_${w}.mp4`);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
      '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-preset', 'fast', '-crf', '12',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-g', '30', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
    const pg = await newPage();
    for (let f = a; f < b; f++) {
      const raw = await frameRaw(pg, f, blur);
      if (!ff.stdin.write(raw)) await new Promise(r => ff.stdin.once('drain', r));
      done++;
      if (done % 60 === 0) console.log(`${done}/${to - from} frames, ${sampleCount} samples, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    return seg;
  }));
  const list = path.join(OUT, `concat_${name}.txt`);
  fs.writeFileSync(list, segs.filter(Boolean).map(s => `file '${s}'`).join('\n'));
  await new Promise(r => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', path.join(OUT, name + '.mp4')], { stdio: 'inherit' }).on('close', r));
  console.log(`done: out/${name}.mp4 — ${sampleCount} samples in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
