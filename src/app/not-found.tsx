import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="surface-dark relative isolate flex min-h-[80dvh] items-center overflow-hidden bg-ink text-white">
      <div aria-hidden className="bg-ledger absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="container-page py-32 text-center">
        <p className="text-[clamp(6rem,22vw,14rem)] font-bold leading-none tracking-[-0.07em] text-neon">404</p>
        <h1 className="mt-6 text-display-lg font-semibold">Cette page n’existe pas (ou plus).</h1>
        <p className="mx-auto mt-4 max-w-md text-sage">
          Le lien est peut-être erroné. Pas d’inquiétude : votre budget, lui, est toujours là.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/" arrow>
            Retour à l’accueil
          </ButtonLink>
          <ButtonLink href="/academie" variant="outline-light">
            Parcourir l’Académie
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
