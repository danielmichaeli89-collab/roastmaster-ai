import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { getTourPoint } from '../data/tour-points';
import { useTour } from '../store';
import { Hotspots } from './Hotspots';

// Procedural placeholder. The final look comes from the AI-generated panoramas
// the user will drop into /public/panoramas/. This canvas is just to keep the
// structure visible during authoring — it carries a "PLACEHOLDER" label and
// sketches a rough horizon + light pools so the eye has something to land on.
function makePlaceholder(title: string, subtitle: string): THREE.Texture {
  const w = 4096;
  const h = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Deep moody gradient — top sky-ceiling dark, mid warm horizon, low floor
  const grd = ctx.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0.0, '#0c0a09');
  grd.addColorStop(0.35, '#1f1812');
  grd.addColorStop(0.55, '#36281c');
  grd.addColorStop(0.62, '#5c3f24');
  grd.addColorStop(0.75, '#2a1f17');
  grd.addColorStop(1.0, '#0a0807');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  // Distributed warm light pools across the horizon — suggests bar lights
  const pools = [
    { x: w * 0.08, y: h * 0.58, r: w * 0.16 },
    { x: w * 0.28, y: h * 0.6, r: w * 0.14 },
    { x: w * 0.5, y: h * 0.56, r: w * 0.2 },
    { x: w * 0.72, y: h * 0.6, r: w * 0.14 },
    { x: w * 0.92, y: h * 0.58, r: w * 0.16 },
  ];
  for (const p of pools) {
    const sp = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    sp.addColorStop(0, 'rgba(248,200,140,0.55)');
    sp.addColorStop(0.35, 'rgba(190,130,70,0.28)');
    sp.addColorStop(1, 'transparent');
    ctx.fillStyle = sp;
    ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
  }

  // A teal accent band — back wall hint
  {
    const sp = ctx.createLinearGradient(0, h * 0.42, 0, h * 0.58);
    sp.addColorStop(0, 'rgba(28,48,48,0.0)');
    sp.addColorStop(0.5, 'rgba(28,48,48,0.6)');
    sp.addColorStop(1, 'rgba(28,48,48,0.0)');
    ctx.fillStyle = sp;
    ctx.fillRect(0, h * 0.42, w, h * 0.16);
  }

  // Floor reflection band
  {
    const sp = ctx.createLinearGradient(0, h * 0.7, 0, h);
    sp.addColorStop(0, 'rgba(40,28,18,0)');
    sp.addColorStop(0.5, 'rgba(40,28,18,0.6)');
    sp.addColorStop(1, 'rgba(15,10,8,0.9)');
    ctx.fillStyle = sp;
    ctx.fillRect(0, h * 0.7, w, h * 0.3);
  }

  // Title — cream serif, large
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 22;
  ctx.fillStyle = '#f0e0bc';
  ctx.font = 'italic 240px "Cormorant Garamond", serif';
  ctx.fillText(title, w / 2, h / 2 - 50);

  ctx.shadowBlur = 14;
  ctx.font = '300 62px "Inter", sans-serif';
  ctx.fillStyle = '#d4b986';
  ctx.fillText(subtitle, w / 2, h / 2 + 50);

  ctx.shadowBlur = 10;
  ctx.font = '300 42px "Inter", sans-serif';
  ctx.fillStyle = '#9a8d78';
  ctx.fillText('PLACEHOLDER · DROP YOUR AI PANORAMA INTO /public/panoramas/', w / 2, h / 2 + 150);
  ctx.shadowBlur = 0;

  // Subtle film grain
  for (let i = 0; i < 28000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.fillStyle = `rgba(255,235,200,${Math.random() * 0.07})`;
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
