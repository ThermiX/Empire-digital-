import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question sur le simulateur, l’Académie ou les guides ? Écrivez à l’équipe Argent Clair.",
  alternates: { canonical: "/contact" },
};

const FAQ = [
  {
    q: "Argent Clair est-il vraiment gratuit ?",
    a: "Oui. Le simulateur, l’Académie et les guides gratuits sont accessibles sans inscription. Des guides premium seront proposés plus tard ; leur achat n’est pas encore ouvert.",
  },
  {
    q: "Mes données sont-elles envoyées quelque part ?",
    a: "Non. Les valeurs du simulateur, votre progression dans l’Académie et votre liste de guides sont enregistrées uniquement dans le stockage local de votre navigateur. Vous pouvez les effacer à tout moment.",
  },
  {
    q: "Les conseils remplacent-ils un conseiller financier ?",
    a: "Non. Nos contenus sont pédagogiques. Pour une décision importante (crédit, investissement, création d’entreprise), consultez un professionnel agréé.",
  },
  {
    q: "Puis-je utiliser les guides dans mon entreprise ou mon association ?",
    a: "Oui, les guides gratuits peuvent être imprimés et partagés librement, à condition de ne pas les revendre ni les modifier.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Parlons de <span className="text-neon">votre argent</span>.
          </>
        }
        lead="Une question, une suggestion de cours, une idée de partenariat ? Remplissez le formulaire : il vous guide champ par champ."
      />
      <section className="bg-paper py-14 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
          <ContactForm />
          <aside aria-labelledby="faq-titre" className="lg:sticky lg:top-28">
            <h2 id="faq-titre" className="text-display-md font-semibold">
              Questions fréquentes
            </h2>
            <div className="mt-6 space-y-3">
              {FAQ.map((item) => (
                <details key={item.q} className="group rounded-2xl border border-line bg-white open:shadow-card">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl p-5 font-bold [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown className="size-5 shrink-0 text-subtle transition-transform duration-300 group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
