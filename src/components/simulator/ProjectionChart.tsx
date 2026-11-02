"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { projectSavings, projectionHorizon, type BudgetState, type BudgetSummary } from "@/lib/budget";
import { formatCompact, formatDuration, formatFCFA } from "@/lib/format";

type Point = { month: number; balance: number };

function ProjectionTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Point }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/10 bg-ink px-3.5 py-2.5 shadow-lift">
      <p className="text-sm font-bold text-white">{formatFCFA(p.balance)}</p>
      <p className="mt-0.5 flex items-center gap-2 text-xs text-sage">
        <span aria-hidden className="h-0.5 w-3 rounded-full bg-neon" />
        {p.month === 0 ? "Aujourd’hui" : `Dans ${formatDuration(p.month)}`}
      </p>
    </div>
  );
}

export function ProjectionChart({ state, summary }: { state: BudgetState; summary: BudgetSummary }) {
  const titleId = useId();
  const target = state.goal.projectTarget;
  const start = Math.min(state.goal.currentSavings, Math.max(target, state.goal.currentSavings));
  const monthly = summary.plannedMonthly;
  const horizon = projectionHorizon(summary.monthsToProject);
  const data = projectSavings(start, monthly, horizon);
  const end = data[data.length - 1].balance;
  const projectName = state.goal.projectName.trim() || "votre projet";

  let headline: string;
  if (monthly <= 0) headline = "Aucune épargne disponible pour le moment";
  else if (target > 0 && summary.monthsToProject === 0) headline = `${projectName} : déjà financé`;
  else if (target > 0 && summary.monthsToProject !== null)
    headline = `${projectName} financé dans ${formatDuration(summary.monthsToProject)}`;
  else headline = `${formatFCFA(end)} épargnés dans ${formatDuration(horizon)}`;

  return (
    <section aria-labelledby={titleId} className="surface-dark flex h-full flex-col rounded-[1.75rem] bg-ink p-5 text-white sm:p-7">
      <p className="text-eyebrow font-bold uppercase text-sage">Projection</p>
      <h3 id={titleId} className="mt-3 text-display-md font-semibold text-balance">
        {headline}
      </h3>
      <p className="mt-2 text-sm text-sage">
        {monthly > 0
          ? `En épargnant ${formatFCFA(monthly)} par mois${state.goal.currentSavings > 0 ? `, à partir de ${formatFCFA(state.goal.currentSavings)} déjà épargnés` : ""}.`
          : "Réduisez vos dépenses ou augmentez vos revenus pour dégager une capacité d’épargne."}
      </p>

      <div
        className="mt-6 h-56 sm:h-64"
        role="img"
        aria-label={`Projection de l’épargne cumulée sur ${formatDuration(horizon)} : de ${formatFCFA(start)} à ${formatFCFA(end)}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="projection-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E4FF1A" stopOpacity={0.16} />
                <stop offset="100%" stopColor="#E4FF1A" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(159,184,168,0.12)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: "rgba(159,184,168,0.2)" }}
              tick={{ fill: "#9FB8A8", fontSize: 11 }}
              tickFormatter={(m: number) => (m === 0 ? "Auj." : `${m} m`)}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              width={44}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9FB8A8", fontSize: 11 }}
              tickFormatter={(v: number) => formatCompact(v)}
              domain={[0, (max: number) => Math.max(max, target) * 1.05]}
            />
            {target > 0 ? (
              <ReferenceLine
                y={target}
                stroke="#D7E2DB"
                strokeOpacity={0.55}
                label={{ value: `Objectif ${formatCompact(target)}`, position: "insideTopLeft", fill: "#D7E2DB", fontSize: 11, fontWeight: 600 }}
              />
            ) : null}
            {summary.monthsToProject !== null && summary.monthsToProject > 0 && summary.monthsToProject <= horizon ? (
              <ReferenceLine x={summary.monthsToProject} stroke="#E4FF1A" strokeOpacity={0.5} />
            ) : null}
            <Tooltip
              content={<ProjectionTooltip />}
              cursor={{ stroke: "#9FB8A8", strokeWidth: 1 }}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#E4FF1A"
              strokeWidth={2}
              fill="url(#projection-fill)"
              activeDot={{ r: 5, fill: "#E4FF1A", stroke: "#04180C", strokeWidth: 2 }}
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-5 text-sm">
        <div>
          <dt className="text-xs text-sage">Dans {formatDuration(horizon)}</dt>
          <dd className="mt-1 font-bold">{formatFCFA(end)}</dd>
        </div>
        <div>
          <dt className="text-xs text-sage">Reste à financer</dt>
          <dd className="mt-1 font-bold">{target > 0 ? formatFCFA(summary.projectRemaining) : "—"}</dd>
        </div>
      </dl>
    </section>
  );
}
