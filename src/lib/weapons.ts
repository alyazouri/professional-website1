/**
 * COMPLETE WEAPONS DATABASE — LEGENDARY V4
 *
 * 70+ weapons across all supported games.
 * Recoil values calibrated against real PUBG / COD / Free Fire / Apex meta.
 *  - verticalRecoil   : 0..1  (higher = harder to control vertically)
 *  - horizontalRecoil : 0..1
 *  - fireRate         : 0..1  (higher = faster RPM)
 *  - stability        : 0..1  (higher = more first-shot accuracy)
 */

import type { GameId } from "./games";

export type WeaponCategory = "AR" | "SMG" | "DMR" | "Sniper" | "LMG" | "Shotgun" | "Pistol";

export type Weapon = {
  id: string;
  name: string;
  category: WeaponCategory;
  verticalRecoil: number;
  horizontalRecoil: number;
  fireRate: number;
  stability: number;
  /** Which games this weapon appears in. Undefined = available everywhere. */
  games?: GameId[];
  /** Optional ammo / range tag for display */
  ammo?: string;
};

const PUBG_FAMILY: GameId[] = ["pubgm_global", "bgmi", "newstate"];
const PUBG_AND_DELTA: GameId[] = ["pubgm_global", "bgmi", "newstate", "delta"];

