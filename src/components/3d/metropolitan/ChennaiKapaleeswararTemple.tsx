import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * ChennaiKapaleeswararTemple:
 * Iconic 7th-century Dravidian Hindu landmark of Mylapore, Chennai:
 *
 * 1. Rajagopuram (Stepped Dravidian Temple Tower):
 *    - 7-tiered pyramidal gateway tower decorated with traditional sculptures & motifs
 *    - Vibrant traditional hues (terracotta, sunflower yellow, turquoise, ivory)
 *    - Golden Kalasam finials gleaming at the apex
 *    - Grand teakwood temple gateway with brass bells
 *
 * 2. Holy Temple Tank (Kapaleeswarar Teppakulam):
 *    - Stepped granite water tank with authentic granite ghat steps on all 4 sides
 *    - Central 16-pillar stone Neerazhi Mandapam pavilion
 *
 * 3. Temple Enclave:
 *    - Golden Dhwajasthambam (flag mast) on stone pedestal
 *    - Coconut palms and oil lamp illumination
 */
export const ChennaiKapaleeswararTemple: React.FC = () => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const isNightOrEvening = timeOfDay === 'night' || timeOfDay === 'evening';

  return (
    <group position={[58, 0, 15]} name="ChennaiKapaleeswararTemple">
      {/* ------------------------------------------------------------- */}
      {/* 0. TEMPLE COURTYARD BASE PLATFORM                             */}
      {/* ------------------------------------------------------------- */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>

      {/* ------------------------------------------------------------- */}
      {/* 1. ICONIC STEPPED DRAVIDIAN RAJAGOPURAM (EAST GATEWAY)        */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, -8]}>
        {/* Tier 1: Massive Granite Base Block with Entrance Archway */}
        <mesh position={[0, 3, 0]} castShadow receiveShadow>
          <boxGeometry args={[11, 6, 7]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>

        {/* Entrance Gateway Cutout Doorway */}
        <mesh position={[0, 2.2, 0]}>
          <boxGeometry args={[3.2, 4.4, 7.2]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>

        {/* Carved Teakwood Temple Doors */}
        {[-1.2, 1.2].map((dx, di) => (
          <mesh key={`door-${di}`} position={[dx, 2.2, 0]} castShadow>
            <boxGeometry args={[1.1, 4.2, 0.2]} />
            <meshStandardMaterial color="#451a03" roughness={0.6} />
          </mesh>
        ))}

        {/* Hanging Brass Temple Bell in Gateway */}
        <group position={[0, 4.0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.28, 0.45, 12]} />
            <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Tiers 2 to 7: Stepped Decorative Sculpted Levels */}
        {[
          { y: 7.2, w: 9.8, d: 6.2, h: 2.4, c: '#ea580c' }, // Terracotta
          { y: 9.4, w: 8.6, d: 5.4, h: 2.2, c: '#facc15' }, // Ochre yellow
          { y: 11.4, w: 7.4, d: 4.6, h: 2.0, c: '#0284c7' }, // Turquoise sky blue
          { y: 13.2, w: 6.2, d: 3.8, h: 1.8, c: '#e11d48' }, // Rose madder
          { y: 14.8, w: 5.0, d: 3.0, h: 1.6, c: '#16a34a' }, // Emerald green
          { y: 16.2, w: 3.8, d: 2.4, h: 1.4, c: '#f59e0b' }, // Amber
        ].map((tier, ti) => (
          <group key={`gopuram-tier-${ti}`} position={[0, tier.y, 0]}>
            <mesh castShadow>
              <boxGeometry args={[tier.w, tier.h, tier.d]} />
              <meshStandardMaterial color={tier.c} roughness={0.6} />
            </mesh>
            {/* Ornamental Cornice Rim */}
            <mesh position={[0, tier.h / 2, 0]}>
              <boxGeometry args={[tier.w + 0.3, 0.25, tier.d + 0.3]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          </group>
        ))}

        {/* Barrel-Vaulted Shikhara Roof Cap (Koodam) */}
        <group position={[0, 17.6, 0]}>
          <mesh position={[0, 0.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[1.4, 1.4, 3.4, 16, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#b45309" roughness={0.5} />
          </mesh>

          {/* Row of 5 Golden Kalasam Finials at Summit */}
          {[-1.2, -0.6, 0, 0.6, 1.2].map((kx, ki) => (
            <group key={`kalasam-${ki}`} position={[kx, 2.0, 0]}>
              <mesh castShadow>
                <coneGeometry args={[0.18, 0.9, 8]} />
                <meshStandardMaterial
                  color="#facc15"
                  metalness={0.95}
                  roughness={0.15}
                  emissive={isNightOrEvening ? '#eab308' : '#000000'}
                  emissiveIntensity={isNightOrEvening ? 0.8 : 0}
                />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 2. SACRED TEMPLE TANK (KAPALEESWARAR TEPPAKULAM)              */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, 8]}>
        {/* Granite Surrounding Ghat Parapet */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[18, 0.5, 14]} />
          <meshStandardMaterial color="#64748b" roughness={0.8} />
        </mesh>

        {/* Excavated Tank Basin Water Surface */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[16, 12]} />
          <meshPhysicalMaterial
            color="#0284c7"
            roughness={0.1}
            transmission={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Stepped Granite Ghat Steps on 4 sides */}
        {[
          { x: 0, z: -5.4, w: 15.6, d: 1.0 },
          { x: 0, z: 5.4, w: 15.6, d: 1.0 },
          { x: -7.4, z: 0, w: 1.0, d: 11.6 },
          { x: 7.4, z: 0, w: 1.0, d: 11.6 },
        ].map((st, si) => (
          <mesh key={`step-${si}`} position={[st.x, 0.05, st.z]}>
            <boxGeometry args={[st.w, 0.2, st.d]} />
            <meshStandardMaterial color="#475569" roughness={0.85} />
          </mesh>
        ))}

        {/* Central Neerazhi Mandapam Stone Pavilion */}
        <group position={[0, 0, 0]}>
          {/* Base Stone Island */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[3.2, 0.5, 3.2]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          {/* 4 Corner Stone Pillars */}
          {[-1.2, 1.2].map((px, pi) =>
            [-1.2, 1.2].map((pz, pzi) => (
              <mesh key={`man-col-${pi}-${pzi}`} position={[px, 1.2, pz]} castShadow>
                <cylinderGeometry args={[0.1, 0.12, 1.8, 8]} />
                <meshStandardMaterial color="#e2e8f0" />
              </mesh>
            ))
          )}
          {/* Mandapam Stone Canopy */}
          <mesh position={[0, 2.2, 0]} castShadow>
            <boxGeometry args={[3.4, 0.3, 3.4]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {/* Stepped Shikhara Finial */}
          <mesh position={[0, 2.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[1.1, 1.1, 4]} />
            <meshStandardMaterial color="#facc15" metalness={0.8} />
          </mesh>
        </group>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 3. GOLDEN DHWAJASTHAMBAM (FLAGPOLE) & COCONUT PALMS           */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, -2.5]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.6, 0.8, 0.6, 12]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[0, 3.8, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.12, 6.4, 12]} />
          <meshStandardMaterial color="#facc15" metalness={0.95} roughness={0.15} />
        </mesh>
      </group>

      {/* Temple Palms */}
      {[-10, 10].map((px, pi) => (
        <group key={`tem-palm-${pi}`} position={[px, 0, 0]}>
          <mesh position={[0, 2.2, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.2, 4.4, 8]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[0, 4.6, 0]} castShadow>
            <sphereGeometry args={[1.5, 8, 8]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
