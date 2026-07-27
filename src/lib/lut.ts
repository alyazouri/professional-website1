/**
 * LUT (Look-Up Table) color grading engine.
 *
 * Supports built-in LUTs (cinematic presets) and `.cube` LUT files.
 * Applied via ImageData pixel manipulation — works on the main
 * canvas and the export canvas without WebGL.
 */

export type LUT = {
  id: string;
  name: string;
  nameAr: string;
  size: number; // typically 17 / 33 / 64
  data: Float32Array; // size^3 * 3 floats (RGB triplets in [0..1])
};

// ───── Built-in cinematic LUTs (procedural, no file required) ─────
// Each preset is defined as a per-channel transform function from input [0..1].
type CurveFn = (r: number, g: number, b: number) => [number, number, number];

const PRESET_CURVES: { id: string; name: string; nameAr: string; fn: CurveFn }[] = [
  {
    id: "lut_neutral",
    name: "Neutral",
    nameAr: "محايد",
    fn: (r, g, b) => [r, g, b],
  },
  {
    id: "lut_teal_orange",
    name: "Teal & Orange",
    nameAr: "تيل وبرتقالي",
    fn: (r, g, b) => {
      // Push shadows toward teal, highlights toward orange
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const t = lum; // 0..1
      const orangeR = lerp(r, Math.min(1, r * 1.15 + 0.08), t);
      const orangeG = lerp(g, g * 1.05, t);
      const orangeB = lerp(b, b * 0.78, t);
      const tealR = lerp(orangeR, orangeR * 0.85, 1 - t);
      const tealG = lerp(orangeG, orangeG * 1.05, 1 - t);
      const tealB = lerp(orangeB, Math.min(1, orangeB * 1.2 + 0.05), 1 - t);
      return [clamp(tealR), clamp(tealG), clamp(tealB)];
    },
  },
  {
    id: "lut_blockbuster",
    name: "Blockbuster",
    nameAr: "فيلم ضخم",
    fn: (r, g, b) => {
      const contrast = 1.25;
      const cr = (r - 0.5) * contrast + 0.5;
      const cg = (g - 0.5) * contrast + 0.5;
      const cb = (b - 0.5) * contrast + 0.5;
      // Slight magenta highlight bias
      return [clamp(cr * 1.06), clamp(cg * 0.97), clamp(cb * 1.02)];
    },
  },
  {
    id: "lut_noir",
    name: "Film Noir",
    nameAr: "نوار",
    fn: (r, g, b) => {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const c = clamp((lum - 0.5) * 1.6 + 0.5);
      return [c, c, c * 0.97];
    },
  },
  {
    id: "lut_cyberpunk",
    name: "Cyberpunk Neon",
    nameAr: "سايبربانك",
    fn: (r, g, b) => {
      // Boost magenta + cyan crush
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const nr = clamp(r * 1.15 + (1 - lum) * 0.05);
      const ng = clamp(g * 0.9);
      const nb = clamp(b * 1.25 + 0.05);
      return [nr, ng, nb];
    },
  },
  {
    id: "lut_warm_sun",
    name: "Warm Sunset",
    nameAr: "غروب دافئ",
    fn: (r, g, b) => [clamp(r * 1.18 + 0.04), clamp(g * 1.05), clamp(b * 0.82)],
  },
  {
    id: "lut_cold_steel",
    name: "Cold Steel",
    nameAr: "فولاذي بارد",
    fn: (r, g, b) => [clamp(r * 0.88), clamp(g * 1.02), clamp(b * 1.18 + 0.04)],
  },
  {
    id: "lut_gaming_hdr",
    name: "Gaming HDR",
    nameAr: "ألعاب HDR",
    fn: (r, g, b) => {
      const contrast = 1.4;
      const sat = 1.35;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const cr = (r - 0.5) * contrast + 0.5;
      const cg = (g - 0.5) * contrast + 0.5;
      const cb = (b - 0.5) * contrast + 0.5;
      const sr = lum + (cr - lum) * sat;
      const sg = lum + (cg - lum) * sat;
      const sb = lum + (cb - lum) * sat;
      return [clamp(sr), clamp(sg), clamp(sb)];
    },
  },
  {
    id: "lut_kodachrome",
    name: "Kodachrome",
    nameAr: "كوداكروم",
    fn: (r, g, b) => [clamp(r * 1.12), clamp(g * 0.95), clamp(b * 0.88 + 0.03)],
  },
  {
    id: "lut_bleach_bypass",
    name: "Bleach Bypass",
    nameAr: "تبييض",
    fn: (r, g, b) => {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      // Desaturate then overlay luminance
      const sat = 0.5;
      const dr = lum + (r - lum) * sat;
      const dg = lum + (g - lum) * sat;
      const db = lum + (b - lum) * sat;
      return [clamp(dr * 1.2), clamp(dg * 1.2), clamp(db * 1.2)];
    },
  },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function clamp(x: number) {
  return Math.max(0, Math.min(1, x));
}

// ───── Build a 3D LUT from a curve function ─────
export function buildLUTFromCurve(id: string, name: string, nameAr: string, fn: CurveFn, size = 33): LUT {
  const data = new Float32Array(size * size * size * 3);
  let idx = 0;
  for (let b = 0; b < size; b++) {
    for (let g = 0; g < size; g++) {
      for (let r = 0; r < size; r++) {
        const [rr, gg, bb] = fn(r / (size - 1), g / (size - 1), b / (size - 1));
        data[idx++] = rr;
        data[idx++] = gg;
        data[idx++] = bb;
      }
    }
  }
  return { id, name, nameAr, size, data };
}

// ───── Preset LUTs (lazy-built) ─────
let _presets: LUT[] | null = null;
export function getPresetLUTs(): LUT[] {
  if (_presets) return _presets;
  _presets = PRESET_CURVES.map((p) => buildLUTFromCurve(p.id, p.name, p.nameAr, p.fn));
  return _presets;
}

// ───── Parse Adobe .cube LUT file ─────
export function parseCubeLUT(text: string, id: string, name: string): LUT | null {
  const lines = text.split(/\r?\n/);
  let size = 0;
  const data: number[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("TITLE") || line.startsWith("DOMAIN")) continue;
    if (line.startsWith("LUT_3D_SIZE")) {
      size = parseInt(line.split(/\s+/)[1], 10);
      continue;
    }
    if (line.startsWith("LUT_1D_SIZE")) {
      // 1D LUT not supported; skip
      return null;
    }
    // numeric triplet
    const parts = line.split(/\s+/).map((n) => parseFloat(n));
    if (parts.length === 3 && parts.every((n) => isFinite(n))) {
      data.push(...parts);
    }
  }
  if (!size || data.length !== size * size * size * 3) return null;
  return { id, name, nameAr: name, size, data: new Float32Array(data) };
}

