import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh } from 'three';

interface FloatingGeometryProps {
  geometry: 'box' | 'sphere' | 'torus' | 'octahedron' | 'capsule' | 'dodecahedron' | 'tetrahedron' | 'icosahedron';
  position: [number, number, number];
  color: string;
  scale?: number;
  floatAmplitude?: number;
  floatSpeed?: number;
  rotateSpeed?: { x: number; y: number; z: number };
  phase?: number;
  args?: number[];
  entryDelay?: number;
}

// LOD segments based on device performance
const getSegments = (isMobile: boolean) => ({
  sphere: isMobile ? 16 : 32,
  capsule: isMobile ? [8, 16] : [16, 32],
  torus: isMobile ? [12, 50] : [16, 100],
});

export const FloatingGeometry = ({ 
  geometry, 
  position, 
  color, 
  scale = 1,
  floatAmplitude = 0.6,
  floatSpeed = 0.6,
  rotateSpeed = { x: 0.3, y: 0.2, z: 0.1 },
  phase = 0,
  args = [],
  entryDelay = 0
}: FloatingGeometryProps) => {
  const meshRef = useRef<Mesh>(null);
  const baseY = position[1];
  const [entryProgress, setEntryProgress] = useState(0);
  const startTime = useRef<number | null>(null);
  const { gl } = useThree();
  
  // Detect mobile for LOD
  const isMobile = gl.domElement.width < 768;
  const segments = getSegments(isMobile);

  useFrame((state) => {
    if (meshRef.current) {
      // Entry animation
      if (startTime.current === null) {
        startTime.current = state.clock.elapsedTime;
      }
      
      const elapsed = state.clock.elapsedTime - startTime.current - entryDelay;
      if (elapsed > 0 && entryProgress < 1) {
        const progress = Math.min(1, elapsed / 0.8);
        const eased = 1 - Math.pow(1 - progress, 3);
        setEntryProgress(eased);
      }

      const currentScale = scale * entryProgress;
      meshRef.current.scale.setScalar(currentScale);

      // Floating animation
      meshRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * floatSpeed + phase) * floatAmplitude;
      
      // Rotation animation
      meshRef.current.rotation.x += rotateSpeed.x * 0.01;
      meshRef.current.rotation.y += rotateSpeed.y * 0.01;
      meshRef.current.rotation.z += rotateSpeed.z * 0.01;
    }
  });

  const renderGeometry = () => {
    switch (geometry) {
      case 'box':
        return <boxGeometry args={args.length ? args as [number, number, number] : [2.8, 2.8, 0.9]} />;
      case 'sphere':
        return <sphereGeometry args={[args[0] || 1.3, segments.sphere, segments.sphere]} />;
      case 'capsule':
        return <capsuleGeometry args={[args[0] || 1.4, args[1] || 0.8, segments.capsule[0], segments.capsule[1]]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[args[0] || 1.5, isMobile ? 0 : 0]} />;
      case 'tetrahedron':
        return <tetrahedronGeometry args={[args[0] || 1.4, isMobile ? 0 : 0]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[args[0] || 1, isMobile ? 0 : 1]} />;
      case 'torus':
        return <torusGeometry args={[0.6, 0.3, segments.torus[0], segments.torus[1]]} />;
      case 'octahedron':
        return <octahedronGeometry args={[0.8, isMobile ? 0 : 0]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      {renderGeometry()}
      <meshPhysicalMaterial
        color={color}
        roughness={isMobile ? 0.4 : 0.25}
        metalness={isMobile ? 0.3 : 0.45}
        reflectivity={isMobile ? 0.5 : 0.9}
        clearcoat={isMobile ? 0.5 : 0.9}
        clearcoatRoughness={isMobile ? 0.4 : 0.2}
      />
    </mesh>
  );
};