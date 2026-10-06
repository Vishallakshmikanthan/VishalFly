import React, { useMemo } from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * MetropolitanRoadsAndInfrastructure:
 * Realistic multi-lane asphalt highway and boulevard network matching the reference city layout:
 * - 6-lane central thoroughfare with yellow center medians and lane dashes
 * - East-West intersecting boulevards and cross-streets
 * - Concrete sidewalks, safety curbs, and pedestrian crosswalks (zebra markings)
 * - Streetlamps with warm emissive glow fixtures
 * - Traffic light gantries at major junctions
 */
export const MetropolitanRoadsAndInfrastructure: React.FC = () => {
  const visible = useGameStore((state) => state.metropolitanLayers.roads);
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const isNightOrEvening = timeOfDay === 'night' || timeOfDay === 'evening';

  const crosswalkPositions = useMemo(() => [
    { x: 0, z: 22, rot: 0, width: 14 },
    { x: 0, z: 32, rot: 0, width: 14 },
    { x: -10, z: 27, rot: Math.PI / 2, width: 10 },
    { x: 10, z: 27, rot: Math.PI / 2, width: 10 },
    { x: 0, z: -10, rot: 0, width: 14 },
    { x: 0, z: 62, rot: 0, width: 14 },
  ], []);

  if (!visible) return null;

  return (
    <group name="MetropolitanRoadsAndInfrastructure">
      {/* 1. Base Terrain Foundation */}
      <mesh position={[0, -0.06, 25]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#090d16" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* 2. Main North-South Multi-lane Boulevard (Z: -60 to 100) */}
      <group position={[0, 0.01, 25]}>
        {/* Asphalt Road Bed */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[16, 170]} />
          <meshStandardMaterial color="#0f172a" roughness={0.88} />
        </mesh>

        {/* Double Yellow Median Dividing Lines */}
        {[-0.18, 0.18].map((ox, i) => (
          <mesh key={`center-yellow-${i}`} position={[ox, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.14, 168]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
        ))}

        {/* White Lane Striping (3 Lanes each direction) */}
        {Array.from({ length: 26 }).map((_, idx) => {
          const zPos = -78 + idx * 6.4;
          return (
            <React.Fragment key={`ns-lane-${idx}`}>
              {/* West Side Lanes */}
              <mesh position={[-2.8, 0.006, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.15, 3.2]} />
                <meshBasicMaterial color="#ffffff" opacity={0.85} transparent />
              </mesh>
              <mesh position={[-5.4, 0.006, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.15, 3.2]} />
                <meshBasicMaterial color="#ffffff" opacity={0.85} transparent />
              </mesh>
              {/* East Side Lanes */}
              <mesh position={[2.8, 0.006, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.15, 3.2]} />
                <meshBasicMaterial color="#ffffff" opacity={0.85} transparent />
              </mesh>
              <mesh position={[5.4, 0.006, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.15, 3.2]} />
                <meshBasicMaterial color="#ffffff" opacity={0.85} transparent />
              </mesh>
            </React.Fragment>
          );
        })}

        {/* Curbs & Sidewalks */}
        {[-8.6, 8.6].map((cx, i) => (
          <group key={`ns-sidewalk-${i}`} position={[cx, 0.08, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.8, 0.16, 170]} />
              <meshStandardMaterial color="#334155" roughness={0.75} />
            </mesh>
            {/* Edge Curb highlight */}
            <mesh position={[i === 0 ? 0.85 : -0.85, 0.04, 0]}>
              <boxGeometry args={[0.15, 0.2, 170]} />
              <meshStandardMaterial color="#64748b" roughness={0.65} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 3. Major East-West Intersecting Boulevard (Z: 27) - West Sector & Park Promenade Approach */}
      {/* West Boulevard Roadbed (Terminates at Main Junction X: 8) */}
      <group position={[-41, 0.015, 27]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[98, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.88} />
        </mesh>
        {/* Double Yellow Dividing Lines */}
        {[-0.15, 0.15].map((oz, i) => (
          <mesh key={`ew-yellow-${i}`} position={[-4.0, 0.005, oz]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[90, 0.12]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
        ))}
        {/* Lane Dashes (West Approach Only) */}
        {Array.from({ length: 11 }).map((_, idx) => {
          const xOffset = -42 + idx * 7.0;
          return (
            <React.Fragment key={`ew-lane-${idx}`}>
              <mesh position={[xOffset, 0.006, -3.0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[3.0, 0.14]} />
                <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
              </mesh>
              <mesh position={[xOffset, 0.006, 3.0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[3.0, 0.14]} />
                <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
              </mesh>
            </React.Fragment>
          );
        })}
        {/* Sidewalks along West Boulevard */}
        {[-6.6, 6.6].map((cz, i) => (
          <mesh key={`ew-sidewalk-${i}`} position={[0, 0.08, cz]} castShadow receiveShadow>
            <boxGeometry args={[98, 0.16, 1.4]} />
            <meshStandardMaterial color="#334155" roughness={0.75} />
          </mesh>
        ))}
      </group>

      {/* East Waterfront Promenade Turnaround (Ends at X: 21, keeping Lake & Park 100% clean and road-free) */}
      <group position={[14.5, 0.015, 27]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[13, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.88} />
        </mesh>
        {/* Scenic Semi-circular Turnaround Cul-de-sac Curbs */}
        <mesh position={[6.0, 0.08, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 0.16, 12]} />
          <meshStandardMaterial color="#334155" roughness={0.75} />
        </mesh>
        {/* Promenade Entrance Arch Pillars */}
        {[-5.0, 5.0].map((pz, pi) => (
          <mesh key={`promenade-post-${pi}`} position={[6.2, 1.6, pz]} castShadow>
            <cylinderGeometry args={[0.25, 0.3, 3.2, 8]} />
            <meshStandardMaterial color="#475569" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Secondary East-West Street (Z: -12, Mall access West, Gated Apartment Entry East) */}
      {/* West Portion (Mall Access) */}
      <group position={[-39, 0.012, -12]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[62, 8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.88} />
        </mesh>
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[60, 0.14]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
      </group>
      {/* East Portion: Short Driveway to Apartment Complex Gate (Ends at X: 16) */}
      <group position={[12, 0.012, -12]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.85} />
        </mesh>
      </group>

      {/* Secondary East-West Street (Z: 66, Hospital & Emergency Bay Access) */}
      <group position={[-20, 0.012, 66]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[56, 8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.88} />
        </mesh>
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[54, 0.14]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
      </group>
      <group position={[20, 0.012, 66]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[24, 8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.88} />
        </mesh>
      </group>

      {/* Dedicated Roadside Bus Stop Bay Marking (East Sidewalk, Z: -3) */}
      <group position={[6.0, 0.007, -3]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.8, 9.6]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
        {/* Yellow Bus Bay Border */}
        <mesh position={[-1.3, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 9.6]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
        {/* Yellow Diagonal Slits inside Bus Bay */}
        {[-3.6, -1.8, 0, 1.8, 3.6].map((dy, di) => (
          <mesh key={`bus-hatch-${di}`} position={[0, 0.002, dy]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
            <planeGeometry args={[0.15, 2.2]} />
            <meshBasicMaterial color="#facc15" opacity={0.85} transparent />
          </mesh>
        ))}
      </group>

      {/* 4. Pedestrian Crosswalks (Zebra Markings) */}
      {crosswalkPositions.map((cw, ci) => (
        <group key={`crosswalk-${ci}`} position={[cw.x, 0.02, cw.z]} rotation={[0, cw.rot, 0]}>
          {Array.from({ length: 8 }).map((_, sIdx) => {
            const offset = -cw.width / 2 + (sIdx + 0.5) * (cw.width / 8);
            return (
              <mesh key={`stripe-${sIdx}`} position={[offset, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[cw.width / 14, 2.4]} />
                <meshBasicMaterial color="#f8fafc" />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* 5. Street Lighting Network (Emissive Glow, High Performance) */}
      {[-55, -35, -18, 5, 20, 38, 55, 75, 92].map((zPos, idx) => (
        <React.Fragment key={`lamp-pair-${idx}`}>
          {/* West Side Lamp */}
          <group position={[-9.8, 0, zPos]}>
            <mesh position={[0, 2.8, 0]}>
              <cylinderGeometry args={[0.07, 0.1, 5.6, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            <mesh position={[0.7, 5.5, 0]} rotation={[0, 0, -0.45]}>
              <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            {/* Glowing Lantern */}
            <mesh position={[1.4, 5.2, 0]}>
              <sphereGeometry args={[0.22, 10, 10]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#fef08a"
                emissiveIntensity={2.8}
                roughness={0.1}
              />
            </mesh>
          </group>

          {/* East Side Lamp */}
          <group position={[9.8, 0, zPos]}>
            <mesh position={[0, 2.8, 0]}>
              <cylinderGeometry args={[0.07, 0.1, 5.6, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            <mesh position={[-0.7, 5.5, 0]} rotation={[0, 0, 0.45]}>
              <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            {/* Glowing Lantern */}
            <mesh position={[-1.4, 5.2, 0]}>
              <sphereGeometry args={[0.22, 10, 10]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#fef08a"
                emissiveIntensity={2.8}
                roughness={0.1}
              />
            </mesh>
          </group>
        </React.Fragment>
      ))}

      {/* Dynamic Night Street Illumination (Warm Golden Street Lighting) */}
      {isNightOrEvening && (
        <group name="StreetIlluminationRadiance">
          {[-45, -10, 27, 65].map((zPoint, pIdx) => (
            <pointLight
              key={`st-light-${pIdx}`}
              position={[0, 6.5, zPoint]}
              color="#fef08a"
              intensity={2.2}
              distance={42}
              decay={2}
            />
          ))}
        </group>
      )}

      {/* 6. Intersection Traffic Lights */}
      {[
        { x: -9.5, z: 23, rot: 0 },
        { x: 9.5, z: 31, rot: Math.PI },
        { x: -9.5, z: 31, rot: Math.PI / 2 },
        { x: 9.5, z: 23, rot: -Math.PI / 2 },
      ].map((tl, i) => (
        <group key={`tl-${i}`} position={[tl.x, 0, tl.z]} rotation={[0, tl.rot, 0]}>
          <mesh position={[0, 3.2, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 6.4, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[0.9, 6.0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 1.8, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          {/* Signal Box */}
          <mesh position={[1.5, 5.8, 0]}>
            <boxGeometry args={[0.3, 0.9, 0.3]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          {/* Green / Amber / Red Lights */}
          <mesh position={[1.5, 6.1, 0.16]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[1.5, 5.8, 0.16]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={1.0} />
          </mesh>
          <mesh position={[1.5, 5.5, 0.16]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={3.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
