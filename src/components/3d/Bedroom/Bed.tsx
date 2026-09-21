import React from 'react';

/**
 * Bed component:
 * - Bed frame in warm teak wood with headboard
 * - Crisp white mattress and bedsheet
 * - Fluffy white pillows
 * - Signature vivid orange blanket with draped fold
 * - Bedside table with warm nightstand lamp
 */
export const Bed: React.FC = () => {
  return (
    <group position={[-2.3, 0.1, -2.1]} name="BedGroup">
      {/* 1. Bed Frame & Headboard */}
      {/* Headboard */}
      <mesh position={[0, 0.9, -1.6]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.6, 0.14]} />
        <meshStandardMaterial color="#2c1d14" roughness={0.65} metalness={0.1} />
      </mesh>

      {/* Headboard fabric accent cushion */}
      <mesh position={[0, 0.95, -1.52]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 1.1, 0.05]} />
        <meshStandardMaterial color="#383d47" roughness={0.9} />
      </mesh>

      {/* Base Platform */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.3, 3.1]} />
        <meshStandardMaterial color="#2c1d14" roughness={0.65} metalness={0.1} />
      </mesh>

      {/* 4 Sturdy Legs */}
      {[
        [-1.15, 0.1, -1.45],
        [1.15, 0.1, -1.45],
        [-1.15, 0.1, 1.45],
        [1.15, 0.1, 1.45],
      ].map(([x, y, z], i) => (
        <mesh key={`leg-${i}`} position={[x, y, z]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
          <meshStandardMaterial color="#1a120c" roughness={0.6} />
        </mesh>
      ))}

      {/* 2. Mattress */}
      <mesh position={[0, 0.55, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 0.35, 2.95]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.92} />
      </mesh>

      {/* 3. White Sleeping Pillows */}
      {/* Left Pillow */}
      <group position={[-0.6, 0.78, -1.1]} rotation={[-0.2, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.85, 0.16, 0.55]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
        </mesh>
      </group>

      {/* Right Pillow */}
      <group position={[0.6, 0.78, -1.1]} rotation={[-0.2, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.85, 0.16, 0.55]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
        </mesh>
      </group>

      {/* Front Accent Pillow */}
      <group position={[0, 0.82, -0.75]} rotation={[-0.35, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.14, 0.4]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
      </group>

      {/* 4. Vivid Orange Blanket / Duvet */}
      {/* Main Blanket Covering */}
      <mesh position={[0, 0.73, 0.45]} castShadow receiveShadow>
        <boxGeometry args={[2.34, 0.14, 2.1]} />
        <meshStandardMaterial
          color="#ea580c" // Vivid orange
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>

      {/* Folded Top Hem of the Orange Blanket */}
      <mesh position={[0, 0.78, -0.55]} castShadow receiveShadow>
        <boxGeometry args={[2.35, 0.08, 0.28]} />
        <meshStandardMaterial
          color="#c2410c" // Slightly deeper fold shadow orange
          roughness={0.8}
        />
      </mesh>

      {/* Blanket Overhang on Left Edge */}
      <mesh position={[-1.18, 0.55, 0.45]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.4, 2.1]} />
        <meshStandardMaterial color="#ea580c" roughness={0.75} />
      </mesh>

      {/* Blanket Overhang on Right Edge */}
      <mesh position={[1.18, 0.55, 0.45]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.4, 2.1]} />
        <meshStandardMaterial color="#ea580c" roughness={0.75} />
      </mesh>

      {/* 5. Bedside Nightstand Table */}
      <group position={[-2.4, 0, -1.2]}>
        {/* Table top */}
        <mesh position={[1.05, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.65, 0.55]} />
          <meshStandardMaterial color="#2c1d14" roughness={0.7} />
        </mesh>
        {/* Drawer handle */}
        <mesh position={[1.05, 0.45, 0.29]}>
          <boxGeometry args={[0.16, 0.025, 0.03]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
        </mesh>
        
        {/* Bedside Warm Lamp */}
        <group position={[1.05, 0.68, 0]}>
          {/* Base */}
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 0.04, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Stem */}
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.32, 12]} />
            <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Lampshade */}
          <mesh position={[0, 0.38, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.2, 0.24, 16, 1, true]} />
            <meshStandardMaterial
              color="#ffedd5"
              emissive="#f97316"
              emissiveIntensity={0.35}
              roughness={0.6}
            />
          </mesh>
          {/* Warm point light */}
          <pointLight
            position={[0, 0.35, 0]}
            color="#ffaa44"
            intensity={1.2}
            distance={4.5}
            decay={2}
            castShadow
            shadow-mapSize={[512, 512]}
            shadow-bias={-0.002}
          />
        </group>
      </group>
    </group>
  );
};
