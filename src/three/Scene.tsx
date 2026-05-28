import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  BrightnessContrast,
  ToneMapping,
  SMAA,
} from '@react-three/postprocessing';
import { ToneMappingMode, BlendFunction } from 'postprocessing';
import { useMemo } from 'react';
import { PanoramaSphere } from '../viewer/PanoramaSphere';
import { CameraController } from '../viewer/CameraController';
import { useTour } from '../store';

export function Scene() {
  const setLoaded = useTour((s) => s.setLoaded);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(t);
  }, [setLoaded]);

  const chromaOffset = useMemo(() => new THREE.Vector2(0.0003, 0.0003), []);

  return (
    <Canvas
      dpr={[1.5, 2.5]}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
        depth: false,
      }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        scene.background = new THREE.Color('#0a0a0a');
      }}
      style={{ position: 'absolute', inset: 0, background: '#0a0a0a' }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 0]} fov={75} near={0.1} far={200} />
      <PanoramaSphere />
      <CameraController />

      <EffectComposer multisampling={4} enableNormalPass={false}>
        <SMAA />
        <Bloom
          intensity={0.12}
          luminanceThreshold={0.92}
          luminanceSmoothing={0.22}
          mipmapBlur
          radius={0.3}
        />
        <ChromaticAberration
          offset={chromaOffset}
          radialModulation
          modulationOffset={0.5}
          blendFunction={BlendFunction.NORMAL}
        />
        <BrightnessContrast brightness={0.02} contrast={0.02} />
        <Vignette eskil={false} offset={0.35} darkness={0.15} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  );
}
