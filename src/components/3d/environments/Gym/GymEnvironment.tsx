import React from 'react';

/**
 * Procedural 3D Gym Environment:
 * - Rubber tile flooring with yellow safety borders
 * - Mirror wall with metallic frames
 * - Bench press with barbell and weight plates
 * - Two-tier dumbbell rack with hex dumbbells
 * - Heavy squat power rack
 * - 45-degree angled leg press machine
 * - Dual cable machine with overhead crossover
 * - Workout benches and chalk stand
 * - Realistic fitness studio lighting
 */
export const GymEnvironment: React.FC = () => {
  return (
    <group name="GymEnvironment">
      {/* 1. Lighting Rig */}
      <ambientLight intensity={0.5} color="#e2e8f0" />
      <directionalLight
        position={[6, 8, 6]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Cool overhead fitness fluorescent tube glow */}
      <pointLight position={[0, 3.8, 0]} intensity={1.5} color="#e0f2fe" distance={10} />
      <pointLight position={[-2, 3.5, -2]} intensity={1.0} color="#fef08a" distance={8} />
      <pointLight position={[2, 3.5, -2]} intensity={1.0} color="#38bdf8" distance={8} />

      {/* 2. Floor & Walls Architecture */}
      {/* Dark rubber gym floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8.4, 8.4]} />
        <meshStandardMaterial color="#18181b" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Yellow agility border markings */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 1.85, 32]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>

      {/* Back Wall (North) with Mirror panels */}
      <mesh position={[0, 2.1, -4.2]}>
        <boxGeometry args={[8.4, 4.2, 0.1]} />
        <meshStandardMaterial color="#27272a" roughness={0.9} />
      </mesh>
      {/* Large Framed Mirrors along the back wall */}
      {[-2.2, 0, 2.2].map((x, i) => (
        <group key={`mirror-${i}`} position={[x, 2.0, -4.13]}>
          <mesh>
            <boxGeometry args={[1.9, 2.6, 0.04]} />
            <meshStandardMaterial color="#09090b" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.025]}>
            <planeGeometry args={[1.8, 2.5]} />
            <meshStandardMaterial
              color="#e2e8f0"
              roughness={0.05}
              metalness={0.95}
              envMapIntensity={1.5}
            />
          </mesh>
        </group>
      ))}

      {/* Left Wall (West) with Gym Banner */}
      <mesh position={[-4.2, 2.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[8.4, 4.2, 0.1]} />
        <meshStandardMaterial color="#1e1e24" roughness={0.85} />
      </mesh>
      <mesh position={[-4.13, 2.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.2, 0.8]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>

      {/* Right Wall (East) */}
      <mesh position={[4.2, 2.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[8.4, 4.2, 0.1]} />
        <meshStandardMaterial color="#1e1e24" roughness={0.85} />
      </mesh>

      {/* 3. Bench Press Station (around [-1.5, 0, -0.5]) */}
      <group position={[-1.5, 0, -0.5]}>
        {/* Leather Bench */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.1, 1.4]} />
          <meshStandardMaterial color="#18181b" roughness={0.4} />
        </mesh>
        {/* Bench Metal Base */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.4, 0.44, 1.2]} />
          <meshStandardMaterial color="#3f3f46" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Upright Support Posts */}
        {[-0.32, 0.32].map((x, idx) => (
          <mesh key={idx} position={[x, 0.65, -0.4]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1.3, 8]} />
            <meshStandardMaterial color="#71717a" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        {/* Barbell Across Rack */}
        <group position={[0, 1.15, -0.4]}>
          {/* Bar */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 1.8, 12]} />
            <meshStandardMaterial color="#d4d4d8" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Weight Plates Left */}
          {[-0.65, -0.72].map((x, i) => (
            <mesh key={`plate-l-${i}`} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.22 - i * 0.03, 0.22 - i * 0.03, 0.05, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.3} />
            </mesh>
          ))}
          {/* Weight Plates Right */}
          {[0.65, 0.72].map((x, i) => (
            <mesh key={`plate-r-${i}`} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.22 - i * 0.03, 0.22 - i * 0.03, 0.05, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.3} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 4. Squat Power Rack (around [-2.2, 0, -2.5]) */}
      <group position={[-2.2, 0, -2.5]}>
        {/* 4 Upright Pillars */}
        {[
          [-0.6, -0.6],
          [-0.6, 0.6],
          [0.6, -0.6],
          [0.6, 0.6],
        ].map(([x, z], idx) => (
          <mesh key={idx} position={[x, 1.25, z]} castShadow>
            <boxGeometry args={[0.08, 2.5, 0.08]} />
            <meshStandardMaterial color="#b91c1c" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
        {/* Top Connecting Bars */}
        <mesh position={[0, 2.45, 0]}>
          <boxGeometry args={[1.28, 0.08, 1.28]} />
          <meshStandardMaterial color="#18181b" metalness={0.7} />
        </mesh>
        {/* Squat Barbell & Plates */}
        <group position={[0, 1.5, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 2.0, 12]} />
            <meshStandardMaterial color="#d4d4d8" metalness={0.9} roughness={0.1} />
          </mesh>
          {[-0.8, -0.87, 0.8, 0.87].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.24, 0.24, 0.06, 16]} />
              <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.4} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 5. Two-Tier Dumbbell Rack (around [2.2, 0, -2.5]) */}
      <group position={[2.2, 0, -2.5]}>
        {/* Rack Structure */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[2.0, 0.9, 0.5]} />
          <meshStandardMaterial color="#27272a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Dumbbells Rows */}
        {[-0.7, -0.35, 0, 0.35, 0.7].map((x, i) => (
          <group key={`db-${i}`} position={[x, 0.95, -0.05]}>
            {/* Handle */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.18, 8]} />
              <meshStandardMaterial color="#d4d4d8" metalness={0.9} />
            </mesh>
            {/* Hex Heads */}
            {[-0.08, 0.08].map((hx, hi) => (
              <mesh key={hi} position={[hx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.06 + i * 0.008, 0.06 + i * 0.008, 0.04, 6]} />
                <meshStandardMaterial color="#0f172a" roughness={0.6} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* 6. Cable Machine (around [0, 0, -3.2]) */}
      <group position={[0, 0, -3.2]}>
        {/* Two towers left and right */}
        {[-1.2, 1.2].map((x, idx) => (
          <group key={idx} position={[x, 0, 0]}>
            <mesh position={[0, 1.3, 0]} castShadow>
              <boxGeometry args={[0.5, 2.6, 0.4]} />
              <meshStandardMaterial color="#18181b" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Weight stack plates visible inside */}
            <mesh position={[0, 0.8, 0.15]}>
              <boxGeometry args={[0.35, 1.2, 0.06]} />
              <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
            </mesh>
          </group>
        ))}
        {/* Overhead Bridge Bar */}
        <mesh position={[0, 2.55, 0]}>
          <boxGeometry args={[2.6, 0.08, 0.08]} />
          <meshStandardMaterial color="#3f3f46" metalness={0.8} />
        </mesh>
      </group>

      {/* 7. Leg Press Machine (around [2.0, 0, 0.5]) */}
      <group position={[2.0, 0, 0.5]} rotation={[0, -Math.PI / 4, 0]}>
        {/* Base Frame */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.8, 0.6, 1.6]} />
          <meshStandardMaterial color="#27272a" metalness={0.7} />
        </mesh>
        {/* Incline Rails */}
        <mesh position={[0, 0.9, -0.2]} rotation={[Math.PI / 4, 0, 0]}>
          <boxGeometry args={[0.7, 0.1, 1.4]} />
          <meshStandardMaterial color="#71717a" metalness={0.9} />
        </mesh>
        {/* Sled & Footplate */}
        <mesh position={[0, 1.2, -0.5]} rotation={[Math.PI / 4, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 0.08, 0.5]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>
      </group>

      {/* 8. Rest Bench (around [0, 0, 0]) */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.45, 0.08, 1.1]} />
          <meshStandardMaterial color="#18181b" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.44, 8]} />
          <meshStandardMaterial color="#52525b" metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
};
