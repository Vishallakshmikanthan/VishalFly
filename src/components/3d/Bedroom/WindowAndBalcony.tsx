import React from 'react';

/**
 * WindowAndBalcony component:
 * - Balcony portal with sliding glass door frames
 * - Outdoor balcony floor & modern balustrade railing
 * - Flowing curtains on curtain rod
 * - Morning dawn sky backdrop
 */
export const WindowAndBalcony: React.FC = () => {
  const frameMat = <meshStandardMaterial color="#1e232a" metalness={0.7} roughness={0.3} />;
  const glassMat = (
    <meshPhysicalMaterial
      color="#bfdbfe"
      transmission={0.88}
      opacity={0.35}
      transparent
      roughness={0.1}
      ior={1.5}
    />
  );
  const railingMat = <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />;
  const curtainMat = (
    <meshStandardMaterial
      color="#f8fafc"
      roughness={0.85}
      opacity={0.92}
      transparent
    />
  );

  return (
    <group position={[1.9, 0, -4.0]} name="WindowAndBalconyGroup">
      {/* 1. Outdoor Balcony Floor Extension */}
      <mesh position={[0, 0.05, -0.8]} receiveShadow>
        <boxGeometry args={[3.6, 0.1, 1.6]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* Balcony Railing Outer Perimeter */}
      {/* Handrail (Back edge) */}
      <mesh position={[0, 1.15, -1.55]} castShadow>
        <boxGeometry args={[3.6, 0.05, 0.06]} />
        {railingMat}
      </mesh>
      {/* Handrail (Right side edge) */}
      <mesh position={[1.75, 1.15, -0.8]} castShadow>
        <boxGeometry args={[0.06, 0.05, 1.55]} />
        {railingMat}
      </mesh>
      {/* Handrail (Left side edge) */}
      <mesh position={[-1.75, 1.15, -0.8]} castShadow>
        <boxGeometry args={[0.06, 0.05, 1.55]} />
        {railingMat}
      </mesh>

      {/* Railing Vertical Balusters */}
      {[-1.6, -1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2, 1.6].map((x, i) => (
        <mesh key={`baluster-${i}`} position={[x, 0.6, -1.55]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 1.05, 8]} />
          {railingMat}
        </mesh>
      ))}
      {/* Side Balusters */}
      {[-0.4, -0.8, -1.2].map((z, i) => (
        <mesh key={`side-baluster-${i}`} position={[1.75, 0.6, z]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 1.05, 8]} />
          {railingMat}
        </mesh>
      ))}

      {/* 2. Sliding Glass Door / Window Frame */}
      {/* Outer Threshold */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[3.6, 0.04, 0.14]} />
        {frameMat}
      </mesh>

      {/* Left Glass Panel (Fixed / Window) */}
      <group position={[-0.9, 1.55, 0]}>
        {/* Frame */}
        <mesh castShadow>
          <boxGeometry args={[1.75, 2.9, 0.06]} />
          {frameMat}
        </mesh>
        {/* Glass pane */}
        <mesh>
          <boxGeometry args={[1.65, 2.8, 0.02]} />
          {glassMat}
        </mesh>
        {/* Subtle Horizontal Grids */}
        <mesh position={[0, 0.4, 0.02]}>
          <boxGeometry args={[1.65, 0.02, 0.02]} />
          {frameMat}
        </mesh>
        <mesh position={[0, -0.4, 0.02]}>
          <boxGeometry args={[1.65, 0.02, 0.02]} />
          {frameMat}
        </mesh>
      </group>

      {/* Right Glass Door (Sliding Door - slightly ajar to reveal balcony) */}
      <group position={[0.7, 1.55, 0.06]}>
        <mesh castShadow>
          <boxGeometry args={[1.75, 2.9, 0.06]} />
          {frameMat}
        </mesh>
        <mesh>
          <boxGeometry args={[1.65, 2.8, 0.02]} />
          {glassMat}
        </mesh>
        {/* Door handle */}
        <mesh position={[-0.78, 0, 0.04]} castShadow>
          <boxGeometry args={[0.03, 0.5, 0.04]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* 3. Curtain Rod & Flowing Curtains */}
      {/* Curtain Rod */}
      <mesh position={[0, 3.12, 0.15]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 3.8, 12]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Left Curtain */}
      <group position={[-1.7, 1.7, 0.16]}>
        {/* Gathered folds using overlapping boxes */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.45, 2.8, 0.12]} />
          {curtainMat}
        </mesh>
        {/* Curtain tieback band */}
        <mesh position={[0, -0.2, 0.04]}>
          <boxGeometry args={[0.48, 0.05, 0.16]} />
          <meshStandardMaterial color="#ea580c" roughness={0.7} />
        </mesh>
      </group>

      {/* Right Curtain */}
      <group position={[1.7, 1.7, 0.16]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.45, 2.8, 0.12]} />
          {curtainMat}
        </mesh>
        <mesh position={[0, -0.2, 0.04]}>
          <boxGeometry args={[0.48, 0.05, 0.16]} />
          <meshStandardMaterial color="#ea580c" roughness={0.7} />
        </mesh>
      </group>

      {/* 4. Distant Morning Sky Horizon Plane (visible outside through balcony) */}
      <mesh position={[0, 2.0, -3.2]}>
        <planeGeometry args={[14, 8]} />
        <meshBasicMaterial color="#1e1b4b" />
      </mesh>
      {/* Dawn Horizon Warm Glow */}
      <mesh position={[0, 1.0, -3.15]}>
        <planeGeometry args={[14, 3]} />
        <meshBasicMaterial color="#fdba74" opacity={0.65} transparent />
      </mesh>
    </group>
  );
};