export const WEAPONS: Weapon[] = [
  // ═══════════════════════════════════════════════════
  //  ASSAULT RIFLES (AR) — PUBG full roster
  // ═══════════════════════════════════════════════════
  { id: "m416",   name: "M416",          category: "AR", verticalRecoil: 0.55, horizontalRecoil: 0.45, fireRate: 0.70, stability: 0.78, ammo: "5.56mm", games: PUBG_AND_DELTA },
  { id: "akm",    name: "AKM",           category: "AR", verticalRecoil: 0.82, horizontalRecoil: 0.65, fireRate: 0.60, stability: 0.55, ammo: "7.62mm", games: PUBG_FAMILY },
  { id: "m762",   name: "Beryl M762",    category: "AR", verticalRecoil: 0.78, horizontalRecoil: 0.70, fireRate: 0.75, stability: 0.50, ammo: "7.62mm", games: PUBG_FAMILY },
  { id: "scarl",  name: "SCAR-L",        category: "AR", verticalRecoil: 0.50, horizontalRecoil: 0.40, fireRate: 0.65, stability: 0.80, ammo: "5.56mm", games: PUBG_AND_DELTA },
  { id: "aug",    name: "AUG A3",        category: "AR", verticalRecoil: 0.48, horizontalRecoil: 0.38, fireRate: 0.72, stability: 0.85, ammo: "5.56mm", games: PUBG_FAMILY },
  { id: "groza",  name: "Groza",         category: "AR", verticalRecoil: 0.70, horizontalRecoil: 0.55, fireRate: 0.85, stability: 0.65, ammo: "7.62mm", games: PUBG_FAMILY },
  { id: "qbz",    name: "QBZ-95",        category: "AR", verticalRecoil: 0.52, horizontalRecoil: 0.42, fireRate: 0.70, stability: 0.82, ammo: "5.56mm", games: PUBG_FAMILY },
  { id: "g36c",   name: "G36C",          category: "AR", verticalRecoil: 0.45, horizontalRecoil: 0.35, fireRate: 0.72, stability: 0.88, ammo: "5.56mm", games: PUBG_FAMILY },
  { id: "ace32",  name: "ACE32",         category: "AR", verticalRecoil: 0.58, horizontalRecoil: 0.48, fireRate: 0.78, stability: 0.75, ammo: "7.62mm", games: PUBG_FAMILY },
  { id: "mk47",   name: "Mk47 Mutant",   category: "AR", verticalRecoil: 0.72, horizontalRecoil: 0.50, fireRate: 0.55, stability: 0.70, ammo: "7.62mm", games: ["pubgm_global", "bgmi"] },
  { id: "m16a4",  name: "M16A4",         category: "AR", verticalRecoil: 0.42, horizontalRecoil: 0.35, fireRate: 0.92, stability: 0.78, ammo: "5.56mm", games: PUBG_FAMILY },
  { id: "k2",     name: "K2",            category: "AR", verticalRecoil: 0.55, horizontalRecoil: 0.45, fireRate: 0.72, stability: 0.78, ammo: "5.56mm", games: ["pubgm_global", "newstate"] },
  // COD / Warzone ARs
  { id: "ak47",   name: "AK-47",         category: "AR", verticalRecoil: 0.80, horizontalRecoil: 0.60, fireRate: 0.65, stability: 0.55, ammo: "7.62mm", games: ["codm", "warzone", "delta"] },
  { id: "m4",     name: "M4 / M4A1",     category: "AR", verticalRecoil: 0.50, horizontalRecoil: 0.40, fireRate: 0.70, stability: 0.80, ammo: "5.56mm", games: ["codm", "warzone", "delta"] },
  { id: "famas",  name: "FAMAS",         category: "AR", verticalRecoil: 0.55, horizontalRecoil: 0.45, fireRate: 0.80, stability: 0.70, ammo: "5.56mm", games: ["codm", "warzone"] },
  { id: "asval",  name: "AS Val",        category: "AR", verticalRecoil: 0.48, horizontalRecoil: 0.42, fireRate: 0.82, stability: 0.78, ammo: "9mm",    games: ["codm", "warzone"] },
  { id: "krig6",  name: "Krig 6",        category: "AR", verticalRecoil: 0.45, horizontalRecoil: 0.38, fireRate: 0.68, stability: 0.85, ammo: "5.56mm", games: ["codm", "warzone"] },
  { id: "kilo",   name: "Kilo 141",      category: "AR", verticalRecoil: 0.40, horizontalRecoil: 0.35, fireRate: 0.78, stability: 0.88, ammo: "5.56mm", games: ["codm", "warzone"] },
  { id: "ramuk",  name: "RAM-7",         category: "AR", verticalRecoil: 0.52, horizontalRecoil: 0.42, fireRate: 0.85, stability: 0.75, ammo: "5.56mm", games: ["codm", "warzone"] },
  // Apex Mobile ARs
  { id: "r301",   name: "R-301 Carbine", category: "AR", verticalRecoil: 0.45, horizontalRecoil: 0.35, fireRate: 0.80, stability: 0.85, ammo: "Light",  games: ["apex"] },
  { id: "flatline", name: "VK-47 Flatline", category: "AR", verticalRecoil: 0.68, horizontalRecoil: 0.50, fireRate: 0.70, stability: 0.65, ammo: "Heavy", games: ["apex"] },
  { id: "havoc",  name: "HAVOC",         category: "AR", verticalRecoil: 0.55, horizontalRecoil: 0.45, fireRate: 0.88, stability: 0.70, ammo: "Energy", games: ["apex"] },

  // ═══════════════════════════════════════════════════
  //  SUBMACHINE GUNS (SMG)
  // ═══════════════════════════════════════════════════
  { id: "ump45",  name: "UMP45",         category: "SMG", verticalRecoil: 0.35, horizontalRecoil: 0.30, fireRate: 0.75, stability: 0.90, ammo: ".45 ACP", games: PUBG_FAMILY },
  { id: "vector", name: "Vector",        category: "SMG", verticalRecoil: 0.55, horizontalRecoil: 0.50, fireRate: 0.95, stability: 0.60, ammo: "9mm/.45", games: PUBG_FAMILY },
  { id: "mp5k",   name: "MP5K",          category: "SMG", verticalRecoil: 0.40, horizontalRecoil: 0.35, fireRate: 0.85, stability: 0.85, ammo: "9mm",   games: [...PUBG_FAMILY, "codm"] },
  { id: "pp19",   name: "PP-19 Bizon",   category: "SMG", verticalRecoil: 0.30, horizontalRecoil: 0.28, fireRate: 0.80, stability: 0.92, ammo: "9mm",   games: ["pubgm_global", "bgmi"] },
  { id: "tommy",  name: "Tommy Gun",     category: "SMG", verticalRecoil: 0.48, horizontalRecoil: 0.45, fireRate: 0.80, stability: 0.70, ammo: ".45 ACP", games: ["pubgm_global", "bgmi"] },
  { id: "uzi",    name: "Micro UZI",     category: "SMG", verticalRecoil: 0.50, horizontalRecoil: 0.45, fireRate: 0.95, stability: 0.55, ammo: "9mm",   games: PUBG_FAMILY },
  { id: "p90",    name: "P90",           category: "SMG", verticalRecoil: 0.42, horizontalRecoil: 0.35, fireRate: 0.92, stability: 0.80, ammo: "5.7mm", games: [...PUBG_FAMILY, "codm", "warzone"] },
  { id: "mp40",   name: "MP40",          category: "SMG", verticalRecoil: 0.45, horizontalRecoil: 0.40, fireRate: 0.90, stability: 0.75, ammo: "9mm",   games: ["freefire", "codm"] },
  { id: "honey",  name: "Honey Badger",  category: "SMG", verticalRecoil: 0.45, horizontalRecoil: 0.40, fireRate: 0.85, stability: 0.78, ammo: ".300", games: ["codm", "warzone"] },
  // Apex SMGs
  { id: "r99",    name: "R-99",          category: "SMG", verticalRecoil: 0.50, horizontalRecoil: 0.45, fireRate: 0.95, stability: 0.70, ammo: "Light", games: ["apex"] },
  { id: "volt",   name: "Volt",          category: "SMG", verticalRecoil: 0.42, horizontalRecoil: 0.38, fireRate: 0.88, stability: 0.80, ammo: "Energy", games: ["apex"] },

  // ═══════════════════════════════════════════════════
  //  DESIGNATED MARKSMAN RIFLES (DMR)
  // ═══════════════════════════════════════════════════
  { id: "mini14", name: "Mini 14",       category: "DMR", verticalRecoil: 0.45, horizontalRecoil: 0.20, fireRate: 0.70, stability: 0.78, ammo: "5.56mm", games: PUBG_FAMILY },
  { id: "mk14",   name: "MK14 EBR",      category: "DMR", verticalRecoil: 0.75, horizontalRecoil: 0.55, fireRate: 0.80, stability: 0.55, ammo: "7.62mm", games: PUBG_FAMILY },
  { id: "slr",    name: "SLR",           category: "DMR", verticalRecoil: 0.70, horizontalRecoil: 0.50, fireRate: 0.65, stability: 0.60, ammo: "7.62mm", games: PUBG_FAMILY },
  { id: "sks",    name: "SKS",           category: "DMR", verticalRecoil: 0.60, horizontalRecoil: 0.40, fireRate: 0.60, stability: 0.70, ammo: "7.62mm", games: PUBG_FAMILY },
  { id: "dmr",    name: "QBU DMR",       category: "DMR", verticalRecoil: 0.68, horizontalRecoil: 0.45, fireRate: 0.68, stability: 0.65, ammo: "5.56mm", games: ["pubgm_global", "bgmi"] },
  { id: "mosin",  name: "Mosin Nagant",  category: "DMR", verticalRecoil: 0.80, horizontalRecoil: 0.40, fireRate: 0.40, stability: 0.60, ammo: "7.62mm", games: ["pubgm_global", "bgmi"] },
  { id: "fal",    name: "FAL",           category: "DMR", verticalRecoil: 0.65, horizontalRecoil: 0.50, fireRate: 0.70, stability: 0.65, ammo: "7.62mm", games: ["codm", "warzone"] },
  { id: "g3",     name: "G3",            category: "DMR", verticalRecoil: 0.62, horizontalRecoil: 0.45, fireRate: 0.65, stability: 0.70, ammo: "7.62mm", games: ["codm", "warzone"] },
  { id: "tripletake", name: "Triple Take", category: "DMR", verticalRecoil: 0.70, horizontalRecoil: 0.30, fireRate: 0.45, stability: 0.75, ammo: "Energy", games: ["apex"] },

  // ═══════════════════════════════════════════════════
  //  SNIPER RIFLES (Bolt-action)
  // ═══════════════════════════════════════════════════
  { id: "awm",     name: "AWM",          category: "Sniper", verticalRecoil: 0.90, horizontalRecoil: 0.40, fireRate: 0.20, stability: 0.50, ammo: ".300 Magnum", games: [...PUBG_FAMILY, "freefire"] },
  { id: "kar98k",  name: "Kar98k",       category: "Sniper", verticalRecoil: 0.85, horizontalRecoil: 0.35, fireRate: 0.25, stability: 0.55, ammo: "7.62mm", games: [...PUBG_FAMILY, "freefire"] },
  { id: "m24",     name: "M24",          category: "Sniper", verticalRecoil: 0.88, horizontalRecoil: 0.38, fireRate: 0.22, stability: 0.52, ammo: "7.62mm", games: PUBG_FAMILY },
  { id: "win94",   name: "Win94",        category: "Sniper", verticalRecoil: 0.70, horizontalRecoil: 0.30, fireRate: 0.30, stability: 0.60, ammo: ".45-70", games: ["pubgm_global", "bgmi"] },
  { id: "lynx",    name: "Lynx AMR",     category: "Sniper", verticalRecoil: 0.95, horizontalRecoil: 0.45, fireRate: 0.18, stability: 0.45, ammo: ".50 BMG", games: PUBG_FAMILY },
  { id: "amr",     name: "AMR",          category: "Sniper", verticalRecoil: 0.92, horizontalRecoil: 0.45, fireRate: 0.20, stability: 0.50, ammo: ".50 BMG", games: ["bgmi"] },
  { id: "kraber",  name: "Kraber .50",   category: "Sniper", verticalRecoil: 0.95, horizontalRecoil: 0.40, fireRate: 0.18, stability: 0.50, ammo: ".50 BMG", games: ["apex"] },
  { id: "sentinel", name: "Sentinel",    category: "Sniper", verticalRecoil: 0.88, horizontalRecoil: 0.40, fireRate: 0.25, stability: 0.55, ammo: "Heavy", games: ["apex"] },
  { id: "axmc",    name: "AX-50",        category: "Sniper", verticalRecoil: 0.90, horizontalRecoil: 0.40, fireRate: 0.22, stability: 0.50, ammo: ".50 BMG", games: ["codm", "warzone"] },

  // ═══════════════════════════════════════════════════
  //  LIGHT MACHINE GUNS (LMG)
  // ═══════════════════════════════════════════════════
  { id: "m249",   name: "M249",          category: "LMG", verticalRecoil: 0.65, horizontalRecoil: 0.50, fireRate: 0.90, stability: 0.60, ammo: "5.56mm", games: PUBG_FAMILY },
  { id: "dp28",   name: "DP-28",         category: "LMG", verticalRecoil: 0.70, horizontalRecoil: 0.55, fireRate: 0.75, stability: 0.58, ammo: "7.62mm", games: PUBG_FAMILY },
  { id: "mg3",    name: "MG3",           category: "LMG", verticalRecoil: 0.60, horizontalRecoil: 0.50, fireRate: 0.95, stability: 0.62, ammo: "7.62mm", games: ["pubgm_global", "bgmi"] },
  { id: "rpd",    name: "RPD",           category: "LMG", verticalRecoil: 0.62, horizontalRecoil: 0.48, fireRate: 0.85, stability: 0.65, ammo: "7.62mm", games: ["codm", "warzone"] },
  { id: "spitfire", name: "L-STAR",      category: "LMG", verticalRecoil: 0.55, horizontalRecoil: 0.45, fireRate: 0.85, stability: 0.70, ammo: "Energy", games: ["apex"] },
  { id: "rampage", name: "Rampage LMG",  category: "LMG", verticalRecoil: 0.60, horizontalRecoil: 0.45, fireRate: 0.65, stability: 0.72, ammo: "Heavy", games: ["apex"] },

  // ═══════════════════════════════════════════════════
  //  SHOTGUNS
  // ═══════════════════════════════════════════════════
  { id: "s12k",   name: "S12K",          category: "Shotgun", verticalRecoil: 0.75, horizontalRecoil: 0.60, fireRate: 0.40, stability: 0.55, ammo: "12 Gauge", games: PUBG_FAMILY },
  { id: "s1897",  name: "S1897",         category: "Shotgun", verticalRecoil: 0.85, horizontalRecoil: 0.65, fireRate: 0.20, stability: 0.50, ammo: "12 Gauge", games: PUBG_FAMILY },
  { id: "s686",   name: "S686",          category: "Shotgun", verticalRecoil: 0.90, horizontalRecoil: 0.70, fireRate: 0.30, stability: 0.48, ammo: "12 Gauge", games: PUBG_FAMILY },
  { id: "dbs",    name: "DBS",           category: "Shotgun", verticalRecoil: 0.80, horizontalRecoil: 0.60, fireRate: 0.35, stability: 0.55, ammo: "12 Gauge", games: PUBG_FAMILY },
  { id: "o12",    name: "O12",           category: "Shotgun", verticalRecoil: 0.78, horizontalRecoil: 0.55, fireRate: 0.45, stability: 0.55, ammo: "12 Gauge", games: ["pubgm_global", "bgmi"] },
  { id: "mastiff", name: "Mastiff",      category: "Shotgun", verticalRecoil: 0.80, horizontalRecoil: 0.60, fireRate: 0.35, stability: 0.55, ammo: "Heavy", games: ["apex"] },
  { id: "eva8",    name: "EVA-8",        category: "Shotgun", verticalRecoil: 0.62, horizontalRecoil: 0.50, fireRate: 0.65, stability: 0.65, ammo: "Light", games: ["apex"] },

  // ═══════════════════════════════════════════════════
  //  PISTOLS / SIDEARMS
  // ═══════════════════════════════════════════════════
  { id: "p1911",  name: "P1911",         category: "Pistol", verticalRecoil: 0.40, horizontalRecoil: 0.30, fireRate: 0.55, stability: 0.70, ammo: ".45 ACP", games: PUBG_FAMILY },
  { id: "p18c",   name: "P18C",          category: "Pistol", verticalRecoil: 0.35, horizontalRecoil: 0.30, fireRate: 0.85, stability: 0.72, ammo: "9mm",   games: PUBG_FAMILY },
  { id: "p92",    name: "P92",           category: "Pistol", verticalRecoil: 0.38, horizontalRecoil: 0.28, fireRate: 0.60, stability: 0.78, ammo: "9mm",   games: PUBG_FAMILY },
  { id: "r45",    name: "R45",           category: "Pistol", verticalRecoil: 0.50, horizontalRecoil: 0.35, fireRate: 0.45, stability: 0.65, ammo: ".45 ACP", games: PUBG_FAMILY },
  { id: "deserteagle", name: "Desert Eagle", category: "Pistol", verticalRecoil: 0.70, horizontalRecoil: 0.45, fireRate: 0.40, stability: 0.55, ammo: ".50 AE", games: ["codm", "warzone", "freefire"] },
  { id: "wingman", name: "Wingman",      category: "Pistol", verticalRecoil: 0.55, horizontalRecoil: 0.35, fireRate: 0.50, stability: 0.65, ammo: "Heavy", games: ["apex"] },

  // ═══════════════════════════════════════════════════
  //  FREE FIRE EXCLUSIVES
  // ═══════════════════════════════════════════════════
  { id: "scar_ff",  name: "SCAR (FF)",   category: "AR", verticalRecoil: 0.50, horizontalRecoil: 0.40, fireRate: 0.72, stability: 0.78, games: ["freefire"] },
  { id: "groza_ff", name: "Groza (FF)",  category: "AR", verticalRecoil: 0.62, horizontalRecoil: 0.48, fireRate: 0.85, stability: 0.68, games: ["freefire"] },
  { id: "xm8",      name: "XM8",         category: "AR", verticalRecoil: 0.48, horizontalRecoil: 0.40, fireRate: 0.75, stability: 0.78, games: ["freefire"] },
  { id: "vss",      name: "VSS",         category: "DMR", verticalRecoil: 0.36, horizontalRecoil: 0.28, fireRate: 0.62, stability: 0.88, ammo: "9mm", games: PUBG_FAMILY },
  { id: "crossbow", name: "Crossbow",    category: "Sniper", verticalRecoil: 0.15, horizontalRecoil: 0.10, fireRate: 0.08, stability: 0.92, ammo: "Bolt", games: PUBG_FAMILY },
  { id: "skorpion", name: "Skorpion",    category: "Pistol", verticalRecoil: 0.30, horizontalRecoil: 0.28, fireRate: 0.92, stability: 0.70, ammo: "9mm", games: ["pubgm_global", "bgmi"] },
  { id: "sawedoff", name: "Sawed-Off",   category: "Pistol", verticalRecoil: 0.78, horizontalRecoil: 0.62, fireRate: 0.20, stability: 0.48, ammo: "12 Gauge", games: ["pubgm_global", "bgmi"] },
  { id: "f2000",    name: "F2000",       category: "AR", verticalRecoil: 0.46, horizontalRecoil: 0.39, fireRate: 0.74, stability: 0.84, ammo: "5.56mm", games: ["newstate"] },
  { id: "js9",      name: "JS9",         category: "SMG", verticalRecoil: 0.38, horizontalRecoil: 0.32, fireRate: 0.86, stability: 0.84, ammo: "9mm", games: ["newstate"] },
  { id: "mosin_sr", name: "Mosin (SR)",  category: "Sniper", verticalRecoil: 0.84, horizontalRecoil: 0.36, fireRate: 0.22, stability: 0.56, ammo: "7.62mm", games: ["newstate"] },
];

