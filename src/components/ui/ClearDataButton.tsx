"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { STORAGE_KEYS, removeKey } from "@/lib/storage";
import { Button } from "./Button";
import { useToast } from "./Toaster";

export function ClearDataButton({ className }: { className?: string }) {
  const [confirming, setConfirming] = useState(false);
  const { toast } = useToast();

  if (!confirming) {
    return (
      <Button variant="outline" icon={<Trash2 aria-hidden />} className={className} onClick={() => setConfirming(true)}>
        Effacer mes données
      </Button>
    );
  }
  return (
    <div className={className} role="group" aria-label="Confirmer l’effacement">
      <p className="text-sm font-semibold text-danger-ink">Confirmer la suppression de toutes vos données ?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="danger"
          onClick={() => {
            const ok = Object.values(STORAGE_KEYS).map(removeKey).every(Boolean);
            setConfirming(false);
            toast(
              ok
                ? { tone: "success", title: "Données effacées", description: "Rechargez une page pour repartir de zéro." }
                : { tone: "error", title: "Effacement impossible", description: "Votre navigateur bloque l’accès au stockage local." },
            );
          }}
        >
          Oui, tout effacer
        </Button>
        <Button variant="ghost" onClick={() => setConfirming(false)}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
