/**
 * Multi-game sensitivity definitions — LEGENDARY V4.
 *
 * 8 games supported with dedicated tuning:
 *  - PUBG Mobile Global  (worldwide v3.x)   [NEW: separated from BGMI]
 *  - BGMI India                              [NEW: separated from Global]
 *  - PUBG New State Mobile                   [NEW]
 *  - Call of Duty Mobile
 *  - Free Fire MAX
 *  - Apex Legends Mobile                     [NEW]
 *  - Delta Force Mobile                      [NEW]
 *  - Warzone Mobile                          [NEW]
 *
 * Each game has its own scope/sight structure and slider range.
 * We normalize everything internally to 0..1 and then scale on output.
 */

export type GameId =
  | "pubgm_global"
  | "bgmi"
  | "newstate"
  | "codm"
  | "freefire"
  | "apex"
  | "delta"
  | "warzone";

export type GameScopeKey =
  // PUBG-family (Global / BGMI / New State)
  | "tpp" | "fpp" | "red" | "s2" | "s3" | "s4" | "s6" | "s8"
  // Free Fire
  | "ff_general" | "ff_red" | "ff_2x" | "ff_4x" | "ff_aug" | "ff_sniper" | "ff_freelook"
  // COD Mobile
  | "codm_standard" | "codm_ads" | "codm_tactical" | "codm_red" | "codm_2x" | "codm_3x" | "codm_4x" | "codm_sniper"
  // Apex Mobile
  | "apex_hip" | "apex_ads" | "apex_1x" | "apex_2x" | "apex_3x" | "apex_4x" | "apex_6x" | "apex_8x"
  // Delta Force Mobile
  | "delta_tpp" | "delta_fpp" | "delta_red" | "delta_2x" | "delta_3x" | "delta_4x" | "delta_6x" | "delta_8x"
  // Warzone Mobile
  | "wz_std" | "wz_ads" | "wz_red" | "wz_2x" | "wz_3x" | "wz_4x" | "wz_sniper" | "wz_tac";

export type GameDef = {
  id: GameId;
  name: string;
  nameAr: string;
  emoji: string;
  region: string;
  /** scope keys present in this game */
  scopes: GameScopeKey[];
  /** maximum slider value (used for display + clamping) */
  maxValue: number;
  /** sensitivity ranges (default min / max we recommend) */
  recommended: Record<string, { min: number; max: number; default: number }>;
};

