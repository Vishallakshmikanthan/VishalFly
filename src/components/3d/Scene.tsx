import React, { Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { WorldSceneManager } from './WorldSceneManager';
import { FlyController } from './Character/FlyController';
import { CameraController } from './CameraController';

export const Scene: React.FC = () => {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{
          position: [7.2, 6.2, 7.2],
          fov: 42,
          near: 0.1,
          far: 450,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        {/* Atmospheric sky background with subtle distant fog */}
        <color attach="background" args={['#080a0f']} />
        <fog attach="fog" args={['#080a0f', 50, 320]} />

        <Suspense fallback={null}>
          <CameraController />
          <WorldSceneManager />
          <FlyController />
        </Suspense>
      </Canvas>
    </div>
  );
};
