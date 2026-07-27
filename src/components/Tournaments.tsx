import { Trophy, Sparkles } from "lucide-react";
import { TOURNAMENTS, type Tournament } from "../lib/tournaments";
import { GAMES } from "../lib/games";
import type { Lang } from "../lib/i18n";
import { Card, GoldButton } from "./ui";

type Props = {
  lang: Lang;
  onApply: (t: Tournament) => void;
};

export function Tournaments({ lang, onApply }: Props) {
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 via-yellow-500 to-yellow-700 grid place-items-center text-black flex-shrink-0 shadow-lg shadow-yellow-500/30">
            <Trophy size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-black gold-text">
              {t("Pro Tournament Settings", "إعدادات البطولات الاحترافية")}
            </h2>
            <p className="text-sm text-amber-200/60 mt-1">
              {t(
                "Sensitivities certified for the world's biggest tournaments",
                "حساسيات معتمدة في أكبر بطولات العالم"
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {TOURNAMENTS.map((tour) => (
            <TournamentCard key={tour.id} tour={tour} lang={lang} onApply={onApply} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function TournamentCard({
  tour,
  lang,
  onApply,
}: {
  tour: Tournament;
  lang: Lang;
  onApply: (t: Tournament) => void;
}) {
  const game = GAMES[tour.game];
  return (
    <div className="relative p-5 rounded-2xl border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-500/[0.02] overflow-hidden hover:border-yellow-500/60 transition-all">
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-yellow-500/20 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="text-3xl mb-3">{tour.emoji}</div>
        <h3 className="text-lg font-black gold-text" style={{ fontFamily: "Orbitron,Cairo,sans-serif" }}>
          {tour.name}
        </h3>
        <div
          className="text-[10px] font-black tracking-widest text-yellow-300 mt-2 mb-3"
          style={{ fontFamily: "Orbitron,sans-serif" }}
        >
          {lang === "ar" ? "جائزة البطولة" : "PRIZE POOL"} · {tour.prize}
        </div>
        <p className="text-xs text-amber-200/60 leading-relaxed min-h-[40px]">
          {tour.desc[lang]}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="px-2 py-1 bg-black/30 border border-yellow-500/20 rounded-md text-[10px] text-amber-200/80">
            {game.emoji} {lang === "ar" ? game.nameAr : game.name}
          </span>
          {tour.gyro && (
            <span className="px-2 py-1 bg-black/30 border border-yellow-500/20 rounded-md text-[10px] text-amber-200/80">
              📐 GYRO
            </span>
          )}
        </div>
        <GoldButton onClick={() => onApply(tour)} className="w-full mt-4 !py-2 !text-xs">
          <Sparkles size={14} />
          {lang === "ar" ? "تطبيق إعدادات البطولة" : "Apply Tournament Settings"}
        </GoldButton>
      </div>
    </div>
  );
}
