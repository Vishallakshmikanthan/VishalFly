import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * Detailed Passenger Train Coach
 */
interface TrainCoachProps {
  position: [number, number, number];
  length?: number;
  color?: string;
  roofColor?: string;
  isLocomotive?: boolean;
  isStreamlined?: boolean;
}

const TrainCoach: React.FC<TrainCoachProps> = ({
  position,
  length = 14,
  color = '#1e40af',
  roofColor = '#94a3b8',
  isLocomotive = false,
  isStreamlined = false,
}) => {
  return (
    <group position={position}>
      {/* Coach Main Body */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[3.0, 2.6, length]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>

      {/* Aerodynamic Nose (if Streamlined Bullet / Vande Bharat) */}
      {isStreamlined && (
        <group position={[0, 1.6, length / 2 + 1.8]}>
          <mesh rotation={[0.4, 0, 0]} castShadow>
            <coneGeometry args={[1.5, 3.6, 12]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          {/* Windshield */}
          <mesh position={[0, 0.4, -0.2]} rotation={[0.6, 0, 0]}>
            <boxGeometry args={[2.0, 0.8, 0.8]} />
            <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
          </mesh>
        </group>
      )}

      {/* Curved Roof Cap */}
      <mesh position={[0, 3.15, 0]} castShadow>
        <boxGeometry args={[2.9, 0.35, length]} />
        <meshStandardMaterial color={roofColor} roughness={0.5} />
      </mesh>

      {/* Locomotive Pantograph (Electric Catenary Arm) */}
      {isLocomotive && (
        <group position={[0, 3.8, length * 0.25]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.08, 0.8, 0.08]} />
            <meshStandardMaterial color="#dc2626" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[2.2, 0.08, 0.6]} />
            <meshStandardMaterial color="#475569" metalness={0.9} />
          </mesh>
        </group>
      )}

      {/* Glass Windows Row Along Sides */}
      {[-length * 0.35, -length * 0.15, length * 0.05, length * 0.25].map((wz, wi) => (
        <React.Fragment key={`win-${wi}`}>
          {/* Left Windows */}
          <mesh position={[-1.52, 2.0, wz]}>
            <boxGeometry args={[0.06, 0.9, 1.8]} />
            <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
          </mesh>
          {/* Right Windows */}
          <mesh position={[1.52, 2.0, wz]}>
            <boxGeometry args={[0.06, 0.9, 1.8]} />
            <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
          </mesh>
        </React.Fragment>
      ))}

      {/* Bogie Wheelsets (Front & Back) */}
      {[-length * 0.35, length * 0.35].map((bz, bi) => (
        <group key={`bogie-${bi}`} position={[0, 0.4, bz]}>
          <mesh castShadow>
            <boxGeometry args={[2.4, 0.3, 2.8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          {/* Steel Wheels */}
          {[-1.0, 1.0].map((wx, wi) => (
            <React.Fragment key={`wh-${wi}`}>
              <mesh position={[wx, 0, -0.8]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.4, 0.4, 0.2, 10]} />
                <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
              </mesh>
              <mesh position={[wx, 0, 0.8]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.4, 0.4, 0.2, 10]} />
                <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
              </mesh>
            </React.Fragment>
          ))}
        </group>
      ))}
    </group>
  );
};

/**
 * MetropolitanRailwayStation:
 * Grand Central Junction Railway Station featuring:
 * 1. Monumental Heritage/Modern Terminal Concourse with vaulted steel train shed & clock tower
 * 2. 4 Multi-track Rail Corridors with ballast gravel bed & catenary electrification
 * 3. 3 Raised Passenger Platforms with sheltered canopies, benches & platform signage
 * 4. Overhead Passenger Footbridge (FOB) connecting all platforms with stairs
 * 5. 3 Passenger & High-Speed Trains (Indian Railways/Express WAP-7 Superfast & Vande Bharat Bullet)
 * 6. Signal Gantries and Station Amenities
 */