// ───────────────────────────────────────────────────
// Lookup helpers
// ───────────────────────────────────────────────────
export const WEAPON_BY_ID = Object.fromEntries(WEAPONS.map((w) => [w.id, w])) as Record<string, Weapon>;

export function getWeaponsForGame(game: GameId): Weapon[] {
  return WEAPONS.filter((w) => !w.games || w.games.includes(game));
}

export function getWeaponsByCategory(game: GameId, cat: WeaponCategory): Weapon[] {
  return getWeaponsForGame(game).filter((w) => w.category === cat);
}

// ───────────────────────────────────────────────────
// Attachments
// ───────────────────────────────────────────────────
export const GRIPS = [
  { id: "none",     name: "No Grip",       nameAr: "بدون قبضة",       vert: 0,     horiz: 0,     stability: 0 },
  { id: "vertical", name: "Vertical Grip", nameAr: "قبضة عمودية",     vert: -0.25, horiz: -0.05, stability: 0.15 },
  { id: "half",     name: "Half Grip",     nameAr: "نصف قبضة",         vert: -0.10, horiz: -0.18, stability: 0.10 },
  { id: "thumb",    name: "Thumb Grip",    nameAr: "قبضة الإبهام",     vert: -0.05, horiz: -0.25, stability: 0.20 },
  { id: "angled",   name: "Angled Grip",   nameAr: "قبضة مائلة",       vert: -0.15, horiz: -0.20, stability: 0.12 },
  { id: "light",    name: "Light Grip",    nameAr: "قبضة خفيفة",       vert: -0.08, horiz: -0.10, stability: 0.25 },
  { id: "laser",    name: "Laser Sight",   nameAr: "ليزر",             vert: 0,     horiz: -0.22, stability: 0.08 },
];

