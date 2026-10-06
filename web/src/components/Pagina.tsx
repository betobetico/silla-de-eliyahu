import Escena from "./Escena";
import { dict, dudasEn, REPO, type Lang } from "@/lib/contenido";
import { silla } from "@/lib/silla";

export default function Pagina({ lang }: { lang: Lang }) {
  const t = dict[lang];
  const dudas = silla.dudas.map((d) => (lang === "es" ? d : { ...d, ...dudasEn[d.id] }));

  return (
    <>
      <header className="barra">
        <a className="marca" href={lang === "es" ? "/" : "/en"}>
          <span lang="he">כסא אליהו</span>
        </a>
        <nav aria-label={lang === "es" ? "Navegación principal" : "Main navigation"}>
          <a href={lang === "es" ? "/manuscrito" : "/en/manuscript"}>{lang === "es" ? "Manuscrito" : "Manuscript"}</a>
          <a href="#sillas">{lang === "es" ? "Sillas" : "Chairs"}</a>
          <a href="#plano">{lang === "es" ? "Plano" : "Plan"}</a>
          <a href="#descargas">{lang === "es" ? "Descargas" : "Downloads"}</a>
          <a href={t.otro.href} hrefLang={lang === "es" ? "en" : "es"}>
            {t.otro.texto}
          </a>
        </nav>
      </header>

      <main>
        <Escena lang={lang} />

        <section className="historia" id="historia">
          <header className="historia-cabeza">
            <h2>{t.proceso.titulo}</h2>
            <p>{t.proceso.entrada}</p>
          </header>
          {t.proceso.pasos.map((paso, i) => (
            <article key={paso.id} className={`paso paso-${paso.id}`}>
              <div className="paso-texto">
                <p className="etiqueta-paso">
                  <span className="num">{i + 1}</span> {paso.etiqueta}
                </p>
                <h3>{paso.titulo}</h3>
                <p>{paso.texto}</p>
              </div>
              <div className="paso-fotos">
                {paso.fotos.map((f) => (
                  <figure key={f.src} className={f.w > f.h ? "ancha" : "alta"}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/historia/${f.src}`} alt={f.pie} width={f.w} height={f.h} loading="lazy" decoding="async" />
                    <figcaption>{f.pie}</figcaption>
                  </figure>
                ))}
                {"video" in paso && paso.video && (
                  <figure className="alta">
                    <video
                      src={`/historia/${paso.video.src}`}
                      poster={`/historia/${paso.video.poster}`}
                      width={480}
                      height={848}
                      muted
                      loop
                      playsInline
                      autoPlay
                      preload="none"
                    />
                    <figcaption>{paso.video.pie}</figcaption>
                  </figure>
                )}
              </div>
            </article>
          ))}
        </section>

        <section className="bloque invitacion-manuscrito">
          <div className="col-texto">
            <p className="etiqueta-paso">{lang === "es" ? "De su puño y letra" : "In his own handwriting"}</p>
            <h2>{lang === "es" ? "Lo que escribió Tito Isaque" : "What Uncle Isaque wrote"}</h2>
            <p>{lang === "es" ? "En estas tres páginas, Isaac cuenta cómo hacía las sillas y recuerda los viajes a Miami y Maracaibo para llevarlas a un brit milá." : "In these three pages, Isaac tells how he made the chairs and recalls the journeys to Miami and Maracaibo to deliver them for a brit milah."}</p>
            <a className="enlace" href={lang === "es" ? "/manuscrito" : "/en/manuscript"}>{lang === "es" ? "Ver el manuscrito y leer la transcripción" : "See the manuscript and read the Spanish transcription"} →</a>
          </div>
          <figure className="manuscrito-adelanto">
            <a href={lang === "es" ? "/manuscrito" : "/en/manuscript"} aria-label={lang === "es" ? "Abrir el manuscrito" : "Open the manuscript"}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hoja" src="/manuscrito/pagina-1.jpg" alt={lang === "es" ? "Primera página del manuscrito de Isaac" : "First page of Isaac’s manuscript"} width={576} height={1024} loading="lazy" />
            </a>
          </figure>
        </section>

        <section className="bloque sillas" id="sillas">
          <div className="col-texto">
            <h2>{t.sillas.titulo}</h2>
            <p>{t.sillas.texto}</p>
            <a className="enlace" href={`https://github.com/betobetico/silla-de-eliyahu/issues/new?title=${encodeURIComponent(lang === "es" ? "Otra silla de Eliyahu" : "Another Elijah's chair")}&body=${encodeURIComponent(lang === "es" ? "Sinagoga:\nCiudad y país:\n¿La hizo Isaac o se hizo con su plano?\nFoto (si tienes):" : "Synagogue:\nCity and country:\nBuilt by Isaac or from his plan?\nPhoto (if you have one):")}`}>
              {t.sillas.boton} ↗
            </a>
          </div>
          <ol className="lista-sillas">
            {t.sillas.lista.map((x, i) => (
              <li key={`${i}-${x.lugar}`}>
                <span className="silla-numero" aria-hidden="true">{i + 1}</span>
                <div className="silla-datos">
                <span className="lugar">
                  {x.sinagoga ? `${x.sinagoga} · ` : ""}
                  {x.lugar}
                </span>
                <span className="pais">{x.pais}</span>
                {x.nota && <span className="nota">{x.nota}</span>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="bloque tuya">
          <h2>{t.tuya.titulo}</h2>
          <div className="tuya-texto">
            {t.tuya.parrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p className="firma">— {t.tuya.firma}</p>
            <a className="boton" href="#descargas">
              {t.tuya.boton} ↓
            </a>
          </div>
        </section>

        <section className="bloque" id="plano">
          <div className="col-texto">
            <h2>{t.original.titulo}</h2>
            <p>{t.original.texto}</p>
            <h3>{t.original.notasTitulo}</h3>
            <ul className="notas">
              {t.original.notas.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
          <figure className="col-figura">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hoja" src="/original/plano-isaac.jpg" alt={t.original.titulo} width={1100} height={1407} loading="lazy" />
            <figcaption>{t.original.pie}</figcaption>
          </figure>
        </section>

        <section className="bloque bloque-invertido">
          <div className="col-texto">
            <h2>{t.letras.titulo}</h2>
            <p>{t.letras.texto}</p>
            <p className="inscripcion pequena" lang="he" dir="rtl">
              {silla.inscripcion.lineas.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </p>
            <ol className="palabras" lang="he" dir="rtl">
              {silla.inscripcion.palabras.map((w, i) => (
                <li key={w}>
                  <b>{w}</b>
                  <small>{i + 1}</small>
                </li>
              ))}
            </ol>
          </div>
          <figure className="col-figura">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hoja" src="/original/plantilla-letras.jpg" alt={t.letras.titulo} width={1100} height={800} loading="lazy" />
            <figcaption>{t.letras.pie}</figcaption>
          </figure>
        </section>

        <section className="bloque descargas" id="descargas">
          <div className="col-texto">
            <h2>{t.descargas.titulo}</h2>
            <p>{t.descargas.texto}</p>
            <div className="aviso" role="note">
              <b>{t.descargas.aviso.titulo}</b>
              <p>{t.descargas.aviso.texto}</p>
            </div>
            <p className="licencia">{t.descargas.licencia}</p>
          </div>
          <ul className="archivos">
            {t.descargas.items.map((a) => (
              <li key={a.f}>
                <a href={`/descargas/${a.f}`} download>
                  <span className="tipo">{a.t}</span>
                  <span className="nombre">{a.f}</span>
                  <span className="desc">{a.d}</span>
                </a>
              </li>
            ))}
            <li>
              <a href={REPO}>
                <span className="tipo">{t.descargas.repo.t}</span>
                <span className="nombre">betobetico/silla-de-eliyahu</span>
                <span className="desc">{t.descargas.repo.d}</span>
              </a>
            </li>
          </ul>
        </section>

        <section className="bloque construir">
          <div className="col-texto">
            <h2>{t.construir.titulo}</h2>
            <p>{t.construir.texto}</p>
          </div>
          <div className="dudas">
            {dudas.map((d) => (
              <details key={d.id}>
                <summary>
                  <span className="num">{d.id}</span> {d.titulo}
                </summary>
                <p>{d.detalle}</p>
                <p>
                  <b>{t.construir.hecho}:</b> {d.decision}
                </p>
                {d.alternativa !== "—" && (
                  <p className="tenue">
                    <b>{t.construir.alternativa}:</b> {d.alternativa}
                  </p>
                )}
              </details>
            ))}
          </div>
        </section>

        <section className="dedicatoria">
          <p lang="he" dir="rtl" className="inscripcion pequena">
            {silla.inscripcion.lineas.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </p>
          <p className="dedicatoria-texto">{t.dedicatoria}</p>
        </section>
      </main>

      <footer className="pie">
        {t.pie.map((l) => (
          <p key={l}>{l}</p>
        ))}
        <p>
          <a href={REPO}>github.com/betobetico/silla-de-eliyahu</a>
        </p>
      </footer>
    </>
  );
}
