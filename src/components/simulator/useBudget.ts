"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { DEFAULT_BUDGET } from "@/content/budget-presets";
import {
  MAX_LINES,
  computeSummary,
  parseBudgetState,
  type BudgetState,
  type ExpenseLine,
  type IncomeLine,
  type SavingsGoal,
} from "@/lib/budget";
import { STORAGE_KEYS, readJSON, writeJSON, type StorageResult } from "@/lib/storage";

type Action =
  | { type: "replace"; state: BudgetState }
  | { type: "income/update"; id: string; patch: Partial<IncomeLine> }
  | { type: "income/insert"; line: IncomeLine; index?: number }
  | { type: "income/remove"; id: string }
  | { type: "expense/update"; id: string; patch: Partial<ExpenseLine> }
  | { type: "expense/insert"; line: ExpenseLine; index?: number }
  | { type: "expense/remove"; id: string }
  | { type: "goal/update"; patch: Partial<SavingsGoal> };

function insertAt<T>(list: T[], item: T, index?: number): T[] {
  if (list.length >= MAX_LINES) return list;
  const i = index === undefined ? list.length : Math.max(0, Math.min(index, list.length));
  return [...list.slice(0, i), item, ...list.slice(i)];
}

function reducer(state: BudgetState, action: Action): BudgetState {
  switch (action.type) {
    case "replace":
      return action.state;
    case "income/update":
      return {
        ...state,
        incomes: state.incomes.map((l) => (l.id === action.id ? { ...l, ...action.patch } : l)),
      };
    case "income/insert":
      return { ...state, incomes: insertAt(state.incomes, action.line, action.index) };
    case "income/remove":
      return { ...state, incomes: state.incomes.filter((l) => l.id !== action.id) };
    case "expense/update":
      return {
        ...state,
        expenses: state.expenses.map((l) => (l.id === action.id ? { ...l, ...action.patch } : l)),
      };
    case "expense/insert":
      return { ...state, expenses: insertAt(state.expenses, action.line, action.index) };
    case "expense/remove":
      return { ...state, expenses: state.expenses.filter((l) => l.id !== action.id) };
    case "goal/update":
      return { ...state, goal: { ...state.goal, ...action.patch } };
  }
}

export type SaveStatus = "idle" | "saving" | "saved" | "unavailable";

interface InitialLoad {
  state: BudgetState;
  result: StorageResult<BudgetState>;
}

function loadInitial(): InitialLoad {
  const result = readJSON(STORAGE_KEYS.simulator, parseBudgetState);
  return { state: result.ok ? result.value : DEFAULT_BUDGET, result };
}

/**
 * État du simulateur, synchronisé avec le stockage local du navigateur.
 * Ce hook n'est utilisé que côté client (composant chargé sans SSR).
 */
export function useBudget() {
  const [initial] = useState(loadInitial);
  const [state, dispatch] = useReducer(reducer, initial.state);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(
    initial.result.ok ? "saved" : initial.result.reason === "unavailable" ? "unavailable" : "idle",
  );
  const firstRender = useRef(true);

  const update = useCallback((action: Action) => {
    dispatch(action);
    setSaveStatus((s) => (s === "unavailable" ? s : "saving"));
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      const ok = writeJSON(STORAGE_KEYS.simulator, state);
      setSaveStatus(ok ? "saved" : "unavailable");
    }, 350);
    return () => window.clearTimeout(timer);
  }, [state]);

  const summary = useMemo(() => computeSummary(state), [state]);

  return { state, summary, update, saveStatus, initialLoad: initial.result };
}

export type BudgetUpdate = ReturnType<typeof useBudget>["update"];
