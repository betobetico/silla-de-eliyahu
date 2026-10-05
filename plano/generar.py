"""Genera el plano de la silla de Eliyahu a partir de silla.json.

Salidas (en esta misma carpeta):
  silla-de-eliyahu.dxf   vistas acotadas en centímetros, escala 1:1 (AutoCAD, LibreCAD, FreeCAD…)
  silla-de-eliyahu.pdf   A3 para imprimir: vistas a 1:10, detalles a 1:4 y despiece
  despiece.csv           lista de cortes
  DUDAS.md               cotas por validar, con la decisión tomada en cada una

Uso:  python plano/generar.py
"""

from __future__ import annotations

import csv
import json
import math
from dataclasses import dataclass, field
from pathlib import Path

import ezdxf
from ezdxf.enums import TextEntityAlignment
from shapely.geometry import LineString, MultiLineString, Polygon, box as sbox
from shapely.ops import unary_union

AQUI = Path(__file__).resolve().parent
DATOS = json.loads((AQUI / "silla.json").read_text(encoding="utf-8"))
PIEZAS = DATOS["piezas"]
ESPIGA = DATOS["meta"]["espiga"]
FUENTE = AQUI / "fuentes" / "frank-ruhl-libre-hebrew-700.woff"   # SIL OFL 1.1, ver fuentes/OFL.txt


# ---------------------------------------------------------------- geometría 3D

def perfil_copete(p: dict, pasos: int = 48) -> list[tuple[float, float]]:
    """Contorno del copete en el plano x-z: recto junto a los postes y campana en el centro."""
    x0, _, z0, x1, _, _ = p["caja"]
    hombro, pico, recto = p["perfil"]["hombro"], p["perfil"]["pico"], p["perfil"]["tramo_recto"]
    centro, semi = (x0 + x1) / 2, (x1 - x0) / 2 - recto
    arriba = []
    for i in range(pasos + 1):
        x = x1 - (x1 - x0) * i / pasos
        u = abs(x - centro)
        h = hombro if u >= semi else hombro + (pico - hombro) * (0.5 + 0.5 * math.cos(math.pi * u / semi))
        arriba.append((x, z0 + h))
    return [(x0, z0), (x1, z0)] + arriba


def perfil_mensula(p: dict, pasos: int = 16) -> list[tuple[float, float]]:
    """Ménsula del reposapiés en el plano y-z: escuadra con el lado inferior en curva cóncava."""
    _, y0, z0, _, y1, z1 = p["caja"]
    pts = [(y0, z0), (y0, z1), (y1, z1)]
    for i in range(1, pasos):
        t = (math.pi / 2) * i / pasos
        pts.append((y1 - (y1 - y0) * math.sin(t), z0 + (z1 - z0) * math.cos(t)))
    return pts


def vertices_brazo(p: dict) -> list[tuple[float, float, float]]:
    b = p["brazo"]
    xi, h = b["x_interior"], b["hacia"]
    pts = []
    for y, ancho in ((b["y0"], b["ancho_atras"]), (b["y1"], b["ancho_delante"])):
        t = (y - b["y0"]) / (b["y1"] - b["y0"])
        ztop = b["z_atras"] + (b["z_delante"] - b["z_atras"]) * t
        for x in (xi, xi + h * ancho):
            pts += [(x, y, ztop), (x, y, ztop - b["grueso"])]
    return pts


def contornos_hebreo(texto: str, alto_letra: float, x_centro: float, y_base: float, pasos: int = 6):
    """Contornos cerrados del texto en Frank Ruhl Libre, colocados de derecha a izquierda.

    Devuelve (lista de polilíneas, ancho de la línea). La altura de letra es la de la «ה».
    """
    from fontTools.pens.basePen import BasePen
    from fontTools.pens.boundsPen import BoundsPen
    from fontTools.ttLib import TTFont

    fuente = TTFont(FUENTE)
    cmap, glifos = fuente.getBestCmap(), fuente.getGlyphSet()
    bp = BoundsPen(glifos)
    glifos[cmap[ord("ה")]].draw(bp)
    k = alto_letra / bp.bounds[3]
    ancho = sum(glifos[cmap[ord(c)]].width for c in texto) * k
    salida: list[list[tuple[float, float]]] = []

    class Lapiz(BasePen):
        def __init__(self, ox):
            super().__init__(glifos)
            self.ox, self.trazo = ox, []

        def t(self, p):
            return (self.ox + p[0] * k, y_base + p[1] * k)

        def _moveTo(self, p):
            self.trazo = [self.t(p)]

        def _lineTo(self, p):
            self.trazo.append(self.t(p))

        def _curveToOne(self, p1, p2, p3):
            p0 = self._getCurrentPoint()
            for i in range(1, pasos + 1):
                u = i / pasos
                a, b, c, d = (1 - u) ** 3, 3 * u * (1 - u) ** 2, 3 * u * u * (1 - u), u ** 3
                self.trazo.append(self.t((a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
                                          a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1])))

        def _qCurveToOne(self, p1, p2):
            p0 = self._getCurrentPoint()
            for i in range(1, pasos + 1):
                u = i / pasos
                a, b, c = (1 - u) ** 2, 2 * u * (1 - u), u * u
                self.trazo.append(self.t((a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1])))

        def _closePath(self):
            if len(self.trazo) > 2:
                salida.append(self.trazo)
            self.trazo = []

        _endPath = _closePath

    x = x_centro + ancho / 2
    for c in texto:                      # orden lógico; cada letra se pone a la izquierda de la anterior
        g = glifos[cmap[ord(c)]]
        x -= g.width * k
        g.draw(Lapiz(x))
    return salida, ancho


