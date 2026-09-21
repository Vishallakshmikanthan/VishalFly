import React from 'react';

/**
 * Cutaway architecture for College Lecture Hall (CS-301):
 * - Large tiled academic floor with grid lines
 * - Dark neutral cutaway walls
 * - Warm vertical acoustic wood slat feature panels behind teaching stage
 * - High institutional windows on right wall
 * - Classroom entrance doorway on left wall
 */
export const ClassroomArchitecture: React.FC = () => {
  const wallMat = <meshStandardMaterial color="#222730" roughness={0.85} metalness={0.1} />;
  const woodSlatMat = <meshStandardMaterial color="#854d0e" roughness={0.65} metalness={0.08} />;
  const trimMat = <meshStandardMaterial color="#171a21" roughness={0.7} metalness={0.2} />;
  const floorTileMat = <meshStandardMaterial color="#3f4551" roughness={0.55} metalness={0.1} />;
  const glassMat = (
    <meshPhysicalMaterial
      color="#93c5fd"
      transmission={0.8}
      transparent
      opacity={0.3}
      roughness={0.1}
    />
  );

  return (
    <group name="ClassroomArchitecture">
      {/* 1. Main Classroom Floor */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[10, 0.2, 9]} />
        {floorTileMat}
      </mesh>

      {/* Floor Tile Grid Lines */}
      <group position={[0, 0.105, 0]}>
        {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((x) => (
          <mesh key={`c-tile-x-${x}`} position={[x, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.02, 8.9]} />
            <meshBasicMaterial color="#2a2e37" opacity={0.6} transparent />
          </mesh>
        ))}
        {[-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].map((z) => (
          <mesh key={`c-tile-z-${z}`} position={[0, 0, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[9.9, 0.02]} />
            <meshBasicMaterial color="#2a2e37" opacity={0.6} transparent />
          </mesh>
        ))}
      </group>

      {/* 2. Back Wall (Z = -4.5) with Acoustic Wood Slat Paneling */}
      <mesh position={[0, 2.3, -4.45]} castShadow receiveShadow>
        <boxGeometry args={[10, 4.4, 0.2]} />
        {wallMat}
      </mesh>

      {/* Acoustic Wood Slats along Back Wall */}
      <group position={[0, 2.3, -4.33]}>
        {/* Accent Wood Backing */}
        <mesh receiveShadow>
          <boxGeometry args={[8.8, 4.1, 0.03]} />
          <meshStandardMaterial color="#291a10" roughness={0.8} />
        </mesh>

        {/* Vertical Wood Slats */}
        {Array.from({ length: 44 }).map((_, i) => {
          const x = (i - 21.5) * 0.2;
          return (
            <mesh key={`slat-${i}`} position={[x, 0, 0.02]} castShadow>
              <boxGeometry args={[0.08, 4.0, 0.02]} />
              {woodSlatMat}
            </mesh>
          );
        })}
      </group>

      {/* Baseboard Back Wall */}
      <mesh position={[0, 0.18, -4.34]} castShadow>
        <boxGeometry args={[10, 0.16, 0.04]} />
        {trimMat}
      </mesh>

      {/* 3. Right Wall (X = 5) with High Windows */}
      <mesh position={[4.95, 2.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 4.4, 9]} />
        {wallMat}
      </mesh>
      <mesh position={[4.83, 0.18, 0]} castShadow>
        <boxGeometry args={[0.04, 0.16, 9]} />
        {trimMat}
      </mesh>

      {/* High Classroom Windows along Right Wall */}
      <group position={[4.88, 3.2, 0]}>
        {[-2.4, 0, 2.4].map((z, idx) => (
          <group key={`win-${idx}`} position={[0, 0, z]}>
            {/* Window Frame */}
            <mesh castShadow>
              <boxGeometry args={[0.06, 1.4, 1.8]} />
              {trimMat}
            </mesh>
            {/* Glass Pane */}
            <mesh>
              <boxGeometry args={[0.02, 1.3, 1.7]} />
              {glassMat}
            </mesh>
            {/* Window Sill */}
            <mesh position={[-0.04, -0.72, 0]}>
              <boxGeometry args={[0.12, 0.04, 1.9]} />
              {woodSlatMat}
            </mesh>
          </group>
        ))}
      </group>

      {/* 4. Left Wall (X = -5) - Partial Cutaway with Classroom Entrance Door */}
      {/* Front section of Left Wall */}
      <mesh position={[-4.95, 2.3, 3.6]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 4.4, 1.8]} />
        {wallMat}
      </mesh>
      {/* Back section of Left Wall */}
      <mesh position={[-4.95, 2.3, -2.5]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 4.4, 4.0]} />
        {wallMat}
      </mesh>
      {/* Door Header */}
      <mesh position={[-4.95, 3.8, 1.2]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 1.4, 3.4]} />
        {wallMat}
      </mesh>

      {/* Double Door Frame */}
      <group position={[-4.88, 1.5, 1.2]}>
        {/* Door Frame Posts */}
        <mesh position={[0, 0, -1.2]} castShadow>
          <boxGeometry args={[0.08, 3.0, 0.08]} />
          {trimMat}
        </mesh>
        <mesh position={[0, 0, 1.2]} castShadow>
          <boxGeometry args={[0.08, 3.0, 0.08]} />
          {trimMat}
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.08, 0.08, 2.48]} />
          {trimMat}
        </mesh>

        {/* Door Leaves (propped open inward) */}
        <group position={[0, 0, -1.16]} rotation={[0, 1.1, 0]}>
          <mesh position={[0.55, 0, 0]} castShadow>
            <boxGeometry args={[1.1, 2.9, 0.05]} />
            <meshStandardMaterial color="#854d0e" roughness={0.6} />
          </mesh>
          {/* Glass Vision Panel */}
          <mesh position={[0.7, 0.35, 0]}>
            <boxGeometry args={[0.3, 0.9, 0.03]} />
            {glassMat}
          </mesh>
          {/* Stainless Steel Push Bar */}
          <mesh position={[0.6, 0, 0.04]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.9, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Doorway Entrance Mat */}
        <mesh position={[0.5, -1.39, 0]} receiveShadow>
          <boxGeometry args={[0.9, 0.02, 1.6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
      </group>

      {/* 5. Architectural Cutaway Trims */}
      <mesh position={[0, 0.06, 4.55]} castShadow>
        <boxGeometry args={[10.1, 0.12, 0.1]} />
        {trimMat}
      </mesh>
      <mesh position={[-5.05, 0.06, 3.0]} castShadow>
        <boxGeometry args={[0.1, 0.12, 3.1]} />
        {trimMat}
      </mesh>
    </group>
  );
};
