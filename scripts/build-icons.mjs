/* ============================================================
   NumeroVastu 360 — PWA icon generator
   Emits the installable-app icon set with zero dependencies.

   The mark is the classic Lo Shu square: the diagonal brand
   gradient behind a 3×3 gold grid, with the centre cell (5,
   Mercury — the pivot of the square) drawn as a filled disc.
   Deliberately text-free so it stays legible at 48px and needs
   no font to be present at build time.

   Run: node scripts/build-icons.mjs
   Output: icons/*.png (committed, so the app installs offline)

   PNG is encoded by hand (IHDR/IDAT/IEND over zlib deflate)
   rather than pulling in an image library: the repo has no
   runtime dependencies by design and this keeps it that way.
   ============================================================ */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "icons");

/* ---------- PNG encoding ---------- */
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // colour type: RGBA
  ihdr[10] = 0;  // deflate
  ihdr[11] = 0;  // adaptive filtering
  ihdr[12] = 0;  // no interlace

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter type 0 (None)
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

/* ---------- drawing ---------- */
const GRADIENT = [
  [0x1e, 0x1b, 0x4b], // indigo  (#1e1b4b)
  [0x6d, 0x28, 0xd9], // violet  (#6d28d9)
  [0xb4, 0x53, 0x09]  // amber   (#b45309)
];
const GOLD = [0xff, 0xd7, 0x82];

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);

function gradientAt(u, v) {
  // Diagonal top-left → bottom-right, two-stop-ramped like the CSS brand mark.
  const t = clamp01((u + v) / 2);
  return t < 0.6 ? mix(GRADIENT[0], GRADIENT[1], t / 0.6) : mix(GRADIENT[1], GRADIENT[2], (t - 0.6) / 0.4);
}

/* Coverage of a pixel by a shape, sampled 3×3 for cheap antialiasing. */
function sample(px, py, size, inside) {
  let hits = 0;
  for (let sy = 0; sy < 3; sy++) {
    for (let sx = 0; sx < 3; sx++) {
      const x = (px + (sx + 0.5) / 3) / size;
      const y = (py + (sy + 0.5) / 3) / size;
      if (inside(x, y)) hits++;
    }
  }
  return hits / 9;
}

/**
 * @param size    pixel dimension
 * @param opts.maskable  full-bleed square background (no rounding) with all
 *                       artwork inside the 80% safe-zone circle
 * @param opts.rounded   rounded-square "any" icon
 */
function render(size, { maskable = false, rounded = false } = {}) {
  const buf = Buffer.alloc(size * size * 4);
  // Geometry in 0..1 space. Maskable icons pull the artwork in so the OS can
  // crop to a circle without clipping the grid.
  const inset = maskable ? 0.26 : 0.16;
  const inner = 1 - inset * 2;
  const cell = inner / 3;
  const lineHalf = (maskable ? 0.0075 : 0.010);
  const gridStart = inset;
  const gridEnd = inset + inner;
  const corner = 0.22; // rounded-rect radius
  const centreDot = cell * 0.20;

  const bgInside = maskable
    ? () => true
    : (x, y) => {
        // rounded rectangle
        const r = corner;
        const cx = Math.min(Math.max(x, r), 1 - r);
        const cy = Math.min(Math.max(y, r), 1 - r);
        const dx = x - cx, dy = y - cy;
        return dx * dx + dy * dy <= r * r + 1e-9;
      };

  const onGridLine = (x, y) => {
    const inBand = (a) => a >= gridStart - lineHalf && a <= gridEnd + lineHalf;
    const vertical = [1, 2].some((k) => Math.abs(x - (gridStart + cell * k)) <= lineHalf) && inBand(y);
    const horizontal = [1, 2].some((k) => Math.abs(y - (gridStart + cell * k)) <= lineHalf) && inBand(x);
    const border =
      (Math.abs(x - gridStart) <= lineHalf || Math.abs(x - gridEnd) <= lineHalf) && inBand(y) ||
      (Math.abs(y - gridStart) <= lineHalf || Math.abs(y - gridEnd) <= lineHalf) && inBand(x);
    return vertical || horizontal || border;
  };

  const centre = gridStart + inner / 2;
  const inCentreDot = (x, y) => {
    const dx = x - centre, dy = y - centre;
    return dx * dx + dy * dy <= centreDot * centreDot;
  };

  // The four corner cells carry a small dot so the mark reads as a populated
  // Lo Shu square (2,4,6,8) rather than an empty grid.
  const cornerDots = [
    [gridStart + cell * 0.5, gridStart + cell * 0.5],
    [gridStart + cell * 2.5, gridStart + cell * 0.5],
    [gridStart + cell * 0.5, gridStart + cell * 2.5],
    [gridStart + cell * 2.5, gridStart + cell * 2.5]
  ].map(([x, y]) => [x, y, cell * 0.11]);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const u = (px + 0.5) / size, v = (py + 0.5) / size;
      const bg = sample(px, py, size, bgInside);
      if (bg <= 0) continue;

      let [r, g, b] = gradientAt(u, v);

      const grid = sample(px, py, size, onGridLine);
      const dot = Math.max(
        sample(px, py, size, inCentreDot),
        ...cornerDots.map(([dx0, dy0, dr]) =>
          sample(px, py, size, (x, y) => {
            const ex = x - dx0, ey = y - dy0;
            return ex * ex + ey * ey <= dr * dr;
          })
        )
      );
      const ink = clamp01(grid * 0.92 + dot);
      r = r + (GOLD[0] - r) * ink;
      g = g + (GOLD[1] - g) * ink;
      b = b + (GOLD[2] - b) * ink;

      const o = (py * size + px) * 4;
      buf[o] = Math.round(r);
      buf[o + 1] = Math.round(g);
      buf[o + 2] = Math.round(b);
      buf[o + 3] = Math.round(bg * 255);
    }
  }
  return encodePng(size, size, buf);
}

const TARGETS = [
  { file: "icon-192.png", size: 192, opts: { rounded: true } },
  { file: "icon-512.png", size: 512, opts: { rounded: true } },
  { file: "maskable-512.png", size: 512, opts: { maskable: true } },
  { file: "apple-touch-icon.png", size: 180, opts: { rounded: true } },
  { file: "favicon-48.png", size: 48, opts: { rounded: true } }
];

mkdirSync(OUT_DIR, { recursive: true });
for (const { file, size, opts } of TARGETS) {
  const png = render(size, opts);
  writeFileSync(join(OUT_DIR, file), png);
  console.log(`${file.padEnd(24)} ${String(size).padStart(4)}×${size}  ${(png.length / 1024).toFixed(1)} kB`);
}
console.log(`\nWrote ${TARGETS.length} icons to icons/`);
