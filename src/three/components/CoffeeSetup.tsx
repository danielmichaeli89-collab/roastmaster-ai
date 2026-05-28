import { useMemo } from 'react';
import * as THREE from 'three';
import { brushedMetal } from '../materials/textures';

// Sits in the LEFT half of the bar (local x ≈ -2.4 .. -0.4 in the Bar group).
// Contains a 4-module Modbar (espresso + steam + pourover) and three coffee grinders.
export function CoffeeSetup() {
  return (
    <group>
      {/* Modbar tap modules — chrome columns rising 22 cm above the bar top
          (bar top surface is at world y ≈ 1.15, so group center y = 1.26) */}
      <ModbarGroup position={[-2.1, 1.26, 0.18]} type="espresso" />
      <ModbarGroup position={[-1.7, 1.26, 0.18]} type="espresso" />
      <ModbarGroup position={[-1.3, 1.26, 0.18]} type="steam" />
      <ModbarGroup position={[-0.9, 1.26, 0.18]} type="pourover" />

      {/* The brew tray sitting on the bar top, in front of the modules */}
      <mesh position={[-1.7, 1.157, 0.42]} receiveShadow>
        <boxGeometry args={[1.4, 0.014, 0.32]} />
        <meshStandardMaterial color="#dcdcdc" metalness={0.9} roughness={0.32} />
      </mesh>
      <mesh position={[-1.7, 1.166, 0.42]}>
        <boxGeometry args={[1.36, 0.004, 0.28]} />
        <meshStandardMaterial color="#181818" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Three coffee grinders — sit on the counter behind the Modbar */}
      <Grinder position={[-2.0, 1.15, -0.05]} hopperColor="#101010" />
      <Grinder position={[-1.5, 1.15, -0.05]} hopperColor="#1a1a1a" />
      <Grinder position={[-1.0, 1.15, -0.05]} hopperColor="#101010" />

      {/* Espresso cups stacked on the bar to the right of the Modbar */}
      <CupStack position={[-0.5, 1.155, 0.45]} count={5} />
      <CupStack position={[-0.5, 1.155, 0.58]} count={4} />

      {/* Milk pitchers */}
      <MilkPitcher position={[-2.5, 1.155, 0.42]} />
      <MilkPitcher position={[-2.5, 1.155, 0.58]} />

      {/* Knockbox */}
      <Knockbox position={[-2.7, 1.155, 0.42]} />

      {/* Tamping mat & tamper */}
      <mesh position={[-2.7, 1.156, 0.62]} receiveShadow>
        <boxGeometry args={[0.22, 0.006, 0.16]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.95} />
      </mesh>
      <Tamper position={[-2.7, 1.165, 0.62]} />
    </group>
  );
}

