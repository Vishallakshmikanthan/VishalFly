import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * MetropolitanShoppingMall:
 * Massive luxury multi-tier commercial shopping mall matching the reference image:
 * - Multi-level grand architectural structure with stepped terraces
 * - Huge illuminated LED digital advertising billboards on the facade ("MALL", "FASHION", etc.)
 * - Glass rooftop atriums & barrel vaults letting in natural light
 * - Grand entrance plaza with glass canopies, plazas, decorative flags, and trees
 */
export const MetropolitanShoppingMall: React.FC = () => {
  const visible = useGameStore((state) => state.metropolitanLayers.commercial);

  if (!visible) return null;

  return (
    <group position={[-16, 0, 2]} name="MetropolitanShoppingMall">
      {/* 1. Plaza Base Foundation */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[36, 26]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* 2. Main Mall Podium (Level 1 & 2) */}
      <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[32, 9.0, 22]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.55} metalness={0.15} />
      </mesh>

      {/* Level 3 Stepped Upper Complex */}
      <mesh position={[0, 11.5, -2]} castShadow receiveShadow>
        <boxGeometry args={[26, 5.0, 16]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
      </mesh>

      {/* Rooftop Glass Barrel Vault Skylight Atrium */}
      <mesh position={[0, 14.5, -2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[4.2, 4.2, 18, 16, 1, false, 0, Math.PI]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transmission={0.8}
          roughness={0.08}
          opacity={0.7}
          transparent
        />
      </mesh>

      {/* 3. ILLUMINATED DIGITAL LED BILLBOARDS (Exactly as shown in Reference Image!) */}
      {/* Billboard 1: Giant "MALL" Signboard (Warm Gold / Red Glow) */}
      <group position={[8, 7.5, 11.05]}>
        {/* LED Screen Frame */}
        <mesh>
          <boxGeometry args={[6.8, 3.8, 0.2]} />
          <meshStandardMaterial color="#09090b" roughness={0.4} />
        </mesh>
        {/* Glowing Screen Surface */}
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[6.4, 3.4]} />
          <meshStandardMaterial
            color="#f97316"
            emissive="#ea580c"
            emissiveIntensity={2.5}
            roughness={0.2}
          />
        </mesh>
        {/* 3D Bold "MALL" Lettering */}
        <mesh position={[0, 0, 0.18]}>
          <planeGeometry args={[4.2, 1.6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Billboard 2: Fashion & Retail Screen (Vibrant Magenta / Purple) */}
      <group position={[-1, 7.5, 11.05]}>
        <mesh>
          <boxGeometry args={[5.8, 4.2, 0.2]} />
          <meshStandardMaterial color="#09090b" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[5.4, 3.8]} />
          <meshStandardMaterial
            color="#ec4899"
            emissive="#db2777"
            emissiveIntensity={2.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Billboard 3: Tech & Electronics Screen (Cyan / Blue) */}
      <group position={[-8.5, 7.5, 11.05]}>
        <mesh>
          <boxGeometry args={[6.2, 4.0, 0.2]} />
          <meshStandardMaterial color="#09090b" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[5.8, 3.6]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#0891b2"
            emissiveIntensity={2.6}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* 4. Grand Glass Entrance Portal & Canopy */}
      <group position={[0, 0, 11.2]}>
        {/* Cantilevered Glass Canopy */}
        <mesh position={[0, 4.2, 2.4]} rotation={[0.1, 0, 0]} castShadow>
          <boxGeometry args={[14, 0.3, 4.8]} />
          <meshPhysicalMaterial
            color="#0284c7"
            transmission={0.7}
            opacity={0.8}
            transparent
            roughness={0.15}
          />
        </mesh>
        {/* Support Steel Trusses */}
        {[-5.8, 0, 5.8].map((tx, ti) => (
          <mesh key={`truss-${ti}`} position={[tx, 2.2, 3.6]}>
            <cylinderGeometry args={[0.08, 0.08, 4.4, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
        ))}

        {/* Double Revolving Glass Doors */}
        {[-2.5, 2.5].map((dx, di) => (
          <group key={`door-${di}`} position={[dx, 1.4, 0]}>
            <mesh>
              <cylinderGeometry args={[1.3, 1.3, 2.6, 16, 1, true]} />
              <meshPhysicalMaterial color="#38bdf8" transmission={0.8} opacity={0.6} transparent />
            </mesh>
            <mesh position={[0, 1.3, 0]}>
              <cylinderGeometry args={[1.35, 1.35, 0.1, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Warm Interior Lighting Spill */}
        <pointLight position={[0, 2.8, 1.0]} intensity={2.5} color="#fed7aa" distance={12} />
      </group>

      {/* 5. Entrance Plaza Features: Decorative Trees & Modern Flagpoles */}
      {[-12, -7, 7, 12].map((fx, fi) => (
        <group key={`flag-${fi}`} position={[fx, 0, 14.5]}>
          {/* Flagpole */}
          <mesh position={[0, 3.5, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 7.0, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
          {/* Flag Fabric */}
          <mesh position={[0.6, 6.2, 0]}>
            <boxGeometry args={[1.2, 0.7, 0.02]} />
            <meshStandardMaterial color={fi % 2 === 0 ? '#f59e0b' : '#3b82f6'} roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Plaza Planter Trees */}
      {[-14, -10, 10, 14].map((px, pi) => (
        <group key={`planter-${pi}`} position={[px, 0, 12.8]}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.9, 0.8, 0.7, 12]} />
            <meshStandardMaterial color="#475569" roughness={0.7} />
          </mesh>
          <mesh position={[0, 2.0, 0]} castShadow>
            <sphereGeometry args={[1.1, 8, 8]} />
            <meshStandardMaterial color="#16a34a" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
