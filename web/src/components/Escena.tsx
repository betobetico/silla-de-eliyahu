"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { dict, type Lang } from "@/lib/contenido";
import { silla, tipos, totalPiezas } from "@/lib/silla";
import type { Estado } from "./Silla3D";

const Silla3D = dynamic(() => import("./Silla3D"), {
  ssr: false,
  loading: () => <p className="cargando">…</p>,
});

export default function Escena({ lang }: { lang: Lang }) {
  const t = dict[lang];
  const seccion = useRef<HTMLElement>(null);
  const estado = useRef<Estado>({ p: 0, giro: 0 });
  const [activo, setActivo] = useState<string | null>(null);
  const [capitulo, setCapitulo] = useState(0);
  const lista = tipos();

  useEffect(() => {
    let raf = 0;
    const mide = () => {
      raf = 0;
      const el = seccion.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const recorrido = r.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, recorrido)));
      estado.current.p = p;
      setCapitulo(p < 0.2 ? 0 : p < 0.42 ? 1 : p < 0.74 ? 2 : 3);
    };
    const pide = () => {
      if (!raf) raf = requestAnimationFrame(mide);
    };
    mide();
    addEventListener("scroll", pide, { passive: true });
    addEventListener("resize", pide);
    return () => {
      removeEventListener("scroll", pide);
      removeEventListener("resize", pide);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Arrastrar en horizontal gira la silla; en vertical, la página hace scroll como siempre.
  const arrastre = useRef<{ x: number; id: number } | null>(null);
  const baja = (e: React.PointerEvent) => {
    arrastre.current = { x: e.clientX, id: e.pointerId };
  };
  const mueve = (e: React.PointerEvent) => {
    const a = arrastre.current;
    if (!a || a.id !== e.pointerId) return;
    estado.current.giro += (e.clientX - a.x) * 0.008;
    a.x = e.clientX;
  };
  const suelta = () => {
    arrastre.current = null;
  };

  const pieza = activo ? lista.find((x) => x.pieza.tipo === activo) : null;
  const etiqueta = pieza
    ? `${lang === "es" ? pieza.pieza.nombre : pieza.pieza.name} · ${pieza.pieza.seccion}${pieza.cantidad > 1 ? ` · ${pieza.cantidad} ${lang === "es" ? "uds." : "pcs"}` : ""}`
    : capitulo === 2
      ? t.piezas.toca
      : "";

  return (
    <section className="escena" ref={seccion} aria-label={t.hero.titulo}>
      <div
        className="lienzo"
        onPointerDown={baja}
        onPointerMove={mueve}
        onPointerUp={suelta}
        onPointerCancel={suelta}
        onPointerLeave={suelta}
      >
        <Silla3D
          estado={estado}
          activo={activo}
          onActivo={setActivo}
          fallback={
            // eslint-disable-next-line @next/next/no-img-element
            <img className="sin-webgl" src="/original/foto-frente.jpg" alt={t.sinWebgl} />
          }
        />
        <p className="etiqueta" aria-live="polite">
          {etiqueta}
        </p>
      </div>

      <div className="capitulos">
        <article className={`cap cap-hero ${capitulo === 0 ? "activo" : ""}`}>
          <p className="inscripcion" lang="he" dir="rtl">
            {silla.inscripcion.lineas.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </p>
          <p className="traduccion">{t.hero.traduccion}</p>
          <h1>{t.hero.titulo}</h1>
          <p className="entrada">{t.hero.entrada}</p>
          <p className="entrada">{t.hero.relato.antes}<a href={t.hero.relato.href}>{t.hero.relato.enlace}</a>{t.hero.relato.despues}</p>
          <p className="acciones">
            {t.hero.acciones.map((a, i) => (
              <a key={a.href} href={a.href} className={i === 0 ? "boton" : "enlace"}>
                {a.t} ↓
              </a>
            ))}
          </p>
          <p className="baja" aria-hidden="true">
            {t.hero.baja} ↓
          </p>
        </article>

        <article className={`cap cap-historia ${capitulo === 1 ? "activo" : ""}`}>
          <figure className="retrato">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/historia/isaac.jpg" alt={t.historia.retrato} width={900} height={1125} loading="lazy" decoding="async" />
            <figcaption>{t.historia.retrato}</figcaption>
          </figure>
          <h2>{t.historia.titulo}</h2>
          {t.historia.parrafos.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </article>

        <article className={`cap cap-piezas ${capitulo === 2 ? "activo" : ""}`}>
          <h2>{t.piezas.titulo}</h2>
          <p>{t.piezas.texto(totalPiezas, lista.length)}</p>
          <ul className="piezas">
            {lista.map(({ pieza: p, cantidad }) => (
              <li
                key={p.tipo}
                className={activo === p.tipo ? "on" : ""}
                onPointerEnter={() => setActivo(p.tipo)}
                onPointerLeave={() => setActivo(null)}
              >
                <span>{lang === "es" ? p.nombre : p.name}</span>
                <span className="num">
                  {p.seccion}
                  {cantidad > 1 ? ` · ${cantidad} ${lang === "es" ? "uds." : "pcs"}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className={`cap ${capitulo === 3 ? "activo" : ""}`}>
          <h2>{t.medidas.titulo}</h2>
          <p>{t.medidas.texto}</p>
          <dl className="cotas">
            {t.medidas.cotas.map(([k, v]) => (
              <div key={k + v}>
                <dt>{k}</dt>
                <dd>{lang === "es" ? v : v.replace(",", ".")}</dd>
              </div>
            ))}
          </dl>
        </article>
      </div>
    </section>
  );
}