export const GAMES: Record<GameId, GameDef> = {
  pubgm_global: {
    id: "pubgm_global",
    name: "PUBG Mobile Global",
    nameAr: "ببجي موبايل عالمية",
    emoji: "🌍",
    region: "GLOBAL · v3.x",
    scopes: ["tpp", "fpp", "red", "s2", "s3", "s4", "s6", "s8"],
    maxValue: 400,
    recommended: {
      camera: { min: 50, max: 400, default: 120 },
      ads: { min: 30, max: 200, default: 80 },
      gyro: { min: 100, max: 500, default: 300 },
    },
  },
  bgmi: {
    id: "bgmi",
    name: "BGMI India",
    nameAr: "ببجي الهند BGMI",
    emoji: "🇮🇳",
    region: "INDIA",
    scopes: ["tpp", "fpp", "red", "s2", "s3", "s4", "s6", "s8"],
    maxValue: 400,
    recommended: {
      camera: { min: 50, max: 400, default: 115 },
      ads: { min: 30, max: 200, default: 78 },
      gyro: { min: 100, max: 500, default: 290 },
    },
  },
  newstate: {
    id: "newstate",
    name: "PUBG New State",
    nameAr: "ببجي نيو ستيت",
    emoji: "🚀",
    region: "FUTURE 2051",
    scopes: ["tpp", "fpp", "red", "s2", "s3", "s4", "s6", "s8"],
    maxValue: 200,
    recommended: {
      camera: { min: 30, max: 200, default: 90 },
      ads: { min: 20, max: 130, default: 70 },
      gyro: { min: 60, max: 260, default: 170 },
    },
  },
  codm: {
    id: "codm",
    name: "Call of Duty Mobile",
    nameAr: "كول أوف ديوتي موبايل",
    emoji: "🪖",
    region: "WORLDWIDE",
    scopes: [
      "codm_standard",
      "codm_ads",
      "codm_tactical",
      "codm_red",
      "codm_2x",
      "codm_3x",
      "codm_4x",
      "codm_sniper",
    ],
    maxValue: 200,
    recommended: {
      standard: { min: 80, max: 180, default: 120 },
      ads: { min: 60, max: 130, default: 100 },
      tactical: { min: 100, max: 200, default: 150 },
      red: { min: 80, max: 150, default: 110 },
      "2x": { min: 70, max: 130, default: 100 },
      "3x": { min: 60, max: 120, default: 90 },
      "4x": { min: 50, max: 110, default: 80 },
      sniper: { min: 40, max: 100, default: 65 },
    },
  },
  freefire: {
    id: "freefire",
    name: "Free Fire MAX",
    nameAr: "فري فاير ماكس",
    emoji: "🔥",
    region: "WORLDWIDE",
    scopes: ["ff_general", "ff_red", "ff_2x", "ff_4x", "ff_aug", "ff_sniper", "ff_freelook"],
    maxValue: 100,
    recommended: {
      general: { min: 60, max: 100, default: 85 },
      red: { min: 60, max: 100, default: 90 },
      "2x": { min: 50, max: 100, default: 80 },
      "4x": { min: 40, max: 90, default: 75 },
      sniper: { min: 40, max: 90, default: 65 },
      freelook: { min: 70, max: 100, default: 90 },
    },
  },
  apex: {
    id: "apex",
    name: "Apex Legends Mobile",
    nameAr: "أبكس ليجندز موبايل",
    emoji: "🦾",
    region: "WORLDWIDE",
    scopes: ["apex_hip", "apex_ads", "apex_1x", "apex_2x", "apex_3x", "apex_4x", "apex_6x", "apex_8x"],
    maxValue: 500,
    recommended: {
      hipfire: { min: 100, max: 500, default: 300 },
      ads: { min: 80, max: 400, default: 240 },
    },
  },
  delta: {
    id: "delta",
    name: "Delta Force Mobile",
    nameAr: "دلتا فورس موبايل",
    emoji: "⚡",
    region: "WORLDWIDE",
    scopes: ["delta_tpp", "delta_fpp", "delta_red", "delta_2x", "delta_3x", "delta_4x", "delta_6x", "delta_8x"],
    maxValue: 400,
    recommended: {
      camera: { min: 50, max: 400, default: 115 },
      ads: { min: 30, max: 200, default: 78 },
      gyro: { min: 100, max: 500, default: 280 },
    },
  },
  warzone: {
    id: "warzone",
    name: "Warzone Mobile",
    nameAr: "وارزون موبايل",
    emoji: "🎖️",
    region: "WORLDWIDE",
    scopes: ["wz_std", "wz_ads", "wz_red", "wz_2x", "wz_3x", "wz_4x", "wz_sniper", "wz_tac"],
    maxValue: 200,
    recommended: {
      standard: { min: 80, max: 180, default: 135 },
      ads: { min: 60, max: 130, default: 95 },
      sniper: { min: 30, max: 100, default: 45 },
    },
  },
};

export type GameSensitivityProfile = {
  game: GameId;
  /** human label for each row (e.g. "TPP No Scope") */
  rows: { key: GameScopeKey; label: string; labelAr: string; camera: number; ads?: number; gyro?: number }[];
  /** quick access summary */
  summary: { avgCamera: number; avgAds: number; avgGyro: number };
  dna: string;
  confidence: number;
};