// ───── Apply LUT to ImageData ─────
export function applyLUT(img: ImageData, lut: LUT, intensity = 1.0): void {
  if (!lut) return;
  const d = img.data;
  const sz = lut.size;
  const sz1 = sz - 1;
  const t = lut.data;
  const w = Math.max(0, Math.min(1, intensity));

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] / 255;
    const g = d[i + 1] / 255;
    const b = d[i + 2] / 255;

    // Trilinear interpolation
    const xf = r * sz1, yf = g * sz1, zf = b * sz1;
    const x0 = Math.floor(xf), y0 = Math.floor(yf), z0 = Math.floor(zf);
    const x1 = Math.min(sz1, x0 + 1), y1 = Math.min(sz1, y0 + 1), z1 = Math.min(sz1, z0 + 1);
    const fx = xf - x0, fy = yf - y0, fz = zf - z0;

    const idx = (x: number, y: number, z: number) => ((z * sz + y) * sz + x) * 3;

    const c000 = idx(x0, y0, z0), c100 = idx(x1, y0, z0);
    const c010 = idx(x0, y1, z0), c110 = idx(x1, y1, z0);
    const c001 = idx(x0, y0, z1), c101 = idx(x1, y0, z1);
    const c011 = idx(x0, y1, z1), c111 = idx(x1, y1, z1);

    let rr = 0, gg = 0, bb = 0;
    for (let k = 0; k < 3; k++) {
      const c00 = t[c000 + k] * (1 - fx) + t[c100 + k] * fx;
      const c10 = t[c010 + k] * (1 - fx) + t[c110 + k] * fx;
      const c01 = t[c001 + k] * (1 - fx) + t[c101 + k] * fx;
      const c11 = t[c011 + k] * (1 - fx) + t[c111 + k] * fx;
      const c0 = c00 * (1 - fy) + c10 * fy;
      const c1 = c01 * (1 - fy) + c11 * fy;
      const v = c0 * (1 - fz) + c1 * fz;
      if (k === 0) rr = v;
      else if (k === 1) gg = v;
      else bb = v;
    }

    // Blend by intensity
    const fr = (r * (1 - w) + rr * w) * 255;
    const fg = (g * (1 - w) + gg * w) * 255;
    const fb = (b * (1 - w) + bb * w) * 255;
    d[i] = Math.max(0, Math.min(255, fr));
    d[i + 1] = Math.max(0, Math.min(255, fg));
    d[i + 2] = Math.max(0, Math.min(255, fb));
  }
}
