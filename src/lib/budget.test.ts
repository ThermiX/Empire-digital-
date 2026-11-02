import { describe, expect, it } from "vitest";
import {
  MAX_AMOUNT,
  computeSummary,
  getInsights,
  getStatus,
  monthsToReach,
  parseBudgetState,
  projectSavings,
  projectionHorizon,
  toCSV,
  type BudgetState,
} from "./budget";
import { DEFAULT_BUDGET, BUDGET_PRESETS } from "@/content/budget-presets";
import { formatFCFA } from "./format";

const base: BudgetState = {
  version: 1,
  incomes: [
    { id: "a", label: "Salaire", amount: 300_000 },
    { id: "b", label: "Extra", amount: 100_000 },
  ],
  expenses: [
    { id: "x", label: "Loyer", amount: 120_000, kind: "besoin", category: "logement" },
    { id: "y", label: "Alimentation", amount: 80_000, kind: "besoin", category: "alimentation" },
    { id: "z", label: "Sorties", amount: 40_000, kind: "envie", category: "loisirs" },
  ],
  goal: {
    mode: "percent",
    percent: 20,
    amount: 0,
    projectName: "Fonds d’urgence",
    projectTarget: 1_000_000,
    currentSavings: 200_000,
  },
};

describe("computeSummary", () => {
  it("calcule revenus, dépenses, reste et taux d'épargne", () => {
    const s = computeSummary(base);
    expect(s.totalIncome).toBe(400_000);
    expect(s.totalExpenses).toBe(240_000);
    expect(s.remaining).toBe(160_000);
    expect(s.savingsRate).toBeCloseTo(0.4);
    expect(s.needs).toBe(200_000);
    expect(s.wants).toBe(40_000);
    expect(s.needsRate).toBeCloseTo(0.5);
    expect(s.wantsRate).toBeCloseTo(0.1);
  });

  it("calcule l'objectif mensuel en pourcentage et en montant", () => {
    expect(computeSummary(base).goalMonthly).toBe(80_000);
    const amount = computeSummary({ ...base, goal: { ...base.goal, mode: "amount", amount: 50_000 } });
    expect(amount.goalMonthly).toBe(50_000);
    expect(amount.goalGap).toBe(110_000);
    expect(amount.goalReached).toBe(true);
  });

  it("calcule la durée pour atteindre le projet", () => {
    const s = computeSummary(base);
    expect(s.projectRemaining).toBe(800_000);
    expect(s.monthsAtGoal).toBe(10); // 800 000 / 80 000
    expect(s.monthsAtRemaining).toBe(5); // 800 000 / 160 000
    expect(s.plannedMonthly).toBe(80_000);
    expect(s.monthsToProject).toBe(10);
  });

  it("plafonne l'épargne prévue à ce qui reste réellement", () => {
    const s = computeSummary({ ...base, goal: { ...base.goal, percent: 60 } });
    expect(s.goalMonthly).toBe(240_000);
    expect(s.plannedMonthly).toBe(160_000);
    expect(s.monthsToProject).toBe(5);
    const deficit = computeSummary({ ...base, incomes: [{ id: "a", label: "S", amount: 100_000 }] });
    expect(deficit.plannedMonthly).toBe(0);
    expect(deficit.monthsToProject).toBeNull();
  });

  it("place l'épargne en tête de la répartition, puis trie les dépenses", () => {
    const s = computeSummary(base);
    expect(s.breakdown.map((b) => b.id)).toEqual(["epargne", "x", "y", "z"]);
    expect(s.breakdown[0].share).toBeCloseTo(0.4);
  });

  it("gère un budget en déficit", () => {
    const s = computeSummary({ ...base, incomes: [{ id: "a", label: "Salaire", amount: 200_000 }] });
    expect(s.remaining).toBe(-40_000);
    expect(s.status).toBe("deficit");
    expect(s.breakdown.find((b) => b.type === "savings")).toBeUndefined();
    expect(s.goalReached).toBe(false);
  });

  it("gère l'absence de revenu sans division par zéro", () => {
    const s = computeSummary({ ...base, incomes: [] });
    expect(s.savingsRate).toBeNull();
    expect(s.status).toBe("empty");
    expect(s.needsRate).toBe(0);
    expect(s.breakdown.every((b) => b.share === 0)).toBe(true);
  });

  it("neutralise les montants invalides", () => {
    const s = computeSummary({
      ...base,
      incomes: [
        { id: "a", label: "Salaire", amount: -500 },
        { id: "b", label: "NaN", amount: Number.NaN },
        { id: "c", label: "Énorme", amount: 10 ** 15 },
      ],
    });
    expect(s.totalIncome).toBe(MAX_AMOUNT);
  });
});

