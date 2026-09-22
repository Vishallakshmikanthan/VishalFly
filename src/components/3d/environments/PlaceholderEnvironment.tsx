import React from 'react';
import { LOCATIONS } from '../../../navigation/locationGraph';

interface PlaceholderEnvironmentProps {
  locationId: 'gym' | 'grounds' | 'balcony' | 'travel';
}

export const PlaceholderEnvironment: React.FC<PlaceholderEnvironmentProps> = ({ locationId }) => {
  const config = LOCATIONS[locationId] || LOCATIONS.bedroom;
  const { minX, maxX, minY, maxY, minZ, maxZ } = config.bounds;

  const width = maxX - minX;
  const depth = maxZ - minZ;
  const height = maxY - minY;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;

  // Theme colors per placeholder
  const themeColors: Record<string, { floor: string; accent: string; grid: string }> = {
    gym: { floor: '#1e1b2e', accent: '#f59e0b', grid: '#4338ca' },
    grounds: { floor: '#0d2818', accent: '#10b981', grid: '#059669' },
    balcony: { floor: '#1f2937', accent: '#38bdf8', grid: '#0284c7' },
    travel: { floor: '#18181b', accent: '#eab308', grid: '#71717a' },
  };

  const currentTheme = themeColors[locationId] || themeColors.travel;

  return (
    <group name={`Placeholder_${locationId}`}>
      {/* Ambient and directional lighting */}
      <ambientLight intensity={0.6} color="#e2e8f0" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[centerX, maxY - 0.5, centerZ]} intensity={2.0} color={currentTheme.accent} distance={12} />

      {/* Styled Floor */}
      <mesh position={[centerX, minY, centerZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color={currentTheme.floor}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Grid Overlay */}
      <gridHelper
        position={[centerX, minY + 0.01, centerZ]}
        args={[Math.max(width, depth), 12, currentTheme.accent, currentTheme.grid]}
      />

      {/* Boundary perimeter wireframe */}
      <mesh position={[centerX, centerY, centerZ]}>
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial color={currentTheme.accent} wireframe transparent opacity={0.12} />
      </mesh>

      {/* Corner boundary posts */}
      {[
        [minX, minZ],
        [minX, maxZ],
        [maxX, minZ],
        [maxX, maxZ],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, centerY, z]}>
          <cylinderGeometry args={[0.06, 0.06, height, 8]} />
          <meshStandardMaterial color={currentTheme.accent} emissive={currentTheme.accent} emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* Landmark Pedestals */}
      {config.landmarks.map((lm, idx) => {
        const lmX = (lm.minX + lm.maxX) / 2;
        const lmZ = (lm.minZ + lm.maxZ) / 2;
        const lmY = minY + 0.05;

        return (
          <group key={idx} position={[lmX, lmY, lmZ]}>
            {/* Base glowing circle */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.4, 0.6, 24]} />
              <meshBasicMaterial color={currentTheme.accent} transparent opacity={0.6} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.12, 0.15, 0.3, 12]} />
              <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.4} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
