import Link from "next/link";
import type { Route } from "next";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "dark"
  | "light"
  | "outline"
  | "outline-light"
  | "ghost"
  | "ghost-light"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-[-0.01em] transition-[background-color,color,box-shadow,border-color,transform] duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-neon text-ink shadow-[0_1px_0_rgb(255_255_255/0.4)_inset] hover:bg-neon-600 hover:shadow-glow",
  dark: "bg-ink text-white hover:bg-forest",
  light: "bg-white text-ink hover:bg-paper",
  outline: "border border-line bg-white text-ink hover:border-ink/30 hover:bg-paper",
  "outline-light": "border border-white/20 text-white hover:border-white/50 hover:bg-white/[0.06]",
  ghost: "text-forest hover:bg-mist",
  "ghost-light": "text-sage hover:bg-white/[0.06] hover:text-white",
  danger: "bg-danger-ink text-white hover:bg-[#962f21]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[0.85rem]",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-14 px-7 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(base, variants[variant], sizes[size], className);
}

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  /** Affiche une flèche qui glisse au survol. */
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

function Content({ icon, arrow, children }: Pick<CommonProps, "icon" | "arrow" | "children">) {
  return (
    <>
      {icon ? <span className="inline-flex shrink-0 [&>svg]:size-[1.1em]">{icon}</span> : null}
      <span>{children}</span>
      {arrow ? (
        <ArrowRight
          aria-hidden
          className="size-[1.05em] shrink-0 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-1"
        />
      ) : null}
    </>
  );
}

export function Button({
  variant,
  size,
  icon,
  arrow,
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <button type={type} className={buttonClasses({ variant, size, className })} {...rest}>
      <Content icon={icon} arrow={arrow}>
        {children}
      </Content>
    </button>
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  icon,
  arrow,
  className,
  children,
  prefetch,
  onNavigate,
  ...rest
}: CommonProps & { href: Route; prefetch?: boolean; onNavigate?: () => void } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "href" | "children"
  >) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      onNavigate={onNavigate}
      className={buttonClasses({ variant, size, className })} {...rest}>
      <Content icon={icon} arrow={arrow}>
        {children}
      </Content>
    </Link>
  );
}