@dataclass
class Solido:
    """Un prisma (perfil extruido en un eje) o un sólido convexo dado por sus vértices."""
    pieza: dict
    eje: str | None = None                       # eje de extrusión: "x", "y" o "z"
    perfil: list[tuple[float, float]] = field(default_factory=list)
    tramo: tuple[float, float] = (0, 0)
    vertices: list[tuple[float, float, float]] = field(default_factory=list)


EJES = {"x": 0, "y": 1, "z": 2}
PLANO_DE = {"x": ("y", "z"), "y": ("x", "z"), "z": ("x", "y")}


def caja_solida(p: dict, c: list[float]) -> Solido:
    x0, y0, z0, x1, y1, z1 = c
    return Solido(p, "z", [(x0, y0), (x1, y0), (x1, y1), (x0, y1)], (z0, z1))


def solidos() -> list[Solido]:
    out = []
    for p in PIEZAS:
        f, c = p["forma"], p["caja"]
        if f in ("caja", "tapizado"):
            out.append(caja_solida(p, c))
        elif f == "listones":
            x0, y0, z0, x1, y1, z1 = c
            n, a = p["listones"]["cantidad"], p["listones"]["ancho"]
            hueco = ((y1 - y0) - n * a) / (n - 1)
            for i in range(n):
                ya = y0 + i * (a + hueco)
                out.append(caja_solida(p, [x0, ya, z0, x1, ya + a, z1]))
        elif f == "copete":
            out.append(Solido(p, "y", perfil_copete(p), (c[1], c[4])))
        elif f == "mensula":
            out.append(Solido(p, "x", perfil_mensula(p), (c[0], c[3])))
        elif f == "brazo":
            out.append(Solido(p, vertices=vertices_brazo(p)))
        else:
            raise ValueError(f"forma desconocida: {f}")
    return out


def proyeccion(s: Solido, eje_vista: str) -> Polygon:
    """Silueta del sólido mirando a lo largo de eje_vista, en coordenadas (u, v) del plano."""
    u, v = PLANO_DE[eje_vista]
    if s.vertices:
        pts = [(q[EJES[u]], q[EJES[v]]) for q in s.vertices]
        return Polygon(pts).convex_hull
    pu, pv = PLANO_DE[s.eje]
    if s.eje == eje_vista:
        return Polygon(s.perfil)
    # El eje de extrusión está en el plano de la vista: rectángulo
    lado = pu if pu in (u, v) else pv
    k = 0 if lado == pu else 1
    a, b = min(q[k] for q in s.perfil), max(q[k] for q in s.perfil)
    e0, e1 = s.tramo
    if u == lado:
        return sbox(a, e0, b, e1) if v == s.eje else sbox(a, e0, b, e1)
    return sbox(e0, a, e1, b)


def profundidad(s: Solido, eje_vista: str, signo: int) -> float:
    """Cuanto mayor, más cerca del observador."""
    k = EJES[eje_vista]
    if s.vertices:
        vals = [q[k] for q in s.vertices]
    elif s.eje == eje_vista:
        vals = list(s.tramo)
    else:
        pu, pv = PLANO_DE[s.eje]
        idx = 0 if pu == eje_vista else 1
        vals = [q[idx] for q in s.perfil]
    return max(vals) if signo > 0 else -min(vals)


def lineas_vista(eje_vista: str, signo: int, transforma) -> tuple[list, list]:
    """Líneas visibles y ocultas de una vista, ya transformadas a coordenadas del papel."""
    sol = solidos()
    datos = [(profundidad(s, eje_vista, signo), proyeccion(s, eje_vista)) for s in sol]
    datos.sort(key=lambda d: d[0])                 # de lejos a cerca
    visibles, ocultas = [], []
    for i, (d, poly) in enumerate(datos):
        delante = [q for dd, q in datos[i + 1:] if dd > d + 1e-6]
        borde = poly.exterior
        if delante:
            tapa = unary_union(delante)
            vis, ocu = borde.difference(tapa), borde.intersection(tapa)
        else:
            vis, ocu = borde, None
        visibles += partes(vis)
        if ocu is not None:
            ocultas += partes(ocu)
    tr = lambda segs: [[transforma(*p) for p in s] for s in segs]
    return tr(limpia(visibles)), tr(limpia(ocultas))


def partes(g) -> list[list[tuple[float, float]]]:
    if g is None or g.is_empty:
        return []
    if isinstance(g, (LineString,)):
        return [list(g.coords)]
    if hasattr(g, "geoms"):
        out = []
        for x in g.geoms:
            out += partes(x)
        return out
    if hasattr(g, "exterior"):
        return [list(g.exterior.coords)]
    return []


def limpia(segs, minimo: float = 0.05):
    """Quita trozos degenerados y duplicados exactos (piezas simétricas que coinciden)."""
    vistos, out = set(), []
    for s in segs:
        if len(s) < 2 or LineString(s).length < minimo:
            continue
        clave = tuple(sorted([tuple(round(c, 2) for c in s[0]), tuple(round(c, 2) for c in s[-1])])) + (len(s),)
        if clave in vistos:
            continue
        vistos.add(clave)
        out.append(s)
    return out


# ---------------------------------------------------------------- la hoja

@dataclass
class Cota:
    p1: tuple[float, float]
    p2: tuple[float, float]
    base: tuple[float, float]      # punto por el que pasa la línea de cota
    angulo: float = 0              # 0 horizontal, 90 vertical
    texto: str | None = None


@dataclass
class Texto:
    pos: tuple[float, float]
    texto: str
    alto: float = 2.2
    alinea: str = "izq"           # izq, centro
    capa: str = "TEXTO"
    hebreo: bool = False


@dataclass
class Vista:
    nombre: str
    visibles: list
    ocultas: list
    cotas: list = field(default_factory=list)
    textos: list = field(default_factory=list)
    rellenos: list = field(default_factory=list)          # contornos de letras, para grabar
    marco: tuple[float, float, float, float] = (0, 0, 0, 0)   # zona de la vista en el papel


