# La silla de Eliyahu de Isaac Garzón Serfaty z”l

> זה כסא אליהו הנביא זכור לטוב
> *Esta es la silla del profeta Elías, recordado para bien.*

En cada brit milá se reserva una silla para el profeta Eliyahu. Isaac Garzón Serfaty z”l, «tito Isaque», quería hacer sillas como esta para que cada sinagoga pudiera tener la suya. Dejó el plano dibujado a lápiz. Este repositorio lo pasa a CAD para que cualquiera pueda llevárselo a un carpintero.

**Web: [sillaeliyahu.vercel.app](https://sillaeliyahu.vercel.app)** · [English](README.en.md)

> **Antes de cortar**, que un carpintero revise el plano y las seis cotas por validar de [`plano/DUDAS.md`](plano/DUDAS.md). Las medidas salen del dibujo a lápiz de Isaac y de dos fotos: la silla donada todavía no se ha medido.

## Descargas

| Fichero | Para qué |
|---|---|
| [`plano/silla-de-eliyahu.dxf`](plano/silla-de-eliyahu.dxf) | AutoCAD, LibreCAD, FreeCAD… Alzado, vista lateral, planta y copete, acotados en centímetros a escala 1:1 |
| [`plano/silla-de-eliyahu.pdf`](plano/silla-de-eliyahu.pdf) | Tres hojas A3 para imprimir: vistas a 1:10, detalles a 1:4 y despiece |
| [`plano/despiece.csv`](plano/despiece.csv) | Lista de cortes: pieza, cantidad, sección, largo visible y largo de corte con las espigas |
| [`plano/silla.json`](plano/silla.json) | Las medidas de cada pieza: la fuente de la que sale todo lo demás |
| [`plano/DUDAS.md`](plano/DUDAS.md) | **Las cotas que hay que revisar antes de cortar** |
| [`plano/original/`](plano/original/) | Los escaneos: el plano a lápiz de Isaac, la plantilla de las letras y dos fotos de una silla hecha |

## Medidas principales

| | cm |
|---|---|
| Alto total | 164,5 (ver D1) |
| Asiento | 70 (78 con el cojín) |
| Brazos | 101 detrás · 95 en la punta · vuelan 10 por delante de la pata |
| Ancho · fondo | 65 · 59 (69 con los brazos) |
| Postes y patas | 5 × 5 |
| Chambranas y travesaños | 5 × 3 |
| Brazos | 8 × 4 |
| Copete | 26 × 3, con la inscripción grabada por delante |
| Reposapiés | 67 × 13 × 2,5, a 12 del suelo, cajeado en las patas |
| Esterillado | listones de 3 × 1 al ras de las chambranas |

Son 37 piezas de 17 tipos. El plano no indica la especie de madera.

## Antes de cortar

El plano de Isaac no lo dice todo. Hay seis puntos en los que faltaba una cota o dos no cuadraban, y en cada uno se ha tomado una decisión. Están explicados en [`plano/DUDAS.md`](plano/DUDAS.md). Los dos que más cambian la silla:

- **D1 · Alto total.** El alzado lateral suma 159 y el trasero, 164,5. Se han respetado las piezas del trasero, con el respaldo de 45,5, y los postes miden 164,5.
- **D6 · Reposapiés.** En el plano va entero por delante de las patas. Como es el escalón natural para subirse a un asiento de 70, pisar su borde puede volcar la silla. Se ha retrasado: queda cajeado en las patas y apoyado en un travesaño.

En el DXF, las letras van en contornos (capa `LETRAS`, en Frank Ruhl Libre), listas para una fresadora o un láser. El texto editable está en la capa `LETRAS_TEXTO`, apagada, porque no todos los programas lo pintan de derecha a izquierda. Para grabar la caligrafía de Isaac, calca la plantilla original.

Si tienes una silla hecha con este plano, sus medidas resolverían las dudas: abre un *issue* con ellas.

## Cómo está hecho

Todo sale de un único fichero de medidas, [`plano/silla.json`](plano/silla.json). Cada pieza lleva su caja en centímetros (`x` ancho, `y` fondo con 0 en la trasera, `z` alto), su sección, sus espigas y el origen de cada cota: `plano` (escrita por Isaac), `deducido` (sale de sumar o restar cotas) o `supuesto` (elegido para que se pueda construir).

```bash
python3 -m venv .venv && .venv/bin/pip install -r plano/requirements.txt
.venv/bin/python plano/generar.py
```

`generar.py` comprueba que las cotas cuadran (alto total, asiento, ancho, fondo, la pata contra el brazo…) y genera el DXF, el PDF, el despiece y `DUDAS.md`. Si una comprobación falla, termina con error.

La web (`web/`, Next.js + three.js) dibuja la silla en 3D a partir del mismo `silla.json`, así que un cambio de medida llega también al dibujo:

```bash
cd web && npm install && npm run dev
```

## Licencia

El plano, las medidas, los dibujos y los textos tienen licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es): se pueden copiar, modificar y vender, siempre que se cite a **Isaac Garzón Serfaty z”l**. El código tiene licencia MIT ([`LICENSE-CODE`](LICENSE-CODE)). La fuente Frank Ruhl Libre de `plano/fuentes/` tiene licencia SIL OFL 1.1 ([`OFL.txt`](plano/fuentes/OFL.txt)).

## Haz la tuya

Yo no puedo hacer sillas para todo el mundo. Pero cualquiera puede coger este plano, llevárselo a un carpintero y hacer la silla para su sinagoga. Si eso pasa, yo habré cumplido mi parte y tito Isaque, su mitzvá: que haya una silla de Eliyahu en cada brit milá y se pueda cumplir la mitzvá de la circuncisión.

— Alberto Benbunan Garzón, sobrino de Isaac

La silla que se hizo con este plano en 2016-2017 está en la sinagoga Or Hayeladim de Madrid. La historia, con fotos, está en la web.

## Créditos

- Plano y primera silla: Isaac Garzón Serfaty z”l.
- Primer CAD del plano: Acacia Waich. El de este repositorio se ha rehecho a partir del suyo.
- Carpintero de la silla de Or Hayeladim: Mateo Bonilla, que aparece en las fotos del taller. En las de la silla terminada aparece Alberto Benbunan Garzón.
- Las fotos de `web/public/historia/` son de sus autores y no entran en la licencia CC BY.

*En memoria de Isaac Garzón Serfaty z”l.*
