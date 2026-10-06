import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * MetropolitanHospital:
 * Modern healthcare & trauma hospital facility matching reference image:
 * - Multi-wing clinical building with clean white/grey hospital facade
 * - Glowing illuminated Red Cross (+) medical emblem on the front entrance
 * - Emergency room driveway with ambulance bay
 * - Rooftop emergency trauma helipad with 'H' markings
 * - Emergency vehicle (ambulance) parked on site
 */
export const MetropolitanHospital: React.FC = () => {
  const visible = useGameStore((state) => state.metropolitanLayers.publicServices);

  if (!visible) return null;

  return (
    <group position={[36, 0, 72]} name="MetropolitanHospital">
      {/* 1. Base Hospital Platform & Ambulance Parking Bay */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 22]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* 2. Main Central Hospital Wing */}
      <mesh position={[0, 5.0, -2]} castShadow receiveShadow>
        <boxGeometry args={[18, 10, 14]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
      </mesh>

      {/* East Wing Winglet */}
      <mesh position={[10, 3.8, -2]} castShadow receiveShadow>
        <boxGeometry args={[6.0, 7.6, 12]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </mesh>

      {/* West Wing Winglet */}
      <mesh position={[-10, 3.8, -2]} castShadow receiveShadow>
        <boxGeometry args={[6.0, 7.6, 12]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </mesh>

      {/* Hospital Window Bands */}
      {Array.from({ length: 3 }).map((_, floor) => {
        const yPos = 3.0 + floor * 2.8;
        return (
          <React.Fragment key={`hosp-windows-${floor}`}>
            <mesh position={[0, yPos, 5.05]}>
              <planeGeometry args={[16, 1.2]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#0284c7"
                emissiveIntensity={0.6}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[10, yPos, 4.05]}>
              <planeGeometry args={[5.2, 1.2]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#0284c7"
                emissiveIntensity={0.6}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[-10, yPos, 4.05]}>
              <planeGeometry args={[5.2, 1.2]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#0284c7"
                emissiveIntensity={0.6}
                roughness={0.1}
              />
            </mesh>
          </React.Fragment>
        );
      })}

      {/* 3. PROMINENT RED CROSS (+) MEDICAL EMBLEM (Exactly matching reference image!) */}
      <group position={[0, 8.2, 5.15]}>
        {/* White Circular Medallion */}
        <mesh>
          <circleGeometry args={[1.6, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        {/* Red Cross Vertical Bar */}
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[0.7, 2.2]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} />
        </mesh>
        {/* Red Cross Horizontal Bar */}
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[2.2, 0.7]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} />
        </mesh>
      </group>

      {/* 4. Rooftop Trauma Helipad */}
      <group position={[0, 10.05, -2]}>
        {/* Round Concrete Helipad Surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[4.8, 32]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        {/* Yellow Outer Safety Circle */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4.2, 4.5, 32]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
        {/* Bold White 'H' Landing Target */}
        <mesh position={[-0.8, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, 3.2]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.8, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, 3.2]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.8, 0.5]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* 5. Emergency Bay Canopy & Drive-in Portico */}
      <group position={[0, 0, 6.2]}>
        <mesh position={[0, 2.8, 1.8]} castShadow>
          <boxGeometry args={[9.5, 0.3, 4.2]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>
        {/* Support Steel Posts */}
        {[-4.2, 4.2].map((cx, ci) => (
          <mesh key={`post-${ci}`} position={[cx, 1.4, 3.5]}>
            <cylinderGeometry args={[0.08, 0.08, 2.8, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
        ))}
        {/* Illuminated Emergency Sign */}
        <mesh position={[0, 3.3, 3.9]}>
          <boxGeometry args={[4.2, 0.6, 0.1]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.0} />
        </mesh>
      </group>

      {/* 6. Parked Ambulance */}
      <group position={[2.4, 0, 8.5]}>
        {/* Van Body */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[1.8, 1.4, 4.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Red Orange Fluorescent Stripe */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[1.82, 0.35, 4.22]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
        {/* Red Roof Flasher Beacon */}
        <mesh position={[0, 1.7, 0.5]}>
          <boxGeometry args={[0.8, 0.2, 0.3]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.2} />
        </mesh>
        {/* Wheels */}
        {[[-0.95, -1.2], [0.95, -1.2], [-0.95, 1.2], [0.95, 1.2]].map(([wx, wz], wi) => (
          <mesh key={`amb-wheel-${wi}`} position={[wx, 0.3, wz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
