export type Lang = "es" | "en";

export const REPO = "https://github.com/betobetico/silla-de-eliyahu";

const es = {
  lang: "es" as Lang,
  otro: { href: "/en", texto: "English" },
  meta: {
    title: "La silla de Eliyahu de Isaac Garzón Serfaty z”l",
    description:
      "El plano de la silla de Eliyahu de Isaac Garzón Serfaty z”l, en CAD y con licencia libre, para que cada uno pueda hacer la suya.",
  },
  hero: {
    traduccion: "Esta es la silla del profeta Elías, recordado para bien.",
    titulo: "La silla de Eliyahu de Isaac Garzón Serfaty z”l",
    entrada:
      "Tito Isaque dibujó el plano de esta silla e hizo una. Quería que cada sinagoga tuviera la suya para los britot. Aquí está su plano, para que hagas la tuya.",
    acciones: [
      { href: "#descargas", t: "Descarga el plano" },
      { href: "#historia", t: "Cómo se hizo la nuestra" },
    ],
    baja: "Baja para desmontarla",
  },
  historia: {
    titulo: "Lo que quería tito Isaque",
    parrafos: [
      "En cada brit milá se reserva una silla para el profeta Eliyahu. Según la tradición, Eliyahu está presente en cada circuncisión, y la silla lleva grabado que es la suya.",
      "Isaac Garzón Serfaty hizo sillas de Eliyahu y las donó a sinagogas de Caracas, Porlamar y Miami. Dibujó esta con todas sus medidas: la altura de los brazos, la sección de cada listón y la plantilla de las letras.",
      "En Madrid quisimos seguir su legado con una en la sinagoga Or Hayeladim. Ahora su plano es de todos, para que cada uno pueda hacer la silla y multiplicar su mitzvá.",
    ],
  },
  piezas: {
    titulo: "Pieza a pieza",
    texto: (n: number, t: number) =>
      `La silla tiene ${n} piezas de ${t} tipos. Al bajar, se separan. Pasa el dedo por una para ver su nombre y su sección.`,
    toca: "Toca una pieza",
    unidades: "cm",
  },
  medidas: {
    titulo: "Medida a medida",
    texto:
      "Mide 164,5 cm de alto. El asiento queda a 70 y los brazos a 101 detrás y a 95 delante. Tiene 65 de ancho y 59 de fondo. Como el asiento está tan alto, lleva un reposapiés a 12 cm del suelo.",
    cotas: [
      ["Alto total", "164,5 cm"],
      ["Asiento", "70 cm"],
      ["Brazos", "101 detrás · 95 delante"],
      ["Ancho", "65 cm"],
      ["Fondo", "59 cm · 69 con los brazos"],
      ["Patas y postes", "5 × 5 cm"],
      ["Chambranas y travesaños", "5 × 3 cm"],
      ["Brazos", "8 × 4 cm"],
      ["Copete", "26 × 3 cm"],
    ] as [string, string][],
  },
  original: {
    titulo: "El plano de Isaac",
    texto:
      "Está dibujado a lápiz sobre una hoja con el membrete de Refrigeración Córdoba, en Porlamar, isla de Margarita. La silla aparece tumbada: el suelo queda a la izquierda y lo alto del respaldo a la derecha.",
    pie: "Arriba, el alzado lateral. Abajo a la izquierda, la silla vista por detrás. Abajo a la derecha, los brazos vistos desde arriba.",
    notasTitulo: "Lo que escribió en el plano",
    notas: [
      "«Las medidas son en centímetros.»",
      "«Las chambranas son de 5×3.»",
      "«Las patas son de 5×5.»",
      "«Espesor apoya brazo 8×4.»",
      "«Altura apoya brazo 95 frente y 101 atrás.»",
      "«Lleva un esterillado de madera abajo con maderas de 3×1 al ras de la chambrana.»",
      "«Las letras van grabadas en la parte delantera.»",
    ],
  },
  proceso: {
    titulo: "Cómo se hizo la nuestra",
    entrada: "La silla de la sinagoga Or Hayeladim de Madrid se hizo con este plano.",
    pasos: [
      {
        id: "inicio",
        etiqueta: "El inicio · 2016",
        titulo: "Una silla y unos planos",
        texto: "Mi madre me dio una silla y mi hermana me dio los planos. Tito Isaque había dibujado el plano y había hecho la silla.",
        fotos: [
          { src: "inicio-silla-isaac.jpg", w: 1200, h: 1600, pie: "La silla que hizo Isaac, en una foto impresa." },
          { src: "inicio-brit.jpg", w: 762, h: 1600, pie: "Un brit milá en la silla de Isaac." },
          { src: "inicio-sinagoga.jpg", w: 1200, h: 1600, pie: "La silla de Isaac." },
        ],
      },
      {
        id: "proceso",
        etiqueta: "El proceso · 2016-2017",
        titulo: "En el taller",
        texto: "Con el plano de Isaac, el carpintero Mateo Bonilla hizo una nueva: primero la estructura, después el copete con las letras y al final el tapizado.",
        fotos: [
          { src: "proceso-1.jpg", w: 750, h: 1334, pie: "La estructura, con el esterillado." },
          { src: "proceso-2.jpg", w: 1200, h: 1600, pie: "Con los brazos, el copete y el reposapiés." },
          { src: "proceso-3.jpg", w: 1600, h: 1200, pie: "Tapizada y con las letras grabadas." },
          { src: "proceso-4.jpg", w: 1600, h: 1200, pie: "Mateo Bonilla en la primera prueba." },
        ],
        video: { src: "proceso-video.mp4", poster: "proceso-video.jpg", pie: "La estructura recién montada." },
      },
      {
        id: "final",
        etiqueta: "La silla terminada · junio de 2017",
        titulo: "En Or Hayeladim",
        texto: "La silla está en la sinagoga Or Hayeladim de Madrid, en memoria de tito Isaque.",
        fotos: [
          { src: "final-frente.jpg", w: 1200, h: 1600, pie: "De frente." },
          { src: "final-tres-cuartos.jpg", w: 1200, h: 1600, pie: "Con el reposapiés por delante." },
          { src: "final-lado.jpg", w: 1200, h: 1600, pie: "De lado." },
          { src: "final-alberto.jpg", w: 1200, h: 1600, pie: "Alberto Benbunan Garzón, sobrino de Isaac." },
        ],
      },
    ],
  },
  sillas: {
    titulo: "Dónde hay una silla de Isaac",
    texto:
      "Isaac donó sillas a sinagogas de Venezuela y de Estados Unidos. La de Madrid se hizo con su plano. Si sabes de otra, o si haces la tuya, cuéntanoslo y la añadimos.",
    lista: [
      { lugar: "Caracas", pais: "Venezuela", sinagoga: "", nota: "Donada por Isaac" },
      { lugar: "Porlamar, isla de Margarita", pais: "Venezuela", sinagoga: "", nota: "Donada por Isaac" },
      { lugar: "Miami", pais: "Estados Unidos", sinagoga: "Skylake", nota: "Donada por Isaac" },
      { lugar: "Madrid", pais: "España", sinagoga: "Or Hayeladim", nota: "Julio de 2017 · hecha con su plano" },
    ],
    boton: "Cuéntanos dónde hay otra",
  },
  letras: {
    titulo: "Las letras",
    texto:
      "En la cara delantera del copete va grabada la inscripción. Isaac dibujó las letras a tamaño real y numeró las palabras: cuatro en la línea de arriba y dos en la de abajo.",
    pie: "La plantilla de las letras. Abajo a la izquierda, el croquis del copete con el número de cada palabra.",
  },
  descargas: {
    titulo: "Descarga el plano",
    texto:
      "Todo sale de un único fichero de medidas, silla.json. Si se cambia una cota ahí y se vuelve a generar, cambian a la vez el DXF, el PDF, el despiece y el dibujo 3D de esta página.",
    items: [
      { f: "silla-de-eliyahu.dxf", t: "DXF", d: "Para AutoCAD, LibreCAD o FreeCAD. Alzado, vista lateral, planta y copete, acotados en centímetros." },
      { f: "silla-de-eliyahu.pdf", t: "PDF", d: "Tres hojas A3 para imprimir: vistas a 1:10, detalles a 1:4 y despiece." },
      { f: "despiece.csv", t: "Despiece", d: "Lista de cortes: pieza, cantidad, sección y largo, con las espigas sumadas." },
      { f: "silla.json", t: "Medidas", d: "Las medidas de cada pieza, para quien quiera modificar la silla." },
    ],
    repo: { t: "GitHub", d: "El código, los escaneos originales y el historial de cambios." },
    licencia:
      "Licencia CC BY 4.0: se puede copiar, modificar y vender, siempre que se cite a Isaac Garzón Serfaty z”l.",
    aviso: {
      titulo: "Antes de cortar",
      texto:
        "Que un carpintero revise el plano y las seis cotas por validar. Las medidas salen del dibujo a lápiz de Isaac: la silla de Or Hayeladim todavía no se ha medido.",
    },
  },
  construir: {
    titulo: "Antes de cortar",
    texto:
      "El plano de Isaac no lo dice todo. Donde faltaba una cota o dos no cuadraban, hemos tomado una decisión y está escrita aquí. Conviene revisarlas con el carpintero antes de cortar.",
    hecho: "Se ha hecho",
    alternativa: "Alternativa",
  },
  tuya: {
    titulo: "Haz la tuya",
    parrafos: [
      "Yo no puedo hacer sillas para todo el mundo. Pero cualquiera puede coger este plano, llevárselo a un carpintero y hacer la silla para su sinagoga.",
      "Si eso pasa, yo habré cumplido mi parte y tito Isaque, su mitzvá: que haya una silla de Eliyahu en cada brit milá y se pueda cumplir la mitzvá de la circuncisión.",
    ],
    firma: "Alberto Benbunan Garzón, sobrino de Isaac",
    boton: "Descarga el plano",
  },
  dedicatoria: "En memoria de Isaac Garzón Serfaty z”l",
  pie: [
    "Plano y primera silla: Isaac Garzón Serfaty z”l. Primer CAD del plano: Acacia Waich; el de esta web se ha rehecho a partir del suyo.",
    "Carpintero de la silla de Or Hayeladim: Mateo Bonilla, que aparece en las fotos del taller. En las de la silla terminada aparece Alberto Benbunan Garzón.",
    "Dibujo 3D generado desde las medidas del plano. Código con licencia MIT; plano y textos, CC BY 4.0. Las fotos son de sus autores.",
  ],
  sinWebgl: "Tu navegador no puede mostrar el dibujo en 3D. Esta es la silla de frente.",
};

