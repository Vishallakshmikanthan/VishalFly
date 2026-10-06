import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * ChennaiTNagarCommercial:
 * The bustling commercial heartbeat of Chennai (T. Nagar, Ranganathan Street & Pondy Bazaar):
 * 1. Saravana Stores & Pothys Grand Multi-Story Retail Showrooms with dynamic LED billboards
 * 2. Sathyam / PVR Theatres with illuminated cinema marquee & blockbuster movie posters
 * 3. Authentic Chennai "Nair Tea Kadai" with brass filter coffee boiler, vada/samosa glass showcase
 * 4. Pavement shopping stalls, Kothu Parotta night food cart, and Chennai Auto-Rickshaw stand
 */
export const ChennaiTNagarCommercial: React.FC = () => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const isNightOrEvening = timeOfDay === 'night' || timeOfDay === 'evening';

  return (
    <group position={[-25, 0, -42]} name="ChennaiTNagarCommercialDistrict">
      {/* ------------------------------------------------------------- */}
      {/* 1. SARAVANA STORES STYLE MEGA TEXTILE & JEWELRY SHOWROOM      */}
      {/* ------------------------------------------------------------- */}
      <group position={[-16, 0, 0]}>
        {/* 6-Story Grand Showroom Building Body */}
        <mesh position={[0, 15, 0]} castShadow receiveShadow>
          <boxGeometry args={[16, 30, 22]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Multi-Color Illuminated Glass Facade */}
        <mesh position={[0, 15, 11.1]}>
          <boxGeometry args={[15.6, 28, 0.2]} />
          <meshPhysicalMaterial
            color="#ec4899"
            transmission={0.8}
            roughness={0.1}
            opacity={0.75}
            transparent
          />
        </mesh>

        {/* Giant LED Billboard: SARAVANA STORES • MEGA SHOWROOM */}
        <group position={[0, 26, 11.4]}>
          <mesh>
            <boxGeometry args={[14.8, 4.8, 0.3]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <mesh position={[0, 0, 0.2]}>
            <planeGeometry args={[14.2, 4.2]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={isNightOrEvening ? 2.5 : 1.2}
            />
          </mesh>
        </group>

        {/* Gold Jewelry & Silk Saree Advertisements (Side Facade) */}
        <group position={[-8.2, 14, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[18, 12, 0.3]} />
            <meshStandardMaterial color="#d97706" emissive="#b45309" emissiveIntensity={0.8} />
          </mesh>
        </group>

        {/* Grand Ground Floor Glass Entrance with Festive Toran Decorations */}
        <mesh position={[0, 2.5, 11.2]}>
          <boxGeometry args={[8, 5, 0.2]} />
          <meshPhysicalMaterial color="#38bdf8" transmission={0.9} transparent />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 2. SATHYAM CINEMAS / PVR MULTI-SCREEN THEATRE                */}
      {/* ------------------------------------------------------------- */}
      <group position={[12, 0, 0]}>
        {/* Theatre Building Block */}
        <mesh position={[0, 12, 0]} castShadow receiveShadow>
          <boxGeometry args={[22, 24, 20]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.5} />
        </mesh>

        {/* Glowing Neon "SATHYAM CINEMAS" Marquee Signboard */}
        <group position={[0, 21, 10.2]}>
          <mesh>
            <boxGeometry args={[18, 3.8, 0.4]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0, 0.25]}>
            <planeGeometry args={[17.2, 3.2]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={isNightOrEvening ? 3.0 : 1.5}
            />
          </mesh>
        </group>

        {/* Tamil & Blockbuster Movie Poster Displays (Poster 1 & Poster 2) */}
        {[-5.5, 5.5].map((px, pi) => (
          <group key={`movie-post-${pi}`} position={[px, 11, 10.2]}>
            <mesh>
              <boxGeometry args={[7, 9.5, 0.2]} />
              <meshStandardMaterial color="#090d16" />
            </mesh>
            <mesh position={[0, 0, 0.12]}>
              <planeGeometry args={[6.5, 9.0]} />
              <meshStandardMaterial
                color={pi === 0 ? '#ef4444' : '#eab308'}
                emissive={pi === 0 ? '#b91c1c' : '#ca8a04'}
                emissiveIntensity={isNightOrEvening ? 1.8 : 0.8}
              />
            </mesh>
          </group>
        ))}

        {/* Box Office Ticket Counter Entrance Canopy */}
        <mesh position={[0, 4.2, 11.5]} castShadow>
          <boxGeometry args={[16, 0.4, 3.2]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 3. CLASSIC CHENNAI "NAIR TEA KADAI" (HOT TEA & VADA STALL)   */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, 16]}>
        {/* Tea Stall Small Shop Structure */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[4.5, 3.6, 3.8]} />
          <meshStandardMaterial color="#0284c7" roughness={0.6} />
        </mesh>

        {/* Tin Slanted Roof */}
        <mesh position={[0, 3.8, 0.4]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[5.2, 0.15, 4.6]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Glass Showcase with Hot Medu Vadas, Samosas, and Buns */}
        <group position={[0, 1.4, 2.0]}>
          <mesh castShadow>
            <boxGeometry args={[3.2, 1.2, 0.8]} />
            <meshPhysicalMaterial color="#38bdf8" transmission={0.85} opacity={0.6} transparent />
          </mesh>
          {/* Golden Vadas / Samosas inside */}
          {[-0.8, -0.2, 0.4, 0.9].map((vx, vi) => (
            <mesh key={`vada-${vi}`} position={[vx, 0, 0]} rotation={[0.3, 0, 0]}>
              <torusGeometry args={[0.16, 0.08, 8, 12]} />
              <meshStandardMaterial color="#d97706" roughness={0.8} />
            </mesh>
          ))}
        </group>

        {/* Brass Filter Coffee & Tea Boiler Cylinders */}
        <group position={[1.4, 1.8, 1.6]}>
          <mesh rotation={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.8, 12]} />
            <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Steam Effect at Top of Boiler */}
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.15, 6, 6]} />
            <meshBasicMaterial color="#ffffff" opacity={0.4} transparent />
          </mesh>
        </group>

        {/* Street Bench for Customers */}
        <mesh position={[0, 0.4, 3.2]} castShadow>
          <boxGeometry args={[3.4, 0.3, 0.6]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>

        {/* Neon Tea Sign */}
        <mesh position={[0, 3.2, 2.0]}>
          <boxGeometry args={[3.6, 0.5, 0.1]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={1.8} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 4. KOTHU PAROTTA NIGHT FOOD CART                              */}
      {/* ------------------------------------------------------------- */}
      <group position={[-8, 0, 16]}>
        {/* Food Pushcart */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[2.4, 0.5, 3.4]} />
          <meshStandardMaterial color="#451a03" />
        </mesh>
        {/* Flat Cast-Iron Tawa (Griddle) */}
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.08, 16]} />
          <meshStandardMaterial color="#090d16" metalness={0.9} />
        </mesh>
        {/* Overhead Fluorescent Tube Light */}
        <mesh position={[0, 2.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 2.4, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={isNightOrEvening ? 3.5 : 1.2}
          />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 5. T. NAGAR ROADSIDE CHENNAI AUTO-RICKSHAWS                    */}
      {/* ------------------------------------------------------------- */}
      {[-8, -2, 4].map((ax, ai) => (
        <group key={`tn-auto-${ai}`} position={[ax, 0, 22]} rotation={[0, -Math.PI / 4, 0]}>
          <mesh position={[0, 1.1, 0]} castShadow>
            <boxGeometry args={[1.3, 0.65, 2.0]} />
            <meshStandardMaterial color="#facc15" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[1.35, 0.55, 2.1]} />
            <meshStandardMaterial color="#090d16" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
