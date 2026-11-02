"use client";

import { CircleCheck, CloudOff, Download, LoaderCircle, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import { BUDGET_PRESETS, EMPTY_BUDGET } from "@/content/budget-presets";
import { toCSV, type BudgetState } from "@/lib/budget";
import { cn } from "@/lib/cn";
import { formatFCFA, formatPercent } from "@/lib/format";
import { ExpenseEditor, GoalEditor, IncomeEditor } from "./BudgetEditor";
import { InsightsPanel, ProjectionChart, RulePanel, SummaryPanel } from "./BudgetResults";
import { useBudget, type SaveStatus } from "./useBudget";

function SaveIndicator({ status }: { status: SaveStatus }) {
  const map = {
    idle: { icon: CircleCheck, text: "Prêt — sauvegarde automatique", cls: "text-muted" },
    saving: { icon: LoaderCircle, text: "Enregistrement…", cls: "text-muted" },
    saved: { icon: CircleCheck, text: "Enregistré sur cet appareil", cls: "text-forest" },
    unavailable: { icon: CloudOff, text: "Sauvegarde indisponible sur ce navigateur", cls: "text-warning-ink" },
  } as const;
  const { icon: Icon, text, cls } = map[status];
  return (
    <p role="status" className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", cls)}>
      <Icon className={cn("size-3.5", status === "saving" && "animate-spin")} aria-hidden />
      {text}
    </p>
  );
}

function clone(state: BudgetState): BudgetState {
  return JSON.parse(JSON.stringify(state)) as BudgetState;
}

export function BudgetSimulator() {
  const { state, summary, update, saveStatus, initialLoad } = useBudget();
  const { toast } = useToast();
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const warned = useRef(false);

  // Signale une sauvegarde endommagée ou un stockage bloqué (une seule fois).
  useEffect(() => {
    if (warned.current || initialLoad.ok) return;
    warned.current = true;
    if (initialLoad.reason === "corrupted") {
      toast({
        tone: "error",
        title: "Sauvegarde illisible",
        description: "Vos données enregistrées étaient endommagées : un budget d’exemple a été chargé.",
      });
    } else if (initialLoad.reason === "unavailable") {
      toast({
        tone: "info",
        title: "Sauvegarde désactivée",
        description: "Votre navigateur bloque le stockage local (navigation privée ?). Le simulateur fonctionne, mais rien ne sera conservé.",
      });
    }
  }, [initialLoad, toast]);

  // Masque la barre mobile lorsque la synthèse est visible.
  useEffect(() => {
    const el = document.getElementById("synthese");
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setSummaryVisible(entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function replaceWithUndo(next: BudgetState, title: string) {
    const previous = clone(state);
    update({ type: "replace", state: clone(next) });
    toast({
      tone: "success",
      title,
      description: "Vos valeurs précédentes ont été remplacées.",
      action: {
        label: "Annuler",
        onClick: () => {
          update({ type: "replace", state: previous });
          setActivePreset(null);
        },
      },
    });
  }

  function exportCSV() {
    try {
      const blob = new Blob([toCSV(state, summary)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "budget-argent-clair.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast({ tone: "success", title: "Budget exporté", description: "Fichier CSV compatible Excel et Google Sheets." });
    } catch {
      toast({ tone: "error", title: "Export impossible", description: "Votre navigateur a bloqué le téléchargement. Réessayez." });
    }
  }

  return (
    <div>
      {/* Barre d'outils */}
      <div className="flex flex-col gap-5 rounded-[1.75rem] border border-line bg-white p-4 shadow-card sm:p-5 xl:flex-row xl:items-center xl:justify-between">
        <fieldset className="min-w-0">
          <legend className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-subtle">
            Partir d’un profil d’exemple
          </legend>
          <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {BUDGET_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                aria-pressed={activePreset === preset.key}
                onClick={() => {
                  setActivePreset(preset.key);
                  replaceWithUndo(preset.state, `Profil « ${preset.label} » chargé`);
                }}
                className={cn(
                  "shrink-0 rounded-2xl border px-4 py-2.5 text-left transition-[border-color,background-color] duration-200",
                  activePreset === preset.key
                    ? "border-forest bg-mist"
                    : "border-line hover:border-forest/40 hover:bg-paper",
                )}
              >
                <span className="block text-sm font-bold text-ink">{preset.label}</span>
                <span className="block text-xs text-muted">{preset.description}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap items-center justify-between gap-3 xl:justify-end">
          <SaveIndicator status={saveStatus} />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={<Download aria-hidden />} onClick={exportCSV}>
              Exporter (CSV)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCcw aria-hidden />}
              onClick={() => {
                setActivePreset(null);
                replaceWithUndo(EMPTY_BUDGET, "Simulateur remis à zéro");
              }}
            >
              Repartir de zéro
            </Button>
          </div>
        </div>
      </div>

      {/* Saisie + synthèse */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-6">
          <IncomeEditor state={state} summary={summary} update={update} />
          <ExpenseEditor state={state} summary={summary} update={update} />
          <GoalEditor state={state} summary={summary} update={update} />
        </div>
        <SummaryPanel state={state} summary={summary} />
      </div>

      {/* Analyse détaillée */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <RulePanel summary={summary} />
        <ProjectionChart state={state} summary={summary} />
      </div>
      <div className="mt-16">
        <InsightsPanel state={state} summary={summary} />
      </div>

      {/* Barre de synthèse mobile */}
      <div
        className={cn(
          "surface-dark fixed inset-x-3 bottom-3 z-30 transition-[opacity,transform] duration-300 lg:hidden",
          summaryVisible ? "pointer-events-none translate-y-4 opacity-0" : "translate-y-0 opacity-100",
        )}
        aria-hidden={summaryVisible}
      >
        <a
          href="#synthese"
          tabIndex={summaryVisible ? -1 : 0}
          className="flex items-center justify-between gap-3 rounded-2xl bg-ink/95 px-4 py-3 text-white shadow-lift ring-1 ring-white/10 backdrop-blur-xl"
        >
          <span>
            <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-sage">
              {summary.remaining < 0 ? "Déficit" : "Épargne restante"}
            </span>
            <span className={cn("block text-lg font-bold tracking-[-0.02em]", summary.remaining < 0 ? "text-danger" : "text-neon")}>
              {formatFCFA(summary.remaining)}
              {summary.savingsRate !== null ? (
                <span className="ml-2 text-xs font-semibold text-sage">{formatPercent(summary.savingsRate)}</span>
              ) : null}
            </span>
          </span>
          <span className="rounded-full bg-neon px-3.5 py-2 text-xs font-bold text-ink">Voir l’analyse</span>
        </a>
      </div>
    </div>
  );
}
