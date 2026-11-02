import type { Metadata } from "next";
import { FileText, Lock, Printer } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { ResourcesLibrary } from "@/components/resources/ResourcesLibrary";
import { FREE_RESOURCES } from "@/content/resources";

export const metadata: Metadata = {
  title: "Ressources — Guides et modèles en FCFA",
  description:
    "Téléchargez gratuitement le guide du premier salaire, le défi épargne 52 semaines, un modèle de budget mensuel et une check-list anti-arnaques. Guides premium bientôt disponibles.",
  alternates: { canonical: "/ressources" },
};

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Ressources"
        title={
          <>
            Des guides pratiques, <span className="text-neon">prêts à l’emploi</span>.
          </>
        }
        lead={`${FREE_RESOURCES.length} guides gratuits à télécharger immédiatement, sans inscription, et des guides premium pour aller plus loin.`}
      >
        <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-sage-200">
          <li className="inline-flex items-center gap-2"><FileText className="size-4 text-neon" aria-hidden /> Format PDF</li>
          <li className="inline-flex items-center gap-2"><Printer className="size-4 text-neon" aria-hidden /> Prêts à imprimer</li>
          <li className="inline-flex items-center gap-2"><Lock className="size-4 text-neon" aria-hidden /> Sans inscription ni e-mail</li>
        </ul>
      </PageHero>
      <section aria-label="Bibliothèque de ressources" className="bg-paper py-14 sm:py-20">
        <div className="container-page">
          <ResourcesLibrary />
        </div>
      </section>
    </>
  );
}
