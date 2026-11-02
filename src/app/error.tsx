"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="surface-dark flex min-h-[80dvh] items-center bg-ink text-white">
      <div className="container-page py-32 text-center">
        <p className="text-eyebrow font-bold uppercase text-sage">Erreur inattendue</p>
        <h1 className="mt-5 text-display-lg font-semibold">Quelque chose s’est mal passé.</h1>
        <p className="mx-auto mt-4 max-w-md text-sage">
          Vos données enregistrées ne sont pas affectées. Réessayez, ou revenez à l’accueil.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>Réessayer</Button>
          <ButtonLink href="/" variant="outline-light">
            Retour à l’accueil
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
