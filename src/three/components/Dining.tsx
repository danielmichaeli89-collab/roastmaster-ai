import { useMemo } from 'react';
import * as THREE from 'three';
import { whiteOak, acousticFabric, brushedMetal } from '../materials/textures';
import { ROOM } from './Shell';

// Dining area: a row of 2-top tables along the right wall (positive X side).
// Tables are spaced 1.4 m apart, ~ 0.7 m wide each.
export function Dining() {
  return (
    <group position={[0, 0, 0]}>
      {/* Wall niches with hidden LED strips */}
      <WallNiches />

      {/* 3 two-top tables along the right wall — front-right corner reserved for booth */}
      {[-1.6, -0.0, 1.6].map((z, i) => (
        <TwoTopTable key={i} position={[ROOM.width / 2 - 0.95, 0, z]} />
      ))}

      {/* Pendant track lights above tables — strong directional warm beams */}
      {[-1.6, -0.0, 1.6].map((z, i) => (
        <PendantSpot key={`p-${i}`} position={[ROOM.width / 2 - 0.95, ROOM.height - 0.05, z]} />
      ))}
    </group>
  );
}

function WallNiches() {
  // 3 horizontal recessed niches on the right wall — one per dining table
  const niches = [
    { z: -1.6, w: 1.0 },
    { z: 0.0, w: 1.0 },
    { z: 1.6, w: 1.0 },
  ];
  return (
    <group>
      {niches.map((n, i) => (
        <group key={i} position={[ROOM.width / 2 - 0.02, 1.5, n.z]} rotation={[0, -Math.PI / 2, 0]}>
          {/* Recessed back panel — dark steel */}
          <mesh position={[0, 0, 0.03]}>
            <boxGeometry args={[n.w, 0.22, 0.005]} />
            <meshStandardMaterial color="#0a0a0c" metalness={0.4} roughness={0.4} />
          </mesh>
          {/* LED strip top */}
          <mesh position={[0, 0.105, 0.04]}>
            <boxGeometry args={[n.w - 0.05, 0.004, 0.008]} />
            <meshStandardMaterial color="#ffd6a0" emissive="#e5a060" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
          {/* Soft warm internal glow (rectangular emissive plane) */}
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[n.w - 0.05, 0.18]} />
            <meshBasicMaterial color="#6a4220" transparent opacity={0.7} />
          </mesh>
          {/* Real soft light from the niche */}
          <pointLight position={[0, 0, 0.12]} intensity={0.9} distance={1.8} decay={2} color="#ffb878" />
          {/* Niche frame — blackened steel */}
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[n.w + 0.02, 0.24, 0.012]} />
            <meshStandardMaterial color="#080809" metalness={0.6} roughness={0.5} />
          </mesh>
          {/* A small glass or two on the shelf */}
          <NicheObjects width={n.w} />
        </group>
      ))}
    </group>
  );
}

