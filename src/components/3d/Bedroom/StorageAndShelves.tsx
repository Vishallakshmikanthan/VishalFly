import React from 'react';

/**
 * StorageAndShelves component:
 * - Floating wall shelves above the study desk and bed
 * - Colorful books, binders, tech gadgets
 * - PG tall wardrobe cabinet with textured dark wood finish
 * - Framed wall poster on dark charcoal wall
 */
export const StorageAndShelves: React.FC = () => {
  const shelfMat = <meshStandardMaterial color="#2d2218" roughness={0.7} metalness={0.1} />;
  const metalMat = <meshStandardMaterial color="#1a1d24" metalness={0.8} roughness={0.3} />;

  return (
    <group name="StorageAndShelvesGroup">
      {/* 1. Large PG Wardrobe Cabinet (against Left Wall: X: -3.4, Z: -2.7) */}
      <group position={[-3.35, 0.1, -2.7]}>
        {/* Main Cabinet Body */}
        <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 3.2, 1.8]} />
          <meshStandardMaterial color="#181512" roughness={0.75} />
        </mesh>

        {/* Dual Door Panels */}
        <mesh position={[0.46, 1.6, -0.44]} castShadow>
          <boxGeometry args={[0.02, 3.12, 0.86]} />
          <meshStandardMaterial color="#241e19" roughness={0.65} />
        </mesh>
        <mesh position={[0.46, 1.6, 0.44]} castShadow>
          <boxGeometry args={[0.02, 3.12, 0.86]} />
          <meshStandardMaterial color="#241e19" roughness={0.65} />
        </mesh>

        {/* Brushed Gold Handles */}
        <mesh position={[0.48, 1.6, -0.05]} castShadow>
          <boxGeometry args={[0.025, 0.6, 0.025]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.48, 1.6, 0.05]} castShadow>
          <boxGeometry args={[0.025, 0.6, 0.025]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* 2. Floating Wall Shelves above Study Desk (Back Wall: Z = -3.8) */}
      {/* Lower Desk Shelf */}
      <group position={[2.1, 2.3, -3.8]}>
        {/* Shelf board */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.05, 0.35]} />
          {shelfMat}
        </mesh>
        {/* Wall brackets */}
        {[-0.9, 0.9].map((x, i) => (
          <mesh key={`bracket-l-${i}`} position={[x, -0.08, 0]}>
            <boxGeometry args={[0.04, 0.16, 0.32]} />
            {metalMat}
          </mesh>
        ))}

        {/* Books on lower shelf */}
        <group position={[-0.7, 0.18, 0]}>
          {[
            { color: '#dc2626', width: 0.08, height: 0.34, depth: 0.25 }, // Red book
            { color: '#2563eb', width: 0.07, height: 0.31, depth: 0.23 }, // Blue book
            { color: '#16a34a', width: 0.09, height: 0.36, depth: 0.26 }, // Green book
            { color: '#d97706', width: 0.06, height: 0.29, depth: 0.22 }, // Amber book
            { color: '#7c3aed', width: 0.1, height: 0.35, depth: 0.24 },  // Purple book
          ].map((b, idx) => (
            <mesh
              key={`book-1-${idx}`}
              position={[idx * 0.09 - 0.2, 0, 0]}
              castShadow
            >
              <boxGeometry args={[b.width, b.height, b.depth]} />
              <meshStandardMaterial color={b.color} roughness={0.7} />
            </mesh>
          ))}
        </group>

        {/* Small tech trophy / cube figurine on lower shelf */}
        <mesh position={[0.7, 0.12, 0]} rotation={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.16, 0.2, 0.16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Upper Desk Shelf */}
      <group position={[2.1, 2.95, -3.8]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.05, 0.32]} />
          {shelfMat}
        </mesh>
        {/* Wall brackets */}
        {[-0.8, 0.8].map((x, i) => (
          <mesh key={`bracket-u-${i}`} position={[x, -0.08, 0]}>
            <boxGeometry args={[0.04, 0.16, 0.29]} />
            {metalMat}
          </mesh>
        ))}

        {/* Horizontal Stack of books */}
        <group position={[0.45, 0.08, 0]}>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 0.06, 0.22]} />
            <meshStandardMaterial color="#0284c7" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.06, 0]} rotation={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[0.28, 0.05, 0.2]} />
            <meshStandardMaterial color="#ea580c" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.11, 0]} rotation={[0, -0.05, 0]} castShadow>
            <boxGeometry args={[0.26, 0.05, 0.19]} />
            <meshStandardMaterial color="#10b981" roughness={0.6} />
          </mesh>
        </group>

        {/* Tiny desk speaker / smart device */}
        <mesh position={[-0.55, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, 0.16, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* 3. Floating Shelf above Bed (Back Wall: X: -2.3, Z: -3.8) */}
      <group position={[-2.3, 2.7, -3.8]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.05, 0.28]} />
          {shelfMat}
        </mesh>

        {/* Books & Framed photo */}
        <mesh position={[-0.4, 0.14, 0]} castShadow>
          <boxGeometry args={[0.08, 0.24, 0.2]} />
          <meshStandardMaterial color="#e11d48" roughness={0.6} />
        </mesh>
        <mesh position={[-0.3, 0.13, 0]} castShadow>
          <boxGeometry args={[0.07, 0.22, 0.19]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.6} />
        </mesh>

        {/* Mini framed portrait */}
        <group position={[0.3, 0.14, -0.02]} rotation={[-0.1, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.25, 0.26, 0.02]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.012]}>
            <planeGeometry args={[0.21, 0.22]} />
            <meshBasicMaterial color="#0369a1" />
          </mesh>
        </group>
      </group>

      {/* 4. Framed "LOCK IN" / Engineering Poster above the desk area */}
      <group position={[0.5, 2.5, -3.84]}>
        {/* Frame */}
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.95, 0.03]} />
          <meshStandardMaterial color="#090d16" roughness={0.4} />
        </mesh>
        {/* Poster Canvas */}
        <mesh position={[0, 0, 0.018]}>
          <planeGeometry args={[0.62, 0.87]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.9}
            emissive="#ea580c"
            emissiveIntensity={0.08}
          />
        </mesh>
        {/* Poster graphic accent stripes */}
        <mesh position={[0, 0.2, 0.02]}>
          <planeGeometry args={[0.45, 0.06]} />
          <meshBasicMaterial color="#f97316" />
        </mesh>
        <mesh position={[0, -0.05, 0.02]}>
          <planeGeometry args={[0.35, 0.03]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>
    </group>
  );
};
