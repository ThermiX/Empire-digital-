import { Briefcase, CircleAlert, Landmark, PiggyBank, Wallet, type LucideIcon } from "lucide-react";
import type { CategorySlug } from "@/content/academy";

export const CATEGORY_ICON: Record<CategorySlug, LucideIcon> = {
  salaire: Wallet,
  epargne: PiggyBank,
  entrepreneuriat: Briefcase,
  "finance-personnelle": Landmark,
  erreurs: CircleAlert,
};

export function CategoryIcon({ slug, className }: { slug: CategorySlug; className?: string }) {
  const Icon = CATEGORY_ICON[slug];
  return <Icon className={className} aria-hidden />;
}
