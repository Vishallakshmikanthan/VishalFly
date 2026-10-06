import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../store/useGameStore';

interface VehicleDef {
  type: 'sedan' | 'taxi' | 'bus' | 'van';
  color: string;
  speed: number;
  laneX: number;
  initialZ: number;
  direction: 1 | -1;
}

/**
 * MetropolitanTraffic:
 * Dynamic moving traffic system with cars, yellow taxis, transit buses, and delivery vans
 * smoothly cruising down multi-lane boulevards:
 * - 60 FPS buttery-smooth frame updates without memory allocations
 * - Front glowing headlights & rear red taillights
 */
export const MetropolitanTraffic: React.FC = () => {
  const visible = useGameStore((state) => state.metropolitanLayers.vehicles);

  // Vehicle fleet definition
  const vehicleDefs: VehicleDef[] = [
    // Northbound Lanes (Direction 1, laneX > 0)
    { type: 'sedan', color: '#2563eb', speed: 14, laneX: 2.8, initialZ: -60, direction: 1 },
    { type: 'taxi', color: '#eab308', speed: 16, laneX: 5.4, initialZ: -35, direction: 1 },
    { type: 'bus', color: '#e11d48', speed: 11, laneX: 2.8, initialZ: 10, direction: 1 },
    { type: 'sedan', color: '#f8fafc', speed: 15, laneX: 5.4, initialZ: 30, direction: 1 },
    { type: 'van', color: '#64748b', speed: 13, laneX: 2.8, initialZ: 65, direction: 1 },

    // Southbound Lanes (Direction -1, laneX < 0)
    { type: 'taxi', color: '#eab308', speed: 16, laneX: -2.8, initialZ: 80, direction: -1 },
    { type: 'sedan', color: '#dc2626', speed: 15, laneX: -5.4, initialZ: 45, direction: -1 },
    { type: 'bus', color: '#e11d48', speed: 10, laneX: -2.8, initialZ: 15, direction: -1 },
    { type: 'sedan', color: '#10b981', speed: 14, laneX: -5.4, initialZ: -20, direction: -1 },
    { type: 'van', color: '#f59e0b', speed: 12, laneX: -2.8, initialZ: -50, direction: -1 },
  ];

  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const zPositions = useRef<number[]>(vehicleDefs.map((v) => v.initialZ));

  useFrame((_, delta) => {
    if (!visible) return;

    for (let i = 0; i < vehicleDefs.length; i++) {
      const v = vehicleDefs[i];
      const grp = groupRefs.current[i];
      if (!grp) continue;

      zPositions.current[i] += v.speed * delta * v.direction;

      // Loop boundaries
      if (v.direction === 1 && zPositions.current[i] > 105) {
        zPositions.current[i] = -75;
      } else if (v.direction === -1 && zPositions.current[i] < -75) {
        zPositions.current[i] = 105;
      }

      grp.position.z = zPositions.current[i];
    }
  });

  if (!visible) return null;

  return (
    <group name="MetropolitanTraffic">
      {vehicleDefs.map((veh, i) => {
        const isBus = veh.type === 'bus';
        const isTaxi = veh.type === 'taxi';
        const isVan = veh.type === 'van';

        const length = isBus ? 8.5 : isVan ? 5.2 : 4.4;
        const width = isBus ? 2.6 : 2.0;
        const height = isBus ? 2.4 : isVan ? 2.0 : 1.35;
        const yOffset = height / 2 + 0.2;

        return (
          <group
            key={`vehicle-${i}`}
            ref={(el) => {
              groupRefs.current[i] = el;
            }}
            position={[veh.laneX, 0, veh.initialZ]}
            rotation={[0, veh.direction === 1 ? 0 : Math.PI, 0]}
          >
            {/* Chassis Body */}
            <mesh position={[0, yOffset, 0]} castShadow>
              <boxGeometry args={[width, height, length]} />
              <meshStandardMaterial color={veh.color} roughness={0.4} metalness={0.3} />
            </mesh>

            {/* Cabin / Windows Roof */}
            {!isBus && (
              <mesh position={[0, yOffset + 0.45, -0.2]}>
                <boxGeometry args={[width * 0.9, height * 0.65, length * 0.55]} />
                <meshPhysicalMaterial
                  color="#38bdf8"
                  transmission={0.5}
                  roughness={0.1}
                  metalness={0.5}
                />
              </mesh>
            )}

            {/* Taxi Glowing Roof Sign */}
            {isTaxi && (
              <mesh position={[0, yOffset + 0.9, 0]}>
                <boxGeometry args={[0.7, 0.25, 0.4]} />
                <meshStandardMaterial
                  color="#fef08a"
                  emissive="#facc15"
                  emissiveIntensity={2.5}
                />
              </mesh>
            )}

            {/* Bus Windows Band */}
            {isBus && (
              <mesh position={[0, yOffset + 0.3, 0]}>
                <boxGeometry args={[width + 0.04, 0.75, length * 0.9]} />
                <meshPhysicalMaterial color="#38bdf8" transmission={0.6} opacity={0.5} transparent />
              </mesh>
            )}

            {/* Dual Front Headlights (Yellow/White Glow) */}
            {[-width * 0.35, width * 0.35].map((hx, hi) => (
              <mesh key={`headlight-${hi}`} position={[hx, 0.5, length / 2 + 0.02]}>
                <sphereGeometry args={[0.16, 8, 8]} />
                <meshStandardMaterial
                  color="#fef08a"
                  emissive="#fef08a"
                  emissiveIntensity={3.5}
                />
              </mesh>
            ))}

            {/* Dual Rear Tail Lights (Red Glow) */}
            {[-width * 0.35, width * 0.35].map((tx, ti) => (
              <mesh key={`taillight-${ti}`} position={[tx, 0.55, -length / 2 - 0.02]}>
                <sphereGeometry args={[0.14, 8, 8]} />
                <meshStandardMaterial
                  color="#ef4444"
                  emissive="#ef4444"
                  emissiveIntensity={3.0}
                />
              </mesh>
            ))}

            {/* 4 Rubber Wheels */}
            {[
              [-width / 2, -length * 0.3],
              [width / 2, -length * 0.3],
              [-width / 2, length * 0.3],
              [width / 2, length * 0.3],
            ].map(([wx, wz], wi) => (
              <mesh key={`wheel-${wi}`} position={[wx, 0.35, wz]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.35, 0.35, 0.25, 12]} />
                <meshStandardMaterial color="#09090b" roughness={0.9} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
};
