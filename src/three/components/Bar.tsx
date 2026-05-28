import { useMemo } from 'react';
import * as THREE from 'three';
import { whiteOak, brushedMetal, tealTiles } from '../materials/textures';
import { Bottles } from './Bottles';
import { Glassware } from './Glassware';
import { Turntables } from './Turntables';

// Bar runs along the back wall (negative Z), centered slightly to the left.
// Bar top: y ~ 1.1 m
export function Bar() {
  const oakBar = useMemo(() => whiteOak('medium'), []);
  oakBar.map.repeat.set(3, 0.5);
  oakBar.normal.repeat.set(3, 0.5);
  oakBar.rough.repeat.set(3, 0.5);

  const oakFront = useMemo(() => whiteOak('light'), []);
  oakFront.map.repeat.set(6, 1);
  oakFront.normal.repeat.set(6, 1);
  oakFront.rough.repeat.set(6, 1);

  const teal = useMemo(() => tealTiles(), []);
  teal.map.repeat.set(2, 0.4);
  teal.normal.repeat.set(2, 0.4);
  teal.rough.repeat.set(2, 0.4);

  const brass = useMemo(() => brushedMetal('brass'), []);

  return (
    <group position={[-2.0, 0, -2.6]}>
      {/* Bar front panel (facing the dining area) */}
      <mesh position={[0, 0.55, 0.65]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 1.1, 0.04]} />
        <meshPhysicalMaterial
          map={oakFront.map}
          normalMap={oakFront.normal}
          normalScale={new THREE.Vector2(0.3, 0.8)}
          roughnessMap={oakFront.rough}
          roughness={0.55}
          metalness={0.0}
          envMapIntensity={0.55}
        />
      </mesh>

      {/* Bar top — single slab oak */}
      <mesh position={[0, 1.12, 0.36]} castShadow receiveShadow>
        <boxGeometry args={[5.3, 0.06, 0.7]} />
        <meshPhysicalMaterial
          map={oakBar.map}
          normalMap={oakBar.normal}
          normalScale={new THREE.Vector2(0.2, 0.6)}
          roughnessMap={oakBar.rough}
          roughness={0.35}
          metalness={0.0}
          clearcoat={0.5}
          clearcoatRoughness={0.18}
          envMapIntensity={0.85}
        />
      </mesh>

      {/* Bar back wall — splashback with teal tiles, inset */}
      <mesh position={[0, 1.5, -0.02]} receiveShadow>
        <boxGeometry args={[5.2, 0.78, 0.02]} />
        <meshPhysicalMaterial
          map={teal.map}
          normalMap={teal.normal}
          roughnessMap={teal.rough}
          roughness={0.22}
          clearcoat={0.7}
          clearcoatRoughness={0.18}
          envMapIntensity={1.0}
          color="#2a4040"
        />
      </mesh>

      {/* Under-counter chiller cabinet (left side, below turntables area) */}
      <mesh position={[-1.6, 0.55, 0.55]}>
        <boxGeometry args={[1.6, 1.08, 0.18]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Chiller pull handle */}
      <mesh position={[-1.6, 0.55, 0.66]}>
        <boxGeometry args={[0.4, 0.012, 0.015]} />
        <meshStandardMaterial
          map={brass.map}
          roughnessMap={brass.rough}
          metalness={0.95}
          roughness={0.25}
        />
      </mesh>

      {/* Beer taps — 3 brass towers (right side of bar, in front of shelves) */}
      {[0.9, 1.2, 1.5].map((x, i) => (
        <group key={i} position={[x, 1.16, 0.18]}>
          {/* Base */}
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.055, 0.08, 24]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.25} />
          </mesh>
          {/* Tower */}
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.024, 0.028, 0.3, 24]} />
            <meshStandardMaterial
              map={brass.map}
              roughnessMap={brass.rough}
              metalness={0.95}
              roughness={0.22}
              envMapIntensity={1.2}
            />
          </mesh>
          {/* Spout */}
          <mesh position={[0, 0.3, 0.05]} rotation={[Math.PI / 2.5, 0, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.014, 0.1, 24]} />
            <meshStandardMaterial
              map={brass.map}
              roughnessMap={brass.rough}
              metalness={0.95}
              roughness={0.22}
              envMapIntensity={1.2}
            />
          </mesh>
          {/* Handle */}
          <mesh position={[0, 0.36, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.012, 0.09, 16]} />
            <meshStandardMaterial color="#0e0e0f" roughness={0.6} metalness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Bottle shelves behind the bar - 3 staggered floating shelves */}
      <BottleShelves />

      {/* Bottles arranged on shelves */}
      <Bottles />

      {/* Coupe glasses suspended above bar */}
      <Glassware />

      {/* The turntables sit at the right side of the bar */}
      <Turntables />

      {/* A single cocktail glass left on the bar - storytelling detail */}
      <group position={[-0.4, 1.16, 0.35]}>
        <mesh castShadow>
          <coneGeometry args={[0.06, 0.08, 32, 1, true]} />
          <meshPhysicalMaterial
            color="#f8f8f8"
            transmission={0.9}
            opacity={1}
            transparent
            roughness={0.05}
            ior={1.45}
            thickness={0.4}
            envMapIntensity={1.5}
          />
        </mesh>
        <mesh position={[0, -0.06, 0]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, 0.08, 16]} />
          <meshPhysicalMaterial color="#f8f8f8" transmission={0.9} transparent roughness={0.05} ior={1.45} thickness={0.1} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.005, 32]} />
          <meshPhysicalMaterial color="#f8f8f8" transmission={0.9} transparent roughness={0.05} ior={1.45} thickness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

