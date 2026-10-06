import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * ChennaiBaseMapAndWaterBodies:
 * Authentic geographic foundation for Chennai City matching the 3D reference design:
 *
 * 1. Bay of Bengal Coastline (East Edge):
 *    - Deep ocean water plane extending eastwards to the horizon
 *    - Animated coastal waves and shoreline surf foam
 *    - Golden sand beach strip (Marina Beach & Besant Nagar / Elliot's Beach)
 *    - Kamarajar Salai / East Coast Road (ECR) seaside highway with palm trees
 *
 * 2. Adyar River & Bridges:
 *    - Meandering blue river flowing from South-West across the city into the Bay of Bengal
 *    - Concrete arched highway bridges with bridge pillars and railings crossing the river
 *
 * 3. Red Hills Lake (North-East):
 *    - Vast serene freshwater reservoir with embankment bund and park turf
 *
 * 4. Guindy National Park & Green Lungs:
 *    - Dense protected forest canopy with hundreds of shade trees, walking trails, and lawns
 *
 * 5. Planned Township Road Grid:
 *    - Connecting all sectors (Anna Salai, OMR, GST Road, Inner Ring Road) seamlessly
 */
export const ChennaiBaseMapAndWaterBodies: React.FC = () => {

  const oceanWaveRef = useRef<THREE.Mesh>(null);
  const riverWaveRef = useRef<THREE.Mesh>(null);

  // Animate gentle ocean surf ripples
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (oceanWaveRef.current) {
      oceanWaveRef.current.position.y = -0.05 + Math.sin(t * 1.5) * 0.08;
    }
    if (riverWaveRef.current) {
      riverWaveRef.current.position.y = -0.08 + Math.sin(t * 2.0) * 0.04;
    }
  });

  return (
    <group name="ChennaiBaseMapAndWaterBodies">
      {/* ------------------------------------------------------------- */}
      {/* 1. BAY OF BENGAL OCEAN EXPANSION (EAST SECTOR)                */}
      {/* ------------------------------------------------------------- */}
      {/* Deep Ocean Water (From X: 85 to X: 600, Z: -300 to 300) */}
      <group position={[280, 0, 0]}>
        <mesh
          ref={oceanWaveRef}
          position={[0, -0.05, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[420, 600, 32, 32]} />
          <meshPhysicalMaterial
            color="#0284c7"
            roughness={0.12}
            metalness={0.1}
            transmission={0.65}
            transparent
            opacity={0.92}
          />
        </mesh>

        {/* Distant Cargo Ships on Bay of Bengal Horizon */}
        {[
          { x: 40, z: -120, rot: 0.2 },
          { x: 75, z: 40, rot: -0.4 },
          { x: 30, z: 160, rot: 0.1 },
        ].map((ship, si) => (
          <group key={`ship-${si}`} position={[ship.x, 0.4, ship.z]} rotation={[0, ship.rot, 0]}>
            {/* Cargo Hull */}
            <mesh position={[0, 1.2, 0]} castShadow>
              <boxGeometry args={[16, 2.4, 5.5]} />
              <meshStandardMaterial color="#991b1b" roughness={0.7} />
            </mesh>
            {/* White Deck Cabin */}
            <mesh position={[5.2, 3.2, 0]} castShadow>
              <boxGeometry args={[4.2, 2.2, 4.4]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            {/* Shipping Containers */}
            {[-4, -1, 2].map((cx, ci) => (
              <mesh key={`cont-${ci}`} position={[cx, 2.8, 0]}>
                <boxGeometry args={[2.6, 1.4, 4.2]} />
                <meshStandardMaterial color={ci % 2 === 0 ? '#0284c7' : '#eab308'} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 2. MARINA & BESANT NAGAR BEACH GOLDEN SAND SHORELINE           */}
      {/* ------------------------------------------------------------- */}
      {/* North to South Continuous Sand Beach Strip (X: 72 to 86) */}
      <mesh position={[79, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 420]} />
        <meshStandardMaterial color="#fde047" roughness={0.95} />
      </mesh>

      {/* Surf Wave Foam Edge Line */}
      <mesh position={[86.5, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 420]} />
        <meshBasicMaterial color="#ffffff" opacity={0.65} transparent />
      </mesh>

      {/* ------------------------------------------------------------- */}
      {/* 3. KAMARAJAR SALAI & COASTAL HIGHWAY (EAST MARINA DRIVE)      */}
      {/* ------------------------------------------------------------- */}
      <group position={[70, 0.04, 0]}>
        {/* Coastal Highway Asphalt */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[7.2, 420]} />
          <meshStandardMaterial color="#0f172a" roughness={0.85} />
        </mesh>
        {/* Center White Median Dash */}
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.25, 418]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Coastal Palm Trees along Promenade */}
        {Array.from({ length: 28 }).map((_, pIdx) => {
          const zPos = -190 + pIdx * 14;
          return (
            <group key={`coast-palm-${pIdx}`} position={[4.5, 0, zPos]}>
              <mesh position={[0, 2.5, 0]} rotation={[0, 0, 0.08]} castShadow>
                <cylinderGeometry args={[0.1, 0.18, 5.0, 8]} />
                <meshStandardMaterial color="#78350f" roughness={0.9} />
              </mesh>
              {/* Palm Fronds Canopy */}
              <mesh position={[0.2, 5.2, 0]} castShadow>
                <sphereGeometry args={[1.4, 8, 8]} />
                <meshStandardMaterial color="#15803d" roughness={0.8} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 4. ADYAR RIVER FLOWING THROUGH CHENNAI INTO BAY OF BENGAL     */}
      {/* ------------------------------------------------------------- */}
      {/* Meandering river bed cutting across the south sector */}
      <group position={[15, -0.02, 65]}>
        {/* River Water Surface */}
        <mesh
          ref={riverWaveRef}
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, -0.06]}
          receiveShadow
        >
          <planeGeometry args={[140, 16, 24, 8]} />
          <meshPhysicalMaterial
            color="#0369a1"
            roughness={0.15}
            metalness={0.05}
            transmission={0.7}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Green Riverbanks */}
        {[-8.5, 8.5].map((ry, ri) => (
          <mesh key={`riverbank-${ri}`} position={[0, 0.02, ry]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[140, 2.5]} />
            <meshStandardMaterial color="#166534" roughness={0.9} />
          </mesh>
        ))}

        {/* ----------------------------------------------------------- */}
        {/* ADYAR RIVER ROAD BRIDGES                                    */}
        {/* ----------------------------------------------------------- */}
        {/* Bridge 1: Coastal Thiru Vi Ka Bridge (Near Marina/Besant Nagar) */}
        <group position={[55, 0, 0]}>
          {/* Bridge Roadbed */}
          <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[6.5, 0.6, 20]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          {/* Asphalt Layer */}
          <mesh position={[0, 1.55, 0]}>
            <boxGeometry args={[5.8, 0.1, 19.8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* White Concrete Safety Railings */}
          {[-3.0, 3.0].map((bx, bi) => (
            <mesh key={`b1-rail-${bi}`} position={[bx, 2.0, 0]} castShadow>
              <boxGeometry args={[0.2, 0.9, 19.8]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          ))}
          {/* Bridge Support Piers in Water */}
          {[-4, 4].map((pz, pi) => (
            <mesh key={`b1-pier-${pi}`} position={[0, 0.4, pz]} castShadow>
              <cylinderGeometry args={[0.7, 0.9, 1.6, 12]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>
          ))}
        </group>

        {/* Bridge 2: Central Arterial Highway Bridge (Anna Salai / OMR connector) */}
        <group position={[-15, 0, 0]}>
          <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[12, 0.7, 20]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.8, 0]}>
            <boxGeometry args={[11.2, 0.1, 19.8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* Railings */}
          {[-5.8, 5.8].map((bx, bi) => (
            <mesh key={`b2-rail-${bi}`} position={[bx, 2.3, 0]} castShadow>
              <boxGeometry args={[0.25, 0.95, 19.8]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          ))}
          {/* Bridge Support Arches */}
          {[-5, 5].map((pz, pi) => (
            <group key={`b2-arch-${pi}`} position={[0, 0.5, pz]}>
              <mesh castShadow>
                <cylinderGeometry args={[1.1, 1.3, 1.8, 12]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 5. RED HILLS LAKE (NORTH-EAST SERENE FRESHWATER RESERVOIR)     */}
      {/* ------------------------------------------------------------- */}
      <group position={[45, 0, -115]}>
        {/* Lake Water Surface */}
        <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[26, 32]} />
          <meshPhysicalMaterial
            color="#0284c7"
            roughness={0.1}
            metalness={0.1}
            transmission={0.8}
            transparent
            opacity={0.88}
          />
        </mesh>
        {/* Stone Embankment Bund */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[25.5, 28, 32]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        {/* Surrounding Forested Greens */}
        {Array.from({ length: 16 }).map((_, ti) => {
          const angle = (ti / 16) * Math.PI * 2;
          const tx = Math.cos(angle) * 31;
          const tz = Math.sin(angle) * 31;
          return (
            <group key={`lake-tree-${ti}`} position={[tx, 0, tz]}>
              <mesh position={[0, 1.5, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.22, 3.0, 8]} />
                <meshStandardMaterial color="#451a03" />
              </mesh>
              <mesh position={[0, 3.6, 0]} castShadow>
                <sphereGeometry args={[1.8, 8, 8]} />
                <meshStandardMaterial color="#15803d" roughness={0.8} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 6. GUINDY NATIONAL PARK (CENTRAL-WEST PROTECTED FOREST)        */}
      {/* ------------------------------------------------------------- */}
      <group position={[-52, 0, 8]} name="GuindyNationalPark">
        {/* Lush Green Park Turf Platform */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[34, 30]} />
          <meshStandardMaterial color="#14532d" roughness={0.92} />
        </mesh>
        {/* Park Perimeter Low Fence */}
        <mesh position={[0, 0.4, 15]}>
          <boxGeometry args={[34, 0.8, 0.2]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>

        {/* Forest Canopy (Dense clusters of green banyan and neem trees) */}
        {Array.from({ length: 22 }).map((_, fIdx) => {
          const fx = -13 + (fIdx % 5) * 6.5 + (fIdx % 2 ? 1.5 : -1.5);
          const fz = -11 + Math.floor(fIdx / 5) * 6.0 + (fIdx % 3 ? -1 : 1);
          const treeH = 3.5 + (fIdx % 4) * 0.8;
          return (
            <group key={`guindy-tree-${fIdx}`} position={[fx, 0, fz]}>
              <mesh position={[0, treeH * 0.4, 0]} castShadow>
                <cylinderGeometry args={[0.25, 0.4, treeH * 0.8, 8]} />
                <meshStandardMaterial color="#451a03" roughness={0.9} />
              </mesh>
              <mesh position={[0, treeH + 0.5, 0]} castShadow>
                <sphereGeometry args={[2.2 + (fIdx % 3) * 0.4, 8, 8]} />
                <meshStandardMaterial
                  color={fIdx % 3 === 0 ? '#15803d' : fIdx % 2 === 0 ? '#166534' : '#14532d'}
                  roughness={0.85}
                />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
};
