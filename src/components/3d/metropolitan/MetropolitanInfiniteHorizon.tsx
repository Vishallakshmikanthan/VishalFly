import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../store/useGameStore';

/**
 * MetropolitanInfiniteHorizon:
 * Natural, sprawling horizon landscape framing Chennai City:
 * 1. Massive 3,200 x 3,200 Ground Landscape Foundation
 * 2. Eastern Coastal Waters of the Bay of Bengal meeting the sea horizon
 * 3. Western & Southern gentle rolling hills far in the distance
 * 4. Animated distant arterial highway light streams (headlights & taillights)
 * NO intrusive white or grey monolithic box rings!
 */
export const MetropolitanInfiniteHorizon: React.FC = () => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const isNightOrEvening = timeOfDay === 'night' || timeOfDay === 'evening';

  // -------------------------------------------------------------
  // ANIMATED DISTANT ARTERIAL HIGHWAY TRAFFIC TRAILS
  // -------------------------------------------------------------
  const trafficHeadlightsRef = useRef<THREE.Points>(null);
  const trafficTaillightsRef = useRef<THREE.Points>(null);

  const { headPositions, tailPositions } = useMemo(() => {
    const lightCount = 240;
    const hPos = new Float32Array(lightCount * 3);
    const tPos = new Float32Array(lightCount * 3);

    for (let i = 0; i < lightCount; i++) {
      const highwayId = i % 3;
      const progress = (i / lightCount) * 800 + 120;

      if (highwayId === 0) { // North (Towards Nellore / Madhavaram)
        hPos[i * 3] = -2.5; hPos[i * 3 + 1] = 0.5; hPos[i * 3 + 2] = -progress;
        tPos[i * 3] = 2.5; tPos[i * 3 + 1] = 0.5; tPos[i * 3 + 2] = -progress;
      } else if (highwayId === 1) { // South (GST Road towards Chengalpattu)
        hPos[i * 3] = 2.5; hPos[i * 3 + 1] = 0.5; hPos[i * 3 + 2] = progress + 25;
        tPos[i * 3] = -2.5; tPos[i * 3 + 1] = 0.5; tPos[i * 3 + 2] = progress + 25;
      } else { // West (Bengaluru Highway / NH48)
        hPos[i * 3] = -progress; hPos[i * 3 + 1] = 0.5; hPos[i * 3 + 2] = 25;
        tPos[i * 3] = -progress; tPos[i * 3 + 1] = 0.5; tPos[i * 3 + 2] = 20;
      }
    }
    return { headPositions: hPos, tailPositions: tPos };
  }, []);

  useFrame((_, delta) => {
    if (trafficHeadlightsRef.current && isNightOrEvening) {
      const hAttr = trafficHeadlightsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const tAttr = trafficTaillightsRef.current?.geometry.attributes.position as THREE.BufferAttribute;
      if (!hAttr || !tAttr) return;

      const hArr = hAttr.array as Float32Array;
      const tArr = tAttr.array as Float32Array;

      for (let i = 0; i < 240; i++) {
        const highwayId = i % 3;
        const speed = (32 + (i % 4) * 8) * delta;

        if (highwayId === 0) {
          hArr[i * 3 + 2] -= speed;
          if (hArr[i * 3 + 2] < -920) hArr[i * 3 + 2] = -120;
          tArr[i * 3 + 2] += speed;
          if (tArr[i * 3 + 2] > -120) tArr[i * 3 + 2] = -920;
        } else if (highwayId === 1) {
          hArr[i * 3 + 2] += speed;
          if (hArr[i * 3 + 2] > 920) hArr[i * 3 + 2] = 120;
          tArr[i * 3 + 2] -= speed;
          if (tArr[i * 3 + 2] < 120) tArr[i * 3 + 2] = 920;
        } else {
          hArr[i * 3] -= speed;
          if (hArr[i * 3] < -920) hArr[i * 3] = -120;
          tArr[i * 3] += speed;
          if (tArr[i * 3] > -120) tArr[i * 3] = -920;
        }
      }
      hAttr.needsUpdate = true;
      tAttr.needsUpdate = true;
    }
  });

  // -------------------------------------------------------------
  // DISTANT GENTLE HILLS ON FAR HORIZON (WEST & NORTH-WEST ONLY)
  // -------------------------------------------------------------
  const mountainSegments = useMemo(() => {
    const list: { pos: [number, number, number]; rotY: number; scale: [number, number, number]; color: string }[] = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      // Semi-circle on the West side only (angle from Math.PI * 0.6 to Math.PI * 1.4)
      const angle = Math.PI * 0.6 + (i / count) * (Math.PI * 0.8);
      const radius = 1100 + (i % 3) * 80;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const height = 120 + (Math.sin(i * 2.3) * 40) + 40;
      const width = 240 + (i % 3) * 50;
      const depth = 180 + (i % 2) * 40;

      list.push({
        pos: [x, height / 2 - 15, z],
        rotY: angle + Math.PI / 2,
        scale: [width, height, depth],
        color: '#1e293b',
      });
    }
    return list;
  }, []);

  return (
    <group name="MetropolitanInfiniteHorizon">
      {/* 1. Endless 3,200 x 3,200 Ground Landscape Foundation */}
      <mesh position={[0, -0.15, 25]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3200, 3200]} />
        <meshStandardMaterial color="#090d16" roughness={0.96} metalness={0.04} />
      </mesh>

      {/* 2. Extended Arterial Highways (North, South, West) */}
      <group position={[0, 0.005, 25]}>
        {/* Extended North-South Highway (GST / NH16) */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14, 1800]} />
          <meshStandardMaterial color="#0f172a" roughness={0.85} />
        </mesh>

        {/* Extended Westbound Super Highway (NH48 to Bengaluru) */}
        <mesh position={[-650, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1300, 14]} />
          <meshStandardMaterial color="#0f172a" roughness={0.85} />
        </mesh>
      </group>

      {/* 3. Animated Highway Headlights & Taillights (Visible Dusk/Night) */}
      {isNightOrEvening && (
        <group>
          {/* Headlights (Warm White / Golden) */}
          <points ref={trafficHeadlightsRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[headPositions, 3]}
              />
            </bufferGeometry>
            <pointsMaterial
              size={4.0}
              color="#fef08a"
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          </points>

          {/* Taillights (Ruby Red) */}
          <points ref={trafficTaillightsRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[tailPositions, 3]}
              />
            </bufferGeometry>
            <pointsMaterial
              size={3.8}
              color="#ef4444"
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          </points>
        </group>
      )}

      {/* 4. Distant Low-Poly Western Hills Rim (Far Horizon) */}
      <group name="HorizonWesternHills">
        {mountainSegments.map((m, idx) => (
          <mesh
            key={`mountain-${idx}`}
            position={m.pos}
            rotation={[0, m.rotY, 0]}
            scale={m.scale}
          >
            <coneGeometry args={[1, 1, 5]} />
            <meshStandardMaterial
              color={m.color}
              roughness={0.95}
              metalness={0.05}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