function NicheObjects({ width }: { width: number }) {
  // Couple of water glasses and a small bottle on the niche shelf
  return (
    <group position={[0, -0.08, 0.03]}>
      <mesh position={[width * 0.25, 0.05, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.1, 16, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.95}
          roughness={0.04}
          ior={1.5}
          transparent
          thickness={0.2}
          envMapIntensity={1.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[width * 0.25 - 0.06, 0.05, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.1, 16, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.95}
          roughness={0.04}
          ior={1.5}
          transparent
          thickness={0.2}
          envMapIntensity={1.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function TwoTopTable({ position }: { position: [number, number, number] }) {
  const oakTop = useMemo(() => whiteOak('medium'), []);
  oakTop.map.repeat.set(2, 1);
  oakTop.normal.repeat.set(2, 1);
  oakTop.rough.repeat.set(2, 1);

  return (
    <group position={position}>
      {/* Tabletop */}
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.04, 0.7]} />
        <meshPhysicalMaterial
          map={oakTop.map}
          normalMap={oakTop.normal}
          roughnessMap={oakTop.rough}
          roughness={0.4}
          metalness={0.0}
          clearcoat={0.4}
          clearcoatRoughness={0.25}
          envMapIntensity={0.85}
        />
      </mesh>

      {/* Central pedestal — black powder coat */}
      <mesh position={[0, 0.37, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.72, 16]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.45} />
      </mesh>
      {/* Base disc */}
      <mesh position={[0, 0.012, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.24, 0.024, 32]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.45} />
      </mesh>

      {/* Two chairs */}
      <RoundChair position={[0, 0, -0.55]} rotationY={0} />
      <RoundChair position={[0, 0, 0.55]} rotationY={Math.PI} />

      {/* Table setting: 2 plates, 2 wine glasses, napkin */}
      <PlateSetting position={[0, 0.762, -0.18]} rotation={0} />
      <PlateSetting position={[0, 0.762, 0.18]} rotation={Math.PI} />
    </group>
  );
}

function RoundChair({ position, rotationY }: { position: [number, number, number]; rotationY: number }) {
  const fabric = useMemo(() => acousticFabric('grey'), []);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Seat cushion */}
      <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.04, 0.44]} />
        <meshStandardMaterial color="#3a3632" roughness={0.85} />
      </mesh>
      {/* Round-back backrest (curved using extrudeGeometry-like with simple shapes) */}
      <group position={[0, 0.78, -0.16]}>
        {/* Outer ring */}
        <mesh castShadow>
          <torusGeometry args={[0.22, 0.018, 16, 28, Math.PI]} />
          <meshStandardMaterial
            map={fabric.map}
            roughnessMap={fabric.rough}
            color="#3a3632"
            roughness={0.9}
          />
        </mesh>
        {/* Backrest panel (inside the ring) */}
        <mesh position={[0, 0, 0.012]}>
          <circleGeometry args={[0.21, 28, 0, Math.PI]} />
          <meshStandardMaterial
            map={fabric.map}
            roughnessMap={fabric.rough}
            color="#3a3632"
            roughness={0.92}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      {/* Legs - splayed dark oak */}
      {[
        [-0.18, -0.16],
        [0.18, -0.16],
        [-0.18, 0.16],
        [0.18, 0.16],
      ].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.22, pos[1]]} castShadow>
          <cylinderGeometry args={[0.012, 0.018, 0.44, 8]} />
          <meshStandardMaterial color="#221812" roughness={0.6} metalness={0.0} />
        </mesh>
      ))}
      {/* Cross-brace */}
      <mesh position={[0, 0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.32, 8]} />
        <meshStandardMaterial color="#221812" roughness={0.6} />
      </mesh>
    </group>
  );
}

function PlateSetting({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Plate */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.012, 32]} />
        <meshPhysicalMaterial
          color="#fafafa"
          roughness={0.18}
          metalness={0.0}
          clearcoat={0.5}
          clearcoatRoughness={0.2}
          envMapIntensity={1.0}
        />
      </mesh>
      {/* Plate well */}
      <mesh position={[0, 0.007, 0]}>
        <cylinderGeometry args={[0.105, 0.105, 0.001, 32]} />
        <meshPhysicalMaterial color="#f0f0f0" roughness={0.2} clearcoat={0.4} />
      </mesh>
      {/* Wine glass beside plate */}
      <WineGlass position={[0.15, 0, -0.05]} />
      {/* Folded napkin */}
      <mesh position={[-0.12, 0.007, 0.06]} rotation={[-Math.PI / 2, 0, 0.4]}>
        <planeGeometry args={[0.1, 0.12]} />
        <meshStandardMaterial color="#7a8482" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function WineGlass({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh>
        <cylinderGeometry args={[0.035, 0.035, 0.003, 24]} />
        <meshPhysicalMaterial
          color="#f8f8f8"
          transmission={0.95}
          opacity={1}
          transparent
          roughness={0.04}
          ior={1.5}
          thickness={0.1}
          envMapIntensity={1.4}
        />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.14, 8]} />
        <meshPhysicalMaterial
          color="#f8f8f8"
          transmission={0.95}
          opacity={1}
          transparent
          roughness={0.04}
          ior={1.5}
          thickness={0.1}
          envMapIntensity={1.4}
        />
      </mesh>
      {/* Bowl */}
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.04, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshPhysicalMaterial
          color="#f8f8f8"
          transmission={0.95}
          opacity={1}
          transparent
          roughness={0.04}
          ior={1.5}
          thickness={0.3}
          envMapIntensity={1.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function PendantSpot({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Track mount disc on ceiling */}
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 0.012, 24]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Vertical arm */}
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.35, 8]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Spot fixture head */}
      <mesh position={[0, -0.36, 0]} rotation={[0.1, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.1, 24]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Inner emissive lens */}
      <mesh position={[0, -0.41, 0]} rotation={[0.1, 0, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.012, 24]} />
        <meshStandardMaterial color="#ffe0b0" emissive="#ffc880" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      {/* Real spot light */}
      <spotLight
        position={[0, -0.42, 0]}
        target-position={[position[0], 0.7, position[2]]}
        angle={0.55}
        penumbra={0.6}
        intensity={14}
        distance={4}
        decay={2.0}
        color="#ffb878"
        castShadow={false}
      />
    </group>
  );
}
