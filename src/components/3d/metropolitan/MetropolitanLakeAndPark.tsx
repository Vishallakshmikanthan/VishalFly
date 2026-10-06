import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../../store/useGameStore';

/**
 * MetropolitanLakeAndPark:
 * Scenic urban waterfront and lake park matching the reference image:
 * - Organic, reflective cyan-blue lake with glistening water plane
 * - Terraced emerald park shoreline with cobblestone walking trails
 * - Traditional waterfront Gazebo / Pavilion with pagoda roof & pillars
 * - Landscaped park trees, flowerbeds, wooden benches, and pedestrian paths
 */
export const MetropolitanLakeAndPark: React.FC = () => {
  const waterVisible = useGameStore((state) => state.metropolitanLayers.water);
  const parksVisible = useGameStore((state) => state.metropolitanLayers.parks);

  // Tree coordinates scattered around the waterfront promenade
  const parkTrees = useMemo(() => [
    { x: 32, z: 4, scale: 1.1, color: '#15803d' },
    { x: 38, z: 2, scale: 0.9, color: '#16a34a' },
    { x: 44, z: 6, scale: 1.2, color: '#14532d' },
    { x: 50, z: 8, scale: 1.0, color: '#15803d' },
    { x: 58, z: 12, scale: 1.3, color: '#166534' },
    { x: 66, z: 18, scale: 1.1, color: '#15803d' },
    { x: 72, z: 26, scale: 1.2, color: '#16a34a' },
    { x: 68, z: 36, scale: 1.0, color: '#15803d' },
    { x: 62, z: 44, scale: 1.2, color: '#14532d' },
    { x: 54, z: 48, scale: 0.9, color: '#16a34a' },
    { x: 42, z: 48, scale: 1.1, color: '#15803d' },
    { x: 34, z: 44, scale: 1.0, color: '#166534' },
    { x: 30, z: 36, scale: 1.3, color: '#15803d' },
    { x: 26, z: 24, scale: 0.9, color: '#16a34a' },
    { x: 28, z: 12, scale: 1.1, color: '#14532d' },
    // Inner park cluster
    { x: 40, z: 18, scale: 0.8, color: '#15803d' },
    { x: 44, z: 32, scale: 0.85, color: '#16a34a' },
  ], []);

  // Curved water contour points
  const lakeShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(8, -4, 22, -6, 32, -2);
    shape.bezierCurveTo(42, 2, 48, 12, 44, 24);
    shape.bezierCurveTo(40, 36, 28, 40, 16, 36);
    shape.bezierCurveTo(4, 32, -2, 24, -4, 14);
    shape.bezierCurveTo(-6, 4, -4, 2, 0, 0);
    return shape;
  }, []);

  return (
    <group position={[32, 0, 14]} name="MetropolitanLakeAndPark">
      {/* 1. Lush Green Park Lawn Embankment */}
      {parksVisible && (
        <group name="ParkLawnAndPromenade">
          {/* Main Park Base Grass */}
          <mesh position={[20, 0.02, 18]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[56, 52]} />
            <meshStandardMaterial color="#166534" roughness={0.88} />
          </mesh>

          {/* Curved Stone Promenade Pathway around the lake */}
          <mesh position={[20, 0.035, 18]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[18, 22, 32]} />
            <meshStandardMaterial color="#64748b" roughness={0.9} />
          </mesh>

          {/* Park Light Posts */}
          {[
            { x: 8, z: 2 },
            { x: 28, z: 0 },
            { x: 42, z: 16 },
            { x: 38, z: 34 },
            { x: 18, z: 36 },
            { x: 6, z: 20 },
          ].map((lp, idx) => (
            <group key={`park-lamp-${idx}`} position={[lp.x, 0, lp.z]}>
              <mesh position={[0, 1.8, 0]}>
                <cylinderGeometry args={[0.04, 0.06, 3.6, 8]} />
                <meshStandardMaterial color="#1e293b" metalness={0.7} />
              </mesh>
              <mesh position={[0, 3.6, 0]}>
                <sphereGeometry args={[0.16, 8, 8]} />
                <meshStandardMaterial
                  color="#fde047"
                  emissive="#facc15"
                  emissiveIntensity={2.2}
                />
              </mesh>
            </group>
          ))}

          {/* Park Benches */}
          {[
            { x: 14, z: 4, rot: 0.2 },
            { x: 34, z: 6, rot: -0.4 },
            { x: 40, z: 26, rot: -1.6 },
            { x: 22, z: 34, rot: 3.1 },
            { x: 8, z: 14, rot: 1.5 },
          ].map((bench, bi) => (
            <group key={`park-bench-${bi}`} position={[bench.x, 0, bench.z]} rotation={[0, bench.rot, 0]}>
              <mesh position={[0, 0.35, 0]} castShadow>
                <boxGeometry args={[1.4, 0.1, 0.5]} />
                <meshStandardMaterial color="#78350f" roughness={0.8} />
              </mesh>
              {/* Backrest */}
              <mesh position={[0, 0.65, -0.22]} castShadow>
                <boxGeometry args={[1.4, 0.5, 0.08]} />
                <meshStandardMaterial color="#78350f" roughness={0.8} />
              </mesh>
              {/* Metal Legs */}
              {[-0.6, 0.6].map((lx, li) => (
                <mesh key={`leg-${li}`} position={[lx, 0.2, 0]}>
                  <boxGeometry args={[0.08, 0.4, 0.45]} />
                  <meshStandardMaterial color="#0f172a" metalness={0.9} />
                </mesh>
              ))}
            </group>
          ))}

          {/* Park Foliage & Trees */}
          {parkTrees.map((tree, ti) => (
            <group key={`park-tree-${ti}`} position={[tree.x - 20, 0, tree.z - 5]}>
              {/* Trunk */}
              <mesh position={[0, 1.4 * tree.scale, 0]} castShadow>
                <cylinderGeometry args={[0.18 * tree.scale, 0.28 * tree.scale, 2.8 * tree.scale, 8]} />
                <meshStandardMaterial color="#78350f" roughness={0.9} />
              </mesh>
              {/* Lush Crown Layers */}
              <mesh position={[0, 3.4 * tree.scale, 0]} castShadow>
                <sphereGeometry args={[1.5 * tree.scale, 10, 10]} />
                <meshStandardMaterial color={tree.color} roughness={0.82} />
              </mesh>
              <mesh position={[0, 4.3 * tree.scale, 0]} castShadow>
                <sphereGeometry args={[1.0 * tree.scale, 8, 8]} />
                <meshStandardMaterial color={tree.color} roughness={0.8} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* 2. Organic Shimmering Water Body (Lake) */}
      {waterVisible && (
        <group name="WaterBody">
          {/* Lake Base Basin Depth */}
          <mesh position={[20, -0.15, 18]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[19, 32]} />
            <meshStandardMaterial color="#082f49" roughness={0.9} />
          </mesh>

          {/* Reflective Cyan-Blue Water Surface */}
          <mesh position={[20, 0.01, 18]} rotation={[-Math.PI / 2, 0, 0]}>
            <shapeGeometry args={[lakeShape]} />
            <meshPhysicalMaterial
              color="#0284c7"
              emissive="#0369a1"
              emissiveIntensity={0.25}
              roughness={0.12}
              metalness={0.2}
              transmission={0.4}
              opacity={0.88}
              transparent
              reflectivity={0.9}
            />
          </mesh>

          {/* Water Highlight Glow Ring */}
          <mesh position={[20, 0.015, 18]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[17.5, 18.4, 32]} />
            <meshBasicMaterial color="#38bdf8" opacity={0.35} transparent />
          </mesh>
        </group>
      )}

      {/* 3. Traditional Lakeside Pagoda Gazebo Pavilion (from Reference Image!) */}
      {parksVisible && (
        <group position={[25, 0, 12]} name="LakesidePagodaPavilion">
          {/* Stone Base Stilt Platform Extending Into Lake */}
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[3.2, 3.4, 0.8, 8]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>
          {/* Wooden Deck */}
          <mesh position={[0, 0.85, 0]}>
            <cylinderGeometry args={[3.1, 3.1, 0.1, 8]} />
            <meshStandardMaterial color="#b45309" roughness={0.7} />
          </mesh>

          {/* Support Columns / Pillars (Red Lacquer) */}
          {Array.from({ length: 6 }).map((_, pi) => {
            const angle = (pi / 6) * Math.PI * 2;
            const px = Math.cos(angle) * 2.4;
            const pz = Math.sin(angle) * 2.4;
            return (
              <mesh key={`pagoda-pillar-${pi}`} position={[px, 2.2, pz]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 2.7, 8]} />
                <meshStandardMaterial color="#dc2626" roughness={0.4} />
              </mesh>
            );
          })}

          {/* Railing around perimeter */}
          {Array.from({ length: 6 }).map((_, ri) => {
            const angle = (ri / 6) * Math.PI * 2;
            const rx = Math.cos(angle + 0.52) * 2.4;
            const rz = Math.sin(angle + 0.52) * 2.4;
            return (
              <mesh key={`railing-${ri}`} position={[rx, 1.3, rz]} rotation={[0, -angle, 0]}>
                <boxGeometry args={[2.2, 0.6, 0.06]} />
                <meshStandardMaterial color="#b91c1c" roughness={0.6} />
              </mesh>
            );
          })}

          {/* Lower Pagoda Roof Tier */}
          <mesh position={[0, 3.8, 0]} castShadow>
            <coneGeometry args={[4.2, 1.4, 8]} />
            <meshStandardMaterial color="#ea580c" roughness={0.45} metalness={0.2} />
          </mesh>

          {/* Upper Pagoda Roof Tier */}
          <mesh position={[0, 4.8, 0]} castShadow>
            <coneGeometry args={[2.8, 1.2, 8]} />
            <meshStandardMaterial color="#c2410c" roughness={0.45} metalness={0.2} />
          </mesh>

          {/* Gold Spire Finial */}
          <mesh position={[0, 5.7, 0]}>
            <cylinderGeometry args={[0.04, 0.16, 0.9, 8]} />
            <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.15} />
          </mesh>

          {/* Warm Interior Lantern Glow */}
          <pointLight position={[0, 2.5, 0]} intensity={1.5} color="#fbbf24" distance={8} />
          <mesh position={[0, 2.8, 0]}>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshStandardMaterial
              color="#fde047"
              emissive="#f59e0b"
              emissiveIntensity={3.0}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};
