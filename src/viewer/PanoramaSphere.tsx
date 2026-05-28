import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { getTourPoint } from '../data/tour-points';
import { useTour } from '../store';
import { Hotspots } from './Hotspots';

// Build a procedural placeholder texture that says "Awaiting panorama"
// so the tour still has structure even before the user uploads images.
function makePlaceholder(title: string, subtitle: string): THREE.Texture {
  const w = 4096;
  const h = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Smooth dark gradient with a hint of warmth (top dark, middle warm, bottom dark)
  const grd = ctx.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0.0, '#080808');
  grd.addColorStop(0.45, '#1a120c');
  grd.addColorStop(0.55, '#2a1a10');
  grd.addColorStop(0.62, '#3a2614');
  grd.addColorStop(0.75, '#1a120c');
  grd.addColorStop(1.0, '#060606');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  // Soft "horizon" hot pools — to suggest a room
  for (let i = 0; i < 4; i++) {
    const cx = (i / 4) * w + w / 8;
    const cy = h * 0.58;
    const r = w * 0.16;
    const sp = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    sp.addColorStop(0, 'rgba(224,170,110,0.42)');
    sp.addColorStop(0.4, 'rgba(160,100,60,0.18)');
    sp.addColorStop(1, 'transparent');
    ctx.fillStyle = sp;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  // Subtle teal blob at the back
  {
    const sp = ctx.createRadialGradient(w * 0.5, h * 0.55, 0, w * 0.5, h * 0.55, w * 0.4);
    sp.addColorStop(0, 'rgba(35,55,55,0.5)');
    sp.addColorStop(1, 'transparent');
    ctx.fillStyle = sp;
    ctx.fillRect(0, 0, w, h);
  }

  // Centered title text
  ctx.fillStyle = '#e8d4a8';
  ctx.font = 'italic 220px "Cormorant Garamond", serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, w / 2, h / 2 - 80);

  ctx.font = '300 64px "Inter", sans-serif';
  ctx.fillStyle = '#c9c2b4';
  ctx.fillText(subtitle, w / 2, h / 2 + 40);

  ctx.font = '300 38px "Inter", sans-serif';
  ctx.fillStyle = '#888477';
  ctx.fillText('Awaiting AI panorama · /public/panoramas/', w / 2, h / 2 + 140);

  // Tiny noise overlay for grain
  for (let i = 0; i < 24000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const a = Math.random() * 0.06;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fillRect(x, y, 1.4, 1.4);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.needsUpdate = true;
  return tex;
}

export function PanoramaSphere() {
  const { gl, camera } = useThree();
  const currentPoint = useTour((s) => s.currentPoint);
  const hasStarted = useTour((s) => s.hasStarted);
  const setTransitioning = useTour((s) => s.setTransitioning);
  const setLoaded = useTour((s) => s.setLoaded);
  const pt = getTourPoint(currentPoint);

  // Materials — one for the active sphere, one for the outgoing (for crossfade)
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const fadeMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const [fadeT, setFadeT] = useState(1); // 1 = no fade in progress
  const [fadeFrom, setFadeFrom] = useState<THREE.Texture | null>(null);
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const prevId = useRef<string | null>(null);

  // Load texture (or build placeholder) when panorama changes
  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    loader.load(
      pt.panorama,
      (loaded) => {
        if (cancelled) return;
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.mapping = THREE.EquirectangularReflectionMapping;
        loaded.anisotropy = gl.capabilities.getMaxAnisotropy();
        loaded.needsUpdate = true;
        // Begin crossfade if there was a previous panorama
        if (tex && prevId.current !== currentPoint) {
          setFadeFrom(tex);
          setFadeT(0);
        }
        setTex(loaded);
        prevId.current = currentPoint;
        setLoaded(true);
      },
      undefined,
      () => {
        if (cancelled) return;
        const placeholder = makePlaceholder(pt.title, pt.subtitle);
        if (tex && prevId.current !== currentPoint) {
          setFadeFrom(tex);
          setFadeT(0);
        }
        setTex(placeholder);
        prevId.current = currentPoint;
        setLoaded(true);
      }
    );

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPoint]);

  // Set initial view direction when entering a station
  useEffect(() => {
    if (!hasStarted) return;
    const yaw = pt.initialYaw ?? 0;
    const pitch = pt.initialPitch ?? 0;
    // Calculate look target from yaw/pitch (radius = 1 doesn't matter, only direction)
    const target = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      -Math.cos(yaw) * Math.cos(pitch)
    );
    camera.lookAt(target);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = pt.initialFov ?? 75;
      camera.updateProjectionMatrix();
    }
  }, [currentPoint, hasStarted, camera, pt.initialYaw, pt.initialPitch, pt.initialFov]);

  // Crossfade animation
  useFrame((_, dt) => {
    if (fadeT < 1) {
      const next = Math.min(1, fadeT + dt / 0.8);
      setFadeT(next);
      if (matRef.current) matRef.current.opacity = next;
      if (fadeMatRef.current) fadeMatRef.current.opacity = 1 - next;
      if (next >= 1) {
        setFadeFrom(null);
        setTransitioning(false);
      }
    } else if (matRef.current && matRef.current.opacity < 1) {
      matRef.current.opacity = 1;
    }
  });

  const sphereGeometry = useMemo(() => {
    // Invert by scaling on the X axis so we see the texture from inside
    const g = new THREE.SphereGeometry(50, 96, 64);
    g.scale(-1, 1, 1);
    return g;
  }, []);

  return (
    <group>
      {/* Active panorama */}
      {tex && (
        <mesh geometry={sphereGeometry}>
          <meshBasicMaterial
            ref={matRef}
            map={tex}
            side={THREE.FrontSide}
            toneMapped
            transparent={fadeT < 1}
            opacity={fadeT}
            depthWrite={false}
          />
        </mesh>
      )}
      {/* Outgoing panorama (crossfade source) — slightly smaller sphere so they don't z-fight */}
      {fadeFrom && (
        <mesh geometry={sphereGeometry} scale={0.98}>
          <meshBasicMaterial
            ref={fadeMatRef}
            map={fadeFrom}
            side={THREE.FrontSide}
            toneMapped
            transparent
            opacity={1 - fadeT}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Navigation hotspots — rendered as floating markers in the panorama */}
      {hasStarted && fadeT > 0.5 && <Hotspots hotspots={pt.hotspots} />}
    </group>
  );
}
