import React from 'react';

/**
 * StudyDesk component:
 * - Modern study desk with warm oak top & matte black metal frame
 * - Laptop with illuminated screen displaying code lines
 * - Articulated desk lamp with focused warm spotlight
 * - Study notebook, coffee mug, pen stand
 */
export const StudyDesk: React.FC = () => {
  return (
    <group position={[2.1, 0.1, -2.4]} name="StudyDeskGroup">
      {/* 1. Desk Top */}
      <mesh position={[0, 0.88, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.08, 1.2]} />
        <meshStandardMaterial color="#854d0e" roughness={0.65} metalness={0.08} />
      </mesh>

      {/* Desk Frame & Legs (Matte Black Steel) */}
      {[
        [-1.1, 0.44, -0.5],
        [1.1, 0.44, -0.5],
        [-1.1, 0.44, 0.5],
        [1.1, 0.44, 0.5],
      ].map(([x, y, z], i) => (
        <mesh key={`desk-leg-${i}`} position={[x, y, z]} castShadow>
          <boxGeometry args={[0.06, 0.84, 0.06]} />
          <meshStandardMaterial color="#1f242d" roughness={0.7} metalness={0.8} />
        </mesh>
      ))}

      {/* Crossbar stabilizer */}
      <mesh position={[0, 0.25, -0.5]} castShadow>
        <boxGeometry args={[2.2, 0.04, 0.04]} />
        <meshStandardMaterial color="#1f242d" metalness={0.8} />
      </mesh>

      {/* Under-desk storage drawer on the right */}
      <group position={[0.75, 0.65, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.65, 0.38, 1.05]} />
          <meshStandardMaterial color="#1c1917" roughness={0.7} />
        </mesh>
        {/* Drawer line & handle */}
        <mesh position={[0, 0.05, 0.53]}>
          <boxGeometry args={[0.2, 0.025, 0.02]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* 2. Laptop on the Desk */}
      <group position={[-0.2, 0.92, 0.05]} rotation={[0, 0.05, 0]}>
        {/* Base / Keyboard chassis */}
        <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.025, 0.38]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Keyboard area recess */}
        <mesh position={[0, 0.029, -0.04]}>
          <boxGeometry args={[0.48, 0.005, 0.22]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>

        {/* Trackpad */}
        <mesh position={[0, 0.029, 0.12]}>
          <boxGeometry args={[0.18, 0.002, 0.1]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Laptop Screen (angled open ~115 degrees) */}
        <group position={[0, 0.028, -0.19]} rotation={[-0.45, 0, 0]}>
          {/* Lid casing */}
          <mesh position={[0, 0.18, -0.01]} castShadow>
            <boxGeometry args={[0.55, 0.36, 0.02]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
          </mesh>

          {/* Glowing Display Screen */}
          <mesh position={[0, 0.18, 0.002]}>
            <planeGeometry args={[0.5, 0.32]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>

          {/* Code lines visual representation on screen */}
          <group position={[0, 0.18, 0.003]}>
            {[-0.1, -0.06, -0.02, 0.02, 0.06, 0.1].map((y, idx) => (
              <mesh key={`code-${idx}`} position={[-0.1 + (idx % 2) * 0.04, y, 0]}>
                <planeGeometry args={[0.22 + (idx % 3) * 0.06, 0.015]} />
                <meshBasicMaterial color={idx % 2 === 0 ? '#38bdf8' : '#a7f3d0'} />
              </mesh>
            ))}
          </group>

          {/* Soft Screen Glow casting onto keyboard and desk */}
          <pointLight
            position={[0, 0.15, 0.12]}
            color="#38bdf8"
            intensity={0.45}
            distance={1.6}
            decay={2}
          />
        </group>
      </group>

      {/* 3. Study Desk Lamp */}
      <group position={[0.85, 0.92, -0.35]}>
        {/* Base */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.12, 0.04, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Articulated arm lower */}
        <group position={[0, 0.04, 0]} rotation={[0.2, 0, -0.2]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.014, 0.014, 0.44, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Elbow Joint */}
          <mesh position={[0, 0.44, 0]}>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
          {/* Upper arm */}
          <group position={[0, 0.44, 0]} rotation={[-0.45, 0, 0.4]}>
            <mesh position={[0, 0.18, 0]} castShadow>
              <cylinderGeometry args={[0.014, 0.014, 0.36, 8]} />
              <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
            </mesh>
            {/* Lampshade Head */}
            <group position={[0, 0.36, 0]} rotation={[0.4, 0, -0.3]}>
              <mesh castShadow>
                <coneGeometry args={[0.14, 0.2, 16, 1, true]} />
                <meshStandardMaterial
                  color="#1e293b"
                  metalness={0.7}
                  roughness={0.3}
                  side={2}
                />
              </mesh>
              {/* Glowing Bulb inside */}
              <mesh position={[0, -0.05, 0]}>
                <sphereGeometry args={[0.04, 12, 12]} />
                <meshStandardMaterial
                  color="#fffbeb"
                  emissive="#fbbf24"
                  emissiveIntensity={1.8}
                />
              </mesh>
              {/* Focused Desk Lamp Spotlight */}
              <spotLight
                position={[0, -0.05, 0]}
                target-position={[-0.7, -0.8, 0.4]}
                color="#fde047"
                intensity={2.8}
                angle={0.7}
                penumbra={0.5}
                distance={3.5}
                castShadow
                shadow-bias={-0.002}
                shadow-mapSize={[1024, 1024]}
              />
            </group>
          </group>
        </group>
      </group>

      {/* 4. Desk Accessories */}
      {/* Coffee / Chai Mug */}
      <group position={[-0.75, 0.92, 0.2]}>
        <mesh position={[0, 0.07, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.05, 0.14, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Coffee surface */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.048, 0.048, 0.02, 16]} />
          <meshStandardMaterial color="#451a03" roughness={0.2} />
        </mesh>
        {/* Mug handle */}
        <mesh position={[0.065, 0.07, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.035, 0.012, 8, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
      </group>

      {/* Open Spiral Notebook */}
      <group position={[-0.75, 0.92, -0.2]} rotation={[0, -0.15, 0]}>
        <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.34, 0.02, 0.46]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
        </mesh>
        {/* Pen beside notebook */}
        <mesh position={[0.22, 0.015, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.26, 8]} />
          <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* Pen Stand */}
      <group position={[0.45, 0.92, -0.4]}>
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.16, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Pens sticking out */}
        <mesh position={[-0.01, 0.16, 0]} rotation={[0.1, 0, 0.15]}>
          <cylinderGeometry args={[0.006, 0.006, 0.18, 6]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0.015, 0.16, -0.01]} rotation={[-0.15, 0, -0.1]}>
          <cylinderGeometry args={[0.006, 0.006, 0.18, 6]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
      </group>
    </group>
  );
};