# Colocación de las vistas en el espacio modelo (cm, escala 1:1). Sistema europeo:
# alzado arriba a la izquierda, vista lateral a su derecha y planta debajo.
LAT_X = 110                       # origen de la vista lateral
PLANTA_Y = -40                    # la planta va debajo, con el frente hacia abajo
DET_X = 230                       # detalles

frente = lambda x, y, z: (x, z)
lateral = lambda x, y, z: (LAT_X + (72 - y), z)        # frente de la silla a la izquierda
planta = lambda x, y, z: (x, PLANTA_Y - y)              # frente de la silla abajo


def caja(id_: str) -> list[float]:
    return next(p for p in PIEZAS if p["id"] == id_)["caja"]


def vistas() -> list[Vista]:
    V = []
    alto = caja("poste-izq")[5]
    cop = caja("copete")
    res = caja("respaldo")
    rep = caja("reposapies")
    bra = next(p for p in PIEZAS if p["id"] == "brazo-der")["brazo"]
    hombro = cop[2] + next(p for p in PIEZAS if p["id"] == "copete")["perfil"]["hombro"]

    vis, ocu = lineas_vista("y", +1, lambda a, b: frente(a, 0, b))
    alz = Vista("ALZADO FRONTAL", vis, ocu, marco=(-14, -8, 82, alto + 12))
    alz.cotas += [
        Cota((0, 0), (65, 0), (0, -5), 0),
        Cota((5, 45), (60, 45), (0, 45), 0, "55 interior"),
        Cota((rep[0], rep[2]), (rep[3], rep[2]), (0, -11), 0),
        Cota((65, 0), (65, alto), (76, 0), 90),
        Cota((65, 0), (65, 70), (71, 0), 90),
        Cota((-5, 0), (-5, rep[2]), (-8, 0), 90),
        Cota((0, 20), (0, 25), (-8, 0), 90),
        Cota((0, 78), (0, 86), (-8, 0), 90),
        Cota((0, res[2]), (0, res[5]), (-8, 0), 90),
        Cota((0, cop[2]), (0, hombro), (-8, 0), 90),
        Cota((0, cop[2]), (0, cop[5]), (-12, 0), 90),
    ]
    ins = DATOS["inscripcion"]
    for linea, zb in zip(ins["lineas"], ins["linea_base"]):
        alz.rellenos += contornos_hebreo(linea, ins["alto_letra"], 32.5, zb)[0]
    V.append(alz)

    vis, ocu = lineas_vista("x", -1, lambda a, b: lateral(0, a, b))
    lat = Vista("VISTA LATERAL", vis, ocu, marco=(LAT_X - 8, -8, LAT_X + 96, alto + 12))
    X = lambda y: LAT_X + (72 - y)
    lat.cotas += [
        Cota((X(59), 0), (X(0), 0), (0, -5), 0),
        Cota((X(rep[4]), rep[2]), (X(59), rep[2]), (0, rep[2] - 6), 0),
        Cota((X(bra["y1"]), 95), (X(59), 95), (0, 107), 0),
        Cota((X(bra["y1"]), 0), (X(bra["y1"]), 95), (X(bra["y1"]) - 5, 0), 90),
        # Cadena del poste, como la escribió Isaac
        Cota((X(0), 0), (X(0), 20), (X(0) + 7, 0), 90),
        Cota((X(0), 20), (X(0), 25), (X(0) + 7, 0), 90),
        Cota((X(0), 25), (X(0), 65), (X(0) + 7, 0), 90),
        Cota((X(0), 65), (X(0), 70), (X(0) + 7, 0), 90),
        Cota((X(0), 70), (X(0), 97), (X(0) + 7, 0), 90),
        Cota((X(0), 97), (X(0), 101), (X(0) + 7, 0), 90),
        Cota((X(0), 101), (X(0), alto), (X(0) + 7, 0), 90),
        Cota((X(0), 0), (X(0), alto), (X(0) + 14, 0), 90),
    ]
    lat.textos.append(Texto((X(72), alto + 6), "← FRENTE", 2.5))
    V.append(lat)

    vis, ocu = lineas_vista("z", +1, lambda a, b: planta(a, b, 0))
    pla = Vista("PLANTA", vis, ocu, marco=(-14, PLANTA_Y - 84, 84, PLANTA_Y + 8))
    pla.cotas += [
        Cota((0, PLANTA_Y), (65, PLANTA_Y), (0, PLANTA_Y + 5), 0),
        Cota((rep[0], PLANTA_Y - rep[4]), (rep[3], PLANTA_Y - rep[4]), (0, PLANTA_Y - rep[4] - 6), 0),
        Cota((bra["x_interior"] + 8, PLANTA_Y - 5), (bra["x_interior"] + 8, PLANTA_Y - bra["y1"]), (73, 0), 90, f"{bra['y1'] - 5:g} brazo"),
        Cota((65, PLANTA_Y), (65, PLANTA_Y - 59), (81, 0), 90),
    ]
    pla.textos.append(Texto((32.5, PLANTA_Y - 88), "FRENTE ↓", 2.5, "centro"))
    V.append(pla)

    # Detalle del copete con la inscripción, en el plano x-z de la propia pieza
    pc = next(p for p in PIEZAS if p["forma"] == "copete")
    z0 = cop[2]
    dx, dz = DET_X - 5, -z0 + 60
    contorno = [(x + dx, z + dz) for x, z in perfil_copete(pc)]
    det = Vista("DETALLE DEL COPETE", [contorno + [contorno[0]]], [], marco=(DET_X - 8, 52, DET_X + 70, 92))
    ins = DATOS["inscripcion"]
    for linea, zb in zip(ins["lineas"], ins["linea_base"]):
        det.textos.append(Texto((32.5 + dx, zb + dz), linea, ins["alto_letra"], "centro", "LETRAS_TEXTO", True))
        det.rellenos += contornos_hebreo(linea, ins["alto_letra"], 32.5 + dx, zb + dz)[0]
    det.cotas += [
        Cota((5 + dx, z0 + dz), (60 + dx, z0 + dz), (0, z0 + dz - 4), 0),
        Cota((5 + dx, z0 + dz), (5 + pc["perfil"]["tramo_recto"] + dx, z0 + dz), (0, z0 + dz - 8), 0),
        Cota((5 + dx, z0 + dz), (5 + dx, hombro + dz), (5 + dx - 4, 0), 90),
        Cota((32.5 + dx, z0 + dz), (32.5 + dx, cop[5] + dz), (60 + dx + 5, 0), 90),
        Cota((60 + dx, z0 + dz), (60 + dx, ins["linea_base"][1] + dz), (60 + dx + 9, 0), 90),
    ]
    V.append(det)
    return V


