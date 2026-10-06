import React, { useMemo } from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * MetropolitanUnderBridgePark:
 * Vibrant Community Green Space & Sports Arenas situated beneath the elevated metro viaduct:
 * 1. Cricket Turf & Practice Nets:
 *    - Green turf pitch, white crease lines, protective netting cage, and wickets
 * 2. Football Mini-Turf Arena:
 *    - Astro-turf pitch with white field markings, goalposts with nets, perimeter fence
 * 3. Children's Adventure Playground:
 *    - Soft safety rubber flooring, A-frame swing set, slide with ladder, seesaw, jungle gym
 * 4. Landscaped Flower Gardens & Walking Path:
 *    - Winding stone path, vibrant raised flowerbeds (roses, marigolds, lavender), benches
 * 
 * Engineered to fit cleanly under the elevated viaduct (clear height 7.2m, pillars at X: -18)
 * with zero clipping or bridge interference.
 */
export const MetropolitanUnderBridgePark: React.FC = () => {
  const visible = useGameStore((state) => state.metropolitanLayers.parks);

  // Flowerbed clusters
  const flowerClusters = useMemo(() => [
    { x: -14.5, z: 32, col: '#f43f5e', name: 'Roses' },
    { x: -21.5, z: 32, col: '#eab308', name: 'Marigolds' },
    { x: -14.5, z: 46, col: '#a855f7', name: 'Lavender' },
    { x: -21.5, z: 46, col: '#ec4899', name: 'Petunias' },
    { x: -14.5, z: 62, col: '#38bdf8', name: 'Bluebells' },
    { x: -21.5, z: 62, col: '#f97316', name: 'Zinnias' },
    { x: -14.5, z: 80, col: '#ef4444', name: 'Tulips' },
    { x: -21.5, z: 80, col: '#facc15', name: 'Sunflowers' },
  ], []);

  if (!visible) return null;

  return (
    <group name="MetropolitanUnderBridgePark" position={[-18, 0, 0]}>
      {/* 1. Base Landscaped Grass Under the Viaduct (Z: 24 to 90, Width: 12) */}
      <mesh position={[0, 0.02, 57]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 66]} />
        <meshStandardMaterial color="#14532d" roughness={0.9} />
      </mesh>

      {/* Interlocking Paved Pedestrian Walking Path */}
      <mesh position={[0, 0.03, 57]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.0, 65]} />
        <meshStandardMaterial color="#475569" roughness={0.75} />
      </mesh>

      {/* 2. CRICKET PRACTICE NETS & TURF PITCH [Z: 33] */}
      <group position={[0, 0, 33]}>
        {/* Synthetic Cricket Turf Strip */}
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[3.2, 14]} />
          <meshStandardMaterial color="#16a34a" roughness={0.8} />
        </mesh>
        {/* Pitch Crease Markings */}
        {[-5.5, 5.5].map((cz, ci) => (
          <React.Fragment key={`crease-${ci}`}>
            {/* Bowling Crease */}
            <mesh position={[0, 0.05, cz]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.4, 0.1]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Popping Crease */}
            <mesh position={[0, 0.05, cz + (ci === 0 ? 1.0 : -1.0)]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.0, 0.08]} />
              <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
            </mesh>
          </React.Fragment>
        ))}

        {/* Cricket Stumps & Wickets at Both Ends */}
        {[-5.6, 5.6].map((wz, wi) => (
          <group key={`wickets-${wi}`} position={[0, 0, wz]}>
            {[-0.15, 0, 0.15].map((sx, si) => (
              <mesh key={`stump-${si}`} position={[sx, 0.45, 0]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.9, 6]} />
                <meshStandardMaterial color="#d97706" roughness={0.6} />
              </mesh>
            ))}
            {/* Bails on top */}
            <mesh position={[0, 0.91, 0]}>
              <boxGeometry args={[0.36, 0.03, 0.03]} />
              <meshStandardMaterial color="#b45309" roughness={0.5} />
            </mesh>
          </group>
        ))}

        {/* Cricket Net Cage Frame */}
        {/* Steel Uprights */}
        {[-1.8, 1.8].map((nx, ni) => (
          <React.Fragment key={`net-side-${ni}`}>
            {[-6.8, -2.2, 2.2, 6.8].map((nz, nzi) => (
              <mesh key={`net-post-${nzi}`} position={[nx, 1.7, nz]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 3.4, 8]} />
                <meshStandardMaterial color="#64748b" metalness={0.7} />
              </mesh>
            ))}
          </React.Fragment>
        ))}
        {/* Netting Panels (Translucent Wire Net Effect) */}
        {[-1.8, 1.8].map((nx, ni) => (
          <mesh key={`net-wall-${ni}`} position={[nx, 1.7, 0]}>
            <boxGeometry args={[0.02, 3.2, 13.6]} />
            <meshStandardMaterial color="#94a3b8" wireframe opacity={0.4} transparent />
          </mesh>
        ))}
        {/* Backstop Net */}
        <mesh position={[0, 1.7, -6.8]}>
          <boxGeometry args={[3.6, 3.2, 0.02]} />
          <meshStandardMaterial color="#94a3b8" wireframe opacity={0.5} transparent />
        </mesh>

        {/* 3D Label Badge / Signboard */}
        <group position={[2.2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[3.0, 0.5, 0.1]} />
            <meshStandardMaterial color="#065f46" />
          </mesh>
        </group>
      </group>

      {/* 3. MINI FOOTBALL TURF CAGE [Z: 51] */}
      <group position={[0, 0, 51]}>
        {/* Artificial Football Grass */}
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[8.4, 15]} />
          <meshStandardMaterial color="#15803d" roughness={0.85} />
        </mesh>
        {/* White Boundary Touchlines */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8.0, 14.6]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>
        {/* Center Half-way Line & Center Circle */}
        <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8.0, 0.08]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.58, 24]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Football Goalposts at Both Ends */}
        {[-7.2, 7.2].map((gz, gi) => (
          <group key={`goal-${gi}`} position={[0, 0, gz]} rotation={[0, gi === 0 ? 0 : Math.PI, 0]}>
            {/* Goal Frame Uprights */}
            {[-1.6, 1.6].map((gx, gxi) => (
              <mesh key={`gp-${gxi}`} position={[gx, 0.9, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
                <meshStandardMaterial color="#ffffff" metalness={0.5} />
              </mesh>
            ))}
            {/* Crossbar */}
            <mesh position={[0, 1.8, 0]}>
              <boxGeometry args={[3.28, 0.08, 0.08]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* Goal Net */}
            <mesh position={[0, 0.9, -0.6]}>
              <boxGeometry args={[3.2, 1.8, 1.2]} />
              <meshStandardMaterial color="#ffffff" wireframe opacity={0.35} transparent />
            </mesh>
          </group>
        ))}

        {/* Perimeter Safety Fence */}
        {[-4.2, 4.2].map((fx, fi) => (
          <mesh key={`football-fence-${fi}`} position={[fx, 1.4, 0]}>
            <boxGeometry args={[0.04, 2.8, 14.8]} />
            <meshStandardMaterial color="#64748b" wireframe opacity={0.3} transparent />
          </mesh>
        ))}
      </group>

      {/* 4. CHILDREN'S PLAYGROUND & ADVENTURE PARK [Z: 69] */}
      <group position={[0, 0, 69]}>
        {/* Soft Colorful Safety Rubber Tiles */}
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[8.8, 13]} />
          <meshStandardMaterial color="#0284c7" roughness={0.9} />
        </mesh>
        {/* Inner Colorful Contrast Patch */}
        <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.8, 11]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.9} />
        </mesh>

        {/* (A) Children's Swing Set */}
        <group position={[-2.4, 0, -2.5]}>
          {/* A-Frame Posts */}
          {[-1.6, 1.6].map((az, ai) => (
            <group key={`aframe-${ai}`} position={[0, 1.4, az]}>
              <mesh position={[-0.45, 0, 0]} rotation={[0, 0, 0.25]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 2.9, 8]} />
                <meshStandardMaterial color="#dc2626" metalness={0.6} />
              </mesh>
              <mesh position={[0.45, 0, 0]} rotation={[0, 0, -0.25]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 2.9, 8]} />
                <meshStandardMaterial color="#dc2626" metalness={0.6} />
              </mesh>
            </group>
          ))}
          {/* Top Beam */}
          <mesh position={[0, 2.8, 0]}>
            <boxGeometry args={[0.1, 0.1, 3.4]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          {/* 2 Hanging Swing Seats */}
          {[-0.8, 0.8].map((sz, si) => (
            <group key={`swing-${si}`} position={[0, 0, sz]}>
              {/* Chains */}
              {[-0.2, 0.2].map((cx, ci) => (
                <mesh key={`chain-${ci}`} position={[cx, 1.5, 0]}>
                  <cylinderGeometry args={[0.01, 0.01, 2.4, 4]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.9} />
                </mesh>
              ))}
              {/* Seat Board */}
              <mesh position={[0, 0.35, 0]} castShadow>
                <boxGeometry args={[0.55, 0.06, 0.25]} />
                <meshStandardMaterial color="#eab308" roughness={0.5} />
              </mesh>
            </group>
          ))}
        </group>

        {/* (B) Colorful Kids' Slide */}
        <group position={[2.4, 0, -2.0]}>
          {/* Ladder Uprights */}
          <mesh position={[0, 1.1, -1.2]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 2.2, 8]} />
            <meshStandardMaterial color="#2563eb" />
          </mesh>
          {/* Slide Chute Platform */}
          <mesh position={[0, 2.1, -1.0]} castShadow>
            <boxGeometry args={[0.8, 0.1, 0.8]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
          {/* Angled Slide Chute */}
          <mesh position={[0, 1.05, 0.6]} rotation={[0.45, 0, 0]} castShadow>
            <boxGeometry args={[0.65, 0.1, 2.8]} />
            <meshStandardMaterial color="#ef4444" roughness={0.3} />
          </mesh>
        </group>

        {/* (C) Playground Seesaw */}
        <group position={[0, 0, 3.0]}>
          {/* Center Fulcrum */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.2, 0.7, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {/* Seesaw Plank */}
          <mesh position={[0, 0.55, 0]} rotation={[0, 0, 0.15]} castShadow>
            <boxGeometry args={[2.8, 0.08, 0.3]} />
            <meshStandardMaterial color="#16a34a" roughness={0.5} />
          </mesh>
          {/* Handles */}
          {[-1.1, 1.1].map((hx, hi) => (
            <mesh key={`handle-${hi}`} position={[hx, 0.75, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.25, 6]} />
              <meshStandardMaterial color="#eab308" />
            </mesh>
          ))}
        </group>
      </group>

      {/* 5. VIBRANT FLOWER GARDENS & LANDSCAPED SHRUBS */}
      {flowerClusters.map((fc, fi) => (
        <group key={`flower-patch-${fi}`} position={[fc.x + 18, 0.04, fc.z]}>
          {/* Raised Stone Planter Bed */}
          <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.24, 2.4]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          {/* Soil */}
          <mesh position={[0, 0.23, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.8, 2.2]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
          {/* Blossom Spheres */}
          {[-0.6, 0, 0.6].map((bx, bxi) =>
            [-0.7, 0, 0.7].map((bz, bzi) => (
              <mesh key={`bloom-${bxi}-${bzi}`} position={[bx, 0.42 + (bxi * bzi * 0.03), bz]} castShadow>
                <sphereGeometry args={[0.16, 8, 8]} />
                <meshStandardMaterial color={fc.col} roughness={0.5} emissive={fc.col} emissiveIntensity={0.25} />
              </mesh>
            ))
          )}
        </group>
      ))}

      {/* 6. Garden Benches & Park Lampposts */}
      {[28, 44, 60, 76, 86].map((pz, pi) => (
        <React.Fragment key={`park-furn-${pi}`}>
          {/* Park Bench */}
          <group position={[4.6, 0.04, pz]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh position={[0, 0.24, 0]} castShadow>
              <boxGeometry args={[1.4, 0.08, 0.4]} />
              <meshStandardMaterial color="#78350f" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.52, -0.18]} castShadow>
              <boxGeometry args={[1.4, 0.4, 0.06]} />
              <meshStandardMaterial color="#78350f" roughness={0.7} />
            </mesh>
          </group>

          {/* Warm Garden Post Light */}
          <group position={[-4.6, 0, pz]}>
            <mesh position={[0, 1.4, 0]}>
              <cylinderGeometry args={[0.03, 0.05, 2.8, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            <mesh position={[0, 2.85, 0]}>
              <sphereGeometry args={[0.15, 10, 10]} />
              <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={2.5} />
            </mesh>
          </group>
        </React.Fragment>
      ))}
    </group>
  );
};
