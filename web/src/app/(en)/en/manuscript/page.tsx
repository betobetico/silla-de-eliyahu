import type { Metadata } from "next";
import Manuscrito from "@/components/Manuscrito";

export const metadata: Metadata = {
  title: "Uncle Isaque’s manuscript · Elijah’s Chair",
  description: "Isaac Garzón Serfaty’s three original handwritten pages and their Spanish transcription: making and delivering Elijah’s chairs.",
  alternates: { canonical: "/en/manuscript", languages: { es: "/manuscrito", en: "/en/manuscript" } },
  openGraph: { title: "Uncle Isaque’s manuscript", description: "His account of Elijah’s chairs, in his own handwriting.", images: ["/historia/isaac.jpg"], locale: "en" },
};

export default function Page() { return <Manuscrito lang="en" />; }
