import { useEffect, useMemo, useState } from "react";
import { Crosshair as CrosshairIcon, Download } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { Card, Field, GoldButton, GhostButton } from "./ui";
import { cn } from "../utils/cn";

type Props = { lang: Lang };

type ChStyle = "classic" | "dot" | "circle" | "cross" | "tactical" | "sniper" | "arrow";

type CrosshairSettings = {
  color: string;
  style: ChStyle;
  size: number;
  gap: number;
  thick: number;
  opacity: number;
  dot: boolean;
  outline: boolean;
};

const CH_COLORS = ["#00ff00", "#00ffff", "#ff00ff", "#ffff00", "#ff3838", "#ffffff", "#d4af37", "#ff6b00"];
const CH_STYLES: { id: ChStyle; en: string; ar: string }[] = [
  { id: "classic", en: "Classic", ar: "كلاسيكي" },
  { id: "dot", en: "Dot only", ar: "نقطة فقط" },
  { id: "circle", en: "Circle", ar: "دائرة" },
  { id: "cross", en: "Cross +", ar: "صليب +" },
  { id: "tactical", en: "Tactical", ar: "تكتيكي" },
  { id: "sniper", en: "Sniper", ar: "قنّاص" },
  { id: "arrow", en: "Arrow", ar: "أسهم" },
];

const STORAGE_KEY = "alyazouri_crosshair_v4";

const DEFAULT: CrosshairSettings = {
  color: "#00ff00",
  style: "classic",
  size: 16,
  gap: 6,
  thick: 2,
  opacity: 100,
  dot: false,
  outline: true,
};

export function CrosshairBuilder({ lang }: Props) {
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const [ch, setCh] = useState<CrosshairSettings>(DEFAULT);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCh({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ch));
    } catch {}
  }, [ch]);

  const svg = useMemo(() => buildCrosshairSVG(ch, false), [ch]);
  const svgFile = useMemo(() => buildCrosshairSVG(ch, true), [ch]);

  const set = <K extends keyof CrosshairSettings>(k: K, v: CrosshairSettings[K]) =>
    setCh((s) => ({ ...s, [k]: v }));

  const exportSVG = () => {
    const blob = new Blob([svgFile], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alyazouri-crosshair-${Date.now()}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 via-yellow-500 to-amber-700 grid place-items-center text-black flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <CrosshairIcon size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-black gold-text">
              {t("Crosshair Builder", "بانية صليب التصويب")}
            </h2>
            <p className="text-sm text-amber-200/60 mt-1">
              {t(
                "Design a custom crosshair with pro colors & shapes",
                "صمّم صليب تصويب مخصصاً بألوان وأشكال احترافية"
              )}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <Field label={t("Color", "اللون")}>
              <div className="flex flex-wrap gap-2">
                {CH_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => set("color", c)}
                    className={cn(
                      "w-9 h-9 rounded-full border-2 transition-all",
                      ch.color === c
                        ? "scale-110 ring-2 ring-offset-2 ring-offset-black ring-yellow-400"
                        : "border-white/20 hover:scale-105"
                    )}
                    style={{ background: c, borderColor: c }}
                    aria-label={c}
                  />
                ))}
              </div>
            </Field>

            <Field label={t("Style", "الشكل")}>
              <div className="flex flex-wrap gap-2">
                {CH_STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => set("style", s.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                      ch.style === s.id
                        ? "bg-gradient-to-r from-amber-400 to-yellow-600 text-black border-yellow-600"
                        : "bg-white/5 border-yellow-500/15 text-amber-200/70 hover:bg-yellow-500/10"
                    )}
                  >
                    {lang === "ar" ? s.ar : s.en}
                  </button>
                ))}
              </div>
            </Field>

            <Slider label={t("Size", "الحجم")} value={ch.size} min={4} max={40} onChange={(v) => set("size", v)} />
            <Slider label={t("Gap", "الفجوة")} value={ch.gap} min={0} max={20} onChange={(v) => set("gap", v)} />
            <Slider label={t("Thickness", "السمك")} value={ch.thick} min={1} max={6} onChange={(v) => set("thick", v)} />
            <Slider label={t("Opacity", "الشفافية")} value={ch.opacity} min={20} max={100} onChange={(v) => set("opacity", v)} />

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-yellow-500/15">
              <span className="text-sm font-bold">{t("Center dot", "نقطة وسطية")}</span>
              <Toggle on={ch.dot} onChange={() => set("dot", !ch.dot)} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-yellow-500/15">
              <span className="text-sm font-bold">{t("Outline", "إطار")}</span>
              <Toggle on={ch.outline} onChange={() => set("outline", !ch.outline)} />
            </div>
          </div>

          {/* Preview */}
          <div>
            <div
              className="aspect-square max-w-[360px] mx-auto rounded-2xl border-2 border-yellow-500/30 grid place-items-center"
              style={{ background: "radial-gradient(circle, #1f1f1f, #0a0a0a)" }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <div className="flex gap-2 justify-center mt-4">
              <GhostButton onClick={() => setCh(DEFAULT)}>
                {t("Reset", "إعادة")}
              </GhostButton>
              <GoldButton onClick={exportSVG}>
                <Download size={14} />
                {t("Export SVG", "تصدير SVG")}
              </GoldButton>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative w-12 h-7 rounded-full transition-all",
        on ? "bg-gradient-to-r from-amber-400 to-yellow-600" : "bg-white/10"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 w-6 h-6 rounded-full transition-all duration-200",
          on ? "left-[22px] bg-black" : "left-0.5 bg-white"
        )}
      />
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-yellow-500/15">
      <label className="text-sm font-bold flex-1">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="gold-range flex-1"
      />
      <div className="w-12 text-center font-black text-yellow-300" style={{ fontFamily: "Orbitron,sans-serif" }}>
        {value}
      </div>
    </div>
  );
}

