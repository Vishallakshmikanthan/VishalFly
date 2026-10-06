import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * MetropolitanTowersDistrict:
 * Massively elevates urban density and skyline grandeur:
 * 1. 5 Architectural Skyscraper Towers (Pinnacle Spire, CyberTech X-brace, Twin Towers with Skybridge, Rotunda Helipad)
 * 2. Mega Shopping Mall Complex with giant LED billboards, glass atrium dome & rooftop dining
 * 3. Luxury High-Rise Apartment Towers (24-story residential towers with wrap-around balconies)
 * 4. High-density commercial and residential blocks replacing empty space
 */
export const MetropolitanTowersDistrict: React.FC = () => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const isNightOrEvening = timeOfDay === 'night' || timeOfDay === 'evening';

  return (
    <group name="MetropolitanTowersDistrict">
      {/* ============================================================= */}
      {/* 1. TOWER 1: THE APEX PINNACLE SKYSCRAPER (Height: 78m)        */}
      {/* Position: [-72, 0, -25]                                        */}
      {/* ============================================================= */}
      <group position={[-72, 0, -25]}>
        {/* Foundation & Lobby */}
        <mesh position={[0, 4, 0]} castShadow receiveShadow>
          <boxGeometry args={[18, 8, 18]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Glass Lobby Walls */}
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[18.2, 7.5, 18.2]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.8}
            roughness={0.1}
            opacity={0.7}
            transparent
          />
        </mesh>

        {/* Lower Tower Shaft */}
        <mesh position={[0, 22, 0]} castShadow receiveShadow>
          <boxGeometry args={[15, 28, 15]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Upper Tapered Shaft */}
        <mesh position={[0, 47, 0]} castShadow>
          <boxGeometry args={[12, 22, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.85} />
        </mesh>

        {/* Illuminated Glass Facet Panels */}
        <mesh position={[0, 36, 0]}>
          <boxGeometry args={[12.3, 48, 12.3]} />
          <meshPhysicalMaterial
            color="#0284c7"
            transmission={0.85}
            roughness={0.1}
            opacity={0.5}
            transparent
          />
        </mesh>

        {/* Pyramidal Crown */}
        <mesh position={[0, 63, 0]} castShadow>
          <coneGeometry args={[7.5, 10, 4]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.9} />
        </mesh>

        {/* Spire Antenna */}
        <mesh position={[0, 72, 0]}>
          <cylinderGeometry args={[0.1, 0.4, 12, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
        </mesh>
        {/* Red Aviation Light */}
        <mesh position={[0, 78, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={isNightOrEvening ? 5.0 : 2.0}
          />
        </mesh>
      </group>

      {/* ============================================================= */}
      {/* 2. TOWER 2 & 3: THE TWIN TOWERS WITH SKYBRIDGE (Height: 62m)  */}
      {/* Position: [-52, 0, 95]                                         */}
      {/* ============================================================= */}
      <group position={[-52, 0, 95]}>
        {/* Left Tower */}
        <group position={[-9, 0, 0]}>
          <mesh position={[0, 30, 0]} castShadow receiveShadow>
            <boxGeometry args={[11, 60, 11]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Cyan Glow Stripes */}
          <mesh position={[0, 30, 5.6]}>
            <boxGeometry args={[1.0, 58, 0.1]} />
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#06b6d4"
              emissiveIntensity={isNightOrEvening ? 2.5 : 1.0}
            />
          </mesh>
          {/* Spire */}
          <mesh position={[0, 64, 0]}>
            <cylinderGeometry args={[0.08, 0.3, 8, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
        </group>

        {/* Right Tower */}
        <group position={[9, 0, 0]}>
          <mesh position={[0, 30, 0]} castShadow receiveShadow>
            <boxGeometry args={[11, 60, 11]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Cyan Glow Stripes */}
          <mesh position={[0, 30, 5.6]}>
            <boxGeometry args={[1.0, 58, 0.1]} />
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#06b6d4"
              emissiveIntensity={isNightOrEvening ? 2.5 : 1.0}
            />
          </mesh>
          {/* Spire */}
          <mesh position={[0, 64, 0]}>
            <cylinderGeometry args={[0.08, 0.3, 8, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
        </group>

        {/* Glass Skybridge Connecting Towers at Level 14 (Height: 38m) */}
        <group position={[0, 38, 0]}>
          <mesh castShadow>
            <boxGeometry args={[14, 4.2, 4.8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
          </mesh>
          {/* Panoramic Glass Walls */}
          {[-2.5, 2.5].map((wz, wi) => (
            <mesh key={`tw-sb-${wi}`} position={[0, 0, wz]}>
              <boxGeometry args={[13.8, 3.2, 0.1]} />
              <meshPhysicalMaterial
                color="#38bdf8"
                transmission={0.85}
                roughness={0.1}
                opacity={0.65}
                transparent
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* ============================================================= */}
      {/* 3. TOWER 4: CYBERTECH ROTUNDA TOWER WITH HELIPAD (Height: 56m)*/}
      {/* Position: [68, 0, -42]                                         */}
      {/* ============================================================= */}
      <group position={[68, 0, -42]}>
        {/* Cylindrical Glass Tower Body */}
        <mesh position={[0, 26, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[8.5, 9.5, 52, 24]} />
          <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Helipad Platform on Rooftop */}
        <group position={[0, 52.4, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[9.5, 9.5, 0.8, 24]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          {/* Yellow Helipad Circle */}
          <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[6.2, 6.8, 32]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>
          {/* Yellow 'H' Marking */}
          <mesh position={[-1.8, 0.43, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.8, 5.2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[1.8, 0.43, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.8, 5.2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.43, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.2, 0.8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Helipad Green Perimeter Lights */}
          {Array.from({ length: 8 }).map((_, li) => {
            const angle = (li / 8) * Math.PI * 2;
            return (
              <mesh key={`heli-l-${li}`} position={[Math.cos(angle) * 8.8, 0.5, Math.sin(angle) * 8.8]}>
                <sphereGeometry args={[0.18, 8, 8]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={3.0} />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* ============================================================= */}
      {/* 4. MEGA SHOPPING MALL & ENTERTAINMENT COMPLEX (Pos: [52, 0, -25])*/}
      {/* ============================================================= */}
      <group position={[52, 0, -25]}>
        {/* Mall Base Building (4 Stories) */}
        <mesh position={[0, 8, 0]} castShadow receiveShadow>
          <boxGeometry args={[34, 16, 28]} />
          <meshStandardMaterial color="#831843" roughness={0.4} />
        </mesh>

        {/* Central Glass Atrium Dome */}
        <mesh position={[0, 16, 0]} castShadow>
          <sphereGeometry args={[7.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#f472b6"
            transmission={0.8}
            roughness={0.1}
            opacity={0.6}
            transparent
          />
        </mesh>

        {/* Giant LED Billboard: "METRO MALL" */}
        <group position={[0, 12, 14.2]}>
          <mesh>
            <boxGeometry args={[22, 5.5, 0.4]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0, 0.25]}>
            <planeGeometry args={[21, 4.8]} />
            <meshStandardMaterial
              color="#ec4899"
              emissive="#db2777"
              emissiveIntensity={isNightOrEvening ? 2.5 : 1.2}
            />
          </mesh>
        </group>

        {/* IMAX Cinema Billboard (East Face) */}
        <group position={[17.2, 10, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[16, 6.0, 0.4]} />
            <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={1.5} />
          </mesh>
        </group>

        {/* Multi-Level Parking Garage Annex */}
        <group position={[-21, 0, 0]}>
          <mesh position={[0, 6, 0]} castShadow receiveShadow>
            <boxGeometry args={[14, 12, 26]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          {/* Parking Open Louver Vents */}
          {[2.5, 5.5, 8.5].map((ly, li) => (
            <mesh key={`louver-${li}`} position={[0, ly, 13.1]}>
              <boxGeometry args={[12, 0.6, 0.1]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          ))}
        </group>
      </group>

      {/* ============================================================= */}
      {/* 5. LUXURY HIGH-RISE APARTMENT TOWERS (Pos: [15, 0, -68])       */}
      {/* ============================================================= */}
      <group position={[15, 0, -68]}>
        {/* Tower 1: 22-Story Luxury Residential */}
        <group position={[-12, 0, 0]}>
          {/* Main Tower Core */}
          <mesh position={[0, 24, 0]} castShadow receiveShadow>
            <boxGeometry args={[14, 48, 14]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
          </mesh>
          {/* Balconies on All 4 Facades */}
          {[6, 12, 18, 24, 30, 36, 42].map((by, bi) => (
            <React.Fragment key={`balc-t1-${bi}`}>
              <mesh position={[0, by, 7.3]} castShadow>
                <boxGeometry args={[12, 0.4, 1.4]} />
                <meshStandardMaterial color="#0f172a" roughness={0.4} />
              </mesh>
              {/* Glass Balustrade */}
              <mesh position={[0, by + 0.5, 7.9]}>
                <boxGeometry args={[11.8, 0.8, 0.05]} />
                <meshPhysicalMaterial color="#38bdf8" transmission={0.8} transparent />
              </mesh>
            </React.Fragment>
          ))}
          {/* Rooftop Penthouse & Garden */}
          <mesh position={[0, 49.5, 0]} castShadow>
            <boxGeometry args={[10, 3.0, 10]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} />
          </mesh>
        </group>

        {/* Tower 2: Curved Modern Residential High-Rise */}
        <group position={[14, 0, 0]}>
          <mesh position={[0, 22, 0]} castShadow receiveShadow>
            <boxGeometry args={[13, 44, 13]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
          </mesh>
          {/* Vertical Warm Accent Panels */}
          {[-5, 5].map((ax, ai) => (
            <mesh key={`apt-acc-${ai}`} position={[ax, 22, 6.6]}>
              <boxGeometry args={[1.2, 42, 0.15]} />
              <meshStandardMaterial color="#d97706" roughness={0.4} />
            </mesh>
          ))}
          {/* Rooftop Pool Deck Pergola */}
          <mesh position={[0, 45.2, 0]} castShadow>
            <boxGeometry args={[8, 2.4, 8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>
      </group>
    </group>
  );
};
