import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { OrbitControls } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import { LOCATIONS, LOCATION_WORLD_OFFSETS } from '../../navigation/locationGraph';

export const CameraController: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  const cameraMode = useGameStore((state) => state.cameraMode);
  const resetCameraTrigger = useGameStore((state) => state.resetCameraTrigger);
  const followFly = useGameStore((state) => state.followFly);
  const flyPosition = useGameStore((state) => state.flyPosition);
  const currentLocation = useGameStore((state) => state.currentLocation);

  const locConfig = LOCATIONS[currentLocation] || LOCATIONS.metropolitan;
  const initOffset = LOCATION_WORLD_OFFSETS[currentLocation] || [0, 0, 0];

  // Target coordinates for active location
  const defaultPos = useRef(new THREE.Vector3(
    locConfig.camera.position[0] + initOffset[0],
    locConfig.camera.position[1] + initOffset[1],
    locConfig.camera.position[2] + initOffset[2]
  ));
  const defaultTarget = useRef(new THREE.Vector3(
    locConfig.camera.target[0] + initOffset[0],
    locConfig.camera.target[1] + initOffset[1],
    locConfig.camera.target[2] + initOffset[2]
  ));

  const isResetting = useRef(false);
  const resetProgress = useRef(0);

  // Update target coordinates whenever location changes
  useEffect(() => {
    const active = LOCATIONS[currentLocation] || LOCATIONS.metropolitan;
    const offset = LOCATION_WORLD_OFFSETS[currentLocation] || [0, 0, 0];
    defaultPos.current.set(
      active.camera.position[0] + offset[0],
      active.camera.position[1] + offset[1],
      active.camera.position[2] + offset[2]
    );
    defaultTarget.current.set(
      active.camera.target[0] + offset[0],
      active.camera.target[1] + offset[1],
      active.camera.target[2] + offset[2]
    );
    isResetting.current = true;
    resetProgress.current = 0;
  }, [currentLocation]);

  const customCameraPose = useGameStore((state) => state.customCameraPose);

  // When custom station perspective is selected from room interface
  useEffect(() => {
    if (customCameraPose) {
      defaultPos.current.set(...customCameraPose.pos);
      defaultTarget.current.set(...customCameraPose.target);
      isResetting.current = true;
      resetProgress.current = 0;
    }
  }, [customCameraPose]);

  // When manual reset is triggered from HUD or keyboard
  useEffect(() => {
    if (resetCameraTrigger > 0) {
      isResetting.current = true;
      resetProgress.current = 0;
    }
  }, [resetCameraTrigger]);

  // Global 'R' key for quick camera reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'KeyR') {
        isResetting.current = true;
        resetProgress.current = 0;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    if (cameraMode === 'follow' || followFly) {
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
      minDistance={2.0}
      maxDistance={750.0}
      minPolarAngle={0.05}
      maxPolarAngle={Math.PI / 2.02} // Keep above ground
      autoRotate={cameraMode === 'orbit'}
      autoRotateSpeed={0.8}
      target={[
        locConfig.camera.target[0] + initOffset[0],
        locConfig.camera.target[1] + initOffset[1],
        locConfig.camera.target[2] + initOffset[2],
      ]}
    />
  );
};
