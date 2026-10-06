import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * ChennaiZonedTownshipDistricts:
 * Planned residential, commercial, and green districts replicating the Chennai reference map:
 *
 * 1. Anna Nagar (Residential + Shops + Tower Park):
 *    - Anna Nagar Tower: Iconic 12-story slender concrete observation tower inside green circular park
 *    - Planned 4 to 6-story residential apartments with balconies, windows, and avenue trees
 *
 * 2. Porur & Chromepet (Residential + Malls):
 *    - West sector planned gated residential clusters, neighbourhood plazas, and streetlights
 *
 * 3. Velachery (IT + Residential):
 *    - Modern mid-rise apartments with glass windows and rooftop water tanks
 *
 * 4. Besant Nagar (Residential + Beach):
 *    - Coastal residential villas with terracotta tiled roofs and private garden walls near the sea
 *
 * 5. Madhavaram (Residential + Industries):
 *    - North sector distribution warehouses and logistics sheds with solar panel roofs
 */
export const ChennaiZonedTownshipDistricts: React.FC = () => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const isNightOrEvening = timeOfDay === 'night' || timeOfDay === 'evening';

  return (
    <group name="ChennaiZonedTownshipDistricts">
      {/* ------------------------------------------------------------- */}
      {/* 1. ANNA NAGAR (RESIDENTIAL + SHOPS + TOWER PARK)              */}
      {/* ------------------------------------------------------------- */}
      <group position={[-12, 0, -85]} name="District_AnnaNagar">
        {/* Anna Nagar Tower Park Circular Lawn */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[14, 24]} />
          <meshStandardMaterial color="#15803d" roughness={0.9} />
        </mesh>

        {/* Iconic Anna Nagar Observation Tower (Visveswaraya Tower) */}
        <group position={[0, 0, 0]}>
          {/* Base Stepped Podium */}
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[4.2, 4.8, 1.2, 16]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          {/* Central Slender Elevator & Stair Tower Shaft */}
          <mesh position={[0, 14, 0]} castShadow>
            <cylinderGeometry args={[1.6, 2.2, 26, 16]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
          </mesh>
          {/* Top Observation Deck Cantilever */}
          <mesh position={[0, 26.5, 0]} castShadow>
            <cylinderGeometry args={[4.0, 3.2, 2.4, 16]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          {/* Observation Viewing Glass Band */}
          <mesh position={[0, 26.5, 0]}>
            <cylinderGeometry args={[4.1, 4.1, 1.2, 16]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              transmission={0.8}
              transparent
              roughness={0.1}
            />
          </mesh>
          {/* Needle Spire with Red Aircraft Warning Light */}
          <mesh position={[0, 30.5, 0]}>
            <cylinderGeometry args={[0.08, 0.25, 6.0, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
          </mesh>
          <mesh position={[0, 33.6, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
          </mesh>
        </group>

        {/* Anna Nagar Planned 5-Story Residential Buildings with Balconies */}
        {[-18, 18].map((ax, ai) => (
          <group key={`an-bldg-${ai}`} position={[ax, 0, 0]}>
            <mesh position={[0, 9, 0]} castShadow receiveShadow>
              <boxGeometry args={[12, 18, 14]} />
              <meshStandardMaterial color={ai === 0 ? '#f1f5f9' : '#fed7aa'} roughness={0.6} />
            </mesh>
            {/* Windows & Balconies */}
            {[4, 8, 12, 16].map((wy, wi) => (
              <group key={`an-win-${wi}`} position={[0, wy, 7.1]}>
                <mesh>
                  <boxGeometry args={[8.4, 1.6, 0.1]} />
                  <meshStandardMaterial
                    color={isNightOrEvening ? '#fef08a' : '#38bdf8'}
                    emissive={isNightOrEvening ? '#facc15' : '#000000'}
                    emissiveIntensity={isNightOrEvening ? 1.4 : 0}
                  />
                </mesh>
                {/* Balcony Railing */}
                <mesh position={[0, -0.6, 0.8]}>
                  <boxGeometry args={[8.8, 0.7, 0.1]} />
                  <meshStandardMaterial color="#334155" />
                </mesh>
              </group>
            ))}
          </group>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 2. PORUR & CHROMEPET (RESIDENTIAL + SHOPPING)                  */}
      {/* ------------------------------------------------------------- */}
      <group position={[-85, 0, -20]} name="District_Porur">
        {/* Paved Community Platform */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[26, 26]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        {/* 2 Modern Residential Tower Blocks */}
        {[-7, 7].map((px, pi) => (
          <group key={`porur-apt-${pi}`} position={[px, 0, 0]}>
            <mesh position={[0, 11, 0]} castShadow receiveShadow>
              <boxGeometry args={[10, 22, 10]} />
              <meshStandardMaterial color={pi === 0 ? '#e0e7ff' : '#ccfbf1'} roughness={0.5} />
            </mesh>
            {/* Terracotta Rooftop Parapet */}
            <mesh position={[0, 22.3, 0]}>
              <boxGeometry args={[10.4, 0.6, 10.4]} />
              <meshStandardMaterial color="#ea580c" />
            </mesh>
            {/* Windows Matrix */}
            {[5, 10, 15, 19].map((fy, fi) => (
              <mesh key={`por-w-${fi}`} position={[0, fy, 5.05]}>
                <boxGeometry args={[7.2, 1.8, 0.1]} />
                <meshStandardMaterial
                  color={isNightOrEvening ? '#fef08a' : '#93c5fd'}
                  emissive={isNightOrEvening ? '#facc15' : '#000000'}
                  emissiveIntensity={isNightOrEvening ? 1.6 : 0}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 3. VELACHERY (IT APARTMENTS & RESIDENTIAL ENCLAVE)             */}
      {/* ------------------------------------------------------------- */}
      <group position={[12, 0, 42]} name="District_Velachery">
        <mesh position={[0, 10, 0]} castShadow receiveShadow>
          <boxGeometry args={[18, 20, 12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>
        {/* Glass Frontal Balconies */}
        {[4, 8, 12, 16].map((vy, vi) => (
          <group key={`vel-bal-${vi}`} position={[0, vy, 6.2]}>
            <mesh>
              <boxGeometry args={[14, 1.8, 0.1]} />
              <meshPhysicalMaterial
                color="#0284c7"
                transmission={0.8}
                transparent
                roughness={0.1}
              />
            </mesh>
          </group>
        ))}
        {/* Rooftop Solar Panels */}
        <group position={[0, 20.3, 0]} rotation={[0.2, 0, 0]}>
          <mesh>
            <boxGeometry args={[12, 0.1, 6]} />
            <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 4. BESANT NAGAR (BEACHSIDE RESIDENTIAL VILLAS & ELLIOT'S CAFE) */}
      {/* ------------------------------------------------------------- */}
      <group position={[68, 0, 80]} name="District_BesantNagar">
        {/* 3 Coastal Villas with Terracotta Slanted Roofs */}
        {[-8, 0, 8].map((vx, vi) => (
          <group key={`bn-villa-${vi}`} position={[vx, 0, 0]}>
            {/* White Stucco Villa Body */}
            <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[6.2, 6.4, 7.0]} />
              <meshStandardMaterial color="#ffffff" roughness={0.4} />
            </mesh>
            {/* Terracotta Gabled Slanted Roof */}
            <mesh position={[0, 7.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[4.8, 2.2, 4]} />
              <meshStandardMaterial color="#c2410c" roughness={0.8} />
            </mesh>
            {/* Arch Windows */}
            <mesh position={[0, 4.2, 3.55]}>
              <boxGeometry args={[2.2, 1.8, 0.1]} />
              <meshStandardMaterial
                color={isNightOrEvening ? '#fef08a' : '#38bdf8'}
                emissive={isNightOrEvening ? '#facc15' : '#000000'}
                emissiveIntensity={isNightOrEvening ? 1.5 : 0}
              />
            </mesh>
            {/* Front Garden Palm */}
            <group position={[2.5, 0, 4.5]}>
              <mesh position={[0, 1.8, 0]}>
                <cylinderGeometry args={[0.08, 0.14, 3.6, 8]} />
                <meshStandardMaterial color="#78350f" />
              </mesh>
              <mesh position={[0, 3.8, 0]}>
                <sphereGeometry args={[1.2, 8, 8]} />
                <meshStandardMaterial color="#15803d" />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 5. MADHAVARAM (NORTH RESIDENTIAL & LOGISTICS WAREHOUSES)      */}
      {/* ------------------------------------------------------------- */}
      <group position={[18, 0, -145]} name="District_Madhavaram">
        {[-10, 10].map((mx, mi) => (
          <group key={`madh-shed-${mi}`} position={[mx, 0, 0]}>
            <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[16, 9.0, 18]} />
              <meshStandardMaterial color="#475569" roughness={0.7} metalness={0.3} />
            </mesh>
            {/* Corrugated Gabled Roof with Solar Panels */}
            <mesh position={[0, 9.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[12, 1.8, 4]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
            {/* Loading Bay Roll-up Shutter Doors */}
            <mesh position={[0, 2.2, 9.05]}>
              <boxGeometry args={[8.0, 4.4, 0.1]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
