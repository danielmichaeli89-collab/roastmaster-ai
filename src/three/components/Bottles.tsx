import * as THREE from 'three';

interface BottleDef {
  x: number;
  y: number;
  z: number;
  height: number;
  radius: number;
  neckRadius: number;
  neckHeight: number;
  color: string;
  capColor?: string;
  shoulderType?: 'rounded' | 'angular';
}

// Bottles span the right-side shelves (local x ∈ [0.3, 2.4])
const BOTTLES: BottleDef[] = [
  // Top shelf — premium amber (y=2.305)
  { x: 0.35, y: 2.305, z: 0.05, height: 0.32, radius: 0.05, neckRadius: 0.018, neckHeight: 0.08, color: '#5a2412', capColor: '#0a0a0a' },
  { x: 0.65, y: 2.305, z: 0.05, height: 0.30, radius: 0.048, neckRadius: 0.018, neckHeight: 0.07, color: '#7a3a1a', capColor: '#c9a25a' },
  { x: 0.95, y: 2.305, z: 0.05, height: 0.34, radius: 0.045, neckRadius: 0.016, neckHeight: 0.09, color: '#3a1a08', shoulderType: 'angular', capColor: '#1a1a1a' },
  { x: 1.25, y: 2.305, z: 0.05, height: 0.31, radius: 0.05, neckRadius: 0.018, neckHeight: 0.08, color: '#6b2410', capColor: '#0a0a0a' },
  { x: 1.55, y: 2.305, z: 0.05, height: 0.33, radius: 0.046, neckRadius: 0.017, neckHeight: 0.09, color: '#8a4a1c', capColor: '#c9a25a' },
  { x: 1.85, y: 2.305, z: 0.05, height: 0.30, radius: 0.05, neckRadius: 0.018, neckHeight: 0.07, color: '#4a1808', capColor: '#0a0a0a' },
  { x: 2.15, y: 2.305, z: 0.05, height: 0.35, radius: 0.045, neckRadius: 0.016, neckHeight: 0.1, color: '#321006', shoulderType: 'angular', capColor: '#9a8050' },
  { x: 2.4, y: 2.305, z: 0.05, height: 0.31, radius: 0.048, neckRadius: 0.017, neckHeight: 0.09, color: '#722810', capColor: '#0a0a0a' },

  // Middle shelf — cognac, brandy, ports (y=1.945)
  { x: 0.45, y: 1.945, z: 0.05, height: 0.30, radius: 0.052, neckRadius: 0.019, neckHeight: 0.07, color: '#8a4a18', capColor: '#0a0a0a' },
  { x: 0.78, y: 1.945, z: 0.05, height: 0.34, radius: 0.045, neckRadius: 0.017, neckHeight: 0.1, color: '#2c0c04', shoulderType: 'angular', capColor: '#c9a25a' },
  { x: 1.10, y: 1.945, z: 0.05, height: 0.29, radius: 0.055, neckRadius: 0.02, neckHeight: 0.06, color: '#a05a22', capColor: '#0a0a0a' },
  { x: 1.45, y: 1.945, z: 0.05, height: 0.32, radius: 0.05, neckRadius: 0.018, neckHeight: 0.08, color: '#5a2008', capColor: '#1a1a1a' },
  { x: 1.78, y: 1.945, z: 0.05, height: 0.36, radius: 0.04, neckRadius: 0.015, neckHeight: 0.11, color: '#1a0a04', shoulderType: 'angular', capColor: '#0a0a0a' },
  { x: 2.10, y: 1.945, z: 0.05, height: 0.30, radius: 0.052, neckRadius: 0.019, neckHeight: 0.07, color: '#7a3818', capColor: '#0a0a0a' },
  { x: 2.35, y: 1.945, z: 0.05, height: 0.33, radius: 0.048, neckRadius: 0.018, neckHeight: 0.09, color: '#642a12', capColor: '#c9a25a' },

  // Bottom shelf — wine bottles, gins, vermouths (y=1.575)
  { x: 0.35, y: 1.575, z: 0.05, height: 0.32, radius: 0.044, neckRadius: 0.015, neckHeight: 0.09, color: '#1a0808', shoulderType: 'angular', capColor: '#9a8050' },
  { x: 0.65, y: 1.575, z: 0.05, height: 0.30, radius: 0.048, neckRadius: 0.017, neckHeight: 0.07, color: '#3a1812', capColor: '#0a0a0a' },
  { x: 0.95, y: 1.575, z: 0.05, height: 0.33, radius: 0.045, neckRadius: 0.016, neckHeight: 0.08, color: '#0c0c0c', capColor: '#c9a25a' },
  { x: 1.25, y: 1.575, z: 0.05, height: 0.29, radius: 0.052, neckRadius: 0.019, neckHeight: 0.06, color: '#5a3818', capColor: '#0a0a0a' },
  { x: 1.55, y: 1.575, z: 0.05, height: 0.34, radius: 0.044, neckRadius: 0.015, neckHeight: 0.09, color: '#1a0808', shoulderType: 'angular', capColor: '#9a8050' },
  { x: 1.85, y: 1.575, z: 0.05, height: 0.31, radius: 0.05, neckRadius: 0.018, neckHeight: 0.07, color: '#4a1808', capColor: '#0a0a0a' },
  { x: 2.15, y: 1.575, z: 0.05, height: 0.33, radius: 0.046, neckRadius: 0.016, neckHeight: 0.09, color: '#2a1208', shoulderType: 'angular', capColor: '#1a1a1a' },
  { x: 2.40, y: 1.575, z: 0.05, height: 0.30, radius: 0.05, neckRadius: 0.018, neckHeight: 0.07, color: '#6a2812', capColor: '#0a0a0a' },
];

