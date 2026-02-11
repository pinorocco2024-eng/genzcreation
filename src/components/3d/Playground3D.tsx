import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import React, { useEffect, useMemo, useRef, useState } from "react";

type ShapeKind = "box" | "sphere" | "icosahedron" | "torus" | "cone" | "capsule";

const COLORS = ["#ff2cdf", "#22c55e", "#0ea5e9", "#fbbf24", "#8b5cf6", "#3b82f6"];

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};
const rnd = (min: number, max: number, seed: number) => seededRandom(seed) * (max - min) + min;

function Geom({ kind }: { kind: ShapeKind }) {
  switch (kind) {
    case "box":
      return <boxGeometry args={[1.2, 1.2, 1.2]} />;
    case "sphere":
      return <sphereGeometry args={[0.8, 32, 32]} />;
    case "icosahedron":
      return <icosahedronGeometry args={[0.9, 0]} />;
    case "torus":
      return <torusGeometry args={[0.8, 0.25, 24, 48]} />;
    case "cone":
      return <coneGeometry args={[0.8, 1.4, 32]} />;
    case "capsule":
      return <capsuleGeometry args={[0.55, 1.1, 8, 16]} />;
    default:
      return <boxGeometry args={[1, 1, 1]} />;
  }
}

/**
 * CONTROLS:
 * - Zoom sempre
 * - Rotate SOLO quando CTRL è premuto (leggiamo ctrlKey dal mouse, non serve focus)
 */
