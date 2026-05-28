import * as THREE from 'three';
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  ChromaticAberration,
  BrightnessContrast,
  HueSaturation,
  ToneMapping,
  SMAA,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { useMemo } from 'react';
import { useTour } from '../store';

export function PostFX() {
  const cinematic = useTour((s) => s.cinematicMode);
  const quality = useTour((s) => s.qualityTier);
  const isHigh = quality === 'high';

  const chromaOffset = useMemo(() => new THREE.Vector2(0.0004, 0.0004), []);

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <SMAA />
      <Bloom
        intensity={cinematic ? 0.55 : 0.32}
        luminanceThreshold={0.78}
        luminanceSmoothing={0.32}
        mipmapBlur
        radius={0.62}
      />
      {cinematic && isHigh ? (
        <DepthOfField focusDistance={0.04} focalLength={0.05} bokehScale={2.2} height={520} />
      ) : (
        <></>
      )}
      <ChromaticAberration
        offset={chromaOffset}
        radialModulation
        modulationOffset={0.5}
        blendFunction={BlendFunction.NORMAL}
      />
      <HueSaturation hue={-0.01} saturation={cinematic ? -0.02 : -0.06} />
      <BrightnessContrast brightness={cinematic ? 0.02 : 0.04} contrast={cinematic ? 0.06 : 0.04} />
      <Vignette eskil={false} offset={0.22} darkness={cinematic ? 0.55 : 0.4} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
