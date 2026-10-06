import React, { useMemo } from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * MetropolitanApartmentComplex:
 * Premium Gated Apartment Complex, Courtyard & Roadside Commercial Hub:
 * 1. Big Walking Courtyard & Promenade:
 *    - Cobblestone walking circuits, manicured emerald lawn rings
 *    - Multi-tier central stone water fountain
 *    - Park benches, globe lampposts, manicured shrubs, and ornamental shade trees
 * 2. Gated Security Entry:
 *    - Grand Entrance Archway with illuminated sign: "GREENWOOD RESIDENCY & PG COMPLEX"
 *    - Security guard cabin with boom barrier
 *    - Perimeter wrought-iron safety fencing with brick piers
 * 3. Front Roadside Shops & High-detail Bus Stop along Boulevard Sidewalk:
 *    - Modern Glass & Steel Bus Stop Shelter with route maps & timetable
 *    - Authentic Chai Tapri / Tea Stall with brass kettle, glasses, and stools
 *    - Hot Dosa & Tiffin Stall with striped awning and stainless grill
 *    - Fresh Fruit Juice Kiosk with colorful fruit crates
 *    - Roadside Bakery & Snack Counter
 * 4. Surrounding Residential & Canteen Architectural Podia:
 *    - Secure non-overlapping envelopes for Vishal's Room, Dining Mess, and Walking Plaza
 */