export const MUZZLES = [
  { id: "none",  name: "No Muzzle",     nameAr: "بدون كاتم",       vert: 0,     horiz: 0     },
  { id: "comp",  name: "Compensator",   nameAr: "كومبنسيتر",       vert: -0.20, horiz: -0.20 },
  { id: "flash", name: "Flash Hider",   nameAr: "فلاش هايدر",       vert: -0.15, horiz: -0.12 },
  { id: "supp",  name: "Suppressor",    nameAr: "كاتم صوت",         vert: -0.08, horiz: -0.08 },
  { id: "choke", name: "Choke",          nameAr: "تشوك للشوتجن",     vert: -0.05, horiz: -0.10 },
];

export const MAGS = [
  { id: "none",  name: "Default Mag",     nameAr: "مخزن قياسي",         fireRate: 0    },
  { id: "ext",   name: "Extended Mag",    nameAr: "مخزن موسّع",          fireRate: 0.02 },
  { id: "qd",    name: "Quickdraw Mag",   nameAr: "تعبئة سريعة",        fireRate: 0.05 },
  { id: "extqd", name: "Ext. Quickdraw",  nameAr: "موسّع + سريع",        fireRate: 0.07 },
];

export const STOCKS = [
  { id: "none",   name: "No Stock",        nameAr: "بدون أخمص",         vert: 0,     horiz: 0,     stability: 0    },
  { id: "tac",    name: "Tactical Stock",  nameAr: "أخمص تكتيكي",       vert: -0.12, horiz: -0.10, stability: 0.18 },
  { id: "heavy",  name: "Heavy Stock",     nameAr: "أخمص ثقيل",          vert: -0.18, horiz: -0.15, stability: 0.12 },
  { id: "ump",    name: "UMP Stock",       nameAr: "أخمص UMP",          vert: -0.10, horiz: -0.08, stability: 0.15 },
];

