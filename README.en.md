# Elijah's Chair by Isaac Garzón Serfaty z”l

> זה כסא אליהו הנביא זכור לטוב
> *This is the chair of Elijah the prophet, remembered for good.*

At every brit milah a chair is set aside for Elijah the prophet. Isaac Garzón Serfaty z”l, “Uncle Isaque”, wanted to make chairs like this one so that every synagogue could have its own. He left the plan drawn in pencil. This repository puts it in CAD so anyone can take it to a carpenter.

**Website: [sillaeliyahu.vercel.app/en](https://sillaeliyahu.vercel.app/en)** · [Español](README.md)

> **Before you cut**, have a carpenter check the plan and the six open dimensions below. The measurements come from Isaac's pencil drawing and two photos: the donated chair has not been measured yet.

## Downloads

| File | What for |
|---|---|
| [`plano/silla-de-eliyahu.dxf`](plano/silla-de-eliyahu.dxf) | AutoCAD, LibreCAD, FreeCAD… Front, side, plan and crest rail, dimensioned in centimetres at 1:1 |
| [`plano/silla-de-eliyahu.pdf`](plano/silla-de-eliyahu.pdf) | Three A3 sheets to print (in Spanish): views at 1:10, details at 1:4 and cut list |
| [`plano/despiece.csv`](plano/despiece.csv) | Cut list: piece, quantity, section, visible length and cutting length including tenons |
| [`plano/silla.json`](plano/silla.json) | Every piece's dimensions: the source everything else is generated from |
| [`plano/DUDAS.md`](plano/DUDAS.md) | **The dimensions to check before cutting** (in Spanish; summary below) |
| [`plano/original/`](plano/original/) | The scans: Isaac's pencil plan, the letter template and two photos of a finished chair |

## Main dimensions

| | cm |
|---|---|
| Overall height | 164.5 (see D1) |
| Seat | 70 (78 with the cushion) |
| Arms | 101 at the back · 95 at the tip · 10 cm overhang past the leg |
| Width · depth | 65 · 59 (69 with the arms) |
| Posts and legs | 5 × 5 |
| Stretchers and rails | 5 × 3 |
| Arms | 8 × 4 |
| Crest rail | 26 × 3, with the inscription engraved on the front |
| Footrest | 67 × 13 × 2.5, 12 off the floor, notched around the legs |
| Slatted shelf | 3 × 1 slats flush with the stretchers |

37 pieces of 17 kinds. The plan does not name the wood species.

## Before you cut

Isaac's plan does not say everything. In six places a dimension was missing or two did not agree, and a decision was made in each:

- **D1 · Overall height.** The side elevation adds up to 159 and the rear one to 164.5. We kept the rear elevation's piece sizes, with the 45.5 back as written: the posts are 164.5.
- **D2 · Width.** The rear elevation gives 65 outside (55 inside). The “66 interno” in the arm sketch is the arm's length, not a width.
- **D3 · Arm overhang.** The “10” is the arm's overhang past the leg. Cut the arms at 70 and trim on site.
- **D4 · Front stretcher and shelf.** Not drawn; we added a front stretcher like the back one and two cleats carrying eleven slats.
- **D5 · Letters.** The template is full size; the letters are 3.5 cm tall. The DXF carries the letters as outlines (layer `LETRAS`, set in Frank Ruhl Libre), ready for a router or laser; to engrave Isaac's own lettering, trace the template.
- **D6 · Footrest.** In the plan it sits entirely in front of the legs. As the natural step onto a 70 cm seat, stepping on its edge can tip the chair, so it is moved back, notched around the legs and carried by a rail.

If you have a chair built from this plan, its measurements would settle these: please open an issue.

## How it is built

Everything comes from one measurements file, [`plano/silla.json`](plano/silla.json). Each piece has its box in centimetres (`x` width, `y` depth with 0 at the back, `z` height), its section, its tenons and where each dimension comes from: `plano` (written by Isaac), `deducido` (derived from his dimensions) or `supuesto` (chosen so the chair can be built).

```bash
python3 -m venv .venv && .venv/bin/pip install -r plano/requirements.txt
.venv/bin/python plano/generar.py
```

`generar.py` checks that the dimensions agree and writes the DXF, the PDF, the cut list and `DUDAS.md`. The website (`web/`, Next.js + three.js) draws the chair in 3D from the same `silla.json`:

```bash
cd web && npm install && npm run dev
```

## License

The plan, dimensions, drawings and texts are licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): you may copy, modify and sell them, as long as you credit **Isaac Garzón Serfaty z”l**. The code is MIT licensed ([`LICENSE-CODE`](LICENSE-CODE)). The Frank Ruhl Libre font in `plano/fuentes/` is under the SIL OFL 1.1 ([`OFL.txt`](plano/fuentes/OFL.txt)).

## Build yours

I cannot make chairs for everyone. But anyone can take this plan to a carpenter and make the chair for their synagogue. If that happens, I will have done my part, and Uncle Isaque his mitzvah: that there is an Elijah's chair at every brit milah, so the mitzvah of circumcision can be fulfilled.

— Alberto Benbunan Garzón, Isaac's nephew

The chair built from this plan in 2016-2017 is at the Or Hayeladim synagogue in Madrid. The story, with photos, is on the website.

## Where Isaac's chairs are

| Synagogue | City | |
|---|---|---|
| — | Caracas (Venezuela) | Donated by Isaac |
| — | Porlamar, Margarita Island (Venezuela) | Donated by Isaac |
| Skylake | Miami (United States) | Donated by Isaac |
| Or Hayeladim | Madrid (Spain) | July 2017, built from his plan |

If you know of another, or build yours, [open an issue](https://github.com/betobetico/silla-de-eliyahu/issues/new) and we will add it.

## Credits

- Plan and first chair: Isaac Garzón Serfaty z”l.
- First CAD of the plan: Acacia Waich. The one in this repository was redrawn from hers.
- Carpenter of the Or Hayeladim chair: Mateo Bonilla, who appears in the workshop photos. Alberto Benbunan Garzón appears in the photos of the finished chair.
- The photos in `web/public/historia/` belong to their authors and are not covered by the CC BY license.

*In memory of Isaac Garzón Serfaty z”l.*
