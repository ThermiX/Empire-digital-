import type { BudgetState, ExpenseLine, IncomeLine, SavingsGoal } from "@/lib/budget";

type PresetKey = "etudiant" | "jeune-salarie" | "famille" | "entrepreneur";

export interface BudgetPreset {
  key: PresetKey;
  label: string;
  description: string;
  state: BudgetState;
}

const inc = (id: string, label: string, amount: number): IncomeLine => ({ id, label, amount });
const exp = (
  id: string,
  label: string,
  amount: number,
  category: ExpenseLine["category"],
  kind: ExpenseLine["kind"] = "besoin",
): ExpenseLine => ({ id, label, amount, category, kind });
const goal = (g: Partial<SavingsGoal> & Pick<SavingsGoal, "projectName" | "projectTarget">): SavingsGoal => ({
  mode: "percent",
  percent: 20,
  amount: 50_000,
  currentSavings: 0,
  ...g,
});

const jeuneSalarie: BudgetState = {
  version: 1,
  incomes: [
    inc("rev-salaire", "Salaire net", 350_000),
    inc("rev-complement", "Activité complémentaire", 30_000),
  ],
  expenses: [
    exp("dep-loyer", "Loyer", 90_000, "logement"),
    exp("dep-alim", "Alimentation & marché", 60_000, "alimentation"),
    exp("dep-famille", "Famille & solidarité", 35_000, "famille"),
    exp("dep-transport", "Transport", 25_000, "transport"),
    exp("dep-factures", "Électricité, eau, internet", 22_000, "factures"),
    exp("dep-credit", "Remboursement d’avance", 20_000, "dettes"),
    exp("dep-com", "Crédit & data mobile", 10_000, "communication"),
    exp("dep-sante", "Santé & pharmacie", 8_000, "sante"),
    exp("dep-loisirs", "Sorties & loisirs", 30_000, "loisirs", "envie"),
    exp("dep-habits", "Habillement & soins", 15_000, "habillement", "envie"),
  ],
  goal: goal({ projectName: "Fonds d’urgence", projectTarget: 1_000_000, currentSavings: 150_000 }),
};

export const DEFAULT_BUDGET: BudgetState = jeuneSalarie;

export const BUDGET_PRESETS: BudgetPreset[] = [
  {
    key: "etudiant",
    label: "Étudiant·e",
    description: "Bourse, aide familiale et petit job",
    state: {
      version: 1,
      incomes: [
        inc("rev-bourse", "Bourse ou aide familiale", 60_000),
        inc("rev-job", "Job étudiant", 40_000),
      ],
      expenses: [
        exp("dep-chambre", "Chambre", 25_000, "logement"),
        exp("dep-alim", "Alimentation", 30_000, "alimentation"),
        exp("dep-transport", "Transport", 10_000, "transport"),
        exp("dep-fournitures", "Fournitures & photocopies", 8_000, "education"),
        exp("dep-com", "Crédit & data mobile", 5_000, "communication"),
        exp("dep-loisirs", "Sorties", 7_000, "loisirs", "envie"),
      ],
      goal: goal({ percent: 10, projectName: "Ordinateur portable", projectTarget: 250_000 }),
    },
  },
  {
    key: "jeune-salarie",
    label: "Jeune salarié·e",
    description: "Premier emploi, en ville",
    state: jeuneSalarie,
  },
  {
    key: "famille",
    label: "Famille",
    description: "Deux revenus, deux enfants",
    state: {
      version: 1,
      incomes: [
        inc("rev-salaire", "Salaire net", 650_000),
        inc("rev-conjoint", "Revenu du conjoint", 250_000),
      ],
      expenses: [
        exp("dep-loyer", "Loyer", 200_000, "logement"),
        exp("dep-alim", "Alimentation", 150_000, "alimentation"),
        exp("dep-ecole", "Scolarité des enfants", 90_000, "education"),
        exp("dep-famille", "Famille & solidarité", 70_000, "famille"),
        exp("dep-transport", "Transport & carburant", 60_000, "transport"),
        exp("dep-factures", "Électricité, eau, internet", 45_000, "factures"),
        exp("dep-maison", "Aide à la maison", 40_000, "maison"),
        exp("dep-sante", "Santé & mutuelle", 25_000, "sante"),
        exp("dep-com", "Téléphonie", 20_000, "communication"),
        exp("dep-loisirs", "Loisirs & sorties", 40_000, "loisirs", "envie"),
      ],
      goal: goal({ projectName: "Apport immobilier", projectTarget: 5_000_000, currentSavings: 800_000 }),
    },
  },
  {
    key: "entrepreneur",
    label: "Entrepreneur·e",
    description: "Revenus variables d’une activité",
    state: {
      version: 1,
      incomes: [
        inc("rev-benefice", "Bénéfice de l’activité", 420_000),
        inc("rev-presta", "Prestations ponctuelles", 60_000),
      ],
      expenses: [
        exp("dep-loyer", "Loyer", 100_000, "logement"),
        exp("dep-alim", "Alimentation", 75_000, "alimentation"),
        exp("dep-microcredit", "Microcrédit", 70_000, "dettes"),
        exp("dep-famille", "Famille & solidarité", 60_000, "famille"),
        exp("dep-transport", "Transport", 40_000, "transport"),
        exp("dep-factures", "Factures", 30_000, "factures"),
        exp("dep-com", "Téléphonie & data", 15_000, "communication"),
        exp("dep-sante", "Santé", 10_000, "sante"),
        exp("dep-loisirs", "Loisirs", 20_000, "loisirs", "envie"),
      ],
      goal: goal({ percent: 15, projectName: "Fonds de roulement", projectTarget: 1_500_000, currentSavings: 200_000 }),
    },
  },
];

export const EMPTY_BUDGET: BudgetState = {
  version: 1,
  incomes: [inc("rev-salaire", "Salaire net", 0)],
  expenses: [],
  goal: goal({ projectName: "Mon projet", projectTarget: 0 }),
};
