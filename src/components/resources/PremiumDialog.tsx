"use client";

import { Bookmark, BookmarkCheck, Check, Info, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import type { Resource } from "@/content/resources";
import { formatFCFA } from "@/lib/format";
import { ResourceCover } from "./ResourceCover";
import { useWishlist } from "./useWishlist";

export function PremiumDialog({ resource, onClose }: { resource: Resource | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { has, toggle } = useWishlist();
  const { toast } = useToast();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (resource && !dialog.open) dialog.showModal();
    if (!resource && dialog.open) dialog.close();
  }, [resource]);

  // Ferme la fenêtre si la page est masquée (navigation).
  useEffect(() => {
    const dialog = ref.current;
    return () => dialog?.close();
  }, []);

  const saved = resource ? has(resource.slug) : false;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="premium-titre"
      className="m-auto w-[min(56rem,calc(100%-1.5rem))] max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-[1.75rem] bg-white p-0 text-ink shadow-lift backdrop:bg-ink/70 backdrop:backdrop-blur-sm open:animate-[rise_0.4s_var(--ease-out-expo)]"
    >
      {resource ? (
        <div className="grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
          <div className="bg-paper p-5 sm:p-8">
            <ResourceCover resource={resource} />
          </div>
          <div className="relative p-6 sm:p-8">
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-full text-muted hover:bg-mist hover:text-ink"
            >
              <X className="size-5" aria-hidden />
            </button>
            <p className="text-eyebrow font-bold uppercase text-forest">Guide premium</p>
            <h2 id="premium-titre" className="mt-3 pr-10 text-display-md font-semibold">
              {resource.title}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {resource.subtitle} · {resource.format} · {resource.pages} pages
            </p>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.03em]">{formatFCFA(resource.price)}</p>
            <p className="mt-4 leading-relaxed text-muted">{resource.description}</p>

            {resource.contents ? (
              <div className="mt-6">
                <h3 className="text-sm font-bold">Sommaire</h3>
                <ol className="mt-3 space-y-2 text-sm">
                  {resource.contents.map((c, i) => (
                    <li key={c} className="flex gap-3">
                      <span className="w-5 shrink-0 font-bold tabular-nums text-forest-300">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[#1d3326]">{c}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            <ul className="mt-6 space-y-2 text-sm">
              {resource.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-forest" aria-hidden />
                  {h}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-sm text-warning-ink">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>
                <strong>Achat bientôt disponible.</strong> Le paiement en ligne n’est pas encore ouvert : aucun paiement
                n’est possible ni demandé pour le moment. Ajoutez ce guide à votre liste pour le retrouver facilement.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant={saved ? "outline" : "dark"}
                icon={saved ? <BookmarkCheck aria-hidden /> : <Bookmark aria-hidden />}
                aria-pressed={saved}
                onClick={() => {
                  const { added, saved: persisted } = toggle(resource.slug);
                  toast({
                    tone: persisted ? "success" : "error",
                    title: persisted
                      ? added
                        ? "Ajouté à votre liste"
                        : "Retiré de votre liste"
                      : "Liste non enregistrée",
                    description: persisted
                      ? "Votre liste est conservée sur cet appareil."
                      : "Votre navigateur bloque le stockage local.",
                  });
                }}
              >
                {saved ? "Dans ma liste" : "Ajouter à ma liste"}
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
