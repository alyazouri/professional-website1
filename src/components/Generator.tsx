import { useEffect, useMemo, useState } from "react";
import type { Dict, Lang } from "../lib/i18n";
import {
  ALL_DEVICES,
  BRANDS,
  resolveDeviceMatch,
  type Device,
} from "../lib/devices";
import { detectDeviceUltimate } from "../lib/deviceEngine";
import {
  GRIPS,
  MUZZLES,
  MAGS,
  STOCKS,
  getWeaponsForGame,
  type Weapon,
} from "../lib/weapons";
import {
  generateSensitivity,
  tierLabel,
  getSensitivityRecommendation,
  type Input,
  type SensitivityProfile,
} from "../lib/sensitivityEngine";
import { saveProfile, uid, addRecent, getStore, deleteProfile } from "../lib/storage";
import { generatePDF } from "../lib/pdfReport";
import { GAMES, buildGameProfile, type GameId, type GameSensitivityProfile } from "../lib/games";
import { Card, Chip, Field, GoldButton, GhostButton, Input as TextInput, Progress, Stat } from "./ui";
import {
  ArrowLeft,
  ArrowRight,
  Cpu,
  Fingerprint,
  Gamepad2,
  Layers,
  Search,
  Sparkles,
  Target,
  Wand2,
  Zap,
  Crosshair,
  Move,
  Eye,
  Copy,
  Check,
  Download,
  Save,
  Trash2,
} from "lucide-react";
import { cn } from "../utils/cn";

type Step =
  | "device"
  | "system"
  | "fingers"
  | "gyro"
  | "style"
  | "skill"
  | "range"
  | "weapon"
  | "attachments"
  | "priority"
  | "speed";

const STEP_ORDER: Step[] = [
  "device",
  "system",
  "fingers",
  "gyro",
  "style",
  "skill",
  "range",
  "weapon",
  "attachments",
  "priority",
  "speed",
];

type Draft = {
  device: Device | null;
  brand: string;
  modelSearch: string;
  os: "android" | "ios";
  fps: number;
  refreshHz: number;
  touchHz: number;
  fingers: 2 | 3 | 4 | 5 | 6;
  gyro: "off" | "scope" | "always";
  style: Input["style"];
  skill: Input["skill"];
  range: Input["range"];
  weapon: Weapon | null;
  grip: string;
  muzzle: string;
  mag: string;
  stock: string;
  priority: Input["priority"];
  normalSpeed: number;
  gyroSpeed: number;
  detecting: boolean;
  detectionInfo: null | {
    method: string;
    confidence: number;
    rawInfo: Record<string, unknown>;
  };
};

const defaultDraft: Draft = {
  device: null,
  brand: "Samsung",
  modelSearch: "",
  os: "android",
  fps: 60,
  refreshHz: 60,
  touchHz: 120,
  fingers: 4,
  gyro: "scope",
  style: "balanced",
  skill: "intermediate",
  range: "mixed",
  weapon: null,
  grip: "vertical",
  muzzle: "comp",
  mag: "extqd",
  stock: "tac",
  priority: "balanced",
  normalSpeed: 8,
  gyroSpeed: 8,
  detecting: false,
  detectionInfo: null as null | {
    method: string;
    confidence: number;
    rawInfo: Record<string, unknown>;
  },
};

function pickDetectedDeviceCandidate(identity: { brand: string; model: string; os: string; tier: Device["tier"]; refreshHz: number }) {
  if (identity.os !== "android" && identity.os !== "ios") return null;
  return resolveDeviceMatch(identity.brand, identity.model, identity.os)
    ?? ALL_DEVICES.find((d) => d.os === identity.os && d.refreshHz === identity.refreshHz && (d.tier === identity.tier || d.tier === "flagship"))
    ?? ALL_DEVICES.find((d) => d.os === identity.os && d.tier === (identity.os === "ios" ? "flagship" : "high"))
    ?? null;
}

import type { ProPlayer } from "../lib/pros";
import type { Tournament } from "../lib/tournaments";

