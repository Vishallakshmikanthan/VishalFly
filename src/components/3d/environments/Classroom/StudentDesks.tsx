import React from 'react';

/**
 * StudentDesks component:
 * - 3 tiered/progressive rows of college student desks
 * - Left and right desk banks with central walking aisle
 * - Ergonomic student chairs with cushions
 * - Student accessories: open notebooks, laptops, water bottles, and stationery
 */
export const StudentDesks: React.FC = () => {
  const deskTopMat = <meshStandardMaterial color="#92400e" roughness={0.6} metalness={0.05} />;
  const steelMat = <meshStandardMaterial color="#1f2937" roughness={0.7} metalness={0.8} />;
  const chairMat = <meshStandardMaterial color="#0f172a" roughness={0.85} />;
  const notebookMat = <meshStandardMaterial color="#f8fafc" roughness={0.8} />;

  // 3 Rows with their Z positions
  const rows = [-1.5, 0.2, 1.9];

  return (
    <group name="StudentDesksGroup">
      {rows.map((rowZ, rowIndex) => (
        <group key={`row-${rowIndex}`} position={[0, 0, rowZ]}>
          {/* Left Desk Bank (X: -2.6) */}
          <group position={[-2.6, 0.1, 0]}>
            {/* Desk Surface */}
            <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
              <boxGeometry args={[3.2, 0.06, 0.65]} />
              {deskTopMat}
            </mesh>
            {/* Metal Frame Legs */}
            {[-1.5, 0, 1.5].map((lx, i) => (
              <group key={`l-leg-${i}`} position={[lx, 0.38, 0]}>
                <mesh position={[0, 0, -0.26]} castShadow>
                  <boxGeometry args={[0.05, 0.74, 0.05]} />
                  {steelMat}
                </mesh>
                <mesh position={[0, 0, 0.26]} castShadow>
                  <boxGeometry args={[0.05, 0.74, 0.05]} />
                  {steelMat}
                </mesh>
                {/* Horizontal floor foot */}
                <mesh position={[0, -0.36, 0]}>
                  <boxGeometry args={[0.06, 0.04, 0.58]} />
                  {steelMat}
                </mesh>
              </group>
            ))}

            {/* 2 Chairs for Left Bank */}
            {[-0.8, 0.8].map((cx, i) => (
              <group key={`l-chair-${i}`} position={[cx, 0, 0.6]}>
                {/* Seat Cushion */}
                <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.54, 0.06, 0.5]} />
                  {chairMat}
                </mesh>
                {/* Curved Backrest */}
                <mesh position={[0, 0.78, 0.22]} rotation={[-0.1, 0, 0]} castShadow>
                  <boxGeometry args={[0.5, 0.36, 0.04]} />
                  {chairMat}
                </mesh>
                {/* Chair Stem & 4-leg base */}
                <mesh position={[0, 0.22, 0]} castShadow>
                  <cylinderGeometry args={[0.025, 0.025, 0.44, 8]} />
                  {steelMat}
                </mesh>
                {[-0.18, 0.18].map((bx, bi) => (
                  <mesh key={`c-foot-${bi}`} position={[bx, 0.02, 0]}>
                    <boxGeometry args={[0.03, 0.03, 0.42]} />
                    {steelMat}
                  </mesh>
                ))}
              </group>
            ))}

            {/* Left Desk Accessories */}
            {/* Student Laptop on left desk */}
            {rowIndex === 0 && (
              <group position={[-0.8, 0.81, 0.05]} rotation={[0, -0.1, 0]}>
                <mesh position={[0, 0.01, 0]} castShadow>
                  <boxGeometry args={[0.42, 0.018, 0.28]} />
                  <meshStandardMaterial color="#475569" metalness={0.8} />
                </mesh>
                <group position={[0, 0.015, -0.13]} rotation={[-0.4, 0, 0]}>
                  <mesh position={[0, 0.13, 0]} castShadow>
                    <boxGeometry args={[0.42, 0.26, 0.015]} />
                    <meshStandardMaterial color="#1e293b" metalness={0.8} />
                  </mesh>
                  <mesh position={[0, 0.13, 0.009]}>
                    <planeGeometry args={[0.39, 0.23]} />
                    <meshBasicMaterial color="#38bdf8" />
                  </mesh>
                </group>
              </group>
            )}

            {/* Open notebook */}
            <group position={[0.6, 0.81, 0.02]} rotation={[0, 0.08, 0]}>
              <mesh position={[0, 0.008, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.36, 0.016, 0.46]} />
                {notebookMat}
              </mesh>
              {/* Pen */}
              <mesh position={[0.22, 0.015, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.006, 0.006, 0.22, 6]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
            </group>

            {/* Water bottle */}
            <group position={[-1.3, 0.81, -0.12]}>
              <mesh position={[0, 0.12, 0]} castShadow>
                <cylinderGeometry args={[0.045, 0.045, 0.24, 12]} />
                <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.3} />
              </mesh>
              <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
            </group>
          </group>

          {/* Right Desk Bank (X: +2.6) */}
          <group position={[2.6, 0.1, 0]}>
            {/* Desk Surface */}
            <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
              <boxGeometry args={[3.2, 0.06, 0.65]} />
              {deskTopMat}
            </mesh>
            {/* Metal Frame Legs */}
            {[-1.5, 0, 1.5].map((lx, i) => (
              <group key={`r-leg-${i}`} position={[lx, 0.38, 0]}>
                <mesh position={[0, 0, -0.26]} castShadow>
                  <boxGeometry args={[0.05, 0.74, 0.05]} />
                  {steelMat}
                </mesh>
                <mesh position={[0, 0, 0.26]} castShadow>
                  <boxGeometry args={[0.05, 0.74, 0.05]} />
                  {steelMat}
                </mesh>
                <mesh position={[0, -0.36, 0]}>
                  <boxGeometry args={[0.06, 0.04, 0.58]} />
                  {steelMat}
                </mesh>
              </group>
            ))}

            {/* 2 Chairs for Right Bank */}
            {[-0.8, 0.8].map((cx, i) => (
              <group key={`r-chair-${i}`} position={[cx, 0, 0.6]}>
                <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.54, 0.06, 0.5]} />
                  {chairMat}
                </mesh>
                <mesh position={[0, 0.78, 0.22]} rotation={[-0.1, 0, 0]} castShadow>
                  <boxGeometry args={[0.5, 0.36, 0.04]} />
                  {chairMat}
                </mesh>
                <mesh position={[0, 0.22, 0]} castShadow>
                  <cylinderGeometry args={[0.025, 0.025, 0.44, 8]} />
                  {steelMat}
                </mesh>
                {[-0.18, 0.18].map((bx, bi) => (
                  <mesh key={`rc-foot-${bi}`} position={[bx, 0.02, 0]}>
                    <boxGeometry args={[0.03, 0.03, 0.42]} />
                    {steelMat}
                  </mesh>
                ))}
              </group>
            ))}

            {/* Right Desk Accessories */}
            {rowIndex === 1 && (
              <group position={[0.8, 0.81, 0.05]} rotation={[0, 0.12, 0]}>
                <mesh position={[0, 0.01, 0]} castShadow>
                  <boxGeometry args={[0.42, 0.018, 0.28]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.8} />
                </mesh>
                <group position={[0, 0.015, -0.13]} rotation={[-0.42, 0, 0]}>
                  <mesh position={[0, 0.13, 0]} castShadow>
                    <boxGeometry args={[0.42, 0.26, 0.015]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.8} />
                  </mesh>
                  <mesh position={[0, 0.13, 0.009]}>
                    <planeGeometry args={[0.39, 0.23]} />
                    <meshBasicMaterial color="#a7f3d0" />
                  </mesh>
                </group>
              </group>
            )}

            {/* Binder / Notebook */}
            <mesh position={[-0.6, 0.82, 0]} rotation={[0, -0.05, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.4, 0.025, 0.5]} />
              <meshStandardMaterial color="#3b82f6" roughness={0.7} />
            </mesh>

            {/* Insulated steel flask */}
            <group position={[1.3, 0.81, -0.12]}>
              <mesh position={[0, 0.14, 0]} castShadow>
                <cylinderGeometry args={[0.042, 0.042, 0.26, 12]} />
                <meshStandardMaterial color="#d4d4d8" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          </group>
        </group>
      ))}
    </group>
  );
};
