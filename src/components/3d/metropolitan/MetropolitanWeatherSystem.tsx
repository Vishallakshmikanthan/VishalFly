import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../store/useGameStore';

/**
 * MetropolitanWeatherSystem:
 * Hollywood-grade dynamic weather effects:
 * 1. Cascading angled Rain Streaks (2,400+ rain particles with realistic terminal velocity)
 * 2. Ground Rain Splash Ripples & Road Surface Mist
 * 3. Atmospheric Storm Thunder Lightning Flash System (multi-pulse ambient bursts)
 * 4. Wet asphalt road specular reflection sheen
 */

export const MetropolitanWeatherSystem: React.FC = () => {
  const weather = useGameStore((state) => state.weather);

  const isRaining = weather === 'rainy' || weather === 'stormy';
  const isStormy = weather === 'stormy';

  // -------------------------------------------------------------
  // 1. DYNAMIC CASCADING RAIN STREAKS
  // -------------------------------------------------------------
  const rainLinesRef = useRef<THREE.LineSegments>(null);
  const rainCount = isStormy ? 3200 : 2000;

  // Particle positions (start and end points for lines)
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(rainCount * 2 * 3); // 2 vertices per line streak
    const vels = new Float32Array(rainCount);

    for (let i = 0; i < rainCount; i++) {
      const x = (Math.random() - 0.5) * 360;
      const y = Math.random() * 110 + 2;
      const z = (Math.random() - 0.5) * 360 + 25;
      const len = 1.4 + Math.random() * 1.2;

      // Vertex 0: Top of raindrop streak
      pos[i * 6] = x;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = z;

      // Vertex 1: Bottom of raindrop streak (angled with wind)
      pos[i * 6 + 3] = x - 0.2;
      pos[i * 6 + 4] = y - len;
      pos[i * 6 + 5] = z - 0.15;

      vels[i] = 75 + Math.random() * 45; // Terminal velocity
    }

    return { positions: pos, velocities: vels };
  }, [rainCount]);

  // -------------------------------------------------------------
  // 2. GROUND SPLASH RIPPLES
  // -------------------------------------------------------------
  const splashCount = 120;
  const splashMeshRef = useRef<THREE.InstancedMesh>(null);
  const splashMatrix = useMemo(() => new THREE.Matrix4(), []);
  const splashData = useMemo(() => {
    return Array.from({ length: splashCount }).map(() => ({
      x: (Math.random() - 0.5) * 220,
      z: (Math.random() - 0.5) * 220 + 25,
      y: 0.05,
      scale: 0.1,
      maxScale: 0.6 + Math.random() * 0.5,
      speed: 2.2 + Math.random() * 2.0,
      alpha: 1.0,
    }));
  }, [splashCount]);

  // -------------------------------------------------------------
  // 3. LIGHTNING FLASH EFFECT (STORMY WEATHER)
  // -------------------------------------------------------------
  const lightningLightRef = useRef<THREE.PointLight>(null);
  const lightningTimer = useRef(0);
  const isFlashing = useRef(false);
  const flashFlicker = useRef(0);

  useFrame((_, delta) => {
    // A. Update Rain Streaks
    if (rainLinesRef.current && isRaining) {
      const posAttr = rainLinesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < rainCount; i++) {
        const fall = velocities[i] * delta;
        // Drop both top and bottom vertices
        arr[i * 6 + 1] -= fall;
        arr[i * 6 + 4] -= fall;

        // Wind drift
        arr[i * 6] -= fall * 0.15;
        arr[i * 6 + 3] -= fall * 0.15;

        // Reset to top once hitting the ground
        if (arr[i * 6 + 4] < 0.0) {
          const newX = (Math.random() - 0.5) * 360;
          const newZ = (Math.random() - 0.5) * 360 + 25;
          const newY = 100 + Math.random() * 20;
          const len = 1.4 + Math.random() * 1.2;

          arr[i * 6] = newX;
          arr[i * 6 + 1] = newY;
          arr[i * 6 + 2] = newZ;

          arr[i * 6 + 3] = newX - 0.2;
          arr[i * 6 + 4] = newY - len;
          arr[i * 6 + 5] = newZ - 0.15;
        }
      }
      posAttr.needsUpdate = true;
    }

    // B. Update Ground Splash Ripples
    if (splashMeshRef.current && isRaining) {
      splashData.forEach((s, idx) => {
        s.scale += delta * s.speed;
        if (s.scale >= s.maxScale) {
          // Reset splash ripple at random ground coordinate
          s.x = (Math.random() - 0.5) * 220;
          s.z = (Math.random() - 0.5) * 220 + 25;
          s.scale = 0.05;
        }

        splashMatrix.makeTranslation(s.x, s.y, s.z);
        splashMatrix.scale(new THREE.Vector3(s.scale, 0.02, s.scale));
        splashMeshRef.current?.setMatrixAt(idx, splashMatrix);
      });
      splashMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // C. Lightning Bolt Flash Timing
    if (isStormy && lightningLightRef.current) {
      lightningTimer.current += delta;
      if (lightningTimer.current > 4.5 && !isFlashing.current) {
        // Trigger lightning burst
        if (Math.random() > 0.4) {
          isFlashing.current = true;
          flashFlicker.current = 0;
          lightningTimer.current = 0;
          lightningLightRef.current.position.set(
            (Math.random() - 0.5) * 200,
            120,
            (Math.random() - 0.5) * 200
          );
        } else {
          lightningTimer.current = 2.0; // Retry soon
        }
      }

      if (isFlashing.current) {
        flashFlicker.current += delta;
        // Hollywood cinematic 3-stage lightning flicker
        if (flashFlicker.current < 0.06) {
          lightningLightRef.current.intensity = 4.8;
        } else if (flashFlicker.current < 0.1) {
          lightningLightRef.current.intensity = 0.5;
        } else if (flashFlicker.current < 0.18) {
          lightningLightRef.current.intensity = 6.2;
        } else {
          lightningLightRef.current.intensity = 0.0;
          isFlashing.current = false;
        }
      } else {
        lightningLightRef.current.intensity = 0.0;
      }
    }
  });

  if (!isRaining) return null;

  return (
    <group name="WeatherSystem_RainAndStorm">
      {/* 1. Cascading Rain Streaks */}
      <lineSegments ref={rainLinesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#93c5fd"
          transparent
          opacity={isStormy ? 0.65 : 0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* 2. Ground Rain Splash Rings */}
      <instancedMesh
        ref={splashMeshRef}
        args={[undefined, undefined, splashCount]}
      >
        <ringGeometry args={[0.2, 0.45, 12]} />
        <meshBasicMaterial
          color="#94a3b8"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </instancedMesh>

      {/* 3. Wet Asphalt Puddle Sheen Layer */}
      <mesh position={[0, 0.015, 25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 170]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.08}
          metalness={0.85}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* 4. Thunder Lightning Point Light */}
      <pointLight
        ref={lightningLightRef}
        position={[0, 120, 0]}
        color="#bae6fd"
        intensity={0.0}
        distance={900}
        decay={1.2}
      />
    </group>
  );
};