# ---------------------------------------------------------------- despiece

def largo_pieza(p: dict) -> float:
    if p["forma"] == "brazo":
        b = p["brazo"]
        return round(math.hypot(b["y1"] - b["y0"], b["z_atras"] - b["z_delante"]), 1)
    if p["forma"] == "listones":
        return round(p["caja"][3] - p["caja"][0], 1)
    x0, y0, z0, x1, y1, z1 = p["caja"]
    return round(max(x1 - x0, y1 - y0, z1 - z0), 1)


def despiece() -> list[dict]:
    filas: dict[str, dict] = {}
    for p in PIEZAS:
        n = p["listones"]["cantidad"] if p["forma"] == "listones" else 1
        f = filas.get(p["tipo"])
        if f:
            f["cantidad"] += n
            if p["origen"] != f["origen"]:
                f["origen"] = "plano / supuesto" if "supuesto" in (p["origen"], f["origen"]) else f["origen"]
            continue
        largo = largo_pieza(p)
        filas[p["tipo"]] = {
            "pieza": p["nombre"],
            "piece": p["name"],
            "cantidad": n,
            "seccion_cm": p["seccion"],
            "largo_visible_cm": largo,
            "largo_corte_cm": p.get("corte_cm", round(largo + p["espigas"] * p.get("espiga_cm", ESPIGA), 1)),
            "espigas": p["espigas"],
            "espiga_cm": p.get("espiga_cm", ESPIGA) if p["espigas"] else 0,
            "origen": p["origen"],
            "nota": p.get("nota", ""),
        }
    return list(filas.values())


# ---------------------------------------------------------------- DXF

def escribe_dxf(V: list[Vista], ruta: Path) -> None:
    doc = ezdxf.new("R2010", setup=True)
    doc.units = ezdxf.units.CM
    doc.header["$MEASUREMENT"] = 1
    doc.header["$LTSCALE"] = 10
    capas = {
        "CONTORNO": (7, 50, "CONTINUOUS"),
        "OCULTAS": (8, 18, "DASHED2"),
        "COTAS": (4, 18, "CONTINUOUS"),
        "TEXTO": (7, 25, "CONTINUOUS"),
        "LETRAS": (1, 25, "CONTINUOUS"),
        "LETRAS_TEXTO": (1, 18, "CONTINUOUS"),
        "MARCO": (7, 35, "CONTINUOUS"),
    }
    for nombre, (color, grosor, tipo) in capas.items():
        doc.layers.add(nombre, color=color, lineweight=grosor, linetype=tipo)

    # El texto hebreo queda en una capa apagada: no todos los programas lo pintan de derecha a izquierda.
    # Lo que se graba son los contornos de la capa LETRAS.
    doc.layers.get("LETRAS_TEXTO").off()

    estilo = doc.dimstyles.new("COTAS_CM")
    estilo.dxf.dimtxt = 2.2
    estilo.dxf.dimasz = 1.6
    estilo.dxf.dimexe = 1
    estilo.dxf.dimexo = 0.8
    estilo.dxf.dimgap = 0.6
    estilo.dxf.dimdec = 1
    estilo.dxf.dimdsep = ord(",")
    estilo.dxf.dimzin = 8
    estilo.dxf.dimtad = 1
    estilo.dxf.dimtih = 0
    estilo.dxf.dimtoh = 0
    doc.styles.new("ARIAL", dxfattribs={"font": "arial.ttf"})

    msp = doc.modelspace()
    for v in V:
        for s in v.visibles:
            msp.add_lwpolyline(s, dxfattribs={"layer": "CONTORNO"})
        for s in v.ocultas:
            msp.add_lwpolyline(s, dxfattribs={"layer": "OCULTAS"})
        for s in v.rellenos:
            msp.add_lwpolyline(s, close=True, dxfattribs={"layer": "LETRAS"})
        for c in v.cotas:
            attrs = {"layer": "COTAS"}
            d = msp.add_linear_dim(base=c.base, p1=c.p1, p2=c.p2, angle=c.angulo,
                                   dimstyle="COTAS_CM", text=c.texto or "<>", dxfattribs=attrs)
            d.render()
        for t in v.textos:
            e = msp.add_text(t.texto, height=t.alto, dxfattribs={"layer": t.capa, "style": "ARIAL"})
            e.set_placement(t.pos, align=TextEntityAlignment.BOTTOM_CENTER if t.alinea == "centro" else TextEntityAlignment.BOTTOM_LEFT)
        x0, y0, x1, y1 = v.marco
        e = msp.add_text(v.nombre, height=3, dxfattribs={"layer": "TEXTO", "style": "ARIAL"})
        e.set_placement((x0, y1 + 2), align=TextEntityAlignment.BOTTOM_LEFT)

    m = DATOS["meta"]
    notas = [
        m["titulo"],
        "Plano de Isaac Garzón Serfaty z”l · primer CAD de Acacia Waich, rehecho para este repositorio",
        "Cotas en centímetros · escala 1:1 en el espacio modelo · sistema europeo",
        "Secciones: postes y patas 5×5 · chambranas y travesaños 5×3 · brazos 8×4 · copete 26×3",
        m["espigas_nota"],
        "Las cotas marcadas como supuestas en silla.json están por validar: ver plano/DUDAS.md",
        f"Licencia: {m['licencia']}",
    ]
    for i, n in enumerate(notas):
        e = msp.add_text(n, height=2.6 if i == 0 else 2, dxfattribs={"layer": "TEXTO", "style": "ARIAL"})
        e.set_placement((DET_X - 8, 30 - i * 4.5))
    doc.saveas(ruta)


