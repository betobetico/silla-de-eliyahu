import datos from "@/data/silla.json";

export type Caja = [number, number, number, number, number, number];

export type Pieza = {
  id: string;
  tipo: string;
  nombre: string;
  name: string;
  forma: "caja" | "tapizado" | "listones" | "copete" | "brazo" | "mensula";
  caja: Caja;
  seccion: string;
  espigas: number;
  origen: "plano" | "deducido" | "supuesto";
  explota: [number, number, number];
  nota?: string;
  listones?: { cantidad: number; ancho: number; direccion: string };
  perfil?: { hombro: number; pico: number; tramo_recto: number };
  brazo?: {
    x_interior: number;
    ancho_atras: number;
    ancho_delante: number;
    hacia: number;
    y0: number;
    y1: number;
    z_atras: number;
    z_delante: number;
    grueso: number;
  };
};

export type Duda = {
  id: string;
  titulo: string;
  detalle: string;
  decision: string;
  alternativa: string;
};

export const silla = datos as unknown as {
  meta: Record<string, unknown>;
  inscripcion: {
    lineas: string[];
    traduccion: string;
    translation: string;
    palabras: string[];
    alto_letra: number;
    linea_base: number[];
  };
  piezas: Pieza[];
  dudas: Duda[];
};

/** Perfil del copete en el plano x-z (el mismo cálculo que plano/generar.py). */
export function perfilCopete(p: Pieza, pasos = 48): [number, number][] {
  const [x0, , z0, x1] = p.caja;
  const { hombro, pico, tramo_recto } = p.perfil!;
  const centro = (x0 + x1) / 2;
  const semi = (x1 - x0) / 2 - tramo_recto;
  const arriba: [number, number][] = [];
  for (let i = 0; i <= pasos; i++) {
    const x = x1 - ((x1 - x0) * i) / pasos;
    const u = Math.abs(x - centro);
    const h = u >= semi ? hombro : hombro + (pico - hombro) * (0.5 + 0.5 * Math.cos((Math.PI * u) / semi));
    arriba.push([x, z0 + h]);
  }
  return [[x0, z0], [x1, z0], ...arriba];
}

/** Ménsula del reposapiés en el plano y-z: escuadra con el lado inferior en curva cóncava. */
export function perfilMensula(p: Pieza, pasos = 16): [number, number][] {
  const [, y0, z0, , y1, z1] = p.caja;
  const pts: [number, number][] = [[y0, z0], [y0, z1], [y1, z1]];
  for (let i = 1; i < pasos; i++) {
    const t = (Math.PI / 2) * (i / pasos);
    pts.push([y1 - (y1 - y0) * Math.sin(t), z0 + (z1 - z0) * Math.cos(t)]);
  }
  return pts;
}

export function verticesBrazo(p: Pieza): [number, number, number][] {
  const b = p.brazo!;
  const pts: [number, number, number][] = [];
  for (const [y, ancho] of [[b.y0, b.ancho_atras], [b.y1, b.ancho_delante]] as const) {
    const t = (y - b.y0) / (b.y1 - b.y0);
    const ztop = b.z_atras + (b.z_delante - b.z_atras) * t;
    for (const x of [b.x_interior, b.x_interior + b.hacia * ancho]) {
      pts.push([x, y, ztop], [x, y, ztop - b.grueso]);
    }
  }
  return pts;
}

/** Tipos de pieza únicos, en el orden del despiece, con su cantidad. */
export function tipos() {
  const vistos = new Map<string, { pieza: Pieza; cantidad: number }>();
  for (const p of silla.piezas) {
    const n = p.forma === "listones" ? p.listones!.cantidad : 1;
    const t = vistos.get(p.tipo);
    if (t) t.cantidad += n;
    else vistos.set(p.tipo, { pieza: p, cantidad: n });
  }
  return [...vistos.values()];
}

export const totalPiezas = tipos().reduce((a, t) => a + t.cantidad, 0);
