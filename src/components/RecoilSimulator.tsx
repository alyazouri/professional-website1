import { useMemo, useRef, useState } from "react";
import { Target, Play } from "lucide-react";
import { WEAPONS, GRIPS, MUZZLES, STOCKS, getOptimizedRecoil, type Weapon } from "../lib/weapons";
import type { GameId } from "../lib/games";
import type { Lang } from "../lib/i18n";
import { Card, Field, Select, GoldButton } from "./ui";
import { cn } from "../utils/cn";

type Props = {
  lang: Lang;
  /** current game to filter weapons (defaults to PUBG family) */
  game?: GameId;
};

export function RecoilSimulator({ lang, game = "pubgm_global" }: Props) {
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  // Filter weapons available for this game and that benefit from recoil sim (no shotguns / single-shot snipers)
  const availableWeapons = useMemo(
    () =>
      WEAPONS.filter(
        (w) =>
          (!w.games || w.games.includes(game)) &&
          ["AR", "SMG", "LMG", "DMR"].includes(w.category)
      ),
    [game]
  );

  const [weaponId, setWeaponId] = useState<string>(availableWeapons[0]?.id ?? "m416");
  const [gripId, setGripId] = useState("vertical");
  const [muzzleId, setMuzzleId] = useState("comp");
  const [stockId, setStockId] = useState("tac");
  const [shots, setShots] = useState(0);
  const trailRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<HTMLDivElement>(null);

  const weapon: Weapon = useMemo(
    () => availableWeapons.find((w) => w.id === weaponId) ?? availableWeapons[0],
    [weaponId, availableWeapons]
  );

  const stats = useMemo(
    () => getOptimizedRecoil(weapon, gripId, muzzleId, stockId),
    [weapon, gripId, muzzleId, stockId]
  );

  const simulate = () => {
    const trail = trailRef.current;
    const sim = simRef.current;
    if (!trail || !sim) return;
    const totalShots = 30;
    let i = 0;
    setShots(0);
    let cx = 0, cy = 0;
    trail.style.transition = "none";
    trail.style.transform = "translate(-50%, -50%)";

    const fire = () => {
      if (i >= totalShots) {
        // burst end: animate back to centre
        trail.style.transition = "transform .6s ease";
        trail.style.transform = "translate(-50%, -50%)";
        return;
      }
      const vy = -(stats.vert * 8) - Math.random() * 2;
      const vx = (Math.random() - 0.5) * stats.horiz * 14;
      cx += vx; cy += vy;
      trail.style.transition = "transform .04s linear";
      trail.style.transform = `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px))`;

      // bullet impact
      const imp = document.createElement("div");
      imp.style.cssText = `
        position:absolute; width:6px; height:6px; border-radius:50%;
        background: radial-gradient(circle, #ffe680, #d4af37);
        box-shadow: 0 0 8px #d4af37;
        left: calc(50% + ${cx}px); top: calc(50% + ${cy}px);
        transform: translate(-50%, -50%);
        pointer-events: none;
      `;
      imp.animate(
        [
          { opacity: 1, transform: "translate(-50%,-50%) scale(.5)" },
          { opacity: 0, transform: "translate(-50%,-50%) scale(1.4)" },
        ],
        { duration: 800, fill: "forwards" }
      );
      sim.appendChild(imp);
      setTimeout(() => imp.remove(), 850);

      i++;
      setShots(i);
      setTimeout(fire, 70 - weapon.fireRate * 20);
    };
    setTimeout(fire, 100);
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 via-amber-500 to-yellow-700 grid place-items-center text-black flex-shrink-0 shadow-lg shadow-red-500/30">
            <Target size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-black gold-text">
              {t("Recoil Simulator", "محاكي الارتداد")}
            </h2>
            <p className="text-sm text-amber-200/60 mt-1">
              {t(
                "Train your eyes on each weapon's recoil pattern",
                "تدرّب على نمط ارتداد كل سلاح بصرياً"
              )}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <Field label={t("Weapon", "السلاح")}>
              <Select value={weaponId} onChange={(e) => setWeaponId(e.target.value)}>
                {availableWeapons.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.category})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("Grip", "القبضة")}>
              <Select value={gripId} onChange={(e) => setGripId(e.target.value)}>
                {GRIPS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {lang === "ar" ? g.nameAr : g.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("Muzzle", "الكاتم")}>
              <Select value={muzzleId} onChange={(e) => setMuzzleId(e.target.value)}>
                {MUZZLES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {lang === "ar" ? m.nameAr : m.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("Stock", "الأخمص")}>
              <Select value={stockId} onChange={(e) => setStockId(e.target.value)}>
                {STOCKS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {lang === "ar" ? s.nameAr : s.name}
                  </option>
                ))}
              </Select>
            </Field>

            <StatBar label={t("Vertical Recoil", "ارتداد عمودي")} value={stats.vert} />
            <StatBar label={t("Horizontal Recoil", "ارتداد أفقي")} value={stats.horiz} />
            <StatBar label={t("Stability", "الثبات")} value={stats.stab} positive />
            <StatBar label={t("Fire Rate", "معدل الإطلاق")} value={stats.fire} positive />

            <GoldButton onClick={simulate} className="w-full">
              <Play size={16} />
              {t("Simulate Burst", "محاكاة الإطلاق")} {shots > 0 && `(${shots}/30)`}
            </GoldButton>
          </div>

          {/* Sim screen */}
          <div>
            <div
              ref={simRef}
              className="aspect-square max-w-[400px] mx-auto rounded-2xl border-2 border-yellow-500/30 relative overflow-hidden"
              style={{
                background: "radial-gradient(circle, #1a1a1a 0%, #050505 100%)",
              }}
            >
              {/* Grid */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(212,175,55,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,.08) 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />
              {/* Crosshair */}
              <div className="absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-yellow-300 shadow-[0_0_8px_#d4af37] -translate-y-1/2" />
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-yellow-300 shadow-[0_0_8px_#d4af37] -translate-x-1/2" />
              </div>
              {/* Trail */}
              <div
                ref={trailRef}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_12px_#ff3838] -translate-x-1/2 -translate-y-1/2"
              />
            </div>
            <p className="text-center text-xs text-amber-200/50 mt-3 px-4 leading-relaxed">
              {t(
                "Drag down at the same rate as the weapon's vertical recoil to control sprays",
                "اسحب لأسفل بنفس معدل الارتداد العمودي للسلاح للسيطرة على الرشقات"
              )}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatBar({ label, value, positive = false }: { label: string; value: number; positive?: boolean }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-bold text-amber-200/80">{label}</span>
        <span className="font-black text-yellow-300" style={{ fontFamily: "Orbitron,sans-serif" }}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            positive
              ? "bg-gradient-to-r from-green-400 to-emerald-500"
              : "bg-gradient-to-r from-amber-300 via-yellow-500 to-yellow-700"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
