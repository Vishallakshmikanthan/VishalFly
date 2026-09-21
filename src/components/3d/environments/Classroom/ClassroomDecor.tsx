import React from 'react';

/**
 * ClassroomDecor component:
 * - Student backpacks resting on floor beside desks
 * - Ceiling mounted digital projector aiming at screen
 * - Analog wall clock showing 09:30 AM
 * - Illuminated emergency EXIT sign over entrance
 * - Trash / recycling bin near doorway
 */
export const ClassroomDecor: React.FC = () => {
  const metalMat = <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />;

  return (
    <group name="ClassroomDecorGroup">
      {/* 1. Student Backpacks resting beside desks */}
      {/* Blue Backpack beside Row 1 Left */}
      <group position={[-1.7, 0.1, -1.0]} rotation={[0, 0.3, 0]}>
        <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.32, 0.44, 0.22]} />
          <meshStandardMaterial color="#1e40af" roughness={0.8} />
        </mesh>
        {/* Front pocket */}
        <mesh position={[0, 0.16, 0.12]} castShadow>
          <boxGeometry args={[0.26, 0.22, 0.08]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.85} />
        </mesh>
      </group>

      {/* Orange Backpack beside Row 2 Right */}
      <group position={[1.7, 0.1, 0.8]} rotation={[0, -0.4, 0]}>
        <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.42, 0.24]} />
          <meshStandardMaterial color="#ea580c" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.15, 0.13]} castShadow>
          <boxGeometry args={[0.24, 0.2, 0.08]} />
          <meshStandardMaterial color="#c2410c" roughness={0.85} />
        </mesh>
      </group>

      {/* Dark Grey Backpack beside Row 3 Left */}
      <group position={[-3.8, 0.1, 2.5]} rotation={[0, 0.1, 0]}>
        <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.34, 0.45, 0.25]} />
          <meshStandardMaterial color="#334155" roughness={0.85} />
        </mesh>
      </group>

      {/* 2. Ceiling Mounted HD Digital Projector */}
      <group position={[0, 3.8, -0.5]}>
        {/* Metal suspension pole */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
          {metalMat}
        </mesh>
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[0.15, 0.04, 0.15]} />
          {metalMat}
        </mesh>
        {/* Projector Chassis */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.16, 0.4]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Projector Optical Lens pointing towards screen (-Z) */}
        <mesh position={[0.12, 0, -0.21]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Lens glow */}
        <mesh position={[0.12, 0, -0.23]}>
          <circleGeometry args={[0.042, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Projector Light Beam cone pointing at stage screen */}
        <spotLight
          position={[0.12, -0.05, -0.24]}
          target-position={[0, 2.4, -4.3]}
          color="#e0f2fe"
          intensity={2.2}
          angle={0.45}
          penumbra={0.3}
          distance={6}
        />
      </group>

      {/* 3. Analog Wall Clock on Right Wall (showing 09:30 AM) */}
      <group position={[4.88, 3.4, -2.5]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Casing */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Dial Face */}
        <mesh position={[0, 0, 0.022]}>
          <circleGeometry args={[0.26, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Center pin */}
        <mesh position={[0, 0, 0.035]}>
          <circleGeometry args={[0.018, 16]} />
          <meshBasicMaterial color="#d4af37" />
        </mesh>
        {/* Hour hand (pointing towards 9.5 / ~9:30) */}
        <mesh position={[-0.08, -0.02, 0.028]} rotation={[0, 0, 0.25]}>
          <planeGeometry args={[0.14, 0.016]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        {/* Minute hand (pointing towards 6 / 30 mins) */}
        <mesh position={[0, -0.09, 0.028]}>
          <planeGeometry args={[0.01, 0.18]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* 4. Illuminated Emergency EXIT Sign above entrance */}
      <group position={[-4.88, 3.1, 1.2]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.24, 0.05]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 0, 0.027]}>
          <planeGeometry args={[0.54, 0.18]} />
          <meshStandardMaterial
            color="#14532d"
            emissive="#22c55e"
            emissiveIntensity={1.2}
          />
        </mesh>
      </group>

      {/* 5. Waste / Recycling Bins near doorway */}
      <group position={[-4.3, 0.1, 2.5]}>
        {/* General Waste (Grey) */}
        <mesh position={[-0.2, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.13, 0.6, 16]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>
        {/* Recycling Bin (Blue) */}
        <mesh position={[0.2, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.13, 0.6, 16]} />
          <meshStandardMaterial color="#2563eb" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
};
