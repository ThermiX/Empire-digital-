import {
  Bus,
  CreditCard,
  GraduationCap,
  HandHelping,
  HeartHandshake,
  HeartPulse,
  House,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Tag,
  Ticket,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { CategoryKey } from "@/lib/budget";

export const CATEGORY_ICONS: Record<CategoryKey, LucideIcon> = {
  logement: House,
  alimentation: ShoppingBasket,
  transport: Bus,
  factures: Zap,
  communication: Smartphone,
  famille: HeartHandshake,
  sante: HeartPulse,
  education: GraduationCap,
  loisirs: Ticket,
  habillement: Shirt,
  dettes: CreditCard,
  maison: HandHelping,
  autre: Tag,
};
