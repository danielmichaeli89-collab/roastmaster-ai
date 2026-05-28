import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTour } from '../../store';
import { getTourPoint } from '../../data/tour-points';

const tmpVec = new THREE.Vector3();
const startCam = new THREE.Vector3();
const startTarget = new THREE.Vector3();
const endCam = new THREE.Vector3();
const endTarget = new THREE.Vector3();

// Smooth easing
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function TourCamera() {
  const { camera } = useThree();
  const currentPoint = useTour((s) => s.currentPoint);
  const hasStarted = useTour((s) => s.hasStarted);
  const cinematicMode = useTour((s) => s.cinematicMode);
  const setTransitioning = useTour((s) => s.setTransitioning);

  const target = useRef(new THREE.Vector3(0, 1.4, 0));
  const transitionT = useRef(1); // 0..1, 1 = settled
  const transitionDuration = useRef(2.4);
  const transitioning = useRef(false);
  const lastPoint = useRef(currentPoint);
  const time = useRef(0);

  useEffect(() => {
    const pt = getTourPoint(currentPoint);
    if (!hasStarted) {
      // Position camera but don't animate yet — wait for start
      camera.position.set(pt.camera[0], pt.camera[1], pt.camera[2]);
      target.current.set(pt.target[0], pt.target[1], pt.target[2]);
      camera.lookAt(target.current);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = pt.fov;
        camera.updateProjectionMatrix();
      }
      return;
    }

    // Begin transition
    if (lastPoint.current !== currentPoint || transitionT.current < 1) {
      startCam.copy(camera.position);
      startTarget.copy(target.current);
      endCam.set(pt.camera[0], pt.camera[1], pt.camera[2]);
      endTarget.set(pt.target[0], pt.target[1], pt.target[2]);
      transitionT.current = 0;
      transitioning.current = true;
      setTransitioning(true);
      lastPoint.current = currentPoint;
    }
  }, [currentPoint, hasStarted, camera, setTransitioning]);

  useFrame((_, dt) => {
    time.current += dt;
    const pt = getTourPoint(currentPoint);

    if (transitioning.current) {
      transitionT.current = Math.min(1, transitionT.current + dt / transitionDuration.current);
      const e = easeInOutCubic(transitionT.current);
      camera.position.lerpVectors(startCam, endCam, e);
      target.current.lerpVectors(startTarget, endTarget, e);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, pt.fov, e * 0.6);
        camera.updateProjectionMatrix();
      }

      if (transitionT.current >= 1) {
        transitioning.current = false;
        setTransitioning(false);
      }
    }

    // Cinematic float — subtle camera breathing when settled
    if (cinematicMode) {
      const t = time.current;
      const floatY = Math.sin(t * 0.4) * 0.012;
      const floatX = Math.cos(t * 0.27) * 0.008;
      const floatZ = Math.sin(t * 0.33 + 1.2) * 0.006;
      tmpVec.set(
        (transitioning.current ? endCam.x : pt.camera[0]) + floatX,
        (transitioning.current ? endCam.y : pt.camera[1]) + floatY,
        (transitioning.current ? endCam.z : pt.camera[2]) + floatZ
      );
      if (!transitioning.current) {
        camera.position.lerp(tmpVec, 0.04);
      }
    }

    camera.lookAt(target.current);
  });

  return null;
}
