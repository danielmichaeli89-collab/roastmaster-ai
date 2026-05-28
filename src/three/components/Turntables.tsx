import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { brushedMetal } from '../materials/textures';

// Two Technics-style turntables embedded into the right end of the bar top
export function Turntables() {
  const steel = useMemo(() => brushedMetal('steel'), []);
  return (
    <group position={[-1.6, 1.16, 0.36]}>
      <Deck position={[-0.32, 0, 0]} steelMap={steel.map} steelRough={steel.rough} />
      <Deck position={[0.32, 0, 0]} steelMap={steel.map} steelRough={steel.rough} />

      {/* Library lamp above the DJ booth — black, swing-arm */}
      <group position={[0, 0.5, -0.05]}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.035, 0.04, 16]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.07, -0.04]} rotation={[0, 0, Math.PI / 8]} castShadow>
          <boxGeometry args={[0.014, 0.18, 0.014]} />
          <meshStandardMaterial color="#0e0e0f" roughness={0.5} metalness={0.5} />
        </mesh>
        <mesh position={[0.04, 0.0, -0.07]} rotation={[Math.PI / 3, 0, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.07, 0.1, 24, 1, true]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.4} metalness={0.6} side={THREE.DoubleSide} />
        </mesh>
        {/* Hot glow inside the lampshade */}
        <pointLight position={[0.04, -0.02, -0.05]} intensity={6} distance={2.4} decay={2} color="#ffb060" />
        <mesh position={[0.04, -0.02, -0.05]}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshStandardMaterial color="#ffd6a0" emissive="#ffb060" emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
      </group>

      {/* A small stack of records leaning against the back (to the right of the decks) */}
      <group position={[0.55, 0.0, -0.18]} rotation={[0, 0.2, 0.06]}>
        {[0, 0.012, 0.024, 0.036, 0.048].map((dy, i) => (
          <mesh key={i} position={[0, dy, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.002, 32]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#1a1a1a' : '#0a0a0a'} roughness={0.7} />
          </mesh>
        ))}
        {/* Sleeve outer */}
        <mesh position={[0, -0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.156, 0.156, 0.005, 4]} />
          <meshStandardMaterial color="#2a2218" roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}

function Deck({ position, steelMap, steelRough }: { position: [number, number, number]; steelMap: THREE.Texture; steelRough: THREE.Texture }) {
  const platterRef = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (platterRef.current) {
      // 33.3 rpm = 0.555 rev/s = 3.49 rad/s
      platterRef.current.rotation.y += dt * 3.49 * 0.4;
    }
  });
  return (
    <group position={position}>
      {/* Recessed steel plate around deck */}
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry args={[0.5, 0.012, 0.46]} />
        <meshStandardMaterial map={steelMap} roughnessMap={steelRough} metalness={0.85} roughness={0.35} />
      </mesh>
      {/* Deck body */}
      <mesh position={[0, 0.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.025, 0.42]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.55} metalness={0.3} />
      </mesh>
      {/* Platter */}
      <mesh ref={platterRef} position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.155, 0.155, 0.012, 64]} />
        <meshStandardMaterial color="#1a1a1c" metalness={0.7} roughness={0.32} />
      </mesh>
      {/* Slipmat */}
      <mesh position={[0, 0.027, 0]} rotation={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.148, 0.148, 0.002, 64]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      {/* Vinyl record on platter */}
      <mesh position={[0, 0.03, 0]} rotation={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.001, 64]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Center label */}
      <mesh position={[0, 0.031, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.001, 32]} />
        <meshStandardMaterial color="#7a2018" roughness={0.7} />
      </mesh>
      {/* Spindle */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.02, 12]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Tonearm — at rear right */}
      <group position={[0.16, 0.025, -0.12]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.04, 16]} />
          <meshStandardMaterial color="#1a1a1c" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[-0.1, 0.005, 0.08]} rotation={[0, -0.6, 0]} castShadow>
          <boxGeometry args={[0.22, 0.006, 0.008]} />
          <meshStandardMaterial color="#dddddd" metalness={0.9} roughness={0.3} />
        </mesh>
        {/* Headshell */}
        <mesh position={[-0.2, 0.001, 0.155]} rotation={[0, -0.6, 0]}>
          <boxGeometry args={[0.04, 0.02, 0.03]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.5} />
        </mesh>
        {/* Counterweight */}
        <mesh position={[0.04, 0.005, -0.03]} rotation={[0, -0.6, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.04, 16]} />
          <meshStandardMaterial color="#1a1a1c" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
      {/* Pitch slider */}
      <mesh position={[0.16, 0.015, 0.16]}>
        <boxGeometry args={[0.04, 0.005, 0.12]} />
        <meshStandardMaterial color="#2a2a2c" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0.16, 0.017, 0.16]}>
        <boxGeometry args={[0.022, 0.006, 0.02]} />
        <meshStandardMaterial color="#dddddd" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Start/Stop button */}
      <mesh position={[-0.18, 0.015, 0.18]}>
        <cylinderGeometry args={[0.012, 0.012, 0.005, 16]} />
        <meshStandardMaterial color="#101012" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Tiny blue power LED */}
      <mesh position={[-0.18, 0.018, 0.12]}>
        <sphereGeometry args={[0.003, 8, 8]} />
        <meshStandardMaterial color="#a0d8ff" emissive="#80c8ff" emissiveIntensity={4} toneMapped={false} />
      </mesh>
    </group>
  );
}
