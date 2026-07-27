import type { Lang } from "./i18n";

export type Theme = "dark" | "light";

export type SavedProfile = {
  id: string;
  name: string;
  dna: string;
  createdAt: number;
  payload: unknown;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  provider: "guest" | "email" | "google" | "apple";
  createdAt: number;
};

type Store = {
  theme: Theme;
  lang: Lang;
  user: UserProfile | null;
  profiles: SavedProfile[];
  recent: { id: string; type: string; label: string; at: number }[];
};

const KEY = "alyazouri-store-v1";

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) throw new Error("no store");
    return JSON.parse(raw);
  } catch {
    return {
      theme: "dark",
      lang: "en",
      user: null,
      profiles: [],
      recent: [],
    };
  }
}

function save(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export function getStore(): Store {
  return load();
}

export function setTheme(t: Theme) {
  const s = load();
  s.theme = t;
  save(s);
}

export function setLang(l: Lang) {
  const s = load();
  s.lang = l;
  save(s);
}

export function saveProfile(p: SavedProfile) {
  const s = load();
  const idx = s.profiles.findIndex((x) => x.id === p.id);
  if (idx >= 0) s.profiles[idx] = p;
  else s.profiles.unshift(p);
  save(s);
}

export function deleteProfile(id: string) {
  const s = load();
  s.profiles = s.profiles.filter((p) => p.id !== id);
  save(s);
}

export function setUser(u: UserProfile | null) {
  const s = load();
  s.user = u;
  save(s);
}

export function addRecent(entry: Omit<Store["recent"][number], "id" | "at">) {
  const s = load();
  s.recent.unshift({ ...entry, id: Math.random().toString(36).slice(2), at: Date.now() });
  s.recent = s.recent.slice(0, 20);
  save(s);
}

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
