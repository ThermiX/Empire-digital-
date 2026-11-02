"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { DEFAULT_BUDGET } from "@/content/budget-presets";
import { computeSummary, type BudgetState } from "@/lib/budget";
import { cn } from "@/lib/cn";
import { formatFCFA, formatPercent } from "@/lib/format";

const BASE_INCOME = 380_000;
const MIN = 100_000;
const MAX = 1_500_000;
const STEP = 10_000;

/** Les dépenses augmentent moins vite que le revenu (élasticité 0,85). */
function scaledBudget(income: number): BudgetState {
  const factor = Math.pow(income / BASE_INCOME, 0.85);
  return {
    ...DEFAULT_BUDGET,
    incomes: [{ id: "rev", label: "Salaire net", amount: income }],
    expenses: DEFAULT_BUDGET.expenses.map((e) => ({ ...e, amount: Math.round((e.amount * factor) / 500) * 500 })),
  };
}

export function HeroPreview() {
  const [income, setIncome] = useState(BASE_INCOME);
  const id = useId();
  const summary = useMemo(() => computeSummary(scaledBudget(income)), [income]);
  const rows = summary.breakdown.slice(0, 5);
  const max = Math.max(...rows.map((r) => r.amount), 1);
  const rate = summary.savingsRate ?? 0;
  const fill = ((income - MIN) / (MAX - MIN)) * 100;

  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-8 -z-10 rounded-[3rem] bg-neon/[0.07] blur-3xl" />
      <div className="surface-dark relative overflow-hidden rounded-[2rem] border border-white/[0.09] bg-ink-800/90 p-5 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-6">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-sage">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-neon" aria-hidden />
            Aperçu du simulateur
          </p>
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[0.68rem] font-bold text-sage-200">Mensuel</span>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor={id} className="text-sm font-semibold text-white">
              Votre salaire net
            </label>
            <output htmlFor={id} className="text-lg font-bold tracking-[-0.02em] text-white">
              {formatFCFA(income)}
            </output>
          </div>
          <input
            id={id}
            type="range"
            min={MIN}
            max={MAX}
            step={STEP}
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            aria-valuetext={formatFCFA(income)}
            className="range range-dark mt-2"
            style={{ "--range-fill": `${fill}%` } as React.CSSProperties}
          />
        </div>

        <div className="mt-5 grid grid-cols-[1.3fr_1fr] gap-3">
          <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-inset ring-white/[0.06]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-sage">Épargne restante</p>
            <p className="mt-2 text-[1.85rem] font-semibold leading-none tracking-[-0.04em] text-neon" aria-live="polite">
              {formatFCFA(summary.remaining)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-inset ring-white/[0.06]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-sage">Taux d’épargne</p>
            <p className="mt-2 text-[1.85rem] font-semibold leading-none tracking-[-0.04em] text-white">{formatPercent(rate)}</p>
            <div className="relative mt-3 h-1.5 rounded-full bg-white/[0.08]" aria-hidden>
              <div className="h-full rounded-full bg-neon transition-[width] duration-300" style={{ width: `${Math.min(rate / 0.4, 1) * 100}%` }} />
              <span className="absolute -top-1 h-3.5 w-0.5 rounded bg-white/70" style={{ left: "50%" }} />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold text-sage-200">Où va votre argent</p>
          <ul className="mt-3 space-y-2.5">
            {rows.map((r) => (
              <li key={r.id} className="grid grid-cols-[6.5rem_1fr_2.6rem] items-center gap-3 text-xs">
                <span className="truncate text-sage-200">{r.type === "savings" ? "Épargne" : r.label}</span>
                <span className="h-2 rounded-r-[4px] bg-white/[0.04]">
                  <span
                    className={cn(
                      "block h-full rounded-r-[4px] transition-[width] duration-500 ease-[var(--ease-out-expo)]",
                      r.type === "savings" ? "bg-neon" : "bg-sage",
                    )}
                    style={{ width: `${(r.amount / max) * 100}%` }}
                  />
                </span>
                <span className="text-right font-bold tabular-nums text-white">{formatPercent(r.share)}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/simulateur"
          className="group mt-6 flex items-center justify-between rounded-2xl bg-neon px-4 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-neon-600"
        >
          Faire mon vrai budget
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </Link>
      </div>

      <div
        aria-hidden
        className="absolute -bottom-6 -left-4 hidden animate-float items-center gap-2.5 rounded-2xl border border-white/10 bg-ink/90 px-4 py-3 text-xs text-white shadow-lift backdrop-blur-xl sm:flex lg:-left-10"
      >
        <span className="inline-flex size-8 items-center justify-center rounded-xl bg-neon text-ink">
          <Sparkles className="size-4" />
        </span>
        <span>
          <span className="block font-bold">Fonds d’urgence</span>
          <span className="text-sage">
            {summary.monthsToProject ? `financé en ${summary.monthsToProject} mois` : "à démarrer"}
          </span>
        </span>
      </div>
    </div>
  );
}
