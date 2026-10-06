import { paginasManuscrito } from "@/lib/manuscrito";
import type { Lang } from "@/lib/contenido";

export default function Manuscrito({ lang }: { lang: Lang }) {
  const es = lang === "es";
  const inicio = es ? "/" : "/en";
  return (
    <>
      <header className="barra barra-manuscrito">
        <a className="marca" href={inicio}><span lang="he">כסא אליהו</span></a>
        <nav aria-label={es ? "Navegación principal" : "Main navigation"}>
          <a href={inicio}>{es ? "La silla" : "The chair"}</a>
          <a href={`${inicio}#sillas`}>{es ? "Sillas" : "Chairs"}</a>
          <a href={es ? "/en/manuscript" : "/manuscrito"} hrefLang={es ? "en" : "es"}>{es ? "English" : "Español"}</a>
        </nav>
      </header>
      <main className="manuscrito">
        <header className="manuscrito-cabeza">
          <p className="etiqueta-paso">{es ? "De su puño y letra" : "In his own handwriting"}</p>
          <h1>{es ? "Lo que escribió Tito Isaque" : "What Uncle Isaque wrote"}</h1>
          <p className="entrada">{es ? "Isaac Garzón Serfaty z”l cuenta cómo hacía las sillas de Eliyahu y cómo las llevaba a las ceremonias de brit milá." : "Isaac Garzón Serfaty z”l tells how he made Elijah’s chairs and delivered them for brit milah ceremonies."}</p>
          <p className="nota-editorial">{es ? "Transcripción del manuscrito original. Se han regularizado las tildes y la puntuación. Las lecturas dudosas están entre corchetes. Los títulos de las páginas 2 y 3 se han añadido para orientar la lectura." : "The original Spanish manuscript and its Spanish transcription. Accents and punctuation have been regularised; uncertain readings appear in square brackets. Headings for pages 2 and 3 have been added to guide the reader."}</p>
          <nav className="acciones" aria-label={es ? "Páginas del manuscrito" : "Manuscript pages"}>
            {paginasManuscrito.map(p => <a className="enlace" key={p.numero} href={`#pagina-${p.numero}`}>{`${es ? "Página" : "Page"} ${p.numero}`}</a>)}
          </nav>
        </header>
        {paginasManuscrito.map(p => (
          <section className="manuscrito-pagina" id={`pagina-${p.numero}`} key={p.numero} aria-labelledby={`titulo-${p.numero}`}>
            <figure className="manuscrito-original">
              <a href={`/manuscrito/pagina-${p.numero}.svg`} target="_blank" rel="noopener noreferrer" aria-label={es ? `Ampliar imagen original de la página ${p.numero} (abre otra pestaña)` : `Enlarge original image of page ${p.numero} (opens a new tab)`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="hoja" src={`/manuscrito/pagina-${p.numero}.svg`} width={p.ancho} height={p.alto} alt={es ? `Página ${p.numero} escrita a mano por Isaac Garzón Serfaty` : `Page ${p.numero}, handwritten by Isaac Garzón Serfaty`} loading={p.numero === 1 ? "eager" : "lazy"} decoding="async" />
              </a>
              <figcaption>{es ? `Página ${p.numero} · Pulsa la imagen para ampliarla.` : `Page ${p.numero} · Click the image to enlarge it.`}</figcaption>
            </figure>
            <article className="manuscrito-texto" lang="es">
              <p className="etiqueta-paso">Página {p.numero} · Transcripción</p>
              <h2 id={`titulo-${p.numero}`}>{p.titulo}</h2>
              {p.parrafos.map((texto, i) => <p key={i}>{texto}</p>)}
            </article>
          </section>
        ))}
        <div className="manuscrito-fin">
          <p>{es ? "El manuscrito habla de siete sillas. La lista de la web reúne las nueve entradas aportadas por la familia, incluida la silla de Madrid hecha con su plano." : "The manuscript mentions seven chairs. The website’s list contains the nine entries provided by the family, including the Madrid chair made from his plan."}</p>
          <a className="boton" href={`${inicio}#sillas`}>{es ? "Ver las sillas de Tito Isaque" : "See Uncle Isaque’s chairs"} →</a>
        </div>
      </main>
      <footer className="pie"><p>{es ? "En memoria de Isaac Garzón Serfaty z”l" : "In memory of Isaac Garzón Serfaty z”l"}</p><a href={inicio}>{es ? "Volver a la silla y al plano" : "Back to the chair and the plan"} →</a></footer>
    </>
  );
}
