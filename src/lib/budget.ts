/**
 * Moteur de calcul du simulateur de budget Argent Clair.
 * Fonctions pures, sans dépendance au DOM : testées dans budget.test.ts.
 */

export const MAX_AMOUNT = 999_999_999;
export const MAX_LINES = 24;
export const STATE_VERSION = 1 as const;

export type ExpenseKind = "besoin" | "envie";

export type CategoryKey =
  | "logement"
  | "alimentation"
  | "transport"
  | "factures"
  | "communication"
  | "famille"
  | "sante"
  | "education"
  | "loisirs"
  | "habillement"
  | "dettes"
  | "maison"
  | "autre";

export interface IncomeLine {
  id: string;
  label: string;
  amount: number;
}

export interface ExpenseLine {
  id: string;
  label: string;
  amount: number;
  kind: ExpenseKind;
  category: CategoryKey;
}

export type GoalMode = "percent" | "amount";

export interface SavingsGoal {
  mode: GoalMode;
  /** Pourcentage du revenu (0 à 80). */
  percent: number;
  /** Montant mensuel fixe en FCFA. */
  amount: number;
  projectName: string;
  projectTarget: number;
  currentSavings: number;
}

export interface BudgetState {
  version: typeof STATE_VERSION;
  incomes: IncomeLine[];
  expenses: ExpenseLine[];
  goal: SavingsGoal;
}

export type BudgetStatus = "empty" | "deficit" | "zero" | "fragile" | "good" | "excellent";

export interface BreakdownItem {
  id: string;
  label: string;
  amount: number;
  /** Part du revenu total (0..1). */
  share: number;
  type: "expense" | "savings";
  kind?: ExpenseKind;
  category?: CategoryKey;
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  remaining: number;
  /** Taux d'épargne (épargne restante / revenu). null si aucun revenu. */
  savingsRate: number | null;
  needs: number;
  wants: number;
  needsRate: number;
  wantsRate: number;
  goalMonthly: number;
  goalGap: number;
  goalReached: boolean;
  projectRemaining: number;
  monthsAtGoal: number | null;
  monthsAtRemaining: number | null;
  /** Épargne mensuelle réaliste : l'objectif, plafonné à ce qui reste réellement. */
  plannedMonthly: number;
  /** Mois nécessaires pour financer le projet au rythme réaliste. */
  monthsToProject: number | null;
  emergencyFundMin: number;
  emergencyFundMax: number;
  breakdown: BreakdownItem[];
  status: BudgetStatus;
}

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  logement: "Logement",
  alimentation: "Alimentation",
  transport: "Transport",
  factures: "Factures",
  communication: "Communication",
  famille: "Famille & solidarité",
  sante: "Santé",
  education: "Éducation",
  loisirs: "Loisirs",
  habillement: "Habillement & soins",
  dettes: "Dettes & crédits",
  maison: "Aide à la maison",
  autre: "Autre",
};

/** Règle 50/30/20 : besoins, envies, épargne. */
export const RULE_503020 = { needs: 0.5, wants: 0.3, savings: 0.2 } as const;

/* -------------------------------------------------------------------------- */
/*  Utilitaires                                                               */
/* -------------------------------------------------------------------------- */

export function clampAmount(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(Math.round(value), MAX_AMOUNT);
}

export function clampPercent(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(Math.round(value), 80);
}

