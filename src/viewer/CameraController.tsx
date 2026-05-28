import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTour } from '../store';
import { getTourPoint } from '../data/tour-points';

// First-person panorama camera controller.
// - Mouse drag (and touch drag) rotates yaw + pitch
// - Scroll wheel / pinch changes FOV (zoom)
// - When a new station is entered, smoothly settle to its initialYaw/Pitch
export function CameraController() {
  const { gl, camera } = useThree();
  const hasStarted = useTour((s) => s.hasStarted);

  // Current view yaw/pitch in radians
  const yaw = useRef(0);
  const pitch = useRef(-0.05);
  const targetYaw = useRef(0);
  const targetPitch = useRef(-0.05);
  const fov = useRef(75);
  const targetFov = useRef(75);

  // Drag tracking
  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const lastTouchDistance = useRef<number | null>(null);

  // Auto-drift when idle (subtle, like a slow look-around)
  const lastInteraction = useRef(performance.now());
  const idleStart = useRef(0);

  useEffect(() => {
    const el = gl.domElement;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType !== 'touch') return;
      dragging.current = true;
      lastX.current = e.clientX;
      lastY.current = e.clientY;
      el.setPointerCapture(e.pointerId);
      lastInteraction.current = performance.now();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastX.current;
      const dy = e.clientY - lastY.current;
      lastX.current = e.clientX;
      lastY.current = e.clientY;
      // Scale by current FOV (zoomed-in should rotate slower)
      const sensitivity = (fov.current / 75) * 0.0028;
      targetYaw.current -= dx * sensitivity;
      targetPitch.current = clamp(targetPitch.current - dy * sensitivity, -Math.PI / 2 + 0.05, Math.PI / 2 - 0.05);
      lastInteraction.current = performance.now();
    };
    const onUp = (e: PointerEvent) => {
      dragging.current = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* */
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetFov.current = clamp(targetFov.current + e.deltaY * 0.06, 32, 95);
      lastInteraction.current = performance.now();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (lastTouchDistance.current !== null) {
          const delta = lastTouchDistance.current - dist;
          targetFov.current = clamp(targetFov.current + delta * 0.15, 32, 95);
        }
        lastTouchDistance.current = dist;
        lastInteraction.current = performance.now();
      } else {
        lastTouchDistance.current = null;
      }
    };
    const onTouchEnd = () => {
      lastTouchDistance.current = null;
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [gl]);

  useFrame((_, dt) => {
    if (!hasStarted) return;

    // Auto-drift: if the user hasn't interacted for >3s, slowly turn the yaw
    const idleMs = performance.now() - lastInteraction.current;
    if (idleMs > 3000 && !dragging.current) {
      if (idleStart.current === 0) idleStart.current = performance.now();
      targetYaw.current += dt * 0.018;
    } else {
      idleStart.current = 0;
    }

    // Smooth follow
    yaw.current = THREE.MathUtils.damp(yaw.current, targetYaw.current, 10, dt);
    pitch.current = THREE.MathUtils.damp(pitch.current, targetPitch.current, 10, dt);
    fov.current = THREE.MathUtils.damp(fov.current, targetFov.current, 8, dt);

    // Apply to camera (camera positioned at origin, looking outward at a virtual sphere)
    const cy = Math.cos(yaw.current);
    const sy = Math.sin(yaw.current);
    const cp = Math.cos(pitch.current);
    const sp = Math.sin(pitch.current);
    const lookAt = new THREE.Vector3(sy * cp, sp, -cy * cp);
    camera.position.set(0, 0, 0);
    camera.lookAt(lookAt);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov.current;
      camera.updateProjectionMatrix();
    }
  });

  // Reset to the new station's initial view when the panorama changes
  const currentPoint = useTour((s) => s.currentPoint);
  useEffect(() => {
    const pt = getTourPoint(currentPoint);
    targetYaw.current = pt.initialYaw ?? 0;
    targetPitch.current = pt.initialPitch ?? -0.05;
    targetFov.current = pt.initialFov ?? 75;
  }, [currentPoint]);

  return null;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