# ---------------------------------------------------------------- PDF

def escribe_pdf(V: list[Vista], filas: list[dict], ruta: Path) -> None:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib.backends.backend_pdf import PdfPages
    from matplotlib import font_manager

    hebreo = font_manager.FontProperties(fname="/System/Library/Fonts/Supplemental/Arial Unicode.ttf")
    plt.rcParams.update({"font.family": "Arial", "font.size": 7, "pdf.fonttype": 42})
    A3 = (16.54, 11.69)
    TINTA, GRIS, COTA, ROJO = "#1b1a18", "#9a958c", "#3d5a80", "#8a2c1d"
    m = DATOS["meta"]

    def hoja(titulo: str, sub: str):
        fig = plt.figure(figsize=A3)
        fig.patch.set_facecolor("white")
        fig.text(0.03, 0.955, titulo, fontsize=15, color=TINTA, weight="bold")
        fig.text(0.03, 0.932, sub, fontsize=8.5, color=GRIS)
        fig.text(0.97, 0.03, f"{m['licencia']}  ·  github.com/betobetico/silla-de-eliyahu",
                 fontsize=7, color=GRIS, ha="right")
        fig.add_artist(plt.Rectangle((0.015, 0.02), 0.97, 0.96, fill=False, lw=0.8, ec=TINTA,
                                     transform=fig.transFigure))
        return fig

    def ejes(fig, rect, x0, x1, y0, y1, escala_mm: float):
        """Ejes con escala real: escala_mm = mm de papel por cm de pieza."""
        ax = fig.add_axes(rect)
        ancho_mm = rect[2] * A3[0] * 25.4
        alto_mm = rect[3] * A3[1] * 25.4
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        ax.set_xlim(cx - ancho_mm / escala_mm / 2, cx + ancho_mm / escala_mm / 2)
        ax.set_ylim(cy - alto_mm / escala_mm / 2, cy + alto_mm / escala_mm / 2)
        ax.set_aspect("equal")
        ax.axis("off")
        return ax

    def dibuja(ax, v: Vista, alto_txt: float, escala_mm: float = 1.0):
        if v.rellenos:
            from matplotlib.path import Path as MPath
            from matplotlib.patches import PathPatch
            verts, codes = [], []
            for c in v.rellenos:
                verts += list(c) + [c[0]]
                codes += [MPath.MOVETO] + [MPath.LINETO] * (len(c) - 1) + [MPath.CLOSEPOLY]
            ax.add_patch(PathPatch(MPath(verts, codes), fc=ROJO, ec="none"))
        for s in v.ocultas:
            xs, ys = zip(*s)
            ax.plot(xs, ys, color=GRIS, lw=0.35, ls=(0, (3, 2)))
        for s in v.visibles:
            xs, ys = zip(*s)
            ax.plot(xs, ys, color=TINTA, lw=0.75, solid_capstyle="round")
        for c in v.cotas:
            cota(ax, c, alto_txt)
        for t in v.textos:
            if t.hebreo and v.rellenos:
                continue
            txt = t.texto[::-1] if t.hebreo else t.texto
            ax.text(t.pos[0], t.pos[1], txt, fontsize=(t.alto * escala_mm / 0.3528 / 0.68 if t.hebreo else 7.5),
                    color=ROJO if t.hebreo else TINTA, ha="center" if t.alinea == "centro" else "left",
                    va="bottom", fontproperties=hebreo if t.hebreo else None)
        ax.text(v.marco[0], v.marco[3] + 2, v.nombre, fontsize=9, weight="bold", color=TINTA)

    def cota(ax, c: Cota, k: float):
        (x1, y1), (x2, y2) = c.p1, c.p2
        if c.angulo == 0:
            yb = c.base[1]
            a, b = (x1, yb), (x2, yb)
            ext = [((x1, y1), a), ((x2, y2), b)]
            valor = abs(x2 - x1)
        else:
            xb = c.base[0]
            a, b = (xb, y1), (xb, y2)
            ext = [((x1, y1), a), ((x2, y2), b)]
            valor = abs(y2 - y1)
        for p, q in ext:
            ax.plot([p[0], q[0]], [p[1], q[1]], color=COTA, lw=0.3)
        ax.annotate("", xy=a, xytext=b, arrowprops=dict(arrowstyle="<|-|>", lw=0.4, color=COTA,
                                                         mutation_scale=4, shrinkA=0, shrinkB=0))
        texto = c.texto or (f"{valor:g}".replace(".", ","))
        mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        if c.angulo == 0:
            ax.text(mx, my + 0.6 * k, texto, ha="center", va="bottom", fontsize=6.5, color=COTA)
        else:
            ax.text(mx - 0.6 * k, my, texto, ha="right", va="center", fontsize=6.5, color=COTA, rotation=90)

    import textwrap

    def nota(fig, x, y, texto, ancho=95, **kw):
        """Texto envuelto en líneas; devuelve la y siguiente."""
        lineas = textwrap.wrap(texto, ancho)
        for l in lineas:
            fig.text(x, y, l, **kw)
            y -= 0.019
        return y

    alz, lat, pla, det = V
    alto = caja("poste-izq")[5]
    rep = caja("reposapies")
    b = next(p for p in PIEZAS if p["id"] == "brazo-der")["brazo"]
    men = next(p for p in PIEZAS if p["forma"] == "mensula")
    Y = lambda y: 72 - y

    with PdfPages(ruta) as pdf:
        # Hoja 1: alzado y lateral a 1:10
        fig = hoja(m["titulo"], "Alzado y vista lateral · escala 1:10 en A3 · cotas en cm · sistema europeo")
        ax = ejes(fig, [0.03, 0.05, 0.62, 0.86], -40, 220, -40, 210, 1.0)
        for v in (alz, lat):
            dibuja(ax, v, 1.0)
        notas = [
            "Postes y patas 5×5 · chambranas y travesaños 5×3",
            "Brazos 8×4 · copete 26×3 · travesaño bajo del respaldo 8×2,5",
            "Reposapiés 67×13×2,5 cajeado en las patas (D6)",
            "Esterillado de listones 3×1 al ras de las chambranas",
            m["espigas_nota"],
            "Inscripción grabada en la cara delantera del copete: calcar la plantilla original, que está a tamaño real",
            "Cajas de postes y patas y despiece: hoja 3 · planta y detalles: hoja 2",
            "Cotas por validar antes de cortar: hoja 4 (D1-D6)",
        ]
        fig.text(0.68, 0.86, "AVISO", fontsize=9, weight="bold", color=ROJO)
        nota(fig, 0.68, 0.84, "Antes de cortar, que un carpintero revise este plano y las seis cotas por validar de la hoja 4. "
             "Las medidas de la silla donada todavía no se han tomado.", 62, fontsize=8.5, color=ROJO)
        fig.text(0.68, 0.76, "NOTAS", fontsize=9, weight="bold", color=TINTA)
        y = 0.73
        for n in notas:
            y = nota(fig, 0.68, y, "· " + n, 62, fontsize=8.5, color=TINTA) - 0.008
        y -= 0.03
        y = nota(fig, 0.68, y, "Dibujado a partir del plano a lápiz de Isaac Garzón Serfaty z”l y del primer CAD, "
                 "de Acacia Waich. Ante la duda, manda una silla de verdad.", 62, fontsize=8.5, color=GRIS)
        pdf.savefig(fig)
        plt.close(fig)

        # Hoja 2: planta a 1:10 y detalles a 1:4
        fig = hoja("Planta y detalles", "Planta a 1:10 · copete, brazo y ménsula a 1:4 · cotas en cm")
        axp = ejes(fig, [0.03, 0.05, 0.3, 0.42], -12, 84, PLANTA_Y - 92, PLANTA_Y + 10, 1.0)
        dibuja(axp, pla, 1.0)
        ax = ejes(fig, [0.03, 0.5, 0.6, 0.42], DET_X - 8, DET_X + 65, 50, 96, 2.5)
        dibuja(ax, det, 0.25, 2.5)
        # Brazo: perfil y planta, a 1:4
        ax2 = ejes(fig, [0.36, 0.05, 0.6, 0.4], 0, 72, 63, 109, 2.5)
        perfil = [(Y(b["y0"]), b["z_atras"]), (Y(b["y1"]), b["z_delante"]),
                  (Y(b["y1"]), b["z_delante"] - b["grueso"]), (Y(b["y0"]), b["z_atras"] - b["grueso"])]
        xs, ys = zip(*(perfil + [perfil[0]]))
        ax2.plot(xs, ys, color=TINTA, lw=0.8)
        ax2.plot([Y(59), Y(59)], [88, 96.5], color=GRIS, lw=0.5, ls=(0, (3, 2)))
        ax2.text(Y(59), 87, "cara delantera\nde la pata", fontsize=6.5, color=GRIS, ha="center", va="top")
        largo = b["y1"] - b["y0"]
        for c in [Cota((Y(b["y1"]), 95), (Y(b["y0"]), 95), (0, 104), 0, f"{largo:g}"),
                  Cota((Y(b["y1"]), 95), (Y(59), 95), (0, 99), 0, f"{b['y1'] - 59:g}"),
                  Cota((Y(b["y0"]), 101), (Y(b["y0"]), 97), (Y(b["y0"]) + 3, 0), 90, "4"),
                  Cota((Y(b["y1"]), 91), (Y(b["y1"]), 95), (Y(b["y1"]) - 3, 0), 90, "4")]:
            cota(ax2, c, 0.25)
        # Planta del brazo, debajo
        zp = 78
        pl = [(Y(b["y0"]), zp), (Y(b["y1"]), zp), (Y(b["y1"]), zp - b["ancho_delante"]), (Y(b["y0"]), zp - b["ancho_atras"])]
        xs, ys = zip(*(pl + [pl[0]]))
        ax2.plot(xs, ys, color=TINTA, lw=0.8)
        for c in [Cota((Y(b["y0"]), zp), (Y(b["y0"]), zp - b["ancho_atras"]), (Y(b["y0"]) + 3, 0), 90, f"{b['ancho_atras']:g}"),
                  Cota((Y(b["y1"]), zp), (Y(b["y1"]), zp - b["ancho_delante"]), (Y(b["y1"]) - 3, 0), 90, f"{b['ancho_delante']:g}")]:
            cota(ax2, c, 0.25)
        ax2.text(Y(b["y1"]), 108, "BRAZO · perfil (arriba) y planta (abajo) · la arista recta va hacia dentro",
                 fontsize=8.5, weight="bold", color=TINTA, va="top")
        ax2.text(Y(b["y1"]), 65, "Cortar a 70 y recortar la punta en obra (D3). 101 en el poste, 95 en la punta.",
                 fontsize=7.5, color=TINTA, va="top")
        # Ménsula y reposapiés
        ax3 = ejes(fig, [0.66, 0.5, 0.3, 0.42], Y(rep[4]) - 2, Y(rep[1]) + 8, 0, 20, 2.5)
        pm = [(Y(y), z) for y, z in perfil_mensula(men)]
        xs, ys = zip(*(pm + [pm[0]]))
        ax3.plot(xs, ys, color=TINTA, lw=0.8)
        ax3.plot([Y(rep[4]), Y(rep[1]), Y(rep[1]), Y(rep[4]), Y(rep[4])], [rep[2], rep[2], rep[5], rep[5], rep[2]], color=TINTA, lw=0.8)
        ax3.add_patch(plt.Rectangle((Y(59), 0), 5, rep[5] + 4, fill=False, ec=GRIS, lw=0.5, ls=(0, (3, 2))))
        ax3.text(Y(56.5), rep[5] + 4.5, "pata", fontsize=6.5, color=GRIS, ha="center")
        c0 = men["caja"]
        for c in [Cota((Y(c0[4]), c0[2]), (Y(c0[1]), c0[2]), (0, c0[2] - 2), 0),
                  Cota((Y(c0[1]), c0[2]), (Y(c0[1]), c0[5]), (Y(c0[1]) + 2.5, 0), 90),
                  Cota((Y(rep[4]), 0), (Y(rep[4]), rep[2]), (Y(rep[4]) - 2.5, 0), 90),
                  Cota((Y(rep[4]), rep[5]), (Y(rep[1]), rep[5]), (0, rep[5] + 2.5), 0),
                  Cota((Y(rep[4]), rep[5]), (Y(59), rep[5]), (0, rep[5] + 6), 0)]:
            cota(ax3, c, 0.25)
        ax3.text(Y(rep[4]) - 1, 27, "REPOSAPIÉS Y MÉNSULA (D6)", fontsize=9, weight="bold", color=TINTA)
        pdf.savefig(fig)
        plt.close(fig)

        # Hoja 3: cajas de postes y patas a 1:10, y despiece
        fig = hoja("Cajas y despiece", "Alturas de las cajas en postes y patas a 1:10 · largo de corte = largo visible + espigas")
        axc = ejes(fig, [0.03, 0.05, 0.27, 0.86], -36, 70, -5, 175, 1.0)
        cajas_poste = [("chambranas", 20, 25), ("travesaños del asiento", 65, 70), ("travesaño bajo del respaldo", 78, 86),
                       ("brazo", 97, 101), ("copete (hombro)", caja("copete")[2], caja("copete")[2] + 15)]
        cajas_pata = [("travesaño del reposapiés", caja("travesano-reposapies")[2], caja("travesano-reposapies")[5]),
                      ("chambranas", 20, 25), ("travesaños del asiento", 65, 70)]
        for x0, h, cajas, nombre, izq in ((8, alto, cajas_poste, "POSTE", True), (30, caja("pata-izq")[5], cajas_pata, "PATA", False)):
            axc.add_patch(plt.Rectangle((x0, 0), 5, h, fill=False, ec=TINTA, lw=0.8))
            for etiqueta, z0, z1 in cajas:
                axc.add_patch(plt.Rectangle((x0 + 1, z0), 3, z1 - z0, fc="#e9e2d6", ec=COTA, lw=0.5))
                axc.text(x0 - 1.5 if izq else x0 + 6.5, (z0 + z1) / 2, f"{etiqueta} · {z0:g}-{z1:g}".replace(".", ","),
                         fontsize=6.5, color=COTA, va="center", ha="right" if izq else "left")
            cota(axc, Cota((x0 + 5, 0), (x0 + 5, h), (x0 + 8, 0), 90), 1.0)
            axc.text(x0, h + 3, nombre, fontsize=9, weight="bold", color=TINTA)
        cab = ["Pieza", "Cant.", "Sección", "Visible", "Espiga", "Corte", "Origen"]
        xs = [0.32, 0.56, 0.60, 0.72, 0.78, 0.84, 0.89]
        y = 0.86
        for x, h in zip(xs, cab):
            fig.text(x, y, h, fontsize=8.5, weight="bold", color=TINTA)
        for f in filas:
            y -= 0.032
            esp = f"{f['espigas']} × {f['espiga_cm']:g}".replace(".", ",") if f["espigas"] else "—"
            vals = [f["pieza"], str(f["cantidad"]), f["seccion_cm"], f"{f['largo_visible_cm']:g}".replace(".", ","),
                    esp, f"{f['largo_corte_cm']:g}".replace(".", ","), f["origen"]]
            for x, v in zip(xs, vals):
                fig.text(x, y, v, fontsize=8, color=ROJO if "supuesto" in v else TINTA)
        y -= 0.04
        y = nota(fig, 0.32, y, m["espigas_nota"] + ".", 120, fontsize=8, color=TINTA)
        y = nota(fig, 0.32, y - 0.01, "Además: listones de 2×2 para fijar el respaldo tapizado por detrás, y cuatro escuadras "
                 "de madera en las esquinas del bastidor del asiento.", 120, fontsize=8, color=TINTA)
        pdf.savefig(fig)
        plt.close(fig)

        # Hoja 4: cotas por validar
        fig = hoja("Cotas por validar antes de cortar", "Donde el plano de Isaac no lo dice o dos cotas no cuadran, la decisión tomada y la alternativa")
        y = 0.88
        for d in DATOS["dudas"]:
            fig.text(0.04, y, f"{d['id']} · {d['titulo']}", fontsize=9.5, weight="bold", color=ROJO)
            y = nota(fig, 0.06, y - 0.024, d["detalle"], 165, fontsize=8, color=TINTA)
            y = nota(fig, 0.06, y - 0.004, "Se ha hecho: " + d["decision"], 165, fontsize=8, color=TINTA)
            if d["alternativa"] != "—":
                y = nota(fig, 0.06, y - 0.004, "Alternativa: " + d["alternativa"], 165, fontsize=8, color=GRIS)
            y -= 0.025
        pdf.savefig(fig)
        plt.close(fig)