export type Dict = typeof es;

const en: Dict = {
  lang: "en",
  otro: { href: "/", texto: "Español" },
  meta: {
    title: "Elijah's Chair by Isaac Garzón Serfaty z”l",
    description:
      "The plan of Isaac Garzón Serfaty z”l's Elijah's chair, in CAD and under an open license, so that anyone can build their own.",
  },
  hero: {
    traduccion: "This is the chair of Elijah the prophet, remembered for good.",
    titulo: "Elijah's Chair by Isaac Garzón Serfaty z”l",
    entrada:
      "Uncle Isaque drew the plan of this chair and built one. He wanted every synagogue to have its own for the britot. Here is his plan, so you can build yours.",
    acciones: [
      { href: "#descargas", t: "Download the plan" },
      { href: "#historia", t: "How ours was made" },
    ],
    baja: "Scroll to take it apart",
  },
  historia: {
    titulo: "What Uncle Isaque wanted",
    parrafos: [
      "At every brit milah a chair is set aside for Elijah the prophet. By tradition, Elijah is present at every circumcision, and the chair is engraved to say it is his.",
      "Isaac Garzón Serfaty built Elijah's chairs and donated them to synagogues in Caracas, Porlamar and Miami. He drew this one with all its measurements: the height of the arms, the section of every rail and the template for the letters.",
      "In Madrid we tried to carry on his legacy with one at the Or Hayeladim synagogue. Now his plan belongs to everyone, so that anyone can build the chair and multiply his mitzvah.",
    ],
  },
  piezas: {
    titulo: "Piece by piece",
    texto: (n: number, t: number) =>
      `The chair has ${n} pieces of ${t} kinds. As you scroll, they come apart. Hover over one to see its name and section.`,
    toca: "Touch a piece",
    unidades: "cm",
  },
  medidas: {
    titulo: "Measure by measure",
    texto:
      "It is 164.5 cm tall. The seat is at 70 and the arms at 101 at the back and 95 at the front. It is 65 wide and 59 deep. Because the seat is so high, it has a footrest 12 cm off the floor.",
    cotas: [
      ["Overall height", "164.5 cm"],
      ["Seat", "70 cm"],
      ["Arms", "101 back · 95 front"],
      ["Width", "65 cm"],
      ["Depth", "59 cm · 69 with the arms"],
      ["Legs and posts", "5 × 5 cm"],
      ["Stretchers and rails", "5 × 3 cm"],
      ["Arms", "8 × 4 cm"],
      ["Crest rail", "26 × 3 cm"],
    ],
  },
  original: {
    titulo: "Isaac's drawing",
    texto:
      "It is drawn in pencil on a sheet with the letterhead of Refrigeración Córdoba, in Porlamar, Margarita Island. The chair is drawn lying down: the floor is on the left and the top of the back on the right.",
    pie: "Top: side elevation. Bottom left: the chair seen from behind. Bottom right: the arms seen from above.",
    notasTitulo: "What he wrote on the plan (translated)",
    notas: [
      "“Measurements are in centimetres.”",
      "“The stretchers are 5×3.”",
      "“The legs are 5×5.”",
      "“Armrest thickness 8×4.”",
      "“Armrest height 95 at the front and 101 at the back.”",
      "“It has a slatted wooden shelf below, with 3×1 slats flush with the stretcher.”",
      "“The letters are engraved on the front.”",
    ],
  },
  proceso: {
    titulo: "How ours was made",
    entrada: "The chair at the Or Hayeladim synagogue in Madrid was made from this plan.",
    pasos: [
      {
        id: "inicio",
        etiqueta: "The beginning · 2016",
        titulo: "A chair and a plan",
        texto: "My mother gave me a chair and my sister gave me the plans. Uncle Isaque had drawn the plan and built the chair.",
        fotos: [
          { src: "inicio-silla-isaac.jpg", w: 1200, h: 1600, pie: "The chair Isaac built, in a printed photo." },
          { src: "inicio-brit.jpg", w: 762, h: 1600, pie: "A brit milah on Isaac's chair." },
          { src: "inicio-sinagoga.jpg", w: 1200, h: 1600, pie: "Isaac's chair." },
        ],
      },
      {
        id: "proceso",
        etiqueta: "The making · 2016-2017",
        titulo: "In the workshop",
        texto: "From Isaac's plan, the carpenter Mateo Bonilla built a new one: first the frame, then the crest rail with the letters, and finally the upholstery.",
        fotos: [
          { src: "proceso-1.jpg", w: 750, h: 1334, pie: "The frame, with the slatted shelf." },
          { src: "proceso-2.jpg", w: 1200, h: 1600, pie: "With the arms, the crest rail and the footrest." },
          { src: "proceso-3.jpg", w: 1600, h: 1200, pie: "Upholstered, with the letters engraved." },
          { src: "proceso-4.jpg", w: 1600, h: 1200, pie: "Mateo Bonilla trying it for the first time." },
        ],
        video: { src: "proceso-video.mp4", poster: "proceso-video.jpg", pie: "The frame, just assembled." },
      },
      {
        id: "final",
        etiqueta: "The finished chair · June 2017",
        titulo: "At Or Hayeladim",
        texto: "The chair is at the Or Hayeladim synagogue in Madrid, in memory of Uncle Isaque.",
        fotos: [
          { src: "final-frente.jpg", w: 1200, h: 1600, pie: "Front." },
          { src: "final-tres-cuartos.jpg", w: 1200, h: 1600, pie: "With the footrest in front." },
          { src: "final-lado.jpg", w: 1200, h: 1600, pie: "Side." },
          { src: "final-alberto.jpg", w: 1200, h: 1600, pie: "Alberto Benbunan Garzón, Isaac's nephew." },
        ],
      },
    ],
  },
  sillas: {
    titulo: "Where Isaac's chairs are",
    texto:
      "Isaac donated chairs to synagogues in Venezuela and the United States. The one in Madrid was built from his plan. If you know of another, or if you build yours, tell us and we will add it.",
    lista: [
      { lugar: "Caracas", pais: "Venezuela", sinagoga: "", nota: "Donated by Isaac" },
      { lugar: "Porlamar, Margarita Island", pais: "Venezuela", sinagoga: "", nota: "Donated by Isaac" },
      { lugar: "Miami", pais: "United States", sinagoga: "Skylake", nota: "Donated by Isaac" },
      { lugar: "Madrid", pais: "Spain", sinagoga: "Or Hayeladim", nota: "July 2017 · built from his plan" },
    ],
    boton: "Tell us about another one",
  },
  letras: {
    titulo: "The letters",
    texto:
      "The inscription is engraved on the front of the crest rail. Isaac drew the letters full size and numbered the words: four on the top line and two below.",
    pie: "The letter template. Bottom left, the sketch of the crest rail with the number of each word.",
  },
  descargas: {
    titulo: "Download the plan",
    texto:
      "Everything comes from a single measurements file, silla.json. Change a dimension there, regenerate, and the DXF, the PDF, the cut list and the 3D drawing on this page all change together.",
    items: [
      { f: "silla-de-eliyahu.dxf", t: "DXF", d: "For AutoCAD, LibreCAD or FreeCAD. Front, side, plan and crest rail, dimensioned in centimetres." },
      { f: "silla-de-eliyahu.pdf", t: "PDF", d: "Three A3 sheets to print: views at 1:10, details at 1:4 and cut list. In Spanish." },
      { f: "despiece.csv", t: "Cut list", d: "Piece, quantity, section and length, tenons included." },
      { f: "silla.json", t: "Measurements", d: "Every piece's dimensions, for anyone who wants to modify the chair." },
    ],
    repo: { t: "GitHub", d: "The code, the original scans and the change history." },
    licencia:
      "CC BY 4.0 license: you may copy, modify and sell it, as long as you credit Isaac Garzón Serfaty z”l.",
    aviso: {
      titulo: "Before you cut",
      texto:
        "Have a carpenter check the plan and the six open dimensions. The measurements come from Isaac's pencil drawing: the chair at Or Hayeladim has not been measured yet.",
    },
  },
  construir: {
    titulo: "Before you cut",
    texto:
      "Isaac's plan does not say everything. Where a dimension was missing or two did not agree, we made a decision and it is written here. Go through them with your carpenter before cutting.",
    hecho: "What we did",
    alternativa: "Alternative",
  },
  tuya: {
    titulo: "Build yours",
    parrafos: [
      "I cannot make chairs for everyone. But anyone can take this plan to a carpenter and make the chair for their synagogue.",
      "If that happens, I will have done my part, and Uncle Isaque his mitzvah: that there is an Elijah's chair at every brit milah, so the mitzvah of circumcision can be fulfilled.",
    ],
    firma: "Alberto Benbunan Garzón, Isaac's nephew",
    boton: "Download the plan",
  },
  dedicatoria: "In memory of Isaac Garzón Serfaty z”l",
  pie: [
    "Plan and first chair: Isaac Garzón Serfaty z”l. First CAD of the plan: Acacia Waich; the one on this site was redrawn from hers.",
    "Carpenter of the Or Hayeladim chair: Mateo Bonilla, who appears in the workshop photos. Alberto Benbunan Garzón appears in the photos of the finished chair.",
    "3D drawing generated from the plan's measurements. Code under the MIT license; plan and texts, CC BY 4.0. Photos belong to their authors.",
  ],
  sinWebgl: "Your browser cannot show the 3D drawing. This is the chair from the front.",
};

