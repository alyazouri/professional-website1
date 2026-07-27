/**
 * Pro Tournament Presets — LEGENDARY V4
 * Officially-flavored sensitivity tunings used by top teams in major events.
 */

import type { GameId } from "./games";

export type Tournament = {
  id: string;
  name: string;
  emoji: string;
  game: GameId;
  prize: string;
  base: number;
  recoil: number;
  flick: number;
  gyro: boolean;
  desc: { en: string; ar: string };
};

export const TOURNAMENTS: Tournament[] = [
  {
    id: "pmgc",
    name: "PMGC 2025",
    emoji: "🏆",
    game: "pubgm_global",
    prize: "$3M",
    base: 0.92, recoil: 0.9, flick: 0.92, gyro: true,
    desc: {
      en: "PUBG Mobile Global Championship — Top 24 teams worldwide",
      ar: "بطولة PUBG Mobile العالمية — أفضل 24 فريق",
    },
  },
  {
    id: "pmsl",
    name: "PMSL Spring",
    emoji: "🌸",
    game: "pubgm_global",
    prize: "$500K",
    base: 0.88, recoil: 0.88, flick: 0.88, gyro: true,
    desc: {
      en: "PUBG Mobile Super League — Pro regional final",
      ar: "PMSL — النهائي الإقليمي الاحترافي",
    },
  },
  {
    id: "pmpl",
    name: "PMPL Season 11",
    emoji: "⚔️",
    game: "pubgm_global",
    prize: "$300K",
    base: 0.85, recoil: 0.85, flick: 0.85, gyro: true,
    desc: {
      en: "PUBG Mobile Pro League — Country-level championship",
      ar: "PMPL — بطولة على مستوى الدول",
    },
  },
  {
    id: "bmoc",
    name: "BMOC India",
    emoji: "🇮🇳",
    game: "bgmi",
    prize: "₹2 Cr",
    base: 0.9, recoil: 0.85, flick: 0.9, gyro: true,
    desc: {
      en: "BGMI Masters Open Championship — Top Indian roster",
      ar: "بطولة BGMI الكبرى — أعلى الفرق الهندية",
    },
  },
  {
    id: "bgis",
    name: "BGIS 2025",
    emoji: "🎯",
    game: "bgmi",
    prize: "₹1 Cr",
    base: 0.88, recoil: 0.82, flick: 0.88, gyro: true,
    desc: {
      en: "BGMI India Series — Most prestigious BGMI event",
      ar: "سلسلة BGMI الهند — أرقى أحداث BGMI",
    },
  },
  {
    id: "wcs",
    name: "COD WCS",
    emoji: "🪖",
    game: "codm",
    prize: "$2M",
    base: 0.82, recoil: 0.85, flick: 0.8, gyro: false,
    desc: {
      en: "Call of Duty World Championship Series",
      ar: "سلسلة بطولة العالم لـCall of Duty",
    },
  },
  {
    id: "ffwc",
    name: "FF World Cup",
    emoji: "🔥",
    game: "freefire",
    prize: "$2M",
    base: 0.92, recoil: 0.72, flick: 0.93, gyro: false,
    desc: {
      en: "Free Fire World Championship — Biggest mobile esport",
      ar: "كأس العالم Free Fire — أكبر بطولة موبايل",
    },
  },
  {
    id: "ffcs",
    name: "FFCS",
    emoji: "⚡",
    game: "freefire",
    prize: "$1M",
    base: 0.88, recoil: 0.74, flick: 0.9, gyro: false,
    desc: {
      en: "Free Fire Continental Series",
      ar: "سلسلة Free Fire القارية",
    },
  },
  {
    id: "algs",
    name: "Apex ALGS",
    emoji: "🦾",
    game: "apex",
    prize: "$2M",
    base: 0.78, recoil: 0.85, flick: 0.78, gyro: false,
    desc: {
      en: "Apex Legends Global Series Championship",
      ar: "بطولة Apex Legends العالمية",
    },
  },
  {
    id: "nsc",
    name: "NS Championship",
    emoji: "🚀",
    game: "newstate",
    prize: "$500K",
    base: 0.86, recoil: 0.84, flick: 0.85, gyro: true,
    desc: {
      en: "PUBG New State World Championship",
      ar: "بطولة العالم لـ PUBG New State",
    },
  },
];

export function tournamentToEngineInput(t: Tournament) {
  return {
    base: t.base,
    recoil: t.recoil,
    flick: t.flick,
    gyroEnabled: t.gyro,
  };
}
