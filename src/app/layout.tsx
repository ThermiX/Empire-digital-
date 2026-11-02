import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { ToastProvider } from "@/components/ui/Toaster";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Éducation financière en FCFA`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "éducation financière",
    "budget",
    "simulateur de budget",
    "FCFA",
    "épargne",
    "salaire",
    "Afrique francophone",
    "UEMOA",
    "tontine",
    "investir BRVM",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Votre argent, enfin clair.`,
    description: siteConfig.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Votre argent, enfin clair.`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
  category: "finance",
};

export const viewport: Viewport = {
  themeColor: "#04180C",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={manrope.variable}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#contenu"
          className="sr-only z-[80] rounded-full bg-neon px-5 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Aller au contenu
        </a>
        <MotionProvider>
          <ToastProvider>
            <Header />
            <main id="contenu" tabIndex={-1} className="flex-1 outline-none">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