export const MetropolitanApartmentComplex: React.FC = () => {
  const visible = useGameStore((state) => state.metropolitanLayers.residential);

  const walkingLamps = useMemo(() => [
    { x: 17, z: -2 },
    { x: 27, z: -2 },
    { x: 37, z: -2 },
    { x: 17, z: 4 },
    { x: 37, z: 4 },
    { x: 22, z: 1 },
    { x: 32, z: 1 },
  ], []);

  const courtyardBenches = useMemo(() => [
    { x: 23, z: 0, rot: 0 },
    { x: 31, z: 0, rot: Math.PI },
    { x: 27, z: -2, rot: Math.PI / 2 },
    { x: 27, z: 2, rot: -Math.PI / 2 },
  ], []);

  const courtyardTrees = useMemo(() => [
    { x: 18, z: -12, scale: 1.1, color: '#15803d' },
    { x: 36, z: -12, scale: 1.2, color: '#166534' },
    { x: 16, z: 2, scale: 0.95, color: '#16a34a' },
    { x: 38, z: 2, scale: 1.05, color: '#15803d' },
    { x: 21, z: 5, scale: 0.9, color: '#166534' },
    { x: 33, z: 5, scale: 0.9, color: '#15803d' },
  ], []);

  if (!visible) return null;

  return (
    <group name="MetropolitanApartmentComplexEstate">
      {/* 1. COURTYARD BASE & WALKING PROMENADE */}
      <group position={[27, 0.02, 1]}>
        {/* Main Paved Courtyard Platform */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[32, 28]} />
          <meshStandardMaterial color="#1e293b" roughness={0.85} />
        </mesh>

        {/* Decorative Interlocking Cobblestone Walking Ring */}
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[5.5, 9.5, 32]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>

        {/* Central Manicured Lawn Island */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[5.2, 32]} />
          <meshStandardMaterial color="#15803d" roughness={0.9} />
        </mesh>

        {/* Central Tiered Stone Water Fountain */}
        <group position={[0, 0, 0]}>
          {/* Base Pool Rim */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[2.4, 2.6, 0.5, 24]} />
            <meshStandardMaterial color="#64748b" roughness={0.6} />
          </mesh>
          {/* Reflective Water Pool */}
          <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[2.2, 24]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              transmission={0.8}
              roughness={0.1}
              opacity={0.85}
              transparent
            />
          </mesh>
          {/* Fountain Center Pedestal */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.6, 0.8, 16]} />
            <meshStandardMaterial color="#475569" roughness={0.5} />
          </mesh>
          {/* Upper Water Basin */}
          <mesh position={[0, 1.25, 0]} castShadow>
            <cylinderGeometry args={[1.2, 0.3, 0.35, 20]} />
            <meshStandardMaterial color="#64748b" roughness={0.6} />
          </mesh>
          {/* Water Spout & Crown */}
          <mesh position={[0, 1.6, 0]}>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshStandardMaterial color="#e0f2fe" roughness={0.2} emissive="#0284c7" emissiveIntensity={0.6} />
          </mesh>
        </group>
      </group>

      {/* Courtyard Benches */}
      {courtyardBenches.map((bn, bi) => (
        <group key={`court-bench-${bi}`} position={[bn.x, 0.03, bn.z]} rotation={[0, bn.rot, 0]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[1.4, 0.1, 0.45]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.5, -0.2]} castShadow>
            <boxGeometry args={[1.4, 0.45, 0.08]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
          {[-0.6, 0.6].map((lx, li) => (
            <mesh key={`bl-${li}`} position={[lx, 0.12, 0]} castShadow>
              <boxGeometry args={[0.08, 0.24, 0.4]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Courtyard Walking Lamps */}
      {walkingLamps.map((lp, li) => (
        <group key={`court-lamp-${li}`} position={[lp.x, 0.03, lp.z]}>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 3.2, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[0, 3.3, 0]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2.2} />
          </mesh>
        </group>
      ))}

      {/* Landscaped Trees & Planter Beds */}
      {courtyardTrees.map((tr, ti) => (
        <group key={`court-tree-${ti}`} position={[tr.x, 0, tr.z]} scale={tr.scale}>
          {/* Planter Curb Ring */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[1.1, 1.2, 0.3, 16]} />
            <meshStandardMaterial color="#475569" roughness={0.7} />
          </mesh>
          {/* Tree Trunk */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.24, 2.8, 8]} />
            <meshStandardMaterial color="#451a03" roughness={0.85} />
          </mesh>
          {/* Foliage Spheres */}
          <mesh position={[0, 3.2, 0]} castShadow>
            <sphereGeometry args={[1.2, 10, 10]} />
            <meshStandardMaterial color={tr.color} roughness={0.8} />
          </mesh>
          <mesh position={[0, 4.1, 0]} castShadow>
            <sphereGeometry args={[0.85, 8, 8]} />
            <meshStandardMaterial color={tr.color} roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* 2. GATED SECURITY ENTRY & COMPLEX PERIMETER WALLS */}
      {/* Front Perimeter Wall (Along X: 14.5, with opening for Archway Gate) */}
      <group position={[14.5, 0, 0]}>
        {/* North Wall Segment (Z: -14 to -5) */}
        <mesh position={[0, 1.1, -9.5]} castShadow>
          <boxGeometry args={[0.35, 2.2, 9]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        {/* South Wall Segment (Z: -1 to 14) */}
        <mesh position={[0, 1.1, 6.5]} castShadow>
          <boxGeometry args={[0.35, 2.2, 15]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        {/* Black Decorative Metal Railings on Top */}
        <mesh position={[0, 2.3, -9.5]}>
          <boxGeometry args={[0.1, 0.4, 9]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        <mesh position={[0, 2.3, 6.5]}>
          <boxGeometry args={[0.1, 0.4, 15]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>

        {/* Grand Entrance Archway Pillars (At Z: -3) */}
        {[-2.2, 2.2].map((dz, di) => (
          <mesh key={`gate-pillar-${di}`} position={[0, 2.2, -3 + dz]} castShadow>
            <boxGeometry args={[0.8, 4.4, 0.8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
        ))}
        {/* Overhead Arch Beam */}
        <mesh position={[0, 4.2, -3]} castShadow>
          <boxGeometry args={[1.0, 0.6, 5.0]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        {/* Illuminated Signboard: GREENWOOD RESIDENCY & PG COMPLEX */}
        <mesh position={[-0.52, 4.2, -3]}>
          <planeGeometry args={[0.1, 4.4]} />
        </mesh>
        <group position={[-0.55, 4.2, -3]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[4.4, 0.45]} />
            <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.8} />
          </mesh>
        </group>

        {/* Security Guard Cabin */}
        <group position={[1.4, 0, -1.0]}>
          <mesh position={[0, 1.4, 0]} castShadow>
            <boxGeometry args={[2.2, 2.8, 1.8]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
          </mesh>
          {/* Glass Window */}
          <mesh position={[-1.11, 1.4, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[1.2, 1.0]} />
            <meshPhysicalMaterial color="#38bdf8" transmission={0.7} transparent opacity={0.6} />
          </mesh>
          {/* Boom Barrier */}
          <mesh position={[-1.2, 0.9, -1.0]} rotation={[0, 0, -0.1]}>
            <boxGeometry args={[0.1, 0.1, 2.2]} />
            <meshStandardMaterial color="#ef4444" roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* 3. ROADSIDE BUS STOP & EATING SHOPS ALONG THE BOULEVARD SIDEWALK */}
      {/* (A) High-detail Modern Bus Stop Shelter at [9.5, 0, -3] */}
      <group position={[9.5, 0, -3]}>
        {/* Steel Support Uprights */}
        {[-1.6, 1.6].map((sz, si) => (
          <mesh key={`bus-col-${si}`} position={[0.6, 1.6, sz]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 3.2, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
        ))}
        {/* Cantilevered Glass Roof Canopy */}
        <mesh position={[0, 3.25, 0]} rotation={[0, 0, -0.08]} castShadow>
          <boxGeometry args={[1.8, 0.08, 4.2]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.85}
            roughness={0.1}
            opacity={0.6}
            transparent
          />
        </mesh>
        {/* Back Glass Partition Panel */}
        <mesh position={[0.6, 1.6, 0]}>
          <boxGeometry args={[0.06, 2.4, 3.6]} />
          <meshPhysicalMaterial
            color="#bae6fd"
            transmission={0.8}
            roughness={0.1}
            opacity={0.5}
            transparent
          />
        </mesh>
        {/* Commuter Waiting Bench */}
        <mesh position={[0.4, 0.45, 0]} castShadow>
          <boxGeometry args={[0.45, 0.08, 2.6]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        {/* Illuminated Transit Schedule & Route Map Panel */}
        <mesh position={[0.55, 1.8, 1.2]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.7, 1.2]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#facc15"
            emissiveIntensity={1.4}
          />
        </mesh>
        {/* Bus Stop Pole Signpost with Icon */}
        <group position={[-0.4, 0, -2.4]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 3.0, 8]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
          <mesh position={[0, 2.8, 0]}>
            <boxGeometry args={[0.06, 0.5, 0.5]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          <mesh position={[-0.04, 2.8, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <circleGeometry args={[0.2, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>
        </group>
      </group>

      {/* (B) Chai Tapri / Authentic Tea Stall at [12.2, 0, -8] */}
      <group position={[12.2, 0, -8]}>
        {/* Wooden Stall Counter */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 1.0, 2.4]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
        {/* Countertop Slab */}
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[1.5, 0.06, 2.5]} />
          <meshStandardMaterial color="#a16207" roughness={0.6} />
        </mesh>
        {/* Brass Samovar Boiler / Tea Kettle */}
        <mesh position={[0.2, 1.35, -0.6]} castShadow>
          <cylinderGeometry args={[0.22, 0.28, 0.6, 12]} />
          <meshStandardMaterial color="#eab308" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Stack of Glass Cutting-Chai Glasses */}
        {[-0.2, 0, 0.2].map((gx, gi) => (
          <mesh key={`chai-glass-${gi}`} position={[0.2, 1.15, 0.2 + gx]}>
            <cylinderGeometry args={[0.06, 0.04, 0.18, 8]} />
            <meshPhysicalMaterial color="#fed7aa" transmission={0.7} opacity={0.8} transparent />
          </mesh>
        ))}
        {/* Glass Biscuit Jars */}
        {[-0.2, 0.2].map((jx, ji) => (
          <mesh key={`biscuit-jar-${ji}`} position={[-0.3, 1.25, -0.1 + jx]}>
            <cylinderGeometry args={[0.12, 0.12, 0.35, 10]} />
            <meshStandardMaterial color="#fdba74" roughness={0.3} />
          </mesh>
        ))}
        {/* Overhead Warm Yellow Bulb */}
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={3.0} />
        </mesh>
        {/* Tea Stall Sign */}
        <mesh position={[-0.72, 1.8, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[2.0, 0.4]} />
          <meshStandardMaterial color="#b45309" roughness={0.5} />
        </mesh>
        {/* Customer Stools */}
        {[-0.6, 0.6].map((sx, si) => (
          <mesh key={`stool-${si}`} position={[-1.0, 0.25, sx]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.5, 10]} />
            <meshStandardMaterial color="#92400e" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* (C) South Indian Hot Dosa & Tiffin Stall at [12.2, 0, -11] */}
      <group position={[12.2, 0, -11]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.4, 1.0, 2.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        {/* Stainless Steel Hot Flat Tawa / Grill */}
        <mesh position={[0.1, 1.04, -0.4]}>
          <cylinderGeometry args={[0.38, 0.38, 0.04, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Striped Canopy Awning (Red & White) */}
        <mesh position={[0, 2.2, 0]} rotation={[0, 0, -0.15]} castShadow>
          <boxGeometry args={[1.6, 0.08, 2.4]} />
          <meshStandardMaterial color="#dc2626" roughness={0.6} />
        </mesh>
        {/* Menu Board */}
        <mesh position={[-0.72, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.4, 0.6]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* (D) Fresh Fruit Juice Kiosk at [12.2, 0, 0] */}
      <group position={[12.2, 0, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.4, 1.0, 2.2]} />
          <meshStandardMaterial color="#065f46" roughness={0.7} />
        </mesh>
        {/* Striped Yellow/Green Canopy */}
        <mesh position={[0, 2.2, 0]} rotation={[0, 0, -0.15]} castShadow>
          <boxGeometry args={[1.6, 0.08, 2.4]} />
          <meshStandardMaterial color="#16a34a" roughness={0.6} />
        </mesh>
        {/* Fruit Crates on Display */}
        {[
          { z: -0.5, col: '#f97316' }, // Oranges
          { z: 0, col: '#eab308' },    // Bananas / Mangoes
          { z: 0.5, col: '#ef4444' },  // Apples
        ].map((crate, ci) => (
          <group key={`fruit-crate-${ci}`} position={[-0.2, 1.15, crate.z]}>
            <mesh>
              <boxGeometry args={[0.4, 0.16, 0.4]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.14, 8, 8]} />
              <meshStandardMaterial color={crate.col} roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* (E) Roadside Bakery & Snack Corner at [12.2, 0, -5] */}
      <group position={[12.2, 0, -5]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.4, 1.0, 1.8]} />
          <meshStandardMaterial color="#831843" roughness={0.7} />
        </mesh>
        {/* Glass Showcase with Warm Interior Glow */}
        <mesh position={[0, 1.3, 0]}>
          <boxGeometry args={[1.1, 0.5, 1.5]} />
          <meshPhysicalMaterial
            color="#fef08a"
            transmission={0.75}
            roughness={0.1}
            opacity={0.7}
            transparent
          />
        </mesh>
      </group>

      {/* 4. ARCHITECTURAL WINGS ENCLOSING VISHAL'S ROOM & DINING MESS */}
      {/* Surrounding Residential Tower Wings that house Room 204 */}
      <group position={[20, 0, -8]}>
        {/* Back Wall & Surrounding Residential Wing Structure */}
        <mesh position={[0, 8.0, -4.5]} castShadow receiveShadow>
          <boxGeometry args={[8.6, 16.0, 1.2]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
        {/* Left Wing Barrier */}
        <mesh position={[-4.2, 8.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 16.0, 8.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        {/* Upper Story Floors (3rd and 4th floors above Room 204) */}
        <mesh position={[0, 8.5, 0]} castShadow>
          <boxGeometry args={[8.4, 8.5, 8.4]} />
          <meshStandardMaterial color="#334155" roughness={0.65} />
        </mesh>
        {/* Decorative Balconies on Upper Floors */}
        {[6.5, 10.5].map((fy, fi) => (
          <mesh key={`apt-upper-balc-${fi}`} position={[0, fy, 4.3]} castShadow>
            <boxGeometry args={[6.8, 0.8, 0.8]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Canteen & Dining Hall Surrounding Enclosure at [34, 0, -8] */}
      <group position={[34, 0, -8]}>
        {/* Back Wall of Canteen Wing */}
        <mesh position={[0, 6.0, -4.6]} castShadow receiveShadow>
          <boxGeometry args={[9.5, 12.0, 1.2]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>
        {/* Right Wall of Canteen Wing */}
        <mesh position={[4.6, 6.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 12.0, 9.0]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
        {/* Overhead 2nd Story Floor */}
        <mesh position={[0, 7.5, 0]} castShadow>
          <boxGeometry args={[9.2, 6.0, 8.8]} />
          <meshStandardMaterial color="#475569" roughness={0.65} />
        </mesh>
        {/* Canteen Canopy Sign */}
        <mesh position={[0, 4.4, 4.45]}>
          <boxGeometry args={[6.4, 0.6, 0.2]} />
          <meshStandardMaterial color="#d97706" />
        </mesh>
      </group>
    </group>
  );
};
