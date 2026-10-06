import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../store/useGameStore';

/**
 * Commercial Passenger Jet (Low-poly airliner)
 */
interface AirplaneProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  liveryColor?: string;
  isTakeoff?: boolean;
}

const Airplane: React.FC<AirplaneProps> = ({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  liveryColor = '#2563eb',
  isTakeoff = false,
}) => {
  const planeRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (isTakeoff && planeRef.current) {
      // Subtle hovering/banking idle motion on runway ready for takeoff
      const t = state.clock.getElapsedTime();
      planeRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.15;
    }
  });

  return (
    <group ref={planeRef} position={position} rotation={rotation} scale={scale}>
      {/* Fuselage Main Body */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[1.4, 1.4, 19, 14]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Cockpit Nose Cone */}
      <mesh position={[0, 2.2, 10.3]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[1.4, 3.2, 14]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
      </mesh>
      {/* Cockpit Windshield */}
      <mesh position={[0, 2.7, 9.8]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[1.5, 0.6, 1.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Tail Cone */}
      <mesh position={[0, 2.4, -10.5]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[1.4, 3.0, 14]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} />
      </mesh>

      {/* Main Wings (Swept Back) */}
      <group position={[0, 1.8, 0]}>
        {/* Left Wing */}
        <mesh position={[-9.5, 0, -1.2]} rotation={[0.04, 0.2, 0.05]} castShadow>
          <boxGeometry args={[15, 0.25, 4.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
        {/* Right Wing */}
        <mesh position={[9.5, 0, -1.2]} rotation={[0.04, -0.2, -0.05]} castShadow>
          <boxGeometry args={[15, 0.25, 4.2]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
        {/* Winglets (Tips) */}
        <mesh position={[-16.8, 0.8, -2.8]} rotation={[0, 0.2, 0.6]}>
          <boxGeometry args={[0.2, 1.6, 1.8]} />
          <meshStandardMaterial color={liveryColor} roughness={0.3} />
        </mesh>
        <mesh position={[16.8, 0.8, -2.8]} rotation={[0, -0.2, -0.6]}>
          <boxGeometry args={[0.2, 1.6, 1.8]} />
          <meshStandardMaterial color={liveryColor} roughness={0.3} />
        </mesh>
      </group>

      {/* Jet Engines (Under Wings) */}
      {[-5.2, 5.2].map((ex, ei) => (
        <group key={`engine-${ei}`} position={[ex, 0.9, 0.8]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.8, 0.75, 3.4, 12]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Fan Intake */}
          <mesh position={[0, 0, 1.72]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.7, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          {/* Exhaust Cone */}
          <mesh position={[0, 0, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.5, 0.8, 12]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Vertical Tailfin (Stabilizer) with Livery */}
      <mesh position={[0, 5.5, -9.8]} rotation={[-0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.3, 5.2, 3.8]} />
        <meshStandardMaterial color={liveryColor} roughness={0.3} />
      </mesh>

      {/* Horizontal Tail Stabilizers */}
      <mesh position={[-3.8, 2.9, -10.5]} rotation={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[5.8, 0.18, 2.2]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </mesh>
      <mesh position={[3.8, 2.9, -10.5]} rotation={[0, -0.25, 0]} castShadow>
        <boxGeometry args={[5.8, 0.18, 2.2]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </mesh>

      {/* Landing Gear / Wheels */}
      <group position={[0, 0.5, 0]}>
        {/* Nose Gear */}
        <mesh position={[0, 0.4, 7.5]}>
          <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.2, 7.5]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.35, 10]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        {/* Main Gear Left & Right */}
        {[-2.2, 2.2].map((gx, gi) => (
          <group key={`gear-${gi}`} position={[gx, 0.4, -0.5]}>
            <mesh>
              <cylinderGeometry args={[0.1, 0.1, 1.2, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.35, 0.35, 0.6, 10]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Navigation & Strobe Lights */}
      {/* Port Red Light (Left Wingtip) */}
      <mesh position={[-16.8, 0.2, -1.8]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.0} />
      </mesh>
      {/* Starboard Green Light (Right Wingtip) */}
      <mesh position={[16.8, 0.2, -1.8]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={3.0} />
      </mesh>
      {/* Strobe White Beacon (Tail top) */}
      <mesh position={[0, 8.2, -11.2]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={4.0} />
      </mesh>
    </group>
  );
};

/**
 * MetropolitanAirport:
 * International Airport District featuring:
 * 1. 260m paved runway (09/27) with touchdown markings & threshold lights
 * 2. Multi-story glass international passenger terminal with aerobridges
 * 3. 42m Air Traffic Control (ATC) tower with radar dome
 * 4. Commercial airliners (parked at aerobridges & ready on runway)
 * 5. Maintenance aircraft hangars, fuel depot & ground service vehicles
 */
export const MetropolitanAirport: React.FC = () => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const isNightOrEvening = timeOfDay === 'night' || timeOfDay === 'evening';
  const radarRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (radarRef.current) {
      radarRef.current.rotation.y += delta * 2.2;
    }
  });

  return (
    <group position={[125, 0, 135]} name="MetropolitanAirportDistrict">
      {/* 1. AIRPORT FOUNDATION TARMAC */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[130, 240]} />
        <meshStandardMaterial color="#1e2430" roughness={0.88} />
      </mesh>

      {/* Taxiway Green Perimeter Buffer */}
      <mesh position={[-42, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 230]} />
        <meshStandardMaterial color="#14532d" roughness={0.95} />
      </mesh>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN RUNWAY 09L/27R (220m long, 22m wide)                  */}
      {/* ------------------------------------------------------------- */}
      <group position={[32, 0.03, 0]}>
        {/* Runway Dark Asphalt Surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[24, 230]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>

        {/* White Dashed Centerline */}
        {[-95, -75, -55, -35, -15, 5, 25, 45, 65, 85].map((cz, ci) => (
          <mesh key={`rw-cl-${ci}`} position={[0, 0.01, cz]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}

        {/* Threshold Piano Keys (Both ends) */}
        {[-106, 106].map((tz, ti) => (
          <group key={`thresh-${ti}`} position={[0, 0.01, tz]}>
            {[-8, -5.5, -3, -0.5, 2, 4.5, 7].map((tx, txi) => (
              <mesh key={`key-${txi}`} position={[tx, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1.6, 9]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            ))}
          </group>
        ))}

        {/* Touchdown Zone Double Bar Markers */}
        {[-80, -60, 60, 80].map((tdz, tdi) => (
          <group key={`td-${tdi}`} position={[0, 0.01, tdz]}>
            <mesh position={[-5.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[3.2, 14]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[5.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[3.2, 14]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}

        {/* Runway Edge Lights (Row along both sides) */}
        {[-105, -80, -55, -30, -5, 20, 45, 70, 95].map((lz, li) => (
          <React.Fragment key={`rwl-${li}`}>
            <mesh position={[-12.4, 0.25, lz]}>
              <sphereGeometry args={[0.18, 8, 8]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#facc15"
                emissiveIntensity={isNightOrEvening ? 3.5 : 1.2}
              />
            </mesh>
            <mesh position={[12.4, 0.25, lz]}>
              <sphereGeometry args={[0.18, 8, 8]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#facc15"
                emissiveIntensity={isNightOrEvening ? 3.5 : 1.2}
              />
            </mesh>
          </React.Fragment>
        ))}

        {/* Threshold Green Lights (Arrival End) */}
        {[-8, -5, -2, 1, 4, 7].map((gx, gi) => (
          <mesh key={`tg-${gi}`} position={[gx, 0.25, -114]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={isNightOrEvening ? 4.0 : 1.5}
            />
          </mesh>
        ))}

        {/* Runway End Red Lights */}
        {[-8, -5, -2, 1, 4, 7].map((rx, ri) => (
          <mesh key={`re-${ri}`} position={[rx, 0.25, 114]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={isNightOrEvening ? 4.0 : 1.5}
            />
          </mesh>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 3. TAXIWAY & CONNECTING HIGH-SPEED RUNWAY EXITS               */}
      {/* ------------------------------------------------------------- */}
      <group position={[2, 0.03, 0]}>
        {/* Taxiway Strip Parallel to Runway */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[14, 210]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        {/* Yellow Taxiway Centerline */}
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.4, 205]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
        {/* Connecting High-Speed Exits */}
        {[-50, 0, 50].map((exZ, exI) => (
          <mesh key={`exit-${exI}`} position={[16, 0.005, exZ]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[18, 10]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 4. PASSENGER APRON & AIRCRAFT STANDS                          */}
      {/* ------------------------------------------------------------- */}
      <group position={[-25, 0.03, -15]}>
        {/* Concrete Apron Slabs */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[36, 120]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>

        {/* Yellow Aircraft Lead-in Parking Markings */}
        {[-38, 0, 38].map((standZ, si) => (
          <group key={`stand-${si}`} position={[0, 0.005, standZ]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[26, 0.35]} />
              <meshBasicMaterial color="#eab308" />
            </mesh>
            <mesh position={[8, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[2.8, 3.1, 16]} />
              <meshBasicMaterial color="#eab308" />
            </mesh>
          </group>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 5. MODERN PASSENGER TERMINAL BUILDING WITH AEROBRIDGES       */}
      {/* ------------------------------------------------------------- */}
      <group position={[-52, 0, -15]}>
        {/* Main Terminal Concourse Structure */}
        <mesh position={[0, 8.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[18, 17, 95]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Aerofoil Curved Sweeping Roof Canopy */}
        <mesh position={[2, 18.2, 0]} rotation={[0, 0, 0.06]} castShadow>
          <boxGeometry args={[24, 1.4, 102]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Floor-to-Ceiling Glass Curtain Walls (Facing Apron) */}
        <mesh position={[9.1, 8.5, 0]} castShadow>
          <boxGeometry args={[0.2, 15, 92]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.8}
            roughness={0.1}
            opacity={0.7}
            transparent
          />
        </mesh>

        {/* Glowing Terminal Sign */}
        <group position={[0, 19.5, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.8, 2.2, 45]} />
            <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={1.8} />
          </mesh>
        </group>

        {/* Telescopic Aerobridges (Jet Bridges to Aircraft) */}
        {[-38, 0, 38].map((bz, bi) => (
          <group key={`bridge-${bi}`} position={[14, 5.5, bz]}>
            {/* Extended Corridors */}
            <mesh castShadow>
              <boxGeometry args={[12, 3.2, 3.2]} />
              <meshStandardMaterial color="#64748b" roughness={0.5} />
            </mesh>
            {/* Rotunda / Pivoting Dock */}
            <mesh position={[6.5, 0, 0]} castShadow>
              <cylinderGeometry args={[2.0, 2.0, 3.4, 12]} />
              <meshStandardMaterial color="#334155" metalness={0.5} />
            </mesh>
            {/* Support Columns */}
            <mesh position={[3, -3.2, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 4.0, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Landside Passenger Departures Flyover Ramp & Drop-off */}
        <group position={[-14, 4.2, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[10, 85]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
          {/* Canopy over drop-off */}
          <mesh position={[0, 4.5, 0]} castShadow>
            <boxGeometry args={[10, 0.4, 85]} />
            <meshStandardMaterial color="#0284c7" opacity={0.85} transparent />
          </mesh>
        </group>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 6. AIR TRAFFIC CONTROL (ATC) TOWER                            */}
      {/* ------------------------------------------------------------- */}
      <group position={[-52, 0, 52]}>
        {/* Hexagonal Concrete Shaft (38m high) */}
        <mesh position={[0, 19, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.8, 3.8, 38, 6]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>

        {/* Observation Cab Base flared collar */}
        <mesh position={[0, 39, 0]} castShadow>
          <cylinderGeometry args={[5.8, 3.2, 3.0, 8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>

        {/* 360-degree Slanted Glass Control Cab */}
        <mesh position={[0, 41.5, 0]} castShadow>
          <cylinderGeometry args={[5.4, 5.0, 3.2, 8]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.85}
            roughness={0.1}
            opacity={0.65}
            transparent
          />
        </mesh>

        {/* Cab Roof Cap */}
        <mesh position={[0, 43.4, 0]} castShadow>
          <cylinderGeometry args={[6.0, 5.4, 0.8, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>

        {/* Rotating Primary Radar Antenna */}
        <group ref={radarRef} position={[0, 45.2, 0]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 1.2, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          {/* Curved Radar Dish */}
          <mesh position={[0, 1.2, 0]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[3.6, 1.2, 0.2]} />
            <meshStandardMaterial color="#ef4444" roughness={0.5} />
          </mesh>
        </group>

        {/* Red Aviation Obstruction Warning Light */}
        <mesh position={[0, 47.2, 0]}>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={isNightOrEvening ? 5.0 : 2.0}
          />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 7. MAINTENANCE AIRCRAFT HANGAR                                */}
      {/* ------------------------------------------------------------- */}
      <group position={[-48, 0, -82]}>
        {/* Massive Steel Vault Hangar */}
        <mesh position={[0, 9, 0]} castShadow receiveShadow>
          <boxGeometry args={[30, 18, 42]} />
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Arched Roof */}
        <mesh position={[0, 18.5, 0]} castShadow>
          <cylinderGeometry args={[15, 15, 42, 16, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        {/* Open Hangar Doorway */}
        <mesh position={[15.1, 8, 0]}>
          <planeGeometry args={[38, 15]} />
          <meshStandardMaterial color="#090d16" roughness={0.9} />
        </mesh>
        {/* Aviation Maintenance Sign */}
        <mesh position={[15.2, 16.5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[16, 1.8]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 8. COMMERCIAL AIRPLANES IN DISTRICT                           */}
      {/* ------------------------------------------------------------- */}
      {/* Plane 1: Parked at Gate 1 (Blue Air India / Indigo style livery) */}
      <Airplane
        position={[-12, 0, -53]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={0.9}
        liveryColor="#1d4ed8"
      />

      {/* Plane 2: Parked at Gate 2 (Emirates / Red-Gold livery) */}
      <Airplane
        position={[-12, 0, 23]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={0.95}
        liveryColor="#dc2626"
      />

      {/* Plane 3: Positioned on Runway 09 Ready for Departure */}
      <Airplane
        position={[32, 0, -80]}
        rotation={[0, 0, 0]}
        scale={1.05}
        liveryColor="#0284c7"
        isTakeoff={true}
      />

      {/* Plane 4: Executive Private Jet on Apron Stand */}
      <group position={[-16, 0, 80]} rotation={[0, -Math.PI / 3, 0]} scale={0.55}>
        <Airplane position={[0, 0, 0]} liveryColor="#eab308" />
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 9. GROUND SUPPORT VEHICLES (Baggage Tugs, Fuel Tankers)        */}
      {/* ------------------------------------------------------------- */}
      {[
        { x: -18, z: -40, color: '#eab308' },
        { x: -20, z: -62, color: '#f97316' },
        { x: -16, z: 35, color: '#eab308' },
        { x: 8, z: -10, color: '#ffffff' },
      ].map((veh, vi) => (
        <group key={`gse-${vi}`} position={[veh.x, 0, veh.z]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[1.8, 1.0, 3.4]} />
            <meshStandardMaterial color={veh.color} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.9, 0.8]} castShadow>
            <boxGeometry args={[1.6, 0.8, 1.2]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
