import { useMemo } from 'react';
import * as THREE from 'three';
import { ROOM } from './Shell';

// Track lights running along the ceiling.
// Two parallel tracks, with multiple spot heads each.
export function TrackLighting() {
  return (
    <group>
      {/* Track rails — thin black extrusions on ceiling */}
      <mesh position={[-2.0, ROOM.height - 0.012, -2.0]}>
        <boxGeometry args={[6.0, 0.024, 0.04]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[1.0, ROOM.height - 0.012, 0.0]}>
        <boxGeometry args={[7.0, 0.024, 0.04]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[1.5, ROOM.height - 0.012, 2.4]}>
        <boxGeometry args={[6.0, 0.024, 0.04]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Spot heads on the bar track — aiming down at bar */}
      {[-4.0, -3.0, -2.0, -1.0, 0.0, 1.0].map((x, i) => (
        <TrackSpot key={`bar-${i}`} position={[x, ROOM.height - 0.025, -2.0]} target={[x, 1.1, -3.6]} intensity={5} angle={0.5} />
      ))}

      {/* Spot heads on the central track — focused beams */}
      {[-2.5, -1.0, 0.5, 2.0, 3.5].map((x, i) => (
        <TrackSpot key={`mid-${i}`} position={[x, ROOM.height - 0.025, 0.0]} target={[x, 0, 0.0]} intensity={4.5} angle={0.6} />
      ))}

      {/* Spot heads near the entrance/booth */}
      {[-1.0, 0.5, 2.0, 3.5].map((x, i) => (
        <TrackSpot key={`front-${i}`} position={[x, ROOM.height - 0.025, 2.4]} target={[x, 0.7, 3.4]} intensity={4} angle={0.6} />
      ))}
    </group>
  );
}

function TrackSpot({
  position,
  target,
  intensity,
  angle,
}: {
  position: [number, number, number];
  target: [number, number, number];
  intensity: number;
  angle: number;
}) {
  return (
    <group position={position}>
      {/* Fixture body */}
      <mesh position={[0, -0.04, 0]} rotation={[Math.PI * 0.04, 0, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.038, 0.09, 24]} />
        <meshStandardMaterial color="#080809" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Pivot mount */}
      <mesh position={[0, -0.012, 0]}>
        <cylinderGeometry args={[0.018, 0.024, 0.024, 16]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Emissive lens at the bottom */}
      <mesh position={[0, -0.082, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.006, 24]} />
        <meshStandardMaterial color="#ffe0b0" emissive="#ffc880" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      {/* Volumetric soft cone (subtle) */}
      <SoftBeam position={[0, -0.1, 0]} angle={angle} />
      {/* Actual spot light */}
      <spotLight
        position={[0, -0.085, 0]}
        target-position={target}
        angle={angle}
        penumbra={0.55}
        intensity={intensity * 2.2}
        distance={6}
        decay={2.0}
        color="#ffba78"
        castShadow={false}
      />
    </group>
  );
}

function SoftBeam({ position, angle }: { position: [number, number, number]; angle: number }) {
  const length = 1.0;
  const geo = useMemo(() => {
    const radiusBottom = Math.tan(angle * 0.55) * length;
    return new THREE.ConeGeometry(radiusBottom, length, 18, 1, true);
  }, [angle]);
  return (
    <mesh
      position={[position[0], position[1] - length / 2, position[2]]}
      rotation={[Math.PI, 0, 0]}
      geometry={geo}
      renderOrder={2}
    >
      <meshBasicMaterial
        color="#ffba78"
        transparent
        opacity={0.014}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export function AmbientLighting() {
  return (
    <>
      {/* Ambient base — keeps deep shadows readable */}
      <ambientLight intensity={0.22} color="#352e30" />
      {/* Faint cool fill from the front, suggesting an exterior window */}
      <directionalLight position={[6, 2.4, 7]} intensity={0.55} color="#8aa6c8" />
      {/* Warm fill at the bar back — makes the oak and bottles glow */}
      <pointLight position={[-2.0, 2.0, -2.3]} intensity={5.5} distance={5.5} decay={2} color="#ffb878" />
      {/* Lower warm fill in the bar zone */}
      <pointLight position={[-2.5, 1.1, -2.3]} intensity={2.8} distance={3.5} decay={2} color="#ffa860" />
      {/* Soft side fill from the dining wall */}
      <pointLight position={[3.6, 1.4, 0.0]} intensity={3.6} distance={4} decay={2} color="#ffb070" />
      {/* Booth warm fill */}
      <pointLight position={[2.8, 1.5, 3.0]} intensity={2.6} distance={3} decay={2} color="#ffa860" />
      {/* Low ground bounce */}
      <pointLight position={[0, 0.5, 0]} intensity={0.9} distance={6} decay={2} color="#7a4830" />
    </>
  );
}