# ---------------------------------------------------------------- comprobaciones

def comprueba() -> list[str]:
    """Cruza las cotas del plano con la geometría y busca piezas que se pisan. Devuelve los fallos."""
    fallos = []
    c = {p["id"]: p["caja"] for p in PIEZAS}
    def igual(nombre, a, b, tol=0.01):
        if abs(a - b) > tol:
            fallos.append(f"{nombre}: {a} ≠ {b}")
    igual("alto total = alto del poste", c["poste-izq"][5], DATOS["cotas"]["alto_total"]["valor"])
    igual("cadena del alzado trasero = alto del poste", 20 + 5 + 40 + 5 + 8 + 8 + 45.5 + 15 + 18, c["poste-izq"][5])
    igual("asiento a 70", c["travesano-asiento-lat-izq"][5], 70)
    igual("ancho exterior 65", c["poste-der"][3] - c["poste-izq"][0], 65)
    igual("fondo 59", c["pata-izq"][4] - c["poste-izq"][1], 59)
    igual("travesaño del respaldo sobre el cojín", c["respaldo-inferior"][2], c["asiento"][5])
    igual("respaldo bajo el copete", c["respaldo"][5], c["copete"][2])
    igual("respaldo de 45,5", c["respaldo"][5] - c["respaldo"][2], 45.5)
    igual("copete de 26", c["copete"][5] - c["copete"][2], 26)
    igual("esterillado al ras de la chambrana", c["esterillado"][5], c["chambrana-lat-izq"][5])
    igual("reposapiés 67 de largo", c["reposapies"][3] - c["reposapies"][0], 67)
    igual("reposapiés 13 de fondo", c["reposapies"][4] - c["reposapies"][1], 13)
    igual("reposapiés sobre su travesaño", c["reposapies"][2], c["travesano-reposapies"][5])
    for lado in ("izq", "der"):
        b = next(p for p in PIEZAS if p["id"] == f"brazo-{lado}")["brazo"]
        zb = lambda y: b["z_atras"] + (b["z_delante"] - b["z_atras"]) * (y - b["y0"]) / (b["y1"] - b["y0"]) - b["grueso"]
        igual(f"pata {lado} contra la cara de abajo del brazo", c[f"pata-{lado}"][5], round(zb(54), 1), 0.05)
        igual(f"brazo {lado}: 95 en la punta", b["z_delante"], DATOS["cotas"]["alto_brazo_delante"]["valor"])
        igual(f"brazo {lado}: vuela 10", b["y1"] - 59, DATOS["cotas"]["vuelo_brazo"]["valor"])
    # Solapes entre piezas de caja (las espigas no se modelan, así que no debería haber ninguno)
    permitidos = {frozenset(("reposapies", "pata-izq")), frozenset(("reposapies", "pata-der"))}
    cajas = []
    for p in PIEZAS:
        if p["forma"] in ("caja", "tapizado", "mensula"):
            cajas.append((p["id"], p["caja"]))
        elif p["forma"] == "listones":
            x0, y0, z0, x1, y1, z1 = p["caja"]
            n, a = p["listones"]["cantidad"], p["listones"]["ancho"]
            h = ((y1 - y0) - n * a) / (n - 1)
            cajas += [(f"{p['id']}-{i}", [x0, y0 + i * (a + h), z0, x1, y0 + i * (a + h) + a, z1]) for i in range(n)]
    for i, (ia, a) in enumerate(cajas):
        for ib, b in cajas[i + 1:]:
            if frozenset((ia, ib)) in permitidos:
                continue
            dx = min(a[3], b[3]) - max(a[0], b[0])
            dy = min(a[4], b[4]) - max(a[1], b[1])
            dz = min(a[5], b[5]) - max(a[2], b[2])
            if dx > 0.01 and dy > 0.01 and dz > 0.01:
                fallos.append(f"se pisan {ia} y {ib} ({dx:.1f} × {dy:.1f} × {dz:.1f})")
    return fallos


