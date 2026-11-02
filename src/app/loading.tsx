export default function Loading() {
  return (
    <div role="status" aria-label="Chargement" className="surface-dark flex min-h-[70dvh] items-center justify-center bg-ink">
      <span className="size-10 animate-spin rounded-full border-2 border-white/15 border-t-neon" />
      <span className="sr-only">Chargement…</span>
    </div>
  );
}
