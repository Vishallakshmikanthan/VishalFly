import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../store/useGameStore';
import { getTimeOfDayLighting } from './worldTheme';

interface TimeOfDayLightingProps {
  isInterior?: boolean;
  accentColor?: string;
}

/**
 * TimeOfDayLighting:
 * Dynamically derives sun position, color, intensity, and atmospheric fill
 * directly from the simulation clock (00:00 - 23:59).
 * Smoothly interpolates lighting across Dawn, Midday, Golden Hour, and Night.
 */
export const TimeOfDayLighting: React.FC<TimeOfDayLightingProps> = ({
  isInterior = false,
  accentColor,
}) => {
  const simulationClock = useGameStore((state) => state.simulationClock);
  const currentMinutes = simulationClock.currentMinutes;

  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);

  const lighting = getTimeOfDayLighting(currentMinutes);

  useFrame((_, delta) => {
    const lerpFactor = Math.min(delta * 4, 1);

    if (sunRef.current) {
      // Lerp sun position
      sunRef.current.position.lerp(
        new THREE.Vector3(...lighting.sunPosition),
        lerpFactor
      );
      // Lerp sun color & intensity
      sunRef.current.color.lerp(new THREE.Color(lighting.sunColor), lerpFactor);
      const targetIntensity = isInterior
        ? Math.max(0.6, lighting.sunIntensity * 0.75)
        : lighting.sunIntensity;
      sunRef.current.intensity = THREE.MathUtils.lerp(
        sunRef.current.intensity,
        targetIntensity,
        lerpFactor
      );
    }

    if (ambientRef.current) {
      ambientRef.current.color.lerp(
        new THREE.Color(lighting.ambientColor),
        lerpFactor
      );
      const targetAmb = isInterior
        ? Math.max(0.55, lighting.ambientIntensity * 1.1)
        : lighting.ambientIntensity;
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        targetAmb,
        lerpFactor
      );
    }

    if (hemiRef.current) {
      hemiRef.current.color.lerp(new THREE.Color(lighting.skyColor), lerpFactor);
    }
  });

  return (
    <group name="TimeOfDayLightingRig">
      {/* 1. Global Ambient Fill */}
      <ambientLight
        ref={ambientRef}
        color={lighting.ambientColor}
        intensity={isInterior ? 0.65 : lighting.ambientIntensity}
      />

      {/* 2. Sky/Ground Hemisphere Light */}
      <hemisphereLight
        ref={hemiRef}
        color={lighting.skyColor}
        groundColor={isInterior ? '#1e232a' : '#14532d'}
        intensity={0.45}
      />

      {/* 3. Primary Sun / Moon Directional Light with Shadows */}
      <directionalLight
        ref={sunRef}
        position={[...lighting.sunPosition]}
        color={lighting.sunColor}
        intensity={isInterior ? 0.9 : lighting.sunIntensity}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={32}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0006}
      />

      {/* 4. Optional Accent/Interior Warm Glow */}
      {accentColor && (
        <pointLight
          position={[0, 3.2, 0]}
          color={accentColor}
          intensity={0.65}
          distance={8}
          decay={2}
        />
      )}
    </group>
  );
};