// One Modbar module: a polished chrome column with the working head on top.
function ModbarGroup({
  position,
  type,
}: {
  position: [number, number, number];
  type: 'espresso' | 'steam' | 'pourover';
}) {
  return (
    <group position={position}>
      {/* Column rising through the counter — 22 cm tall above the bar */}
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.22, 48]} />
        <meshPhysicalMaterial
          color="#f0f0f0"
          metalness={1.0}
          roughness={0.06}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          envMapIntensity={2.0}
        />
      </mesh>
      {/* Decorative ring at the base */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.012, 48]} />
        <meshPhysicalMaterial color="#d4b986" metalness={1.0} roughness={0.18} envMapIntensity={1.4} />
      </mesh>
      {/* Cap at top */}
      <mesh position={[0, 0.115, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.05, 0.04, 48]} />
        <meshPhysicalMaterial color="#f0f0f0" metalness={1.0} roughness={0.06} envMapIntensity={2.0} />
      </mesh>

      {type === 'espresso' && (
        <>
          {/* Group head — sticks out forward from the top */}
          <mesh position={[0, 0.075, 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.06, 32]} />
            <meshPhysicalMaterial color="#f0f0f0" metalness={1.0} roughness={0.08} envMapIntensity={1.8} />
          </mesh>
          {/* Portafilter (resting in the group, handle pointing toward camera) */}
          <group position={[0, 0.04, 0.11]} rotation={[0, 0, 0]}>
            {/* Spout */}
            <mesh castShadow>
              <cylinderGeometry args={[0.022, 0.018, 0.05, 24]} />
              <meshStandardMaterial color="#cccccc" metalness={0.85} roughness={0.25} />
            </mesh>
            {/* Handle — wood with chrome end */}
            <mesh position={[0, -0.04, 0.08]} rotation={[Math.PI / 2.6, 0, 0]} castShadow>
              <cylinderGeometry args={[0.013, 0.013, 0.13, 16]} />
              <meshStandardMaterial color="#2a1a10" roughness={0.4} />
            </mesh>
            {/* Two spouts under */}
            <mesh position={[-0.008, -0.038, 0]} castShadow>
              <cylinderGeometry args={[0.004, 0.003, 0.022, 12]} />
              <meshStandardMaterial color="#cccccc" metalness={0.85} roughness={0.25} />
            </mesh>
            <mesh position={[0.008, -0.038, 0]} castShadow>
              <cylinderGeometry args={[0.004, 0.003, 0.022, 12]} />
              <meshStandardMaterial color="#cccccc" metalness={0.85} roughness={0.25} />
            </mesh>
          </group>
          {/* Top button (paddle) */}
          <mesh position={[0, 0.135, -0.012]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.014, 24]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.4} />
          </mesh>
        </>
      )}

      {type === 'steam' && (
        <>
          {/* Steam wand — curves forward */}
          <mesh position={[0, 0.04, 0.05]} rotation={[Math.PI / 2.5, 0, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 0.2, 16]} />
            <meshPhysicalMaterial color="#e0e0e0" metalness={1.0} roughness={0.08} envMapIntensity={1.6} />
          </mesh>
          {/* Tip */}
          <mesh position={[0, -0.045, 0.15]} rotation={[Math.PI / 2.5, 0, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.006, 0.028, 16]} />
            <meshStandardMaterial color="#cccccc" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Steam lever (top) */}
          <mesh position={[0, 0.155, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.006, 0.06, 12]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.19, 0]} castShadow>
            <sphereGeometry args={[0.014, 24, 24]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.45} />
          </mesh>
        </>
      )}

      {type === 'pourover' && (
        <>
          {/* Pour spout */}
          <mesh position={[0, 0.04, 0.05]} rotation={[Math.PI / 2.2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.01, 0.12, 24]} />
            <meshPhysicalMaterial color="#e0e0e0" metalness={1.0} roughness={0.08} envMapIntensity={1.6} />
          </mesh>
          {/* Top dome */}
          <mesh position={[0, 0.16, 0]} castShadow>
            <sphereGeometry args={[0.04, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshPhysicalMaterial color="#f0f0f0" metalness={1.0} roughness={0.06} envMapIntensity={2.0} />
          </mesh>
        </>
      )}
    </group>
  );
}

