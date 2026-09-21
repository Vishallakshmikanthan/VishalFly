import React from 'react';

/**
 * DiningTables component:
 * - 2 communal PG dining tables with wooden laminate tops
 * - Dining chairs arranged along both sides
 * - Table accessories: stainless steel water carafes, salt shakers, napkin holders
 */
export const DiningTables: React.FC = () => {
  const tableTopMat = <meshStandardMaterial color="#78350f" roughness={0.65} metalness={0.08} />;
  const steelMat = <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />;
  const chairSeatMat = <meshStandardMaterial color="#451a03" roughness={0.7} />;
  const carafeMat = <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />;

  // 2 Dining Tables
  const tablePositions = [-1.4, 1.4];

  return (
    <group name="DiningTablesGroup">
      {tablePositions.map((tx, tIndex) => (
        <group key={`table-${tIndex}`} position={[tx, 0.1, 0.4]}>
          {/* 1. Table Top */}
          <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.06, 2.6]} />
            {tableTopMat}
          </mesh>

          {/* Table Legs */}
          {[
            [-0.65, 0.38, -1.15],
            [0.65, 0.38, -1.15],
            [-0.65, 0.38, 1.15],
            [0.65, 0.38, 1.15],
          ].map(([lx, ly, lz], li) => (
            <mesh key={`t-leg-${li}`} position={[lx, ly, lz]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.72, 8]} />
              {steelMat}
            </mesh>
          ))}

          {/* Table under-frame apron */}
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[1.3, 0.05, 2.4]} />
            {steelMat}
          </mesh>

          {/* 2. Dining Chairs (4 chairs per table: 2 Left, 2 Right) */}
          {/* Chairs on Left Side (facing table) */}
          {[-0.65, 0.65].map((cz, ci) => (
            <group key={`l-chair-${ci}`} position={[-1.15, 0, cz]} rotation={[0, Math.PI / 2, 0]}>
              {/* Seat */}
              <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.46, 0.05, 0.46]} />
                {chairSeatMat}
              </mesh>
              {/* Backrest */}
              <mesh position={[0, 0.74, 0.2]} rotation={[-0.08, 0, 0]} castShadow>
                <boxGeometry args={[0.42, 0.34, 0.03]} />
                {chairSeatMat}
              </mesh>
              {/* 4 Chair Legs */}
              {[
                [-0.18, 0.22, -0.18],
                [0.18, 0.22, -0.18],
                [-0.18, 0.22, 0.18],
                [0.18, 0.22, 0.18],
              ].map(([cx, cy, cz_leg], cii) => (
                <mesh key={`c-leg-${cii}`} position={[cx, cy, cz_leg]} castShadow>
                  <cylinderGeometry args={[0.018, 0.018, 0.44, 6]} />
                  {steelMat}
                </mesh>
              ))}
            </group>
          ))}

          {/* Chairs on Right Side (facing table) */}
          {[-0.65, 0.65].map((cz, ci) => (
            <group key={`r-chair-${ci}`} position={[1.15, 0, cz]} rotation={[0, -Math.PI / 2, 0]}>
              <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.46, 0.05, 0.46]} />
                {chairSeatMat}
              </mesh>
              <mesh position={[0, 0.74, 0.2]} rotation={[-0.08, 0, 0]} castShadow>
                <boxGeometry args={[0.42, 0.34, 0.03]} />
                {chairSeatMat}
              </mesh>
              {[
                [-0.18, 0.22, -0.18],
                [0.18, 0.22, -0.18],
                [-0.18, 0.22, 0.18],
                [0.18, 0.22, 0.18],
              ].map(([cx, cy, cz_leg], cii) => (
                <mesh key={`rc-leg-${cii}`} position={[cx, cy, cz_leg]} castShadow>
                  <cylinderGeometry args={[0.018, 0.018, 0.44, 6]} />
                  {steelMat}
                </mesh>
              ))}
            </group>
          ))}

          {/* 3. Tabletop Center Accessories */}
          {/* Stainless Steel Water Jug */}
          <group position={[0, 0.79, 0.4]}>
            <mesh position={[0, 0.14, 0]} castShadow>
              <cylinderGeometry args={[0.065, 0.08, 0.28, 16]} />
              {carafeMat}
            </mesh>
            <mesh position={[0, 0.29, 0]}>
              <cylinderGeometry args={[0.04, 0.065, 0.04, 16]} />
              {carafeMat}
            </mesh>
            {/* Jug handle */}
            <mesh position={[0.08, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.07, 0.012, 8, 16]} />
              {carafeMat}
            </mesh>
          </group>

          {/* Napkin Caddy */}
          <group position={[0, 0.79, -0.4]}>
            <mesh position={[0, 0.06, 0]} castShadow>
              <boxGeometry args={[0.12, 0.12, 0.16]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
            </mesh>
            {/* Paper napkins */}
            <mesh position={[0, 0.08, 0]}>
              <boxGeometry args={[0.09, 0.12, 0.14]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.9} />
            </mesh>
          </group>

          {/* Salt & Pepper Shakers */}
          <group position={[0.2, 0.79, 0]}>
            <mesh position={[-0.03, 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.022, 0.022, 0.09, 8]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.6} />
            </mesh>
            <mesh position={[0.03, 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.022, 0.022, 0.09, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.6} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
};