const SCOPE_LABELS: Record<GameScopeKey, { en: string; ar: string }> = {
  tpp: { en: "TPP (No Scope)", ar: "TPP بدون سكوب" },
  fpp: { en: "FPP (No Scope)", ar: "FPP بدون سكوب" },
  red: { en: "Red Dot / Holographic", ar: "نقطة حمراء" },
  s2: { en: "2x Scope", ar: "سكوب 2x" },
  s3: { en: "3x Scope", ar: "سكوب 3x" },
  s4: { en: "4x Scope", ar: "سكوب 4x" },
  s6: { en: "6x Scope", ar: "سكوب 6x" },
  s8: { en: "8x Scope", ar: "سكوب 8x" },
  ff_general: { en: "General", ar: "عام" },
  ff_red: { en: "Red Dot", ar: "نقطة حمراء" },
  ff_2x: { en: "2x Scope", ar: "سكوب 2x" },
  ff_4x: { en: "4x Scope", ar: "سكوب 4x" },
  ff_aug: { en: "AWM Scope", ar: "سكوب AWM" },
  ff_sniper: { en: "Sniper Scope", ar: "سكوب القنص" },
  ff_freelook: { en: "Free Look", ar: "نظرة حرة" },
  codm_standard: { en: "Standard", ar: "قياسي" },
  codm_ads: { en: "ADS Sensitivity", ar: "حساسية التصويب" },
  codm_tactical: { en: "Tactical", ar: "تكتيكي" },
  codm_red: { en: "Red Dot Sight", ar: "نقطة حمراء" },
  codm_2x: { en: "2x Scope", ar: "سكوب 2x" },
  codm_3x: { en: "3x Scope", ar: "سكوب 3x" },
  codm_4x: { en: "4x Scope", ar: "سكوب 4x" },
  codm_sniper: { en: "Sniper Scope", ar: "سكوب قنص" },
  apex_hip: { en: "Hipfire", ar: "بدون تصويب" },
  apex_ads: { en: "ADS", ar: "تصويب" },
  apex_1x: { en: "1x Sight", ar: "1x" },
  apex_2x: { en: "2x Sight", ar: "2x" },
  apex_3x: { en: "3x Sight", ar: "3x" },
  apex_4x: { en: "4x Sight", ar: "4x" },
  apex_6x: { en: "6x Sight", ar: "6x" },
  apex_8x: { en: "8x Sight", ar: "8x" },
  delta_tpp: { en: "TPP (No Scope)", ar: "TPP بدون سكوب" },
  delta_fpp: { en: "FPP (No Scope)", ar: "FPP بدون سكوب" },
  delta_red: { en: "Red Dot", ar: "نقطة حمراء" },
  delta_2x: { en: "2x Scope", ar: "سكوب 2x" },
  delta_3x: { en: "3x Scope", ar: "سكوب 3x" },
  delta_4x: { en: "4x Scope", ar: "سكوب 4x" },
  delta_6x: { en: "6x Scope", ar: "سكوب 6x" },
  delta_8x: { en: "8x Scope", ar: "سكوب 8x" },
  wz_std: { en: "Standard", ar: "قياسي" },
  wz_ads: { en: "ADS", ar: "تصويب" },
  wz_red: { en: "Red Dot", ar: "نقطة حمراء" },
  wz_2x: { en: "2x Scope", ar: "سكوب 2x" },
  wz_3x: { en: "3x Scope", ar: "سكوب 3x" },
  wz_4x: { en: "4x Scope", ar: "سكوب 4x" },
  wz_sniper: { en: "Sniper Scope", ar: "سكوب قنص" },
  wz_tac: { en: "Tactical", ar: "تكتيكي" },
};

export function getScopeLabel(key: GameScopeKey, lang: "en" | "ar"): string {
  const l = SCOPE_LABELS[key];
  if (!l) return key;
  return lang === "ar" ? l.ar : l.en;
}

// ───── Build profile from a normalized 0..1 base curve ─────
type NormalizedInput = {
  base: number; // 0..1 baseline sensitivity (came from old engine)
  recoil: number; // 0..1 - higher means user wants more control
  flick: number; // 0..1 - higher means user wants higher sens
  gyroEnabled: boolean;
};

