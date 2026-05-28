import { useMemo } from 'react';
import * as THREE from 'three';
import { whiteOak, brushedMetal, tealTiles } from '../materials/textures';
import { Bottles } from './Bottles';
import { Glassware } from './Glassware';
import { CoffeeSetup } from './CoffeeSetup';

// Bar runs along the back wall (negative Z), centered slightly to the left.
// Bar top: y ~ 1.18 m. Width 5.2 m.
// Layout:
//   Left half  (local x ≈ -2.6 .. -0.4): coffee — Modbar + grinders + accessories
//   Right half (local x ≈ +0.4 .. +2.6): cocktails — bottle shelves, taps, glassware
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
          roughness={0.32}
          metalness={0.0}
          clearcoat={0.55}
          clearcoatRoughness={0.16}
          envMapIntensity={0.9}
        />
      </mesh>

      {/* Bar back wall — splashback with teal tiles */}
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

      {/* Under-counter cabinets — full length of bar, dark steel */}
      <mesh position={[0, 0.55, 0.55]}>
        <boxGeometry args={[5.0, 1.08, 0.18]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.5} metalness={0.45} />
      </mesh>
      {/* Subtle pull handles along the cabinet */}
      {[-2.0, -1.0, 0.0, 1.0, 2.0].map((x, i) => (
        <mesh key={`pull-${i}`} position={[x, 0.55, 0.66]}>
          <boxGeometry args={[0.35, 0.012, 0.015]} />
          <meshStandardMaterial
            map={brass.map}
            roughnessMap={brass.rough}
            metalness={0.95}
            roughness={0.25}
          />
        </mesh>
      ))}

      {/* Beer taps — 3 brass towers on the right side */}
      {[0.9, 1.2, 1.5].map((x, i) => (
        <group key={i} position={[x, 1.16, 0.18]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.055, 0.08, 32]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.024, 0.028, 0.3, 32]} />
            <meshStandardMaterial
              map={brass.map}
              roughnessMap={brass.rough}
              metalness={0.95}
              roughness={0.22}
              envMapIntensity={1.4}
            />
          </mesh>
          <mesh position={[0, 0.3, 0.05]} rotation={[Math.PI / 2.5, 0, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.014, 0.1, 24]} />
            <meshStandardMaterial
              map={brass.map}
              roughnessMap={brass.rough}
              metalness={0.95}
              roughness={0.22}
              envMapIntensity={1.4}
            />
          </mesh>
          <mesh position={[0, 0.36, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.012, 0.09, 24]} />
            <meshStandardMaterial color="#0e0e0f" roughness={0.6} metalness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Bottle shelves on the right half of the splashback */}
      <BottleShelves />

      {/* Bottles arranged on shelves */}
      <Bottles />

      {/* Coupe glasses suspended above bar */}
      <Glassware />

      {/* Coffee setup on the left half — Modbar, grinders, accessories */}
      <CoffeeSetup />
    </group>
  );
}

function BottleShelves() {
  const oak = useMemo(() => whiteOak('medium'), []);
  oak.map.repeat.set(3, 0.2);
  oak.normal.repeat.set(3, 0.2);
  oak.rough.repeat.set(3, 0.2);

  // Right side of bar only — leaves room for the Modbar feature on the left
  const shelves = [
    { y: 1.55, x: 1.3, w: 2.4, d: 0.22 },
    { y: 1.92, x: 1.4, w: 2.2, d: 0.22 },
    { y: 2.28, x: 1.3, w: 2.4, d: 0.22 },
  ];

  return (
    <group>
      {shelves.map((s, i) => (
        <group key={i}>
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
          <mesh position={[s.x, s.y - 0.015, 0.16]}>
            <boxGeometry args={[s.w - 0.05, 0.004, 0.01]} />
            <meshStandardMaterial color="#ffd6a0" emissive="#e5a060" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
          <mesh position={[s.x, s.y - 0.022, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[s.w - 0.05, 0.14]} />
            <meshBasicMaterial color="#3a2a18" transparent opacity={0.6} />
          </mesh>
          <pointLight position={[s.x, s.y - 0.05, 0.18]} intensity={0.9} distance={1.8} decay={2} color="#ffb878" />
          <pointLight position={[s.x + s.w * 0.3, s.y - 0.05, 0.18]} intensity={0.7} distance={1.6} decay={2} color="#ffb878" />
          <pointLight position={[s.x - s.w * 0.3, s.y - 0.05, 0.18]} intensity={0.7} distance={1.6} decay={2} color="#ffb878" />
        </group>
      ))}

      {/* Hand-blackened steel uprights at the ends */}
      {[0.2, 2.5].map((x, i) => (
        <mesh key={`bracket-${i}`} position={[x, 1.92, 0.005]}>
          <boxGeometry args={[0.04, 1.5, 0.012]} />
          <meshStandardMaterial color="#1a1a1c" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}
