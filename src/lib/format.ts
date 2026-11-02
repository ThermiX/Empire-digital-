/**
 * Formatage déterministe (identique côté serveur et navigateur) des montants
 * en FCFA. On n'utilise pas Intl.NumberFormat pour éviter toute divergence de
 * séparateurs entre moteurs ICU, source d'erreurs d'hydratation.
 */

/** Espace fine insécable, séparateur de milliers en typographie française. */
export const THIN_NBSP = " ";
/** Espace insécable classique. */
export const NBSP = " ";

/** Groupe les chiffres par milliers : 1250000 → « 1 250 000 ». */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "−" : "";
  const digits = Math.abs(rounded).toString();
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, THIN_NBSP);
}

/** 350000 → « 350 000 FCFA ». */
export function formatFCFA(value: number, options: { signed?: boolean } = {}): string {
  const base = formatNumber(value);
  const prefix = options.signed && value > 0 ? "+" : "";
  return `${prefix}${base}${NBSP}FCFA`;
}

/** Notation compacte pour axes et étiquettes : 350000 → « 350 k », 1500000 → « 1,5 M ». */
export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  const fmt = (n: number) => {
    const fixed = n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(0) : n.toFixed(1);
    return fixed.replace(/\.0$/, "").replace(".", ",");
  };
  if (abs >= 1_000_000_000) return `${sign}${fmt(abs / 1_000_000_000)}${NBSP}Md`;
  if (abs >= 1_000_000) return `${sign}${fmt(abs / 1_000_000)}${NBSP}M`;
  if (abs >= 1_000) return `${sign}${fmt(abs / 1_000)}${NBSP}k`;
  return `${sign}${Math.round(abs)}`;
}

/** Ratio → pourcentage français : 0.183 → « 18 % » (ou « 18,3 % » avec digits=1). */
export function formatPercent(ratio: number, digits = 0): string {
  if (!Number.isFinite(ratio)) return `0${THIN_NBSP}%`;
  const value = ratio * 100;
  const sign = value < 0 ? "−" : "";
  const fixed = Math.abs(value).toFixed(digits).replace(".", ",");
  const cleaned = digits > 0 ? fixed.replace(/,0+$/, "") : fixed;
  return `${sign}${cleaned}${THIN_NBSP}%`;
}

/** « 1 mois », « 14 mois », « 2 ans et 3 mois ». */
export function formatDuration(months: number): string {
  if (!Number.isFinite(months) || months <= 0) return "0 mois";
  const m = Math.ceil(months);
  if (m < 12) return `${m}${NBSP}mois`;
  const years = Math.floor(m / 12);
  const rest = m % 12;
  const y = `${years}${NBSP}an${years > 1 ? "s" : ""}`;
  return rest === 0 ? y : `${y} et ${rest}${NBSP}mois`;
}

/** Date ISO (AAAA-MM-JJ) → « 12 octobre 2026 ». */
const MONTHS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export function formatDateFr(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d === 1 ? "1er" : d} ${MONTHS_FR[m - 1]} ${y}`;
}

/** Libellé court d'un mois relatif : index 0 → « M0 », 12 → « M12 ». */
export function monthLabel(index: number): string {
  return `M${index}`;
}
