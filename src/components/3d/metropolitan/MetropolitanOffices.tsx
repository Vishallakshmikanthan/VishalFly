import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * MetropolitanOffices:
 * Modern commercial glass office skyscrapers matching reference image:
 * - Reflective blue glass curtain walls
 * - Modern geometric podiums and architectural sky-gardens
 * - Rooftop communications arrays and lit corporate penthouse crowns
 */
export const MetropolitanOffices: React.FC = () => {
  const visible = useGameStore((state) => state.metropolitanLayers.buildings);

  if (!visible) return null;

  return (
    <group position={[-38, 0, -12]} name="MetropolitanOffices">
      {/* Tower 1: Primary Glass Corporate Tower */}
      <group position={[0, 0, 0]}>
        {/* Foundation */}
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[12, 3.0, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>

        {/* Main Blue Glass Monolith */}
        <mesh position={[0, 18, 0]} castShadow receiveShadow>
          <boxGeometry args={[10, 33, 10]} />
          <meshPhysicalMaterial
            color="#0284c7"
            emissive="#0369a1"
            emissiveIntensity={0.2}
            roughness={0.15}
            metalness={0.8}
            reflectivity={0.9}
          />
        </mesh>

        {/* Vertical Architectural Fins */}
        {[-4.8, -1.6, 1.6, 4.8].map((fx, fi) => (
          <mesh key={`fin-${fi}`} position={[fx, 18, 5.05]}>
            <boxGeometry args={[0.15, 32.5, 0.4]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}

        {/* Illuminated Floor Slabs visible through glass */}
        {Array.from({ length: 9 }).map((_, fl) => (
          <mesh key={`floor-light-${fl}`} position={[0, 5 + fl * 3.4, 0]}>
            <boxGeometry args={[9.4, 0.1, 9.4]} />
            <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={0.8} />
          </mesh>
        ))}

        {/* Rooftop Crown */}
        <mesh position={[0, 35.5, 0]} castShadow>
          <boxGeometry args={[8, 2.0, 8]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 38.0, 0]}>
          <cylinderGeometry args={[0.08, 0.2, 4.0, 8]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.9} />
        </mesh>
      </group>

      {/* Tower 2: Secondary Office High-rise */}
      <group position={[14, 0, -4]}>
        <mesh position={[0, 14, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.5, 28, 8.5]} />
          <meshPhysicalMaterial
            color="#0f766e"
            emissive="#115e59"
            emissiveIntensity={0.2}
            roughness={0.2}
            metalness={0.7}
          />
        </mesh>
        {/* Crown Accent */}
        <mesh position={[0, 28.5, 0]}>
          <boxGeometry args={[7.5, 1.5, 7.5]} />
          <meshStandardMaterial color="#14b8a6" emissive="#14b8a6" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
};
