"use client";

import { Bookmark, Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { RESOURCES, type Resource } from "@/content/resources";
import { cn } from "@/lib/cn";
import { formatFCFA } from "@/lib/format";
import { DownloadButton } from "./DownloadButton";
import { PremiumDialog } from "./PremiumDialog";
import { ResourceCover } from "./ResourceCover";
import { useWishlist } from "./useWishlist";

type Filter = "tout" | "gratuit" | "premium" | "liste";

export function ResourceCard({ resource, onDetails, saved }: { resource: Resource; onDetails?: () => void; saved?: boolean }) {
  const free = resource.price === 0;
  return (
    <article className="group flex h-full flex-col rounded-[1.6rem] border border-line bg-white p-3 shadow-card transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-lift">
      <ResourceCover resource={resource} />
      <div className="flex flex-1 flex-col p-3 pt-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[1.08rem] font-bold leading-snug tracking-[-0.015em]">{resource.title}</h3>
          {saved ? <Bookmark className="mt-1 size-4 shrink-0 fill-forest text-forest" aria-label="Dans votre liste" /> : null}
        </div>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{resource.description}</p>
        <p className="mt-3 text-xs font-semibold text-subtle">
          {resource.format} · {resource.pages} pages · {resource.audience}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className={cn("text-lg font-bold tracking-[-0.02em]", free ? "text-forest" : "text-ink")}>
            {free ? "Gratuit" : formatFCFA(resource.price)}
          </p>
          {free && resource.file ? (
            <DownloadButton href={resource.file} fileName={`${resource.slug}.pdf`} title={resource.title} />
          ) : (
            <Button variant="outline" icon={<Eye aria-hidden />} onClick={onDetails}>
              Aperçu
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function ResourcesLibrary() {
  const [filter, setFilter] = useState<Filter>("tout");
  const [open, setOpen] = useState<Resource | null>(null);
  const { items, has } = useWishlist();

  const list = RESOURCES.filter((r) =>
    filter === "gratuit" ? r.price === 0 : filter === "premium" ? r.price > 0 : filter === "liste" ? items.includes(r.slug) : true,
  );

  const filters: Array<[Filter, string, number]> = [
    ["tout", "Toutes", RESOURCES.length],
    ["gratuit", "Gratuites", RESOURCES.filter((r) => r.price === 0).length],
    ["premium", "Premium", RESOURCES.filter((r) => r.price > 0).length],
    ["liste", "Ma liste", items.length],
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer les ressources">
        {filters.map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
              filter === key ? "bg-ink text-white" : "border border-line bg-white text-muted hover:text-ink",
            )}
          >
            {label}
            <span className={cn("rounded-full px-1.5 text-xs tabular-nums", filter === key ? "bg-white/15 text-neon" : "bg-paper text-subtle")}>
              {count}
            </span>
          </button>
        ))}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {list.length} ressource{list.length > 1 ? "s" : ""} affichée{list.length > 1 ? "s" : ""}
      </p>
      {list.length > 0 ? (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((r) => (
            <li key={r.slug}>
              <ResourceCard resource={r} saved={has(r.slug)} onDetails={() => setOpen(r)} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-line bg-white p-10 text-center">
          <p className="font-bold">Votre liste est vide</p>
          <p className="mt-2 text-sm text-muted">Ouvrez l’aperçu d’un guide premium et ajoutez-le à votre liste.</p>
          <Button variant="dark" className="mt-5" onClick={() => setFilter("premium")}>
            Voir les guides premium
          </Button>
        </div>
      )}
      <PremiumDialog resource={open} onClose={() => setOpen(null)} />
    </div>
  );
}
