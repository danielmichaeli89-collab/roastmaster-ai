import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Cafe } from './Cafe';
import { TourCamera } from './camera/TourCamera';
import { PostFX } from './PostFX';
import { ProceduralEnvironment } from './Environment';
import { useTour } from '../store';
import { getTourPoint } from '../data/tour-points';

export function Scene() {
  const setLoaded = useTour((s) => s.setLoaded);
  const currentPoint = useTour((s) => s.currentPoint);
  const initial = getTourPoint(currentPoint);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 350);
    return () => clearTimeout(t);
  }, [setLoaded]);

  return (
    <Canvas
      shadows
      dpr={[1.5, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 2, 3)]}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
        depth: true,
      }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.25;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        scene.background = new THREE.Color('#070707');
        scene.fog = new THREE.FogExp2(0x080707, 0.02);
      }}
      style={{ position: 'absolute', inset: 0, background: '#070707' }}
    >
      <PerspectiveCamera
        makeDefault
        position={initial.camera}
        fov={initial.fov}
        near={0.05}
        far={60}
      />

      <Suspense fallback={null}>
        <ProceduralEnvironment />
        <Cafe />
      </Suspense>

      <TourCamera />
      <PostFX />
    </Canvas>
  );
}
