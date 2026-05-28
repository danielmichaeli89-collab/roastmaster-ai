import { useMemo } from 'react';
import * as THREE from 'three';
import { tealTiles, whiteOak, bluestone, inkPlaster } from '../materials/textures';

// Room is roughly 10 m wide (x), 8 m deep (z), 2.85 m tall (y).
export const ROOM = {
  width: 10,
  depth: 8,
  height: 2.85,
};

export function Shell() {
  const stone = useMemo(() => bluestone(), []);
  const oakLight = useMemo(() => whiteOak('light'), []);
  const teal = useMemo(() => tealTiles(), []);
  const ink = useMemo(() => inkPlaster(), []);

  // Configure repeats — these are critical to the look
  stone.map.repeat.set(3, 2);
  stone.normal.repeat.set(3, 2);
  stone.rough.repeat.set(3, 2);
  oakLight.map.repeat.set(8, 1);
  oakLight.normal.repeat.set(8, 1);
  oakLight.rough.repeat.set(8, 1);
  teal.map.repeat.set(4, 2);
  teal.normal.repeat.set(4, 2);
  teal.rough.repeat.set(4, 2);

  return (
    <group>
      {/* Floor — polished bluestone */}
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM.width + 2, ROOM.depth + 2]} />
        <meshPhysicalMaterial
          map={stone.map}
          normalMap={stone.normal}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          roughnessMap={stone.rough}
          roughness={0.42}
          metalness={0.05}
          envMapIntensity={0.6}
          clearcoat={0.25}
          clearcoatRoughness={0.45}
        />
      </mesh>

      {/* Ceiling — ink black plaster */}
      <mesh position={[0, ROOM.height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM.width + 2, ROOM.depth + 2]} />
        <meshStandardMaterial map={ink.map} color="#0c0c0d" roughness={0.95} metalness={0} />
      </mesh>

      {/* Far wall (back) — teal tiles */}
      <mesh position={[0, ROOM.height / 2, -ROOM.depth / 2]} receiveShadow>
        <planeGeometry args={[ROOM.width, ROOM.height]} />
        <meshPhysicalMaterial
          map={teal.map}
          normalMap={teal.normal}
          normalScale={new THREE.Vector2(0.45, 0.45)}
          roughnessMap={teal.rough}
          roughness={0.22}
          metalness={0.0}
          clearcoat={0.7}
          clearcoatRoughness={0.18}
          envMapIntensity={0.9}
          color="#243a38"
        />
      </mesh>

      {/* Left wall — vertical oak boards */}
      <mesh position={[-ROOM.width / 2, ROOM.height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM.depth, ROOM.height]} />
        <meshPhysicalMaterial
          map={oakLight.map}
          normalMap={oakLight.normal}
          normalScale={new THREE.Vector2(0.3, 1.2)}
          roughnessMap={oakLight.rough}
          roughness={0.6}
          metalness={0.0}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Right wall — vertical oak boards */}
      <mesh position={[ROOM.width / 2, ROOM.height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM.depth, ROOM.height]} />
        <meshPhysicalMaterial
          map={oakLight.map}
          normalMap={oakLight.normal}
          normalScale={new THREE.Vector2(0.3, 1.2)}
          roughnessMap={oakLight.rough}
          roughness={0.6}
          metalness={0.0}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Front wall (behind the camera at entrance) — oak with a slot opening */}
      <mesh position={[0, ROOM.height / 2, ROOM.depth / 2]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[ROOM.width, ROOM.height]} />
        <meshPhysicalMaterial
          map={oakLight.map}
          normalMap={oakLight.normal}
          normalScale={new THREE.Vector2(0.3, 1.2)}
          roughnessMap={oakLight.rough}
          roughness={0.65}
          metalness={0.0}
          envMapIntensity={0.4}
          color="#7a624a"
        />
      </mesh>

      {/* Skirting — dark steel reveal at floor */}
      {[
        { p: [0, 0.04, -ROOM.depth / 2 + 0.025] as [number, number, number], r: [0, 0, 0] as [number, number, number], w: ROOM.width },
        { p: [-ROOM.width / 2 + 0.025, 0.04, 0] as [number, number, number], r: [0, Math.PI / 2, 0] as [number, number, number], w: ROOM.depth },
        { p: [ROOM.width / 2 - 0.025, 0.04, 0] as [number, number, number], r: [0, -Math.PI / 2, 0] as [number, number, number], w: ROOM.depth },
      ].map((s, i) => (
        <mesh key={i} position={s.p} rotation={s.r}>
          <boxGeometry args={[s.w, 0.08, 0.005]} />
          <meshStandardMaterial color="#0a0a0b" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}

      {/* Subtle ceiling shadow line — gives the ceiling depth */}
      <mesh position={[0, ROOM.height - 0.002, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[Math.min(ROOM.width, ROOM.depth) / 2 - 0.5, Math.min(ROOM.width, ROOM.depth) / 2 - 0.45, 4]} />
        <meshBasicMaterial color="#000" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
