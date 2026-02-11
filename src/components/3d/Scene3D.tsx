import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { FloatingGeometry } from "./FloatingGeometry";

const colors = {
  pink: "#ff2cdf",
  green: "#22c55e",
  cyan: "#0ea5e9",
  yellow: "#fbbf24",
  violet: "#8b5cf6",
  blue: "#3b82f6",
};

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};
const rnd = (min: number, max: number, seed: number) => seededRandom(seed) * (max - min) + min;

type Mode = "background" | "playground";

interface Scene3DProps {
  mode?: Mode;
}

function Draggable({ children, enabled = true }: { children: React.ReactNode; enabled?: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const { camera, gl } = useThree();

  // Piano su cui trascinare (orizzontale)
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);
  const intersection = useMemo(() => new THREE.Vector3(), []);

  const dragging = useRef(false);
  const offset = useRef(new THREE.Vector3());

  const onPointerDown = (e: any) => {
    if (!enabled) return;
    e.stopPropagation();
    dragging.current = true;

    // calcola offset tra posizione oggetto e punto sul piano
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, intersection);

    offset.current.copy(group.current.position).sub(intersection);
  };

  const onPointerUp = (e: any) => {
    if (!enabled) return;
    e.stopPropagation();
    dragging.current = false;
  };

  const onPointerMove = (e: any) => {
    if (!enabled) return;
    if (!dragging.current) return;
    e.stopPropagation();

    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, intersection);

    group.current.position.copy(intersection.add(offset.current));

    // limiti “carini”
    group.current.position.x = THREE.MathUtils.clamp(group.current.position.x, -8, 8);
    group.current.position.z = THREE.MathUtils.clamp(group.current.position.z, -6, 6);
    group.current.position.y = THREE.MathUtils.clamp(group.current.position.y, -2, 4);
  };

  return (
    <group ref={group} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerMove={onPointerMove}>
      {children}
    </group>
  );
}

export const Scene3D = ({ mode = "background" }: Scene3DProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isPlay = mode === "playground";
  const backgroundShapeCount = isMobile ? 5 : 10;

  const backgroundShapes = useMemo(() => {
    return [...Array(backgroundShapeCount)].map((_, i) => {
      const geoType = i % 3;
      const geometry = geoType === 0 ? "box" : geoType === 1 ? "sphere" : "icosahedron";
      const colorKeys = Object.keys(colors) as (keyof typeof colors)[];
      const colorIndex = Math.floor(seededRandom(i * 7) * colorKeys.length);

      return {
        geometry,
        color: colors[colorKeys[colorIndex]],
        position: [rnd(-9, 9, i * 1), rnd(-3, 5, i * 2), rnd(-6, 2, i * 3)] as [number, number, number],
        scale: rnd(0.7, 1.2, i * 4),
        args:
          geoType === 0
            ? [rnd(0.7, 1.2, i * 5), rnd(0.7, 1.4, i * 6), rnd(0.4, 0.9, i * 7)]
            : [rnd(0.7, 1.1, i * 8)],
        floatAmplitude: rnd(0.3, 0.8, i * 9),
        floatSpeed: rnd(0.4, 1, i * 10),
        rotateSpeed: { x: rnd(0.1, 0.4, i * 11), y: rnd(0.1, 0.4, i * 12), z: rnd(0.05, 0.3, i * 13) },
        phase: seededRandom(i * 14) * Math.PI * 2,
        entryDelay: 0.5 + i * 0.08,
      };
    });
  }, [backgroundShapeCount]);

  return (
    <Canvas
      camera={{ position: [0, 1.5, isPlay ? 10 : 12], fov: 45 }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.45} />
        <directionalLight position={[4, 8, 6]} intensity={0.85} />
        <pointLight position={[-6, 3, 6]} color="#ff2cdf" intensity={1.2} distance={40} />
        <pointLight position={[6, -2, -4]} color="#38bdf8" intensity={1.2} distance={40} />

        <gridHelper args={[60, isMobile ? 30 : 60, "#111111", "#111111"]} position={[0, -5, 0]} />

        {/* ✅ In playground: queste 5 forme sono trascinabili */}
        <Draggable enabled={isPlay}>
          <FloatingGeometry
            geometry="box"
            position={[-3.2, 0.4, 0]}
            color={colors.pink}
            scale={1.2}
            args={[2.8, 2.8, 0.9]}
            floatAmplitude={0.5}
            floatSpeed={0.6}
            rotateSpeed={{ x: 0.25, y: 0.5, z: 0.18 }}
            entryDelay={0}
          />
        </Draggable>

        <Draggable enabled={isPlay}>
          <FloatingGeometry
            geometry="sphere"
            position={[-6, -1.4, -2]}
            color={colors.blue}
            scale={1.4}
            args={[1.3]}
            floatAmplitude={0.7}
            floatSpeed={0.5}
            rotateSpeed={{ x: 0.1, y: 0.35, z: 0.2 }}
            entryDelay={0.1}
          />
        </Draggable>

        <Draggable enabled={isPlay}>
          <FloatingGeometry
            geometry="capsule"
            position={[4.8, -0.3, 0.5]}
            color={colors.cyan}
            scale={1.1}
            args={[1.4, 0.8]}
            floatAmplitude={0.55}
            floatSpeed={0.7}
            rotateSpeed={{ x: 0.18, y: 0.4, z: 0.1 }}
            entryDelay={0.2}
          />
        </Draggable>

        <Draggable enabled={isPlay}>
          <FloatingGeometry
            geometry="dodecahedron"
            position={[5.6, 2.4, -1.4]}
            color={colors.green}
            scale={1}
            args={[1.5]}
            floatAmplitude={0.65}
            floatSpeed={0.8}
            rotateSpeed={{ x: 0.25, y: 0.22, z: 0.16 }}
            entryDelay={0.3}
          />
        </Draggable>

        <Draggable enabled={isPlay}>
          <FloatingGeometry
            geometry="tetrahedron"
            position={[1.2, 2.8, 1.4]}
            color={colors.yellow}
            scale={1}
            args={[1.4]}
            floatAmplitude={0.55}
            floatSpeed={0.9}
            rotateSpeed={{ x: 0.32, y: 0.18, z: 0.14 }}
            entryDelay={0.4}
          />
        </Draggable>

        {/* Background scattered shapes (sempre solo “decorazione”) */}
        {backgroundShapes.map((shape, i) => (
          <FloatingGeometry
            key={i}
            geometry={shape.geometry as any}
            position={shape.position}
            color={shape.color}
            scale={shape.scale}
            args={shape.args as any}
            floatAmplitude={shape.floatAmplitude}
            floatSpeed={shape.floatSpeed}
            rotateSpeed={shape.rotateSpeed}
            phase={shape.phase}
            entryDelay={shape.entryDelay}
          />
        ))}

        <Environment preset="city" />

        {/* OrbitControls sempre in playground, in background solo autoRotate */}
        <OrbitControls
          enableZoom={isPlay}
          enablePan={false}
          enableRotate={isPlay}
          enableDamping
          dampingFactor={0.05}
          minDistance={8}
          maxDistance={16}
          autoRotate={!isPlay}
          autoRotateSpeed={0.6}
        />
      </Suspense>
    </Canvas>
  );
};
