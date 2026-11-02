"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { mainNav } from "@/lib/site";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // Ferme le menu à chaque changement de page (y compris boutons précédent/suivant).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <>
      <header
        className={cn(
          "surface-dark no-print fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled || open
            ? "border-b border-white/[0.07] bg-ink/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="container-page flex h-[4.25rem] items-center justify-between gap-6">
          <Logo onNavigate={close} />

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-1 rounded-full bg-white/[0.035] p-1 ring-1 ring-inset ring-white/[0.07]">
              {mainNav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href} className="relative">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative z-10 block rounded-full px-4 py-2 text-[0.88rem] font-medium transition-colors duration-200",
                        active ? "text-white" : "text-sage hover:text-white",
                      )}
                    >
                      {item.label}
                    </Link>
                    {active ? (
                      <m.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-full bg-white/[0.09] ring-1 ring-inset ring-white/[0.08]"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink href="/simulateur" size="sm" arrow className="hidden sm:inline-flex">
              Simuler mon budget
            </ButtonLink>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              className="inline-flex size-10 items-center justify-center rounded-full text-white ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/[0.08] lg:hidden"
            >
              {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? <MobileMenu pathname={pathname} onClose={close} toggleRef={toggleRef} /> : null}
      </AnimatePresence>
    </>
  );
}

function MobileMenu({
  pathname,
  onClose,
  toggleRef,
}: {
  pathname: string;
  onClose: () => void;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const toggle = toggleRef.current;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [],
      );
    focusables()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = [toggle, ...focusables()].filter(Boolean) as HTMLElement[];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = previousOverflow;
      toggle?.focus({ preventScroll: true });
    };
  }, [onClose, toggleRef]);

  return (
    <m.div
      id="menu-mobile"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu principal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="surface-dark fixed inset-0 z-40 overflow-y-auto bg-ink pt-[4.25rem] lg:hidden"
    >
      <div aria-hidden className="bg-ledger pointer-events-none absolute inset-0 opacity-60" />
      <nav aria-label="Navigation mobile" className="container-page relative flex min-h-full flex-col pb-10 pt-6">
        <ul className="flex flex-col">
          {mainNav.map((item, i) => {
            const active = isActive(pathname, item.href);
            return (
              <m.li
                key={item.href}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 + i * 0.045, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="border-b border-white/[0.07]"
              >
                <Link
                  href={item.href}
                  onNavigate={onClose}
                  aria-current={active ? "page" : undefined}
                  className="group flex items-center justify-between py-5"
                >
                  <span>
                    <span
                      className={cn(
                        "block text-[1.9rem] font-semibold tracking-[-0.035em]",
                        active ? "text-neon" : "text-white",
                      )}
                    >
                      {item.label}
                    </span>
                    {item.description ? (
                      <span className="mt-0.5 block text-sm text-sage">{item.description}</span>
                    ) : null}
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="size-6 text-sage transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-neon"
                  />
                </Link>
              </m.li>
            );
          })}
        </ul>
        <m.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="mt-auto pt-10"
        >
          <ButtonLink href="/simulateur" size="lg" arrow className="w-full" onNavigate={onClose}>
            Simuler mon budget
          </ButtonLink>
          <p className="mt-5 text-center text-xs text-sage-500">
            Gratuit · Sans inscription · Vos données restent sur votre appareil
          </p>
        </m.div>
      </nav>
    </m.div>
  );
}