describe("statuts et durées", () => {
  it("classe le taux d'épargne", () => {
    expect(getStatus(0, 0)).toBe("empty");
    expect(getStatus(100, -1)).toBe("deficit");
    expect(getStatus(100, 0)).toBe("zero");
    expect(getStatus(100, 5)).toBe("fragile");
    expect(getStatus(100, 15)).toBe("good");
    expect(getStatus(100, 20)).toBe("excellent");
  });

  it("calcule le nombre de mois", () => {
    expect(monthsToReach(0, 100)).toBe(0);
    expect(monthsToReach(1000, 0)).toBeNull();
    expect(monthsToReach(1000, 300)).toBe(4);
  });

  it("projette l'épargne cumulée", () => {
    const points = projectSavings(100_000, 50_000, 12);
    expect(points).toHaveLength(13);
    expect(points[0].balance).toBe(100_000);
    expect(points[12].balance).toBe(700_000);
    expect(projectionHorizon(null)).toBe(12);
    expect(projectionHorizon(30)).toBe(32);
    expect(projectionHorizon(500)).toBe(60);
  });
});

describe("conseils", () => {
  it("signale un déficit et un logement trop lourd", () => {
    const state: BudgetState = {
      ...base,
      incomes: [{ id: "a", label: "Salaire", amount: 200_000 }],
    };
    const ids = getInsights(state, computeSummary(state), formatFCFA).map((i) => i.id);
    expect(ids).toContain("deficit");
    expect(ids).toContain("housing");
  });

  it("félicite un taux d'épargne élevé", () => {
    const ids = getInsights(base, computeSummary(base), formatFCFA).map((i) => i.id);
    expect(ids).toContain("excellent");
    expect(ids).toContain("goal-ok");
    expect(ids).toContain("emergency");
  });
});

describe("parseBudgetState", () => {
  it("accepte un état valide", () => {
    expect(parseBudgetState(JSON.parse(JSON.stringify(DEFAULT_BUDGET)))).toEqual(DEFAULT_BUDGET);
  });

  it("rejette les données corrompues", () => {
    expect(parseBudgetState(null)).toBeNull();
    expect(parseBudgetState({ version: 2 })).toBeNull();
    expect(parseBudgetState({ version: 1, incomes: "x", expenses: [], goal: {} })).toBeNull();
    expect(parseBudgetState({ version: 1, incomes: [{ label: "sans id" }], expenses: [], goal: {} })).toBeNull();
  });

  it("nettoie les valeurs hors limites", () => {
    const parsed = parseBudgetState({
      version: 1,
      incomes: [{ id: "a", label: "Salaire", amount: -10 }],
      expenses: [{ id: "b", label: "X", amount: "abc", kind: "autre", category: "inconnue" }],
      goal: { mode: "zzz", percent: 300, amount: 5, projectName: 42, projectTarget: 10, currentSavings: 0 },
    });
    expect(parsed?.incomes[0].amount).toBe(0);
    expect(parsed?.expenses[0]).toMatchObject({ amount: 0, kind: "besoin", category: "autre" });
    expect(parsed?.goal).toMatchObject({ mode: "percent", percent: 80, projectName: "Mon projet" });
  });
});

describe("toCSV", () => {
  it("produit un CSV compatible Excel", () => {
    const csv = toCSV(base, computeSummary(base));
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain("Section;Libellé;Type;Montant (FCFA);% du revenu");
    expect(csv).toContain("Dépense;Loyer;Besoin;120000;30,0");
    expect(csv).toContain("Synthèse;Épargne restante;;160000;40,0");
    expect(csv.split("\r\n").length).toBeGreaterThan(8);
  });

  it("échappe les points-virgules et guillemets", () => {
    const state: BudgetState = {
      ...base,
      incomes: [{ id: "a", label: 'Salaire; "net"', amount: 1 }],
    };
    expect(toCSV(state, computeSummary(state))).toContain('"Salaire; ""net"""');
  });
});

describe("profils prédéfinis", () => {
  it("sont tous valides et équilibrés", () => {
    for (const preset of BUDGET_PRESETS) {
      expect(parseBudgetState(JSON.parse(JSON.stringify(preset.state)))).not.toBeNull();
      expect(computeSummary(preset.state).remaining).toBeGreaterThan(0);
    }
  });
});
