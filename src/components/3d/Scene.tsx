import React, { Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { BedroomEnvironment } from './Bedroom/BedroomEnvironment';
import { FlyController } from './Character/FlyController';
import { CameraController } from './CameraController';

export const Scene: React.FC = () => {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{
          position: [7.2, 6.2, 7.2],
          fov: 38,
          near: 0.1,
          far: 50,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        {/* Deep dark void color with subtle fog */}
        <color attach="background" args={['#080a0f']} />
        <fog attach="fog" args={['#080a0f', 12, 24]} />

        <Suspense fallback={null}>
          <CameraController />
          <BedroomEnvironment />
          <FlyController />
        </Suspense>
      </Canvas>
    </div>
  );
};
