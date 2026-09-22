import React from 'react';
import { LOCATIONS } from '../../../navigation/locationGraph';
import { TimeOfDayLighting } from '../common/TimeOfDayLighting';

interface PlaceholderEnvironmentProps {
  locationId: 'gym' | 'grounds' | 'balcony' | 'travel';
}

/**
 * Transit Corridor Environment (for active travel commutes):
 * - Asphalt road highway with yellow and white road markings
 * - Roadside safety curbs and reflective streetlamp posts
 * - Distant urban transit skyline
 * - Dynamic Time-of-Day lighting
 */
export const PlaceholderEnvironment: React.FC<PlaceholderEnvironmentProps> = ({ locationId }) => {
  const config = LOCATIONS[locationId] || LOCATIONS.travel;
  const { minX, maxX, minY, maxY, minZ, maxZ } = config.bounds;

  const width = maxX - minX;
  const depth = maxZ - minZ;
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;

  return (
    <group name={`Environment_${locationId}`}>
      <TimeOfDayLighting isInterior={false} accentColor="#eab308" />
      <pointLight position={[centerX, maxY - 0.5, centerZ]} intensity={1.5} color="#fbbf24" distance={10} />

      {/* Asphalt Road Surface */}
      <mesh position={[centerX, minY, centerZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#1e293b" roughness={0.88} metalness={0.15} />
      </mesh>

      {/* Road Lane Center Dashed Lines */}
      {[-3, -1.8, -0.6, 0.6, 1.8, 3].map((z, idx) => (
        <mesh key={`lane-dash-${idx}`} position={[centerX, minY + 0.005, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.15, 0.6]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
      ))}

      {/* Roadside Concrete Curbs */}
      {[-2.5, 2.5].map((cx, idx) => (
        <group key={`curb-${idx}`} position={[cx, minY + 0.1, centerZ]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.3, 0.2, depth]} />
            <meshStandardMaterial color="#64748b" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Highway Streetlamp Posts */}
      {[
        [-2.7, -2.5],
        [-2.7, 2.5],
        [2.7, -2.5],
        [2.7, 2.5],
      ].map(([sx, sz], i) => (
        <group key={`lamp-${i}`} position={[sx, minY, sz]}>
          {/* Post */}
          <mesh position={[0, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.06, 3.6, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Overhanging Arm */}
          <mesh position={[sx < 0 ? 0.3 : -0.3, 3.6, 0]} rotation={[0, 0, sx < 0 ? -0.4 : 0.4]}>
            <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Glowing Lamp Head */}
          <mesh position={[sx < 0 ? 0.6 : -0.6, 3.75, 0]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={1.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