function CtrlOrbitControls() {
  const ref = useRef<any>(null);

  // fallback: se vuoi anche da tastiera (quando focus c'è), va comunque
  const [ctrlDown, setCtrlDown] = useState(false);
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => e.key === "Control" && setCtrlDown(true);
    const onUp = (e: KeyboardEvent) => e.key === "Control" && setCtrlDown(false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // se il mouse sta trascinando e ctrlKey cambia, aggiorniamo in tempo reale
  useFrame(() => {
    const c = ref.current;
    if (!c) return;
    c.enableRotate = ctrlDown;
  });

  return (
    <OrbitControls
      ref={ref}
      enableZoom
      enablePan={false}
      enableDamping
      dampingFactor={0.07}
      minDistance={6}
      maxDistance={24}
      // di default: rotate disabilitato, lo abilitiamo “live” con ctrl
      enableRotate={ctrlDown}
      rotateSpeed={0.6}
    />
  );
}

function DraggableShape({
  id,
  kind,
  color,
  initialPosition,
  scale,
  onAnyPointerDown,
  onAnyPointerUp,
}: {
  id: number;
  kind: ShapeKind;
  color: string;
  initialPosition: [number, number, number];
  scale: number;
  onAnyPointerDown: (e: any) => void;
  onAnyPointerUp: (e: any) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { camera, gl } = useThree();

  // posizione “persistente”: resta dove la lasci
  const restPos = useRef(new THREE.Vector3(...initialPosition));

  const [dragging, setDragging] = useState(false);

  const dragPlane = useMemo(() => new THREE.Plane(), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointerNDC = useMemo(() => new THREE.Vector2(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const offset = useRef(new THREE.Vector3());

  const anim = useMemo(() => {
    const phase = seededRandom(id * 17) * Math.PI * 2;
    return {
      phase,
      floatAmp: rnd(0.06, 0.18, id * 3), // più “fine” (meno casino)
      floatSpeed: rnd(0.6, 1.1, id * 5),
      rotX: rnd(0.2, 0.8, id * 7),
      rotY: rnd(0.2, 0.9, id * 11),
      rotZ: rnd(0.1, 0.6, id * 13),
    };
  }, [id]);

  useFrame(({ clock }) => {
    const m = meshRef.current;
    if (!m) return;

    if (!dragging) {
      const t = clock.getElapsedTime();
      // resta dove lo hai lasciato (x,z,y base), ma con un leggero “float” solo su Y
      m.position.x = restPos.current.x;
      m.position.z = restPos.current.z;
      m.position.y = restPos.current.y + Math.sin(t * anim.floatSpeed + anim.phase) * anim.floatAmp;

      m.rotation.x += 0.006 * anim.rotX;
      m.rotation.y += 0.006 * anim.rotY;
      m.rotation.z += 0.004 * anim.rotZ;
    }
  });

  const setFromPointerEvent = (e: any) => {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    pointerNDC.set(x, y);
    raycaster.setFromCamera(pointerNDC, camera);
  };

  const onPointerDown = (e: any) => {
    e.stopPropagation();
    onAnyPointerDown(e);

    setDragging(true);

    // piano parallelo allo schermo, passa per la posizione attuale dell’oggetto
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    dragPlane.setFromNormalAndCoplanarPoint(camDir, meshRef.current.position);

    setFromPointerEvent(e);
    raycaster.ray.intersectPlane(dragPlane, hit);

    offset.current.copy(meshRef.current.position).sub(hit);

    (e.target as any).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: any) => {
    if (!dragging) return;
    e.stopPropagation();

    setFromPointerEvent(e);
    raycaster.ray.intersectPlane(dragPlane, hit);

    meshRef.current.position.copy(hit).add(offset.current);
  };

  const endDrag = (e: any) => {
    if (!dragging) return;
    e.stopPropagation();

    // salva posizione finale → resta lì
    restPos.current.copy(meshRef.current.position);

    setDragging(false);
    onAnyPointerUp(e);

    (e.target as any).releasePointerCapture?.(e.pointerId);
  };

  return (
    <mesh
      ref={meshRef}
      position={initialPosition}
      scale={scale}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      castShadow
      receiveShadow
    >
      <Geom kind={kind} />
      <meshStandardMaterial
        color={color}
        metalness={0.55}
        roughness={0.25}
        emissive={color}
        emissiveIntensity={0.18}
      />
    </mesh>
  );
}

export const Playground3D = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ✅ meno forme
  const count = isMobile ? 7 : 10;

  // gestione CTRL affidabile: leggiamo ctrlKey direttamente dagli eventi mouse
  const [ctrlDown, setCtrlDown] = useState(false);

  const shapes = useMemo(() => {
    const kinds: ShapeKind[] = ["box", "sphere", "icosahedron", "torus", "cone", "capsule"];
    return Array.from({ length: count }).map((_, i) => {
      const kind = kinds[i % kinds.length];
      const color = COLORS[Math.floor(seededRandom(i * 9) * COLORS.length)];

      // area “play” ampia ma non caotica
      const x = rnd(-6.5, 6.5, i * 2);
      const y = rnd(-0.2, 2.6, i * 3);
      const z = rnd(-4.5, 3.5, i * 5);

      const s = rnd(0.9, 1.35, i * 7);

      return { id: i, kind, color, pos: [x, y, z] as [number, number, number], scale: s };
    });
  }, [count]);

  return (
    <section className="px-6 pt-10 pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-2 mb-5">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            <span className="brand-gradient">Playground 3D</span>
          </h2>
          <p className="text-foreground/65">
            Trascina le forme per spostarle (restano dove le lasci).{" "}
            <span className="text-foreground font-semibold">Tieni premuto CTRL</span> e trascina nel vuoto per ruotare
            la camera. Zoom sempre disponibile.
          </p>
        </div>

        {/* ✅ ancora più grande */}
        <div
          className="relative w-full rounded-3xl border border-border/50 bg-card/25 backdrop-blur-xl shadow-premium overflow-hidden"
          onPointerDown={(e) => setCtrlDown(!!e.ctrlKey)}
          onPointerMove={(e) => setCtrlDown(!!e.ctrlKey)}
          onPointerUp={(e) => setCtrlDown(!!e.ctrlKey)}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

          {/* ✅ più alto */}
          <div className="h-[82vh] min-h-[640px] w-full">
            <Canvas shadows camera={{ position: [0, 2.2, 13], fov: 45 }} dpr={isMobile ? [1, 1.5] : [1, 2]}>
              <ambientLight intensity={0.55} />
              <directionalLight position={[6, 10, 6]} intensity={0.95} castShadow />
              <pointLight position={[-6, 3, 6]} color="#ff2cdf" intensity={1.1} distance={50} />
              <pointLight position={[6, -2, -4]} color="#38bdf8" intensity={1.1} distance={50} />

              <gridHelper args={[80, isMobile ? 30 : 70, "#111111", "#111111"]} position={[0, -2.2, 0]} />

              {shapes.map((s) => (
                <DraggableShape
                  key={s.id}
                  id={s.id}
                  kind={s.kind}
                  color={s.color}
                  initialPosition={s.pos}
                  scale={s.scale}
                  // quando trascini un oggetto, vogliamo che CTRL non interferisca
                  onAnyPointerDown={() => setCtrlDown(false)}
                  onAnyPointerUp={(e) => setCtrlDown(!!e.ctrlKey)}
                />
              ))}

              <Environment preset="city" />

              {/* OrbitControls: rotate dipende da ctrlDown */}
              <OrbitControls
                enableZoom
                enablePan={false}
                enableDamping
                dampingFactor={0.07}
                minDistance={6}
                maxDistance={24}
                enableRotate={ctrlDown}
                rotateSpeed={0.6}
              />
            </Canvas>
          </div>

          <div className="px-5 py-4 border-t border-border/40 bg-background/30">
            <div className="text-sm text-foreground/60">
              Controlli: <span className="text-foreground font-semibold">Drag su un oggetto</span> = sposta l’oggetto •{" "}
              <span className="text-foreground font-semibold">CTRL + drag nel vuoto</span> = ruota camera •{" "}
              <span className="text-foreground font-semibold">rotellina</span> = zoom
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
