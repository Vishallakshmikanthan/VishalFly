import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * MetropolitanIndustrialZone:
 * Logistics, warehousing, and manufacturing sector matching reference image:
 * - Industrial steel warehouses with corrugated gabled roofs & loading docks
 * - Heavy industrial storage tanks & silos with metal piping
 * - Intermodal colorful shipping cargo containers stacked in bays
 * - Parked semi-trailer cargo delivery trucks
 */
export const MetropolitanIndustrialZone: React.FC = () => {
  const visible = useGameStore((state) => state.metropolitanLayers.industrial);

  if (!visible) return null;

  return (
    <group position={[-50, 0, 52]} name="MetropolitanIndustrialZone">
      {/* 1. Heavy Industrial Asphalt / Concrete Ground */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[34, 34]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* 2. Warehouse 1: Primary Manufacturing Hangar */}
      <group position={[-6, 0, -4]}>
        {/* Main Walls */}
        <mesh position={[0, 4.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[14, 8.0, 18]} />
          <meshStandardMaterial color="#64748b" roughness={0.8} />
        </mesh>
        {/* Corrugated Gabled Roof */}
        <mesh position={[0, 9.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[10.5, 3.2, 4]} />
          <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.5} />
        </mesh>
        {/* Industrial Roll-up Bay Doors */}
        {[-3.5, 3.5].map((dx, di) => (
          <mesh key={`bay-door-${di}`} position={[dx, 2.2, 9.05]}>
            <planeGeometry args={[4.2, 4.4]} />
            <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Warehouse 2: Logistics Depot */}
      <group position={[8, 0, -5]}>
        <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[10, 6.4, 15]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        <mesh position={[0, 7.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[7.8, 2.4, 4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.4} />
        </mesh>
      </group>

      {/* 3. Cylindrical Metal Storage Silos / Tanks */}
      {[
        { x: -10, z: 10, r: 2.2, h: 7.5 },
        { x: -5, z: 10, r: 2.2, h: 7.5 },
        { x: 0, z: 10, r: 2.2, h: 7.5 },
      ].map((tk, ti) => (
        <group key={`tank-${ti}`} position={[tk.x, 0, tk.z]}>
          <mesh position={[0, tk.h / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[tk.r, tk.r, tk.h, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Domed Cap */}
          <mesh position={[0, tk.h, 0]}>
            <sphereGeometry args={[tk.r, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* 4. Colorful Stacked Cargo Shipping Containers */}
      {[
        { x: 8, y: 0.9, z: 7, color: '#dc2626' },
        { x: 8, y: 0.9, z: 11, color: '#2563eb' },
        { x: 8, y: 2.6, z: 9, color: '#f59e0b' },
        { x: 12, y: 0.9, z: 8, color: '#16a34a' },
      ].map((cnt, ci) => (
        <mesh key={`container-${ci}`} position={[cnt.x, cnt.y, cnt.z]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 1.8, 6.0]} />
          <meshStandardMaterial color={cnt.color} roughness={0.65} metalness={0.4} />
        </mesh>
      ))}

      {/* 5. Heavy Cargo Semi-Truck at Loading Bay */}
      <group position={[-6, 0, 9]}>
        {/* Cab */}
        <mesh position={[0, 1.4, 2.8]} castShadow>
          <boxGeometry args={[2.4, 2.2, 2.6]} />
          <meshStandardMaterial color="#e11d48" roughness={0.4} />
        </mesh>
        {/* Trailer */}
        <mesh position={[0, 1.8, -1.8]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 2.6, 6.8]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};