/** Las dudas del plano en inglés (en silla.json solo están en español). */
export const dudasEn: Record<string, { titulo: string; detalle: string; decision: string; alternativa: string }> = {
  D1: {
    titulo: "Overall height: 159 or 164.5",
    detalle: "The side elevation adds up to 20 + 5 + 40 + 5 + 27 + 4 + 58 = 159, matching the overall height Isaac wrote. The rear elevation adds up to 20 + 5 + 40 + 5 + 8 + 8 + 45.5 + 15 + 18 = 164.5. One of the two chains has a wrong number.",
    decision: "We keep the piece sizes of the rear elevation, with the 45.5 back as written: the posts are 164.5 and the side elevation's “58” becomes 63.5. The proportions in the photos fit 45.5 better than a shortened back.",
    alternativa: "Keep 159 by reducing from 18 to 12.5 how far the post rises above the crest's shoulder. Measuring the donated chair settles it",
  },
  D2: {
    titulo: "Width: 65 outside",
    detalle: "The rear elevation gives 65 between the outer faces of the posts. The “66 interno” in the arm sketch is drawn along the arm: it is the arm's length, not a width.",
    decision: "65 outside and 55 inside. The photos show an inside width of that order.",
    alternativa: "—",
  },
  D3: {
    titulo: "The arm overhang",
    detalle: "The “10” in the side elevation sits between the front face of the leg and the arm tip: the arm overhangs by 10 cm. With “66 interno” as its length, the tip ends 7 to 12 cm past the leg. In the photo it looks like about 5.",
    decision: "A 10 cm overhang and a 64 cm arm measured from the post. Cut the arms at 70 and trim the tip on site. The widening from 8 to 10 at the tip is an assumption taken from the photos.",
    alternativa: "A 5 cm overhang, as the photo seems to show",
  },
  D4: {
    titulo: "Front stretcher and slatted shelf",
    detalle: "The plan says there is a slatted shelf flush with the stretcher, but does not draw the front stretcher or how the slats are supported.",
    decision: "A front stretcher like the back one, and two 2 × 2 cleats inside the side stretchers carrying eleven 3 × 1 slats, 55 cm long, between the posts and the legs.",
    alternativa: "Slats running front to back, resting on the front and back stretchers",
  },
  D5: {
    titulo: "The letters",
    detalle: "The template is full size: the numbers 32, 26 and 11.5 next to it (69.5 in total) are the lengths of the sheet's three rows, and at that scale the letters are 3.5 to 3.9 cm tall, as the note “letras bajas 3,5 cm” says. The scale was deduced this way, not measured: the scan has no resolution data.",
    decision: "3.5 cm letters in two centred lines: the top one about 47 cm long and the bottom one about 22, leaving about 4 cm each side within the crest rail's 55. Before engraving, check on paper that the top line fits.",
    alternativa: "—",
  },
  D6: {
    titulo: "Footrest and tipping",
    detalle: "In the plan the footrest sits entirely in front of the legs, 12 cm off the floor (Isaac writes 12 and 13: 12 looks like the height and 13 the board's depth). It is the natural step for climbing onto a 70 cm seat, and an adult stepping on its front edge can tip the chair forward.",
    decision: "It is moved back: the board runs from 7 cm behind to 6 cm in front of the legs' front face, notched around them, on a 5 × 3 rail between the legs and two short brackets.",
    alternativa: "Isaac's footrest, entirely in front, with a rail under its back edge and a warning not to step on it",
  },
};

export const dict = { es, en };
