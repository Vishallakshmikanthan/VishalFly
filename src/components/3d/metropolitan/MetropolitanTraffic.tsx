import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../store/useGameStore';

interface VehicleDef {
  type: 'sedan' | 'taxi' | 'bus' | 'van' | 'auto';
  color: string;
  speed: number;
  laneX: number;
  initialZ: number;
  direction: 1 | -1;
}

/**
 * MetropolitanTraffic:
 * Dynamic moving traffic system featuring cars, Chennai Yellow & Black Auto-Rickshaws,
 * MTC Chennai Red Transit Buses, and delivery vehicles:
 * - Smooth frame updates with zero runtime garbage collection
 * - Front glowing headlights & rear red taillights
 */
export const MetropolitanTraffic: React.FC = () => {
  const visible = useGameStore((state) => state.metropolitanLayers.vehicles);

  // Vehicle fleet definition including iconic Chennai Auto-Rickshaws
  const vehicleDefs: VehicleDef[] = [
    // Northbound Lanes (Direction 1, laneX > 0)
    { type: 'auto', color: '#facc15', speed: 13, laneX: 6.2, initialZ: -65, direction: 1 },
    { type: 'sedan', color: '#2563eb', speed: 15, laneX: 2.8, initialZ: -45, direction: 1 },
    { type: 'bus', color: '#dc2626', speed: 10, laneX: 2.8, initialZ: -10, direction: 1 }, // MTC Red Bus
    { type: 'auto', color: '#facc15', speed: 14, laneX: 6.2, initialZ: 15, direction: 1 },
    { type: 'taxi', color: '#eab308', speed: 16, laneX: 5.4, initialZ: 35, direction: 1 },
    { type: 'sedan', color: '#f8fafc', speed: 15, laneX: 2.8, initialZ: 60, direction: 1 },
    { type: 'van', color: '#64748b', speed: 13, laneX: 5.4, initialZ: 85, direction: 1 },

    // Southbound Lanes (Direction -1, laneX < 0)
    { type: 'auto', color: '#facc15', speed: 13, laneX: -6.2, initialZ: 95, direction: -1 },
    { type: 'taxi', color: '#eab308', speed: 16, laneX: -2.8, initialZ: 75, direction: -1 },
    { type: 'bus', color: '#dc2626', speed: 10, laneX: -2.8, initialZ: 40, direction: -1 }, // MTC Red Bus
    { type: 'sedan', color: '#dc2626', speed: 15, laneX: -5.4, initialZ: 15, direction: -1 },
    { type: 'auto', color: '#facc15', speed: 14, laneX: -6.2, initialZ: -15, direction: -1 },
    { type: 'sedan', color: '#10b981', speed: 14, laneX: -5.4, initialZ: -40, direction: -1 },
    { type: 'van', color: '#f59e0b', speed: 12, laneX: -2.8, initialZ: -65, direction: -1 },
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
        const isAuto = veh.type === 'auto';

        const length = isBus ? 9.2 : isVan ? 5.2 : isAuto ? 2.5 : 4.4;
        const width = isBus ? 2.6 : isAuto ? 1.4 : 2.0;
        const height = isBus ? 2.5 : isVan ? 2.0 : isAuto ? 1.6 : 1.35;
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
            {/* 1. CHENNAI AUTO-RICKSHAW GEOMETRY */}
            {isAuto ? (
              <group position={[0, 0, 0]}>
                {/* Yellow Curved Canopy */}
                <mesh position={[0, 1.15, -0.1]} castShadow>
                  <boxGeometry args={[1.35, 0.7, 1.8]} />
                  <meshStandardMaterial color="#facc15" roughness={0.3} />
                </mesh>
                {/* Black Lower Body Chassis */}
                <mesh position={[0, 0.55, 0]} castShadow>
                  <boxGeometry args={[1.4, 0.55, 2.3]} />
                  <meshStandardMaterial color="#090d16" roughness={0.8} />
                </mesh>
                {/* Single Front Center Wheel */}
                <mesh position={[0, 0.25, 0.85]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.25, 0.25, 0.18, 10]} />
                  <meshStandardMaterial color="#18181b" />
                </mesh>
                {/* Dual Rear Wheels */}
                {[-0.62, 0.62].map((wx, wi) => (
                  <mesh key={`auto-w-${wi}`} position={[wx, 0.25, -0.65]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.25, 0.25, 0.18, 10]} />
                    <meshStandardMaterial color="#18181b" />
                  </mesh>
                ))}
                {/* Single Bright Front Center Headlight */}
                <mesh position={[0, 0.6, 1.18]}>
                  <sphereGeometry args={[0.16, 8, 8]} />
                  <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3.5} />
                </mesh>
                {/* Rear Red Tail Lights */}
                {[-0.5, 0.5].map((tx, ti) => (
                  <mesh key={`auto-t-${ti}`} position={[tx, 0.6, -1.16]}>
                    <sphereGeometry args={[0.1, 6, 6]} />
                    <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.0} />
                  </mesh>
                ))}
              </group>
            ) : (
              /* 2. STANDARD CAR, BUS, VAN GEOMETRY */
              <>
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
                  <mesh position={[0, yOffset + 0.35, 0]}>
                    <boxGeometry args={[width + 0.04, 0.8, length * 0.9]} />
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
              </>
            )}
          </group>
        );
      })}
    </group>
  );
};
