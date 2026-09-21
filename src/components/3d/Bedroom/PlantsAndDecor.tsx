import React from 'react';

/**
 * PlantsAndDecor component:
 * - Indoor Monstera / tropical houseplant in ceramic pot
 * - Small succulent pot on study shelf
 * - Woven bedside floor rug
 * - Analog wall clock showing 06:00
 * - Neat PG slippers near the bed
 */
export const PlantsAndDecor: React.FC = () => {
  const leafMat = (
    <meshStandardMaterial
      color="#15803d"
      roughness={0.4}
      metalness={0.1}
      side={2}
    />
  );
  const darkLeafMat = (
    <meshStandardMaterial
      color="#166534"
      roughness={0.45}
      side={2}
    />
  );

  return (
    <group name="PlantsAndDecorGroup">
      {/* 1. Large Indoor Houseplant (Near Balcony / Desk corner: X: 3.4, Z: -2.7) */}
      <group position={[3.35, 0.1, -1.2]}>
        {/* Wooden Stand Legs */}
        {[0, 1, 2].map((i) => {
          const angle = (i * 2 * Math.PI) / 3;
          const x = Math.cos(angle) * 0.22;
          const z = Math.sin(angle) * 0.22;
          return (
            <mesh key={`stand-leg-${i}`} position={[x, 0.25, z]} castShadow>
              <cylinderGeometry args={[0.018, 0.018, 0.5, 8]} />
              <meshStandardMaterial color="#78350f" roughness={0.7} />
            </mesh>
          );
        })}

        {/* Ceramic Pot */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.2, 0.42, 20]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.35} />
        </mesh>

        {/* Soil */}
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.04, 16]} />
          <meshStandardMaterial color="#291e17" roughness={0.9} />
        </mesh>

        {/* Stems and Tropical Leaves */}
        <group position={[0, 0.64, 0]}>
          {/* Central tall leaf */}
          <group rotation={[0.2, 0.5, 0.1]}>
            <mesh position={[0, 0.35, 0]} castShadow>
              <cylinderGeometry args={[0.01, 0.015, 0.7, 8]} />
              <meshStandardMaterial color="#166534" />
            </mesh>
            <mesh position={[0, 0.7, 0]} rotation={[0.4, 0, 0]} castShadow>
              <boxGeometry args={[0.28, 0.45, 0.01]} />
              {leafMat}
            </mesh>
          </group>

          {/* Leaf 2 (arching left) */}
          <group rotation={[-0.3, -1.2, 0.2]}>
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.01, 0.014, 0.6, 8]} />
              <meshStandardMaterial color="#166534" />
            </mesh>
            <mesh position={[0, 0.6, 0]} rotation={[0.5, 0, 0]} castShadow>
              <boxGeometry args={[0.26, 0.4, 0.01]} />
              {darkLeafMat}
            </mesh>
          </group>

          {/* Leaf 3 (arching right) */}
          <group rotation={[0.4, 2.2, -0.2]}>
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.01, 0.014, 0.5, 8]} />
              <meshStandardMaterial color="#166534" />
            </mesh>
            <mesh position={[0, 0.5, 0]} rotation={[0.55, 0, 0]} castShadow>
              <boxGeometry args={[0.24, 0.38, 0.01]} />
              {leafMat}
            </mesh>
          </group>

          {/* Leaf 4 (front arching) */}
          <group rotation={[0.5, 0, 0]}>
            <mesh position={[0, 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.01, 0.012, 0.4, 8]} />
              <meshStandardMaterial color="#166534" />
            </mesh>
            <mesh position={[0, 0.4, 0]} rotation={[0.6, 0, 0]} castShadow>
              <boxGeometry args={[0.22, 0.32, 0.01]} />
              {darkLeafMat}
            </mesh>
          </group>
        </group>
      </group>

      {/* 2. Small Potted Succulent on Study Desk */}
      <group position={[3.0, 1.02, -2.0]}>
        {/* Pot */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.045, 0.1, 8]} />
          <meshStandardMaterial color="#c2410c" roughness={0.8} />
        </mesh>
        {/* Succulent rosette */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={`succulent-petal-${i}`}
            position={[0, 0.11, 0]}
            rotation={[0.35, (i * 2 * Math.PI) / 5, 0]}
            castShadow
          >
            <boxGeometry args={[0.04, 0.06, 0.015]} />
            <meshStandardMaterial color="#22c55e" roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* 3. Woven Bedroom Area Rug */}
      <group position={[-0.5, 0.106, 0.2]}>
        {/* Rug base */}
        <mesh receiveShadow>
          <boxGeometry args={[3.2, 0.012, 2.6]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.95} />
        </mesh>
        {/* Rug inner border line */}
        <mesh position={[0, 0.007, 0]} receiveShadow>
          <boxGeometry args={[2.9, 0.005, 2.3]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
        </mesh>
        {/* Geometric accent diamond in center */}
        <mesh position={[0, 0.01, 0]} rotation={[0, Math.PI / 4, 0]}>
          <planeGeometry args={[0.8, 0.8]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* 4. Analog Wall Clock on Right Wall (X = 3.88, Y = 2.8, Z = 0.5) showing 06:00 */}
      <group position={[3.88, 2.8, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Outer casing */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Clock Face dial */}
        <mesh position={[0, 0, 0.022]}>
          <circleGeometry args={[0.26, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Center pin */}
        <mesh position={[0, 0, 0.035]}>
          <circleGeometry args={[0.018, 16]} />
          <meshBasicMaterial color="#d4af37" />
        </mesh>
        {/* Hour Hand (pointing directly at 6 - downwards) */}
        <mesh position={[0, -0.07, 0.028]}>
          <planeGeometry args={[0.016, 0.12]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        {/* Minute Hand (pointing directly at 12 - upwards) */}
        <mesh position={[0, 0.09, 0.028]}>
          <planeGeometry args={[0.01, 0.18]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* 5. Vishal's PG Slippers near the bed */}
      <group position={[-0.8, 0.12, -0.4]}>
        {/* Left slipper */}
        <mesh position={[-0.14, 0.02, 0]} castShadow>
          <boxGeometry args={[0.13, 0.04, 0.32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        {/* Right slipper */}
        <mesh position={[0.14, 0.02, 0]} castShadow>
          <boxGeometry args={[0.13, 0.04, 0.32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};
