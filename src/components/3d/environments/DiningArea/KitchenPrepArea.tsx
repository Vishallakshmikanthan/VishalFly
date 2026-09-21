import React from 'react';

/**
 * KitchenPrepArea component:
 * - Commercial double-door stainless steel refrigerator
 * - Kitchen prep counter with stainless sink & gooseneck faucet
 * - Countertop microwave oven
 * - Upper kitchen storage cabinets
 */
export const KitchenPrepArea: React.FC = () => {
  const fridgeMat = <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.22} />;
  const darkMat = <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />;
  const counterMat = <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.3} />;
  const cabinetMat = <meshStandardMaterial color="#2d2218" roughness={0.7} metalness={0.1} />;

  return (
    <group position={[2.8, 0.1, -3.2]} name="KitchenPrepAreaGroup">
      {/* 1. Large Commercial Double-Door Refrigerator (X = 3.6) */}
      <group position={[1.0, 0, -0.4]}>
        {/* Main Fridge Chassis */}
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 2.8, 0.95]} />
          {fridgeMat}
        </mesh>
        {/* Split Left Door */}
        <mesh position={[-0.26, 1.4, 0.49]} castShadow>
          <boxGeometry args={[0.5, 2.7, 0.04]} />
          {fridgeMat}
        </mesh>
        {/* Split Right Door */}
        <mesh position={[0.26, 1.4, 0.49]} castShadow>
          <boxGeometry args={[0.5, 2.7, 0.04]} />
          {fridgeMat}
        </mesh>
        {/* Vertical Door Handles */}
        <mesh position={[-0.04, 1.4, 0.54]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.9, 8]} />
          {darkMat}
        </mesh>
        <mesh position={[0.04, 1.4, 0.54]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.9, 8]} />
          {darkMat}
        </mesh>
        {/* Digital temperature indicator panel */}
        <mesh position={[0.26, 2.1, 0.52]}>
          <planeGeometry args={[0.16, 0.1]} />
          <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* 2. Kitchen Prep Counter & Cabinets */}
      <group position={[-0.6, 0, 0]}>
        {/* Lower Base Cabinets */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.9, 0.85]} />
          {cabinetMat}
        </mesh>
        {/* Solid Dark Countertop */}
        <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.85, 0.05, 0.9]} />
          {counterMat}
        </mesh>

        {/* Stainless Steel Prep Sink */}
        <group position={[-0.4, 0.93, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.02, 0.5]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Sink basin cutout */}
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.5, 0.12, 0.4]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.4} />
          </mesh>
          {/* Gooseneck Faucet */}
          <group position={[0, 0.05, -0.22]}>
            <mesh position={[0, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.28, 0.06]} rotation={[0.6, 0, 0]} castShadow>
              <cylinderGeometry args={[0.014, 0.014, 0.16, 8]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>
        </group>

        {/* Countertop Microwave Oven */}
        <group position={[0.5, 0.95, 0]}>
          <mesh position={[0, 0.16, 0]} castShadow>
            <boxGeometry args={[0.52, 0.32, 0.42]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Microwave glass door */}
          <mesh position={[-0.08, 0.16, 0.22]}>
            <planeGeometry args={[0.32, 0.24]} />
            <meshStandardMaterial color="#0f172a" roughness={0.1} />
          </mesh>
          {/* Control pad & dial */}
          <mesh position={[0.16, 0.16, 0.22]}>
            <planeGeometry args={[0.12, 0.24]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          {/* Glowing timer display */}
          <mesh position={[0.16, 0.24, 0.222]}>
            <planeGeometry args={[0.09, 0.04]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        </group>

        {/* 3. Upper Storage Wall Cabinets */}
        <group position={[0, 2.7, -0.2]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.8, 0.8, 0.45]} />
            {cabinetMat}
          </mesh>
          {/* Cabinet Doors with Handles */}
          {[-0.45, 0.45].map((cx, idx) => (
            <mesh key={`up-cab-${idx}`} position={[cx, 0, 0.23]} castShadow>
              <boxGeometry args={[0.85, 0.76, 0.02]} />
              <meshStandardMaterial color="#3a2b1f" roughness={0.65} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};
