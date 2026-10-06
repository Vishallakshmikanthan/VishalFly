import React, { useMemo } from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * MetropolitanApartments:
 * - High-rise luxury decorated apartment tower cluster matching reference image:
 *   - Multiple 12 to 24-story residential towers with staggered heights
 *   - Modern cantilevered balconies with glass railings
 *   - Warm illuminated window matrices (giving dynamic evening city vibes)
 *   - Rooftop architectural crowns, penthouse pergolas, and AC chiller units
 * - Foreground Residential Suburb Area:
 *   - Two-story modern suburban houses with pitched gabled roofs, front yards, and chimneys
 */
export const MetropolitanApartments: React.FC = () => {
  const visible = useGameStore((state) => state.metropolitanLayers.residential);

  // High-rise tower cluster specifications
  const towers = useMemo(() => [
    { x: 12, z: -32, width: 8.5, depth: 7.5, height: 32, floors: 16, color: '#475569', trim: '#cbd5e1' },
    { x: 23, z: -34, width: 7.5, depth: 7.5, height: 38, floors: 19, color: '#334155', trim: '#94a3b8' },
    { x: 33, z: -30, width: 8.0, depth: 8.0, height: 28, floors: 14, color: '#475569', trim: '#e2e8f0' },
    { x: 16, z: -20, width: 9.0, depth: 7.5, height: 36, floors: 18, color: '#1e293b', trim: '#38bdf8' },
    { x: 28, z: -18, width: 8.5, depth: 8.0, height: 30, floors: 15, color: '#334155', trim: '#f8fafc' },
    { x: 5, z: -22, width: 7.5, depth: 7.0, height: 24, floors: 12, color: '#475569', trim: '#94a3b8' },
    { x: 2, z: -34, width: 8.0, depth: 7.5, height: 26, floors: 13, color: '#1e293b', trim: '#cbd5e1' },
  ], []);

  // Foreground residential houses
  const houses = useMemo(() => [
    { x: 34, z: 42, rot: 0.1, roofColor: '#b91c1c' },
    { x: 44, z: 40, rot: -0.2, roofColor: '#c2410c' },
    { x: 54, z: 42, rot: 0.05, roofColor: '#9a3412' },
    { x: 32, z: 52, rot: -0.1, roofColor: '#b45309' },
    { x: 42, z: 54, rot: 0.2, roofColor: '#b91c1c' },
    { x: 52, z: 52, rot: -0.15, roofColor: '#c2410c' },
  ], []);

  if (!visible) return null;

  return (
    <group name="MetropolitanApartmentsAndResidential">
      {/* 1. HIGH-RISE LUXURY APARTMENT TOWERS */}
      <group name="LuxurySkyscraperTowers">
        {towers.map((tw, idx) => (
          <group key={`apt-tower-${idx}`} position={[tw.x, 0, tw.z]}>
            {/* Concrete Podium Base */}
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[tw.width + 1.2, 3.0, tw.depth + 1.2]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} />
            </mesh>

            {/* Main Tower Shaft */}
            <mesh position={[0, tw.height / 2 + 1.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[tw.width, tw.height, tw.depth]} />
              <meshStandardMaterial color={tw.color} roughness={0.65} />
            </mesh>

            {/* Balconies with Glass Railings across Floors */}
            {Array.from({ length: Math.floor(tw.floors / 2) }).map((_, f) => {
              const yPos = 4.0 + f * 3.6;
              return (
                <React.Fragment key={`balcony-${f}`}>
                  {/* Front Balcony Slab */}
                  <mesh position={[0, yPos, tw.depth / 2 + 0.6]} castShadow>
                    <boxGeometry args={[tw.width * 0.75, 0.18, 1.2]} />
                    <meshStandardMaterial color={tw.trim} roughness={0.5} />
                  </mesh>
                  {/* Glass Balcony Railing */}
                  <mesh position={[0, yPos + 0.45, tw.depth / 2 + 1.15]}>
                    <boxGeometry args={[tw.width * 0.74, 0.75, 0.06]} />
                    <meshPhysicalMaterial
                      color="#38bdf8"
                      transmission={0.6}
                      opacity={0.65}
                      transparent
                      roughness={0.1}
                    />
                  </mesh>

                  {/* Lit Window Matrix on Tower Face */}
                  <mesh position={[0, yPos + 0.8, tw.depth / 2 + 0.02]}>
                    <planeGeometry args={[tw.width * 0.65, 1.4]} />
                    <meshStandardMaterial
                      color="#fef08a"
                      emissive="#fef08a"
                      emissiveIntensity={f % 3 === 0 ? 1.8 : 0.8}
                    />
                  </mesh>
                </React.Fragment>
              );
            })}

            {/* Side Window Strips */}
            {Array.from({ length: Math.floor(tw.floors / 3) }).map((_, sf) => {
              const yPos = 5.0 + sf * 5.2;
              return (
                <React.Fragment key={`side-window-${sf}`}>
                  <mesh position={[tw.width / 2 + 0.02, yPos, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <planeGeometry args={[tw.depth * 0.6, 1.6]} />
                    <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={1.2} />
                  </mesh>
                  <mesh position={[-tw.width / 2 - 0.02, yPos, 0]} rotation={[0, -Math.PI / 2, 0]}>
                    <planeGeometry args={[tw.depth * 0.6, 1.6]} />
                    <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={1.2} />
                  </mesh>
                </React.Fragment>
              );
            })}

            {/* Architectural Rooftop Crown / Terrace */}
            <group position={[0, tw.height + 1.5, 0]}>
              {/* Crown Parapet */}
              <mesh position={[0, 0.9, 0]} castShadow>
                <boxGeometry args={[tw.width - 0.6, 1.8, tw.depth - 0.6]} />
                <meshStandardMaterial color="#0f172a" roughness={0.8} />
              </mesh>
              {/* Penthouse Glass Box */}
              <mesh position={[0, 1.6, 0]}>
                <boxGeometry args={[tw.width * 0.5, 1.4, tw.depth * 0.5]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  emissive="#0284c7"
                  emissiveIntensity={0.6}
                  metalness={0.8}
                />
              </mesh>
              {/* AC Chiller Units & Antennas */}
              <mesh position={[tw.width * 0.25, 2.0, tw.depth * 0.25]}>
                <boxGeometry args={[1.2, 0.8, 1.2]} />
                <meshStandardMaterial color="#64748b" metalness={0.8} />
              </mesh>
              {/* Communications Mast with Red Beacon Light */}
              <mesh position={[0, 3.2, 0]}>
                <cylinderGeometry args={[0.04, 0.08, 2.8, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
              </mesh>
              <mesh position={[0, 4.6, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.0} />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      {/* 2. FOREGROUND RESIDENTIAL SUBURBAN HOMES */}
      <group name="ResidentialSuburbArea">
        {houses.map((hs, hi) => (
          <group key={`house-${hi}`} position={[hs.x, 0, hs.z]} rotation={[0, hs.rot, 0]}>
            {/* Lawn Plot */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[8.5, 9.5]} />
              <meshStandardMaterial color="#15803d" roughness={0.9} />
            </mesh>

            {/* Main House Two-Story Body */}
            <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[6.2, 4.4, 5.8]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>

            {/* Gabled Pitched Roof */}
            <mesh position={[0, 5.2, 0]} rotation={[0, 0, 0]} castShadow>
              <coneGeometry args={[4.8, 2.2, 4]} />
              <meshStandardMaterial color={hs.roofColor} roughness={0.6} />
            </mesh>

            {/* Brick Chimney */}
            <mesh position={[1.8, 5.6, 1.2]} castShadow>
              <boxGeometry args={[0.6, 1.8, 0.6]} />
              <meshStandardMaterial color="#7f1d1d" roughness={0.9} />
            </mesh>

            {/* Warm Lit Windows */}
            {[-1.6, 1.6].map((wx, wi) => (
              <React.Fragment key={`win-${wi}`}>
                <mesh position={[wx, 1.5, 2.92]}>
                  <planeGeometry args={[1.2, 1.4]} />
                  <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={1.4} />
                </mesh>
                <mesh position={[wx, 3.2, 2.92]}>
                  <planeGeometry args={[1.2, 1.2]} />
                  <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={1.4} />
                </mesh>
              </React.Fragment>
            ))}

            {/* Front Door */}
            <mesh position={[0, 1.0, 2.92]}>
              <planeGeometry args={[1.0, 2.0]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>

            {/* Driveway */}
            <mesh position={[2.6, 0.03, 2.8]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.0, 4.0]} />
              <meshStandardMaterial color="#64748b" roughness={0.8} />
            </mesh>

            {/* Yard Bush / Small Tree */}
            <mesh position={[-2.4, 1.0, 3.2]} castShadow>
              <sphereGeometry args={[0.9, 8, 8]} />
              <meshStandardMaterial color="#166534" roughness={0.85} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
