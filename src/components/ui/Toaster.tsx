"use client";

import { AnimatePresence, m } from "framer-motion";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export type ToastTone = "success" | "error" | "info";

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Durée d'affichage en ms (0 = reste affiché). */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends Required<Pick<ToastOptions, "title" | "tone" | "duration">> {
  id: number;
  description?: string;
  action?: ToastOptions["action"];
}

interface ToastContextValue {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé dans <ToastProvider>.");
  return ctx;
}

const MAX_TOASTS = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    counter.current += 1;
    const id = counter.current;
    const item: ToastItem = {
      id,
      title: options.title,
      description: options.description,
      tone: options.tone ?? "info",
      duration: options.duration ?? (options.action ? 7000 : 4500),
      action: options.action,
    };
    setToasts((list) => [...list, item].slice(-MAX_TOASTS));
    return id;
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        role="region"
        className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:items-end sm:px-0"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <ToastCard key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

const icons: Record<ToastTone, ReactNode> = {
  success: <CircleCheck className="size-5 text-neon" aria-hidden />,
  error: <CircleAlert className="size-5 text-danger" aria-hidden />,
  info: <Info className="size-5 text-sage" aria-hidden />,
};

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (item.duration === 0 || paused) return;
    const timer = window.setTimeout(onDismiss, item.duration);
    return () => window.clearTimeout(timer);
  }, [item.duration, paused, onDismiss]);

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role={item.tone === "error" ? "alert" : "status"}
      className={cn(
        "surface-dark pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-white/10 bg-ink/95 p-4 text-white shadow-lift backdrop-blur-xl",
      )}
    >
      <span className="mt-0.5 shrink-0">{icons[item.tone]}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug">{item.title}</p>
        {item.description ? (
          <p className="mt-1 text-[0.82rem] leading-relaxed text-sage">{item.description}</p>
        ) : null}
        {item.action ? (
          <button
            type="button"
            onClick={() => {
              item.action?.onClick();
              onDismiss();
            }}
            className="mt-2.5 rounded-full bg-neon px-3 py-1 text-xs font-bold text-ink transition-colors hover:bg-neon-600"
          >
            {item.action.label}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer la notification"
        className="-m-1 shrink-0 rounded-full p-1 text-sage transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="size-4" aria-hidden />
      </button>
    </m.div>
  );
}
