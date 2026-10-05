import { Archivo, Frank_Ruhl_Libre } from "next/font/google";

export const serif = Frank_Ruhl_Libre({
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "700"],
  variable: "--serif",
  display: "swap",
});

export const sans = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--sans",
  display: "swap",
});
