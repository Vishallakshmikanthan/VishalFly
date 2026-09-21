import React from 'react';

/**
 * WaterStationAndDecor component:
 * - 20L commercial water dispenser with inverted blue water jug
 * - PG Mess Notice Board with weekly menu & hostel notices
 * - Hand-wash hygiene basin with mirror
 * - Wall-mounted oscillating fan
 */
export const WaterStationAndDecor: React.FC = () => {
  const plasticMat = <meshStandardMaterial color="#f8fafc" roughness={0.3} />;
  const waterMat = (
    <meshPhysicalMaterial
      color="#38bdf8"
      transmission={0.85}
      transparent
      opacity={0.7}
      roughness={0.1}
      ior={1.33}
    />
  );
  const metalMat = <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />;

  return (
    <group name="WaterStationAndDecorGroup">
      {/* 1. Drinking Water Dispenser Station (X = 3.6, Z = 1.4) */}
      <group position={[3.6, 0.1, 1.4]}>
        {/* Dispenser Floor Stand / Cabinet */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.9, 0.42]} />
          {plasticMat}
        </mesh>
        {/* Dispenser Recess / Drip Tray */}
        <mesh position={[0, 0.65, 0.14]} castShadow>
          <boxGeometry args={[0.26, 0.3, 0.16]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
        {/* Blue & Red Water Taps */}
        <mesh position={[-0.06, 0.74, 0.15]}>
          <boxGeometry args={[0.03, 0.04, 0.06]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[0.06, 0.74, 0.15]}>
          <boxGeometry args={[0.03, 0.04, 0.06]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>

        {/* Inverted 20L Blue Water Jug */}
        <group position={[0, 1.18, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.48, 20]} />
            {waterMat}
          </mesh>
          {/* Rib rings on jug */}
          {[-0.1, 0.05].map((ry, ri) => (
            <mesh key={`rib-${ri}`} position={[0, ry, 0]}>
              <torusGeometry args={[0.182, 0.01, 8, 20]} />
              {waterMat}
            </mesh>
          ))}
          {/* Bottle neck inserted into dispenser */}
          <mesh position={[0, -0.26, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 0.08, 16]} />
            {plasticMat}
          </mesh>
        </group>
      </group>

      {/* 2. Framed PG Mess Notice Board on Right Wall (X = 4.38, Z = -0.5) */}
      <group position={[4.38, 2.3, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Wood frame */}
        <mesh castShadow>
          <boxGeometry args={[1.8, 1.1, 0.04]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        {/* Soft Cork Notice Surface */}
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[1.72, 1.02]} />
          <meshStandardMaterial color="#a16207" roughness={0.9} />
        </mesh>

        {/* Pinned Mess Menu Paper Sheets */}
        {/* Today's Menu Sheet (White) */}
        <group position={[-0.45, 0.05, 0.026]}>
          <mesh castShadow>
            <planeGeometry args={[0.65, 0.8]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>
          {/* Menu header strip */}
          <mesh position={[0, 0.32, 0.002]}>
            <planeGeometry args={[0.58, 0.08]} />
            <meshBasicMaterial color="#ea580c" />
          </mesh>
          {/* Menu text lines */}
          {[-0.18, -0.06, 0.06, 0.18].map((ly, idx) => (
            <mesh key={`menu-line-${idx}`} position={[0, ly, 0.002]}>
              <planeGeometry args={[0.5, 0.03]} />
              <meshBasicMaterial color="#94a3b8" />
            </mesh>
          ))}
          {/* Pushpin */}
          <mesh position={[0, 0.38, 0.01]} castShadow>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>

        {/* Hostel Rules Notice (Yellow) */}
        <group position={[0.42, 0.1, 0.026]}>
          <mesh castShadow>
            <planeGeometry args={[0.55, 0.7]} />
            <meshStandardMaterial color="#fef08a" roughness={0.8} />
          </mesh>
          {/* Pushpin */}
          <mesh position={[0, 0.33, 0.01]} castShadow>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        </group>
      </group>

      {/* 3. Hand-Wash Basin near the Dining Entrance (X = -3.8, Z = 2.4) */}
      <group position={[-3.8, 0.1, 2.4]}>
        {/* Ceramic Pedestal & Basin */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.14, 0.8, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.22, 0.16, 20]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>
        {/* Chrome Faucet */}
        <mesh position={[0, 0.94, -0.18]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.16, 8]} />
          {metalMat}
        </mesh>
        {/* Small Mirror on Wall */}
        <group position={[0, 1.6, -0.4]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.6, 0.02]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* 4. Wall-Mounted Oscillating Fan on Back Wall */}
      <group position={[1.4, 3.2, -4.3]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.15, 0.15, 0.05]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 0, 0.1]} rotation={[0.3 + Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.05, 24]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};
