import { useMemo } from 'react';
import * as THREE from 'three';
import { whiteOak, acousticFabric, tealTiles } from '../materials/textures';

// One large built-in speaker cabinet, oak-faced, with horn tweeter,
// 15" woofer and twin ports, recessed into the teal-tiled wall.
//
// Positioned center on back wall (z = -ROOM.depth/2 = -4), above the bar.
// Mounted at height that puts the woofer at ~ 2.1 m
// Positioned on the back wall (z = -4), centered above the DJ booth at the left side of the bar.
// Sits proud of the wall by ~0.17 m (half its depth).
export function SpeakerWall() {
  return (
    <group position={[-3.5, 0, -3.83]}>
      <Speaker position={[0, 2.05, 0]} scale={0.9} />
    </group>
  );
}

interface SpeakerProps {
  position: [number, number, number];
  scale?: number;
}

function Speaker({ position, scale = 1 }: SpeakerProps) {
  const oak = useMemo(() => whiteOak('speaker'), []);
  oak.map.repeat.set(0.6, 1.4);
  oak.normal.repeat.set(0.6, 1.4);
  oak.rough.repeat.set(0.6, 1.4);

  const fabric = useMemo(() => acousticFabric('black'), []);
  fabric.map.repeat.set(4, 4);

  // Cabinet dimensions (scaled)
  const W = 0.6 * scale;
  const H = 1.0 * scale;
  const D = 0.34 * scale;

  return (
    <group position={position}>
      {/* Cabinet box */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshPhysicalMaterial
          map={oak.map}
          normalMap={oak.normal}
          normalScale={new THREE.Vector2(0.3, 0.8)}
          roughnessMap={oak.rough}
          roughness={0.5}
          metalness={0.0}
          clearcoat={0.25}
          clearcoatRoughness={0.4}
          envMapIntensity={0.7}
        />
      </mesh>

      {/* Front baffle plate inset slightly for shadow */}
      <mesh position={[0, 0, D / 2 + 0.001]} castShadow>
        <boxGeometry args={[W * 0.96, H * 0.96, 0.005]} />
        <meshPhysicalMaterial
          map={oak.map}
          normalMap={oak.normal}
          normalScale={new THREE.Vector2(0.3, 0.8)}
          roughnessMap={oak.rough}
          roughness={0.48}
          metalness={0.0}
          envMapIntensity={0.7}
        />
      </mesh>

      {/* === HORN TWEETER (top) === */}
      <group position={[0, H * 0.34, D / 2 + 0.008]}>
        {/* Horn opening rectangle - matte black */}
        <mesh>
          <boxGeometry args={[W * 0.6, H * 0.08, 0.012]} />
          <meshStandardMaterial color="#080808" roughness={0.6} metalness={0.1} />
        </mesh>
        {/* Inner horn cone, recessed */}
        <mesh position={[0, 0, -0.018]} castShadow>
          <boxGeometry args={[W * 0.48, H * 0.054, 0.04]} />
          <meshStandardMaterial color="#020202" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Tweeter cap in center */}
        <mesh position={[0, 0, 0.0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.008, 16]} />
          <meshStandardMaterial color="#101012" roughness={0.4} metalness={0.4} />
        </mesh>
        {/* Edge bevels */}
        <mesh position={[0, H * 0.045, 0.001]}>
          <boxGeometry args={[W * 0.62, 0.002, 0.014]} />
          <meshStandardMaterial color="#000" roughness={0.4} />
        </mesh>
        <mesh position={[0, -H * 0.045, 0.001]}>
          <boxGeometry args={[W * 0.62, 0.002, 0.014]} />
          <meshStandardMaterial color="#000" roughness={0.4} />
        </mesh>
      </group>

      {/* === 15" WOOFER (center) === */}
      <group position={[0, -H * 0.05, D / 2 + 0.005]}>
        {/* Mounting frame (square cutout) */}
        <mesh>
          <boxGeometry args={[W * 0.7, W * 0.7, 0.006]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.7} />
        </mesh>
        {/* Driver basket — rotated to face the camera (long axis = Z) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[W * 0.31, W * 0.31, 0.014, 48]} />
          <meshStandardMaterial color="#0e0e0e" roughness={0.45} metalness={0.5} />
        </mesh>
        {/* Surround (foam ring) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.005]}>
          <ringGeometry args={[W * 0.24, W * 0.29, 64]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
        {/* Outer cone — paper, light grey-tan */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.008]}>
          <ringGeometry args={[W * 0.07, W * 0.24, 64]} />
          <meshStandardMaterial color="#a8a39a" roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
        {/* Recessed cone interior (creates depth illusion) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.001]}>
          <circleGeometry args={[W * 0.24, 64]} />
          <meshStandardMaterial color="#4a4640" roughness={0.85} />
        </mesh>
        {/* Phase plug / dust cap */}
        <mesh position={[0, 0, 0.018]} castShadow>
          <sphereGeometry args={[W * 0.07, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1a1a1c" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Bolts on the frame */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const r = W * 0.305;
          return (
            <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * r, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.005, 0.005, 0.004, 8]} />
              <meshStandardMaterial color="#1a1a1c" metalness={0.5} roughness={0.5} />
            </mesh>
          );
        })}
      </group>

      {/* === TWIN PORTS (bottom) === */}
      <group position={[0, -H * 0.4, D / 2 + 0.005]}>
        <Port x={-W * 0.13} />
        <Port x={W * 0.13} />
      </group>

    </group>
  );
}

function Port({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      {/* Port flange */}
      <mesh castShadow>
        <torusGeometry args={[0.038, 0.006, 12, 32]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Inner tube (dark) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.034, 0.034, 0.08, 32]} />
        <meshStandardMaterial color="#000" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.034, 32]} />
        <meshStandardMaterial color="#000" roughness={0.95} />
      </mesh>
    </group>
  );
}
