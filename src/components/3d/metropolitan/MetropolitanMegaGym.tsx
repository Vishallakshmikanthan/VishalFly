import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * MetropolitanMegaGym:
 * Massively expanded, fully-equipped 2-story Fitness Super-Center:
 * - Huge architectural complex with floor-to-ceiling glass and neon "POWERFIT MEGA GYM" sign
 * - Zone 1: Olympic Powerlifting & Barbell Bay (multiple squat racks, deadlift platforms, bumper plates)
 * - Zone 2: Free Weights Bay (long dumbbell racks, flat & incline benches)
 * - Zone 3: Cardio Line (row of 5 motorized treadmills with illuminated consoles)
 * - Zone 4: Cable & Machine Zone (dual cable crossovers, leg press sled, lat pulldown)
 * - Zone 5: Combat & Agility Arena (boxing ring with corner posts & ropes, heavy punching bags)
 * - Zone 6: Agility turf track with white yard distance markers
 */
export const MetropolitanMegaGym: React.FC = () => {
  const visible = useGameStore((state) => state.metropolitanLayers.commercial);

  if (!visible) return null;

  return (
    <group position={[26, 0, 10]} name="MetropolitanMegaGym">
      {/* 1. Base Flooring & Agility Turf */}
      {/* Heavy-duty Interlocking Rubber Gym Floor */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color="#18181b" roughness={0.9} />
      </mesh>

      {/* Agility Turf Sprint Strip (Green Turf with Distance Markers) */}
      <mesh position={[7.5, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.2, 17]} />
        <meshStandardMaterial color="#15803d" roughness={0.95} />
      </mesh>
      {/* Yard Line Markings */}
      {Array.from({ length: 8 }).map((_, yi) => (
        <mesh key={`turf-line-${yi}`} position={[7.5, 0.07, -7 + yi * 2.0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.8, 0.08]} />
          <meshBasicMaterial color="#ffffff" opacity={0.7} transparent />
        </mesh>
      ))}

      {/* 2. Glass Curtain Wall Architecture */}
      {/* Main Structural Shell */}
      <mesh position={[0, 4.5, -9.9]}>
        <boxGeometry args={[24, 9.0, 0.2]} />
        <meshStandardMaterial color="#27272a" roughness={0.9} />
      </mesh>
      <mesh position={[-11.9, 4.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20, 9.0, 0.2]} />
        <meshStandardMaterial color="#27272a" roughness={0.9} />
      </mesh>

      {/* Front Floor-to-Ceiling Glass Walls */}
      <mesh position={[0, 4.5, 9.9]}>
        <boxGeometry args={[23.8, 8.8, 0.1]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transmission={0.8}
          opacity={0.4}
          transparent
          roughness={0.1}
          reflectivity={0.8}
        />
      </mesh>

      {/* Modern Black Steel Roof Truss */}
      <mesh position={[0, 9.1, 0]} castShadow>
        <boxGeometry args={[24.2, 0.4, 20.2]} />
        <meshStandardMaterial color="#09090b" roughness={0.7} />
      </mesh>

      {/* Glowing Neon "POWERFIT MEGA GYM" Facade Sign */}
      <group position={[0, 9.8, 10.05]}>
        <mesh>
          <boxGeometry args={[14, 1.4, 0.15]} />
          <meshStandardMaterial color="#09090b" />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[13.2, 1.0]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={3.0}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* Feature Backlight Mirrors */}
      {[-8, -3, 2].map((mx, mi) => (
        <group key={`mirror-${mi}`} position={[mx, 3.8, -9.75]}>
          <mesh>
            <planeGeometry args={[4.2, 5.0]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.05} />
          </mesh>
          {/* LED Backlight Strip */}
          <mesh position={[0, 2.55, 0.02]}>
            <planeGeometry args={[4.2, 0.08]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      ))}

      {/* ========================================================= */}
      {/* 3. EXTENSIVE GYM EQUIPMENT (Fully Loaded!)                */}
      {/* ========================================================= */}

      {/* Zone A: Olympic Barbell Squat Racks (2 Units) */}
      {[-9, -5].map((rx, ri) => (
        <group key={`squat-rack-${ri}`} position={[rx, 0, -6.5]}>
          {/* Red Heavy-Duty Steel Uprights */}
          {[[-0.7, -0.6], [0.7, -0.6], [-0.7, 0.6], [0.7, 0.6]].map(([ux, uz], ui) => (
            <mesh key={`upright-${ui}`} position={[ux, 1.8, uz]} castShadow>
              <boxGeometry args={[0.12, 3.6, 0.12]} />
              <meshStandardMaterial color="#dc2626" roughness={0.4} />
            </mesh>
          ))}
          {/* Overhead Crossbar */}
          <mesh position={[0, 3.5, 0]}>
            <boxGeometry args={[1.5, 0.1, 1.3]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          {/* Chrome Barbell with Bumper Plates */}
          <group position={[0, 2.1, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 2.4, 12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Red & Blue 45lb Bumper Plates */}
            {[-0.95, -0.85, 0.85, 0.95].map((px, pi) => (
              <mesh key={`plate-${pi}`} position={[px, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.38, 0.38, 0.08, 16]} />
                <meshStandardMaterial color={pi % 2 === 0 ? '#ef4444' : '#2563eb'} />
              </mesh>
            ))}
          </group>
        </group>
      ))}

      {/* Zone B: Olympic Bench Press Station with Weight Plates */}
      <group position={[-1, 0, -6.5]}>
        {/* Leather Bench Pad */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[0.45, 0.12, 1.6]} />
          <meshStandardMaterial color="#09090b" roughness={0.6} />
        </mesh>
        {/* Bench Upright Stanchions */}
        {[-0.6, 0.6].map((bx, bi) => (
          <mesh key={`bench-post-${bi}`} position={[bx, 0.9, -0.4]}>
            <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
        ))}
        {/* Barbell on rack */}
        <mesh position={[0, 1.4, -0.4]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 2.0, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>
      </group>

      {/* Zone C: Dual Cable Crossover Machine */}
      <group position={[3.5, 0, -6.5]}>
        {/* Dual Weight Stack Towers */}
        {[-2.2, 2.2].map((tx, ti) => (
          <group key={`tower-${ti}`} position={[tx, 0, 0]}>
            <mesh position={[0, 1.8, 0]} castShadow>
              <boxGeometry args={[0.8, 3.6, 0.7]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            {/* Weight stack plates visible */}
            <mesh position={[0, 1.2, 0.2]}>
              <boxGeometry args={[0.5, 2.0, 0.3]} />
              <meshStandardMaterial color="#475569" metalness={0.9} />
            </mesh>
          </group>
        ))}
        {/* Connecting Overhead Arch Bar */}
        <mesh position={[0, 3.4, 0]}>
          <boxGeometry args={[4.5, 0.12, 0.12]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.9} />
        </mesh>
      </group>

      {/* Zone D: Long Dumbbell Rack (Rows of Hex Dumbbells) */}
      <group position={[-9.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Two-tier Steel Rack */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[7.2, 0.1, 0.7]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.9, -0.2]} castShadow>
          <boxGeometry args={[7.2, 0.1, 0.7]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        {/* Hex Dumbbells pairs */}
        {[-2.8, -1.8, -0.8, 0.2, 1.2, 2.2].map((dx, di) => (
          <React.Fragment key={`db-${di}`}>
            {/* Lower Tier */}
            <mesh position={[dx, 0.65, 0]}>
              <boxGeometry args={[0.4, 0.22, 0.22]} />
              <meshStandardMaterial color="#18181b" roughness={0.7} />
            </mesh>
            {/* Upper Tier */}
            <mesh position={[dx, 1.05, -0.2]}>
              <boxGeometry args={[0.3, 0.18, 0.18]} />
              <meshStandardMaterial color="#18181b" roughness={0.7} />
            </mesh>
          </React.Fragment>
        ))}
      </group>

      {/* Zone E: Cardio Line (Row of 4 Treadmills with Glowing Displays) */}
      <group position={[-2, 0, 2]}>
        {[-3.6, -1.2, 1.2, 3.6].map((tx, ti) => (
          <group key={`treadmill-${ti}`} position={[tx, 0, 0]}>
            {/* Running Belt Deck */}
            <mesh position={[0, 0.18, 0]} castShadow>
              <boxGeometry args={[1.0, 0.25, 2.2]} />
              <meshStandardMaterial color="#09090b" roughness={0.9} />
            </mesh>
            {/* Handrails */}
            {[-0.45, 0.45].map((hx, hi) => (
              <mesh key={`handrail-${hi}`} position={[hx, 0.8, 0.5]}>
                <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
                <meshStandardMaterial color="#475569" metalness={0.8} />
              </mesh>
            ))}
            {/* Digital Console with Cyan Screen */}
            <mesh position={[0, 1.35, 0.9]} rotation={[-0.35, 0, 0]}>
              <boxGeometry args={[0.7, 0.4, 0.06]} />
              <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={2.0} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Zone F: Boxing Ring Arena in the Corner */}
      <group position={[-5.5, 0, 6.5]}>
        {/* Elevated Canvas Mat Platform */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.8, 0.8, 4.8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.86, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.6, 4.6]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        {/* 4 Corner Posts (Red and Blue) */}
        {[[-2.3, -2.3, '#dc2626'], [2.3, -2.3, '#2563eb'], [-2.3, 2.3, '#ffffff'], [2.3, 2.3, '#ffffff']].map(([cx, cz, col], ci) => (
          <mesh key={`post-${ci}`} position={[Number(cx), 1.6, Number(cz)]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 1.6, 8]} />
            <meshStandardMaterial color={String(col)} roughness={0.5} />
          </mesh>
        ))}
        {/* Ropes */}
        {[1.2, 1.6, 2.0].map((ry, ri) => (
          <mesh key={`rope-${ri}`} position={[0, ry, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.3, 2.34, 4]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* Heavy Punching Bags Hanging from Steel Arm */}
      {[2, 4].map((bx, bi) => (
        <group key={`punchbag-${bi}`} position={[bx, 0, 6.5]}>
          <mesh position={[0, 2.2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 1.5, 12]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Warm Ambient Overhead Lighting */}
      <pointLight position={[0, 6.5, 0]} intensity={3.0} color="#e0f2fe" distance={18} />
      <pointLight position={[-6, 6.0, -5]} intensity={2.0} color="#38bdf8" distance={12} />
    </group>
  );
};
