import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ClearDataButton } from "@/components/ui/ClearDataButton";
import { STORAGE_KEYS } from "@/lib/storage";

export const metadata: Metadata = {
  title: "Confidentialité",
  description: "Comment Argent Clair traite vos données : tout reste sur votre appareil, rien n’est envoyé ni revendu.",
  alternates: { canonical: "/confidentialite" },
};

const STORED = [
  { key: STORAGE_KEYS.simulator, what: "Les montants et libellés saisis dans le simulateur de budget." },
  { key: STORAGE_KEYS.readArticles, what: "La liste des articles de l’Académie que vous avez marqués comme lus." },
  { key: STORAGE_KEYS.readerSize, what: "La taille de texte choisie pour la lecture." },
  { key: STORAGE_KEYS.wishlist, what: "Les guides premium ajoutés à votre liste." },
  { key: STORAGE_KEYS.contactDraft, what: "Le brouillon du formulaire de contact, effacé après validation." },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Confidentialité"
        title={
          <>
            Vos chiffres <span className="text-neon">restent chez vous</span>.
          </>
        }
        lead="Argent Clair fonctionne sans compte et sans serveur de données personnelles. Voici exactement ce qui est enregistré, et où."
      />
      <section className="bg-white py-16 sm:py-24">
        <div className="container-page max-w-3xl space-y-12 text-[1.05rem] leading-relaxed text-[#1d3326]">
          <div>
            <h2 className="text-display-md font-semibold text-ink">Ce que nous enregistrons</h2>
            <p className="mt-4">
              Les données ci-dessous sont stockées uniquement dans le <strong>stockage local de votre navigateur</strong>{" "}
              (localStorage), sur l’appareil que vous utilisez. Elles ne sont ni envoyées, ni partagées, ni revendues.
            </p>
            <ul className="mt-6 divide-y divide-line rounded-3xl border border-line">
              {STORED.map((s) => (
                <li key={s.key} className="p-5">
                  <p className="font-semibold text-ink">{s.what}</p>
                  <p className="mt-1 font-mono text-xs text-subtle">{s.key}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-display-md font-semibold text-ink">Ce que nous n’enregistrons pas</h2>
            <p className="mt-4">
              Pas de compte, pas de cookies publicitaires, pas d’outil de suivi tiers. Le formulaire de contact vérifie
              vos informations dans votre navigateur mais ne les transmet à aucun serveur dans cette version.
            </p>
          </div>
          <div>
            <h2 className="text-display-md font-semibold text-ink">Effacer vos données</h2>
            <p className="mt-4">
              Vous pouvez supprimer toutes les données Argent Clair de cet appareil en un clic. Cette action est
              définitive.
            </p>
            <ClearDataButton className="mt-6" />
          </div>
        </div>
      </section>
    </>
  );
}