export function Generator({
  t,
  lang,
  proPreset,
  tournamentPreset,
  onPresetConsumed,
}: {
  t: Dict;
  lang: Lang;
  proPreset?: ProPlayer | null;
  tournamentPreset?: Tournament | null;
  onPresetConsumed?: () => void;
}) {
  const [step, setStep] = useState<Step>("device");
  const [draft, setDraft] = useState<Draft>(defaultDraft);
  const [profile, setProfile] = useState<SensitivityProfile | null>(null);
  const [game, setGame] = useState<GameId>("pubgm_global");
  const [gameProfile, setGameProfile] = useState<GameSensitivityProfile | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [showSave, setShowSave] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const savedProfiles = useMemo(() => getStore().profiles, [profile, showSaved]);

  // Auto-select OS from device
  useEffect(() => {
    if (draft.device) {
      setDraft((d) => ({ ...d, os: draft.device!.os }));
    }
  }, [draft.device]);

  // Apply Pro Preset when arriving from Pros page
  useEffect(() => {
    if (!proPreset) return;
    setGame(proPreset.game);
    setDraft((d) => ({
      ...d,
      gyro: proPreset.gyro ? "always" : "off",
      style: proPreset.suggestedStyle,
      skill: "professional",
      priority: "competitive",
      normalSpeed: Math.max(1, Math.min(15, Math.round(proPreset.base * 15))),
      gyroSpeed: Math.max(1, Math.min(15, Math.round(proPreset.recoil * 15))),
    }));
    onPresetConsumed?.();
  }, [proPreset, onPresetConsumed]);

  // Apply Tournament Preset when arriving from Tournaments page
  useEffect(() => {
    if (!tournamentPreset) return;
    setGame(tournamentPreset.game);
    setDraft((d) => ({
      ...d,
      gyro: tournamentPreset.gyro ? "always" : "off",
      style: "competitive",
      skill: "professional",
      priority: "competitive",
      normalSpeed: Math.max(1, Math.min(15, Math.round(tournamentPreset.base * 15))),
      gyroSpeed: Math.max(1, Math.min(15, Math.round(tournamentPreset.recoil * 15))),
    }));
    onPresetConsumed?.();
  }, [tournamentPreset, onPresetConsumed]);

  const stepIdx = STEP_ORDER.indexOf(step);
  const progress = ((stepIdx + 1) / STEP_ORDER.length) * 100;

  const filteredModels = useMemo(() => {
    return ALL_DEVICES.filter(
      (d) =>
        d.brand === draft.brand &&
        (draft.modelSearch === "" || d.model.toLowerCase().includes(draft.modelSearch.toLowerCase())),
    );
  }, [draft.brand, draft.modelSearch]);

  useEffect(() => {
    if (draft.weapon && !getWeaponsForGame(game).some((w) => w.id === draft.weapon?.id)) {
      setDraft((d) => ({ ...d, weapon: null }));
    }
  }, [game]);

  function canGoNext(): boolean {
    switch (step) {
      case "device":
        return !!draft.device;
      case "system":
        return true;
      case "fingers":
      case "gyro":
      case "style":
      case "skill":
      case "range":
        return true;
      case "weapon":
        return !!draft.weapon;
      case "attachments":
      case "priority":
      case "speed":
        return true;
    }
  }

  function next() {
    const i = STEP_ORDER.indexOf(step);
    if (i < STEP_ORDER.length - 1) setStep(STEP_ORDER[i + 1]);
  }
  function prev() {
    const i = STEP_ORDER.indexOf(step);
    if (i > 0) setStep(STEP_ORDER[i - 1]);
  }

  function buildInput(): Input | null {
    if (!draft.device || !draft.weapon) return null;
    return {
      device: draft.device,
      os: draft.os,
      fps: draft.fps,
      refreshHz: draft.refreshHz,
      touchHz: draft.touchHz,
      fingers: draft.fingers,
      gyro: draft.gyro,
      style: draft.style,
      skill: draft.skill,
      range: draft.range,
      weapon: draft.weapon,
      grip: draft.grip,
      muzzle: draft.muzzle,
      mag: draft.mag,
      stock: draft.stock,
      priority: draft.priority,
      normalSpeed: draft.normalSpeed,
      gyroSpeed: draft.gyroSpeed,
    };
  }

  function doGenerate() {
    const input = buildInput();
    if (!input) return;
    setGenerating(true);
    setTimeout(() => {
      const p = generateSensitivity(input);
      const recommendations = getSensitivityRecommendation(input);
      setProfile({ ...p, recommendations });
      // Build game-specific profile from same input
      const flick = (input.normalSpeed / 15);
      const recoil = input.priority === "recoil" ? 0.85 : input.priority === "tracking" ? 0.7 : 0.55;
      const baseLevel = p.confidence / 100;
      setGameProfile(buildGameProfile(game, {
        base: baseLevel, recoil, flick,
        gyroEnabled: input.gyro !== "off",
      }, lang));
      setGenerating(false);
      addRecent({ type: "sensitivity", label: `[${GAMES[game].name}] ${input.device.model} • ${input.weapon.name}` });
    }, 900);
  }

  function downloadPDF() {
    const input = buildInput();
    if (!input || !profile) return;
    try {
      generatePDF(profile, input.device, input.weapon, lang, {
        style: draft.style,
        skill: draft.skill,
        range: draft.range,
        priority: draft.priority,
        fingers: draft.fingers,
        gyro: draft.gyro,
        normalSpeed: draft.normalSpeed,
        gyroSpeed: draft.gyroSpeed,
        grip: draft.grip,
        muzzle: draft.muzzle,
        stock: draft.stock,
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  }

  function doSave() {
    if (!profile || !draft.device || !draft.weapon) return;
    const name = savedName.trim() || `${draft.device.model} • ${draft.weapon.name}`;
    saveProfile({
      id: uid(),
      name,
      dna: profile.dna,
      createdAt: Date.now(),
      payload: { draft: { ...draft, weapon: draft.weapon.id, device: draft.device.model }, profile },
    });
    setShowSave(false);
    setSavedName("");
  }

  function copyAll() {
    if (!profile) return;
    const lines: string[] = [];
    lines.push(`SENSITIVITY PUBG BY ALYAZOURI — ${profile.dna}`);
    lines.push("");
    lines.push(`Free Look — TPP:${profile.freeLook.tpp} FPP:${profile.freeLook.fpp} Parachute:${profile.freeLook.parachuting}`);
    lines.push("");
    const renderGroup = (label: string, obj: Record<string, number>) =>
      `${label} — TPP:${obj.tpp} FPP:${obj.fpp} RD:${obj.red} 2x:${obj.s2} 3x:${obj.s3} 4x:${obj.s4} 6x:${obj.s6} 8x:${obj.s8}`;
    lines.push(renderGroup("Camera", profile.camera));
    lines.push(renderGroup("ADS", profile.ads));
    lines.push(renderGroup("Gyro", profile.gyro));
    lines.push(renderGroup("ADS Gyro", profile.adsGyro));
    lines.push("");
    lines.push(
      `Controls — Move:${profile.control.movementSize}% TPP:${profile.control.tppView}% FPP:${profile.control.fppView}% Sprint:${profile.control.sprintSens}%`,
    );
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function downloadJson() {
    if (!profile) return;
    const blob = new Blob([JSON.stringify({ ...profile, device: draft.device?.model, weapon: draft.weapon?.name }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alyazouri-sensitivity-${profile.dna}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fade-up space-y-8">
      {/* Hero */}
      {!profile && (
        <section className="relative overflow-hidden rounded-3xl border border-[rgba(212,175,55,0.2)] bg-black/40 p-6 sm:p-10 theme-light:bg-white/60">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(212,175,55,0.3),transparent)] blur-2xl" />
          <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(168,134,43,0.25),transparent)] blur-2xl" />
          <div className="relative grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.35)] bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] theme-light:bg-black/5">
                <Sparkles className="h-3.5 w-3.5 text-gold-grad" /> {t.hero.badge}
              </div>
              <h1 className="text-3xl font-black leading-[1.05] sm:text-5xl md:text-6xl">
                <span className="text-gold-grad">{t.hero.title.split(",")[0]},</span>
                <br />
                <span className="text-white theme-light:text-neutral-900">{t.hero.title.split(",")[1]}</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed opacity-80 sm:text-base">
                {t.hero.subtitle}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <GoldButton onClick={async () => {
                  setStep("device");
                  // Auto-detect device immediately
                  setDraft((d) => ({ ...d, detecting: true, detectionInfo: null }));
                  try {
                const result = await detectDeviceUltimate();
                const identity = result.identity;
                const matched = pickDetectedDeviceCandidate(identity);
                if (matched) {
                  setDraft((x) => ({
                    ...x,
                    device: matched!,
                    brand: matched!.brand,
                    refreshHz: matched!.refreshHz,
                    touchHz: matched!.touchHz,
                    os: matched!.os,
                    detecting: false,
                    detectionInfo: {
                      method: identity.verifiedBy[0] || "aiClassifier",
                      confidence: identity.confidence,
                      rawInfo: {
                        gpu: result.gpu.value,
                        display: result.display.value,
                        performance: result.performance.value,
                        recommendation: result.recommendation,
                        detectedBrand: identity.brand,
                        detectedModel: identity.model,
                      } as Record<string, unknown>,
                    },
                  }));
                } else {
                  setDraft((x) => ({ ...x, detecting: false }));
                }
                  } catch {
                    setDraft((d) => ({ ...d, detecting: false }));
                  }
                }}>
                  <Target className="h-4 w-4" /> {t.hero.cta}
                </GoldButton>

              </div>
              <div className="mt-6 grid max-w-md grid-cols-3 gap-3">
                <MiniStat label={t.hero.stats1} value="100%" />
                <MiniStat label={t.hero.stats2} value="V2" />
                <MiniStat label={t.hero.stats3} value="PRO" />
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="card-glass rounded-2xl p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider opacity-70">Sensitivity DNA</span>
                  <span className="text-xs opacity-50">ALY-DNA-X72K91</span>
                </div>
                <SensMiniViz />
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <Kv k="Camera TPP" v="120" />
                  <Kv k="ADS TPP" v="110" />
                  <Kv k="Gyro 4x" v="65" />
                  <Kv k="ADS Gyro 4x" v="101" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Saved Profiles */}
      {!profile && savedProfiles.length > 0 && (
        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gold-grad">
              <Save className="h-5 w-5" /> {lang === "ar" ? "الملفات المحفوظة" : "Saved Profiles"}
              <span className="rounded-full bg-gold-grad/15 px-2 py-0.5 text-xs">{savedProfiles.length}</span>
            </h2>
            <button
              onClick={() => setShowSaved((v) => !v)}
              className="text-xs opacity-60 hover:opacity-100"
            >
              {showSaved ? (lang === "ar" ? "إخفاء" : "Hide") : (lang === "ar" ? "عرض الكل" : "Show All")}
            </button>
          </div>
          {showSaved && (
            <div className="space-y-2">
              {savedProfiles.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-[rgba(212,175,55,0.12)] bg-white/[0.02] px-4 py-3 transition hover:border-[rgba(212,175,55,0.3)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-grad/10">
                      <Crosshair className="h-4 w-4 text-gold-grad" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{p.name}</div>
                      <div className="text-[11px] font-mono text-gold-grad/70">{p.dna}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] opacity-50">
                      {new Date(p.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                    </span>
                    <button
                      onClick={() => {
                        deleteProfile(p.id);
                        setShowSaved((v) => !v);
                        setShowSaved((v) => !v);
                      }}
                      className="rounded-lg p-1.5 text-rose-400/60 transition hover:bg-rose-400/10 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Game Selector */}
      {!profile && (
        <Card className="p-4 sm:p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gold-grad">
              <Gamepad2 className="h-4 w-4" /> {lang === "ar" ? "اختر اللعبة" : "Choose Your Game"}
            </h3>
            <span className="text-[10px] opacity-50">{lang === "ar" ? "يؤثر على جدول الحساسية المخرج" : "Affects output sensitivity tables"}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {(Object.keys(GAMES) as GameId[]).map((gId) => {
              const g = GAMES[gId];
              return (
                <button
                  key={gId}
                  onClick={() => setGame(gId)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-3 text-start transition",
                    game === gId ? "border-gold-grad bg-gold-grad/10 shadow-[0_0_15px_rgba(212,175,55,0.2)]" : "border-[rgba(212,175,55,0.15)] bg-white/[0.02] hover:border-[rgba(212,175,55,0.4)]",
                  )}
                >
                  <div className="text-3xl">{g.emoji}</div>
                  <div>
                    <div className="text-sm font-bold text-gold-grad">{lang === "ar" ? g.nameAr : g.name}</div>
                    <div className="text-[10px] opacity-60">{g.scopes.length} {lang === "ar" ? "خانات" : "slots"}</div>
                  </div>
                  {game === gId && <Check className="ml-auto h-4 w-4 text-gold-grad" />}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Wizard */}
      {!profile && (
        <Card className="p-5 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-gold-deep/80">
                {t.wizard.step} {stepIdx + 1} {t.wizard.of} {STEP_ORDER.length}
              </div>
              <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                <span className="text-gold-grad">{t.wizard.title[step]}</span>
              </h2>
              <p className="mt-1 text-sm opacity-70">{t.wizard.desc[step]}</p>
            </div>
            <div className="hidden w-48 sm:block">
              <Progress value={progress} />
            </div>
          </div>

          <div className="mb-6 block sm:hidden">
            <Progress value={progress} />
          </div>

          <div className="min-h-[260px]">
            {step === "device" && (
              <DeviceStep
                draft={draft}
                setDraft={setDraft}
                brands={BRANDS}
                filteredModels={filteredModels}
                t={t}
                lang={lang}
              />
            )}
            {step === "system" && (
              <SystemStep draft={draft} setDraft={setDraft} t={t} />
            )}
            {step === "fingers" && <FingersStep draft={draft} setDraft={setDraft} t={t} />}
            {step === "gyro" && <GyroStep draft={draft} setDraft={setDraft} t={t} lang={lang} />}
            {step === "style" && <StyleStep draft={draft} setDraft={setDraft} t={t} lang={lang} />}
            {step === "skill" && <SkillStep draft={draft} setDraft={setDraft} t={t} />}
            {step === "range" && <RangeStep draft={draft} setDraft={setDraft} t={t} />}
            {step === "weapon" && <WeaponStep draft={draft} setDraft={setDraft} game={game} lang={lang} />}
            {step === "attachments" && <AttachmentsStep draft={draft} setDraft={setDraft} t={t} />}
            {step === "priority" && <PriorityStep draft={draft} setDraft={setDraft} />}
            {step === "speed" && <SpeedStep draft={draft} setDraft={setDraft} t={t} />}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-[rgba(212,175,55,0.12)] pt-5">
            <GhostButton onClick={prev} disabled={stepIdx === 0}>
              <ArrowLeft className="h-4 w-4 rtl-flip" /> {t.wizard.back}
            </GhostButton>
            {stepIdx === STEP_ORDER.length - 1 ? (
              <GoldButton onClick={doGenerate} disabled={!canGoNext() || generating}>
                {generating ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" /> {t.wizard.generating}
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" /> {t.wizard.generate}
                  </>
                )}
              </GoldButton>
            ) : (
              <GoldButton onClick={next} disabled={!canGoNext()}>
                {t.wizard.next} <ArrowRight className="h-4 w-4 rtl-flip" />
              </GoldButton>
            )}
          </div>
        </Card>
      )}

      {/* Result */}
      {profile && (
        <>
          {/* Game-specific sensitivity table */}
          {gameProfile && (
            <Card className="p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-gold-deep/80">{lang === "ar" ? "جدول حساسية" : "Sensitivity Table"}</div>
                  <h3 className="flex items-center gap-2 text-xl font-bold text-gold-grad">
                    <span className="text-2xl">{GAMES[gameProfile.game].emoji}</span>
                    {lang === "ar" ? GAMES[gameProfile.game].nameAr : GAMES[gameProfile.game].name}
                  </h3>
                </div>
                <div className="text-right text-[11px]">
                  <div className="font-mono opacity-70">{gameProfile.dna}</div>
                  <div className="opacity-60">{lang === "ar" ? "الثقة" : "Confidence"}: <span className="text-gold-grad font-bold">{gameProfile.confidence}%</span></div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgba(212,175,55,0.2)] text-[10px] uppercase tracking-wider opacity-60">
                      <th className="py-2 text-start">{lang === "ar" ? "السكوب" : "Scope"}</th>
                      <th className="py-2 text-end">{lang === "ar" ? "كاميرا" : "Camera"}</th>
                      <th className="py-2 text-end">ADS</th>
                      <th className="py-2 text-end">Gyro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameProfile.rows.map((r) => (
                      <tr key={r.key} className="border-b border-[rgba(212,175,55,0.08)] hover:bg-white/[0.02]">
                        <td className="py-2">{lang === "ar" ? r.labelAr : r.label}</td>
                        <td className="py-2 text-end font-mono font-bold text-gold-grad">{r.camera}</td>
                        <td className="py-2 text-end font-mono opacity-80">{r.ads ?? "—"}</td>
                        <td className="py-2 text-end font-mono opacity-80">{r.gyro ? r.gyro : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-white/5 px-3 py-2">
                  <div className="text-[10px] uppercase opacity-60">{lang === "ar" ? "متوسط كاميرا" : "Avg Camera"}</div>
                  <div className="font-bold text-gold-grad">{gameProfile.summary.avgCamera}</div>
                </div>
                <div className="rounded-lg bg-white/5 px-3 py-2">
                  <div className="text-[10px] uppercase opacity-60">{lang === "ar" ? "متوسط ADS" : "Avg ADS"}</div>
                  <div className="font-bold text-gold-grad">{gameProfile.summary.avgAds}</div>
                </div>
                <div className="rounded-lg bg-white/5 px-3 py-2">
                  <div className="text-[10px] uppercase opacity-60">{lang === "ar" ? "متوسط Gyro" : "Avg Gyro"}</div>
                  <div className="font-bold text-gold-grad">{gameProfile.summary.avgGyro || "—"}</div>
                </div>
              </div>
            </Card>
          )}
          <ResultView
            profile={profile}
            device={draft.device!}
            weapon={draft.weapon!}
            t={t}
            lang={lang}
            copied={copied}
            onCopy={copyAll}
            onDownload={downloadJson}
            onPDF={downloadPDF}
            onReset={() => {
              setProfile(null);
              setGameProfile(null);
              setStep("device");
            }}
            onSaveRequest={() => setShowSave(true)}
          />
        </>
      )}

      {/* Save modal */}
      {showSave && (
        <Modal onClose={() => setShowSave(false)}>
          <h3 className="text-xl font-bold text-gold-grad">{t.labels.save}</h3>
          <p className="mt-1 text-sm opacity-70">
            {profile?.dna}
          </p>
          <div className="mt-4">
            <Field label="Name">
              <TextInput
                value={savedName}
                onChange={(e) => setSavedName(e.target.value)}
                placeholder={`${draft.device?.model} • ${draft.weapon?.name}`}
              />
            </Field>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <GhostButton onClick={() => setShowSave(false)}>✕</GhostButton>
            <GoldButton onClick={doSave}>
              <Save className="h-4 w-4" /> {t.labels.save}
            </GoldButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-glass rounded-xl p-3 text-center">
      <div className="text-[10px] uppercase tracking-widest opacity-60">{label}</div>
      <div className="mt-1 text-xl font-bold text-gold-grad">{value}</div>
    </div>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
      <span className="text-[11px] uppercase tracking-wider opacity-60">{k}</span>
      <span className="font-bold text-gold-grad">{v}</span>
    </div>
  );
}

function SensMiniViz() {
  // 8 bars representing scope sens levels (illustrative, decorative only)
  const bars = [90, 78, 60, 48, 36, 26, 18, 12];
  return (
    <div className="flex h-20 items-end gap-1.5">
      {bars.map((b, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm bg-gold-grad opacity-80"
          style={{ height: `${b}%` }}
        />
      ))}
    </div>
  );
}

// ========= Step components =========

function DeviceStep({
  draft,
  setDraft,
  brands,
  filteredModels,
  t,
  lang,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  brands: string[];
  filteredModels: Device[];
  t: Dict;
  lang: Lang;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <Field label={t.labels.brand}>
          <div className="grid max-h-56 grid-cols-2 gap-2 overflow-auto rounded-xl border border-[rgba(212,175,55,0.18)] bg-black/30 p-2 sm:grid-cols-3 theme-light:bg-white/60">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => {
                  setDraft((d) => ({ ...d, brand: b, device: null, modelSearch: "" }));
                }}
                className={cn(
                  "chip rounded-lg px-3 py-2 text-left text-xs font-semibold",
                  draft.brand === b && "chip-active",
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </Field>

        <div className="mt-5">
          <Field label={t.labels.model} hint={lang === "ar" ? "ابحث بالاسم" : "Search by name"}>
            <div className="relative">
              <Search className="absolute top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 rtl:right-3 rtl:translate-x-0 ltr:left-3" />
              <TextInput
                value={draft.modelSearch}
                onChange={(e) => setDraft((d) => ({ ...d, modelSearch: e.target.value }))}
                placeholder={t.labels.search}
                className="ltr:pl-9 rtl:pr-9"
              />
            </div>
          </Field>
          <div className="mt-2 max-h-64 space-y-1 overflow-auto rounded-xl border border-[rgba(212,175,55,0.18)] bg-black/30 p-2 theme-light:bg-white/60">
            {filteredModels.length === 0 && (
              <div className="p-4 text-center text-sm opacity-60">—</div>
            )}
            {filteredModels.map((d) => (
              <button
                key={d.model}
                onClick={() => setDraft((x) => ({ ...x, device: d }))}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
                  draft.device?.model === d.model
                    ? "bg-gold-grad text-[#1a1612] font-bold"
                    : "hover:bg-white/5",
                )}
              >
                <span>{d.model}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-70">
                  {d.refreshHz}Hz • {d.tier}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="relative overflow-hidden p-5">
          {/* Glow accent */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-yellow-500/15 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold-deep/80">
              <Cpu className="h-4 w-4" /> {t.wizard.title.detect}
            </div>
            <p className="mt-2 text-sm opacity-70">
              {lang === "ar"
                ? "سنستخدم 6 طبقات من البصمات (GPU، شاشة، أداء، متصفح، سلوك، AI) للتعرف على جهازك بدقة."
                : "We use 6-layer fingerprinting (GPU, display, performance, browser, behavior, AI) to identify your device precisely."}
            </p>
            {draft.detecting && (
              <div className="mt-3 rounded-xl border border-[rgba(212,175,55,0.25)] bg-yellow-500/5 px-3 py-2 text-xs flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin text-gold-grad" />
                <span className="opacity-80">
                  {lang === "ar" ? "جاري فحص الجهاز… GPU · شاشة · أداء · سلوك" : "Scanning device… GPU · Display · Performance · Behavior"}
                </span>
              </div>
            )}
          <GoldButton
            onClick={async () => {
              setDraft((d) => ({ ...d, detecting: true, detectionInfo: null }));
              try {
                const result = await detectDeviceUltimate();
                const matched = pickDetectedDeviceCandidate(result.identity);
                if (matched) {
                  setDraft((x) => ({
                     ...x,
                     device: matched!,
                     brand: matched!.brand,
                     refreshHz: matched!.refreshHz,
                     touchHz: matched!.touchHz,
                     os: matched!.os,
                     detecting: false,
                     detectionInfo: {
                       method: result.identity.verifiedBy[0] || "aiClassifier",
                       confidence: result.identity.confidence,
                       rawInfo: {
                         gpu: result.gpu.value,
                         display: result.display.value,
                         performance: result.performance.value,
                         recommendation: result.recommendation,
                         detectedBrand: result.identity.brand,
                         detectedModel: result.identity.model,
                       } as Record<string, unknown>,
                     },
                   }));
                 } else {
                   const isIOS = result.identity.os === "ios";
                   const fallback = ALL_DEVICES.find(
                     (dd) => dd.os === (isIOS ? "ios" : "android") && dd.tier === "high",
                   );
                   if (fallback) {
                     setDraft((x) => ({
                       ...x,
                       device: fallback,
                       brand: fallback.brand,
                       detecting: false,
                       detectionInfo: {
                         method: result.identity.verifiedBy[0] || "aiClassifier",
                         confidence: result.identity.confidence,
                         rawInfo: {
                         gpu: result.gpu.value,
                         display: result.display.value,
                         performance: result.performance.value,
                         recommendation: result.recommendation,
                         detectedBrand: result.identity.brand,
                         detectedModel: result.identity.model,
                       } as Record<string, unknown>,
                      },
                    }));
                  } else {
                    setDraft((x) => ({ ...x, detecting: false }));
                  }
                }
              } catch {
                setDraft((d) => ({ ...d, detecting: false }));
              }
            }}
            className="mt-3"
            disabled={draft.detecting}
          >
            {draft.detecting ? (<><Sparkles className="h-4 w-4 animate-spin" /> {t.labels.detecting}</>) : (<><Cpu className="h-4 w-4" /> {t.labels.detect}</>)}
          </GoldButton>
          </div>
        </Card>

        {draft.device && (
          <Card className="p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-gold-deep/80">
              {t.deviceInfo.selectedDevice}
            </div>
            <div className="mt-2 text-xl font-bold text-gold-grad">{draft.device.model}</div>
            {draft.detectionInfo && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md bg-[rgba(212,175,55,0.12)] px-2 py-0.5 text-gold-grad">
                  {t.deviceInfo.confidence} {draft.detectionInfo.confidence}%
                </span>
                <span className="rounded-md bg-white/5 px-2 py-0.5 opacity-70">
                  {t.deviceInfo.method}: {draft.detectionInfo.method === "userAgentData"
                    ? t.deviceInfo.userAgentData
                    : draft.detectionInfo.method === "uaFallback"
                      ? t.deviceInfo.uaParsing
                      : draft.detectionInfo.method === "screenHeuristic"
                        ? t.deviceInfo.hardwareHeuristic
                        : draft.detectionInfo.method}
                </span>
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <Kv k={t.deviceInfo.brand} v={draft.device.brand} />
              <Kv k={t.deviceInfo.tier} v={tierLabel(draft.device.tier)} />
              <Kv k={t.deviceInfo.refresh} v={`${draft.device.refreshHz}Hz`} />
              <Kv k={t.deviceInfo.touch} v={`${draft.device.touchHz}Hz`} />
              <Kv k={t.deviceInfo.screen} v={`${draft.device.screenSize}"`} />
              <Kv k={t.deviceInfo.os} v={draft.device.os.toUpperCase()} />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function SystemStep({ draft, setDraft, t }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>>; t: Dict }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={t.labels.os}>
        <div className="flex gap-2">
          {(["android", "ios"] as const).map((o) => (
            <Chip key={o} active={draft.os === o} onClick={() => setDraft((d) => ({ ...d, os: o }))} className="flex-1">
              {o.toUpperCase()}
            </Chip>
          ))}
        </div>
      </Field>
      <Field label={t.labels.fps}>
        <div className="flex flex-wrap gap-2">
          {[20, 30, 40, 45, 60, 90, 120].map((f) => (
            <Chip key={f} active={draft.fps === f} onClick={() => setDraft((d) => ({ ...d, fps: f }))}>
              {f}
            </Chip>
          ))}
        </div>
      </Field>
      <Field label={t.labels.refresh}>
        <div className="flex flex-wrap gap-2">
          {[60, 90, 120, 144, 165].map((r) => (
            <Chip key={r} active={draft.refreshHz === r} onClick={() => setDraft((d) => ({ ...d, refreshHz: r }))}>
              {r}Hz
            </Chip>
          ))}
        </div>
      </Field>
      <Field label={t.labels.touch}>
        <div className="flex flex-wrap gap-2">
          {[120, 240, 360, 480, 720].map((r) => (
            <Chip key={r} active={draft.touchHz === r} onClick={() => setDraft((d) => ({ ...d, touchHz: r }))}>
              {r}Hz
            </Chip>
          ))}
        </div>
      </Field>
    </div>
  );
}

function FingersStep({ draft, setDraft, t }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>>; t: Dict }) {
  const options: { v: 2 | 3 | 4 | 5 | 6; label: string; hint: string }[] = [
    { v: 2, label: "2", hint: t.fingers.f2 },
    { v: 3, label: "3", hint: t.fingers.f3 },
    { v: 4, label: "4", hint: t.fingers.f4 },
    { v: 5, label: "5", hint: t.fingers.f5 },
    { v: 6, label: "6", hint: t.fingers.f6 },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => setDraft((d) => ({ ...d, fingers: o.v }))}
          className={cn(
            "card-glass flex flex-col items-center gap-2 rounded-2xl p-5 transition",
            draft.fingers === o.v && "border-[rgba(247,230,161,0.8)] shadow-[0_0_24px_rgba(212,175,55,0.35)]",
          )}
        >
          <Fingerprint className={cn("h-8 w-8", draft.fingers === o.v ? "text-gold-grad" : "opacity-60")} />
          <div className="text-2xl font-bold text-gold-grad">{o.v}</div>
          <div className="text-xs opacity-70">{o.hint}</div>
        </button>
      ))}
    </div>
  );
}

function GyroStep({ draft, setDraft, t, lang }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>>; t: Dict; lang: Lang }) {
  const options: { v: "off" | "scope" | "always"; label: string; desc: string }[] = [
    { v: "off", label: t.gyros.off, desc: lang === "ar" ? "بدون جيروسكوب" : "No gyro" },
    { v: "scope", label: t.gyros.scope, desc: lang === "ar" ? "جيروسكوب ADS في المنظار فقط" : "ADS gyro only on scopes" },
    { v: "always", label: t.gyros.always, desc: lang === "ar" ? "جيروسكوب دائماً مفعّل" : "Always on gyro" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => setDraft((d) => ({ ...d, gyro: o.v }))}
          className={cn(
            "card-glass flex flex-col items-start gap-2 rounded-2xl p-5 text-start transition",
            draft.gyro === o.v && "border-[rgba(247,230,161,0.8)] shadow-[0_0_24px_rgba(212,175,55,0.35)]",
          )}
        >
          <Layers className={cn("h-7 w-7", draft.gyro === o.v ? "text-gold-grad" : "opacity-60")} />
          <div className="text-lg font-bold">{o.label}</div>
          <div className="text-xs opacity-70">{o.desc}</div>
        </button>
      ))}
    </div>
  );
}

function StyleStep({ draft, setDraft, t, lang }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>>; t: Dict; lang: Lang }) {
  const opts: { v: Input["style"]; icon: React.ReactNode; label: string; desc: string }[] = [
    { v: "aggressive", icon: <Target className="h-5 w-5" />, label: t.playStyles.aggressive, desc: lang === "ar" ? "انعطافات سريعة، قتال قريب" : "Fast flicks, close combat" },
    { v: "rusher", icon: <Zap className="h-5 w-5" />, label: t.playStyles.rusher, desc: lang === "ar" ? "هجوم، دوران عدواني" : "Pushing, aggressive rotations" },
    { v: "balanced", icon: <Gamepad2 className="h-5 w-5" />, label: t.playStyles.balanced, desc: lang === "ar" ? "أداء شامل" : "All-round performance" },
    { v: "support", icon: <Eye className="h-5 w-5" />, label: t.playStyles.support, desc: lang === "ar" ? "دعم، فائدة، متوسط" : "Support, utility, mid-range" },
    { v: "sniper", icon: <Crosshair className="h-5 w-5" />, label: t.playStyles.sniper, desc: lang === "ar" ? "دقة بعيدة" : "Long-range precision" },
    { v: "tdm", icon: <Move className="h-5 w-5" />, label: t.playStyles.tdm, desc: lang === "ar" ? "فرق، معارك قريبة" : "TDM, close quarters" },
    { v: "competitive", icon: <Sparkles className="h-5 w-5" />, label: t.playStyles.competitive, desc: lang === "ar" ? "ضبط جاهز للبطولات" : "Tournament-ready tuning" },
    { v: "entryfrag", icon: <Zap className="h-5 w-5" />, label: t.playStyles.entryfrag, desc: lang === "ar" ? "⚡ أول دخول، عدواني جداً" : "⚡ First entry, ultra-aggressive" },
    { v: "lurker", icon: <Eye className="h-5 w-5" />, label: t.playStyles.lurker, desc: lang === "ar" ? "🥷 تسلل، تصويب صبور" : "🥷 Stealth flanks, patient aim" },
    { v: "igl", icon: <Target className="h-5 w-5" />, label: t.playStyles.igl, desc: lang === "ar" ? "🎖️ قائد استراتيجي متوازن" : "🎖️ Strategic balanced leader" },
    { v: "anchor", icon: <Crosshair className="h-5 w-5" />, label: t.playStyles.anchor, desc: lang === "ar" ? "🛡️ تثبيت المواقع، خطوط نظر طويلة" : "🛡️ Hold positions, long sightlines" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => setDraft((d) => ({ ...d, style: o.v }))}
          className={cn(
            "card-glass flex flex-col items-start gap-2 rounded-2xl p-4 text-start transition",
            draft.style === o.v && "border-[rgba(247,230,161,0.8)] shadow-[0_0_24px_rgba(212,175,55,0.35)]",
          )}
        >
          <span className={cn(draft.style === o.v ? "text-gold-grad" : "opacity-60")}>{o.icon}</span>
          <div className="text-sm font-bold">{o.label}</div>
          <div className="text-xs opacity-70">{o.desc}</div>
        </button>
      ))}
    </div>
  );
}

function SkillStep({ draft, setDraft, t }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>>; t: Dict }) {
  const opts: { v: Input["skill"]; label: string }[] = [
    { v: "beginner", label: t.skills.beginner },
    { v: "intermediate", label: t.skills.intermediate },
    { v: "advanced", label: t.skills.advanced },
    { v: "professional", label: t.skills.professional },
    { v: "conqueror", label: t.skills.conqueror },
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-5">
      {opts.map((o) => (
        <Chip key={o.v} active={draft.skill === o.v} onClick={() => setDraft((d) => ({ ...d, skill: o.v }))} className="py-3 text-sm">
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

function RangeStep({ draft, setDraft, t }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>>; t: Dict }) {
  const opts: { v: Input["range"]; label: string }[] = [
    { v: "close", label: t.ranges.close },
    { v: "mid", label: t.ranges.mid },
    { v: "long", label: t.ranges.long },
    { v: "mixed", label: t.ranges.mixed },
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {opts.map((o) => (
        <Chip key={o.v} active={draft.range === o.v} onClick={() => setDraft((d) => ({ ...d, range: o.v }))} className="py-3 text-sm">
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

function WeaponStep({ draft, setDraft, game, lang }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>>; game: GameId; lang: Lang }) {
  const gameWeapons = useMemo(() => getWeaponsForGame(game), [game]);
  const cats = Array.from(new Set(gameWeapons.map((w) => w.category))) as Weapon["category"][];
  const [cat, setCat] = useState<Weapon["category"]>((cats[0] || "AR") as Weapon["category"]);
  useEffect(() => {
    if (!cats.includes(cat)) setCat((cats[0] || "AR") as Weapon["category"]);
  }, [game, cat, cats]);
  const filtered = gameWeapons.filter((w) => w.category === cat);
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-white/[0.02] px-3 py-2 text-xs opacity-75">
        {lang === "ar" ? `الأسلحة المتاحة لهذه اللعبة: ${gameWeapons.length}` : `Available weapons for this game: ${gameWeapons.length}`}
      </div>
      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
            {c}
          </Chip>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((w) => (
          <button
            key={w.id}
            onClick={() => setDraft((d) => ({ ...d, weapon: w }))}
            className={cn(
              "card-glass flex items-center justify-between rounded-xl p-3 text-sm transition",
              draft.weapon?.id === w.id && "border-[rgba(247,230,161,0.8)] shadow-[0_0_20px_rgba(212,175,55,0.35)]",
            )}
          >
            <span className="font-semibold">{w.name}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-60">{w.category}{w.ammo ? ` • ${w.ammo}` : ""}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AttachmentsStep({
  draft,
  setDraft,
  t,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  t: Dict;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={t.labels.grip}>
        <div className="flex flex-wrap gap-2">
          {GRIPS.map((g) => (
            <Chip key={g.id} active={draft.grip === g.id} onClick={() => setDraft((d) => ({ ...d, grip: g.id }))}>
              {g.name}
            </Chip>
          ))}
        </div>
      </Field>
      <Field label={t.labels.muzzle}>
        <div className="flex flex-wrap gap-2">
          {MUZZLES.map((m) => (
            <Chip key={m.id} active={draft.muzzle === m.id} onClick={() => setDraft((d) => ({ ...d, muzzle: m.id }))}>
              {m.name}
            </Chip>
          ))}
        </div>
      </Field>
      <Field label={t.labels.mag}>
        <div className="flex flex-wrap gap-2">
          {MAGS.map((m) => (
            <Chip key={m.id} active={draft.mag === m.id} onClick={() => setDraft((d) => ({ ...d, mag: m.id }))}>
              {m.name}
            </Chip>
          ))}
        </div>
      </Field>
      <Field label={t.labels.stock}>
        <div className="flex flex-wrap gap-2">
          {STOCKS.map((s) => (
            <Chip key={s.id} active={draft.stock === s.id} onClick={() => setDraft((d) => ({ ...d, stock: s.id }))}>
              {s.name}
            </Chip>
          ))}
        </div>
      </Field>
    </div>
  );
}

function PriorityStep({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {(["headshot", "recoil", "tracking", "balanced", "competitive"] as const).map((p) => (
        <Chip
          key={p}
          active={draft.priority === p}
          onClick={() => setDraft((d) => ({ ...d, priority: p }))}
          className="py-3 text-sm capitalize"
        >
          {p}
        </Chip>
      ))}
    </div>
  );
}

function SpeedStep({ draft, setDraft, t }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>>; t: Dict }) {
  const normalPercent = ((draft.normalSpeed - 1) / 14) * 100;
  const gyroPercent = ((draft.gyroSpeed - 1) / 14) * 100;
  
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <div className="text-sm font-semibold text-gold-grad">{t.labels.normalSpeed}</div>
          <div className="text-3xl font-black text-gold-grad">{draft.normalSpeed}</div>
        </div>
        <input
          type="range"
          min={1}
          max={15}
          step={1}
          value={draft.normalSpeed}
          onChange={(e) => setDraft((d) => ({ ...d, normalSpeed: Number(e.target.value) }))}
          className="gold-range w-full"
          style={{
            background: `linear-gradient(90deg, rgba(212, 175, 55, 0.9) 0%, rgba(212, 175, 55, 0.9) ${normalPercent}%, rgba(212, 175, 55, 0.15) ${normalPercent}%, rgba(212, 175, 55, 0.15) 100%)`,
          }}
        />
        <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider opacity-60">
          <span>1 {t.speedLabels.ultraStable}</span>
          <span>8 {t.speedLabels.balanced}</span>
          <span>15 {t.speedLabels.maxSpeed}</span>
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <div className="text-sm font-semibold text-gold-grad">{t.labels.gyroSpeed}</div>
          <div className="text-3xl font-black text-gold-grad">{draft.gyroSpeed}</div>
        </div>
        <input
          type="range"
          min={1}
          max={15}
          step={1}
          value={draft.gyroSpeed}
          onChange={(e) => setDraft((d) => ({ ...d, gyroSpeed: Number(e.target.value) }))}
          className="gold-range w-full"
          style={{
            background: `linear-gradient(90deg, rgba(212, 175, 55, 0.9) 0%, rgba(212, 175, 55, 0.9) ${gyroPercent}%, rgba(212, 175, 55, 0.15) ${gyroPercent}%, rgba(212, 175, 55, 0.15) 100%)`,
          }}
        />
        <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider opacity-60">
          <span>1 {t.speedLabels.ultraStable}</span>
          <span>8 {t.speedLabels.balanced}</span>
          <span>15 {t.speedLabels.maxSpeed}</span>
        </div>
      </div>
    </div>
  );
}

// ========= Result view =========

function ResultView({
  profile,
  device,
  weapon,
  t,
  lang,
  copied,
  onCopy,
  onDownload,
  onPDF,
  onReset,
  onSaveRequest,
}: {
  profile: SensitivityProfile;
  device: Device;
  weapon: Weapon;
  t: Dict;
  lang: Lang;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onPDF: () => void;
  onReset: () => void;
  onSaveRequest: () => void;
}) {
  const scopes: { k: keyof typeof profile.camera; label: string }[] = [
    { k: "tpp", label: t.scopes.tpp },
    { k: "fpp", label: t.scopes.fpp },
    { k: "red", label: t.scopes.red },
    { k: "s2", label: t.scopes.s2 },
    { k: "s3", label: t.scopes.s3 },
    { k: "s4", label: t.scopes.s4 },
    { k: "s6", label: t.scopes.s6 },
    { k: "s8", label: t.scopes.s8 },
  ];

  return (
    <div className="space-y-6 fade-up">
      {/* Header */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-deep/80">
              {t.result.title}
            </div>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              <span className="text-gold-grad">{device.model}</span>
              <span className="mx-2 opacity-30">•</span>
              <span className="text-white theme-light:text-neutral-900">{weapon.name}</span>
            </h2>
            <p className="mt-1 text-sm opacity-70">{t.result.sub}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <GhostButton onClick={onCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? t.labels.copied : t.labels.copy}
            </GhostButton>
            <GhostButton onClick={onDownload}>
              <Download className="h-4 w-4" /> JSON
            </GhostButton>
            <GoldButton onClick={onPDF}>
              <Download className="h-4 w-4" /> PDF
            </GoldButton>
            <GhostButton onClick={onSaveRequest}>
              <Save className="h-4 w-4" /> {t.labels.save}
            </GhostButton>
            <GoldButton onClick={onReset}>
              <ArrowLeft className="h-4 w-4 rtl-flip" /> {t.labels.reset}
            </GoldButton>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Stat label={t.result.dnaLabel} value={profile.dna} />
          <Stat label={t.result.confidence} value={`${profile.confidence}%`} />
          <Stat label={t.result.tier} value={tierLabel(device.tier)} sub={device.brand} />
          <Stat
            label={t.labels.control}
            value={`${profile.control.movementSize}%`}
            sub={`TPP ${profile.control.tppView}% • FPP ${profile.control.fppView}%`}
          />
        </div>
      </Card>

      {/* Free look */}
      <Card className="p-5 sm:p-6">
        <SectionHeader icon={<Eye className="h-4 w-4" />} title={t.sections.freeLook} />
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Kv k="TPP" v={String(profile.freeLook.tpp)} />
          <Kv k="FPP" v={String(profile.freeLook.fpp)} />
          <Kv k={t.scopes.parachuting} v={String(profile.freeLook.parachuting)} />
        </div>
      </Card>

      {/* 4 main sections */}
      {[
        { k: "camera", label: t.sections.camera, data: profile.camera },
        { k: "ads", label: t.sections.ads, data: profile.ads },
        { k: "gyro", label: t.sections.gyro, data: profile.gyro },
        { k: "adsGyro", label: t.sections.adsGyro, data: profile.adsGyro },
      ].map((s) => (
        <Card key={s.k} className="p-5 sm:p-6">
          <SectionHeader icon={<Crosshair className="h-4 w-4" />} title={s.label} />
          <div className="mt-3 overflow-hidden rounded-xl border border-[rgba(212,175,55,0.15)]">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-[10px] uppercase tracking-wider opacity-70 theme-light:bg-black/5">
                <tr>
                  <th className="px-3 py-2 text-start">Scope</th>
                  <th className="px-3 py-2 text-end">Value</th>
                  <th className="hidden px-3 py-2 text-start sm:table-cell">Bar</th>
                </tr>
              </thead>
              <tbody>
                {scopes.map((sc) => {
                  const v = s.data[sc.k];
                  const max = s.k === "camera" || s.k === "ads" ? 200 : 400;
                  return (
                    <tr key={sc.k} className="gold-row border-t border-[rgba(212,175,55,0.08)]">
                      <td className="px-3 py-2.5 font-medium">{sc.label}</td>
                      <td className="px-3 py-2.5 text-end font-bold text-gold-grad">{v}</td>
                      <td className="hidden px-3 py-2.5 sm:table-cell">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full bg-gold-grad"
                            style={{ width: `${Math.min(100, (v / max) * 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      {/* Control optimization */}
      <Card className="p-5 sm:p-6">
        <SectionHeader icon={<Move className="h-4 w-4" />} title={t.labels.control} />
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          <Kv k={t.controls.movementSize} v={`${profile.control.movementSize}%`} />
          <Kv k={t.controls.tppView} v={`${profile.control.tppView}%`} />
          <Kv k={t.controls.fppView} v={`${profile.control.fppView}%`} />
          <Kv k={t.controls.sprintSens} v={`${profile.control.sprintSens}%`} />
        </div>
      </Card>

      {/* AI Recommendations */}
      {profile.recommendations && profile.recommendations.length > 0 && (
        <Card className="p-5 sm:p-6">
          <SectionHeader icon={<Sparkles className="h-4 w-4" />} title={lang === "ar" ? "توصيات الذكاء الاصطناعي" : "AI Recommendations"} />
          <div className="mt-3 space-y-2">
            {profile.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-[rgba(212,175,55,0.15)] bg-white/[0.02] p-3">
                <div className="mt-0.5 text-gold-grad">💡</div>
                <div className="text-sm opacity-90">{rec}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-gold-grad text-[#1a1612]">{icon}</span>
      <h3 className="text-lg font-bold text-gold-grad">{title}</h3>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-md p-6">{children}</Card>
    </div>
  );
}
