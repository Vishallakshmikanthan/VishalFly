import React from 'react';

/**
 * Procedural 3D Apartment Grounds Environment:
 * - Building exterior facade and PG entrance porch
 * - Perimeter walkway path for evening phone call walks
 * - Courtyard lawn with bushes, trees, and planters
 * - Warm ambient evening and street bollard lighting
 * - Main apartment security gate for food delivery pickup
 */
export const GroundsEnvironment: React.FC = () => {
  return (
    <group name="GroundsEnvironment">
      {/* 1. Evening Lighting Rig */}
      <ambientLight intensity={0.4} color="#334155" />
      <directionalLight
        position={[6, 12, 4]}
        intensity={0.8}
        color="#fdba74" // Warm dusk sunset directional
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Warm courtyard street lights */}
      <pointLight position={[-3, 2.5, -2.5]} intensity={1.5} color="#fbbf24" distance={8} />
      <pointLight position={[2.5, 2.5, -2.5]} intensity={1.5} color="#fbbf24" distance={8} />
      <pointLight position={[0, 2.5, 3.8]} intensity={1.5} color="#fbbf24" distance={8} />

      {/* 2. Courtyard Ground & Grass */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10.5, 10.5]} />
        <meshStandardMaterial color="#14532d" roughness={0.9} /> {/* Deep lawn grass */}
      </mesh>

      {/* 3. Perimeter Paved Walking Path (Circuit for walking call) */}
      {/* North Path */}
      <mesh position={[0, 0.01, -2.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6.5, 1.2]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      {/* South Path */}
      <mesh position={[0, 0.01, 2.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6.5, 1.2]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      {/* West Path */}
      <mesh position={[-2.8, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.2, 5.0]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      {/* East Path */}
      <mesh position={[2.8, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.2, 5.0]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      {/* Path to Apartment Gate (South extension) */}
      <mesh position={[0, 0.01, 3.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.4, 2.2]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* 4. PG Apartment Building Exterior Facade (North Wall) */}
      <group position={[0, 0, -4.8]}>
        <mesh position={[0, 3.0, 0]} castShadow>
          <boxGeometry args={[10.5, 6.0, 1.0]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
        </mesh>
        {/* Balcony Railings on higher floors */}
        {[-3.0, 0, 3.0].map((bx, i) => (
          <group key={i} position={[bx, 3.8, 0.55]}>
            <mesh>
              <boxGeometry args={[1.8, 0.8, 0.1]} />
              <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.2} transparent opacity={0.7} />
            </mesh>
          </group>
        ))}
        {/* PG Entrance Porch & Canopy */}
        <group position={[-2.5, 0, 0.5]}>
          <mesh position={[0, 2.4, 0.6]} castShadow>
            <boxGeometry args={[2.4, 0.15, 1.4]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>
          {/* Porch pillars */}
          {[-1.0, 1.0].map((px, idx) => (
            <mesh key={idx} position={[px, 1.2, 1.2]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 2.4, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.5} />
            </mesh>
          ))}
          {/* Glass Entrance Double Doors */}
          <mesh position={[0, 1.1, 0.05]}>
            <boxGeometry args={[1.6, 2.2, 0.05]} />
            <meshStandardMaterial color="#0284c7" transparent opacity={0.6} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* 5. Main Apartment Security Gate (South [0, 0, 4.2]) */}
      <group position={[0, 0, 4.4]}>
        {/* Stone Gateposts */}
        {[-1.5, 1.5].map((gx, idx) => (
          <mesh key={idx} position={[gx, 1.25, 0]} castShadow>
            <boxGeometry args={[0.4, 2.5, 0.4]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
        ))}
        {/* Black wrought iron sliding gate */}
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[2.6, 1.8, 0.05]} />
          <meshStandardMaterial color="#09090b" metalness={0.8} roughness={0.3} wireframe />
        </mesh>
        {/* Security Cabin */}
        <group position={[2.4, 0, 0]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[1.2, 2.4, 1.2]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.3, 0.6]}>
            <boxGeometry args={[0.8, 0.7, 0.05]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} />
          </mesh>
        </group>
      </group>

      {/* 6. Courtyard Greenery: Trees and Planters */}
      {/* Center Garden Feature */}
      <group position={[0, 0, 0]}>
        {/* Circular stone planter bed */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[1.1, 1.1, 0.3, 16]} />
          <meshStandardMaterial color="#64748b" roughness={0.7} />
        </mesh>
        {/* Ornamental Garden Bush */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <sphereGeometry args={[0.75, 12, 12]} />
          <meshStandardMaterial color="#15803d" roughness={0.8} />
        </mesh>
      </group>

      {/* Courtyard Trees */}
      {[
        [-1.8, 1.8, -1.2],
        [1.8, 1.8, 1.2],
        [-1.8, 1.8, 1.2],
      ].map(([x, h, z], i) => (
        <group key={`tree-${i}`} position={[x, 0, z]}>
          <mesh position={[0, h / 2, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, h, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
          <mesh position={[0, h + 0.3, 0]} castShadow>
            <coneGeometry args={[0.65, 1.2, 8]} />
            <meshStandardMaterial color="#166534" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* 7. Bollard Lights along Walking Perimeter */}
      {[
        [-2.8, -2.5],
        [2.8, -2.5],
        [-2.8, 2.5],
        [2.8, 2.5],
        [0, -2.5],
      ].map(([bx, bz], i) => (
        <group key={`bollard-${i}`} position={[bx, 0, bz]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.7, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.65, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
