import { useEffect, useState, useCallback } from "react";
import { Trophy, X, Sparkles, Award, Target, Zap, Globe, Calendar, Heart } from "lucide-react";
import { cn } from "../utils/cn";

type Achievement = {
  id: string;
  icon: React.ReactNode;
  en: { title: string; desc: string };
  ar: { title: string; desc: string };
  check: (state: Record<string, number>) => boolean;
};

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first",
    icon: <Sparkles className="h-6 w-6" />,
    en: { title: "First Step", desc: "Generate your first sensitivity" },
    ar: { title: "البداية", desc: "ولّد أول حساسية لك" },
    check: (s) => (s.generated || 0) >= 1,
  },
  {
    id: "explorer",
    icon: <Trophy className="h-6 w-6" />,
    en: { title: "Explorer", desc: "Try 5 different weapons" },
    ar: { title: "المستكشف", desc: "جرب 5 أسلحة مختلفة" },
    check: (s) => (s.weaponsTried || 0) >= 5,
  },
  {
    id: "device_collector",
    icon: <Globe className="h-6 w-6" />,
    en: { title: "Device Collector", desc: "Test 3 different devices" },
    ar: { title: "جامع الأجهزة", desc: "اختبر 3 أجهزة مختلفة" },
    check: (s) => (s.devicesTested || 0) >= 3,
  },
  {
    id: "conqueror",
    icon: <Award className="h-6 w-6" />,
    en: { title: "Conqueror", desc: "Generate Conqueror skill sensitivity" },
    ar: { title: "القاهر", desc: "ولّد حساسية بمهارة قاهر" },
    check: (s) => (s.conquerorCount || 0) >= 1,
  },
  {
    id: "speed_demon",
    icon: <Zap className="h-6 w-6" />,
    en: { title: "Speed Demon", desc: "Set max speed on both sliders" },
    ar: { title: "السرعة القصوى", desc: "اضبط السرعة على 15 لكلا المنزلقين" },
    check: (s) => (s.maxSpeedCount || 0) >= 1,
  },
  {
    id: "saver",
    icon: <Target className="h-6 w-6" />,
    en: { title: "Collector", desc: "Save 10 sensitivity profiles" },
    ar: { title: "المجمع", desc: "احفظ 10 ملفات حساسية" },
    check: (s) => (s.saved || 0) >= 10,
  },
  {
    id: "streak_3",
    icon: <Calendar className="h-6 w-6" />,
    en: { title: "3-Day Streak", desc: "Visit 3 days in a row" },
    ar: { title: "3 أيام متتالية", desc: "زُر الموقع 3 أيام متتالية" },
    check: (s) => (s.streak || 0) >= 3,
  },
  {
    id: "video_creator",
    icon: <Heart className="h-6 w-6" />,
    en: { title: "Video Master", desc: "Export a video from the studio" },
    ar: { title: "سيد الفيديو", desc: "صدّر فيديو من الاستوديو" },
    check: (s) => (s.exported || 0) >= 1,
  },
];

const STATE_KEY = "alyazouri-achievements";

type AchieverState = { unlocked: string[]; stats: Record<string, number>; lastVisit: number };

function loadState(): AchieverState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return { unlocked: [], stats: {}, lastVisit: Date.now() };
    return JSON.parse(raw);
  } catch {
    return { unlocked: [], stats: {}, lastVisit: Date.now() };
  }
}

function saveState(s: AchieverState) {
  try { localStorage.setItem(STATE_KEY, JSON.stringify(s)); } catch {}
}

let listeners: ((a: Achievement) => void)[] = [];

export const achievements = {
  unlock(id: string) {
    const s = loadState();
    if (s.unlocked.includes(id)) return;
    s.unlocked.push(id);
    saveState(s);
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    if (a) listeners.forEach((l) => l(a));
  },
  track(stat: string, value = 1) {
    const s = loadState();
    s.stats[stat] = (s.stats[stat] || 0) + value;
    // Update streak
    const now = Date.now();
    const oneDay = 86400000;
    if (now - s.lastVisit < oneDay * 2) {
      const dayDiff = Math.floor((now - s.lastVisit) / oneDay);
      s.stats.streak = (s.stats.streak || 0) + (dayDiff <= 1 ? 1 : 1);
    } else {
      s.stats.streak = 1;
    }
    s.lastVisit = now;
    saveState(s);
    // Check achievements
    ACHIEVEMENTS.forEach((a) => {
      if (!s.unlocked.includes(a.id) && a.check(s.stats)) {
        s.unlocked.push(a.id);
        saveState(s);
        const found = ACHIEVEMENTS.find((x) => x.id === a.id);
        if (found) listeners.forEach((l) => l(found));
      }
    });
  },
};

export function AchievementToast({ lang = "en" }: { lang?: "en" | "ar" }) {
  const [queue, setQueue] = useState<Achievement[]>([]);

  const add = useCallback((a: Achievement) => {
    setQueue((q) => [...q, a]);
  }, []);

  useEffect(() => {
    listeners.push(add);
    return () => { listeners = listeners.filter((l) => l !== add); };
  }, [add]);

  if (queue.length === 0) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-1/3 z-[1001] -translate-x-1/2">
      {queue.map((a, i) => (
        <AchievementCard key={a.id + i} achievement={a} lang={lang} onClose={() => setQueue((q) => q.slice(1))} />
      ))}
    </div>
  );
}

function AchievementCard({ achievement, lang, onClose }: { achievement: Achievement; lang: "en" | "ar"; onClose: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={cn(
        "achievement-pop pointer-events-auto flex items-center gap-4 rounded-2xl border border-[rgba(212,175,55,0.4)] bg-gradient-to-br from-black/95 to-[#1a1408]/95 p-5 shadow-[0_0_60px_rgba(212,175,55,0.3)] backdrop-blur-xl transition-all",
        show ? "scale-100 opacity-100" : "scale-50 opacity-0",
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gold-grad text-[#1a1612] shadow-[0_0_24px_rgba(212,175,55,0.5)]">
        {achievement.icon}
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-grad/70">
          {lang === "ar" ? "إنجاز مفتوح" : "Achievement Unlocked"}
        </div>
        <div className="text-lg font-bold text-gold-grad">
          {lang === "ar" ? achievement.ar.title : achievement.en.title}
        </div>
        <div className="text-xs opacity-70">
          {lang === "ar" ? achievement.ar.desc : achievement.en.desc}
        </div>
      </div>
      <button onClick={onClose} className="opacity-50 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AchievementGrid({ lang = "en" }: { lang?: "en" | "ar" }) {
  const [s] = useState(loadState());
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ACHIEVEMENTS.map((a) => {
        const unlocked = s.unlocked.includes(a.id);
        return (
          <div
            key={a.id}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition",
              unlocked
                ? "border-[rgba(212,175,55,0.5)] bg-gold-grad/10"
                : "border-white/5 bg-white/[0.02] opacity-50",
            )}
          >
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", unlocked ? "bg-gold-grad text-[#1a1612]" : "bg-white/5")}>
              {a.icon}
            </div>
            <div className="text-xs font-bold">{lang === "ar" ? a.ar.title : a.en.title}</div>
            <div className="text-[10px] opacity-50">{lang === "ar" ? a.ar.desc : a.en.desc}</div>
          </div>
        );
      })}
    </div>
  );
}