export const MetropolitanRailwayStation: React.FC = () => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const isNightOrEvening = timeOfDay === 'night' || timeOfDay === 'evening';

  return (
    <group position={[-55, 0, -65]} name="MetropolitanRailwayStation">
      {/* 1. STATION DISTRICT BASE GROUND */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[75, 150]} />
        <meshStandardMaterial color="#1e2430" roughness={0.9} />
      </mesh>

      {/* ------------------------------------------------------------- */}
      {/* 2. GRAND PASSENGER TERMINAL CONCOURSE BUILDING                 */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, 58]}>
        {/* Main Terminal Facade */}
        <mesh position={[0, 10, 0]} castShadow receiveShadow>
          <boxGeometry args={[68, 20, 18]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>

        {/* Grand Portico Columns */}
        {[-24, -16, -8, 0, 8, 16, 24].map((colX, ci) => (
          <mesh key={`stat-col-${ci}`} position={[colX, 8, 9.8]} castShadow>
            <cylinderGeometry args={[0.7, 0.85, 16, 12]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
          </mesh>
        ))}

        {/* Central Classical Clock Tower */}
        <group position={[0, 20, 0]}>
          <mesh position={[0, 8, 0]} castShadow>
            <boxGeometry args={[10, 16, 10]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          {/* Clock Tower Spire */}
          <mesh position={[0, 18, 0]} castShadow>
            <coneGeometry args={[5.2, 8, 4]} />
            <meshStandardMaterial color="#d97706" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Illuminated Clock Faces (North & South) */}
          {[-5.1, 5.1].map((cz, czi) => (
            <group key={`clock-${czi}`} position={[0, 10, cz]}>
              <mesh rotation={[0, 0, 0]}>
                <circleGeometry args={[2.2, 24]} />
                <meshStandardMaterial
                  color="#fef08a"
                  emissive="#facc15"
                  emissiveIntensity={isNightOrEvening ? 2.5 : 1.2}
                />
              </mesh>
              {/* Clock Hands */}
              <mesh position={[0, 0.4, 0.05]}>
                <boxGeometry args={[0.15, 1.4, 0.05]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>
              <mesh position={[0.5, 0, 0.05]} rotation={[0, 0, -Math.PI / 3]}>
                <boxGeometry args={[0.12, 1.1, 0.05]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>
            </group>
          ))}
        </group>

        {/* Illuminated Station Signboard */}
        <group position={[0, 19.5, 9.5]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[36, 2.2, 0.4]} />
            <meshStandardMaterial color="#0f172a" emissive="#1d4ed8" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.25]}>
            <planeGeometry args={[34, 1.8]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={isNightOrEvening ? 1.5 : 0.8}
            />
          </mesh>
        </group>

        {/* Station Forecourt Taxi & Car Drop-off Plaza */}
        <mesh position={[0, 0.04, 18]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[68, 18]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 3. VAULTED GLASS & STEEL TRAIN SHED CANOPY                     */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 14, 10]}>
        {/* Steel Arch Trusses */}
        {[-30, -15, 0, 15, 30].map((az, ai) => (
          <group key={`arch-${ai}`} position={[0, 0, az]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[26, 0.4, 8, 24, Math.PI]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
          </group>
        ))}
        {/* Translucent Glass Canopy Roof */}
        <mesh rotation={[0, 0, 0]}>
          <boxGeometry args={[52, 0.3, 75]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.8}
            roughness={0.2}
            opacity={0.4}
            transparent
          />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 4. RAIL TRACKS & BALLAST (4 Tracks Corridor)                   */}
      {/* ------------------------------------------------------------- */}
      {[-21, -7, 7, 21].map((trackX, ti) => (
        <group key={`track-${ti}`} position={[trackX, 0.03, -10]}>
          {/* Ballast Gravel Bed */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[5.2, 120]} />
            <meshStandardMaterial color="#475569" roughness={0.95} />
          </mesh>
          {/* Wooden / Concrete Sleepers (Cross ties) */}
          {Array.from({ length: 40 }).map((_, si) => {
            const sz = -58 + si * 3.0;
            return (
              <mesh key={`tie-${si}`} position={[0, 0.05, sz]} castShadow>
                <boxGeometry args={[3.8, 0.1, 0.4]} />
                <meshStandardMaterial color="#334155" roughness={0.8} />
              </mesh>
            );
          })}
          {/* Steel Rails (Left & Right) */}
          {[-1.2, 1.2].map((rx, ri) => (
            <mesh key={`rail-${ri}`} position={[rx, 0.15, 0]} castShadow>
              <boxGeometry args={[0.12, 0.15, 120]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.2} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ------------------------------------------------------------- */}
      {/* 5. PASSENGER PLATFORMS (Platforms 1/2, 3/4, 5)                */}
      {/* ------------------------------------------------------------- */}
      {[-28, -14, 0, 14, 28].map((platX, pi) => (
        <group key={`plat-${pi}`} position={[platX, 0, -10]}>
          {/* Raised Platform Base */}
          <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[5.0, 1.2, 115]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
          </mesh>
          {/* Yellow Safety Tactile Edge Strips */}
          {[-2.4, 2.4].map((ex, ei) => (
            <mesh key={`tact-${ei}`} position={[ex, 1.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.2, 115]} />
              <meshBasicMaterial color="#eab308" />
            </mesh>
          ))}

          {/* Platform Canopy Roofs */}
          <group position={[0, 5.0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[4.8, 0.25, 75]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
            {/* Canopy Steel Posts */}
            {[-30, -15, 0, 15, 30].map((pz, pzi) => (
              <mesh key={`c-post-${pzi}`} position={[0, -2.0, pz]} castShadow>
                <cylinderGeometry args={[0.12, 0.12, 4.0, 8]} />
                <meshStandardMaterial color="#475569" metalness={0.8} />
              </mesh>
            ))}
          </group>

          {/* Platform Signs & Benches */}
          {[-20, 0, 20].map((bz, bi) => (
            <React.Fragment key={`amenity-${bi}`}>
              {/* Wooden Benches */}
              <mesh position={[0, 1.5, bz]} castShadow>
                <boxGeometry args={[1.8, 0.4, 0.8]} />
                <meshStandardMaterial color="#78350f" roughness={0.7} />
              </mesh>
              {/* Platform Number Sign */}
              <group position={[0, 4.2, bz]}>
                <mesh>
                  <boxGeometry args={[1.6, 0.6, 0.1]} />
                  <meshStandardMaterial color="#1d4ed8" emissive="#1d4ed8" emissiveIntensity={0.6} />
                </mesh>
              </group>
            </React.Fragment>
          ))}
        </group>
      ))}

      {/* ------------------------------------------------------------- */}
      {/* 6. OVERHEAD PASSENGER FOOT OVER BRIDGE (FOB / SKYWALK)        */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 6.2, -15]}>
        {/* Skybridge Corridor Spanning all Tracks */}
        <mesh castShadow>
          <boxGeometry args={[65, 3.2, 4.2]} />
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Glass Windows on Skywalk */}
        {[-1.8, 1.8].map((wz, wi) => (
          <mesh key={`fob-win-${wi}`} position={[0, 0.2, wz]}>
            <boxGeometry args={[63, 1.4, 0.1]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              transmission={0.85}
              roughness={0.1}
              opacity={0.6}
              transparent
            />
          </mesh>
        ))}
        {/* Support Vertical Pillars Down to Platforms */}
        {[-28, -14, 0, 14, 28].map((px, pi) => (
          <mesh key={`fob-pillar-${pi}`} position={[px, -3.1, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 6.2, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 7. TRAINS ON TRACKS (Express, Bullet / Vande Bharat, Local)   */}
      {/* ------------------------------------------------------------- */}
      {/* Train 1: Superfast Express Train on Track 2 (X = -7) */}
      <group position={[-7, 0, -10]}>
        {/* Locomotive Engine (WAP-7 Blue/Silver) */}
        <TrainCoach
          position={[0, 0, 32]}
          length={15}
          color="#1e40af"
          roofColor="#64748b"
          isLocomotive={true}
        />
        {/* Passenger Coaches (AC & Sleeper) */}
        <TrainCoach position={[0, 0, 16]} length={15} color="#b91c1c" roofColor="#94a3b8" />
        <TrainCoach position={[0, 0, 0]} length={15} color="#b91c1c" roofColor="#94a3b8" />
        <TrainCoach position={[0, 0, -16]} length={15} color="#b91c1c" roofColor="#94a3b8" />
        <TrainCoach position={[0, 0, -32]} length={15} color="#1e40af" roofColor="#64748b" />
      </group>

      {/* Train 2: Aerodynamic Bullet Train (Vande Bharat style) on Track 3 (X = 7) */}
      <group position={[7, 0, -5]}>
        {/* Streamlined Nose Coach */}
        <TrainCoach
          position={[0, 0, 28]}
          length={14}
          color="#f8fafc"
          roofColor="#1e3a8a"
          isStreamlined={true}
          isLocomotive={true}
        />
        {/* Middle Coaches in Royal Blue & White */}
        <TrainCoach position={[0, 0, 13]} length={14} color="#f8fafc" roofColor="#1e3a8a" />
        <TrainCoach position={[0, 0, -2]} length={14} color="#f8fafc" roofColor="#1e3a8a" />
        <TrainCoach position={[0, 0, -17]} length={14} color="#f8fafc" roofColor="#1e3a8a" />
      </group>

      {/* Train 3: Suburban Commuter EMU on Track 4 (X = 21) */}
      <group position={[21, 0, -25]}>
        <TrainCoach position={[0, 0, 20]} length={13} color="#047857" roofColor="#94a3b8" />
        <TrainCoach position={[0, 0, 6]} length={13} color="#047857" roofColor="#94a3b8" />
        <TrainCoach position={[0, 0, -8]} length={13} color="#047857" roofColor="#94a3b8" />
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 8. OVERHEAD CATENARY GANTRY MASTS & SIGNALS                    */}
      {/* ------------------------------------------------------------- */}
      {[-50, -25, 0, 25].map((gz, gi) => (
        <group key={`gantry-${gi}`} position={[0, 0, gz]}>
          {/* Steel Crossbeam Over All Tracks */}
          <mesh position={[0, 7.8, 0]} castShadow>
            <boxGeometry args={[56, 0.35, 0.35]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          {/* Left & Right Support Masts */}
          {[-28, 28].map((mx, mi) => (
            <mesh key={`mast-${mi}`} position={[mx, 3.9, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.25, 7.8, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
          ))}
          {/* Railway Signals (Green/Red) */}
          {[-7, 7].map((sx, si) => (
            <group key={`sig-${si}`} position={[sx, 7.2, 0.3]}>
              <mesh>
                <boxGeometry args={[0.5, 1.0, 0.2]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              {/* Green Light */}
              <mesh position={[0, 0.25, 0.12]}>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={3.0} />
              </mesh>
              {/* Red Light */}
              <mesh position={[0, -0.25, 0.12]}>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
};
