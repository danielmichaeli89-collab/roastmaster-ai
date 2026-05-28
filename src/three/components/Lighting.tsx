import { ROOM } from './Shell';

// Track lights running along the ceiling. Multiple parallel tracks with spot heads.
// No volumetric beam meshes — those produced odd geometric shapes against the dark scene.
export function TrackLighting() {
  return (
    <group>
      {/* Track rails — thin black extrusions on the ceiling */}
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

      {/* Bar track: dense pool of light across the working surface */}
      {[-4.0, -3.2, -2.4, -1.6, -0.8, 0.0, 0.8].map((x, i) => (
        <TrackSpot key={`bar-${i}`} position={[x, ROOM.height - 0.025, -2.0]} target={[x, 1.05, -3.4]} intensity={11} angle={0.55} />
      ))}

      {/* Central track — spotlights on the floor between bar and dining */}
      {[-2.5, -1.0, 0.5, 2.0, 3.5].map((x, i) => (
        <TrackSpot key={`mid-${i}`} position={[x, ROOM.height - 0.025, 0.0]} target={[x, 0, 0.0]} intensity={8.5} angle={0.6} />
      ))}

      {/* Front track — light the booth and entrance */}
      {[-1.0, 0.5, 2.0, 3.5].map((x, i) => (
        <TrackSpot key={`front-${i}`} position={[x, ROOM.height - 0.025, 2.4]} target={[x, 0.7, 3.4]} intensity={8} angle={0.6} />
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
        <cylinderGeometry args={[0.03, 0.038, 0.09, 32]} />
        <meshStandardMaterial color="#080809" metalness={0.6} roughness={0.45} />
      </mesh>
      {/* Pivot mount */}
      <mesh position={[0, -0.012, 0]}>
        <cylinderGeometry args={[0.018, 0.024, 0.024, 24]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.45} />
      </mesh>
      {/* Hot lens at the bottom */}
      <mesh position={[0, -0.082, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.006, 24]} />
        <meshStandardMaterial color="#fff0d0" emissive="#ffd6a0" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <spotLight
        position={[0, -0.085, 0]}
        target-position={target}
        angle={angle}
        penumbra={0.7}
        intensity={intensity}
        distance={7}
        decay={1.9}
        color="#ffcc94"
        castShadow={false}
      />
    </group>
  );
}

export function AmbientLighting() {
  return (
    <>
      {/* Higher ambient — keeps the room readable, not pitch-black */}
      <ambientLight intensity={0.55} color="#4a3c34" />
      {/* Cool fill from the front, suggesting an exterior window */}
      <directionalLight position={[6, 2.4, 7]} intensity={0.9} color="#9ab0cc" />
      {/* Warm wash behind the bar */}
      <pointLight position={[-2.0, 2.0, -2.3]} intensity={9} distance={6} decay={2} color="#ffc290" />
      {/* Front fill near the speaker wall */}
      <pointLight position={[-2.5, 1.6, -3.0]} intensity={5} distance={4} decay={2} color="#ffb878" />
      {/* Bar working-surface fill */}
      <pointLight position={[-2.5, 1.3, -2.0]} intensity={5} distance={3.5} decay={2} color="#ffb070" />
      {/* Side fill from the dining wall */}
      <pointLight position={[3.6, 1.4, 0.0]} intensity={6} distance={4.5} decay={2} color="#ffb070" />
      {/* Booth warm fill */}
      <pointLight position={[2.8, 1.5, 3.0]} intensity={4} distance={3} decay={2} color="#ffa860" />
      {/* Low ground bounce */}
      <pointLight position={[0, 0.5, 0]} intensity={1.6} distance={7} decay={2} color="#8a5640" />
      {/* Counter ceiling bounce */}
      <pointLight position={[-1.8, 2.6, -2.0]} intensity={2.4} distance={3} decay={2} color="#c08868" />
    </>
  );
}
