import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../store/useGameStore';

interface PedestrianDef {
  id: string;
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  speed: number;
  shirtColor: string;
  pantsColor: string;
}

/**
 * MetropolitanPedestrians:
 * Dynamic human agents roaming across the city:
 * - Walking along sidewalks, zebra crosswalks, lake park paths, and mall plaza
 * - Natural bobbing gait animation computed smoothly on GPU/frame loop
 */
export const MetropolitanPedestrians: React.FC = () => {
  const visible = useGameStore((state) => state.metropolitanLayers.people);

  const pedestrians: PedestrianDef[] = [
    // Crosswalk Pedestrians
    { id: 'p1', startX: -8, startZ: 22, endX: 8, endZ: 22, speed: 1.8, shirtColor: '#ef4444', pantsColor: '#1e293b' },
    { id: 'p2', startX: 8, startZ: 32, endX: -8, endZ: 32, speed: 2.1, shirtColor: '#3b82f6', pantsColor: '#334155' },
    // Sidewalk Strollers
    { id: 'p3', startX: -9.5, startZ: -30, endX: -9.5, endZ: 10, speed: 1.5, shirtColor: '#10b981', pantsColor: '#0f172a' },
    { id: 'p4', startX: 9.5, startZ: 50, endX: 9.5, endZ: 10, speed: 1.7, shirtColor: '#f59e0b', pantsColor: '#1e293b' },
    { id: 'p5', startX: 9.5, startZ: 20, endX: 9.5, endZ: 60, speed: 1.6, shirtColor: '#8b5cf6', pantsColor: '#475569' },
    // Mall Plaza Visitors
    { id: 'p6', startX: -14, startZ: 12, endX: -2, endZ: 12, speed: 1.4, shirtColor: '#ec4899', pantsColor: '#1e293b' },
    { id: 'p7', startX: -5, startZ: 14, endX: -15, endZ: 14, speed: 1.9, shirtColor: '#06b6d4', pantsColor: '#334155' },
    // Lake Park Walkers
    { id: 'p8', startX: 25, startZ: 8, endX: 45, endZ: 15, speed: 1.3, shirtColor: '#e11d48', pantsColor: '#0f172a' },
    { id: 'p9', startX: 45, startZ: 20, endX: 35, endZ: 35, speed: 1.4, shirtColor: '#15803d', pantsColor: '#334155' },
    { id: 'p10', startX: 30, startZ: 32, endX: 20, endZ: 18, speed: 1.5, shirtColor: '#d97706', pantsColor: '#1e293b' },
    // Near Gym Entrance
    { id: 'p11', startX: -22, startZ: 18, endX: -28, endZ: 18, speed: 2.0, shirtColor: '#2563eb', pantsColor: '#09090b' },
    // Near Hospital Entrance
    { id: 'p12', startX: 32, startZ: 68, endX: 42, endZ: 68, speed: 1.6, shirtColor: '#f8fafc', pantsColor: '#1e293b' },
  ];

  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const progressRefs = useRef<number[]>(pedestrians.map((_, i) => (i * 0.15) % 1.0));
  const dirRefs = useRef<number[]>(pedestrians.map(() => 1));

  useFrame((state, delta) => {
    if (!visible) return;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < pedestrians.length; i++) {
      const p = pedestrians[i];
      const grp = groupRefs.current[i];
      if (!grp) continue;

      // Update progress
      progressRefs.current[i] += (p.speed * 0.05 * delta) * dirRefs.current[i];
      if (progressRefs.current[i] >= 1.0) {
        progressRefs.current[i] = 1.0;
        dirRefs.current[i] = -1;
      } else if (progressRefs.current[i] <= 0.0) {
        progressRefs.current[i] = 0.0;
        dirRefs.current[i] = 1;
      }

      const t = progressRefs.current[i];
      const posX = THREE.MathUtils.lerp(p.startX, p.endX, t);
      const posZ = THREE.MathUtils.lerp(p.startZ, p.endZ, t);

      // Subtle natural walking bob
      const bobY = Math.abs(Math.sin(time * 6.0 + i)) * 0.08;

      grp.position.set(posX, 0.15 + bobY, posZ);

      // Face direction of travel
      const targetAngle = dirRefs.current[i] === 1
        ? Math.atan2(p.endX - p.startX, p.endZ - p.startZ)
        : Math.atan2(p.startX - p.endX, p.startZ - p.endZ);
      grp.rotation.y = targetAngle;
    }
  });

  if (!visible) return null;

  return (
    <group name="MetropolitanPedestrians">
      {pedestrians.map((p, idx) => (
        <group
          key={p.id}
          ref={(el) => {
            groupRefs.current[idx] = el;
          }}
          position={[p.startX, 0.15, p.startZ]}
        >
          {/* Head & Hair */}
          <mesh position={[0, 1.55, 0]} castShadow>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#fed7aa" roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.68, -0.02]}>
            <sphereGeometry args={[0.19, 8, 8]} />
            <meshStandardMaterial color="#1c1917" roughness={0.9} />
          </mesh>

          {/* Torso / Shirt */}
          <mesh position={[0, 1.15, 0]} castShadow>
            <boxGeometry args={[0.42, 0.55, 0.24]} />
            <meshStandardMaterial color={p.shirtColor} roughness={0.6} />
          </mesh>

          {/* Left & Right Legs / Pants */}
          {[-0.1, 0.1].map((lx, li) => (
            <mesh key={`leg-${li}`} position={[lx, 0.45, 0]} castShadow>
              <boxGeometry args={[0.16, 0.85, 0.18]} />
              <meshStandardMaterial color={p.pantsColor} roughness={0.8} />
            </mesh>
          ))}

          {/* Shoes */}
          {[-0.1, 0.1].map((sx, si) => (
            <mesh key={`shoe-${si}`} position={[sx, 0.04, 0.05]}>
              <boxGeometry args={[0.16, 0.08, 0.24]} />
              <meshStandardMaterial color="#09090b" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};
