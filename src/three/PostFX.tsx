import * as THREE from 'three';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  BrightnessContrast,
  HueSaturation,
  ToneMapping,
  SMAA,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { useMemo } from 'react';

export function PostFX() {
  const chromaOffset = useMemo(() => new THREE.Vector2(0.0003, 0.0003), []);

  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <SMAA />
      <Bloom
        intensity={0.42}
        luminanceThreshold={0.82}
        luminanceSmoothing={0.28}
        mipmapBlur
        radius={0.5}
      />
      <ChromaticAberration
        offset={chromaOffset}
        radialModulation
        modulationOffset={0.55}
        blendFunction={BlendFunction.NORMAL}
      />
      <HueSaturation hue={-0.005} saturation={0.02} />
      <BrightnessContrast brightness={0.04} contrast={0.05} />
      <Vignette eskil={false} offset={0.25} darkness={0.45} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
