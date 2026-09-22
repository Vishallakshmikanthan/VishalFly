import React from 'react';
import { TimeOfDayLighting } from '../../common/TimeOfDayLighting';
import { InteractionHighlight } from '../../common/InteractionHighlight';

/**
 * High-Fidelity 3D Balcony Environment (Milestone 5 Polish):
 * - Terracotta ceramic tile flooring with drainage trim
 * - Seamless sliding door connection to PG Bedroom Room 204
 * - Modern stainless steel and glass safety balustrade
 * - Dual-pole clothesline with hanging laundry (college tee, jeans, towel, gym shirt)
 * - Folding metal clothes drying rack
 * - Potted balcony plants and herbal greenery
 * - Distant Chennai urban horizon silhouette
 * - Dynamic Time-of-Day lighting & laundry drying interaction highlight
 */
export const BalconyEnvironment: React.FC = () => {
  return (
    <group name="BalconyEnvironment">
      {/* 1. Dynamic Simulation-Driven Lighting */}
      <TimeOfDayLighting isInterior={false} accentColor="#fbbf24" />
      <pointLight position={[0, 2.8, 2.2]} intensity={0.9} color="#fbbf24" distance={7} />

      {/* Active Laundry / Drying Interaction Beacon */}
      <InteractionHighlight color="#38bdf8" />

      {/* 2. Terracotta Ceramic Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6.6, 6.6]} />
        <meshStandardMaterial color="#c2410c" roughness={0.72} metalness={0.05} />
      </mesh>
      {/* Floor Grout Lines */}
      {[-2, -1, 0, 1, 2].map((gx) => (
        <mesh key={`bgrout-${gx}`} position={[gx, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.02, 6.5]} />
          <meshBasicMaterial color="#7c2d12" opacity={0.5} transparent />
        </mesh>
      ))}

      {/* 3. Bedroom Wall & Connected Sliding Door Frame (South Wall [Z: 2.8]) */}
      <group position={[0, 1.9, 3.1]}>
        {/* Exterior Bedroom Wall */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6.6, 3.8, 0.2]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.88} />
        </mesh>
        {/* Sliding Door Frame (Waypoint: doorway at [0, 1.2, 2.5]) */}
        <mesh position={[0, -0.6, -0.1]}>
          <boxGeometry args={[2.5, 2.65, 0.06]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        {/* Sliding Glazed Panels */}
        {[-0.6, 0.6].map((gx, idx) => (
          <mesh key={`b-glass-${idx}`} position={[gx, -0.6, -0.07]}>
            <planeGeometry args={[1.1, 2.45]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.35} roughness={0.1} />
          </mesh>
        ))}
        {/* Room 204 Door Plate */}
        <mesh position={[1.4, 0.2, -0.09]}>
          <boxGeometry args={[0.3, 0.15, 0.02]} />
          <meshStandardMaterial color="#d4af37" metalness={0.85} />
        </mesh>
      </group>

      {/* 4. Balcony Railing (North [Z: -2.8], West [X: -3.0], East [X: 3.0]) */}
      {/* North Front Railing (Waypoint: railing_sunlight at [0, 1.3, -2.0]) */}
      <group position={[0, 0.6, -2.8]}>
        {/* Glass Panels */}
        <mesh>
          <boxGeometry args={[6.2, 1.0, 0.04]} />
          <meshPhysicalMaterial
            color="#bae6fd"
            transparent
            opacity={0.45}
            roughness={0.1}
            transmission={0.85}
          />
        </mesh>
        {/* Top Stainless Steel Handrail */}
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[6.2, 0.08, 0.08]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.92} roughness={0.18} />
        </mesh>
        {/* Balustrade Support Posts */}
        {[-2.8, -1.4, 0, 1.4, 2.8].map((px, i) => (
          <mesh key={`post-${i}`} position={[px, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.1, 12]} />
            <meshStandardMaterial color="#64748b" metalness={0.85} />
          </mesh>
        ))}
      </group>

      {/* West Side Railing */}
      <group position={[-3.1, 0.6, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.04, 1.0, 5.8]} />
          <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.45} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.08, 0.08, 5.8]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.92} />
        </mesh>
      </group>

      {/* East Side Railing */}
      <group position={[3.1, 0.6, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.04, 1.0, 5.8]} />
          <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.45} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.08, 0.08, 5.8]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.92} />
        </mesh>
      </group>

      {/* 5. Clothesline & Hanging Clothes (Waypoint: clothesline at [0, 1.6, 0.5]) */}
      <group position={[0, 0, 0.5]}>
        {/* Dual A-frame Steel Upright Poles */}
        {[-2.3, 2.3].map((poleX, idx) => (
          <group key={`a-pole-${idx}`} position={[poleX, 0, 0]}>
            <mesh position={[0, 1.05, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 2.1, 12]} />
              <meshStandardMaterial color="#475569" metalness={0.75} />
            </mesh>
            {/* T-bar Crosshead */}
            <mesh position={[0, 2.05, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.65, 12]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* 3 Parallel Tensioned Clothesline Cords */}
        {[-0.22, 0, 0.22].map((cz, i) => (
          <mesh key={`balcony-cord-${i}`} position={[0, 2.05, cz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.004, 0.004, 4.6, 6]} />
            <meshBasicMaterial color="#e2e8f0" />
          </mesh>
        ))}

        {/* Hanging Clothes Items with Clothespins */}
        {/* 1. Yellow College T-Shirt */}
        <group position={[-1.3, 1.55, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.54, 0.75, 0.02]} />
            <meshStandardMaterial color="#facc15" roughness={0.8} />
          </mesh>
          {[-0.16, 0.16].map((px, pi) => (
            <mesh key={`pin1-${pi}`} position={[px, 0.44, 0]}>
              <boxGeometry args={[0.025, 0.08, 0.035]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          ))}
        </group>

        {/* 2. Blue Denim Jeans */}
        <group position={[-0.45, 1.45, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.95, 0.02]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.7} />
          </mesh>
          {[-0.12, 0.12].map((px, pi) => (
            <mesh key={`pin2-${pi}`} position={[px, 0.53, 0]}>
              <boxGeometry args={[0.025, 0.08, 0.035]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          ))}
        </group>

        {/* 3. White Cotton Towel */}
        <group position={[0.5, 1.5, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.58, 0.85, 0.03]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.9} />
          </mesh>
          {[-0.18, 0.18].map((px, pi) => (
            <mesh key={`pin3-${pi}`} position={[px, 0.48, 0]}>
              <boxGeometry args={[0.025, 0.08, 0.035]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          ))}
        </group>

        {/* 4. Orange Gym Workout Shirt */}
        <group position={[1.4, 1.55, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.72, 0.02]} />
            <meshStandardMaterial color="#f97316" roughness={0.8} />
          </mesh>
          {[-0.15, 0.15].map((px, pi) => (
            <mesh key={`pin4-${pi}`} position={[px, 0.42, 0]}>
              <boxGeometry args={[0.025, 0.08, 0.035]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          ))}
        </group>
      </group>

      {/* 6. Folding Metal Drying Rack (Waypoint: drying_rack at [-1.2, 1.2, 0.5]) */}
      <group position={[-1.2, 0, 1.6]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[1.0, 1.1, 0.6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} wireframe />
        </mesh>
      </group>

      {/* 7. Potted Balcony Herbs & Houseplants */}
      {[-2.5, 2.5].map((px, i) => (
        <group key={`balcony-plant-${i}`} position={[px, 0, -2.1]}>
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.18, 0.55, 16]} />
            <meshStandardMaterial color="#ea580c" roughness={0.7} />
          </mesh>
          {/* Lush Green Foliage */}
          <mesh position={[0, 0.72, 0]} castShadow>
            <sphereGeometry args={[0.34, 12, 12]} />
            <meshStandardMaterial color="#15803d" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* 8. Distant Chennai City Skyline Silhouettes */}
      <group position={[0, -2.0, -20.0]}>
        {[-15, -10, -5, 0, 5, 10, 15].map((sx, idx) => {
          const h = 9 + (idx % 3) * 3;
          const w = 3.2 + (idx % 2) * 1.6;
          return (
            <mesh key={`balcony-city-${idx}`} position={[sx, h / 2, 0]}>
              <boxGeometry args={[w, h, 2]} />
              <meshBasicMaterial color="#475569" transparent opacity={0.3} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};
