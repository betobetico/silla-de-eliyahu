import type { Metadata, Viewport } from "next";
import "../globals.css";
import { dict } from "@/lib/contenido";
import { sans, serif } from "@/lib/fuentes";

const t = dict.en;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://sillaeliyahu.vercel.app"),
  title: t.meta.title,
  description: t.meta.description,
  alternates: { languages: { es: "/", en: "/en" } },
  openGraph: { title: t.meta.title, description: t.meta.description, images: ["/historia/final-frente.jpg"], locale: "en" },
};

export const viewport: Viewport = { themeColor: "#f3eee4", colorScheme: "light" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
