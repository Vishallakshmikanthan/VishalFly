import React from 'react';

/**
 * TeachingStage component:
 * - Elevated instructor dais platform
 * - Wooden lectern / podium with laptop & gooseneck microphone
 * - Giant presentation screen displaying Distributed Systems architecture slide
 * - Magnetic dry-erase whiteboard with markers & system diagram
 */
export const TeachingStage: React.FC = () => {
  const woodMat = <meshStandardMaterial color="#854d0e" roughness={0.65} metalness={0.08} />;
  const darkWoodMat = <meshStandardMaterial color="#3b2314" roughness={0.7} />;
  const metalMat = <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />;

  return (
    <group position={[0, 0.1, -3.3]} name="TeachingStageGroup">
      {/* 1. Elevated Stage Platform (Dais) */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.8, 0.24, 2.2]} />
        {darkWoodMat}
      </mesh>

      {/* Stage Front Step / Bevel */}
      <mesh position={[0, 0.05, 1.15]} receiveShadow>
        <boxGeometry args={[7.8, 0.1, 0.14]} />
        <meshStandardMaterial color="#291a10" roughness={0.8} />
      </mesh>

      {/* 2. Giant Presentation Screen on Back Wall (Z = -4.3) */}
      <group position={[0, 2.6, -0.98]}>
        {/* Screen Outer Metal Frame */}
        <mesh castShadow>
          <boxGeometry args={[4.4, 2.4, 0.08]} />
          {metalMat}
        </mesh>

        {/* Screen Bezel Accent */}
        <mesh position={[0, 0, 0.042]}>
          <planeGeometry args={[4.3, 2.3]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>

        {/* Illuminated Lecture Slide */}
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[4.15, 2.15]} />
          <meshStandardMaterial
            color="#090d16"
            emissive="#0369a1"
            emissiveIntensity={0.35}
            roughness={0.4}
          />
        </mesh>

        {/* Slide Visual Content (Diagrams, Nodes, Architecture) */}
        {/* Header bar on slide */}
        <mesh position={[0, 0.85, 0.048]}>
          <planeGeometry args={[3.9, 0.18]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>

        {/* Architecture Nodes (Client -> API Gateway -> Distributed Nodes) */}
        <group position={[0, -0.1, 0.048]}>
          {/* Client Node */}
          <mesh position={[-1.4, 0.2, 0]}>
            <planeGeometry args={[0.7, 0.4]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          {/* API Gateway */}
          <mesh position={[-0.4, 0.2, 0]}>
            <planeGeometry args={[0.8, 0.45]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
          {/* Microservices Nodes */}
          <mesh position={[0.8, 0.45, 0]}>
            <planeGeometry args={[0.7, 0.3]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          <mesh position={[0.8, 0.0, 0]}>
            <planeGeometry args={[0.7, 0.3]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          <mesh position={[0.8, -0.45, 0]}>
            <planeGeometry args={[0.7, 0.3]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          {/* Consensus Ring */}
          <mesh position={[1.65, 0, 0]}>
            <ringGeometry args={[0.25, 0.3, 24]} />
            <meshBasicMaterial color="#f43f5e" />
          </mesh>

          {/* Connection Arrows / Lines */}
          <mesh position={[-0.9, 0.2, 0]}>
            <planeGeometry args={[0.3, 0.04]} />
            <meshBasicMaterial color="#e2e8f0" />
          </mesh>
          <mesh position={[0.2, 0.2, 0]}>
            <planeGeometry args={[0.4, 0.04]} />
            <meshBasicMaterial color="#e2e8f0" />
          </mesh>
        </group>

        {/* Screen projector light emission */}
        <pointLight
          position={[0, 0, 0.8]}
          color="#38bdf8"
          intensity={0.8}
          distance={4.0}
          decay={2}
        />
      </group>

      {/* 3. Dry-Erase Whiteboard beside the screen */}
      <group position={[2.8, 2.5, -0.98]}>
        {/* Frame */}
        <mesh castShadow>
          <boxGeometry args={[1.5, 2.0, 0.04]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Whiteboard Surface */}
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[1.4, 1.9]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.15} metalness={0.05} />
        </mesh>
        {/* Marker sketches */}
        <mesh position={[-0.2, 0.3, 0.025]}>
          <circleGeometry args={[0.2, 16]} />
          <meshBasicMaterial color="#2563eb" />
        </mesh>
        <mesh position={[0.2, -0.1, 0.025]}>
          <planeGeometry args={[0.5, 0.25]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
        {/* Marker Tray at bottom */}
        <mesh position={[0, -0.98, 0.06]} castShadow>
          <boxGeometry args={[1.4, 0.03, 0.1]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
        {/* Markers */}
        <mesh position={[-0.1, -0.96, 0.07]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.01, 0.01, 0.14, 6]} />
          <meshBasicMaterial color="#2563eb" />
        </mesh>
        <mesh position={[0.08, -0.96, 0.07]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.01, 0.01, 0.14, 6]} />
          <meshBasicMaterial color="#dc2626" />
        </mesh>
      </group>

      {/* 4. Instructor Lectern / Podium */}
      <group position={[-1.6, 0.24, 0.2]} rotation={[0, 0.2, 0]}>
        {/* Podium Base */}
        <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.75, 1.1, 0.55]} />
          {woodMat}
        </mesh>
        {/* Angled Podium Top Surface */}
        <group position={[0, 1.12, 0]} rotation={[0.2, 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.82, 0.06, 0.6]} />
            {darkWoodMat}
          </mesh>

          {/* Instructor's Laptop */}
          <group position={[0, 0.04, -0.05]} scale={[0.85, 0.85, 0.85]}>
            <mesh position={[0, 0.015, 0]} castShadow>
              <boxGeometry args={[0.42, 0.02, 0.28]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
            </mesh>
            <group position={[0, 0.02, -0.14]} rotation={[-0.4, 0, 0]}>
              <mesh position={[0, 0.13, 0]} castShadow>
                <boxGeometry args={[0.42, 0.26, 0.015]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} />
              </mesh>
              <mesh position={[0, 0.13, 0.01]}>
                <planeGeometry args={[0.39, 0.23]} />
                <meshBasicMaterial color="#0284c7" />
              </mesh>
            </group>
          </group>

          {/* Gooseneck Microphone */}
          <group position={[0.28, 0.04, 0.15]}>
            <mesh position={[0, 0.01, 0]}>
              <cylinderGeometry args={[0.03, 0.035, 0.02, 12]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[-0.04, 0.14, -0.04]} rotation={[0.3, 0, -0.3]}>
              <cylinderGeometry args={[0.006, 0.006, 0.28, 8]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
            <mesh position={[-0.1, 0.26, -0.08]}>
              <sphereGeometry args={[0.018, 8, 8]} />
              <meshStandardMaterial color="#334155" roughness={0.9} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
