"use client";

import { useId, useState } from "react";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BreakdownItem } from "@/lib/budget";
import { cn } from "@/lib/cn";
import { formatFCFA, formatPercent } from "@/lib/format";

const COLORS = { savings: "#E4FF1A", expense: "#9FB8A8", text: "#D7E2DB", muted: "#9FB8A8" };
const ROW_HEIGHT = 34;

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

type TooltipPayload = { payload: BreakdownItem };

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/10 bg-ink px-3.5 py-2.5 shadow-lift">
      <p className="text-sm font-bold text-white">{formatFCFA(item.amount)}</p>
      <p className="mt-0.5 flex items-center gap-2 text-xs text-sage">
        <span
          aria-hidden
          className="h-0.5 w-3 rounded-full"
          style={{ background: item.type === "savings" ? COLORS.savings : COLORS.expense }}
        />
        {item.label} · {formatPercent(item.share, 1)} du revenu
      </p>
    </div>
  );
}

/**
 * Répartition du revenu : barres horizontales classées, une teinte pour les
 * dépenses et l'accent néon pour l'épargne (forme « emphase »).
 */
export function AllocationChart({ data }: { data: BreakdownItem[] }) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const titleId = useId();

  if (data.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-white/15 p-5 text-center text-sm text-sage">
        Saisissez vos revenus et vos dépenses pour voir la répartition.
      </p>
    );
  }

  const description = data.map((d) => `${d.label} ${formatPercent(d.share)}`).join(", ");

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 id={titleId} className="text-sm font-bold text-white">
          Où va votre argent
        </h3>
        <div className="flex rounded-full bg-white/[0.06] p-0.5 text-[0.72rem] font-semibold" role="group" aria-label="Affichage">
          {(
            [
              ["chart", "Graphique"],
              ["table", "Tableau"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={view === key}
              onClick={() => setView(key)}
              className={cn(
                "rounded-full px-2.5 py-1 transition-colors",
                view === key ? "bg-white/[0.12] text-white" : "text-sage hover:text-white",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === "chart" ? (
        <div
          role="img"
          aria-label={`Part de chaque poste dans votre revenu : ${description}.`}
          className="mt-4"
          style={{ height: data.length * ROW_HEIGHT + 8 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 52, bottom: 0, left: 0 }} barCategoryGap={10}>
              <XAxis type="number" hide domain={[0, "dataMax"]} />
              <YAxis
                type="category"
                dataKey="label"
                width={128}
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={({ x, y, payload }) => (
                  <text x={Number(x) - 4} y={Number(y)} dy={4} textAnchor="end" fill={COLORS.text} fontSize={12} fontWeight={500}>
                    {truncate(String(payload.value), 18)}
                  </text>
                )}
              />
              <Tooltip
                cursor={{ fill: "rgba(159,184,168,0.08)" }}
                content={<ChartTooltip />}
                isAnimationActive={false}
              />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={12} animationDuration={450} animationEasing="ease-out">
                {data.map((d) => (
                  <Cell key={d.id} fill={d.type === "savings" ? COLORS.savings : COLORS.expense} />
                ))}
                <LabelList
                  dataKey="share"
                  position="right"
                  offset={8}
                  formatter={(value) => formatPercent(Number(value))}
                  style={{ fill: COLORS.text, fontSize: 12, fontWeight: 700 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-white/10">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Répartition de vos revenus par poste</caption>
            <thead className="bg-white/[0.04] text-[0.7rem] uppercase tracking-[0.1em] text-sage">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">Poste</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">Montant</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">Part</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {data.map((d) => (
                <tr key={d.id}>
                  <th scope="row" className="px-3 py-2 font-medium text-white">
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden
                        className="size-2 rounded-[2px]"
                        style={{ background: d.type === "savings" ? COLORS.savings : COLORS.expense }}
                      />
                      {d.label}
                    </span>
                  </th>
                  <td className="px-3 py-2 text-right tabular-nums text-sage-200">{formatFCFA(d.amount)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-sage-200">{formatPercent(d.share, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.72rem] text-sage">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-[2px] bg-neon" /> Épargne restante
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-[2px] bg-sage" /> Dépenses
        </span>
        <span>· % du revenu total</span>
      </p>
    </div>
  );
}
