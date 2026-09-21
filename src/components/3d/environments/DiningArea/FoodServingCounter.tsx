import React from 'react';

/**
 * FoodServingCounter component:
 * - Commercial stainless steel buffet steam table
 * - 4 Heated chafing food trays with stainless steel lids & handles
 * - Stack of stainless steel Indian thali dining plates
 * - Serving ladles & spoons
 * - Glass sneeze-guard protective canopy
 * - Tray slide rail along front
 */
export const FoodServingCounter: React.FC = () => {
  const steelMat = <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.18} />;
  const darkSteelMat = <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />;
  const glassMat = (
    <meshPhysicalMaterial
      color="#e2e8f0"
      transmission={0.88}
      transparent
      opacity={0.3}
      roughness={0.1}
    />
  );

  return (
    <group position={[-1.5, 0.1, -3.2]} name="FoodServingCounterGroup">
      {/* 1. Main Stainless Steel Counter Base */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.9, 0.9]} />
        {steelMat}
      </mesh>

      {/* Front Recessed Kickplate */}
      <mesh position={[0, 0.05, 0.42]} castShadow>
        <boxGeometry args={[4.1, 0.1, 0.06]} />
        {darkSteelMat}
      </mesh>

      {/* Countertop Surface */}
      <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.25, 0.04, 0.95]} />
        {steelMat}
      </mesh>

      {/* 2. Tray Slide Rails along the front */}
      <group position={[0, 0.82, 0.58]}>
        {[-0.05, 0.05].map((y, yi) => (
          <mesh key={`rail-${yi}`} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 4.2, 8]} />
            {steelMat}
          </mesh>
        ))}
        {/* Rail support brackets */}
        {[-1.8, -0.9, 0, 0.9, 1.8].map((x, bi) => (
          <mesh key={`b-rail-${bi}`} position={[x, 0, -0.06]} castShadow>
            <boxGeometry args={[0.04, 0.14, 0.12]} />
            {darkSteelMat}
          </mesh>
        ))}
      </group>

      {/* 3. Four Chafing Food Dishes with Lids & Handles */}
      {[-1.4, -0.5, 0.4, 1.3].map((cx, idx) => (
        <group key={`chafing-${idx}`} position={[cx, 0.95, 0]}>
          {/* Chafing pan rim */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.75, 0.1, 0.55]} />
            {darkSteelMat}
          </mesh>
          {/* Rounded Domed Lid */}
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[0.7, 0.08, 0.5]} />
            {steelMat}
          </mesh>
          {/* Gold / Brass Lid Handle */}
          <mesh position={[0, 0.14, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Serving spoon / ladle handle resting beside pan */}
          <mesh position={[0.28, 0.06, 0.24]} rotation={[0.2, 0.1, 0.1]} castShadow>
            <cylinderGeometry args={[0.006, 0.006, 0.28, 6]} />
            {steelMat}
          </mesh>
        </group>
      ))}

      {/* 4. Stack of Stainless Steel Thali Dining Plates */}
      <group position={[1.85, 0.94, 0.05]}>
        {Array.from({ length: 14 }).map((_, pi) => (
          <mesh key={`plate-${pi}`} position={[0, pi * 0.012, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.2, 0.015, 20]} />
            {steelMat}
          </mesh>
        ))}
      </group>

      {/* 5. Glass Protective Sneeze Guard Canopy */}
      <group position={[0, 1.35, 0.2]}>
        {/* Stainless steel upright posts */}
        {[-2.0, 0, 2.0].map((x, pi) => (
          <mesh key={`post-${pi}`} position={[x, -0.15, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
            {darkSteelMat}
          </mesh>
        ))}
        {/* Glass shield angled at ~30 degrees */}
        <mesh position={[0, 0, 0]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[4.2, 0.5, 0.015]} />
          {glassMat}
        </mesh>
        {/* Top glass shelf */}
        <mesh position={[0, 0.22, -0.12]}>
          <boxGeometry args={[4.2, 0.015, 0.26]} />
          {glassMat}
        </mesh>
      </group>
    </group>
  );
};
