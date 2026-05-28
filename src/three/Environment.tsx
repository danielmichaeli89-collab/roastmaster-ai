import { useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

// A purely procedural environment map (no external HDR fetch).
// Builds a warm, dim, evening-light environment in a 256-cube using a canvas.
export function ProceduralEnvironment() {
  const { scene, gl } = useThree();

  useEffect(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Build an equirectangular HDR-like map. Top: dark, Middle: warm spill from lights, Bottom: subtle floor bounce
    const grd = ctx.createLinearGradient(0, 0, 0, size);
    grd.addColorStop(0.0, '#070707');
    grd.addColorStop(0.45, '#1a120a');
    grd.addColorStop(0.55, '#3a2010');
    grd.addColorStop(0.65, '#5a3210');
    grd.addColorStop(0.75, '#2a1a0e');
    grd.addColorStop(1.0, '#0a0a0a');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);

    // Add some bright spot highlights for reflections (track lights up top)
    for (let i = 0; i < 6; i++) {
      const cx = (i / 6) * size + size / 12;
      const cy = size * 0.4;
      const r = 18;
      const sp = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      sp.addColorStop(0, '#ffd6a0');
      sp.addColorStop(0.5, '#7a4a20');
      sp.addColorStop(1, 'transparent');
      ctx.fillStyle = sp;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    // A teal-ish blob for the wall reflection
    {
      const sp = ctx.createRadialGradient(size * 0.3, size * 0.6, 0, size * 0.3, size * 0.6, 48);
      sp.addColorStop(0, '#1e3838');
      sp.addColorStop(1, 'transparent');
      ctx.fillStyle = sp;
      ctx.fillRect(0, 0, size, size);
    }
    // Slight cold rim from a window/light at front
    {
      const sp = ctx.createRadialGradient(size * 0.75, size * 0.5, 0, size * 0.75, size * 0.5, 60);
      sp.addColorStop(0, '#1e2838');
      sp.addColorStop(1, 'transparent');
      ctx.fillStyle = sp;
      ctx.fillRect(0, 0, size, size);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;

    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const envMap = pmrem.fromEquirectangular(tex).texture;

    const prevEnv = scene.environment;
    scene.environment = envMap;
    scene.environmentIntensity = 0.45;

    return () => {
      scene.environment = prevEnv;
      envMap.dispose();
      tex.dispose();
      pmrem.dispose();
    };
  }, [scene, gl]);

  return null;
}
