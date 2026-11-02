"use client";

import { useLayoutEffect, useRef, useState, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { MAX_AMOUNT } from "@/lib/budget";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

type CurrencyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "inputMode" | "max" | "step"
> & {
  value: number;
  onValueChange: (value: number) => void;
  max?: number;
  /** Incrément des flèches du clavier (Maj : ×10). */
  step?: number;
  suffix?: string;
  inputClassName?: string;
  size?: "md" | "lg";
};

/** Place le curseur après le n-ième chiffre de la chaîne formatée. */
function caretAfterDigits(text: string, digits: number): number {
  if (digits <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] >= "0" && text[i] <= "9") {
      seen += 1;
      if (seen === digits) return i + 1;
    }
  }
  return text.length;
}

/**
 * Champ de montant en FCFA : formatage des milliers en direct, curseur stable,
 * flèches haut/bas pour ajuster, plafond de sécurité.
 */
export function CurrencyInput({
  value,
  onValueChange,
  max = MAX_AMOUNT,
  step = 1000,
  suffix = "FCFA",
  className,
  inputClassName,
  size = "md",
  onBlur,
  onKeyDown,
  ...rest
}: CurrencyInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const pendingCaret = useRef<number | null>(null);
  const [empty, setEmpty] = useState(false);
  const [, rerender] = useState(0);

  const display = empty && value === 0 ? "" : formatNumber(value);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || pendingCaret.current === null || document.activeElement !== el) return;
    const pos = caretAfterDigits(el.value, pendingCaret.current);
    pendingCaret.current = null;
    el.setSelectionRange(pos, pos);
  });

  function commit(next: number, caretDigits: number) {
    pendingCaret.current = caretDigits;
    if (next !== value) onValueChange(next);
    else rerender((n) => n + 1);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    const selection = event.target.selectionStart ?? raw.length;
    const digitsBefore = raw.slice(0, selection).replace(/\D/g, "").length;
    const digits = raw.replace(/\D/g, "");

    if (digits === "") {
      setEmpty(true);
      commit(0, 0);
      return;
    }

    const stripped = digits.replace(/^0+(?=\d)/, "");
    const removedZeros = digits.length - stripped.length;
    const next = Number(stripped);

    if (!Number.isSafeInteger(next) || next > max) {
      // Saisie refusée : on conserve la valeur précédente.
      commit(value, Math.max(0, digitsBefore - 1));
      return;
    }
    setEmpty(false);
    commit(next, Math.max(0, digitsBefore - removedZeros));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const delta = (event.shiftKey ? step * 10 : step) * (event.key === "ArrowUp" ? 1 : -1);
      const next = Math.min(max, Math.max(0, value + delta));
      setEmpty(false);
      commit(next, String(next).length);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        value={display}
        placeholder="0"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          setEmpty(false);
          onBlur?.(event);
        }}
        className={cn(
          "field-input pr-[4.2rem] text-right font-semibold tabular-nums tracking-[-0.01em]",
          size === "lg" && "py-3.5 text-xl",
          inputClassName,
        )}
        {...rest}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-bold tracking-wide text-subtle"
      >
        {suffix}
      </span>
    </div>
  );
}
