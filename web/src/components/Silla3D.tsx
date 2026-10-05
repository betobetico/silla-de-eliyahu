"use client";

import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox, Text } from "@react-three/drei";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import { perfilCopete, perfilMensula, silla, verticesBrazo, type Pieza } from "@/lib/silla";

// Del sistema del plano (x ancho, y fondo hacia delante, z alto, en cm)
// al de three (x a la derecha, y arriba, z hacia el observador), centrado en planta.
const CX = 32.5;
const CY = 36;
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x - CX, z, y - CY);

const PAPEL = new THREE.Color("#f3eee4");
const BRILLO = new THREE.Color("#ffb36b");
const NEGRO = new THREE.Color("#000000");
const SEPARA = 24; // cm que se aleja cada pieza por unidad de "explota"

export type Estado = {
  /** Avance del scroll por la escena, de 0 a 1. */
  p: number;
  /** Giro que añade el usuario al arrastrar, en radianes. */
  giro: number;
};

const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const tramo = (p: number, puntos: [number, number][]) => {
  for (let i = 1; i < puntos.length; i++) {
    const [p0, v0] = puntos[i - 1];
    const [p1, v1] = puntos[i];
    if (p <= p1) return v0 + (v1 - v0) * suave(p0, p1, p);
  }
  return puntos[puntos.length - 1][1];
};

/** Lo que pasa en cada momento del scroll. Lo usa también la página para el texto. */
export function guion(p: number) {
  return {
    explota: suave(0.42, 0.62, p) * (1 - suave(0.74, 0.86, p)),
    plano: suave(0.78, 0.92, p),
    azimut: THREE.MathUtils.degToRad(tramo(p, [[0, 32], [0.42, 48], [0.72, -38], [0.9, 0], [1, 0]])),
    elevacion: THREE.MathUtils.degToRad(tramo(p, [[0, 10], [0.42, 12], [0.62, 20], [0.9, 3], [1, 3]])),
    lejos: tramo(p, [[0, 1], [0.42, 1], [0.62, 1.32], [0.86, 1.04], [1, 1.04]]),
  };
}

