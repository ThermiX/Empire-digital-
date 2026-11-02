"use client";

import dynamic from "next/dynamic";

function SimulatorSkeleton() {
  return (
    <div role="status" aria-label="Chargement du simulateur" className="animate-pulse">
      <span className="sr-only">Chargement du simulateur…</span>
      <div className="h-28 rounded-[1.75rem] border border-line bg-white" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-6">
          {[220, 520, 360].map((h) => (
            <div key={h} className="rounded-[1.75rem] border border-line bg-white p-7" style={{ height: h }}>
              <div className="h-5 w-40 rounded bg-mist" />
              <div className="mt-3 h-3 w-64 rounded bg-mist" />
              <div className="mt-8 space-y-3">
                <div className="h-11 rounded-xl bg-paper" />
                <div className="h-11 rounded-xl bg-paper" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-[640px] rounded-[1.75rem] bg-ink" />
      </div>
    </div>
  );
}

/**
 * Le simulateur dépend du stockage local du navigateur : il est rendu
 * uniquement côté client, avec un squelette pendant le chargement.
 */
export const SimulatorLoader = dynamic(
  () => import("./BudgetSimulator").then((m) => m.BudgetSimulator),
  { ssr: false, loading: () => <SimulatorSkeleton /> },
);
