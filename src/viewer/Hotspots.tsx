import { useRef, useState } from 'react';
import * as THREE from 'three';
import { Billboard, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useTour } from '../store';
import type { Hotspot } from '../data/tour-points';

const HOTSPOT_RADIUS = 8; // meters from camera

function sphericalToCartesian(yaw: number, pitch: number, r = HOTSPOT_RADIUS): THREE.Vector3 {
  return new THREE.Vector3(
    Math.sin(yaw) * Math.cos(pitch) * r,
    Math.sin(pitch) * r,
    -Math.cos(yaw) * Math.cos(pitch) * r
  );
}

export function Hotspots({ hotspots }: { hotspots: Hotspot[] }) {
  return (
    <group>
      {hotspots.map((h, i) => (
        <HotspotMarker key={`${h.to}-${i}`} hotspot={h} />
      ))}
    </group>
  );
}

function HotspotMarker({ hotspot }: { hotspot: Hotspot }) {
  const goTo = useTour((s) => s.goTo);
  const isTransitioning = useTour((s) => s.isTransitioning);
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef(0);

  const pos = sphericalToCartesian(hotspot.yaw, hotspot.pitch);

  useFrame((_, dt) => {
    pulseRef.current += dt;
  });

  return (
    <Billboard position={pos.toArray()} follow lockX lockY={false} lockZ>
      <group
        ref={groupRef}
        onClick={(e) => {
          e.stopPropagation();
          if (!isTransitioning) goTo(hotspot.to);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = '';
        }}
      >
        {/* Outer pulse ring */}
        <mesh>
          <ringGeometry args={[0.46, 0.5, 64]} />
          <meshBasicMaterial
            color={hovered ? '#f3ead8' : '#d4b986'}
            transparent
            opacity={hovered ? 0.95 : 0.7}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
        {/* Inner filled disc */}
        <mesh>
          <circleGeometry args={[0.18, 48]} />
          <meshBasicMaterial
            color={hovered ? '#f3ead8' : '#d4b986'}
            transparent
            opacity={hovered ? 0.95 : 0.55}
            toneMapped={false}
          />
        </mesh>
        {/* Animated pulse halo (a slightly larger expanding ring) */}
        <PulseRing />

        {/* Label */}
        <Html
          position={[0, -0.85, 0]}
          center
          distanceFactor={4.5}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              opacity: hovered ? 1 : 0.85,
              transition: 'opacity 200ms ease, transform 200ms ease',
              transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 22,
              color: '#f3ead8',
              textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 16px rgba(0,0,0,0.8)',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              textAlign: 'center',
            }}
          >
            {hotspot.label}
          </div>
        </Html>
      </group>
    </Billboard>
  );
}

function PulseRing() {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((state) => {
    const t = (state.clock.elapsedTime % 2) / 2;
    if (ref.current) {
      const s = 1 + t * 1.4;
      ref.current.scale.set(s, s, s);
    }
    if (matRef.current) {
      matRef.current.opacity = (1 - t) * 0.4;
    }
  });
  return (
    <mesh ref={ref}>
      <ringGeometry args={[0.48, 0.52, 64]} />
      <meshBasicMaterial ref={matRef} color="#d4b986" transparent opacity={0.4} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}
