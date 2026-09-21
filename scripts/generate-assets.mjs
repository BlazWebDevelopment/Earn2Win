/**
 * Generates every brand asset in /public and the app icon files from the
 * single source logo at ./logo.png.
 *
 * Run with: npm run assets
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "logo.png");
const PUBLIC = path.join(ROOT, "public");
const APP = path.join(ROOT, "src", "app");

const BG = { r: 5, g: 5, b: 5, alpha: 1 };

/**
 * The source logo is white + green artwork on a solid black plate. Deriving the
 * alpha channel from per-pixel brightness gives us a transparent wordmark that
 * sits correctly on any dark surface, then we un-premultiply so the greens and
 * whites stay saturated instead of washing out.
 */
async function buildTransparentMark() {
  const { data, info } = await sharp(SOURCE)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = Math.max(r, g, b);

    if (alpha === 0) {
      out[i] = out[i + 1] = out[i + 2] = out[i + 3] = 0;
      continue;
    }

    const scale = 255 / alpha;
    out[i] = Math.min(255, Math.round(r * scale));
    out[i + 1] = Math.min(255, Math.round(g * scale));
    out[i + 2] = Math.min(255, Math.round(b * scale));
    // Lift the mid-tones a little so anti-aliased edges do not look thin.
    out[i + 3] = Math.min(255, Math.round(255 * Math.pow(alpha / 255, 0.85)));
  }

  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer()
    .then((buffer) => sharp(buffer).trim({ threshold: 6 }).png().toBuffer());
}

function icoFromPngs(pngs) {
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const entries = [];
  let offset = 6 + count * 16;

  for (const { size, buffer } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.buffer)]);
}

/** Square icon: the mark inset on a near-black plate with rounded corners. */
async function squareIcon(size, { rounded = true, padding = 0.14, background = BG } = {}) {
  const mark = await sharp(MARK)
    .resize({
      width: Math.round(size * (1 - padding * 2)),
      height: Math.round(size * (1 - padding * 2)),
      fit: "inside",
      withoutEnlargement: false,
    })
    .toBuffer();

  const radius = Math.round(size * 0.22);
  const plate = sharp({
    create: { width: size, height: size, channels: 4, background },
  }).composite([{ input: mark, gravity: "center" }]);

  if (!rounded) return plate.png().toBuffer();

  const maskSvg = Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`,
  );

  return sharp(await plate.png().toBuffer())
    .composite([{ input: maskSvg, blend: "dest-in" }])
    .png()
    .toBuffer();
}

let MARK;

async function main() {
  await mkdir(PUBLIC, { recursive: true });

  MARK = await buildTransparentMark();
  const markMeta = await sharp(MARK).metadata();
  console.log(`transparent mark: ${markMeta.width}x${markMeta.height}`);

  // Horizontal wordmark used in the header, footer and marketing surfaces.
  await writeFile(
    path.join(PUBLIC, "e2w-logo.png"),
    await sharp(MARK).resize({ width: 1024, fit: "inside" }).png({ compressionLevel: 9 }).toBuffer(),
  );

  // Token avatar: square, plated, rounded — reads well at 32px and at 96px.
  await writeFile(path.join(PUBLIC, "e2w-token.png"), await squareIcon(512, { padding: 0.1 }));

  // Maskable / PWA style icons.
  await writeFile(path.join(PUBLIC, "icon-192.png"), await squareIcon(192));
  await writeFile(path.join(PUBLIC, "icon-512.png"), await squareIcon(512));
  await writeFile(
    path.join(APP, "apple-icon.png"),
    await squareIcon(180, { rounded: false, padding: 0.12 }),
  );

  // favicon.ico with the sizes Windows and browsers actually ask for.
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngs = [];
  for (const size of sizes) {
    pngs.push({ size, buffer: await squareIcon(size, { padding: size <= 32 ? 0.06 : 0.1 }) });
  }
  // Only app/favicon.ico — Next serves it at /favicon.ico via the metadata file
  // convention, so a second copy in /public would shadow it ambiguously.
  await writeFile(path.join(APP, "favicon.ico"), icoFromPngs(pngs));

  // Open Graph / Twitter card: 1200x630 dark plate, centred wordmark, accent rule.
  const W = 1200;
  const H = 630;
  const backdrop = Buffer.from(`<svg width="${W}" height="${H}">
    <defs>
      <radialGradient id="glow" cx="50%" cy="34%" r="62%">
        <stop offset="0%" stop-color="#5FCB88" stop-opacity="0.20"/>
        <stop offset="60%" stop-color="#5FCB88" stop-opacity="0.04"/>
        <stop offset="100%" stop-color="#5FCB88" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#5FCB88" stop-opacity="0"/>
        <stop offset="50%" stop-color="#5FCB88" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#5FCB88" stop-opacity="0"/>
      </linearGradient>
      <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M48 0H0V48" fill="none" stroke="rgba(255,255,255,0.035)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="${W}" height="${H}" fill="#050505"/>
    <rect width="${W}" height="${H}" fill="url(#grid)"/>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    <rect x="0" y="${H - 6}" width="${W}" height="6" fill="url(#rule)"/>
    <rect x="360" y="452" width="480" height="1" fill="rgba(255,255,255,0.10)"/>
    <g>
      <rect x="392" y="492" width="14" height="14" rx="4" fill="#5FCB88"/>
      <rect x="424" y="497" width="120" height="6" rx="3" fill="rgba(255,255,255,0.28)"/>
      <rect x="560" y="497" width="80" height="6" rx="3" fill="rgba(255,255,255,0.16)"/>
      <rect x="656" y="497" width="152" height="6" rx="3" fill="rgba(255,255,255,0.28)"/>
    </g>
  </svg>`);

  const ogMark = await sharp(MARK).resize({ width: 560, fit: "inside" }).toBuffer();
  await writeFile(
    path.join(PUBLIC, "og-image.png"),
    await sharp(backdrop)
      .composite([{ input: ogMark, top: 150, left: Math.round((W - 560) / 2) }])
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );

  console.log("assets written:");
  for (const file of [
    "public/e2w-logo.png",
    "public/e2w-token.png",
    "public/icon-192.png",
    "public/icon-512.png",
    "public/og-image.png",
    "src/app/favicon.ico",
    "src/app/apple-icon.png",
  ]) {
    console.log(`  ${file}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
