import type { Metadata } from "next";
import { Calculator, HardDrive, ShieldCheck, Zap } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { SimulatorLoader } from "@/components/simulator/SimulatorLoader";

export const metadata: Metadata = {
  title: "Simulateur de budget en FCFA",
  description:
    "Saisissez votre salaire, vos dépenses et votre objectif d’épargne : visualisez instantanément la répartition de votre argent, votre taux d’épargne et la date d’atteinte de votre projet.",
  alternates: { canonical: "/simulateur" },
};

const facts = [
  { icon: Zap, label: "Résultats instantanés" },
  { icon: HardDrive, label: "Sauvegarde sur votre appareil" },
  { icon: ShieldCheck, label: "Aucune inscription, aucune donnée envoyée" },
];

export default function SimulatorPage() {
  return (
    <>
      <PageHero
        eyebrow="Simulateur de budget"
        title={
          <>
            Voyez où va <span className="text-neon">chaque franc</span>.
          </>
        }
        lead="Entrez vos revenus, vos dépenses et votre objectif d’épargne. Argent Clair calcule votre reste à vivre, votre taux d’épargne et le temps nécessaire pour financer votre projet."
      >
        <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-sage-200">
          {facts.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-2">
              <Icon className="size-4 text-neon" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </PageHero>

      <section aria-label="Simulateur" className="bg-paper py-10 sm:py-14">
        <div className="container-page">
          <SimulatorLoader />
          <aside className="mt-16 flex items-start gap-4 rounded-3xl border border-line bg-white p-5 text-sm leading-relaxed text-muted sm:p-6">
            <Calculator className="mt-0.5 size-5 shrink-0 text-forest" aria-hidden />
            <p>
              <strong className="text-ink">Comment sont faits les calculs ?</strong> Épargne restante = revenu total −
              dépenses totales. Taux d’épargne = épargne restante ÷ revenu total. La projection suppose une épargne
              constante chaque mois, plafonnée à ce qui reste réellement disponible, sans intérêts. Ces résultats sont
              des estimations pédagogiques, pas un conseil financier personnalisé.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
