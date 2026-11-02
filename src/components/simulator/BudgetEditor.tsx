"use client";

import { AnimatePresence, m } from "framer-motion";
import { Plus, Trash2, Wallet } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";
import { useToast } from "@/components/ui/Toaster";
import {
  CATEGORY_LABELS,
  MAX_LINES,
  createId,
  type BudgetState,
  type BudgetSummary,
  type CategoryKey,
  type ExpenseKind,
} from "@/lib/budget";
import { cn } from "@/lib/cn";
import { formatFCFA, formatPercent } from "@/lib/format";
import { CATEGORY_ICONS } from "./category-icons";
import { CurrencyInput } from "./CurrencyInput";
import type { BudgetUpdate } from "./useBudget";

const rowTransition = { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const };

/* -------------------------------------------------------------------------- */

export function EditorCard({
  step,
  title,
  description,
  total,
  children,
  id,
}: {
  step: string;
  title: string;
  description: string;
  total?: ReactNode;
  children: ReactNode;
  id: string;
}) {
  return (
    <section
      aria-labelledby={`${id}-titre`}
      className="rounded-[1.75rem] border border-line bg-white p-5 shadow-card sm:p-7"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold tabular-nums text-neon">
            {step}
          </span>
          <div>
            <h2 id={`${id}-titre`} className="text-display-md font-semibold">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
          </div>
        </div>
        {total ? <div className="text-right">{total}</div> : null}
      </header>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function TotalBadge({ label, value }: { label: string; value: number }) {
  return (
    <p className="rounded-2xl bg-paper px-4 py-2">
      <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-subtle">{label}</span>
      <span className="block text-lg font-bold tracking-[-0.02em] text-ink">{formatFCFA(value)}</span>
    </p>
  );
}

function AddChip({ onClick, children, disabled }: { onClick: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-forest/30 px-3 py-1.5 text-[0.8rem] font-semibold text-forest transition-colors hover:border-forest hover:bg-mist disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Plus className="size-3.5" aria-hidden />
      {children}
    </button>
  );
}

function focusLabel(container: HTMLElement | null, id: string) {
  window.requestAnimationFrame(() => {
    container?.querySelector<HTMLInputElement>(`[data-line="${id}"] input[data-role="label"]`)?.focus();
  });
}

/* -------------------------------------------------------------------------- */
/*  Revenus                                                                   */
/* -------------------------------------------------------------------------- */

const INCOME_SUGGESTIONS = ["Prime ou commission", "Activité complémentaire", "Loyer perçu", "Transfert reçu"];

export function IncomeEditor({
  state,
  summary,
  update,
}: {
  state: BudgetState;
  summary: BudgetSummary;
  update: BudgetUpdate;
}) {
  const { toast } = useToast();
  const listRef = useRef<HTMLUListElement>(null);
  const full = state.incomes.length >= MAX_LINES;

  function add(label = "") {
    const id = createId("rev");
    update({ type: "income/insert", line: { id, label, amount: 0 } });
    focusLabel(listRef.current, id);
  }

  function remove(id: string) {
    const index = state.incomes.findIndex((l) => l.id === id);
    const line = state.incomes[index];
    if (!line) return;
    update({ type: "income/remove", id });
    toast({
      title: `Revenu « ${line.label || "sans nom"} » supprimé`,
      action: { label: "Annuler", onClick: () => update({ type: "income/insert", line, index }) },
    });
  }

  const unused = INCOME_SUGGESTIONS.filter((s) => !state.incomes.some((l) => l.label === s));

  return (
    <EditorCard
      id="revenus"
      step="01"
      title="Vos revenus"
      description="Salaire net et autres rentrées d’argent régulières, par mois."
      total={<TotalBadge label="Revenu total" value={summary.totalIncome} />}
    >
      <ul ref={listRef} className="space-y-2.5">
        <AnimatePresence initial={false}>
          {state.incomes.map((line, i) => (
            <m.li
              key={line.id}
              data-line={line.id}
              layout="position"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -12, transition: { duration: 0.16 } }}
              transition={rowTransition}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-line/70 p-2.5 sm:flex sm:gap-3 sm:border-0 sm:p-0"
            >
              <span className="hidden size-11 shrink-0 items-center justify-center rounded-2xl bg-mist text-forest sm:inline-flex">
                <Wallet className="size-[1.15rem]" aria-hidden />
              </span>
              <input
                data-role="label"
                type="text"
                value={line.label}
                maxLength={60}
                placeholder={i === 0 ? "Salaire net" : "Nom du revenu"}
                aria-label={`Libellé du revenu ${i + 1}`}
                onChange={(e) => update({ type: "income/update", id: line.id, patch: { label: e.target.value } })}
                className="field-input min-w-0 flex-1 border-transparent bg-paper font-medium hover:border-line"
              />
              <CurrencyInput
                value={line.amount}
                onValueChange={(amount) => update({ type: "income/update", id: line.id, patch: { amount } })}
                aria-label={`Montant mensuel — ${line.label || `revenu ${i + 1}`}`}
                className="order-last col-span-2 sm:order-none sm:w-48 sm:shrink-0"
              />
              <button
                type="button"
                onClick={() => remove(line.id)}
                aria-label={`Supprimer le revenu ${line.label || i + 1}`}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:bg-danger-soft hover:text-danger-ink"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
      {state.incomes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-5 text-center text-sm text-muted">
          Aucun revenu pour le moment. Ajoutez votre salaire pour commencer.
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-2">
        <AddChip onClick={() => add()} disabled={full}>
          Ajouter un revenu
        </AddChip>
        {unused.slice(0, 3).map((s) => (
          <AddChip key={s} onClick={() => add(s)} disabled={full}>
            {s}
          </AddChip>
        ))}
      </div>
      {full ? <p className="mt-3 text-xs text-muted">Limite de {MAX_LINES} lignes atteinte.</p> : null}
    </EditorCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dépenses                                                                  */
/* -------------------------------------------------------------------------- */

const SUGGESTED_CATEGORIES: Array<{ category: CategoryKey; kind: ExpenseKind }> = [
  { category: "logement", kind: "besoin" },
  { category: "alimentation", kind: "besoin" },
  { category: "transport", kind: "besoin" },
  { category: "factures", kind: "besoin" },
  { category: "communication", kind: "besoin" },
  { category: "famille", kind: "besoin" },
  { category: "sante", kind: "besoin" },
  { category: "education", kind: "besoin" },
  { category: "dettes", kind: "besoin" },
  { category: "maison", kind: "besoin" },
  { category: "loisirs", kind: "envie" },
  { category: "habillement", kind: "envie" },
];

function KindToggle({
  value,
  onChange,
  name,
  label,
}: {
  value: ExpenseKind;
  onChange: (kind: ExpenseKind) => void;
  name: string;
  label: string;
}) {
  return (
    <fieldset className="shrink-0">
      <legend className="sr-only">Type de dépense — {label}</legend>
      <div className="flex rounded-full bg-paper p-1 ring-1 ring-inset ring-line">
        {(["besoin", "envie"] as const).map((kind) => (
          <label
            key={kind}
            className={cn(
              "relative cursor-pointer rounded-full px-2.5 py-1.5 text-[0.75rem] font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest",
              value === kind ? "bg-ink text-white" : "text-muted hover:text-ink",
            )}
          >
            <input
              type="radio"
              name={name}
              value={kind}
              checked={value === kind}
              onChange={() => onChange(kind)}
              className="sr-only"
            />
            {kind === "besoin" ? "Besoin" : "Envie"}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ExpenseEditor({
  state,
  summary,
  update,
}: {
  state: BudgetState;
  summary: BudgetSummary;
  update: BudgetUpdate;
}) {
  const { toast } = useToast();
  const listRef = useRef<HTMLUListElement>(null);
  const groupId = useId();
  const full = state.expenses.length >= MAX_LINES;

  function add(category: CategoryKey = "autre", kind: ExpenseKind = "envie") {
    const id = createId("dep");
    const label = category === "autre" ? "" : CATEGORY_LABELS[category];
    update({ type: "expense/insert", line: { id, label, amount: 0, category, kind } });
    focusLabel(listRef.current, id);
  }

  function remove(id: string) {
    const index = state.expenses.findIndex((l) => l.id === id);
    const line = state.expenses[index];
    if (!line) return;
    update({ type: "expense/remove", id });
    toast({
      title: `Dépense « ${line.label || "sans nom"} » supprimée`,
      action: { label: "Annuler", onClick: () => update({ type: "expense/insert", line, index }) },
    });
  }

  const missing = SUGGESTED_CATEGORIES.filter((s) => !state.expenses.some((e) => e.category === s.category));

  return (
    <EditorCard
      id="depenses"
      step="02"
      title="Vos dépenses"
      description="Classez chaque poste en besoin (indispensable) ou en envie (confort, plaisir)."
      total={<TotalBadge label="Dépenses totales" value={summary.totalExpenses} />}
    >
      <ul ref={listRef} className="space-y-3 sm:space-y-2.5">
        <AnimatePresence initial={false}>
          {state.expenses.map((line, i) => {
            const Icon = CATEGORY_ICONS[line.category];
            const name = line.label || `dépense ${i + 1}`;
            return (
              <m.li
                key={line.id}
                data-line={line.id}
                layout="position"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12, transition: { duration: 0.16 } }}
                transition={rowTransition}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2 rounded-2xl border border-line/70 p-2.5 sm:flex sm:gap-3 sm:border-0 sm:p-0"
              >
                <span
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-mist text-forest sm:size-11"
                  title={CATEGORY_LABELS[line.category]}
                >
                  <Icon className="size-[1.1rem]" aria-hidden />
                </span>
                <div className="relative min-w-0 sm:flex-1">
                  <input
                    data-role="label"
                    type="text"
                    value={line.label}
                    maxLength={60}
                    placeholder="Nom de la dépense"
                    aria-label={`Libellé de la dépense ${i + 1}`}
                    onChange={(e) =>
                      update({ type: "expense/update", id: line.id, patch: { label: e.target.value } })
                    }
                    className="field-input border-transparent bg-paper font-medium hover:border-line"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(line.id)}
                  aria-label={`Supprimer ${name}`}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:bg-danger-soft hover:text-danger-ink sm:order-last"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
                <div className="col-span-3 flex items-center gap-2 sm:contents">
                  <CurrencyInput
                    value={line.amount}
                    onValueChange={(amount) => update({ type: "expense/update", id: line.id, patch: { amount } })}
                    aria-label={`Montant mensuel — ${name}`}
                    className="min-w-0 flex-1 sm:w-40 sm:flex-none"
                  />
                  <KindToggle
                    name={`${groupId}-${line.id}`}
                    label={name}
                    value={line.kind}
                    onChange={(kind) => update({ type: "expense/update", id: line.id, patch: { kind } })}
                  />
                </div>
              </m.li>
            );
          })}
        </AnimatePresence>
      </ul>
      {state.expenses.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-5 text-center text-sm text-muted">
          Aucune dépense saisie. Ajoutez vos postes principaux ci-dessous.
        </p>
      ) : null}
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-subtle">Ajouter un poste</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <AddChip onClick={() => add()} disabled={full}>
            Dépense personnalisée
          </AddChip>
          {missing.map((s) => (
            <AddChip key={s.category} onClick={() => add(s.category, s.kind)} disabled={full}>
              {CATEGORY_LABELS[s.category]}
            </AddChip>
          ))}
        </div>
        {full ? <p className="mt-3 text-xs text-muted">Limite de {MAX_LINES} lignes atteinte.</p> : null}
      </div>
    </EditorCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Objectif d'épargne                                                        */
/* -------------------------------------------------------------------------- */

const QUICK_PERCENTS = [10, 15, 20, 30];

export function GoalEditor({
  state,
  summary,
  update,
}: {
  state: BudgetState;
  summary: BudgetSummary;
  update: BudgetUpdate;
}) {
  const uid = useId();
  const { goal } = state;
  const setGoal = (patch: Partial<BudgetState["goal"]>) => update({ type: "goal/update", patch });
  const percent = Math.min(goal.percent, 50);

  return (
    <EditorCard
      id="objectif"
      step="03"
      title="Votre objectif d’épargne"
      description="Combien voulez-vous mettre de côté chaque mois, et pour quel projet ?"
      total={<TotalBadge label="Objectif mensuel" value={summary.goalMonthly} />}
    >
      <fieldset>
        <legend className="sr-only">Mode de calcul de l’objectif</legend>
        <div className="inline-flex rounded-full bg-paper p-1 ring-1 ring-inset ring-line">
          {(
            [
              ["percent", "En % du revenu"],
              ["amount", "Montant fixe"],
            ] as const
          ).map(([mode, label]) => (
            <label
              key={mode}
              className={cn(
                "cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest",
                goal.mode === mode ? "bg-ink text-white" : "text-muted hover:text-ink",
              )}
            >
              <input
                type="radio"
                name={`${uid}-mode`}
                value={mode}
                checked={goal.mode === mode}
                onChange={() => setGoal({ mode })}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {goal.mode === "percent" ? (
        <div className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <label htmlFor={`${uid}-percent`} className="text-sm font-semibold text-ink">
              Part de vos revenus à épargner
            </label>
            <p className="text-right">
              <span className="text-3xl font-semibold tracking-[-0.03em]">{goal.percent}&nbsp;%</span>
              <span className="block text-xs text-muted">soit {formatFCFA(summary.goalMonthly)} / mois</span>
            </p>
          </div>
          <input
            id={`${uid}-percent`}
            type="range"
            min={0}
            max={50}
            step={1}
            value={percent}
            onChange={(e) => setGoal({ percent: Number(e.target.value) })}
            aria-valuetext={`${goal.percent} % des revenus, soit ${formatFCFA(summary.goalMonthly)} par mois`}
            className="range mt-3"
            style={{ "--range-fill": `${(percent / 50) * 100}%` } as React.CSSProperties}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_PERCENTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setGoal({ percent: p })}
                aria-pressed={goal.percent === p}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                  goal.percent === p ? "bg-forest text-white" : "bg-paper text-muted hover:bg-mist hover:text-ink",
                )}
              >
                {p}&nbsp;%{p === 20 ? " · repère 50/30/20" : ""}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 max-w-sm">
          <label htmlFor={`${uid}-amount`} className="text-sm font-semibold text-ink">
            Montant à épargner chaque mois
          </label>
          <CurrencyInput
            id={`${uid}-amount`}
            value={goal.amount}
            onValueChange={(amount) => setGoal({ amount })}
            fieldSize="lg"
            className="mt-2"
          />
          {summary.totalIncome > 0 ? (
            <p className="mt-2 text-xs text-muted">
              Soit {formatPercent(goal.amount / summary.totalIncome, 1)} de vos revenus.
            </p>
          ) : null}
        </div>
      )}

      <div className="mt-8 border-t border-line pt-6">
        <h3 className="text-sm font-bold text-ink">Projet financé par cette épargne</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor={`${uid}-project`} className="text-xs font-semibold text-muted">
              Nom du projet
            </label>
            <input
              id={`${uid}-project`}
              type="text"
              value={goal.projectName}
              maxLength={60}
              placeholder="Fonds d’urgence"
              onChange={(e) => setGoal({ projectName: e.target.value })}
              className="field-input mt-1.5 font-medium"
            />
          </div>
          <div>
            <label htmlFor={`${uid}-target`} className="text-xs font-semibold text-muted">
              Montant visé
            </label>
            <CurrencyInput
              id={`${uid}-target`}
              value={goal.projectTarget}
              step={10_000}
              onValueChange={(projectTarget) => setGoal({ projectTarget })}
              className="mt-1.5"
            />
          </div>
          <div>
            <label htmlFor={`${uid}-current`} className="text-xs font-semibold text-muted">
              Déjà épargné
            </label>
            <CurrencyInput
              id={`${uid}-current`}
              value={goal.currentSavings}
              step={10_000}
              onValueChange={(currentSavings) => setGoal({ currentSavings })}
              className="mt-1.5"
            />
          </div>
        </div>
      </div>
    </EditorCard>
  );
}