function buildCrosshairSVG(ch: CrosshairSettings, asFile: boolean): string {
  const sz = 320;
  const c = sz / 2;
  const col = ch.color;
  const opa = ch.opacity / 100;
  const len = ch.size;
  const gap = ch.gap;
  let lines = "";

  const armLines = [
    `M${c} ${c - gap - len} L${c} ${c - gap}`,
    `M${c} ${c + gap} L${c} ${c + gap + len}`,
    `M${c - gap - len} ${c} L${c - gap} ${c}`,
    `M${c + gap} ${c} L${c + gap + len} ${c}`,
  ];

  if (ch.style === "classic" || ch.style === "cross" || ch.style === "tactical") {
    if (ch.outline) {
      lines += armLines
        .map(
          (d) =>
            `<path d="${d}" stroke="#000" stroke-width="${ch.thick + 1.5}" stroke-linecap="round" opacity="${opa}"/>`
        )
        .join("");
    }
    lines += armLines
      .map(
        (d) =>
          `<path d="${d}" stroke="${col}" stroke-width="${ch.thick}" stroke-linecap="round" opacity="${opa}"/>`
      )
      .join("");
  } else if (ch.style === "circle") {
    if (ch.outline) {
      lines += `<circle cx="${c}" cy="${c}" r="${len}" fill="none" stroke="#000" stroke-width="${ch.thick + 1.5}" opacity="${opa}"/>`;
    }
    lines += `<circle cx="${c}" cy="${c}" r="${len}" fill="none" stroke="${col}" stroke-width="${ch.thick}" opacity="${opa}"/>`;
  } else if (ch.style === "sniper") {
    lines += `<path d="M${c} ${c - len} L${c} ${c + len}" stroke="${col}" stroke-width="${ch.thick}" opacity="${opa}"/>`;
    lines += `<path d="M${c - len} ${c} L${c + len} ${c}" stroke="${col}" stroke-width="${ch.thick}" opacity="${opa}"/>`;
    lines += `<circle cx="${c}" cy="${c}" r="${len * 0.6}" fill="none" stroke="${col}" stroke-width="${ch.thick}" opacity="${opa * 0.7}"/>`;
  } else if (ch.style === "arrow") {
    lines += `<path d="M${c} ${c - len} L${c - len * 0.4} ${c - gap} L${c + len * 0.4} ${c - gap} Z" fill="${col}" opacity="${opa}"/>`;
    lines += `<path d="M${c} ${c + len} L${c - len * 0.4} ${c + gap} L${c + len * 0.4} ${c + gap} Z" fill="${col}" opacity="${opa}"/>`;
  }

  if (ch.dot || ch.style === "dot") {
    lines += `<circle cx="${c}" cy="${c}" r="${ch.thick + 1}" fill="${col}" opacity="${opa}"/>`;
  }

  const bg = asFile ? `<rect width="${sz}" height="${sz}" fill="#1a1a1a"/>` : "";
  return `<svg width="100%" height="100%" viewBox="0 0 ${sz} ${sz}" xmlns="http://www.w3.org/2000/svg">${bg}${lines}</svg>`;
}