// Per-game baseline curves
const PUBG_CURVE: Partial<Record<GameScopeKey, number>> = {
  tpp: 1.0, fpp: 0.95, red: 0.55, s2: 0.4, s3: 0.28, s4: 0.22, s6: 0.16, s8: 0.13,
};
const BGMI_CURVE: Partial<Record<GameScopeKey, number>> = {
  tpp: 0.96, fpp: 0.92, red: 0.52, s2: 0.38, s3: 0.26, s4: 0.21, s6: 0.15, s8: 0.12,
};
const NS_CURVE: Partial<Record<GameScopeKey, number>> = {
  tpp: 1.0, fpp: 0.95, red: 0.6, s2: 0.45, s3: 0.32, s4: 0.25, s6: 0.18, s8: 0.14,
};
const CODM_CURVE: Partial<Record<GameScopeKey, number>> = {
  codm_standard: 1.0, codm_ads: 0.85, codm_tactical: 1.15, codm_red: 0.95,
  codm_2x: 0.85, codm_3x: 0.75, codm_4x: 0.65, codm_sniper: 0.5,
};
const FF_CURVE: Partial<Record<GameScopeKey, number>> = {
  ff_general: 0.95, ff_red: 0.92, ff_2x: 0.85, ff_4x: 0.78,
  ff_aug: 0.7, ff_sniper: 0.6, ff_freelook: 0.96,
};
const APEX_CURVE: Partial<Record<GameScopeKey, number>> = {
  apex_hip: 1.0, apex_ads: 0.8, apex_1x: 0.7, apex_2x: 0.6,
  apex_3x: 0.5, apex_4x: 0.42, apex_6x: 0.32, apex_8x: 0.25,
};
const DELTA_CURVE: Partial<Record<GameScopeKey, number>> = {
  delta_tpp: 0.96, delta_fpp: 0.92, delta_red: 0.55, delta_2x: 0.4,
  delta_3x: 0.28, delta_4x: 0.22, delta_6x: 0.16, delta_8x: 0.13,
};
const WZ_CURVE: Partial<Record<GameScopeKey, number>> = {
  wz_std: 1.0, wz_ads: 0.82, wz_red: 0.92, wz_2x: 0.82,
  wz_3x: 0.72, wz_4x: 0.62, wz_sniper: 0.48, wz_tac: 1.15,
};

const CURVE_BY_GAME: Record<GameId, Partial<Record<GameScopeKey, number>>> = {
  pubgm_global: PUBG_CURVE,
  bgmi: BGMI_CURVE,
  newstate: NS_CURVE,
  codm: CODM_CURVE,
  freefire: FF_CURVE,
  apex: APEX_CURVE,
  delta: DELTA_CURVE,
  warzone: WZ_CURVE,
};

// Per-game peak base — used so different games end up at sensible default values
const PEAK_BASE: Record<GameId, number> = {
  pubgm_global: 360,
  bgmi: 345,
  newstate: 180,
  codm: 160,
  freefire: 100,
  apex: 400,
  delta: 345,
  warzone: 160,
};

export function buildGameProfile(
  game: GameId,
  input: NormalizedInput,
  lang: "en" | "ar" = "en"
): GameSensitivityProfile {
  const def = GAMES[game];
  const curve = CURVE_BY_GAME[game];
  const peak = PEAK_BASE[game];
  const rows: GameSensitivityProfile["rows"] = [];

  const baseScale = (s: number) => Math.max(1, Math.min(def.maxValue, Math.round(s)));

  for (const k of def.scopes) {
    const f = curve[k] ?? 0.3;
    const cam = baseScale(peak * f * (0.8 + input.flick * 0.5));
    let ads: number | undefined;
    let gyro: number | undefined;

    if (game === "pubgm_global" || game === "bgmi" || game === "newstate" || game === "delta") {
      ads = baseScale(cam * (0.85 + (1 - input.recoil) * 0.1));
      if (input.gyroEnabled) {
        gyro = baseScale(cam * (1.9 + input.recoil * 0.4));
      }
    } else if (game === "codm" || game === "warzone") {
      ads = baseScale(cam * (k.includes("ads") || k.includes("sniper") ? 0.9 : 0.92));
    } else if (game === "apex") {
      ads = baseScale(cam * 0.85);
    }
    // Free Fire has no ADS sensitivity

    rows.push({
      key: k,
      label: SCOPE_LABELS[k]?.en ?? k,
      labelAr: SCOPE_LABELS[k]?.ar ?? k,
      camera: cam,
      ads,
      gyro,
    });
  }

  const avgCam = rows.reduce((s, r) => s + r.camera, 0) / Math.max(1, rows.length);
  const avgAds = rows.reduce((s, r) => s + (r.ads ?? r.camera), 0) / Math.max(1, rows.length);
  const avgGyro = rows.reduce((s, r) => s + (r.gyro ?? 0), 0) / Math.max(1, rows.length);

  const dna = `${game.toUpperCase()}-${Math.round(input.base * 100)}-${Math.round(input.recoil * 100)}-${Math.round(input.flick * 100)}${input.gyroEnabled ? "-G" : ""}`;
  const conf = Math.round(78 + input.base * 14 + (input.gyroEnabled ? 6 : 0));

  void lang;

  return {
    game,
    rows,
    summary: { avgCamera: Math.round(avgCam), avgAds: Math.round(avgAds), avgGyro: Math.round(avgGyro) },
    dna,
    confidence: Math.min(99, conf),
  };
}