def escribe_dudas(ruta: Path) -> None:
    lineas = [
        "# Cotas por validar",
        "",
        "El plano de Isaac no lo dice todo. Donde faltaba una cota o dos no cuadraban, se ha tomado una decisión.",
        "Este fichero se genera desde `silla.json`: para cambiar algo, edita ese fichero y ejecuta `python plano/generar.py`.",
        "",
    ]
    for d in DATOS["dudas"]:
        lineas += [f"## {d['id']} · {d['titulo']}", "", d["detalle"], "", f"- **Se ha hecho:** {d['decision']}"]
        if d["alternativa"] != "—":
            lineas.append(f"- **Alternativa:** {d['alternativa']}")
        lineas.append("")
    ruta.write_text("\n".join(lineas), encoding="utf-8")


if __name__ == "__main__":
    fallos = comprueba()
    for f in fallos:
        print("FALLO:", f)
    V = vistas()
    filas = despiece()
    escribe_dxf(V, AQUI / "silla-de-eliyahu.dxf")
    escribe_pdf(V, filas, AQUI / "silla-de-eliyahu.pdf")
    with open(AQUI / "despiece.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(filas[0].keys()))
        w.writeheader()
        w.writerows(filas)
    escribe_dudas(AQUI / "DUDAS.md")
    print(f"OK · {len(PIEZAS)} piezas · {len(filas)} tipos · fallos: {len(fallos)}")
    raise SystemExit(1 if fallos else 0)
