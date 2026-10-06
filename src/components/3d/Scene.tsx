import React, { Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { WorldSceneManager } from './WorldSceneManager';
import { FlyController } from './Character/FlyController';
import { CameraController } from './CameraController';
import { useGameStore } from '../../store/useGameStore';

const DynamicAtmosphereFog: React.FC = () => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const weather = useGameStore((state) => state.weather);

  const { fogColor, fogNear, fogFar } = React.useMemo(() => {
    let color = '#fed7aa'; // morning
    let near = 280;
    let far = 2800;

    if (weather === 'stormy') {
      color = '#1e293b';
      near = 120;
      far = 1400;
    } else if (weather === 'rainy') {
      color = '#334155';
      near = 160;
      far = 1800;
    } else if (weather === 'cloudy') {
      color = '#475569';
      near = 200;
      far = 2200;
    } else if (timeOfDay === 'morning') {
      color = '#fed7aa';
      near = 280;
      far = 2800;
    } else if (timeOfDay === 'afternoon') {
      color = '#93c5fd';
      near = 350;
      far = 3000;
    } else if (timeOfDay === 'evening') {
      color = '#c2410c';
      near = 250;
      far = 2600;
    } else { // night
      color = '#020617';
      near = 250;
      far = 2800;
    }

    return { fogColor: color, fogNear: near, fogFar: far };
  }, [timeOfDay, weather]);

  return (
    <>
      <color attach="background" args={[fogColor]} />
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
    </>
  );
};

export const Scene: React.FC = () => {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows={false}
        dpr={[1, 1.5]}
        camera={{
          position: [7.2, 6.2, 7.2],
          fov: 42,
          near: 0.1,
          far: 3800,
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        <DynamicAtmosphereFog />

        <Suspense fallback={null}>
          <CameraController />
          <WorldSceneManager />
          <FlyController />
        </Suspense>
      </Canvas>
    </div>
  );
};
