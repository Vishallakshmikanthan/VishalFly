import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * Detailed Architectural Residential Apartment Building
 */
interface DetailedApartmentProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  floors?: number;
  width?: number;
  depth?: number;
  primaryColor?: string;
  balconyColor?: string;
  nameLabel?: string;
}

const DetailedApartmentBuilding: React.FC<DetailedApartmentProps> = ({
  position,
  rotation = [0, 0, 0],
  floors = 7,
  width = 16,
  depth = 14,
  primaryColor = '#f1f5f9',
  balconyColor = '#3b82f6',
  nameLabel = 'Residential Heights',
}) => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const isNightOrEvening = timeOfDay === 'night' || timeOfDay === 'evening';
  const floorHeight = 3.2;
  const totalHeight = floors * floorHeight;

  return (
    <group position={position} rotation={rotation} name={nameLabel}>
      {/* 1. Main Structural Concrete Core */}
      <mesh position={[0, totalHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, totalHeight, depth]} />
        <meshStandardMaterial color={primaryColor} roughness={0.6} />
      </mesh>

      {/* 2. Floors Window Matrix & Balconies */}
      {Array.from({ length: floors }).map((_, fIdx) => {
        const floorY = 1.6 + fIdx * floorHeight;
        const isGroundFloor = fIdx === 0;

        if (isGroundFloor) {
          // Ground Floor Stilt Parking & Entrance Portico
          return (
            <group key={`gf-${fIdx}`} position={[0, 1.6, 0]}>
              {/* Entrance Double Glass Doors */}
              <mesh position={[0, 0, depth / 2 + 0.05]}>
                <boxGeometry args={[3.2, 2.6, 0.1]} />
                <meshPhysicalMaterial
                  color="#38bdf8"
                  transmission={0.8}
                  roughness={0.1}
                  transparent
                />
              </mesh>
              {/* Concrete Portico Canopy & Name Sign */}
              <mesh position={[0, 1.4, depth / 2 + 1.8]} castShadow>
                <boxGeometry args={[5.2, 0.3, 3.6]} />
                <meshStandardMaterial color="#334155" roughness={0.5} />
              </mesh>
              <group position={[0, 1.75, depth / 2 + 3.6]}>
                <mesh>
                  <boxGeometry args={[4.2, 0.45, 0.1]} />
                  <meshStandardMaterial color="#0f172a" />
                </mesh>
                <mesh position={[0, 0, 0.06]}>
                  <planeGeometry args={[4.0, 0.35]} />
                  <meshStandardMaterial
                    color="#facc15"
                    emissive="#eab308"
                    emissiveIntensity={isNightOrEvening ? 1.8 : 0.6}
                  />
                </mesh>
              </group>
              {/* Support Columns */}
              {[-2.2, 2.2].map((cx, ci) => (
                <mesh key={`col-${ci}`} position={[cx, 0, depth / 2 + 3.2]} castShadow>
                  <cylinderGeometry args={[0.18, 0.22, 2.8, 8]} />
                  <meshStandardMaterial color="#64748b" />
                </mesh>
              ))}
            </group>
          );
        }

        return (
          <group key={`floor-${fIdx}`} position={[0, floorY, 0]}>
            {/* Horizontal Architectural Floor Band */}
            <mesh position={[0, -floorHeight / 2, 0]}>
              <boxGeometry args={[width + 0.4, 0.25, depth + 0.4]} />
              <meshStandardMaterial color="#334155" roughness={0.5} />
            </mesh>

            {/* Front Windows (Row of 3 sets with frames & glass) */}
            {[-width * 0.32, 0, width * 0.32].map((wx, wi) => (
              <group key={`win-f-${wi}`} position={[wx, 0, depth / 2 + 0.05]}>
                {/* Window Frame Surround */}
                <mesh>
                  <boxGeometry args={[2.4, 1.8, 0.15]} />
                  <meshStandardMaterial color="#0f172a" />
                </mesh>
                {/* Glazed Glass Pane with Night Illumination */}
                <mesh position={[0, 0, 0.05]}>
                  <planeGeometry args={[2.1, 1.5]} />
                  <meshStandardMaterial
                    color={isNightOrEvening ? '#fef08a' : '#94a3b8'}
                    emissive={isNightOrEvening ? '#facc15' : '#000000'}
                    emissiveIntensity={isNightOrEvening ? (wi % 2 === 0 ? 1.8 : 0.8) : 0}
                    roughness={0.2}
                  />
                </mesh>
                {/* Outdoor Split AC Compressor Unit Beneath Window */}
                {wi === 1 && (
                  <group position={[0, -1.2, 0.4]}>
                    <mesh castShadow>
                      <boxGeometry args={[0.9, 0.6, 0.5]} />
                      <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
                    </mesh>
                    {/* AC Fan Grill */}
                    <mesh position={[0, 0, 0.26]}>
                      <circleGeometry args={[0.22, 12]} />
                      <meshBasicMaterial color="#1e293b" />
                    </mesh>
                  </group>
                )}
              </group>
            ))}

            {/* Rear Windows */}
            {[-width * 0.25, width * 0.25].map((wx, wi) => (
              <mesh key={`win-b-${wi}`} position={[wx, 0, -depth / 2 - 0.05]}>
                <boxGeometry args={[2.2, 1.6, 0.1]} />
                <meshStandardMaterial
                  color={isNightOrEvening ? '#fed7aa' : '#64748b'}
                  emissive={isNightOrEvening ? '#ea580c' : '#000000'}
                  emissiveIntensity={isNightOrEvening ? 0.7 : 0}
                />
              </mesh>
            ))}

            {/* Projecting Balconies with Metal/Glass Railings */}
            {[-width * 0.35, width * 0.35].map((bx, bi) => (
              <group key={`balc-${bi}`} position={[bx, -0.6, depth / 2 + 0.8]}>
                {/* Balcony Floor Slab */}
                <mesh position={[0, 0, 0]} castShadow>
                  <boxGeometry args={[3.2, 0.2, 1.6]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.7} />
                </mesh>
                {/* Balcony Front Railing */}
                <mesh position={[0, 0.55, 0.75]}>
                  <boxGeometry args={[3.1, 0.9, 0.05]} />
                  <meshPhysicalMaterial
                    color={balconyColor}
                    transmission={0.7}
                    roughness={0.2}
                    transparent
                  />
                </mesh>
                {/* Balcony Potted Plant */}
                <group position={[1.1, 0.3, 0.3]}>
                  <mesh>
                    <cylinderGeometry args={[0.15, 0.12, 0.3, 8]} />
                    <meshStandardMaterial color="#b45309" />
                  </mesh>
                  <mesh position={[0, 0.25, 0]}>
                    <sphereGeometry args={[0.2, 6, 6]} />
                    <meshStandardMaterial color="#15803d" />
                  </mesh>
                </group>
              </group>
            ))}
          </group>
        );
      })}

      {/* 3. ROOFTOP TERRACE AMENITIES (Sintex Water Tanks, Lift Headroom, Solar) */}
      <group position={[0, totalHeight, 0]}>
        {/* Parapet Safety Wall Perimeter */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[width + 0.2, 1.0, depth + 0.2]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>

        {/* Central Staircase & Lift Headroom Penthouse */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[width * 0.35, 3.4, depth * 0.35]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>

        {/* Sintex Black Cylindrical Water Storage Tanks */}
        {[-width * 0.3, width * 0.3].map((tx, ti) => (
          <group key={`sintex-${ti}`} position={[tx, 1.2, -depth * 0.25]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.8, 0.8, 1.8, 12]} />
              <meshStandardMaterial color="#090d16" roughness={0.8} />
            </mesh>
            {/* White Sintex Ring Bands */}
            <mesh position={[0, 0, 0]}>
              <ringGeometry args={[0.81, 0.83, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}

        {/* Satellite Dish Antenna */}
        <group position={[width * 0.25, 0.5, depth * 0.25]} rotation={[0.4, 0.6, 0]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 1.4, 6]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.7, 0]} rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.7, 0.1, 0.2, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        </group>

        {/* Rooftop Solar Water Heating Panels */}
        <group position={[-width * 0.25, 0.6, depth * 0.2]} rotation={[0.3, 0, 0]}>
          <mesh>
            <boxGeometry args={[3.2, 0.1, 1.8]} />
            <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* 4. GROUND LEVEL PERIMETER COMPOUND WALL & NAME SIGNBOARD */}
      <group position={[0, 0, depth / 2 + 4.5]}>
        {/* Entrance Gate Concrete Pillars */}
        {[-3.5, 3.5].map((gx, gi) => (
          <mesh key={`gate-p-${gi}`} position={[gx, 1.4, 0]} castShadow>
            <boxGeometry args={[0.8, 2.8, 0.8]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        ))}
        {/* Name Signboard on Left Gate Pillar */}
        <mesh position={[-3.5, 2.2, 0.42]}>
          <boxGeometry args={[1.8, 0.6, 0.1]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Overhead Entrance Arch Beam with Society Name */}
        <group position={[0, 3.2, 0]}>
          <mesh>
            <boxGeometry args={[8.0, 0.7, 0.6]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0, 0.32]}>
            <planeGeometry args={[7.4, 0.5]} />
            <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

/**
 * ChennaiTownshipApartments:
 * Structured, planned residential neighborhood (Anna Nagar / Velachery style township grid):
 * - 4 distinct planned residential enclaves with street lighting, paved avenues, and compound walls
 * - Detailed architecture with windows, balconies, AC units, Sintex water tanks, satellite dishes
 * - Neighborhood daily amenities: Supermarket, pharmacy clinic, park, and security cabins
 */
export const ChennaiTownshipApartments: React.FC = () => {
  return (
    <group position={[45, 0, -65]} name="ChennaiTownshipResidentialGrid">
      {/* ------------------------------------------------------------- */}
      {/* 1. PLANNED TOWNSHIP STREET PAVING & AVENUES                   */}
      {/* ------------------------------------------------------------- */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[65, 55]} />
        <meshStandardMaterial color="#1e2430" roughness={0.88} />
      </mesh>

      {/* Central 1st Avenue Tree-Lined Median */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 52]} />
        <meshStandardMaterial color="#15803d" roughness={0.9} />
      </mesh>

      {/* Street Lighting Along Township Avenues */}
      {[-22, 0, 22].map((sz, si) => (
        <group key={`tw-lamp-${si}`} position={[0, 0, sz]}>
          <mesh position={[0, 2.8, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 5.6, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0, 5.7, 0]}>
            <sphereGeometry args={[0.22, 8, 8]} />
            <meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={2.5} />
          </mesh>
        </group>
      ))}

      {/* ------------------------------------------------------------- */}
      {/* 2. PLANNED RESIDENTIAL ENCLAVES (4 REALISTIC APARTMENTS)      */}
      {/* ------------------------------------------------------------- */}
      {/* Complex 1: Annamalai Towers (8 Floors, North-West Block) */}
      <DetailedApartmentBuilding
        position={[-18, 0, -14]}
        floors={8}
        width={16}
        depth={13}
        primaryColor="#f8fafc"
        balconyColor="#38bdf8"
        nameLabel="Annamalai Towers"
      />

      {/* Complex 2: Kaveri Regency (7 Floors, North-East Block) */}
      <DetailedApartmentBuilding
        position={[18, 0, -14]}
        floors={7}
        width={15}
        depth={14}
        primaryColor="#fef3c7"
        balconyColor="#f59e0b"
        nameLabel="Kaveri Regency"
      />

      {/* Complex 3: Vaigai Luxury Enclave (9 Floors, South-West Block) */}
      <DetailedApartmentBuilding
        position={[-18, 0, 16]}
        floors={9}
        width={17}
        depth={14}
        primaryColor="#e2e8f0"
        balconyColor="#2563eb"
        nameLabel="Vaigai Enclave"
      />

      {/* Complex 4: Nilgiris Courtyard (6 Floors, South-East Block) */}
      <DetailedApartmentBuilding
        position={[18, 0, 16]}
        floors={6}
        width={16}
        depth={13}
        primaryColor="#ffedd5"
        balconyColor="#ea580c"
        nameLabel="Nilgiris Courtyard"
      />

      {/* ------------------------------------------------------------- */}
      {/* 3. NEIGHBORHOOD AMENITY: DAILY FRESH SUPERMARKET & PHARMACY    */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, -22]}>
        {/* Supermarket Building */}
        <mesh position={[0, 2.2, 0]} castShadow>
          <boxGeometry args={[10, 4.4, 6]} />
          <meshStandardMaterial color="#065f46" roughness={0.4} />
        </mesh>
        {/* Supermarket Illuminated Sign */}
        <mesh position={[0, 4.6, 3.1]}>
          <boxGeometry args={[9.5, 0.8, 0.1]} />
          <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={1.8} />
        </mesh>
      </group>
    </group>
  );
};
