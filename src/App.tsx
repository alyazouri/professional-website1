import { useEffect, useMemo, useState } from "react";
import { translations, type Lang } from "./lib/i18n";
import { getStore, setLang as saveLang, setTheme as saveTheme, type Theme } from "./lib/storage";
import { Crosshair, Film, Moon, Sun, Globe, Sparkles, Camera, Mail, ExternalLink, Copy, Check, Search, Crown, Target, Trophy } from "lucide-react";
import { cn } from "./utils/cn";
import { Generator } from "./components/Generator";
import { Studio } from "./components/Studio";
import { ProPresets } from "./components/ProPresets";
import { RecoilSimulator } from "./components/RecoilSimulator";
import { CrosshairBuilder } from "./components/CrosshairBuilder";
import { Tournaments } from "./components/Tournaments";
import type { ProPlayer } from "./lib/pros";
import type { Tournament } from "./lib/tournaments";
import { ToastContainer } from "./components/Toast";
import { AchievementToast } from "./components/Achievement";
import { CommandPalette } from "./components/CommandPalette";

type Tab = "generator" | "studio" | "pros" | "recoil" | "crosshair" | "tournaments";

export default function App() {
  const [tab, setTab] = useState<Tab>("generator");
  const [proPreset, setProPreset] = useState<ProPlayer | null>(null);
  const [tournamentPreset, setTournamentPreset] = useState<Tournament | null>(null);
  const [theme, setThemeState] = useState<Theme>("dark");
  const [lang, setLangState] = useState<Lang>("en");
  const [splash, setSplash] = useState(true);
  const [splashPhase, setSplashPhase] = useState(0);
  const [copiedUid, setCopiedUid] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const s = getStore();
    setThemeState(s.theme);
    setLangState(s.lang);
  }, []);

  useEffect(() => {
    if (!splash) return;
    const t1 = setTimeout(() => setSplashPhase(1), 400);
    const t2 = setTimeout(() => setSplashPhase(2), 1000);
    const t3 = setTimeout(() => setSplashPhase(3), 1600);
    const t4 = setTimeout(() => setSplash(false), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [splash]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") root.classList.add("theme-light");
    else root.classList.remove("theme-light");
    root.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  }, [lang]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const t = useMemo(() => translations[lang], [lang]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    saveTheme(next);
  };
  const toggleLang = () => {
    const next = lang === "en" ? "ar" : "en";
    setLangState(next);
    saveLang(next);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "generator", label: t.nav.generator, icon: <Crosshair className="h-4 w-4" /> },
    { id: "pros", label: t.nav.pros, icon: <Crown className="h-4 w-4" /> },
    { id: "tournaments", label: t.nav.tournaments, icon: <Trophy className="h-4 w-4" /> },
    { id: "recoil", label: t.nav.recoil, icon: <Target className="h-4 w-4" /> },
    { id: "crosshair", label: t.nav.crosshair, icon: <Crosshair className="h-4 w-4" /> },
    { id: "studio", label: t.nav.studio, icon: <Film className="h-4 w-4" /> },
  ];

  const handleApplyPro = (p: ProPlayer) => {
    setProPreset(p);
    setTournamentPreset(null);
    setTab("generator");
  };
  const handleApplyTournament = (tour: Tournament) => {
    setTournamentPreset(tour);
    setProPreset(null);
    setTab("generator");
  };

  if (splash) {
    return (
      <div className="fixed inset-0 z-[999] grid place-items-center overflow-hidden bg-[#050505]">
        <div className="anim-bg" aria-hidden="true">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6 px-4">
          <div className="relative">
            <div className={cn(
              "flex h-24 w-24 items-center justify-center rounded-3xl bg-gold-grad shadow-[0_0_80px_rgba(212,175,55,0.5)] transition-all duration-700",
              splashPhase >= 1 ? "scale-100 opacity-100" : "scale-50 opacity-0",
            )}>
              <Sparkles className="h-12 w-12 text-[#1a1612]" />
            </div>
            <div className={cn(
              "absolute inset-0 rounded-3xl border-2 border-[rgba(212,175,55,0.4)] transition-all duration-1000",
              splashPhase >= 1 ? "scale-[2] opacity-0" : "scale-100 opacity-100",
            )} />
            <div className={cn(
              "absolute inset-0 rounded-3xl border border-[rgba(212,175,55,0.2)] transition-all duration-1000 delay-300",
              splashPhase >= 2 ? "scale-[2.5] opacity-0" : "scale-100 opacity-100",
            )} />
          </div>
          <div className={cn(
            "text-center transition-all duration-700 delay-200",
            splashPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}>
            <h1 className="text-2xl font-black text-gold-grad text-glow sm:text-4xl">SENSITIVITY PUBG</h1>
            <div className="mt-2 text-sm font-semibold tracking-[0.3em] text-gold-grad/50">BY ALYAZOURI</div>
          </div>
          <div className={cn(
            "text-center transition-all duration-500 delay-500",
            splashPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
          )}>
            <div className="text-xs tracking-widest text-white/30">Professional AI-Powered Sensitivity Generator</div>
          </div>
          <div className={cn(
            "w-56 transition-all duration-500 delay-700",
            splashPhase >= 2 ? "opacity-100" : "opacity-0",
          )}>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gold-grad transition-all duration-700 ease-out"
                style={{ width: splashPhase >= 3 ? "100%" : splashPhase >= 2 ? "70%" : "30%" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen">
      <div className="anim-bg" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-bg" />
      </div>

      <header className="sticky top-0 z-40 header-glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button onClick={() => setTab("generator")} className="flex items-center gap-2.5 text-start" aria-label={t.brand}>
            <div className="logo-glow"><Sparkles className="h-4 w-4 text-[#1a1612]" /></div>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="text-gold-grad text-sm font-black tracking-wide sm:text-base">{t.brand}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] opacity-50 sm:text-[11px]">
                {t.tagline.split(" ").slice(0, 4).join(" ")}
              </span>
            </div>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {tabs.map((tb) => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                className={cn("nav-pill inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all",
                  tab === tb.id ? "nav-pill-active" : "nav-pill-idle")}>
                {tb.icon}{tb.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setPaletteOpen(true)} className="ctrl-btn" aria-label="Search">
              <Search className="h-3.5 w-3.5" />
              <kbd className="rounded border border-white/15 px-1 text-[9px] opacity-60">⌘K</kbd>
            </button>
            <button onClick={toggleLang} className="ctrl-btn" aria-label="Language">
              <Globe className="h-3.5 w-3.5 rtl-flip" />
              {lang === "en" ? "EN" : "ع"}
            </button>
            <button onClick={toggleTheme} className="ctrl-btn" aria-label="Theme">
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {theme === "dark" ? t.theme.light : t.theme.dark}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="fade-up">
          {tab === "generator" && (
            <Generator
              t={t}
              lang={lang}
              proPreset={proPreset}
              tournamentPreset={tournamentPreset}
              onPresetConsumed={() => { setProPreset(null); setTournamentPreset(null); }}
            />
          )}
          {tab === "pros" && <ProPresets lang={lang} onApply={handleApplyPro} />}
          {tab === "tournaments" && <Tournaments lang={lang} onApply={handleApplyTournament} />}
          {tab === "recoil" && <RecoilSimulator lang={lang} />}
          {tab === "crosshair" && <CrosshairBuilder lang={lang} />}
          {tab === "studio" && <Studio t={t} lang={lang} />}
        </div>
      </main>

      <nav className="mobile-bar">
        <div className="mx-auto flex max-w-sm items-stretch justify-around px-2 py-2">
          {tabs.map((tb) => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className={cn("flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition",
                tab === tb.id ? "text-gold-grad" : "opacity-50")}>
              <span className={cn("grid h-8 w-8 place-items-center rounded-xl transition-all",
                tab === tb.id && "bg-gold-grad text-[#1a1612] shadow-[0_0_16px_rgba(212,175,55,0.5)]")}>
                {tb.icon}
              </span>
              {tb.label}
            </button>
          ))}
        </div>
      </nav>

      <footer className="relative z-10 border-t border-[rgba(212,175,55,0.08)] pb-24 pt-8 md:pb-8">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-grad shadow-[0_0_30px_rgba(212,175,55,0.4)]">
              <Sparkles className="h-5 w-5 text-[#1a1612]" />
            </div>
            <div className="text-lg font-black text-gold-grad">{t.brand}</div>
            <div className="mt-1 text-xs opacity-50">{t.tagline}</div>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <a href="https://instagram.com/Saeedjor11" target="_blank" rel="noreferrer"
              className="group flex items-center gap-2 rounded-xl border border-[rgba(212,175,55,0.2)] bg-white/[0.02] px-4 py-2.5 text-sm transition hover:border-[rgba(212,175,55,0.5)] hover:bg-[rgba(212,175,55,0.05)]">
              <Camera className="h-4 w-4 text-gold-grad" />
              <span className="font-semibold">@Saeedjor11</span>
              <ExternalLink className="h-3 w-3 opacity-40 group-hover:opacity-80" />
            </a>
            <a href="https://tiktok.com/@saeedalyazouri0" target="_blank" rel="noreferrer"
              className="group flex items-center gap-2 rounded-xl border border-[rgba(212,175,55,0.2)] bg-white/[0.02] px-4 py-2.5 text-sm transition hover:border-[rgba(212,175,55,0.5)] hover:bg-[rgba(212,175,55,0.05)]">
              <Film className="h-4 w-4 text-gold-grad" />
              <span className="font-semibold">@saeedalyazouri0</span>
              <ExternalLink className="h-3 w-3 opacity-40 group-hover:opacity-80" />
            </a>
            <a href="mailto:saeedjor11@gmail.com"
              className="group flex items-center gap-2 rounded-xl border border-[rgba(212,175,55,0.2)] bg-white/[0.02] px-4 py-2.5 text-sm transition hover:border-[rgba(212,175,55,0.5)] hover:bg-[rgba(212,175,55,0.05)]">
              <Mail className="h-4 w-4 text-gold-grad" />
              <span className="font-semibold">saeedjor11@gmail.com</span>
            </a>
            <button onClick={() => { navigator.clipboard.writeText("5744469523"); setCopiedUid(true); setTimeout(() => setCopiedUid(false), 1500); }}
              className="group flex items-center gap-2 rounded-xl border border-[rgba(212,175,55,0.2)] bg-white/[0.02] px-4 py-2.5 text-sm transition hover:border-[rgba(212,175,55,0.5)] hover:bg-[rgba(212,175,55,0.05)]">
              <Crosshair className="h-4 w-4 text-gold-grad" />
              <span className="font-mono font-semibold">UID: 5744469523</span>
              {copiedUid ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 opacity-40 group-hover:opacity-80" />}
            </button>
          </div>

          <div className="mx-auto mb-4 h-px w-48 bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.3)] to-transparent" />
          <div className="text-center text-xs opacity-40">
            <span className="text-gold-grad/50">✦</span> {t.footer} <span className="text-gold-grad/50">✦</span>
          </div>
        </div>
      </footer>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        lang={lang}
        onSwitchTab={setTab}
        onToggleLang={toggleLang}
        onToggleTheme={toggleTheme}
      />
      <ToastContainer />
      <AchievementToast lang={lang} />
    </div>
  );
}
