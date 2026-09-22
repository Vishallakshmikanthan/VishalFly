import React from 'react';

/**
 * Procedural 3D Balcony Environment:
 * - Ceramic terrace floor tiles
 * - Modern metal and glass balcony railing
 * - Clothesline with hanging laundry (shirts, towels)
 * - Bedroom sliding door frame
 * - Potted herbs and plants
 * - Distant Chennai urban skyline silhouette
 * - Bright sunlit daylight atmosphere
 */
export const BalconyEnvironment: React.FC = () => {
  return (
    <group name="BalconyEnvironment">
      {/* 1. Sunlight Rig */}
      <ambientLight intensity={0.65} color="#e0f2fe" />
      <directionalLight
        position={[8, 12, -4]}
        intensity={1.5}
        color="#fffbeb"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 2.8, 2.2]} intensity={1.0} color="#fbbf24" distance={6} />

      {/* 2. Terracotta Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6.4, 6.4]} />
        <meshStandardMaterial color="#c2410c" roughness={0.7} />
      </mesh>

      {/* 3. Bedroom Wall & Sliding Door Frame (South Wall [z: 2.8]) */}
      <group position={[0, 1.9, 3.1]}>
        {/* Wall */}
        <mesh>
          <boxGeometry args={[6.4, 3.8, 0.2]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
        </mesh>
        {/* Sliding Door Frame */}
        <mesh position={[0, -0.6, -0.1]}>
          <boxGeometry args={[2.4, 2.6, 0.05]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} />
        </mesh>
        {/* Glass Panels */}
        {[-0.55, 0.55].map((gx, idx) => (
          <mesh key={idx} position={[gx, -0.6, -0.08]}>
            <planeGeometry args={[1.0, 2.4]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.4} roughness={0.1} />
          </mesh>
        ))}
      </group>

      {/* 4. Balcony Railing (North [z: -2.8], West [x: -3.0], East [x: 3.0]) */}
      {/* North Front Railing */}
      <group position={[0, 0.6, -2.8]}>
        {/* Glass panels */}
        <mesh>
          <boxGeometry args={[6.0, 1.0, 0.04]} />
          <meshPhysicalMaterial
            color="#bae6fd"
            transparent
            opacity={0.5}
            roughness={0.1}
            transmission={0.8}
          />
        </mesh>
        {/* Top Handrail */}
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[6.0, 0.08, 0.08]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Railing Posts */}
        {[-2.8, -1.4, 0, 1.4, 2.8].map((px, i) => (
          <mesh key={i} position={[px, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.1, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* West Side Railing */}
      <group position={[-3.0, 0.6, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.04, 1.0, 5.6]} />
          <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.08, 0.08, 5.6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} />
        </mesh>
      </group>

      {/* East Side Railing */}
      <group position={[3.0, 0.6, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.04, 1.0, 5.6]} />
          <meshPhysicalMaterial color="#bae6fd" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.08, 0.08, 5.6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} />
        </mesh>
      </group>

      {/* 5. Clothesline & Hanging Clothes ([0, 1.6, 0.5]) */}
      <group position={[0, 0, 0.5]}>
        {/* Clothesline A-frame Poles */}
        {[-2.2, 2.2].map((poleX, idx) => (
          <group key={idx} position={[poleX, 0, 0]}>
            <mesh position={[0, 1.0, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 2.0, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.7} />
            </mesh>
            <mesh position={[0, 1.95, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
          </group>
        ))}

        {/* 3 Parallel Clothesline Cords */}
        {[-0.2, 0, 0.2].map((cz, i) => (
          <mesh key={`cord-${i}`} position={[0, 1.95, cz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.004, 0.004, 4.4, 6]} />
            <meshBasicMaterial color="#e2e8f0" />
          </mesh>
        ))}

        {/* Hanging Clothes Items */}
        {/* 1. Yellow College T-Shirt */}
        <group position={[-1.2, 1.5, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.7, 0.02]} />
            <meshStandardMaterial color="#facc15" roughness={0.8} />
          </mesh>
          {/* Wooden Clothespins */}
          {[-0.15, 0.15].map((px, pi) => (
            <mesh key={pi} position={[px, 0.4, 0]}>
              <boxGeometry args={[0.03, 0.08, 0.04]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          ))}
        </group>

        {/* 2. Blue Denim Jeans */}
        <group position={[-0.4, 1.4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.9, 0.02]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.7} />
          </mesh>
          {[-0.12, 0.12].map((px, pi) => (
            <mesh key={pi} position={[px, 0.5, 0]}>
              <boxGeometry args={[0.03, 0.08, 0.04]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          ))}
        </group>

        {/* 3. White Cotton Towel */}
        <group position={[0.5, 1.45, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.55, 0.8, 0.03]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.9} />
          </mesh>
          {[-0.18, 0.18].map((px, pi) => (
            <mesh key={pi} position={[px, 0.45, 0]}>
              <boxGeometry args={[0.03, 0.08, 0.04]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          ))}
        </group>

        {/* 4. Orange Gym Tee */}
        <group position={[1.3, 1.5, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.48, 0.68, 0.02]} />
            <meshStandardMaterial color="#f97316" roughness={0.8} />
          </mesh>
          {[-0.14, 0.14].map((px, pi) => (
            <mesh key={pi} position={[px, 0.39, 0]}>
              <boxGeometry args={[0.03, 0.08, 0.04]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          ))}
        </group>
      </group>

      {/* 6. Distant City Skyline Silhouettes (North background) */}
      <group position={[0, -2.0, -18.0]}>
        {[-14, -10, -6, -2, 2, 6, 10, 14].map((sx, idx) => {
          const h = 8 + (idx % 4) * 3;
          const w = 3 + (idx % 2) * 1.5;
          return (
            <mesh key={idx} position={[sx, h / 2, 0]}>
              <boxGeometry args={[w, h, 2]} />
              <meshBasicMaterial color="#64748b" transparent opacity={0.35} />
            </mesh>
          );
        })}
      </group>

      {/* 7. Potted Balcony Houseplants */}
      {[-2.4, 2.4].map((px, i) => (
        <group key={`pot-${i}`} position={[px, 0, -2.2]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.16, 0.5, 12]} />
            <meshStandardMaterial color="#ea580c" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.65, 0]} castShadow>
            <sphereGeometry args={[0.3, 10, 10]} />
            <meshStandardMaterial color="#15803d" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
