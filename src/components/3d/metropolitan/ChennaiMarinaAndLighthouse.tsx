import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../store/useGameStore';

/**
 * ChennaiMarinaAndLighthouse:
 * The legendary Marina Beach & Chennai Maritime Lighthouse:
 * 1. Golden sandy urban beach along the eastern waterfront with ocean waves
 * 2. 46m Chennai Lighthouse (iconic red & white horizontal bands) with rotating searchlight beam
 * 3. Kamarajar Salai coastal promenade with decorative streetlamps
 * 4. Chennai Beach Stalls: Sundal & Bajji carts, tender coconut stalls, roasted corn carts
 */
export const ChennaiMarinaAndLighthouse: React.FC = () => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const isNightOrEvening = timeOfDay === 'night' || timeOfDay === 'evening';

  // Rotating Maritime Lighthouse Beacon
  const beaconRef = useRef<THREE.Group>(null);
  const waveRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (beaconRef.current) {
      beaconRef.current.rotation.y = t * 1.4; // Sweeping beacon beam
    }
    if (waveRef.current) {
      waveRef.current.position.x = 88 + Math.sin(t * 1.8) * 0.8;
    }
  });

  return (
    <group position={[78, 0, 18]} name="ChennaiMarinaBeachAndLighthouse">
      {/* ------------------------------------------------------------- */}
      {/* 1. MARINA BEACH GOLDEN SAND EXPANSE (120m long, 48m wide)     */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0.02, 0]}>
        {/* Soft Golden Beach Sand */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[48, 120]} />
          <meshStandardMaterial color="#fef08a" roughness={0.96} />
        </mesh>

        {/* Wet Tide Shoreline Sand (Darker golden brown) */}
        <mesh position={[21, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7, 120]} />
          <meshStandardMaterial color="#d97706" roughness={0.7} />
        </mesh>

        {/* Ocean Water Gentle Surf Foam */}
        <mesh ref={waveRef} position={[24.5, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3, 120]} />
          <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 2. KAMARAJAR SALAI PROMENADE PAVED WALKWAY                    */}
      {/* ------------------------------------------------------------- */}
      <group position={[-20, 0.04, 0]}>
        {/* Paved Interlocking Brick Promenade */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 120]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>

        {/* White Railing along Promenade */}
        <mesh position={[4.8, 0.55, 0]} castShadow>
          <boxGeometry args={[0.1, 1.1, 120]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>

        {/* Seaside Cast Iron Lampposts */}
        {[-50, -30, -10, 10, 30, 50].map((lz, li) => (
          <group key={`marina-lamp-${li}`} position={[4.2, 0, lz]}>
            <mesh position={[0, 2.0, 0]}>
              <cylinderGeometry args={[0.06, 0.08, 4.0, 8]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
            <mesh position={[0, 4.1, 0]}>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#facc15"
                emissiveIntensity={isNightOrEvening ? 3.0 : 0.8}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 3. THE CHENNAI LIGHTHOUSE (46m TOWER)                         */}
      {/* ------------------------------------------------------------- */}
      <group position={[-16, 0, -32]}>
        {/* Base Concrete Foundation & Entrance Foyer */}
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[12, 5, 12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>

        {/* Tower Shaft with Iconic Alternating Red & White Bands (40m) */}
        {[
          { y: 7.5, color: '#dc2626' }, // Red Band 1
          { y: 13.5, color: '#f8fafc' }, // White Band 1
          { y: 19.5, color: '#dc2626' }, // Red Band 2
          { y: 25.5, color: '#f8fafc' }, // White Band 2
          { y: 31.5, color: '#dc2626' }, // Red Band 3
          { y: 37.5, color: '#f8fafc' }, // White Band 3
        ].map((band, bi) => (
          <mesh key={`lh-band-${bi}`} position={[0, band.y, 0]} castShadow>
            <cylinderGeometry args={[3.2 - bi * 0.15, 3.5 - bi * 0.15, 6, 16]} />
            <meshStandardMaterial color={band.color} roughness={0.4} />
          </mesh>
        ))}

        {/* Observation Gallery Deck */}
        <mesh position={[0, 41, 0]} castShadow>
          <cylinderGeometry args={[4.4, 4.4, 1.2, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        {/* Safety Railing */}
        <mesh position={[0, 42.1, 0]}>
          <ringGeometry args={[4.2, 4.35, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Glass Lantern Room */}
        <mesh position={[0, 43.5, 0]} castShadow>
          <cylinderGeometry args={[3.2, 3.2, 3.8, 16]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.85}
            roughness={0.1}
            opacity={0.6}
            transparent
          />
        </mesh>

        {/* Conical Copper Lantern Roof */}
        <mesh position={[0, 46.2, 0]} castShadow>
          <coneGeometry args={[3.6, 2.2, 16]} />
          <meshStandardMaterial color="#047857" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Rotating Maritime Searchlight Beacon */}
        <group ref={beaconRef} position={[0, 43.5, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.8, 12, 12]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={isNightOrEvening ? 6.0 : 2.0}
            />
          </mesh>
          {/* Light Beam Cones Sweeping Ocean & City */}
          {[-1, 1].map((dir, di) => (
            <mesh
              key={`lh-beam-${di}`}
              position={[dir * 18, 0, 0]}
              rotation={[0, 0, dir * Math.PI / 2]}
            >
              <coneGeometry args={[3.5, 36, 12, 1, true]} />
              <meshBasicMaterial
                color="#fef08a"
                opacity={isNightOrEvening ? 0.35 : 0.08}
                transparent
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 4. CHENNAI BEACH FOOD SHACKS & KIOSKS                         */}
      {/* ------------------------------------------------------------- */}
      {/* Stall 1: Marina Hot Sundal & Milagai Bajji Cart */}
      <group position={[0, 0.05, 12]}>
        {/* Wooden Pushcart Bed */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[2.2, 0.4, 3.2]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
        {/* Colorful Blue Tarpaulin Canopy */}
        <mesh position={[0, 2.0, 0]} castShadow>
          <boxGeometry args={[2.6, 0.1, 3.6]} />
          <meshStandardMaterial color="#0284c7" roughness={0.6} />
        </mesh>
        {/* Bamboo Support Sticks */}
        {[-1.1, 1.1].map((sx, si) =>
          [-1.5, 1.5].map((sz, szi) => (
            <mesh key={`bamb-${si}-${szi}`} position={[sx, 1.35, sz]}>
              <cylinderGeometry args={[0.03, 0.03, 1.3, 6]} />
              <meshStandardMaterial color="#ca8a04" />
            </mesh>
          ))
        )}
        {/* Glowing Yellow Tungsten Lantern Bulb */}
        <mesh position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#facc15"
            emissiveIntensity={isNightOrEvening ? 3.5 : 1.2}
          />
        </mesh>
        {/* Big Kadai / Pan with Steaming Hot Bajjis */}
        <mesh position={[0, 1.0, 0.5]}>
          <cylinderGeometry args={[0.45, 0.3, 0.25, 10]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
      </group>

      {/* Stall 2: Tender Coconut (Elaneer) Cart */}
      <group position={[2, 0.05, -18]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.8, 0.3, 2.8]} />
          <meshStandardMaterial color="#451a03" />
        </mesh>
        {/* Pyramid Pile of Green Tender Coconuts */}
        {[-0.4, 0, 0.4].map((cx, ci) =>
          [-0.6, 0, 0.6].map((cz, czi) => (
            <mesh key={`coco-${ci}-${czi}`} position={[cx, 0.95, cz]}>
              <sphereGeometry args={[0.22, 8, 8]} />
              <meshStandardMaterial color="#65a30d" roughness={0.6} />
            </mesh>
          ))
        )}
      </group>
    </group>
  );
};