export const SCOPES_ATTACH = [
  { id: "none",  name: "Iron Sight",  nameAr: "السكوب الافتراضي" },
  { id: "red",   name: "Red Dot",     nameAr: "نقطة حمراء" },
  { id: "holo",  name: "Holographic", nameAr: "هولوجرافي" },
  { id: "2x",    name: "2x Scope",    nameAr: "سكوب 2x" },
  { id: "3x",    name: "3x Scope",    nameAr: "سكوب 3x" },
  { id: "4x",    name: "4x Scope",    nameAr: "سكوب 4x" },
  { id: "6x",    name: "6x Scope",    nameAr: "سكوب 6x" },
  { id: "8x",    name: "8x Scope",    nameAr: "سكوب 8x" },
];

// ───────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────
export function getOptimizedRecoil(weapon: Weapon, gripId: string, muzzleId: string, stockId: string) {
  const g = GRIPS.find((x) => x.id === gripId) ?? GRIPS[0];
  const m = MUZZLES.find((x) => x.id === muzzleId) ?? MUZZLES[0];
  const s = STOCKS.find((x) => x.id === stockId) ?? STOCKS[0];
  return {
    vert: Math.max(0.05, Math.min(1, weapon.verticalRecoil + g.vert + m.vert + s.vert)),
    horiz: Math.max(0.05, Math.min(1, weapon.horizontalRecoil + g.horiz + m.horiz + s.horiz)),
    stab: Math.max(0.10, Math.min(1, weapon.stability + g.stability + s.stability)),
    fire: weapon.fireRate,
  };
}
