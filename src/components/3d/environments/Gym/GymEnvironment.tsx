import React from 'react';
import { TimeOfDayLighting } from '../../common/TimeOfDayLighting';
import { InteractionHighlight } from '../../common/InteractionHighlight';

/**
 * High-Fidelity 3D Gym Environment (Milestone 5 Polish):
 * - Interlocking rubber tile flooring with deadlift zone & green turf strip
 * - Full-height feature mirror wall with warm backlighting
 * - Olympic Bench Press station with bumper plates and safety collars
 * - Heavy-duty red Squat Power Rack with barbell and safety catches
 * - Two-tier steel Dumbbell Rack with graduated hex dumbbells
 * - Dual Cable Crossover Machine with weight stacks and pulley handles
 * - 45-degree Linear Leg Press sled with weight pegs
 * - Rest bench, chalk bowl stand, and motivational typography
 * - Dynamic Time-of-Day interior lighting & active station interaction highlight
 */
export const GymEnvironment: React.FC = () => {
  return (
    <group name="GymEnvironment">
      {/* 1. Dynamic Simulation-Driven Lighting */}
      <TimeOfDayLighting isInterior={true} accentColor="#38bdf8" />
      <pointLight position={[0, 3.8, 0]} intensity={1.2} color="#e0f2fe" distance={10} />
      <pointLight position={[-2.5, 3.2, -3.8]} intensity={0.8} color="#fed7aa" distance={6} />
      <pointLight position={[2.5, 3.2, -3.8]} intensity={0.8} color="#38bdf8" distance={6} />

      {/* Active Workout Station 3D Beacon */}
      <InteractionHighlight color="#38bdf8" />

      {/* 2. Flooring & Zoned Workout Layout */}
      {/* Main Rubber Tile Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8.4, 8.4]} />
        <meshStandardMaterial color="#18181b" roughness={0.85} metalness={0.12} />
      </mesh>

      {/* Center Agility Turf Walking Strip */}
      <mesh position={[0, 0.004, 0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.6, 6.8]} />
        <meshStandardMaterial color="#166534" roughness={0.95} />
      </mesh>

      {/* Yellow Safety Border Markings */}
      <mesh position={[0, 0.006, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.15, 32]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={`turf-line-${i}`} position={[x, 0.005, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.04, 6.8]} />
          <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
        </mesh>
      ))}

      {/* 3. Walls & Architectural Shell */}
      {/* Back Wall (North) */}
      <mesh position={[0, 2.1, -4.2]}>
        <boxGeometry args={[8.4, 4.2, 0.1]} />
        <meshStandardMaterial color="#27272a" roughness={0.9} />
      </mesh>

      {/* Mirrored Feature Wall Panels */}
      {[-2.4, 0, 2.4].map((x, i) => (
        <group key={`mirror-panel-${i}`} position={[x, 2.0, -4.12]}>
          {/* Beveled Black Frame */}
          <mesh>
            <boxGeometry args={[2.1, 2.8, 0.04]} />
            <meshStandardMaterial color="#09090b" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Reflective Mirror Glass */}
          <mesh position={[0, 0, 0.024]}>
            <planeGeometry args={[2.0, 2.7]} />
            <meshStandardMaterial
              color="#e2e8f0"
              roughness={0.04}
              metalness={0.96}
              envMapIntensity={2.0}
            />
          </mesh>
          {/* Mirror Backlight LED Strip */}
          <mesh position={[0, 1.38, 0.03]}>
            <planeGeometry args={[1.9, 0.04]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      ))}

      {/* Left Wall (West) with Motivational Banner */}
      <mesh position={[-4.2, 2.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[8.4, 4.2, 0.1]} />
        <meshStandardMaterial color="#1e1e24" roughness={0.88} />
      </mesh>
      <group position={[-4.13, 2.7, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Banner Plate */}
        <mesh>
          <planeGeometry args={[4.2, 0.9]} />
          <meshStandardMaterial color="#09090b" roughness={0.6} />
        </mesh>
        {/* Graphic Accents */}
        <mesh position={[0, 0.35, 0.01]}>
          <planeGeometry args={[4.0, 0.04]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, -0.35, 0.01]}>
          <planeGeometry args={[4.0, 0.04]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      </group>

      {/* Right Wall (East) */}
      <mesh position={[4.2, 2.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[8.4, 4.2, 0.1]} />
        <meshStandardMaterial color="#1e1e24" roughness={0.88} />
      </mesh>

      {/* 4. Bench Press Station (Waypoint: bench_press at [-1.5, 0.9, -0.5]) */}
      <group position={[-1.5, 0, -0.5]}>
        {/* Leather Bench Pad with Stitching Accent */}
        <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.52, 0.1, 1.45]} />
          <meshStandardMaterial color="#18181b" roughness={0.35} metalness={0.1} />
        </mesh>
        {/* Bench Steel Base Frame */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.42, 0.44, 1.25]} />
          <meshStandardMaterial color="#27272a" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Heavy Upright Support Columns */}
        {[-0.34, 0.34].map((x, idx) => (
          <group key={`bp-column-${idx}`} position={[x, 0.68, -0.42]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.035, 0.035, 1.36, 12]} />
              <meshStandardMaterial color="#71717a" metalness={0.85} roughness={0.2} />
            </mesh>
            {/* J-Hook Peg */}
            <mesh position={[0, 0.45, 0.05]} rotation={[0.2, 0, 0]} castShadow>
              <boxGeometry args={[0.05, 0.04, 0.08]} />
              <meshStandardMaterial color="#d4d4d8" metalness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Loaded Olympic Barbell */}
        <group position={[0, 1.15, -0.4]}>
          {/* 7ft Bar Shaft with Knurling Textures */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 2.0, 16]} />
            <meshStandardMaterial color="#e4e4e7" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Center Knurl Ring Marks */}
          {[-0.2, 0.2].map((kx, ki) => (
            <mesh key={`knurl-${ki}`} position={[kx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.0155, 0.0155, 0.04, 12]} />
              <meshStandardMaterial color="#a1a1aa" metalness={0.8} />
            </mesh>
          ))}
          {/* Left Weight Plates Stack */}
          {[-0.68, -0.76, -0.83].map((px, i) => (
            <group key={`plate-l-${i}`} position={[px, 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.23 - i * 0.03, 0.23 - i * 0.03, 0.055, 24]} />
                <meshStandardMaterial
                  color={i === 0 ? '#1e293b' : i === 1 ? '#2563eb' : '#dc2626'}
                  roughness={0.4}
                  metalness={0.3}
                />
              </mesh>
            </group>
          ))}
          {/* Right Weight Plates Stack */}
          {[0.68, 0.76, 0.83].map((px, i) => (
            <group key={`plate-r-${i}`} position={[px, 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.23 - i * 0.03, 0.23 - i * 0.03, 0.055, 24]} />
                <meshStandardMaterial
                  color={i === 0 ? '#1e293b' : i === 1 ? '#2563eb' : '#dc2626'}
                  roughness={0.4}
                  metalness={0.3}
                />
              </mesh>
            </group>
          ))}
          {/* Spring Collars */}
          {[-0.88, 0.88].map((cx, ci) => (
            <mesh key={`collar-${ci}`} position={[cx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.028, 0.008, 8, 16]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 5. Squat Power Rack (Waypoint: squat_rack at [-2.2, 1.4, -2.5]) */}
      <group position={[-2.2, 0, -2.5]}>
        {/* 4 Upright Heavy Red Posts */}
        {[
          [-0.65, -0.65],
          [-0.65, 0.65],
          [0.65, -0.65],
          [0.65, 0.65],
        ].map(([x, z], idx) => (
          <group key={`sq-post-${idx}`} position={[x, 1.3, z]}>
            <mesh castShadow>
              <boxGeometry args={[0.09, 2.6, 0.09]} />
              <meshStandardMaterial color="#dc2626" metalness={0.65} roughness={0.3} />
            </mesh>
            {/* Laser-cut Height Indicator Dots */}
            {[-0.8, -0.4, 0, 0.4, 0.8].map((dy, di) => (
              <mesh key={`hole-${di}`} position={[0, dy, 0.046]}>
                <circleGeometry args={[0.012, 8]} />
                <meshBasicMaterial color="#18181b" />
              </mesh>
            ))}
          </group>
        ))}

        {/* Top Connecting Beams & Multi-Grip Chin-Up Bar */}
        <mesh position={[0, 2.58, 0]}>
          <boxGeometry args={[1.39, 0.08, 1.39]} />
          <meshStandardMaterial color="#18181b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 2.52, 0.65]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 1.3, 12]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.9} />
        </mesh>

        {/* Safety Spotter Arms */}
        {[-0.65, 0.65].map((sx, si) => (
          <mesh key={`spotter-${si}`} position={[sx, 0.85, 0]} castShadow>
            <boxGeometry args={[0.06, 0.08, 1.25]} />
            <meshStandardMaterial color="#eab308" metalness={0.7} />
          </mesh>
        ))}

        {/* Heavy Loaded Squat Barbell on J-Hooks */}
        <group position={[0, 1.55, -0.15]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 2.1, 16]} />
            <meshStandardMaterial color="#f4f4f5" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Competition Red Plates */}
          {[-0.82, -0.9, 0.82, 0.9].map((px, pi) => (
            <mesh key={`sq-plate-${pi}`} position={[px, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.24, 0.24, 0.065, 24]} />
              <meshStandardMaterial color="#dc2626" roughness={0.35} metalness={0.4} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 6. Two-Tier Dumbbell Rack (Waypoint: dumbbells at [2.2, 1.1, -2.5]) */}
      <group position={[2.2, 0, -2.5]}>
        {/* Heavy Angled Steel Saddle Rack */}
        <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.95, 0.6]} />
          <meshStandardMaterial color="#27272a" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Chrome Saddle Rails */}
        {[-0.15, 0.15].map((rz, ri) => (
          <mesh key={`rail-${ri}`} position={[0, 0.97, rz]}>
            <boxGeometry args={[2.15, 0.03, 0.08]} />
            <meshStandardMaterial color="#71717a" metalness={0.9} />
          </mesh>
        ))}

        {/* Hex Dumbbell Pairs */}
        {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => {
          const hexRadius = 0.065 + i * 0.01;
          return (
            <group key={`db-set-${i}`} position={[x, 1.05, 0]}>
              {/* Chrome Knurled Handle */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.015, 0.015, 0.18, 12]} />
                <meshStandardMaterial color="#e4e4e7" metalness={0.95} />
              </mesh>
              {/* Molded Rubber Hex Heads */}
              {[-0.09, 0.09].map((hx, hi) => (
                <mesh key={`head-${hi}`} position={[hx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[hexRadius, hexRadius, 0.045, 6]} />
                  <meshStandardMaterial color="#09090b" roughness={0.7} />
                </mesh>
              ))}
            </group>
          );
        })}
      </group>

      {/* 7. Dual Cable Crossover Machine (Waypoint: cable_machine at [0, 1.5, -3.2]) */}
      <group position={[0, 0, -3.2]}>
        {/* Left & Right Tower Stacks */}
        {[-1.3, 1.3].map((tx, idx) => (
          <group key={`cable-tower-${idx}`} position={[tx, 0, 0]}>
            {/* Tower Frame Casing */}
            <mesh position={[0, 1.35, 0]} castShadow>
              <boxGeometry args={[0.55, 2.7, 0.45]} />
              <meshStandardMaterial color="#18181b" metalness={0.8} roughness={0.25} />
            </mesh>
            {/* Guide Rods & Chrome Pulley Slider */}
            <mesh position={[0, 1.4, 0.22]}>
              <cylinderGeometry args={[0.012, 0.012, 2.4, 8]} />
              <meshStandardMaterial color="#e4e4e7" metalness={0.95} />
            </mesh>
            <mesh position={[0, 1.5, 0.22]} castShadow>
              <boxGeometry args={[0.16, 0.14, 0.12]} />
              <meshStandardMaterial color="#eab308" metalness={0.6} />
            </mesh>
            {/* Pin-Selected Weight Stack Plates */}
            <mesh position={[0, 0.85, 0.12]}>
              <boxGeometry args={[0.4, 1.3, 0.1]} />
              <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        ))}

        {/* Overhead Connecting Arch Bar */}
        <mesh position={[0, 2.65, 0]}>
          <boxGeometry args={[2.8, 0.08, 0.08]} />
          <meshStandardMaterial color="#3f3f46" metalness={0.85} />
        </mesh>
        {/* Multi-angle Chin-Up Handles */}
        <mesh position={[0, 2.58, 0.2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.016, 0.016, 0.9, 12]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.9} />
        </mesh>
      </group>

      {/* 8. 45-Degree Leg Press Sled (Waypoint: leg_press at [2.0, 1.1, 0.5]) */}
      <group position={[2.0, 0, 0.5]} rotation={[0, -Math.PI / 4, 0]}>
        {/* Base Frame Foundation */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.85, 0.6, 1.7]} />
          <meshStandardMaterial color="#27272a" metalness={0.75} roughness={0.3} />
        </mesh>
        {/* Inclined Linear Rails (45 degrees) */}
        <mesh position={[0, 0.95, -0.2]} rotation={[Math.PI / 4, 0, 0]}>
          <boxGeometry args={[0.75, 0.1, 1.5]} />
          <meshStandardMaterial color="#71717a" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* Heavy Sled & Diamond Footplate */}
        <mesh position={[0, 1.25, -0.5]} rotation={[Math.PI / 4, 0, 0]} castShadow>
          <boxGeometry args={[0.65, 0.08, 0.55]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Reclined Padded Seat */}
        <mesh position={[0, 0.65, 0.35]} rotation={[Math.PI / 6, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.12, 0.8]} />
          <meshStandardMaterial color="#09090b" roughness={0.4} />
        </mesh>
      </group>

      {/* 9. Rest Bench & Chalk Stand (Waypoint: rest_bench at [0, 0.9, 0]) */}
      <group position={[0, 0, 0]}>
        {/* Bench Cushion */}
        <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.48, 0.09, 1.15]} />
          <meshStandardMaterial color="#18181b" roughness={0.35} />
        </mesh>
        {/* Bench Pillar Supports */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.44, 12]} />
          <meshStandardMaterial color="#52525b" metalness={0.8} />
        </mesh>

        {/* Free-Standing Chalk Bowl Stand */}
        <group position={[-0.7, 0, 0.8]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.035, 0.9, 8]} />
            <meshStandardMaterial color="#3f3f46" metalness={0.8} />
          </mesh>
          {/* Stainless Chalk Bowl */}
          <mesh position={[0, 0.92, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.11, 0.12, 16]} />
            <meshStandardMaterial color="#d4d4d8" metalness={0.9} />
          </mesh>
          {/* White Chalk Powder */}
          <mesh position={[0, 0.94, 0]}>
            <circleGeometry args={[0.13, 16]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
        </group>
      </group>
    </group>
  );
};