// Professional coffee grinder — tall, hopper on top, chute at the front
function Grinder({
  position,
  hopperColor = '#101010',
}: {
  position: [number, number, number];
  hopperColor?: string;
}) {
  const brass = useMemo(() => brushedMetal('steel'), []);
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.08, 0.22]} />
        <meshStandardMaterial color="#1a1a1c" metalness={0.5} roughness={0.45} />
      </mesh>
      {/* Grinder body — chrome cylinder */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 0.2, 48]} />
        <meshPhysicalMaterial
          map={brass.map}
          roughnessMap={brass.rough}
          metalness={0.95}
          roughness={0.22}
          envMapIntensity={1.6}
        />
      </mesh>
      {/* Burr collar */}
      <mesh position={[0, 0.305, 0]} castShadow>
        <cylinderGeometry args={[0.082, 0.075, 0.04, 48]} />
        <meshStandardMaterial color="#1a1a1c" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Hopper — clear cylinder */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.22, 48]} />
        <meshPhysicalMaterial
          color={hopperColor}
          transmission={0.4}
          opacity={1}
          transparent
          roughness={0.08}
          ior={1.5}
          thickness={0.3}
          envMapIntensity={1.5}
          metalness={0.0}
        />
      </mesh>
      {/* Hopper lid */}
      <mesh position={[0, 0.575, 0]} castShadow>
        <cylinderGeometry args={[0.062, 0.06, 0.018, 48]} />
        <meshStandardMaterial color="#1a1a1c" metalness={0.5} roughness={0.45} />
      </mesh>
      {/* Coffee beans visible inside the hopper */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.052, 0.045, 0.08, 32]} />
        <meshStandardMaterial color="#2a1408" roughness={0.85} />
      </mesh>
      {/* Chute at front */}
      <mesh position={[0, 0.18, 0.085]} castShadow>
        <boxGeometry args={[0.04, 0.06, 0.04]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.45} />
      </mesh>
      {/* Portafilter fork (where the basket sits while grinding) */}
      <mesh position={[0, 0.13, 0.115]} castShadow>
        <boxGeometry args={[0.05, 0.006, 0.02]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Display panel */}
      <mesh position={[0, 0.06, 0.111]}>
        <planeGeometry args={[0.06, 0.025]} />
        <meshStandardMaterial color="#040406" emissive="#a0c8ff" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
      {/* Two buttons below the display */}
      <mesh position={[-0.04, 0.024, 0.111]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.005, 16]} />
        <meshStandardMaterial color="#1a1a1c" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0.04, 0.024, 0.111]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.005, 16]} />
        <meshStandardMaterial color="#1a1a1c" metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  );
}

// A small stack of espresso cups (ceramic, white)
function CupStack({ position, count }: { position: [number, number, number]; count: number }) {
  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[0, i * 0.012, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.028, 0.018, 32]} />
          <meshPhysicalMaterial color="#fafafa" roughness={0.22} clearcoat={0.5} clearcoatRoughness={0.25} envMapIntensity={1.0} />
        </mesh>
      ))}
      {/* Saucer at the bottom */}
      <mesh position={[0, -0.008, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.005, 32]} />
        <meshPhysicalMaterial color="#fafafa" roughness={0.2} clearcoat={0.4} clearcoatRoughness={0.25} envMapIntensity={1.0} />
      </mesh>
    </group>
  );
}

// Stainless milk pitcher
function MilkPitcher({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.12, 32]} />
        <meshPhysicalMaterial color="#e8e8e8" metalness={0.95} roughness={0.18} envMapIntensity={1.6} />
      </mesh>
      {/* Spout (a small bulge at the top front) */}
      <mesh position={[0, 0.115, 0.04]} rotation={[Math.PI / 6, 0, 0]} castShadow>
        <coneGeometry args={[0.022, 0.04, 16]} />
        <meshPhysicalMaterial color="#e8e8e8" metalness={0.95} roughness={0.18} envMapIntensity={1.6} />
      </mesh>
      {/* Handle */}
      <mesh position={[-0.05, 0.06, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.022, 0.004, 12, 24, Math.PI]} />
        <meshPhysicalMaterial color="#e8e8e8" metalness={0.95} roughness={0.22} />
      </mesh>
    </group>
  );
}

// Knockbox — round container with a rubber-tipped bar for knocking spent pucks
function Knockbox({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 32]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Rubber knock bar across the top */}
      <mesh position={[0, 0.084, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.13, 16]} />
        <meshStandardMaterial color="#1a1a1c" roughness={0.85} />
      </mesh>
    </group>
  );
}

// Espresso tamper — wood handle, stainless base
function Tamper({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.005, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.028, 0.01, 32]} />
        <meshStandardMaterial color="#cccccc" metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.045, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.025, 0.07, 24]} />
        <meshStandardMaterial color="#3a1a10" roughness={0.5} />
      </mesh>
    </group>
  );
}