function texturaMadera(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 1024;
  const g = c.getContext("2d")!;
  g.fillStyle = "#8a4a2c";
  g.fillRect(0, 0, c.width, c.height);
  let semilla = 7;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 140; i++) {
    const x = azar() * c.width;
    const ancho = 0.6 + azar() * 2.4;
    const claro = azar() > 0.5;
    g.strokeStyle = claro ? `rgba(196,128,86,${0.08 + azar() * 0.16})` : `rgba(62,26,12,${0.08 + azar() * 0.22})`;
    g.lineWidth = ancho;
    g.beginPath();
    for (let y = 0; y <= c.height; y += 16) {
      const dx = Math.sin(y / (90 + azar() * 40) + i) * (2 + azar() * 4);
      if (y === 0) g.moveTo(x + dx, y);
      else g.lineTo(x + dx, y);
    }
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

type Malla = {
  key: string;
  tipo: "caja" | "geo";
  material: "madera" | "tela";
  centro?: THREE.Vector3;
  tam?: [number, number, number];
  radio?: number;
  geo?: THREE.BufferGeometry;
  bordes: THREE.BufferGeometry;
  /** Eje largo de la pieza, para orientar la veta. */
  veta?: "x" | "y" | "z";
};

function mallas(p: Pieza): Malla[] {
  const material = p.forma === "tapizado" ? "tela" : "madera";
  const caja = (c: number[], key: string): Malla => {
    const [x0, y0, z0, x1, y1, z1] = c;
    const tam: [number, number, number] = [x1 - x0, z1 - z0, y1 - y0];
    const min = Math.min(...tam);
    const largo = tam.indexOf(Math.max(...tam));
    return {
      key,
      tipo: "caja",
      material,
      centro: v3((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2),
      tam,
      radio: material === "tela" ? Math.min(1.6, min / 2.2) : Math.min(0.35, min / 4),
      bordes: new THREE.EdgesGeometry(new THREE.BoxGeometry(...tam)),
      veta: (["x", "y", "z"] as const)[largo],
    };
  };
  if (p.forma === "caja" || p.forma === "tapizado") return [caja(p.caja, p.id)];
  if (p.forma === "listones") {
    const [x0, y0, z0, x1, y1, z1] = p.caja;
    const { cantidad: n, ancho: a } = p.listones!;
    const hueco = (y1 - y0 - n * a) / (n - 1);
    return Array.from({ length: n }, (_, i) => {
      const ya = y0 + i * (a + hueco);
      return caja([x0, ya, z0, x1, ya + a, z1], `${p.id}-${i}`);
    });
  }
  let geo: THREE.BufferGeometry;
  if (p.forma === "copete") {
    const forma = new THREE.Shape(perfilCopete(p).map(([x, z]) => new THREE.Vector2(x - CX, z)));
    geo = new THREE.ExtrudeGeometry(forma, {
      depth: p.caja[4] - p.caja[1],
      bevelEnabled: true,
      bevelThickness: 0.25,
      bevelSize: 0.25,
      bevelSegments: 2,
      curveSegments: 4,
    });
    geo.translate(0, 0, p.caja[1] - CY);
  } else if (p.forma === "mensula") {
    const forma = new THREE.Shape(perfilMensula(p).map(([y, z]) => new THREE.Vector2(y - CY, z)));
    geo = new THREE.ExtrudeGeometry(forma, { depth: p.caja[3] - p.caja[0], bevelEnabled: false });
    geo.rotateY(-Math.PI / 2);
    geo.translate(p.caja[3] - CX, 0, 0);
  } else {
    geo = new ConvexGeometry(verticesBrazo(p).map(([x, y, z]) => v3(x, y, z)));
  }
  geo.computeVertexNormals();
  return [{ key: p.id, tipo: "geo", material, geo, bordes: new THREE.EdgesGeometry(geo, 25), veta: "z" }];
}

function PiezaMalla({
  pieza,
  orden,
  estado,
  activo,
  onActivo,
  madera,
}: {
  pieza: Pieza;
  orden: number;
  estado: MutableRefObject<Estado>;
  activo: string | null;
  onActivo: (t: string | null) => void;
  madera: THREE.Texture;
}) {
  const grupo = useRef<THREE.Group>(null);
  const lista = useMemo(() => mallas(pieza), [pieza]);
  const mats = useMemo(
    () =>
      lista.map((m) => {
        if (m.material === "tela") {
          return new THREE.MeshPhysicalMaterial({
            color: "#5a1219",
            roughness: 0.95,
            sheen: 1,
            sheenColor: new THREE.Color("#b04a55"),
            sheenRoughness: 0.55,
          });
        }
        const map = madera.clone();
        map.needsUpdate = true;
        if (m.veta === "x") map.rotation = Math.PI / 2;
        map.repeat.set(1, m.veta === "z" ? 1 : 0.6);
        return new THREE.MeshStandardMaterial({ map, roughness: 0.48, metalness: 0 });
      }),
    [lista, madera],
  );
  const lineas = useMemo(
    () => lista.map(() => new THREE.LineBasicMaterial({ color: "#1d1c1a", transparent: true, opacity: 0 })),
    [lista],
  );
  const dir = useMemo(() => {
    const [dx, dy, dz] = pieza.explota;
    return new THREE.Vector3(dx, dz, dy);
  }, [pieza]);
  const base = useMemo(() => mats.map((m) => (m as THREE.MeshStandardMaterial).color.clone()), [mats]);

  const n = silla.piezas.length;
  const luz = useRef(0);
  useFrame((_, dt) => {
    const g = guion(estado.current.p);
    // Escalonado: las piezas de arriba salen antes, como en un manual de montaje al revés.
    const retraso = (orden / (n - 1)) * 0.45;
    const e = suave(retraso, retraso + 0.55, g.explota);
    grupo.current?.position.copy(dir).multiplyScalar(e * SEPARA);
    const meta = activo === pieza.tipo ? 1 : 0;
    luz.current += (meta - luz.current) * (1 - Math.exp(-dt * 12));
    mats.forEach((m, i) => {
      const s = m as THREE.MeshStandardMaterial;
      s.color.copy(base[i]).lerp(NEGRO, g.plano);
      s.emissive.copy(BRILLO).multiplyScalar(luz.current * 0.32).lerp(PAPEL, g.plano);
      s.emissiveIntensity = 1;
      lineas[i].opacity = g.plano * 0.9;
    });
  });

  const entra = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onActivo(pieza.tipo);
  };
  const sale = () => onActivo(null);

  return (
    <group ref={grupo}>
      {lista.map((m, i) =>
        m.tipo === "caja" ? (
          <group key={m.key} position={m.centro}>
            <RoundedBox
              args={m.tam}
              radius={m.radio}
              smoothness={m.material === "tela" ? 4 : 2}
              material={mats[i]}
              castShadow
              receiveShadow
              onPointerOver={entra}
              onPointerOut={sale}
              onClick={entra}
            />
            <lineSegments geometry={m.bordes} material={lineas[i]} />
          </group>
        ) : (
          <group key={m.key}>
            <mesh geometry={m.geo} material={mats[i]} castShadow receiveShadow onPointerOver={entra} onPointerOut={sale} onClick={entra} />
            <lineSegments geometry={m.bordes} material={lineas[i]} />
          </group>
        ),
      )}
      {pieza.forma === "copete" && (
        // La fuente tarda en prepararse: que no retenga el resto de la silla.
        <Suspense fallback={null}>
          <Inscripcion />
        </Suspense>
      )}
    </group>
  );
}

function Inscripcion() {
  const ins = silla.inscripcion;
  const copete = silla.piezas.find((p) => p.forma === "copete")!;
  const z = copete.caja[4] - CY + 0.3;
  // La altura de las letras hebreas en Frank Ruhl Libre es más o menos 0,62 em.
  const tam = ins.alto_letra / 0.62;
  return (
    <>
      {ins.lineas.map((linea, i) => (
        <Text
          key={linea}
          font="/fuentes/frank-ruhl-libre-hebrew-700.woff"
          fontSize={tam}
          position={[0, ins.linea_base[i], z]}
          anchorX="center"
          anchorY="bottom-baseline"
          direction="rtl"
          color="#3a170b"
        >
          {linea}
        </Text>
      ))}
    </>
  );
}

function Camara({ estado, reducido }: { estado: MutableRefObject<Estado>; reducido: boolean }) {
  const { camera, size } = useThree();
  const giro = useRef(0);
  const objetivo = useMemo(() => new THREE.Vector3(0, 80, 0), []);
  useFrame((st, dt) => {
    const g = guion(estado.current.p);
    const k = reducido ? 1 : 1 - Math.exp(-dt * 5);
    giro.current += (estado.current.giro - giro.current) * k;
    const vaiven = reducido ? 0 : Math.sin(st.clock.elapsedTime * 0.35) * THREE.MathUtils.degToRad(9) * (1 - suave(0.05, 0.2, estado.current.p));
    const az = g.azimut + giro.current + vaiven;
    const cam = camera as THREE.PerspectiveCamera;
    const aspecto = size.width / size.height;
    const alto = 198 * g.lejos;
    const ancho = 120 * g.lejos;
    const media = Math.max(alto / 2, ancho / 2 / aspecto);
    const d = media / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const destino = new THREE.Vector3(
      Math.sin(az) * Math.cos(g.elevacion) * d,
      objetivo.y + Math.sin(g.elevacion) * d,
      Math.cos(az) * Math.cos(g.elevacion) * d,
    );
    cam.position.lerp(destino, k);
    cam.lookAt(objetivo);
  });
  return null;
}

export default function Silla3D({
  estado,
  activo,
  onActivo,
  fallback,
}: {
  estado: MutableRefObject<Estado>;
  activo: string | null;
  onActivo: (t: string | null) => void;
  fallback: React.ReactNode;
}) {
  const reducido = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const madera = useMemo(() => (typeof document !== "undefined" ? texturaMadera() : null), []);
  // Orden de salida: de arriba abajo según la altura máxima de cada pieza.
  const orden = useMemo(() => {
    const porAltura = [...silla.piezas].sort((a, b) => b.caja[5] - a.caja[5]);
    return new Map(porAltura.map((p, i) => [p.id, i]));
  }, []);
  useEffect(() => () => madera?.dispose(), [madera]);
  if (!madera) return null;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 26, near: 10, far: 5000, position: [200, 160, 320] }}
      gl={{ antialias: true, alpha: true }}
      fallback={fallback}
      onPointerMissed={() => onActivo(null)}
    >
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[-120, 260, 220]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={200}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0004}
      />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={1.2} position={[0, 300, 200]} scale={[400, 200, 1]} color="#fff6ea" />
        <Lightformer intensity={0.6} position={[-300, 120, 0]} rotation-y={Math.PI / 2} scale={[300, 200, 1]} color="#ffe7cf" />
        <Lightformer intensity={0.4} position={[300, 100, -100]} rotation-y={-Math.PI / 2} scale={[300, 200, 1]} color="#e9eef5" />
      </Environment>
      <group>
        {silla.piezas.map((p) => (
          <PiezaMalla
            key={p.id}
            pieza={p}
            orden={orden.get(p.id)!}
            estado={estado}
            activo={activo}
            onActivo={onActivo}
            madera={madera}
          />
        ))}
      </group>
      <ContactShadows position={[0, -0.05, 0]} scale={320} opacity={0.32} blur={2.6} far={180} resolution={512} color="#3b2a1e" />
      <Camara estado={estado} reducido={reducido} />
    </Canvas>
  );
}