let idCounter = 0;
export function createId(prefix: string): string {
  idCounter += 1;
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${idCounter}-${random}`;
}

const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0);

/* -------------------------------------------------------------------------- */
/*  Calcul principal                                                          */
/* -------------------------------------------------------------------------- */

export function computeGoalMonthly(goal: SavingsGoal, totalIncome: number): number {
  if (goal.mode === "percent") {
    return Math.round((totalIncome * clampPercent(goal.percent)) / 100);
  }
  return clampAmount(goal.amount);
}

export function monthsToReach(target: number, monthly: number): number | null {
  if (target <= 0) return 0;
  if (monthly <= 0) return null;
  return Math.ceil(target / monthly);
}

export function getStatus(totalIncome: number, remaining: number): BudgetStatus {
  if (totalIncome <= 0) return "empty";
  if (remaining < 0) return "deficit";
  if (remaining === 0) return "zero";
  const rate = remaining / totalIncome;
  if (rate < 0.1) return "fragile";
  if (rate < 0.2) return "good";
  return "excellent";
}

export function computeSummary(state: BudgetState): BudgetSummary {
  const totalIncome = sum(state.incomes.map((i) => clampAmount(i.amount)));
  const expenses = state.expenses.map((e) => ({ ...e, amount: clampAmount(e.amount) }));
  const totalExpenses = sum(expenses.map((e) => e.amount));
  const remaining = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? remaining / totalIncome : null;

  const needs = sum(expenses.filter((e) => e.kind === "besoin").map((e) => e.amount));
  const wants = sum(expenses.filter((e) => e.kind === "envie").map((e) => e.amount));
  const needsRate = totalIncome > 0 ? needs / totalIncome : 0;
  const wantsRate = totalIncome > 0 ? wants / totalIncome : 0;

  const goalMonthly = computeGoalMonthly(state.goal, totalIncome);
  const goalGap = remaining - goalMonthly;
  const goalReached = totalIncome > 0 && goalMonthly > 0 && goalGap >= 0;

  const projectRemaining = Math.max(
    0,
    clampAmount(state.goal.projectTarget) - clampAmount(state.goal.currentSavings),
  );
  const monthsAtGoal =
    state.goal.projectTarget > 0 ? monthsToReach(projectRemaining, goalMonthly) : null;
  const monthsAtRemaining =
    state.goal.projectTarget > 0 ? monthsToReach(projectRemaining, Math.max(0, remaining)) : null;

  const available = Math.max(0, remaining);
  const plannedMonthly = goalMonthly > 0 ? Math.min(goalMonthly, available) : available;
  const monthsToProject =
    state.goal.projectTarget > 0 ? monthsToReach(projectRemaining, plannedMonthly) : null;

  const breakdown: BreakdownItem[] = expenses
    .filter((e) => e.amount > 0)
    .map<BreakdownItem>((e) => ({
      id: e.id,
      label: e.label.trim() || CATEGORY_LABELS[e.category],
      amount: e.amount,
      share: totalIncome > 0 ? e.amount / totalIncome : 0,
      type: "expense",
      kind: e.kind,
      category: e.category,
    }))
    .sort((a, b) => b.amount - a.amount);

  if (remaining > 0) {
    breakdown.unshift({
      id: "epargne",
      label: "Épargne restante",
      amount: remaining,
      share: totalIncome > 0 ? remaining / totalIncome : 0,
      type: "savings",
    });
  }

  return {
    totalIncome,
    totalExpenses,
    remaining,
    savingsRate,
    needs,
    wants,
    needsRate,
    wantsRate,
    goalMonthly,
    goalGap,
    goalReached,
    projectRemaining,
    monthsAtGoal,
    monthsAtRemaining,
    plannedMonthly,
    monthsToProject,
    emergencyFundMin: needs * 3,
    emergencyFundMax: needs * 6,
    breakdown,
    status: getStatus(totalIncome, remaining),
  };
}

/* -------------------------------------------------------------------------- */
/*  Projection                                                                */
/* -------------------------------------------------------------------------- */

export interface ProjectionPoint {
  month: number;
  balance: number;
}

/** Épargne cumulée mois par mois, à partir de l'épargne déjà constituée. */
export function projectSavings(start: number, monthly: number, months: number): ProjectionPoint[] {
  const safeMonths = Math.max(1, Math.min(120, Math.round(months)));
  const points: ProjectionPoint[] = [];
  for (let m = 0; m <= safeMonths; m += 1) {
    points.push({ month: m, balance: Math.max(0, start + monthly * m) });
  }
  return points;
}

/** Horizon de projection : 12 mois minimum, prolongé jusqu'à l'objectif (max 60). */
export function projectionHorizon(monthsToGoal: number | null): number {
  if (monthsToGoal === null || monthsToGoal <= 12) return 12;
  return Math.min(60, monthsToGoal + 2);
}

/* -------------------------------------------------------------------------- */
/*  Conseils automatiques                                                     */
/* -------------------------------------------------------------------------- */

export type InsightTone = "positive" | "info" | "warning" | "danger";

export interface Insight {
  id: string;
  tone: InsightTone;
  title: string;
  text: string;
}

export function getInsights(state: BudgetState, s: BudgetSummary, fmt: (n: number) => string): Insight[] {
  const insights: Insight[] = [];
  if (s.totalIncome <= 0) {
    insights.push({
      id: "no-income",
      tone: "info",
      title: "Commencez par vos revenus",
      text: "Indiquez votre salaire net mensuel et vos autres rentrées d’argent pour obtenir une analyse.",
    });
    return insights;
  }

  if (s.remaining < 0) {
    insights.push({
      id: "deficit",
      tone: "danger",
      title: "Votre budget est en déficit",
      text: `Vos dépenses dépassent vos revenus de ${fmt(-s.remaining)} par mois. Repérez les deux postes les plus lourds et fixez-leur un plafond avant de chercher à épargner.`,
    });
  } else if (s.savingsRate !== null && s.savingsRate >= 0.2) {
    insights.push({
      id: "excellent",
      tone: "positive",
      title: "Excellent taux d’épargne",
      text: "Vous mettez de côté au moins 20 % de vos revenus. Automatisez ce virement dès la réception du salaire pour ne pas y toucher.",
    });
  } else if (s.savingsRate !== null && s.savingsRate >= 0.1) {
    insights.push({
      id: "good",
      tone: "info",
      title: "Bonne base, encore un effort",
      text: "Entre 10 et 20 % d’épargne, vous êtes sur la bonne voie. Augmentez votre épargne de 1 point à chaque hausse de revenu.",
    });
  } else {
    insights.push({
      id: "fragile",
      tone: "warning",
      title: "Épargne fragile",
      text: "Moins de 10 % de vos revenus restent disponibles. Commencez petit mais régulier : même 5 000 FCFA par semaine changent la donne en un an.",
    });
  }

  if (s.goalMonthly > 0 && s.remaining >= 0) {
    if (s.goalReached) {
      insights.push({
        id: "goal-ok",
        tone: "positive",
        title: "Objectif mensuel atteignable",
        text: `Votre reste (${fmt(s.remaining)}) couvre votre objectif de ${fmt(s.goalMonthly)}. Il vous reste ${fmt(s.goalGap)} de marge.`,
      });
    } else {
      insights.push({
        id: "goal-gap",
        tone: "warning",
        title: "Objectif pas encore atteint",
        text: `Il manque ${fmt(-s.goalGap)} par mois pour atteindre votre objectif de ${fmt(s.goalMonthly)}.`,
      });
    }
  }

  const byCategory = (key: CategoryKey) =>
    state.expenses.filter((e) => e.category === key).reduce((acc, e) => acc + clampAmount(e.amount), 0);

  const housingRate = byCategory("logement") / s.totalIncome;
  if (housingRate > 0.33) {
    insights.push({
      id: "housing",
      tone: "warning",
      title: "Logement trop lourd",
      text: `Le logement représente ${Math.round(housingRate * 100)} % de vos revenus. Au-delà d’un tiers, le reste du budget devient difficile à tenir.`,
    });
  }

  const debtRate = byCategory("dettes") / s.totalIncome;
  if (debtRate > 0.33) {
    insights.push({
      id: "debt",
      tone: "danger",
      title: "Endettement élevé",
      text: `Vos remboursements atteignent ${Math.round(debtRate * 100)} % de vos revenus, au-dessus du seuil prudent d’un tiers. Évitez tout nouveau crédit et négociez un rééchelonnement si besoin.`,
    });
  } else if (debtRate > 0.2) {
    insights.push({
      id: "debt-watch",
      tone: "info",
      title: "Crédits à surveiller",
      text: `Vos remboursements représentent ${Math.round(debtRate * 100)} % de vos revenus. Remboursez en priorité le crédit au taux le plus élevé.`,
    });
  }

  const familyRate = byCategory("famille") / s.totalIncome;
  if (familyRate > 0.15) {
    insights.push({
      id: "family",
      tone: "info",
      title: "Solidarité familiale importante",
      text: `Vous consacrez ${Math.round(familyRate * 100)} % de vos revenus à la famille. Fixez une enveloppe mensuelle claire : elle protège à la fois vos proches et votre épargne.`,
    });
  }

  if (s.wantsRate > 0.3) {
    insights.push({
      id: "wants",
      tone: "info",
      title: "Envies au-dessus du repère",
      text: `Vos dépenses « plaisir » pèsent ${Math.round(s.wantsRate * 100)} % de vos revenus (repère : 30 %). Une enveloppe hebdomadaire aide à garder le contrôle.`,
    });
  }

  if (s.needs > 0 && s.remaining > 0) {
    insights.push({
      id: "emergency",
      tone: "info",
      title: "Votre fonds d’urgence idéal",
      text: `Visez entre ${fmt(s.emergencyFundMin)} et ${fmt(s.emergencyFundMax)}, soit 3 à 6 mois de dépenses essentielles, sur un compte séparé et disponible.`,
    });
  }

  return insights;
}

/* -------------------------------------------------------------------------- */
/*  Validation de l'état sauvegardé                                           */
/* -------------------------------------------------------------------------- */

const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS) as CategoryKey[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toLabel(value: unknown, fallback: string): string {
  return typeof value === "string" ? value.slice(0, 60) : fallback;
}

/** Valide et nettoie un état lu depuis le stockage local. Retourne null si invalide. */
export function parseBudgetState(raw: unknown): BudgetState | null {
  if (!isRecord(raw) || raw.version !== STATE_VERSION) return null;
  if (!Array.isArray(raw.incomes) || !Array.isArray(raw.expenses) || !isRecord(raw.goal)) return null;

  const incomes: IncomeLine[] = [];
  for (const item of raw.incomes.slice(0, MAX_LINES)) {
    if (!isRecord(item) || typeof item.id !== "string") return null;
    incomes.push({
      id: item.id,
      label: toLabel(item.label, "Revenu"),
      amount: clampAmount(Number(item.amount)),
    });
  }

  const expenses: ExpenseLine[] = [];
  for (const item of raw.expenses.slice(0, MAX_LINES)) {
    if (!isRecord(item) || typeof item.id !== "string") return null;
    const category = CATEGORY_KEYS.includes(item.category as CategoryKey)
      ? (item.category as CategoryKey)
      : "autre";
    expenses.push({
      id: item.id,
      label: toLabel(item.label, CATEGORY_LABELS[category]),
      amount: clampAmount(Number(item.amount)),
      kind: item.kind === "envie" ? "envie" : "besoin",
      category,
    });
  }

  const g = raw.goal;
  const goal: SavingsGoal = {
    mode: g.mode === "amount" ? "amount" : "percent",
    percent: clampPercent(Number(g.percent)),
    amount: clampAmount(Number(g.amount)),
    projectName: toLabel(g.projectName, "Mon projet"),
    projectTarget: clampAmount(Number(g.projectTarget)),
    currentSavings: clampAmount(Number(g.currentSavings)),
  };

  return { version: STATE_VERSION, incomes, expenses, goal };
}

/* -------------------------------------------------------------------------- */
/*  Export CSV                                                                */
/* -------------------------------------------------------------------------- */

function csvCell(value: string | number): string {
  const text = String(value);
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** CSV compatible Excel (français) : séparateur « ; », BOM UTF-8, CRLF. */
export function toCSV(state: BudgetState, s: BudgetSummary): string {
  const pct = (n: number) => (s.totalIncome > 0 ? ((n / s.totalIncome) * 100).toFixed(1).replace(".", ",") : "0");
  const rows: Array<Array<string | number>> = [
    ["Section", "Libellé", "Type", "Montant (FCFA)", "% du revenu"],
    ...state.incomes.map((i) => ["Revenu", i.label, "", clampAmount(i.amount), pct(i.amount)]),
    ...state.expenses.map((e) => [
      "Dépense",
      e.label,
      e.kind === "besoin" ? "Besoin" : "Envie",
      clampAmount(e.amount),
      pct(e.amount),
    ]),
    [],
    ["Synthèse", "Revenu total", "", s.totalIncome, "100"],
    ["Synthèse", "Dépenses totales", "", s.totalExpenses, pct(s.totalExpenses)],
    ["Synthèse", "Épargne restante", "", s.remaining, pct(s.remaining)],
    ["Synthèse", "Objectif d’épargne mensuel", "", s.goalMonthly, pct(s.goalMonthly)],
  ];
  if (state.goal.projectTarget > 0) {
    rows.push([
      "Projet",
      state.goal.projectName,
      "",
      clampAmount(state.goal.projectTarget),
      s.monthsAtGoal !== null ? `${s.monthsAtGoal} mois` : "—",
    ]);
  }
  return "﻿" + rows.map((r) => r.map(csvCell).join(";")).join("\r\n");
}
