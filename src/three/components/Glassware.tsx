// Crystal coupes suspended above the bar (alongside the bottle shelves)
export function Glassware() {
  // Hanging from a brass rail under the middle shelf (y=1.92), right side
  const positions: { x: number; z: number }[] = [];
  for (let i = 0; i < 5; i++) {
    positions.push({ x: 0.5 + i * 0.18, z: 0.18 });
  }
  for (let i = 0; i < 5; i++) {
    positions.push({ x: 0.5 + i * 0.18, z: 0.05 });
  }

  return (
    <group>
      {/* Hanging rail */}
      <mesh position={[1.0, 1.485, 0.18]}>
        <boxGeometry args={[1.2, 0.012, 0.012]} />
        <meshStandardMaterial color="#0e0e0f" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[1.0, 1.485, 0.05]}>
        <boxGeometry args={[1.2, 0.012, 0.012]} />
        <meshStandardMaterial color="#0e0e0f" metalness={0.7} roughness={0.4} />
      </mesh>

      {positions.map((p, i) => (
        <Coupe key={i} x={p.x} y={1.43} z={p.z} />
      ))}
    </group>
  );
}

function Coupe({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      {/* Stem (hanging from rail) */}
      <mesh>
        <cylinderGeometry args={[0.003, 0.003, 0.1, 8]} />
        <meshPhysicalMaterial
          color="#f8f8f8"
          transmission={0.95}
          opacity={1}
          transparent
          roughness={0.04}
          ior={1.5}
          thickness={0.1}
          envMapIntensity={1.6}
        />
      </mesh>
      {/* Bowl (inverted) */}
      <mesh position={[0, 0.07, 0]}>
        <coneGeometry args={[0.045, 0.06, 24, 1, true]} />
        <meshPhysicalMaterial
          color="#f8f8f8"
          transmission={0.95}
          opacity={1}
          transparent
          roughness={0.04}
          ior={1.5}
          thickness={0.3}
          envMapIntensity={1.6}
          side={2}
        />
      </mesh>
      {/* Base disc */}
      <mesh position={[0, -0.052, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.004, 16]} />
        <meshPhysicalMaterial
          color="#f8f8f8"
          transmission={0.9}
          opacity={1}
          transparent
          roughness={0.04}
          ior={1.5}
          thickness={0.1}
          envMapIntensity={1.6}
        />
      </mesh>
    </group>
  );
}
