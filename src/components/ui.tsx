import { type ReactNode, type ButtonHTMLAttributes, type HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div {...p} className={cn("card-glass card-glow rounded-2xl", className)} />;
}

export function GoldButton({
  className,
  children,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...p}
      className={cn(
        "btn-gold inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm sm:text-base",
        p.disabled && "opacity-60 cursor-not-allowed",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  className,
  children,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...p}
      className={cn(
        "btn-ghost inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Chip({
  active,
  className,
  children,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; children: ReactNode }) {
  return (
    <button
      {...p}
      className={cn("chip rounded-xl px-3.5 py-2 text-sm", active && "chip-active", className)}
    >
      {children}
    </button>
  );
}

export function Field({ label, children, hint }: { label: ReactNode; children: ReactNode; hint?: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold-deep/90">
        <span className="text-gold-grad">{label}</span>
      </div>
      {children}
      {hint && <div className="mt-1.5 text-xs opacity-60">{hint}</div>}
    </label>
  );
}

export function Input({ className, ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...p}
      className={cn(
        "w-full rounded-xl border border-[rgba(212,175,55,0.25)] bg-black/40 px-4 py-2.5 text-sm outline-none transition",
        "placeholder:opacity-50",
        "focus:border-[rgba(212,175,55,0.7)] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)]",
        "theme-light:bg-white/80",
        className,
      )}
    />
  );
}

export function Select({ className, children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...p}
      className={cn(
        "w-full rounded-xl border border-[rgba(212,175,55,0.25)] bg-black/40 px-4 py-2.5 text-sm outline-none transition",
        "focus:border-[rgba(212,175,55,0.7)] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)]",
        "theme-light:bg-white/80",
        className,
      )}
    >
      {children}
    </select>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className="h-full rounded-full bg-gold-grad transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="card-glass rounded-2xl p-4 sm:p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-gold-deep/80">{label}</div>
      <div className="mt-2 text-2xl font-bold text-gold-grad sm:text-3xl">{value}</div>
      {sub && <div className="mt-1 text-xs opacity-60">{sub}</div>}
    </div>
  );
}

export function Divider() {
  return <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.35)] to-transparent" />;
}

export function GlowDot({ color = "gold" }: { color?: "gold" | "green" | "red" | "blue" }) {
  const map = {
    gold: "bg-[#d4af37] shadow-[0_0_12px_#d4af37]",
    green: "bg-emerald-400 shadow-[0_0_12px_#34d399]",
    red: "bg-rose-400 shadow-[0_0_12px_#fb7185]",
    blue: "bg-sky-400 shadow-[0_0_12px_#38bdf8]",
  };
  return <span className={cn("inline-block h-2 w-2 rounded-full", map[color])} />;
}
