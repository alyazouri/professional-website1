/**
 * Pro Player Presets — LEGENDARY V4
 * 34 world-class pros across 8 games. Apply their sensitivity in one click.
 */

import type { GameId } from "./games";

export type ProPlayer = {
  /** unique slug */
  id: string;
  name: string;
  team: string;
  game: GameId;
  flag: string;
  country: string;
  /** normalized 0..1 sensitivity baseline */
  base: number;
  /** how much recoil control the player prefers (higher = more control) */
  recoil: number;
  /** how quickly the player flicks (higher = more aggressive) */
  flick: number;
  gyro: boolean;
  /** short tagline shown on the card */
  note: { en: string; ar: string };
  /** suggested style mapping for the engine */
  suggestedStyle:
    | "aggressive" | "rusher" | "balanced" | "support" | "sniper"
    | "tdm" | "competitive" | "entryfrag" | "lurker" | "igl" | "anchor";
};

export const PROS: ProPlayer[] = [
  // ─── PUBG Mobile Global (worldwide) ───
  { id: "levinho", name: "Levinho", team: "Solo Star", game: "pubgm_global", flag: "🇫🇷", country: "France",
    base: 0.78, recoil: 0.85, flick: 0.7, gyro: true, suggestedStyle: "balanced",
    note: { en: "YouTube legend with smooth tracking", ar: "أسطورة يوتيوب — تتبّع ناعم" } },
  { id: "coffin", name: "Coffin", team: "Solo Star", game: "pubgm_global", flag: "🇮🇶", country: "Iraq",
    base: 0.82, recoil: 0.9, flick: 0.75, gyro: true, suggestedStyle: "sniper",
    note: { en: "Iraq's sniper king", ar: "ملك القناصة في العراق" } },
  { id: "panda", name: "Panda", team: "Solo Star", game: "pubgm_global", flag: "🇪🇬", country: "Egypt",
    base: 0.85, recoil: 0.78, flick: 0.8, gyro: true, suggestedStyle: "aggressive",
    note: { en: "Egyptian aggressive style", ar: "أسلوب مصري هجومي" } },
  { id: "iferg", name: "iFerg", team: "Solo Star", game: "pubgm_global", flag: "🇬🇧", country: "UK",
    base: 0.75, recoil: 0.82, flick: 0.7, gyro: false, suggestedStyle: "competitive",
    note: { en: "Tactical 4-finger claw", ar: "claw تكتيكي بـ4 أصابع" } },
  { id: "athena", name: "Athena Gaming", team: "Solo Star", game: "pubgm_global", flag: "🇦🇪", country: "UAE",
    base: 0.8, recoil: 0.85, flick: 0.75, gyro: true, suggestedStyle: "balanced",
    note: { en: "UAE pro, balanced", ar: "محترف إماراتي متوازن" } },
  { id: "hydra-dynamo", name: "Hydra Dynamo", team: "Hydra OG", game: "pubgm_global", flag: "🇮🇳", country: "India",
    base: 0.88, recoil: 0.7, flick: 0.85, gyro: true, suggestedStyle: "rusher",
    note: { en: "Fast hipfire god", ar: "إله الإطلاق السريع" } },
  { id: "vortex", name: "Vortex", team: "Vortex Esports", game: "pubgm_global", flag: "🇨🇱", country: "Chile",
    base: 0.83, recoil: 0.86, flick: 0.78, gyro: true, suggestedStyle: "balanced",
    note: { en: "Latin America legend", ar: "أسطورة أمريكا اللاتينية" } },

  // ─── PMGC / PMSL Tournament tier ───
  { id: "paraboy", name: "Paraboy", team: "Nova Esports", game: "pubgm_global", flag: "🇨🇳", country: "China",
    base: 0.92, recoil: 0.9, flick: 0.95, gyro: true, suggestedStyle: "entryfrag",
    note: { en: "PMGC 2021 champion", ar: "بطل PMGC 2021" } },
  { id: "order", name: "Order", team: "Nova Esports", game: "pubgm_global", flag: "🇨🇳", country: "China",
    base: 0.9, recoil: 0.92, flick: 0.88, gyro: true, suggestedStyle: "igl",
    note: { en: "Nova's IGL precision", ar: "دقة قائد Nova" } },
  { id: "33savage", name: "33savage", team: "Stalwart Esports", game: "pubgm_global", flag: "🇲🇲", country: "Myanmar",
    base: 0.88, recoil: 0.88, flick: 0.9, gyro: true, suggestedStyle: "entryfrag",
    note: { en: "Myanmar PMGC star", ar: "نجم PMGC من ميانمار" } },
  { id: "biubiu", name: "biubiu", team: "4Merical Vibes", game: "pubgm_global", flag: "🇲🇾", country: "Malaysia",
    base: 0.86, recoil: 0.85, flick: 0.86, gyro: true, suggestedStyle: "aggressive",
    note: { en: "Malaysia top fragger", ar: "أعلى قاتل في ماليزيا" } },
  { id: "wcg-akuma", name: "WCG Akuma", team: "Bigetron RA", game: "pubgm_global", flag: "🇮🇩", country: "Indonesia",
    base: 0.84, recoil: 0.83, flick: 0.85, gyro: true, suggestedStyle: "competitive",
    note: { en: "Bigetron PMWL winner", ar: "بطل PMWL مع Bigetron" } },

  // ─── BGMI India ───
  { id: "mortal", name: "Mortal", team: "Soul", game: "bgmi", flag: "🇮🇳", country: "India",
    base: 0.85, recoil: 0.78, flick: 0.82, gyro: true, suggestedStyle: "igl",
    note: { en: "India's most loved player", ar: "اللاعب الأكثر شعبية في الهند" } },
  { id: "scout", name: "Scout", team: "GodLike", game: "bgmi", flag: "🇮🇳", country: "India",
    base: 0.88, recoil: 0.82, flick: 0.86, gyro: true, suggestedStyle: "entryfrag",
    note: { en: "ScoutOP entry fragger", ar: "مفجّر دخول ScoutOP" } },
  { id: "jonathan", name: "Jonathan", team: "GodLike", game: "bgmi", flag: "🇮🇳", country: "India",
    base: 0.9, recoil: 0.85, flick: 0.9, gyro: true, suggestedStyle: "rusher",
    note: { en: "Insane mechanical skill", ar: "مهارة ميكانيكية جنونية" } },
  { id: "mavi", name: "Mavi", team: "Team SouL", game: "bgmi", flag: "🇮🇳", country: "India",
    base: 0.83, recoil: 0.88, flick: 0.78, gyro: true, suggestedStyle: "igl",
    note: { en: "BGMI IGL master", ar: "سيد قيادة BGMI" } },
  { id: "ghatak", name: "Ghatak", team: "GodLike", game: "bgmi", flag: "🇮🇳", country: "India",
    base: 0.8, recoil: 0.9, flick: 0.75, gyro: true, suggestedStyle: "anchor",
    note: { en: "Veteran IGL", ar: "قائد محنّك" } },
  { id: "goblin", name: "Goblin", team: "TSM", game: "bgmi", flag: "🇮🇳", country: "India",
    base: 0.87, recoil: 0.82, flick: 0.85, gyro: true, suggestedStyle: "aggressive",
    note: { en: "TSM aggressive star", ar: "نجم TSM الهجومي" } },

  // ─── COD Mobile ───
  { id: "iferg-cod", name: "iFerg COD", team: "Tribe Gaming", game: "codm", flag: "🇬🇧", country: "UK",
    base: 0.76, recoil: 0.85, flick: 0.7, gyro: false, suggestedStyle: "competitive",
    note: { en: "CODM world champion", ar: "بطل CODM العالمي" } },
  { id: "bobbyplays", name: "BobbyPlays", team: "iLuminate", game: "codm", flag: "🇺🇸", country: "USA",
    base: 0.78, recoil: 0.82, flick: 0.75, gyro: false, suggestedStyle: "balanced",
    note: { en: "BR top player", ar: "أفضل لاعب باتل رويال" } },
  { id: "alexmaster", name: "AlexMasterCoD", team: "Tribe", game: "codm", flag: "🇺🇸", country: "USA",
    base: 0.82, recoil: 0.78, flick: 0.8, gyro: false, suggestedStyle: "tdm",
    note: { en: "MP specialist", ar: "مختص متعدد اللاعبين" } },
  { id: "ismashx", name: "iSmashx", team: "Solo Star", game: "codm", flag: "🇸🇦", country: "Saudi Arabia",
    base: 0.85, recoil: 0.78, flick: 0.83, gyro: false, suggestedStyle: "aggressive",
    note: { en: "Saudi top CODM player", ar: "أفضل لاعب CODM سعودي" } },

  // ─── Free Fire ───
  { id: "tsg-jash", name: "TSG Jash", team: "TSG Army", game: "freefire", flag: "🇮🇳", country: "India",
    base: 0.9, recoil: 0.7, flick: 0.92, gyro: false, suggestedStyle: "rusher",
    note: { en: "India FF king", ar: "ملك FF في الهند" } },
  { id: "tsg-ritik", name: "TSG Ritik", team: "TSG Army", game: "freefire", flag: "🇮🇳", country: "India",
    base: 0.92, recoil: 0.72, flick: 0.95, gyro: false, suggestedStyle: "entryfrag",
    note: { en: "Insane sprays", ar: "رش جنوني" } },
  { id: "nayeem", name: "Nayeem", team: "BNG Esports", game: "freefire", flag: "🇧🇩", country: "Bangladesh",
    base: 0.88, recoil: 0.75, flick: 0.9, gyro: false, suggestedStyle: "aggressive",
    note: { en: "Bangladesh legend", ar: "أسطورة بنغلاديش" } },
  { id: "nobruff", name: "NobruFF", team: "Fluxo", game: "freefire", flag: "🇧🇷", country: "Brazil",
    base: 0.95, recoil: 0.7, flick: 0.95, gyro: false, suggestedStyle: "rusher",
    note: { en: "Brazil World Champion", ar: "بطل العالم البرازيلي" } },
  { id: "b2k", name: "B2K", team: "LOUD", game: "freefire", flag: "🇧🇷", country: "Brazil",
    base: 0.92, recoil: 0.72, flick: 0.93, gyro: false, suggestedStyle: "entryfrag",
    note: { en: "LOUD ace fragger", ar: "إيس LOUD" } },

  // ─── Apex Mobile ───
  { id: "genburten", name: "Genburten", team: "DarkZero", game: "apex", flag: "🇦🇺", country: "Australia",
    base: 0.78, recoil: 0.85, flick: 0.75, gyro: false, suggestedStyle: "competitive",
    note: { en: "World #1 Apex player", ar: "الأول عالمياً في Apex" } },
  { id: "imperialhal", name: "ImperialHal", team: "TSM", game: "apex", flag: "🇺🇸", country: "USA",
    base: 0.8, recoil: 0.88, flick: 0.78, gyro: false, suggestedStyle: "igl",
    note: { en: "TSM IGL", ar: "قائد TSM" } },

  // ─── Delta Force Mobile ───
  { id: "delta-king", name: "Delta King", team: "BRG", game: "delta", flag: "🇨🇳", country: "China",
    base: 0.82, recoil: 0.85, flick: 0.8, gyro: true, suggestedStyle: "balanced",
    note: { en: "Delta Force pioneer", ar: "رائد Delta Force" } },
  { id: "shadowops", name: "ShadowOps", team: "BRG", game: "delta", flag: "🇰🇷", country: "Korea",
    base: 0.85, recoil: 0.82, flick: 0.85, gyro: true, suggestedStyle: "competitive",
    note: { en: "Korean tactical master", ar: "سيد التكتيكات الكوري" } },

  // ─── PUBG New State ───
  { id: "ns-rage", name: "NewState Rage", team: "Solo Star", game: "newstate", flag: "🇯🇵", country: "Japan",
    base: 0.86, recoil: 0.85, flick: 0.84, gyro: true, suggestedStyle: "balanced",
    note: { en: "Japan NS pro", ar: "محترف نيو ستيت ياباني" } },
  { id: "ns-falcon", name: "NS Falcon", team: "Solo Star", game: "newstate", flag: "🇰🇷", country: "Korea",
    base: 0.88, recoil: 0.83, flick: 0.88, gyro: true, suggestedStyle: "aggressive",
    note: { en: "Korean fragger", ar: "مفجّر كوري" } },

  // ─── Warzone Mobile ───
  { id: "wz-aydan", name: "WZ Aydan", team: "NRG", game: "warzone", flag: "🇨🇦", country: "Canada",
    base: 0.82, recoil: 0.85, flick: 0.8, gyro: false, suggestedStyle: "competitive",
    note: { en: "Warzone superstar", ar: "نجم Warzone الكبير" } },
];

export function getProsByGame(game: GameId): ProPlayer[] {
  return PROS.filter((p) => p.game === game);
}

/** Format a pro's preset back to engine inputs (0..1 normalized) */
export function proToEngineInput(p: ProPlayer) {
  return {
    base: p.base,
    recoil: p.recoil,
    flick: p.flick,
    gyroEnabled: p.gyro,
    style: p.suggestedStyle,
  };
}