function BottleShelves() {
  const oak = useMemo(() => whiteOak('medium'), []);
  oak.map.repeat.set(3, 0.2);
  oak.normal.repeat.set(3, 0.2);
  oak.rough.repeat.set(3, 0.2);

  // Shelves at y = 1.55, 1.92, 2.28 — right side of bar only, leaves room for speaker on left
  const shelves = [
    { y: 1.55, x: 1.3, w: 2.4, d: 0.22 },
    { y: 1.92, x: 1.4, w: 2.2, d: 0.22 },
    { y: 2.28, x: 1.3, w: 2.4, d: 0.22 },
  ];

  return (
    <group>
      {shelves.map((s, i) => (
        <group key={i}>
          {/* Shelf plate */}
          <mesh position={[s.x, s.y, 0.05]} castShadow receiveShadow>
            <boxGeometry args={[s.w, 0.025, s.d]} />
            <meshPhysicalMaterial
              map={oak.map}
              normalMap={oak.normal}
              roughnessMap={oak.rough}
              roughness={0.45}
              metalness={0.0}
              clearcoat={0.3}
              clearcoatRoughness={0.3}
              envMapIntensity={0.7}
            />
          </mesh>
          {/* Hidden LED strip below the shelf */}
          <mesh position={[s.x, s.y - 0.015, 0.16]}>
            <boxGeometry args={[s.w - 0.05, 0.004, 0.01]} />
            <meshStandardMaterial color="#ffd6a0" emissive="#e5a060" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
          {/* Soft warm glow plate below LED to spill on shelf */}
          <mesh position={[s.x, s.y - 0.022, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[s.w - 0.05, 0.14]} />
            <meshBasicMaterial color="#3a2a18" transparent opacity={0.6} />
          </mesh>
          {/* Real soft point light to add actual illumination from the shelf */}
          <pointLight position={[s.x, s.y - 0.05, 0.18]} intensity={0.7} distance={1.6} decay={2} color="#ffb878" />
          <pointLight position={[s.x + s.w * 0.3, s.y - 0.05, 0.18]} intensity={0.5} distance={1.4} decay={2} color="#ffb878" />
          <pointLight position={[s.x - s.w * 0.3, s.y - 0.05, 0.18]} intensity={0.5} distance={1.4} decay={2} color="#ffb878" />

        </group>
      ))}

      {/* Hand-blackened steel supports — at both ends of the shelf cluster */}
      {[0.2, 2.5].map((x, i) => (
        <mesh key={`bracket-${i}`} position={[x, 1.92, 0.005]}>
          <boxGeometry args={[0.04, 1.5, 0.012]} />
          <meshStandardMaterial color="#1a1a1c" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}
