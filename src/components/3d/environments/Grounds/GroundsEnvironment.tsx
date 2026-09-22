import React from 'react';
import { TimeOfDayLighting } from '../../common/TimeOfDayLighting';
import { InteractionHighlight } from '../../common/InteractionHighlight';

/**
 * High-Fidelity 3D Apartment Grounds Environment (Milestone 5 Polish):
 * - PG apartment exterior building facade with entrance porch & canopy
 * - Connected perimeter stone paver walking circuit for family calls
 * - Main apartment security gate with guard cabin & food delivery pickup beacon
 * - Central courtyard circular planter with ornamental trees & garden benches
 * - Warm ambient evening & street bollard lighting
 * - Distant Chennai urban skyline backdrop
 * - Dynamic Time-of-Day lighting & contextual interaction highlight
 */
export const GroundsEnvironment: React.FC = () => {
  return (
    <group name="GroundsEnvironment">
      {/* 1. Dynamic Simulation-Driven Lighting */}
      <TimeOfDayLighting isInterior={false} accentColor="#fbbf24" />
      <pointLight position={[-3, 2.8, -2.5]} intensity={1.2} color="#fbbf24" distance={8} />
      <pointLight position={[2.5, 2.8, -2.5]} intensity={1.2} color="#fbbf24" distance={8} />
      <pointLight position={[0, 2.8, 4.0]} intensity={1.4} color="#f59e0b" distance={8} />

      {/* Active Interaction Point Beacon (Gate pickup / walking node) */}
      <InteractionHighlight color="#f59e0b" />

      {/* 2. Courtyard Ground & Lush Grass Lawn */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[11.0, 11.0]} />
        <meshStandardMaterial color="#14532d" roughness={0.92} />
      </mesh>

      {/* 3. Connected Perimeter Stone Paver Walking Circuit */}
      {/* North Path connecting nodes 1 and 2 */}
      <mesh position={[0, 0.005, -2.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6.8, 1.3]} />
        <meshStandardMaterial color="#475569" roughness={0.75} />
      </mesh>
      {/* South Path connecting nodes 4 and 3 */}
      <mesh position={[0, 0.005, 2.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6.8, 1.3]} />
        <meshStandardMaterial color="#475569" roughness={0.75} />
      </mesh>
      {/* West Path connecting nodes 1 and 4 */}
      <mesh position={[-3.0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.3, 5.2]} />
        <meshStandardMaterial color="#475569" roughness={0.75} />
      </mesh>
      {/* East Path connecting nodes 2 and 3 */}
      <mesh position={[2.8, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.3, 5.2]} />
        <meshStandardMaterial color="#475569" roughness={0.75} />
      </mesh>
      {/* South Gate Extension Walkway (to Security Gate at Z: 4.2) */}
      <mesh position={[0, 0.005, 3.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.5, 2.4]} />
        <meshStandardMaterial color="#475569" roughness={0.75} />
      </mesh>
      {/* Building Exit Threshold Path */}
      <mesh position={[-3.1, 0.005, 3.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.4, 1.4]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* 4. PG Apartment Building Exterior Facade (North [Z: -4.8]) */}
      <group position={[0, 0, -4.8]}>
        {/* Main Multi-Story Facade Wall */}
        <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[11.0, 6.4, 1.2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.85} />
        </mesh>
        {/* Architectural Horizontal Shadow Louver */}
        <mesh position={[0, 2.4, 0.65]} castShadow>
          <boxGeometry args={[11.0, 0.12, 0.25]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        {/* Upper Floor Balconies */}
        {[-3.2, 0, 3.2].map((bx, i) => (
          <group key={`balcony-exterior-${i}`} position={[bx, 3.8, 0.65]}>
            {/* Balcony Base Slab */}
            <mesh castShadow>
              <boxGeometry args={[2.0, 0.15, 0.7]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
            {/* Glass Railing */}
            <mesh position={[0, 0.5, 0.32]}>
              <boxGeometry args={[1.9, 0.85, 0.04]} />
              <meshStandardMaterial
                color="#0284c7"
                metalness={0.7}
                roughness={0.15}
                transparent
                opacity={0.65}
              />
            </mesh>
          </group>
        ))}

        {/* PG Entrance Porch & Canopy (near waypoint building_exit: [-3.2, 1.2, 3.2]) */}
        <group position={[-2.8, 0, 0.6]}>
          {/* Overhead Modern Glass/Steel Canopy */}
          <mesh position={[0, 2.5, 0.7]} castShadow>
            <boxGeometry args={[2.6, 0.14, 1.6]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>
          {/* Canopy Structural Steel Pillars */}
          {[-1.1, 1.1].map((px, idx) => (
            <mesh key={`canopy-pillar-${idx}`} position={[px, 1.25, 1.35]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 2.5, 12]} />
              <meshStandardMaterial color="#64748b" metalness={0.7} />
            </mesh>
          ))}
          {/* Double Sliding Glass Entrance Doors */}
          <mesh position={[0, 1.15, 0.05]}>
            <boxGeometry args={[1.8, 2.3, 0.06]} />
            <meshStandardMaterial color="#0284c7" transparent opacity={0.55} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* 5. Main Apartment Security Gate (Waypoint: apartment_gate at [0, 1.2, 4.2]) */}
      <group position={[0, 0, 4.3]}>
        {/* Massive Stone Pillar Gateposts */}
        {[-1.6, 1.6].map((gx, idx) => (
          <group key={`gatepost-${idx}`} position={[gx, 0, 0]}>
            <mesh position={[0, 1.35, 0]} castShadow>
              <boxGeometry args={[0.45, 2.7, 0.45]} />
              <meshStandardMaterial color="#334155" roughness={0.65} />
            </mesh>
            {/* Pyramid Capstone */}
            <mesh position={[0, 2.8, 0]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.36, 0.25, 4]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          </group>
        ))}

        {/* Black Wrought Iron Sliding Gate */}
        <group position={[0, 1.05, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.7, 1.9, 0.06]} />
            <meshStandardMaterial color="#09090b" metalness={0.85} roughness={0.25} wireframe />
          </mesh>
        </group>

        {/* Security Guard Cabin */}
        <group position={[2.5, 0, 0]}>
          <mesh position={[0, 1.25, 0]} castShadow>
            <boxGeometry args={[1.3, 2.5, 1.3]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
          </mesh>
          {/* Security Window with Glow */}
          <mesh position={[0, 1.35, 0.66]}>
            <planeGeometry args={[0.85, 0.75]} />
            <meshStandardMaterial color="#fed7aa" emissive="#fbbf24" emissiveIntensity={0.6} />
          </mesh>
        </group>

        {/* Food Delivery Pickup Stand / Beacon Platform */}
        <group position={[-0.8, 0, 0.5]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.26, 0.9, 12]} />
            <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.92, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
            <meshStandardMaterial color="#d97706" metalness={0.4} />
          </mesh>
        </group>
      </group>

      {/* 6. Courtyard Landscaping: Center Feature, Trees, & Benches */}
      {/* Elevated Circular Stone Planter Bed */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[1.2, 1.25, 0.36, 24]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        {/* Sculpted Flowering Ornamental Bush */}
        <mesh position={[0, 0.75, 0]} castShadow>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial color="#166534" roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.15, 0]} castShadow>
          <sphereGeometry args={[0.45, 12, 12]} />
          <meshStandardMaterial color="#15803d" roughness={0.85} />
        </mesh>
      </group>

      {/* Courtyard Landscaping Trees */}
      {[
        [-1.9, 2.0, -1.2],
        [1.9, 2.0, 1.2],
        [-1.9, 2.0, 1.2],
      ].map(([x, h, z], i) => (
        <group key={`garden-tree-${i}`} position={[x, 0, z]}>
          {/* Tree Trunk */}
          <mesh position={[0, h / 2, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.14, h, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
          {/* Tree Foliage Layers */}
          <mesh position={[0, h + 0.3, 0]} castShadow>
            <coneGeometry args={[0.75, 1.4, 8]} />
            <meshStandardMaterial color="#14532d" roughness={0.85} />
          </mesh>
          <mesh position={[0, h + 0.9, 0]} castShadow>
            <coneGeometry args={[0.55, 1.1, 8]} />
            <meshStandardMaterial color="#166534" roughness={0.85} />
          </mesh>
        </group>
      ))}

      {/* Garden Benches along Walking Path */}
      {[
        [0, -1.6, 0],
        [1.8, 0, -Math.PI / 2],
      ].map(([bx, bz, rot], i) => (
        <group key={`bench-${i}`} position={[bx, 0, bz]} rotation={[0, rot, 0]}>
          {/* Wooden Slats */}
          <mesh position={[0, 0.42, 0]} castShadow>
            <boxGeometry args={[1.2, 0.05, 0.45]} />
            <meshStandardMaterial color="#854d0e" roughness={0.7} />
          </mesh>
          {/* Backrest */}
          <mesh position={[0, 0.72, -0.2]} rotation={[0.1, 0, 0]} castShadow>
            <boxGeometry args={[1.2, 0.32, 0.04]} />
            <meshStandardMaterial color="#854d0e" roughness={0.7} />
          </mesh>
          {/* Cast Iron Legs */}
          {[-0.5, 0.5].map((lx, li) => (
            <mesh key={`bl-${li}`} position={[lx, 0.21, 0]} castShadow>
              <boxGeometry args={[0.06, 0.42, 0.42]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 7. Warm Street Bollard Lanterns along Perimeter Walking Circuit */}
      {[
        [-3.0, -2.5],
        [2.8, -2.5],
        [-3.0, 2.5],
        [2.8, 2.5],
        [0, -2.5],
      ].map(([bx, bz], i) => (
        <group key={`grounds-bollard-${i}`} position={[bx, 0, bz]}>
          <mesh position={[0, 0.38, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.76, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.75} />
          </mesh>
          <mesh position={[0, 0.76, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}

      {/* 8. Distant Chennai City Skyline Silhouette Backdrop */}
      <group position={[0, -2.0, -22.0]}>
        {[-16, -11, -6, 0, 6, 11, 16].map((sx, idx) => {
          const h = 10 + (idx % 3) * 4;
          const w = 3.5 + (idx % 2) * 1.5;
          return (
            <mesh key={`city-tower-${idx}`} position={[sx, h / 2, 0]}>
              <boxGeometry args={[w, h, 2]} />
              <meshBasicMaterial color="#334155" transparent opacity={0.3} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};
