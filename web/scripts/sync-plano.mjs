// Copia el plano (fuente única en ../plano) a la web antes de dev y build.
// No edites las copias: se sobrescriben en cada arranque.
import { copyFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..");
const plano = join(web, "..", "plano");

if (!existsSync(join(plano, "silla.json"))) {
  console.error("sync-plano: no encuentro ../plano/silla.json");
  process.exit(1);
}

const copia = (de, a) => {
  mkdirSync(dirname(a), { recursive: true });
  copyFileSync(de, a);
};

copia(join(plano, "silla.json"), join(web, "src/data/silla.json"));
for (const f of ["silla-de-eliyahu.dxf", "silla-de-eliyahu.pdf", "despiece.csv", "silla.json"]) {
  copia(join(plano, f), join(web, "public/descargas", f));
}
for (const f of readdirSync(join(plano, "original"))) {
  copia(join(plano, "original", f), join(web, "public/original", f));
}
copia(
  join(web, "node_modules/@fontsource/frank-ruhl-libre/files/frank-ruhl-libre-hebrew-700-normal.woff"),
  join(web, "public/fuentes/frank-ruhl-libre-hebrew-700.woff"),
);
console.log("sync-plano: plano copiado a la web");
