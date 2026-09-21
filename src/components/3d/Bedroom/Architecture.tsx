import React from 'react';

/**
 * Cutaway architecture for Vishal's PG Bedroom:
 * - Dark charcoal walls with realistic matte finish
 * - Warm hardwood floor with subtle plank detail
 * - Bedroom entrance opening on the left
 * - Balcony portal on the back-right
 */
export const Architecture: React.FC = () => {
  const wallMaterial = (
    <meshStandardMaterial
      color="#1e232a" // Dark charcoal
      roughness={0.88}
      metalness={0.12}
    />
  );

  const trimMaterial = (
    <meshStandardMaterial
      color="#14171d"
      roughness={0.7}
      metalness={0.2}
    />
  );

  const floorMaterial = (
    <meshStandardMaterial
      color="#523928" // Warm rich oak wood
      roughness={0.55}
      metalness={0.08}
    />
  );

  const ceilingBeamMaterial = (
    <meshStandardMaterial
      color="#181c22"
      roughness={0.9}
    />
  );

  return (
    <group name="Architecture">
      {/* 1. Main Bedroom Floor */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[8, 0.2, 8]} />
        {floorMaterial}
      </mesh>

      {/* Subtle floor plank lines */}
      <group position={[0, 0.105, 0]}>
        {[-3, -2, -1, 0, 1, 2, 3].map((x) => (
          <mesh key={`plank-${x}`} position={[x, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.015, 7.9]} />
            <meshBasicMaterial color="#382417" opacity={0.5} transparent />
          </mesh>
        ))}
      </group>

      {/* 2. Back Wall (Z = -4) with Window & Balcony Cutout */}
      {/* Back Wall - Left Section (behind bed) */}
      <mesh position={[-2, 2.1, -3.95]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 4.0, 0.2]} />
        {wallMaterial}
      </mesh>

      {/* Back Wall - Top Header above Balcony/Window */}
      <mesh position={[2, 3.6, -3.95]} castShadow receiveShadow>
        <boxGeometry args={[4.0, 1.0, 0.2]} />
        {wallMaterial}
      </mesh>

      {/* Back Wall - Far Right Pillar */}
      <mesh position={[3.85, 2.1, -3.95]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 4.0, 0.2]} />
        {wallMaterial}
      </mesh>

      {/* Baseboard along Back Wall */}
      <mesh position={[-2, 0.18, -3.83]} castShadow>
        <boxGeometry args={[4.2, 0.16, 0.04]} />
        {trimMaterial}
      </mesh>

      {/* 3. Right Wall (X = 4) */}
      <mesh position={[3.95, 2.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 4.0, 8]} />
        {wallMaterial}
      </mesh>

      {/* Baseboard along Right Wall */}
      <mesh position={[3.83, 0.18, 0]} castShadow>
        <boxGeometry args={[0.04, 0.16, 8]} />
        {trimMaterial}
      </mesh>

      {/* 4. Left Wall (X = -4) - Partial Cutaway with Bedroom Entrance */}
      {/* Back section of Left wall (next to wardrobe) */}
      <mesh position={[-3.95, 2.1, -2.2]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 4.0, 3.6]} />
        {wallMaterial}
      </mesh>

      {/* Door Header over PG entrance */}
      <mesh position={[-3.95, 3.5, 0.8]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 1.2, 2.4]} />
        {wallMaterial}
      </mesh>

      {/* Door Frame Trims for Entrance */}
      <group position={[-3.88, 1.5, 0.8]}>
        {/* Left post */}
        <mesh position={[0, 0, -1.1]}>
          <boxGeometry args={[0.06, 3.0, 0.08]} />
          {trimMaterial}
        </mesh>
        {/* Right post */}
        <mesh position={[0, 0, 1.1]}>
          <boxGeometry args={[0.06, 3.0, 0.08]} />
          {trimMaterial}
        </mesh>
        {/* Top frame */}
        <mesh position={[0, 1.48, 0]}>
          <boxGeometry args={[0.06, 0.08, 2.28]} />
          {trimMaterial}
        </mesh>
        {/* Entrance Mat */}
        <mesh position={[0.4, -1.39, 0]} receiveShadow>
          <boxGeometry args={[0.7, 0.02, 1.2]} />
          <meshStandardMaterial color="#2d3748" roughness={0.9} />
        </mesh>
      </group>

      {/* 5. Architectural Cutaway Plinths (Front & Left cutaway edges) */}
      <mesh position={[0, 0.06, 4.05]} castShadow>
        <boxGeometry args={[8.1, 0.12, 0.1]} />
        {trimMaterial}
      </mesh>
      <mesh position={[-4.05, 0.06, 2.5]} castShadow>
        <boxGeometry args={[0.1, 0.12, 3.2]} />
        {trimMaterial}
      </mesh>

      {/* Ceiling Architectural Accent Beam */}
      <mesh position={[0, 4.05, -3.85]}>
        <boxGeometry args={[8.0, 0.1, 0.2]} />
        {ceilingBeamMaterial}
      </mesh>
    </group>
  );
};
