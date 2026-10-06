import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../store/useGameStore';

/**
 * MetropolitanTransit:
 * Elevated modern rail system matching reference image:
 * - Reinforced concrete pillars & elevated dual-track viaduct
 * - Multi-level modern elevated Metro Station with pedestrian skybridge & glass canopies
 * - Sleek articulated Blue & White Metro Train gliding along the elevated rail
 */
export const MetropolitanTransit: React.FC = () => {
  const visible = useGameStore((state) => state.metropolitanLayers.transit);
  const trainRef = useRef<THREE.Group>(null);
  const trainPos = useRef(0);

  // Animated Metro Train Movement
  useFrame((_, delta) => {
    if (!trainRef.current) return;
    // Glides back and forth along the viaduct
    trainPos.current += delta * 7.5;
    if (trainPos.current > 120) {
      trainPos.current = -50;
    }
    trainRef.current.position.z = trainPos.current;
  });

  if (!visible) return null;

  // Viaduct Pillar coordinates (along X: -18, extending Z: -60 to 90)
  const pillarZ = [-50, -32, -14, 4, 22, 40, 58, 76, 94];

  return (
    <group name="MetropolitanTransitSystem">
      {/* 1. ELEVATED CONCRETE VIADUCT */}
      <group position={[-18, 0, 22]}>
        {/* Support Concrete Columns (Pillars) */}
        {pillarZ.map((pz, idx) => (
          <group key={`viaduct-pillar-${idx}`} position={[0, 0, pz - 22]}>
            {/* Flared Concrete Footing */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <cylinderGeometry args={[1.1, 1.4, 1.0, 8]} />
              <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>
            {/* Pillar Shaft */}
            <mesh position={[0, 4.2, 0]} castShadow>
              <cylinderGeometry args={[0.9, 0.9, 6.4, 8]} />
              <meshStandardMaterial color="#475569" roughness={0.7} />
            </mesh>
            {/* T-Hammerhead Crossbeam Cap */}
            <mesh position={[0, 7.6, 0]} castShadow>
              <boxGeometry args={[6.4, 0.8, 2.2]} />
              <meshStandardMaterial color="#334155" roughness={0.7} />
            </mesh>
          </group>
        ))}

        {/* Elevated Deck & Concrete Track Bed */}
        <mesh position={[0, 8.2, 0]} receiveShadow>
          <boxGeometry args={[5.8, 0.4, 160]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>

        {/* Dual Steel Rails */}
        {[-1.6, -1.0, 1.0, 1.6].map((rx, ri) => (
          <mesh key={`steel-rail-${ri}`} position={[rx, 8.45, 0]}>
            <boxGeometry args={[0.1, 0.1, 158]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}

        {/* Outer Safety Parapet Walls with Accent Stripe */}
        {[-3.0, 3.0].map((wx, wi) => (
          <group key={`parapet-${wi}`} position={[wx, 8.8, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.2, 0.9, 160]} />
              <meshStandardMaterial color="#475569" roughness={0.7} />
            </mesh>
            {/* Blue accent stripe */}
            <mesh position={[wi === 0 ? 0.11 : -0.11, 0.1, 0]}>
              <boxGeometry args={[0.04, 0.18, 158]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>
        ))}
      </group>

      {/* 2. ELEVATED MODERN METRO STATION (Z: 26) */}
      <group position={[-18, 0, 26]} name="ElevatedMetroStation">
        {/* Station Ground Concourse & Stairs */}
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[10, 4.4, 28]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>

        {/* Station Glass Concourse Walls */}
        <mesh position={[0, 5.4, 0]}>
          <boxGeometry args={[9.8, 2.0, 27.6]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.8}
            opacity={0.65}
            transparent
            roughness={0.1}
          />
        </mesh>

        {/* Boarding Platform Slabs */}
        {[-3.6, 3.6].map((px, pi) => (
          <mesh key={`plat-${pi}`} position={[px, 8.2, 0]} castShadow>
            <boxGeometry args={[2.2, 0.35, 26]} />
            <meshStandardMaterial color="#64748b" roughness={0.6} />
          </mesh>
        ))}

        {/* Modern Canopy Roof with Curved Glass Skylights */}
        <mesh position={[0, 11.2, 0]} castShadow>
          <boxGeometry args={[11, 0.25, 30]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 11.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[2.8, 2.8, 28, 16, 1, false, 0, Math.PI]} />
          <meshPhysicalMaterial
            color="#bae6fd"
            transmission={0.85}
            opacity={0.7}
            transparent
            roughness={0.08}
          />
        </mesh>

        {/* Platform Lighting Fixtures */}
        <pointLight position={[0, 9.8, 0]} intensity={2.0} color="#e0f2fe" distance={14} />

        {/* Ground Pedestrian Stairwell Towers */}
        {[-5.8, 5.8].map((sx, si) => (
          <mesh key={`stair-${si}`} position={[sx, 4.2, 0]} castShadow>
            <boxGeometry args={[2.4, 8.4, 6.0]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* 3. SLEEK ARTICULATED BLUE & WHITE METRO TRAIN */}
      <group ref={trainRef} position={[-18, 8.4, 0]} name="MetroTrainArticulated">
        {/* Lead Car (Front) */}
        <group position={[1.3, 0.85, 8.5]}>
          {/* Aerodynamic White/Blue Nose */}
          <mesh castShadow>
            <boxGeometry args={[2.2, 1.8, 7.8]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          {/* Blue Body Band */}
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[2.22, 0.6, 7.82]} />
            <meshStandardMaterial color="#2563eb" roughness={0.4} />
          </mesh>
          {/* Tinted Panoramic Windows */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[2.24, 0.6, 7.2]} />
            <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.5} />
          </mesh>
          {/* Dual Front Headlights */}
          {[-0.6, 0.6].map((hx, hi) => (
            <mesh key={`headlight-${hi}`} position={[hx, -0.2, 3.92]}>
              <sphereGeometry args={[0.18, 8, 8]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#fef08a"
                emissiveIntensity={3.5}
              />
            </mesh>
          ))}
        </group>

        {/* Middle Coach 1 */}
        <group position={[1.3, 0.85, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.2, 1.8, 7.8]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[2.22, 0.6, 7.82]} />
            <meshStandardMaterial color="#2563eb" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[2.24, 0.6, 7.2]} />
            <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.5} />
          </mesh>
        </group>

        {/* Middle Coach 2 */}
        <group position={[1.3, 0.85, -8.5]}>
          <mesh castShadow>
            <boxGeometry args={[2.2, 1.8, 7.8]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[2.22, 0.6, 7.82]} />
            <meshStandardMaterial color="#2563eb" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[2.24, 0.6, 7.2]} />
            <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.5} />
          </mesh>
          {/* Rear Red Tail Lights */}
          {[-0.6, 0.6].map((tx, ti) => (
            <mesh key={`taillight-${ti}`} position={[tx, -0.2, -3.92]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.0} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};
