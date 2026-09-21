import React from 'react';

/**
 * DeskChair component:
 * - Ergonomic swivel office desk chair
 * - 5-star base with casters
 * - Cushioned seat & breathable curved mesh backrest
 * - Armrests and pneumatic cylinder
 */
export const DeskChair: React.FC = () => {
  const metalMat = <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />;
  const cushionMat = <meshStandardMaterial color="#0f172a" roughness={0.85} />;
  const meshBackMat = <meshStandardMaterial color="#1e2430" roughness={0.9} />;

  return (
    <group position={[1.9, 0.1, -1.35]} rotation={[0, -Math.PI / 1.15, 0]} name="DeskChairGroup">
      {/* 1. 5-Star Caster Base */}
      <group position={[0, 0.06, 0]}>
        {/* Central hub */}
        <mesh castShadow>
          <cylinderGeometry args={[0.07, 0.08, 0.08, 16]} />
          {metalMat}
        </mesh>

        {/* 5 Legs */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * 2 * Math.PI) / 5;
          const legLength = 0.38;
          const x = Math.cos(angle) * (legLength / 2);
          const z = Math.sin(angle) * (legLength / 2);
          const wheelX = Math.cos(angle) * legLength;
          const wheelZ = Math.sin(angle) * legLength;

          return (
            <group key={`chair-leg-${i}`}>
              {/* Leg arm */}
              <mesh position={[x, -0.01, z]} rotation={[0, -angle, 0]} castShadow>
                <boxGeometry args={[legLength, 0.03, 0.04]} />
                {metalMat}
              </mesh>
              {/* Caster wheel */}
              <mesh position={[wheelX, -0.03, wheelZ]} castShadow>
                <sphereGeometry args={[0.028, 8, 8]} />
                <meshStandardMaterial color="#020617" roughness={0.5} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 2. Pneumatic Column & Tilt mechanism */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.04, 0.36, 12]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.44, 0]} castShadow>
        <boxGeometry args={[0.22, 0.06, 0.22]} />
        {metalMat}
      </mesh>

      {/* 3. Seat Cushion */}
      <group position={[0, 0.52, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.62, 0.1, 0.62]} />
          {cushionMat}
        </mesh>
        {/* Soft edge chamfer simulation */}
        <mesh position={[0, 0.03, 0.29]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
          {cushionMat}
        </mesh>
      </group>

      {/* 4. Ergonomic Backrest */}
      <group position={[0, 0.95, -0.28]} rotation={[-0.12, 0, 0]}>
        {/* Spine support spine */}
        <mesh position={[0, -0.15, -0.05]} castShadow>
          <boxGeometry args={[0.08, 0.65, 0.05]} />
          {metalMat}
        </mesh>
        {/* Backrest mesh frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.56, 0.72, 0.06]} />
          {meshBackMat}
        </mesh>
        {/* Lumbar support contour */}
        <mesh position={[0, -0.12, 0.03]} castShadow>
          <boxGeometry args={[0.45, 0.15, 0.04]} />
          <meshStandardMaterial color="#090d16" roughness={0.8} />
        </mesh>
        {/* Headrest */}
        <mesh position={[0, 0.44, 0.04]} castShadow>
          <boxGeometry args={[0.34, 0.16, 0.08]} />
          {cushionMat}
        </mesh>
      </group>

      {/* 5. Left & Right Armrests */}
      {[-0.34, 0.34].map((x, idx) => (
        <group key={`armrest-${idx}`} position={[x, 0.68, -0.02]}>
          {/* Vertical strut */}
          <mesh position={[0, -0.05, 0]} castShadow>
            <boxGeometry args={[0.04, 0.24, 0.06]} />
            {metalMat}
          </mesh>
          {/* Arm pad */}
          <mesh position={[0, 0.08, 0.05]} castShadow>
            <boxGeometry args={[0.09, 0.04, 0.32]} />
            <meshStandardMaterial color="#090d16" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
