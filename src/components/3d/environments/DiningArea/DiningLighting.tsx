import React from 'react';

/**
 * DiningLighting component:
 * - Warm hanging pendant lamps suspended over dining tables
 * - Food serving buffet task lighting
 * - Directional daytime ambient fill
 */
export const DiningLighting: React.FC = () => {
  const pendantCordMat = <meshStandardMaterial color="#0f172a" metalness={0.9} />;
  const pendantShadeMat = <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} side={2} />;

  // 4 Pendant lights directly over the 2 dining tables
  const pendantPositions: [number, number, number][] = [
    [-1.4, 3.8, -0.4],
    [-1.4, 3.8, 1.2],
    [1.4, 3.8, -0.4],
    [1.4, 3.8, 1.2],
  ];

  return (
    <group name="DiningLightingGroup">
      {/* 1. Main Directional Light */}
      <directionalLight
        position={[6, 8, 4]}
        color="#fff7ed"
        intensity={1.7}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0008}
      />

      {/* 2. Warm Ambient & Hemisphere Fill */}
      <ambientLight color="#fed7aa" intensity={0.55} />
      <hemisphereLight
        color="#ffedd5"
        groundColor="#292524"
        intensity={0.45}
      />

      {/* 3. Hanging Pendant Lamps over Dining Tables */}
      {pendantPositions.map(([px, py, pz], idx) => (
        <group key={`pendant-${idx}`} position={[px, py, pz]}>
          {/* Suspension cord */}
          <mesh position={[0, -0.5, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 1.0, 6]} />
            {pendantCordMat}
          </mesh>
          {/* Flared metal lampshade */}
          <mesh position={[0, -1.05, 0]} castShadow>
            <coneGeometry args={[0.22, 0.2, 16, 1, true]} />
            {pendantShadeMat}
          </mesh>
          {/* Glowing bulb */}
          <mesh position={[0, -1.08, 0]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial
              color="#fffbeb"
              emissive="#f59e0b"
              emissiveIntensity={1.8}
            />
          </mesh>
          {/* Warm downward point light */}
          <pointLight
            position={[0, -1.15, 0]}
            color="#fbbf24"
            intensity={1.1}
            distance={4.0}
            decay={2}
          />
        </group>
      ))}

      {/* 4. Food Buffet Serving Counter Strip Light */}
      <spotLight
        position={[-1.5, 3.8, -2.4]}
        target-position={[-1.5, 1.0, -3.2]}
        color="#fffbeb"
        intensity={2.0}
        angle={0.7}
        penumbra={0.4}
        distance={5.0}
      />
    </group>
  );
};
