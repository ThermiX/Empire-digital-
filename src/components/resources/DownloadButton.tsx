"use client";

import { Check, Download, LoaderCircle, RotateCw } from "lucide-react";
import { useState } from "react";
import { buttonClasses, type ButtonVariant } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import { cn } from "@/lib/cn";

type State = "idle" | "loading" | "done" | "error";

/**
 * Télécharge réellement le fichier : récupération, vérification du type,
 * puis enregistrement. Sans JavaScript, le lien natif fonctionne aussi.
 */
export function DownloadButton({
  href,
  fileName,
  title,
  variant = "primary",
  className,
}: {
  href: string;
  fileName: string;
  title: string;
  variant?: ButtonVariant;
  className?: string;
}) {
  const [state, setState] = useState<State>("idle");
  const { toast } = useToast();

  async function download(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      const response = await fetch(href, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      if (!blob.type.includes("pdf") || blob.size === 0) throw new Error("Fichier invalide");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      setState("done");
      toast({ tone: "success", title: "Téléchargement lancé", description: `« ${title} » est en cours d’enregistrement.` });
      window.setTimeout(() => setState("idle"), 4000);
    } catch {
      setState("error");
      toast({
        tone: "error",
        title: "Le téléchargement a échoué",
        description: "Vérifiez votre connexion puis réessayez.",
        action: { label: "Réessayer", onClick: () => setState("idle") },
      });
    }
  }

  const label = { idle: "Télécharger", loading: "Préparation…", done: "Téléchargé", error: "Réessayer" }[state];
  const Icon = { idle: Download, loading: LoaderCircle, done: Check, error: RotateCw }[state];

  return (
    <a
      href={href}
      download={fileName}
      onClick={download}
      aria-busy={state === "loading"}
      aria-label={`${label} — ${title} (PDF)`}
      className={cn(buttonClasses({ variant, size: "md" }), className)}
    >
      <Icon className={cn("size-4", state === "loading" && "animate-spin")} aria-hidden />
      <span aria-live="polite">{label}</span>
    </a>
  );
}
