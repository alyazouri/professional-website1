import { useEffect, useState, useMemo, useCallback } from "react";
import { Search, Crosshair, Film, Sun, Globe, Sparkles, Save, Download, X } from "lucide-react";
import { cn } from "../utils/cn";

type Command = {
  id: string;
  en: { label: string; sub?: string };
  ar: { label: string; sub?: string };
  icon: React.ReactNode;
  keywords: string[];
  action: () => void;
};

export function CommandPalette({
  open,
  onClose,
  lang,
  onSwitchTab,
  onToggleLang,
  onToggleTheme,
  onExportPDF,
  onExportJSON,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  lang: "en" | "ar";
  onSwitchTab: (t: "generator" | "studio") => void;
  onToggleLang: () => void;
  onToggleTheme: () => void;
  onExportPDF?: () => void;
  onExportJSON?: () => void;
  onSave?: () => void;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const commands: Command[] = useMemo(
    () => [
      {
        id: "go-gen",
        en: { label: "Go to Generator", sub: "Switch tab" },
        ar: { label: "الذهاب للمولّد", sub: "تبديل التبويب" },
        icon: <Crosshair className="h-4 w-4" />,
        keywords: ["generator", "sensitivity", "go", "tab"],
        action: () => onSwitchTab("generator"),
      },
      {
        id: "go-stu",
        en: { label: "Go to Video Studio", sub: "Switch tab" },
        ar: { label: "الذهاب لاستوديو الفيديو", sub: "تبديل التبويب" },
        icon: <Film className="h-4 w-4" />,
        keywords: ["studio", "video", "go", "tab"],
        action: () => onSwitchTab("studio"),
      },
      {
        id: "lang",
        en: { label: "Toggle Language", sub: "AR / EN" },
        ar: { label: "تبديل اللغة", sub: "AR / EN" },
        icon: <Globe className="h-4 w-4" />,
        keywords: ["language", "arabic", "english", "translate", "lang"],
        action: onToggleLang,
      },
      {
        id: "theme",
        en: { label: "Toggle Theme", sub: "Dark / Light" },
        ar: { label: "تبديل المظهر", sub: "داكن / فاتح" },
        icon: <Sun className="h-4 w-4" />,
        keywords: ["theme", "dark", "light", "mode"],
        action: onToggleTheme,
      },
      {
        id: "save",
        en: { label: "Save Profile", sub: "Save current sensitivity" },
        ar: { label: "حفظ الملف", sub: "حفظ الحساسية الحالية" },
        icon: <Save className="h-4 w-4" />,
        keywords: ["save", "profile", "store"],
        action: onSave || (() => {}),
      },
      {
        id: "pdf",
        en: { label: "Download PDF", sub: "Export sensitivity report" },
        ar: { label: "تحميل PDF", sub: "تصدير تقرير الحساسية" },
        icon: <Download className="h-4 w-4" />,
        keywords: ["pdf", "download", "export", "report"],
        action: onExportPDF || (() => {}),
      },
      {
        id: "json",
        en: { label: "Download JSON", sub: "Export as JSON" },
        ar: { label: "تحميل JSON", sub: "تصدير كملف JSON" },
        icon: <Download className="h-4 w-4" />,
        keywords: ["json", "download", "export", "data"],
        action: onExportJSON || (() => {}),
      },
      {
        id: "ai",
        en: { label: "AI Sensitivity Engine", sub: "Powered by V2" },
        ar: { label: "محرك الذكاء الاصطناعي", sub: "مدعوم بـ V2" },
        icon: <Sparkles className="h-4 w-4" />,
        keywords: ["ai", "engine", "intelligence", "smart"],
        action: () => {},
      },
    ],
    [onSwitchTab, onToggleLang, onToggleTheme, onSave, onExportPDF, onExportJSON],
  );

  const filtered = useMemo(() => {
    if (!q) return commands;
    const ql = q.toLowerCase();
    return commands.filter((c) => {
      const text = `${c.en.label} ${c.en.sub || ""} ${c.ar.label} ${c.ar.sub || ""} ${c.keywords.join(" ")}`.toLowerCase();
      return text.includes(ql);
    });
  }, [q, commands]);

  useEffect(() => { setActive(0); }, [q]);

  const run = useCallback(
    (cmd: Command) => {
      cmd.action();
      onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[active]) run(filtered[active]);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, active, run, onClose]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.3)] bg-black/95 shadow-[0_0_60px_rgba(212,175,55,0.2)]">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search className="h-5 w-5 text-gold-grad" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={lang === "ar" ? "ابحث عن أمر..." : "Search commands..."}
            className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
            autoFocus
          />
          <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-[10px] opacity-50">ESC</kbd>
          <button onClick={onClose} className="opacity-50 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm opacity-50">
              {lang === "ar" ? "لا توجد نتائج" : "No results"}
            </div>
          ) : (
            filtered.map((c, i) => (
              <button
                key={c.id}
                onClick={() => run(c)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition",
                  active === i ? "bg-gold-grad/15" : "hover:bg-white/5",
                )}
              >
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", active === i ? "bg-gold-grad text-[#1a1612]" : "bg-white/5")}>
                  {c.icon}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold">
                    {lang === "ar" ? c.ar.label : c.en.label}
                  </div>
                  {c.en.sub && (
                    <div className="text-[11px] opacity-50">
                      {lang === "ar" ? c.ar.sub : c.en.sub}
                    </div>
                  )}
                </div>
                {active === i && (
                  <span className="text-[10px] font-mono opacity-50">↵</span>
                )}
              </button>
            ))
          )}
        </div>
        <div className="border-t border-white/10 px-4 py-2 text-[10px] opacity-50 flex items-center gap-3">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
}
