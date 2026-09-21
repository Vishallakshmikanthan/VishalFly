import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * LightingRig component:
 * - Directional sunlight casting soft shadows (PCFSoftShadowMap)
 * - Ambient & hemisphere fill to maintain readability of dark charcoal walls
 * - Dynamic light preset responsiveness (dawn, afternoon, warm_night)
 */
export const LightingRig: React.FC = () => {
  const lightingPreset = useGameStore((state) => state.lightingPreset);

  const configs = {
    dawn: {
      sunColor: '#fed7aa', // Warm pale peach/golden sunrise
      sunIntensity: 1.8,
      sunPos: [6, 7, -6] as [number, number, number],
      ambientColor: '#38bdf8', // Cool morning twilight fill
      ambientIntensity: 0.45,
      hemiSky: '#fed7aa',
      hemiGround: '#0f172a',
      hemiIntensity: 0.5,
    },
    afternoon: {
      sunColor: '#ffffff',
      sunIntensity: 2.2,
      sunPos: [5, 9, 3] as [number, number, number],
      ambientColor: '#f1f5f9',
      ambientIntensity: 0.6,
      hemiSky: '#bae6fd',
      hemiGround: '#334155',
      hemiIntensity: 0.55,
    },
    warm_night: {
      sunColor: '#1e1b4b', // Deep indigo moonlight outside
      sunIntensity: 0.4,
      sunPos: [4, 6, -5] as [number, number, number],
      ambientColor: '#0f172a',
      ambientIntensity: 0.25,
      hemiSky: '#312e81',
      hemiGround: '#020617',
      hemiIntensity: 0.3,
    },
  };

  const current = configs[lightingPreset] || configs.dawn;

  return (
    <group name="LightingRig">
      {/* 1. Main Directional Light with Soft Shadows */}
      <directionalLight
        position={current.sunPos}
        color={current.sunColor}
        intensity={current.sunIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0008}
      />

      {/* 2. Hemisphere Light for Natural Atmosphere */}
      <hemisphereLight
        color={current.hemiSky}
        groundColor={current.hemiGround}
        intensity={current.hemiIntensity}
      />

      {/* 3. Subtle Ambient Light Fill */}
      <ambientLight
        color={current.ambientColor}
        intensity={current.ambientIntensity}
      />

      {/* 4. Ceiling Subtle Bounce / Room Mood Fill */}
      <pointLight
        position={[0, 3.8, 0]}
        color="#ffedd5"
        intensity={0.6}
        distance={8}
        decay={2}
      />
    </group>
  );
};
