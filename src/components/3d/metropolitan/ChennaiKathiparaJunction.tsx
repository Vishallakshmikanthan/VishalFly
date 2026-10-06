import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../store/useGameStore';

/**
 * ChennaiKathiparaJunction:
 * The world-famous Kathipara Cloverleaf Flyover (Guindy / Alandur):
 * Asia's largest cloverleaf grade-separator interchange connecting:
 * - Grand Southern Trunk (GST) Road (towards Chennai Airport & Tambaram)
 * - Anna Salai (towards Guindy & Chennai Central)
 * - Inner Ring Road (towards Vadapalani & Koyambedu CMBT)
 * - Mount-Poonamallee Road (towards Porur)
 * 
 * Features:
 * 1. Multi-tier elevated concrete flyover viaducts with guardrails & median dividers
 * 2. 4 massive sweeping cloverleaf ramp loops with landscaped turf gardens
 * 3. Overhead green retro-reflective highway direction gantries
 * 4. Animated traffic streams cruising over the flyover loops
 * 5. Modern high-mast tower floodlights illuminating the junction
 */
export const ChennaiKathiparaJunction: React.FC = () => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const isNightOrEvening = timeOfDay === 'night' || timeOfDay === 'evening';

  // Animated vehicles traversing cloverleaf loops
  const carLoopRef1 = useRef<THREE.Group>(null);
  const carLoopRef2 = useRef<THREE.Group>(null);
  const carFlyoverRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (carLoopRef1.current) {
      const angle = t * 0.45;
      carLoopRef1.current.position.x = 18 + Math.cos(angle) * 14;
      carLoopRef1.current.position.z = 38 + Math.sin(angle) * 14;
      carLoopRef1.current.rotation.y = -angle + Math.PI / 2;
    }
    if (carLoopRef2.current) {
      const angle = t * 0.4 + Math.PI;
      carLoopRef2.current.position.x = -18 + Math.cos(angle) * 14;
      carLoopRef2.current.position.z = 62 + Math.sin(angle) * 14;
      carLoopRef2.current.rotation.y = -angle + Math.PI / 2;
    }
    if (carFlyoverRef.current) {
      // Vehicle moving straight across elevated flyover
      const progress = ((t * 18) % 110) - 55;
      carFlyoverRef.current.position.z = 50 + progress;
    }
  });

  return (
    <group position={[0, 0, 50]} name="KathiparaCloverleafJunction">
      {/* ------------------------------------------------------------- */}
      {/* 1. CLOVERLEAF LANDSCAPED GARDEN ISLANDS (4 QUADRANTS)         */}
      {/* ------------------------------------------------------------- */}
      {[
        { x: -18, z: -14 },
        { x: 18, z: -14 },
        { x: -18, z: 14 },
        { x: 18, z: 14 },
      ].map((loop, li) => (
        <group key={`clover-lawn-${li}`} position={[loop.x, 0.03, loop.z]}>
          {/* Manicured Lawn Circle */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[14, 32]} />
            <meshStandardMaterial color="#15803d" roughness={0.9} />
          </mesh>
          {/* Center Royal Palm Trees */}
          <group position={[0, 0, 0]}>
            <mesh position={[0, 2.2, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.3, 4.4, 8]} />
              <meshStandardMaterial color="#57381d" roughness={0.8} />
            </mesh>
            <mesh position={[0, 4.5, 0]} castShadow>
              <sphereGeometry args={[1.8, 8, 8]} />
              <meshStandardMaterial color="#166534" roughness={0.7} />
            </mesh>
          </group>
          {/* Peripheral Garden Flower Bed Ring */}
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[8.5, 9.8, 24]} />
            <meshStandardMaterial color="#e11d48" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* ------------------------------------------------------------- */}
      {/* 2. ELEVATED STRAIGHT FLYOVER (Level 2: Height 7.5m, North-South)*/}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 7.5, 0]}>
        {/* Flyover Roadway Deck (Width 12m, Length 110m) */}
        <mesh receiveShadow castShadow>
          <boxGeometry args={[11.5, 0.9, 110]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>

        {/* White Highway Lane Markings */}
        {[-45, -30, -15, 0, 15, 30, 45].map((zPos, zi) => (
          <React.Fragment key={`fly-m-${zi}`}>
            <mesh position={[-2.8, 0.46, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.25, 6]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[2.8, 0.46, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.25, 6]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </React.Fragment>
        ))}

        {/* Central Concrete Crash Median */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[0.7, 0.7, 110]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} />
        </mesh>

        {/* Left & Right Safety Parapets / Crash Barriers */}
        {[-5.8, 5.8].map((px, pi) => (
          <mesh key={`fly-para-${pi}`} position={[px, 0.9, 0]} castShadow>
            <boxGeometry args={[0.4, 1.0, 110]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.5} />
          </mesh>
        ))}

        {/* Support Concrete Pier Columns & Bents */}
        {[-40, -20, 0, 20, 40].map((cz, ci) => (
          <group key={`bent-${ci}`} position={[0, -3.75, cz]}>
            {/* T-Head Hammerhead Crossbeam */}
            <mesh position={[0, 3.2, 0]} castShadow>
              <boxGeometry args={[9.5, 1.2, 2.4]} />
              <meshStandardMaterial color="#475569" roughness={0.6} />
            </mesh>
            {/* Massive Circular Column */}
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[1.4, 1.6, 6.8, 14]} />
              <meshStandardMaterial color="#475569" roughness={0.6} />
            </mesh>
          </group>
        ))}

        {/* Streetlight Poles Along Elevated Flyover */}
        {[-42, -21, 0, 21, 42].map((sz, si) => (
          <group key={`fly-lgt-${si}`} position={[0, 1.2, sz]}>
            <mesh position={[0, 2.2, 0]}>
              <cylinderGeometry args={[0.08, 0.1, 4.4, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            {/* Dual Luminaire Arms (East & West) */}
            {[-1.2, 1.2].map((lx, li) => (
              <mesh key={`fly-lum-${li}`} position={[lx, 4.3, 0]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#fef08a"
                  emissiveIntensity={isNightOrEvening ? 3.0 : 1.0}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 3. LEVEL 1 CROSS-OVERPASS (East-West Highway at Height 4.2m)    */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 4.2, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[95, 0.8, 10.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        {/* Parapets */}
        {[-5.3, 5.3].map((pz, pi) => (
          <mesh key={`ew-para-${pi}`} position={[0, 0.8, pz]} castShadow>
            <boxGeometry args={[95, 0.9, 0.35]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 4. FOUR CLOVERLEAF ELEVATED CONNECTOR RAMPS (SWEEPING LOOPS)   */}
      {/* ------------------------------------------------------------- */}
      {[
        { x: -18, z: -14, rot: 0 },
        { x: 18, z: -14, rot: Math.PI / 2 },
        { x: 18, z: 14, rot: Math.PI },
        { x: -18, z: 14, rot: -Math.PI / 2 },
      ].map((ramp, ri) => (
        <group key={`ramp-loop-${ri}`} position={[ramp.x, 3.8, ramp.z]} rotation={[0, ramp.rot, 0]}>
          {/* Curved Viaduct Deck */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[14, 2.5, 8, 20, Math.PI * 0.85]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Concrete Loop Piers */}
          {[-7, 7].map((px, pi) => (
            <mesh key={`ramp-p-${pi}`} position={[px, -1.9, 0]} castShadow>
              <cylinderGeometry args={[0.6, 0.8, 3.8, 8]} />
              <meshStandardMaterial color="#475569" roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ------------------------------------------------------------- */}
      {/* 5. OVERHEAD CHENNAI HIGHWAY DIRECTION GANTRIES                */}
      {/* ------------------------------------------------------------- */}
      {/* South Gantry: Towards Chennai Airport & Tambaram */}
      <group position={[0, 8.5, 36]}>
        <mesh position={[0, 4.2, 0]}>
          <boxGeometry args={[14, 0.3, 0.3]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        {/* Support Steel Masts */}
        {[-6.8, 6.8].map((mx, mi) => (
          <mesh key={`gant-s-m-${mi}`} position={[mx, 2.1, 0]}>
            <cylinderGeometry args={[0.18, 0.22, 4.2, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
        ))}
        {/* Green Retro-Reflective Sign: GST ROAD -> AIRPORT / TAMBARAM */}
        <mesh position={[0, 3.8, 0.2]}>
          <boxGeometry args={[11.5, 1.8, 0.1]} />
          <meshStandardMaterial
            color="#15803d"
            emissive="#166534"
            emissiveIntensity={isNightOrEvening ? 1.5 : 0.6}
          />
        </mesh>
      </group>

      {/* North Gantry: Towards Guindy & Chennai Central */}
      <group position={[0, 8.5, -36]}>
        <mesh position={[0, 4.2, 0]}>
          <boxGeometry args={[14, 0.3, 0.3]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        {[-6.8, 6.8].map((mx, mi) => (
          <mesh key={`gant-n-m-${mi}`} position={[mx, 2.1, 0]}>
            <cylinderGeometry args={[0.18, 0.22, 4.2, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
        ))}
        {/* Green Sign: ANNA SALAI -> GUINDY / CHENNAI CENTRAL */}
        <mesh position={[0, 3.8, -0.2]}>
          <boxGeometry args={[11.5, 1.8, 0.1]} />
          <meshStandardMaterial
            color="#15803d"
            emissive="#166534"
            emissiveIntensity={isNightOrEvening ? 1.5 : 0.6}
          />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 6. HIGH-MAST CENTRAL TOWER FLOODLIGHTS (35m Towers)           */}
      {/* ------------------------------------------------------------- */}
      {[-34, 34].map((hx, hi) => (
        <group key={`high-mast-${hi}`} position={[hx, 0, 0]}>
          <mesh position={[0, 16, 0]}>
            <cylinderGeometry args={[0.3, 0.6, 32, 10]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
          </mesh>
          {/* Circular Floodlight Ring */}
          <group position={[0, 31.5, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.8, 0.15, 8, 16]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            {/* 6 High-Power Stadium Style LED Projectors */}
            {Array.from({ length: 6 }).map((_, li) => {
              const angle = (li / 6) * Math.PI * 2;
              return (
                <mesh
                  key={`hm-led-${li}`}
                  position={[Math.cos(angle) * 1.8, -0.2, Math.sin(angle) * 1.8]}
                >
                  <sphereGeometry args={[0.25, 8, 8]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={isNightOrEvening ? 4.5 : 1.2}
                  />
                </mesh>
              );
            })}
          </group>
        </group>
      ))}

      {/* ------------------------------------------------------------- */}
      {/* 7. ANIMATED VEHICLES ON KATHIPARA JUNCTION                    */}
      {/* ------------------------------------------------------------- */}
      {/* Vehicle 1: Car on Ramp Loop 1 */}
      <group ref={carLoopRef1} position={[18, 3.8, 38]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.8, 0.8, 3.4]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        {/* Headlights */}
        <mesh position={[0, 0.4, 1.75]}>
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3.0} />
        </mesh>
      </group>

      {/* Vehicle 2: Chennai Auto on Ramp Loop 2 */}
      <group ref={carLoopRef2} position={[-18, 3.8, 62]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.3, 0.7, 2.1]} />
          <meshStandardMaterial color="#facc15" />
        </mesh>
      </group>

      {/* Vehicle 3: MTC Bus on Straight Flyover */}
      <group ref={carFlyoverRef} position={[2.8, 8.4, 50]}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[2.6, 2.2, 9.5]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0, 2.4, 0]}>
          <boxGeometry args={[2.5, 0.3, 9.2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
};
