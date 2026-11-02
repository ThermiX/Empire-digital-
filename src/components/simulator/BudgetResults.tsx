"use client";

import {
  CircleCheck,
  Lightbulb,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import {
  RULE_503020,
  getInsights,
  type BudgetState,
  type BudgetStatus,
  type BudgetSummary,
  type InsightTone,
} from "@/lib/budget";
import { cn } from "@/lib/cn";
import { formatFCFA, formatPercent } from "@/lib/format";

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div className="mt-4 animate-pulse space-y-3" style={{ height }} aria-hidden>
      {[72, 58, 46, 38, 30].map((w) => (
        <div key={w} className="flex items-center gap-3">
          <div className="h-3 w-24 rounded bg-white/10" />
          <div className="h-3 rounded bg-white/10" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
}

// Recharts n'est chargé que lorsque le panneau s'affiche.
const AllocationChart = dynamic(() => import("./AllocationChart").then((m) => m.AllocationChart), {
  ssr: false,
  loading: () => <ChartSkeleton height={220} />,
});
export const ProjectionChart = dynamic(() => import("./ProjectionChart").then((m) => m.ProjectionChart), {
  ssr: false,
  loading: () => <div className="h-full min-h-[26rem] animate-pulse rounded-[1.75rem] bg-ink" aria-hidden />,
});

const STATUS: Record<BudgetStatus, { label: string; className: string }> = {
  empty: { label: "À compléter", className: "bg-white/[0.08] text-sage" },
  deficit: { label: "Déficit", className: "bg-danger/15 text-danger" },
  zero: { label: "À l’équilibre", className: "bg-warning/15 text-warning" },
  fragile: { label: "Fragile", className: "bg-warning/15 text-warning" },
  good: { label: "En bonne voie", className: "bg-neon/10 text-neon-200" },
  excellent: { label: "Excellent", className: "bg-neon text-ink" },
};

/* -------------------------------------------------------------------------- */

export function SummaryPanel({ state, summary }: { state: BudgetState; summary: BudgetSummary }) {
  const status = STATUS[summary.status];
  const negative = summary.remaining < 0;
  const goalProgress = summary.goalMonthly > 0 ? Math.max(0, summary.remaining) / summary.goalMonthly : 0;

  return (
    <section
      id="synthese"
      aria-labelledby="synthese-titre"
      className="surface-dark relative overflow-hidden rounded-[1.75rem] bg-ink text-white shadow-lift lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7.5rem)] lg:overflow-y-auto lg:[scrollbar-width:thin]"
    >
      <div aria-hidden className="bg-noise pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-forest/60 blur-3xl" />
      <div className="relative p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h2 id="synthese-titre" className="text-sm font-bold text-white">
            Votre synthèse mensuelle
          </h2>
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", status.className)}>{status.label}</span>
        </div>

        <div className="mt-6" aria-live="polite" aria-atomic="true">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sage">
            {negative ? "Déficit mensuel" : "Épargne restante"}
          </p>
          <p
            className={cn(
              "mt-2 text-[clamp(2.4rem,7vw,3.4rem)] font-semibold leading-none tracking-[-0.045em]",
              negative ? "text-danger" : "text-neon",
            )}
          >
            {formatFCFA(summary.remaining)}
          </p>
          <p className="mt-3 text-sm text-sage">
            {summary.savingsRate === null
              ? "Ajoutez un revenu pour calculer votre taux d’épargne."
              : negative
                ? `Vos dépenses dépassent vos revenus de ${formatPercent(-summary.savingsRate, 1)}.`
                : `Soit ${formatPercent(summary.savingsRate, 1)} de vos revenus mis de côté chaque mois.`}
          </p>
        </div>

        <dl className="mt-6 divide-y divide-dashed divide-white/[0.1] border-y border-white/[0.1] text-sm">
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-sage">Revenu total</dt>
            <dd className="font-bold tabular-nums">{formatFCFA(summary.totalIncome)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-sage">Dépenses totales</dt>
            <dd className="font-bold tabular-nums">{formatFCFA(summary.totalExpenses)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-sage">Épargne restante</dt>
            <dd className={cn("font-bold tabular-nums", negative && "text-danger")}>{formatFCFA(summary.remaining)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-sage">Taux d’épargne</dt>
            <dd className="font-bold tabular-nums">
              {summary.savingsRate === null ? "—" : formatPercent(summary.savingsRate, 1)}
            </dd>
          </div>
        </dl>

        {summary.goalMonthly > 0 ? (
          <div className="mt-6">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <p className="font-semibold">Objectif : {formatFCFA(summary.goalMonthly)} / mois</p>
              <p className={cn("text-xs font-bold", summary.goalReached ? "text-neon" : "text-warning")}>
                {summary.goalReached ? "Atteint" : `${formatPercent(Math.min(goalProgress, 1))} atteint`}
              </p>
            </div>
            <div
              className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/[0.08]"
              role="meter"
              aria-label="Progression vers l’objectif d’épargne mensuel"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(Math.min(goalProgress, 1) * 100)}
            >
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-500 ease-[var(--ease-out-expo)]",
                  summary.goalReached ? "bg-neon" : "bg-warning",
                )}
                style={{ width: `${Math.min(goalProgress, 1) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-sage">
              {summary.goalReached
                ? `Marge disponible : ${formatFCFA(summary.goalGap)} par mois.`
                : `Il manque ${formatFCFA(-summary.goalGap)} par mois.`}
            </p>
          </div>
        ) : null}

        <div className="mt-7 border-t border-white/[0.08] pt-6">
          <AllocationChart data={summary.breakdown} />
        </div>
        <p className="sr-only">
          {state.expenses.length} postes de dépenses et {state.incomes.length} sources de revenus saisis.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Meter({
  label,
  hint,
  rate,
  target,
  over,
}: {
  label: string;
  hint: string;
  rate: number;
  target: number;
  /** true si dépasser le repère est un mauvais signe (besoins, envies). */
  over: boolean;
}) {
  const ok = over ? rate <= target : rate >= target;
  const width = Math.min(1, Math.max(0, rate));
  const Icon = ok ? CircleCheck : TriangleAlert;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-bold text-ink">
          {label} <span className="font-medium text-subtle">· repère {Math.round(target * 100)}&nbsp;%</span>
        </p>
        <p className="text-lg font-bold tracking-[-0.02em] text-ink">{formatPercent(Math.max(rate, 0))}</p>
      </div>
      <div
        className="relative mt-2.5 h-2.5 rounded-full bg-mist"
        role="meter"
        aria-label={`${label} : ${formatPercent(Math.max(rate, 0))} des revenus, repère ${Math.round(target * 100)} %`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(width * 100)}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-[var(--ease-out-expo)]",
            ok ? "bg-forest" : "bg-warning",
          )}
          style={{ width: `${width * 100}%` }}
        />
        <span
          aria-hidden
          className="absolute -top-1 h-[18px] w-0.5 rounded-full bg-ink"
          style={{ left: `calc(${target * 100}% - 1px)` }}
        />
      </div>
      <p className={cn("mt-2 inline-flex items-center gap-1.5 text-xs font-semibold", ok ? "text-forest" : "text-warning-ink")}>
        <Icon className="size-3.5" aria-hidden />
        {ok ? "Dans le repère" : over ? "Au-dessus du repère" : "En dessous du repère"}
        <span className="font-normal text-muted">— {hint}</span>
      </p>
    </div>
  );
}

export function RulePanel({ summary }: { summary: BudgetSummary }) {
  const savingsRate = summary.savingsRate ?? 0;
  return (
    <section aria-labelledby="regle-titre" className="h-full rounded-[1.75rem] border border-line bg-white p-5 shadow-card sm:p-7">
      <p className="text-eyebrow font-bold uppercase text-forest">Règle 50/30/20</p>
      <h3 id="regle-titre" className="mt-3 text-display-md font-semibold">
        Votre équilibre besoins, envies, épargne
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Un repère simple : 50&nbsp;% pour l’essentiel, 30&nbsp;% pour le confort, 20&nbsp;% pour l’avenir. À adapter
        à votre réalité, notamment si vous soutenez votre famille.
      </p>
      <div className="mt-7 space-y-6">
        <Meter label="Besoins" hint={formatFCFA(summary.needs)} rate={summary.needsRate} target={RULE_503020.needs} over />
        <Meter label="Envies" hint={formatFCFA(summary.wants)} rate={summary.wantsRate} target={RULE_503020.wants} over />
        <Meter
          label="Épargne"
          hint={formatFCFA(Math.max(0, summary.remaining))}
          rate={savingsRate}
          target={RULE_503020.savings}
          over={false}
        />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

const TONES: Record<InsightTone, { icon: LucideIcon; className: string; label: string }> = {
  positive: { icon: CircleCheck, className: "bg-mist text-forest", label: "Point fort" },
  info: { icon: Lightbulb, className: "bg-paper text-forest", label: "Conseil" },
  warning: { icon: TriangleAlert, className: "bg-warning-soft text-warning-ink", label: "Attention" },
  danger: { icon: OctagonAlert, className: "bg-danger-soft text-danger-ink", label: "Alerte" },
};

export function InsightsPanel({ state, summary }: { state: BudgetState; summary: BudgetSummary }) {
  const insights = useMemo(() => getInsights(state, summary, (n) => formatFCFA(n)), [state, summary]);
  return (
    <section aria-labelledby="conseils-titre">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow font-bold uppercase text-forest">Analyse</p>
          <h3 id="conseils-titre" className="mt-3 text-display-lg font-semibold">
            Nos recommandations pour vous
          </h3>
        </div>
        <p className="max-w-sm text-sm text-muted">
          Générées automatiquement à partir de vos chiffres. Elles évoluent à chaque modification.
        </p>
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {insights.map((insight) => {
          const tone = TONES[insight.tone];
          const Icon = tone.icon;
          return (
            <li key={insight.id} className="rounded-3xl border border-line bg-white p-5 shadow-card transition-transform duration-300 hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <span className={cn("inline-flex size-9 items-center justify-center rounded-xl", tone.className)}>
                  <Icon className="size-[1.1rem]" aria-hidden />
                </span>
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-subtle">{tone.label}</span>
              </div>
              <h4 className="mt-4 font-bold tracking-[-0.01em] text-ink">{insight.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted">{insight.text}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
