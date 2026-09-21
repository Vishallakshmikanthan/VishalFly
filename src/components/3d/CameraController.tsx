import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { OrbitControls } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';

export const CameraController: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  const resetCameraTrigger = useGameStore((state) => state.resetCameraTrigger);
  const followFly = useGameStore((state) => state.followFly);
  const flyPosition = useGameStore((state) => state.flyPosition);

  // Default isometric three-quarter coordinates
  const defaultPos = useRef(new THREE.Vector3(7.2, 6.2, 7.2));
  const defaultTarget = useRef(new THREE.Vector3(0, 1.2, 0));

  const isResetting = useRef(false);
  const resetProgress = useRef(0);

  // When reset is triggered from HUD or keyboard
  useEffect(() => {
    if (resetCameraTrigger > 0) {
      isResetting.current = true;
      resetProgress.current = 0;
    }
  }, [resetCameraTrigger]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Smooth reset animation
    if (isResetting.current) {
      resetProgress.current += delta * 2.5; // Complete in ~0.4s
      const alpha = Math.min(resetProgress.current, 1);

      camera.position.lerp(defaultPos.current, 0.14);
      controls.target.lerp(defaultTarget.current, 0.14);
      controls.update();

      if (alpha >= 1 || camera.position.distanceTo(defaultPos.current) < 0.05) {
        isResetting.current = false;
        camera.position.copy(defaultPos.current);
        controls.target.copy(defaultTarget.current);
        controls.update();
      }
      return;
    }

    // Follow Fly mode
    if (followFly) {
      const targetFly = new THREE.Vector3(flyPosition[0], flyPosition[1], flyPosition[2]);
      controls.target.lerp(targetFly, delta * 3.5);
      controls.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      minDistance={2.8}
      maxDistance={16.0}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2.06} // Keep above floor
      target={[0, 1.2, 0]}
    />
  );
};
