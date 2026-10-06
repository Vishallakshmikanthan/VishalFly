import React, { useMemo } from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * MetropolitanShopsRestaurants:
 * Commercial High Street row matching reference image:
 * - 2-3 story boutique shops, bakeries, cafes, and bistros
 * - Colorful facades (brick, cream, terracotta) with illuminated shop windows
 * - Striped awnings (red-white, green-white, yellow-white) over pedestrian walkways
 * - Outdoor cafe dining patio with parasol umbrellas and dining tables
 */
export const MetropolitanShopsRestaurants: React.FC = () => {
  const visible = useGameStore((state) => state.metropolitanLayers.commercial);

  const shops = useMemo(() => [
    { x: 14, z: 16, width: 7.0, height: 6.8, color: '#b45309', awning: '#dc2626', name: 'Bakery & Cafe' },
    { x: 22, z: 16, width: 8.0, height: 8.2, color: '#334155', awning: '#16a34a', name: 'Boutique Store' },
    { x: 31, z: 16, width: 7.5, height: 7.2, color: '#9a3412', awning: '#eab308', name: 'Italian Bistro' },
  ], []);

  if (!visible) return null;

  return (
    <group name="MetropolitanShopsAndRestaurants">
      {/* 1. Commercial Strip Buildings */}
      {shops.map((sp, idx) => (
        <group key={`shop-${idx}`} position={[sp.x, 0, sp.z]}>
          {/* Main Building Body */}
          <mesh position={[0, sp.height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[sp.width, sp.height, 9.5]} />
            <meshStandardMaterial color={sp.color} roughness={0.7} />
          </mesh>

          {/* Roof Parapet Trim */}
          <mesh position={[0, sp.height + 0.25, 0]}>
            <boxGeometry args={[sp.width + 0.4, 0.5, 9.9]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>

          {/* Ground Floor Large Display Window (Lit) */}
          <mesh position={[0, 1.8, 4.8]}>
            <planeGeometry args={[sp.width * 0.75, 2.4]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#fde047"
              emissiveIntensity={1.8}
            />
          </mesh>

          {/* Second Floor Windows */}
          {[-sp.width * 0.25, sp.width * 0.25].map((wx, wi) => (
            <mesh key={`up-win-${wi}`} position={[wx, sp.height - 2.0, 4.8]}>
              <planeGeometry args={[1.5, 1.8]} />
              <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={1.2} />
            </mesh>
          ))}

          {/* Striped Storefront Awning Canopy */}
          <group position={[0, 3.2, 5.2]} rotation={[0.22, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[sp.width * 0.85, 0.1, 2.2]} />
              <meshStandardMaterial color={sp.awning} roughness={0.6} />
            </mesh>
            {/* White stripes on awning */}
            {[-sp.width * 0.3, 0, sp.width * 0.3].map((sx, si) => (
              <mesh key={`awning-stripe-${si}`} position={[sx, 0.06, 0]}>
                <boxGeometry args={[0.6, 0.02, 2.18]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            ))}
          </group>

          {/* Glowing Store Signboard */}
          <mesh position={[0, 3.8, 4.85]}>
            <boxGeometry args={[sp.width * 0.65, 0.65, 0.1]} />
            <meshStandardMaterial color="#f8fafc" emissive="#ffffff" emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}

      {/* 2. Outdoor Street Cafe Dining Patio */}
      <group position={[18, 0, 23]} name="OutdoorCafePatio">
        {/* Paved Patio Platform */}
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[14, 6.0]} />
          <meshStandardMaterial color="#475569" roughness={0.75} />
        </mesh>

        {/* Cafe Tables with Umbrellas & Chairs */}
        {[-4.2, 0, 4.2].map((tx, ti) => (
          <group key={`cafe-set-${ti}`} position={[tx, 0, 0]}>
            {/* Round Bistro Table */}
            <mesh position={[0, 0.75, 0]} castShadow>
              <cylinderGeometry args={[0.7, 0.7, 0.06, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.6} />
            </mesh>
            <mesh position={[0, 0.38, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.75, 8]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>

            {/* Bistro Chairs */}
            {[-0.8, 0.8].map((cx, ci) => (
              <group key={`chair-${ci}`} position={[cx, 0, 0]}>
                <mesh position={[0, 0.45, 0]} castShadow>
                  <boxGeometry args={[0.45, 0.05, 0.45]} />
                  <meshStandardMaterial color="#78350f" />
                </mesh>
                <mesh position={[0, 0.8, -0.2]}>
                  <boxGeometry args={[0.45, 0.65, 0.05]} />
                  <meshStandardMaterial color="#78350f" />
                </mesh>
              </group>
            ))}

            {/* Parasol Patio Umbrella */}
            <group position={[0, 0, 0]}>
              <mesh position={[0, 1.4, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 2.8, 8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} />
              </mesh>
              <mesh position={[0, 2.6, 0]} castShadow>
                <coneGeometry args={[1.5, 0.65, 12]} />
                <meshStandardMaterial
                  color={ti === 0 ? '#ef4444' : ti === 1 ? '#f59e0b' : '#3b82f6'}
                  roughness={0.7}
                />
              </mesh>
            </group>
          </group>
        ))}
      </group>
    </group>
  );
};