function Bottle({ def }: { def: BottleDef }) {
  const bodyHeight = def.height - def.neckHeight;
  const shoulderH = def.shoulderType === 'angular' ? 0.04 : 0.06;
  const bodyH = bodyHeight - shoulderH;
  return (
    <group position={[def.x, def.y, def.z]}>
      {/* Main body */}
      <mesh castShadow position={[0, bodyH / 2, 0]}>
        <cylinderGeometry args={[def.radius, def.radius * 0.96, bodyH, 24]} />
        <meshPhysicalMaterial
          color={def.color}
          transmission={0.4}
          opacity={1}
          transparent
          roughness={0.05}
          ior={1.5}
          thickness={0.6}
          envMapIntensity={1.4}
          attenuationColor={def.color}
          attenuationDistance={0.3}
        />
      </mesh>
      {/* Shoulder */}
      <mesh castShadow position={[0, bodyH + shoulderH / 2, 0]}>
        <cylinderGeometry args={[def.neckRadius, def.radius, shoulderH, 24]} />
        <meshPhysicalMaterial
          color={def.color}
          transmission={0.4}
          opacity={1}
          transparent
          roughness={0.05}
          ior={1.5}
          thickness={0.6}
          envMapIntensity={1.4}
          attenuationColor={def.color}
          attenuationDistance={0.3}
        />
      </mesh>
      {/* Neck */}
      <mesh castShadow position={[0, bodyH + shoulderH + def.neckHeight / 2, 0]}>
        <cylinderGeometry args={[def.neckRadius, def.neckRadius, def.neckHeight, 16]} />
        <meshPhysicalMaterial
          color={def.color}
          transmission={0.5}
          opacity={1}
          transparent
          roughness={0.05}
          ior={1.5}
          thickness={0.4}
          envMapIntensity={1.4}
        />
      </mesh>
      {/* Cap */}
      <mesh castShadow position={[0, bodyH + shoulderH + def.neckHeight + 0.015, 0]}>
        <cylinderGeometry args={[def.neckRadius + 0.003, def.neckRadius + 0.003, 0.03, 16]} />
        <meshStandardMaterial
          color={def.capColor ?? '#0a0a0a'}
          metalness={def.capColor === '#c9a25a' || def.capColor === '#9a8050' ? 0.85 : 0.3}
          roughness={0.35}
        />
      </mesh>
      {/* Label — subtle */}
      <mesh position={[0, bodyH * 0.6, def.radius + 0.001]}>
        <planeGeometry args={[def.radius * 1.6, bodyH * 0.45]} />
        <meshStandardMaterial color="#d8c8a8" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function Bottles() {
  return (
    <group>
      {BOTTLES.map((b, i) => (
        <Bottle key={i} def={b} />
      ))}
    </group>
  );
}
