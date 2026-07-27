import { useMemo, useState } from "react";
import { Crown, Sparkles, Filter } from "lucide-react";
import { PROS, type ProPlayer } from "../lib/pros";
import { GAMES, type GameId } from "../lib/games";
import type { Lang } from "../lib/i18n";
import { cn } from "../utils/cn";
import { Card, GoldButton } from "./ui";

type Props = {
  lang: Lang;
  onApply: (pro: ProPlayer) => void;
};

const FILTER_LABELS: { id: GameId | "all"; emoji: string }[] = [
  { id: "all", emoji: "⭐" },
  { id: "pubgm_global", emoji: "🌍" },
  { id: "bgmi", emoji: "🇮🇳" },
  { id: "newstate", emoji: "🚀" },
  { id: "codm", emoji: "🪖" },
  { id: "freefire", emoji: "🔥" },
  { id: "apex", emoji: "🦾" },
  { id: "delta", emoji: "⚡" },
  { id: "warzone", emoji: "🎖️" },
];

export function ProPresets({ lang, onApply }: Props) {
  const [filter, setFilter] = useState<GameId | "all">("all");
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  const list = useMemo(
    () => (filter === "all" ? PROS : PROS.filter((p) => p.game === filter)),
    [filter]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="relative overflow-hidden">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 via-yellow-500 to-yellow-700 grid place-items-center text-black flex-shrink-0 shadow-lg shadow-yellow-500/30">
            <Crown size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-black gold-text">
              {t("Pro Player Presets", "إعدادات المحترفين")}
            </h2>
            <p className="text-sm text-amber-200/60 mt-1">
              {t(
                "Apply the sensitivity of 34 world-class pros in one click",
                "طبّق حساسية 34 محترفاً عالمياً بضغطة واحدة"
              )}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-amber-200/60" />
          {FILTER_LABELS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                filter === f.id
                  ? "bg-gradient-to-r from-amber-400 to-yellow-600 text-black border-yellow-600 shadow-md shadow-yellow-500/30"
                  : "bg-white/5 border-yellow-500/15 text-amber-200/70 hover:bg-yellow-500/10"
              )}
            >
              <span className="mr-1">{f.emoji}</span>
              {f.id === "all"
                ? t("All", "الكل")
                : lang === "ar"
                ? GAMES[f.id].nameAr
                : GAMES[f.id].name}
            </button>
          ))}
        </div>
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {list.map((p) => (
          <ProCard key={p.id} pro={p} lang={lang} onApply={onApply} />
        ))}
      </div>

      {list.length === 0 && (
        <Card>
          <p className="text-center text-amber-200/60 py-8">
            {t("No pros found for this game", "لا يوجد محترفون لهذه اللعبة بعد")}
          </p>
        </Card>
      )}
    </div>
  );
}

function ProCard({
  pro,
  lang,
  onApply,
}: {
  pro: ProPlayer;
  lang: Lang;
  onApply: (p: ProPlayer) => void;
}) {
  const game = GAMES[pro.game];
  return (
    <div className="relative p-5 rounded-2xl border-2 border-yellow-500/15 bg-gradient-to-br from-white/5 to-yellow-500/[0.02] hover:border-yellow-500/40 hover:shadow-lg hover:shadow-yellow-500/10 transition-all group overflow-hidden">
      <div className="absolute -top-12 -right-8 w-40 h-40 rounded-full bg-yellow-500/10 blur-3xl group-hover:bg-yellow-500/20 transition-all" />
      <div className="relative">
        <div className="text-2xl mb-2">{pro.flag}</div>
        <div className="font-black text-lg gold-text" style={{ fontFamily: "Orbitron,Cairo,sans-serif" }}>
          {pro.name}
        </div>
        <div className="text-xs text-amber-200/60 font-semibold tracking-wide mt-0.5">
          {pro.team}
        </div>
        <div className="text-[10px] text-amber-300/80 font-bold uppercase tracking-widest mt-2 flex items-center gap-1">
          <span>{game.emoji}</span>
          <span>{lang === "ar" ? game.nameAr : game.name}</span>
        </div>
        <div className="text-xs text-amber-200/50 mt-3 min-h-[32px] leading-relaxed">
          {pro.note[lang]}
        </div>
        <GoldButton
          onClick={() => onApply(pro)}
          className="w-full mt-4 !py-2 !text-xs"
        >
          <Sparkles size={14} />
          {lang === "ar" ? "تطبيق" : "Apply"}
        </GoldButton>
      </div>
    </div>
  );
}
