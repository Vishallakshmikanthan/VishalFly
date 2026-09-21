import React from 'react';

/**
 * Cutaway architecture for PG Dining Hall:
 * - Ceramic checker/terracotta tiled dining floor
 * - Warm neutral cream/slate cutaway walls with warm amber accent frieze
 * - Kitchen pass-through window with service ledge
 * - Entrance doorway with corridor threshold
 */
export const DiningArchitecture: React.FC = () => {
  const wallMat = <meshStandardMaterial color="#292524" roughness={0.88} metalness={0.08} />;
  const trimMat = <meshStandardMaterial color="#1c1917" roughness={0.7} metalness={0.2} />;
  const accentBandMat = <meshStandardMaterial color="#d97706" roughness={0.65} />;
  const floorMat = <meshStandardMaterial color="#44332a" roughness={0.5} metalness={0.1} />;

  return (
    <group name="DiningArchitecture">
      {/* 1. Dining Hall Floor */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[9, 0.2, 9]} />
        {floorMat}
      </mesh>

      {/* Ceramic Checkered Floor Tile Grid Pattern */}
      <group position={[0, 0.105, 0]}>
        {[-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].map((x) => (
          <mesh key={`d-tile-x-${x}`} position={[x, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.02, 8.9]} />
            <meshBasicMaterial color="#2d1e16" opacity={0.65} transparent />
          </mesh>
        ))}
        {[-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].map((z) => (
          <mesh key={`d-tile-z-${z}`} position={[0, 0, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8.9, 0.02]} />
            <meshBasicMaterial color="#2d1e16" opacity={0.65} transparent />
          </mesh>
        ))}
      </group>

      {/* 2. Back Wall (Z = -4.5) with Kitchen Pass-through Window */}
      {/* Lower Back Wall under kitchen pass-through */}
      <mesh position={[-1.2, 0.6, -4.45]} castShadow receiveShadow>
        <boxGeometry args={[6.6, 1.0, 0.2]} />
        {wallMat}
      </mesh>
      {/* Solid Back Wall section behind refrigerator */}
      <mesh position={[3.2, 2.2, -4.45]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 4.2, 0.2]} />
        {wallMat}
      </mesh>
      {/* Top Header over kitchen pass-through */}
      <mesh position={[-1.2, 3.6, -4.45]} castShadow receiveShadow>
        <boxGeometry args={[6.6, 1.4, 0.2]} />
        {wallMat}
      </mesh>

      {/* Kitchen Pass-Through Counter Ledge */}
      <mesh position={[-1.2, 1.12, -4.35]} castShadow receiveShadow>
        <boxGeometry args={[6.4, 0.08, 0.35]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Warm Amber Accent Stripe along Back Wall */}
      <mesh position={[0, 3.8, -4.33]}>
        <boxGeometry args={[9.0, 0.12, 0.02]} />
        {accentBandMat}
      </mesh>

      {/* Baseboard Back Wall */}
      <mesh position={[0, 0.18, -4.34]} castShadow>
        <boxGeometry args={[9.0, 0.16, 0.04]} />
        {trimMat}
      </mesh>

      {/* 3. Right Wall (X = 4.5) */}
      <mesh position={[4.45, 2.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 4.2, 9]} />
        {wallMat}
      </mesh>
      <mesh position={[4.33, 0.18, 0]} castShadow>
        <boxGeometry args={[0.04, 0.16, 9]} />
        {trimMat}
      </mesh>
      <mesh position={[4.33, 3.8, 0]}>
        <boxGeometry args={[0.02, 0.12, 9.0]} />
        {accentBandMat}
      </mesh>

      {/* 4. Left Wall (X = -4.5) - Partial Cutaway with Dining Hall Entrance */}
      {/* Front section of Left Wall */}
      <mesh position={[-4.45, 2.2, 3.6]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 4.2, 1.8]} />
        {wallMat}
      </mesh>
      {/* Back section of Left Wall */}
      <mesh position={[-4.45, 2.2, -2.4]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 4.2, 4.2]} />
        {wallMat}
      </mesh>
      {/* Door Header */}
      <mesh position={[-4.45, 3.6, 1.2]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 1.4, 3.0]} />
        {wallMat}
      </mesh>

      {/* Entrance Door Frame */}
      <group position={[-4.38, 1.5, 1.2]}>
        <mesh position={[0, 0, -1.1]} castShadow>
          <boxGeometry args={[0.08, 3.0, 0.08]} />
          {trimMat}
        </mesh>
        <mesh position={[0, 0, 1.1]} castShadow>
          <boxGeometry args={[0.08, 3.0, 0.08]} />
          {trimMat}
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.08, 0.08, 2.28]} />
          {trimMat}
        </mesh>

        {/* Entrance Threshold Floor Mat */}
        <mesh position={[0.5, -1.39, 0]} receiveShadow>
          <boxGeometry args={[0.9, 0.02, 1.6]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
      </group>

      {/* 5. Architectural Cutaway Trims */}
      <mesh position={[0, 0.06, 4.55]} castShadow>
        <boxGeometry args={[9.1, 0.12, 0.1]} />
        {trimMat}
      </mesh>
      <mesh position={[-4.55, 0.06, 3.0]} castShadow>
        <boxGeometry args={[0.1, 0.12, 3.1]} />
        {trimMat}
      </mesh>
    </group>
  );
};
