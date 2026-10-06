import type { Metadata } from "next";
import Manuscrito from "@/components/Manuscrito";

export const metadata: Metadata = {
  title: "El manuscrito de Tito Isaque · La silla de Eliyahu",
  description: "Las tres páginas originales de Isaac Garzón Serfaty z”l y su transcripción: cómo hacía y transportaba sus sillas de Eliyahu.",
  alternates: { canonical: "/manuscrito", languages: { es: "/manuscrito", en: "/en/manuscript" } },
  openGraph: { title: "El manuscrito de Tito Isaque", description: "Su relato de las sillas de Eliyahu, de su puño y letra.", images: ["/manuscrito/pagina-1.jpg"], locale: "es" },
};

export default function Page() { return <Manuscrito lang="es" />; }
