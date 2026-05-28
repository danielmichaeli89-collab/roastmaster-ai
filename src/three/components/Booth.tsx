import { useMemo } from 'react';
import * as THREE from 'three';
import { whiteOak } from '../materials/textures';

// Intimate booth at the front-right corner, with a window opening to the bar.
// Looking at the first reference image — small bistro top, single curved chair,
// solid timber surround, table napkin and plate, wine glass.
export function Booth() {
  const oak = useMemo(() => whiteOak('light'), []);
  oak.map.repeat.set(1, 1.8);
  oak.normal.repeat.set(1, 1.8);
  oak.rough.repeat.set(1, 1.8);

  return (
    <group position={[3.4, 0, 3.4]}>
      {/* Booth partition wall - timber slats, vertical */}
      <mesh position={[-1.4, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 2.0, 1.2]} />
        <meshPhysicalMaterial
          map={oak.map}
          normalMap={oak.normal}
          normalScale={new THREE.Vector2(0.3, 1.2)}
          roughnessMap={oak.rough}
          roughness={0.55}
          metalness={0.0}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Mounting bracket from underside */}
      <mesh position={[-1.05, 0.74, -0.2]} castShadow>
        <boxGeometry args={[0.7, 0.04, 0.18]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Bistro top (small, mounted onto partition wall) */}
      <mesh position={[-0.85, 0.76, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.04, 0.5]} />
        <meshPhysicalMaterial
          map={oak.map}
          normalMap={oak.normal}
          roughnessMap={oak.rough}
          roughness={0.4}
          clearcoat={0.4}
          clearcoatRoughness={0.25}
          envMapIntensity={0.85}
        />
      </mesh>

      {/* Single chair */}
      <BoothChair position={[-0.85, 0, 0.35]} rotation={Math.PI} />

      {/* Plate, glass, napkin on the table */}
      <group position={[-0.85, 0.782, -0.2]}>
        {/* Rect rolled napkin */}
        <mesh position={[0.1, 0, 0.05]} rotation={[-Math.PI / 2, 0, 0.2]} castShadow>
          <planeGeometry args={[0.18, 0.12]} />
          <meshStandardMaterial color="#7a8482" roughness={0.92} side={THREE.DoubleSide} />
        </mesh>
        {/* Plate */}
        <mesh position={[-0.05, 0.005, -0.05]} castShadow receiveShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.01, 32]} />
          <meshPhysicalMaterial
            color="#fafafa"
            roughness={0.18}
            clearcoat={0.5}
            clearcoatRoughness={0.2}
            envMapIntensity={1.0}
          />
        </mesh>
        {/* Wine glass (single) */}
        <group position={[0.13, 0.0, -0.12]}>
          <mesh>
            <cylinderGeometry args={[0.035, 0.035, 0.003, 24]} />
            <meshPhysicalMaterial color="#f8f8f8" transmission={0.95} transparent roughness={0.04} ior={1.5} thickness={0.1} envMapIntensity={1.4} />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.14, 8]} />
            <meshPhysicalMaterial color="#f8f8f8" transmission={0.95} transparent roughness={0.04} ior={1.5} thickness={0.1} envMapIntensity={1.4} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <sphereGeometry args={[0.04, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
            <meshPhysicalMaterial color="#f8f8f8" transmission={0.95} transparent roughness={0.04} ior={1.5} thickness={0.3} envMapIntensity={1.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* Side wall opposite the partition — half-height, gives a sense of enclosure */}
      <mesh position={[0.5, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, 1.4, 1.2]} />
        <meshPhysicalMaterial
          map={oak.map}
          normalMap={oak.normal}
          roughnessMap={oak.rough}
          roughness={0.55}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Pendant lamp directly above the booth table — defines the cocoon */}
      <group position={[-0.85, 2.85, -0.2]}>
        <mesh position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.04, 16]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.002, 0.002, 1.1, 6]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0, -1.18, 0]}>
          <cylinderGeometry args={[0.08, 0.06, 0.14, 24, 1, true]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.4} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -1.22, 0]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color="#ffd6a0" emissive="#ffb878" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
        <pointLight position={[0, -1.22, 0]} intensity={5} distance={2.6} decay={2} color="#ffb070" />
      </group>
    </group>
  );
}

function BoothChair({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.045, 0.4]} />
        <meshStandardMaterial color="#2c2824" roughness={0.85} />
      </mesh>
      {/* Slim minimal backrest */}
      <mesh position={[0, 0.74, -0.16]} castShadow>
        <boxGeometry args={[0.4, 0.55, 0.018]} />
        <meshStandardMaterial color="#1a1612" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* 4 legs */}
      {[
        [-0.17, -0.16],
        [0.17, -0.16],
        [-0.17, 0.16],
        [0.17, 0.16],
      ].map((p, i) => (
        <mesh key={i} position={[p[0], 0.22, p[1]]} castShadow>
          <cylinderGeometry args={[0.011, 0.014, 0.44, 8]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}
