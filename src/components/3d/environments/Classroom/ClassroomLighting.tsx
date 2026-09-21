import React from 'react';

/**
 * ClassroomLighting component:
 * - Ceiling fluorescent/LED panel fixtures with emissive panels
 * - Focused stage lighting on instructor & presentation screen
 * - Directional sunlight from windows
 * - Institutional balanced ambient fill
 */
export const ClassroomLighting: React.FC = () => {
  return (
    <group name="ClassroomLightingGroup">
      {/* 1. Main Directional Light (Simulating window daylight) */}
      <directionalLight
        position={[7, 8, 2]}
        color="#f8fafc"
        intensity={1.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={26}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0008}
      />

      {/* 2. Ambient & Hemisphere Institutional Fill */}
      <ambientLight color="#f1f5f9" intensity={0.65} />
      <hemisphereLight
        color="#e0f2fe"
        groundColor="#334155"
        intensity={0.5}
      />

      {/* 3. Ceiling Recessed LED Troffers (Physical Fixtures) */}
      {[
        [-2.5, 4.3, -1.5],
        [2.5, 4.3, -1.5],
        [-2.5, 4.3, 0.5],
        [2.5, 4.3, 0.5],
        [-2.5, 4.3, 2.5],
        [2.5, 4.3, 2.5],
      ].map(([x, y, z], idx) => (
        <group key={`troffer-${idx}`} position={[x, y, z]}>
          {/* Troffer housing */}
          <mesh>
            <boxGeometry args={[1.4, 0.05, 0.7]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Diffuser panel */}
          <mesh position={[0, -0.02, 0]}>
            <planeGeometry args={[1.3, 0.6]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#f8fafc"
              emissiveIntensity={1.4}
            />
          </mesh>
          {/* Downward light fill */}
          <pointLight
            position={[0, -0.1, 0]}
            color="#ffffff"
            intensity={0.55}
            distance={5.0}
            decay={2}
          />
        </group>
      ))}

      {/* 4. Stage Focused Spotlight */}
      <spotLight
        position={[-1.5, 4.2, -1.0]}
        target-position={[-1.6, 1.2, -3.1]}
        color="#fef3c7"
        intensity={1.8}
        angle={0.6}
        penumbra={0.4}
        distance={6.5}
      />
    </group>
  );
};
