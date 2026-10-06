import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../../store/useGameStore';
import { BedroomEnvironment } from '../Bedroom/BedroomEnvironment';
import { BalconyEnvironment } from '../environments/Balcony/BalconyEnvironment';
import { DiningEnvironment } from '../environments/DiningArea/DiningEnvironment';
import { Dumbbell, Home, Utensils } from 'lucide-react';

/**
 * MetropolitanCommunityZone:
 * Houses 3 separate, individual, non-overlapping buildings situated exactly in the marked area:
 * 1. Vishal's PG Bedroom Building (Room 204) [Position: 16, 0, 27]
 *    - Detailed residential architecture with open viewing cutaway and fly entrance
 *    - Clickable to enter interior & interact
 * 2. PG Mess & Canteen Building [Position: 26, 0, 27]
 *    - Individual cafeteria building with large glass windows and open double door
 *    - Clickable to enter interior & interact
 * 3. PowerFit Fitness Gym Building [Position: 20, 0, 42]
 *    - Distinct modern fitness center with gym equipment, workout tools, and neon sign
 *    - Clickable to enter interior & interact
 * 4. Paved pedestrian walking courtyard connecting all 3 buildings without road overlap
 */
export const MetropolitanCommunityZone: React.FC = () => {
  const switchLocation = useGameStore((state) => state.switchLocation);

  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  return (
    <group name="MetropolitanCommunityZone">
      {/* 1. PAVED COMMUNITY COURTYARD & WALKING CONNECTOR */}
      <group position={[21, 0.02, 34.5]}>
        {/* Base Interlocking Paved Plaza */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[18, 22]} />
          <meshStandardMaterial color="#1e293b" roughness={0.85} />
        </mesh>

        {/* Central Garden Lawn Island */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[2.8, 24]} />
          <meshStandardMaterial color="#15803d" roughness={0.9} />
        </mesh>

        {/* Courtyard Tree */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.22, 2.4, 8]} />
            <meshStandardMaterial color="#451a03" roughness={0.8} />
          </mesh>
          <mesh position={[0, 2.8, 0]} castShadow>
            <sphereGeometry args={[1.2, 10, 10]} />
            <meshStandardMaterial color="#166534" roughness={0.8} />
          </mesh>
        </group>

        {/* Pathway to Boulevard Sidewalk (Westward connection) */}
        <mesh position={[-9.5, 0.005, -7.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 4.0]} />
          <meshStandardMaterial color="#334155" roughness={0.75} />
        </mesh>
      </group>

      {/* Courtyard Lampposts */}
      {[
        { x: 13.5, z: 27 },
        { x: 28.5, z: 27 },
        { x: 13.5, z: 42 },
        { x: 28.5, z: 42 },
      ].map((lp, lpi) => (
        <group key={`cz-lamp-${lpi}`} position={[lp.x, 0.02, lp.z]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 3.0, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[0, 3.1, 0]}>
            <sphereGeometry args={[0.16, 10, 10]} />
            <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={2.2} />
          </mesh>
        </group>
      ))}

      {/* 2. BUILDING 1: VISHAL'S PG BEDROOM BUILDING [Position: 16, 0, 27] */}
      <group
        position={[16, 0, 27]}
        name="Building_PGBedroom"
        onClick={(e) => {
          e.stopPropagation();
          switchLocation('bedroom');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredBuilding('bedroom');
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHoveredBuilding(null);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Exterior Foundation Platform */}
        <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
          <boxGeometry args={[7.8, 0.16, 7.8]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>

        {/* Back Wall */}
        <mesh position={[0, 2.2, -3.8]} castShadow receiveShadow>
          <boxGeometry args={[7.6, 4.2, 0.25]} />
          <meshStandardMaterial
            color="#e2e8f0"
            roughness={0.6}
            emissive={hoveredBuilding === 'bedroom' ? '#38bdf8' : '#000000'}
            emissiveIntensity={hoveredBuilding === 'bedroom' ? 0.2 : 0}
          />
        </mesh>

        {/* Left Side Wall with Windows */}
        <mesh position={[-3.8, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.25, 4.2, 7.6]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>

        {/* Right Side Wall */}
        <mesh position={[3.8, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.25, 4.2, 7.6]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>

        {/* Front Parapet Wall with Wide Open Fly Entrance (X: -1.2 to 1.2 is open!) */}
        <mesh position={[-2.4, 2.2, 3.8]} castShadow>
          <boxGeometry args={[2.8, 4.2, 0.25]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        <mesh position={[2.4, 2.2, 3.8]} castShadow>
          <boxGeometry args={[2.8, 4.2, 0.25]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
        {/* Header over entrance */}
        <mesh position={[0, 3.8, 3.8]} castShadow>
          <boxGeometry args={[2.0, 1.0, 0.25]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>

        {/* Architectural Roof Overhang Trim */}
        <mesh position={[0, 4.35, 0]} castShadow>
          <boxGeometry args={[8.2, 0.25, 8.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>

        {/* 3D Illuminated Entrance Signboard: ROOM 204 • VISHAL'S PG */}
        <group position={[0, 4.6, 3.9]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[4.2, 0.6, 0.15]} />
            <meshStandardMaterial
              color="#0f172a"
              emissive={hoveredBuilding === 'bedroom' ? '#0284c7' : '#0369a1'}
              emissiveIntensity={0.6}
            />
          </mesh>
          <Html position={[0, 0, 0.1]} center distanceFactor={28} style={{ pointerEvents: 'none' }}>
            <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs font-bold whitespace-nowrap shadow-lg transition-transform ${
              hoveredBuilding === 'bedroom'
                ? 'bg-sky-500 text-white border-sky-300 scale-110'
                : 'bg-slate-900/90 text-sky-300 border-sky-500/50'
            }`}>
              <Home className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Vishal's PG Bedroom (Room 204)</span>
            </div>
          </Html>
        </group>

        {/* Complete Visible Nested Interior of Bedroom (Open to view and fly into!) */}
        <BedroomEnvironment />

        {/* Attached Balcony at rear */}
        <group position={[1.9, 0, -6.2]}>
          <BalconyEnvironment />
        </group>
      </group>

      {/* 3. BUILDING 2: PG MESS & CANTEEN BUILDING [Position: 26, 0, 27] */}
      <group
        position={[26, 0, 27]}
        name="Building_PGCanteen"
        onClick={(e) => {
          e.stopPropagation();
          switchLocation('dining');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredBuilding('dining');
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHoveredBuilding(null);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Foundation Platform */}
        <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.8, 0.16, 8.4]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>

        {/* Back Wall */}
        <mesh position={[0, 2.2, -4.1]} castShadow receiveShadow>
          <boxGeometry args={[8.6, 4.2, 0.25]} />
          <meshStandardMaterial
            color="#b45309"
            roughness={0.7}
            emissive={hoveredBuilding === 'dining' ? '#f59e0b' : '#000000'}
            emissiveIntensity={hoveredBuilding === 'dining' ? 0.2 : 0}
          />
        </mesh>

        {/* Left Side Wall */}
        <mesh position={[-4.3, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.25, 4.2, 8.2]} />
          <meshStandardMaterial color="#92400e" roughness={0.7} />
        </mesh>

        {/* Right Side Wall */}
        <mesh position={[4.3, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.25, 4.2, 8.2]} />
          <meshStandardMaterial color="#92400e" roughness={0.7} />
        </mesh>

        {/* Front Wall with Glass Windows & Open Central Entrance */}
        <mesh position={[-2.6, 2.2, 4.1]} castShadow>
          <boxGeometry args={[3.2, 4.2, 0.25]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>
        <mesh position={[2.6, 2.2, 4.1]} castShadow>
          <boxGeometry args={[3.2, 4.2, 0.25]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>
        {/* Entrance Lintel */}
        <mesh position={[0, 3.8, 4.1]} castShadow>
          <boxGeometry args={[2.2, 1.0, 0.25]} />
          <meshStandardMaterial color="#78350f" roughness={0.5} />
        </mesh>

        {/* Roof Overhang Trim */}
        <mesh position={[0, 4.35, 0]} castShadow>
          <boxGeometry args={[9.2, 0.25, 8.8]} />
          <meshStandardMaterial color="#451a03" roughness={0.5} />
        </mesh>

        {/* 3D Signboard: PG MESS & CANTEEN */}
        <group position={[0, 4.6, 4.2]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[4.4, 0.6, 0.15]} />
            <meshStandardMaterial
              color="#0f172a"
              emissive={hoveredBuilding === 'dining' ? '#ea580c' : '#c2410c'}
              emissiveIntensity={0.6}
            />
          </mesh>
          <Html position={[0, 0, 0.1]} center distanceFactor={28} style={{ pointerEvents: 'none' }}>
            <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs font-bold whitespace-nowrap shadow-lg transition-transform ${
              hoveredBuilding === 'dining'
                ? 'bg-amber-500 text-white border-amber-300 scale-110'
                : 'bg-slate-900/90 text-amber-300 border-amber-500/50'
            }`}>
              <Utensils className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>PG Mess & Canteen</span>
            </div>
          </Html>
        </group>

        {/* Complete Visible Nested Interior of Dining Mess */}
        <DiningEnvironment />
      </group>

      {/* 4. BUILDING 3: POWERFIT FITNESS GYM BUILDING [Position: 20, 0, 42] */}
      <group
        position={[20, 0, 42]}
        name="Building_PowerFitGym"
        onClick={(e) => {
          e.stopPropagation();
          switchLocation('gym');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredBuilding('gym');
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHoveredBuilding(null);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Foundation & Heavy-duty Rubber Gym Flooring */}
        <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
          <boxGeometry args={[10.6, 0.16, 8.8]} />
          <meshStandardMaterial color="#18181b" roughness={0.9} />
        </mesh>

        {/* Back Wall */}
        <mesh position={[0, 2.4, -4.3]} castShadow receiveShadow>
          <boxGeometry args={[10.4, 4.6, 0.25]} />
          <meshStandardMaterial
            color="#27272a"
            roughness={0.8}
            emissive={hoveredBuilding === 'gym' ? '#0ea5e9' : '#000000'}
            emissiveIntensity={hoveredBuilding === 'gym' ? 0.2 : 0}
          />
        </mesh>

        {/* Left Side Wall */}
        <mesh position={[-5.2, 2.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.25, 4.6, 8.6]} />
          <meshStandardMaterial color="#3f3f46" roughness={0.8} />
        </mesh>

        {/* Right Side Wall */}
        <mesh position={[5.2, 2.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.25, 4.6, 8.6]} />
          <meshStandardMaterial color="#3f3f46" roughness={0.8} />
        </mesh>

        {/* Front Floor-to-Ceiling Glass Walls with Open Central Entrance (X: -1.2 to 1.2 is open!) */}
        <mesh position={[-3.1, 2.2, 4.3]} castShadow>
          <boxGeometry args={[3.8, 4.2, 0.1]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.85}
            roughness={0.1}
            opacity={0.5}
            transparent
          />
        </mesh>
        <mesh position={[3.1, 2.2, 4.3]} castShadow>
          <boxGeometry args={[3.8, 4.2, 0.1]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.85}
            roughness={0.1}
            opacity={0.5}
            transparent
          />
        </mesh>
        {/* Entrance Lintel */}
        <mesh position={[0, 3.8, 4.3]} castShadow>
          <boxGeometry args={[2.6, 1.0, 0.3]} />
          <meshStandardMaterial color="#18181b" roughness={0.5} />
        </mesh>

        {/* Roof Cap with Industrial Trusses */}
        <mesh position={[0, 4.8, 0]} castShadow>
          <boxGeometry args={[11.0, 0.3, 9.2]} />
          <meshStandardMaterial color="#09090b" roughness={0.5} metalness={0.4} />
        </mesh>

        {/* 3D Glowing Neon Signboard: POWERFIT FITNESS GYM */}
        <group position={[0, 5.2, 4.4]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[5.2, 0.65, 0.18]} />
            <meshStandardMaterial
              color="#09090b"
              emissive={hoveredBuilding === 'gym' ? '#0284c7' : '#0369a1'}
              emissiveIntensity={0.8}
            />
          </mesh>
          <Html position={[0, 0, 0.1]} center distanceFactor={28} style={{ pointerEvents: 'none' }}>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold whitespace-nowrap shadow-xl transition-transform ${
              hoveredBuilding === 'gym'
                ? 'bg-sky-500 text-white border-sky-300 scale-110'
                : 'bg-slate-900/90 text-sky-300 border-sky-500/50'
            }`}>
              <Dumbbell className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>PowerFit Fitness Gym</span>
            </div>
          </Html>
        </group>

        {/* REAL 3D GYM INTERIOR EQUIPMENT INSIDE THE BUILDING: */}
        {/* Zone 1: Olympic Squat Rack with Barbell & Bumper Plates */}
        <group position={[-3.4, 0.1, -2.5]}>
          {/* Steel Uprights */}
          {[-0.6, 0.6].map((ux, ui) => (
            <mesh key={`sq-up-${ui}`} position={[ux, 1.3, 0]} castShadow>
              <boxGeometry args={[0.08, 2.6, 0.08]} />
              <meshStandardMaterial color="#dc2626" metalness={0.8} />
            </mesh>
          ))}
          {/* Olympic Barbell */}
          <mesh position={[0, 1.4, 0.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 2.2, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Black Rubber Bumper Plates */}
          {[-0.85, 0.85].map((px, pi) => (
            <mesh key={`plate-${pi}`} position={[px, 1.4, 0.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.24, 0.24, 0.08, 16]} />
              <meshStandardMaterial color="#18181b" roughness={0.9} />
            </mesh>
          ))}
        </group>

        {/* Zone 2: Workout Bench Press & Flat Bench */}
        <group position={[0, 0.1, -2.5]}>
          {/* Bench Pad */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.5, 0.1, 1.4]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Steel Frame Legs */}
          {[-0.5, 0.5].map((bz, bi) => (
            <mesh key={`bench-leg-${bi}`} position={[0, 0.22, bz]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.44, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
          ))}
        </group>

        {/* Zone 3: 2-Tier Heavy Dumbbell Rack */}
        <group position={[3.2, 0.1, -2.8]}>
          <mesh position={[0, 0.55, 0]} rotation={[0.2, 0, 0]} castShadow>
            <boxGeometry args={[2.4, 0.1, 0.7]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          {/* Dumbbell Pairs */}
          {[-0.8, -0.3, 0.3, 0.8].map((dx, di) => (
            <group key={`db-${di}`} position={[dx, 0.65, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.35, 6]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
              </mesh>
              {[-0.15, 0.15].map((wx, wi) => (
                <mesh key={`dbw-${wi}`} position={[wx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.08 + (di * 0.015), 0.08 + (di * 0.015), 0.05, 10]} />
                  <meshStandardMaterial color="#18181b" roughness={0.9} />
                </mesh>
              ))}
            </group>
          ))}
        </group>

        {/* Zone 4: Motorized Cardio Treadmills with Glowing Consoles */}
        {[-3.0, -1.2].map((tx, ti) => (
          <group key={`tm-${ti}`} position={[tx, 0.1, 1.2]}>
            {/* Base Deck */}
            <mesh position={[0, 0.12, 0]} castShadow>
              <boxGeometry args={[0.9, 0.18, 1.8]} />
              <meshStandardMaterial color="#1e293b" roughness={0.8} />
            </mesh>
            {/* Belt */}
            <mesh position={[0, 0.22, 0]}>
              <planeGeometry args={[0.7, 1.5]} />
              <meshStandardMaterial color="#09090b" roughness={0.95} />
            </mesh>
            {/* Console Screen Uprights */}
            <mesh position={[0, 0.75, -0.7]} rotation={[-0.2, 0, 0]} castShadow>
              <boxGeometry args={[0.8, 1.0, 0.08]} />
              <meshStandardMaterial color="#334155" metalness={0.7} />
            </mesh>
            {/* Glowing Digital Dashboard */}
            <mesh position={[0, 1.15, -0.66]}>
              <planeGeometry args={[0.5, 0.28]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.8} />
            </mesh>
          </group>
        ))}

        {/* Zone 5: Heavy Hanging Punching Bag */}
        <group position={[3.2, 0.1, 1.4]}>
          {/* Steel Hanging Arm */}
          <mesh position={[0, 2.8, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.8, 6]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} />
          </mesh>
          {/* Red Heavy Bag */}
          <mesh position={[0, 1.6, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 1.6, 12]} />
            <meshStandardMaterial color="#dc2626" roughness={0.6} />
          </mesh>
        </group>

        {/* Zone 6: Cable Pulley Machine */}
        <group position={[1.2, 0.1, 1.4]}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <boxGeometry args={[0.8, 2.8, 0.6]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 2.6, 0.3]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
