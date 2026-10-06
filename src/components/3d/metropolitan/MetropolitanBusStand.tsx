import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * Detailed 3D City & Intercity Bus Model
 */
interface CityBusProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  bodyColor?: string;
  roofColor?: string;
  routeNumber?: string;
  isMultiAxle?: boolean;
}

const CityBus: React.FC<CityBusProps> = ({
  position,
  rotation = [0, 0, 0],
  bodyColor = '#dc2626',
  roofColor = '#f8fafc',
  isMultiAxle = false,
  routeNumber: _routeNumber,
}) => {
  const busLength = isMultiAxle ? 13.5 : 10.5;

  return (
    <group position={position} rotation={rotation}>
      {/* Bus Chassis & Lower Body */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[2.8, 2.4, busLength]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} />
      </mesh>

      {/* Aerodynamic Roof */}
      <mesh position={[0, 2.7, 0]} castShadow>
        <boxGeometry args={[2.7, 0.35, busLength - 0.2]} />
        <meshStandardMaterial color={roofColor} roughness={0.5} />
      </mesh>

      {/* AC Unit on Roof */}
      <mesh position={[0, 3.0, 0]}>
        <boxGeometry args={[1.8, 0.4, 3.2]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} />
      </mesh>

      {/* Front Windshield (Giant Tinted Glass) */}
      <mesh position={[0, 1.7, busLength / 2 + 0.05]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[2.6, 1.4, 0.1]} />
        <meshPhysicalMaterial
          color="#0f172a"
          roughness={0.1}
          metalness={0.8}
          transmission={0.4}
        />
      </mesh>

      {/* LED Digital Destination Display (Above Front Windshield) */}
      <group position={[0, 2.45, busLength / 2 + 0.06]}>
        <mesh>
          <boxGeometry args={[1.8, 0.35, 0.08]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[1.6, 0.25]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2.5} />
        </mesh>
      </group>

      {/* Side Windows (Panoramic Dark Glass) */}
      {[-1.41, 1.41].map((wx, wi) => (
        <mesh key={`bus-win-${wi}`} position={[wx, 1.7, 0]}>
          <boxGeometry args={[0.05, 1.1, busLength - 1.2]} />
          <meshPhysicalMaterial
            color="#1e293b"
            roughness={0.1}
            metalness={0.8}
            transmission={0.6}
            transparent
          />
        </mesh>
      ))}

      {/* Passenger Folding Doors (Left Side) */}
      <mesh position={[1.42, 1.2, busLength * 0.3]}>
        <boxGeometry args={[0.04, 1.9, 1.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>

      {/* Wheels */}
      {/* Front Wheels */}
      {[-1.2, 1.2].map((whX, whi) => (
        <mesh key={`fwh-${whi}`} position={[whX, 0.4, busLength * 0.35]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 0.35, 12]} />
          <meshStandardMaterial color="#18181b" roughness={0.9} />
        </mesh>
      ))}

      {/* Rear Wheels */}
      {[-1.2, 1.2].map((whX, whi) => (
        <React.Fragment key={`rwh-${whi}`}>
          <mesh position={[whX, 0.4, -busLength * 0.3]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.42, 0.42, 0.35, 12]} />
            <meshStandardMaterial color="#18181b" roughness={0.9} />
          </mesh>
          {isMultiAxle && (
            <mesh position={[whX, 0.4, -busLength * 0.18]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.42, 0.42, 0.35, 12]} />
              <meshStandardMaterial color="#18181b" roughness={0.9} />
            </mesh>
          )}
        </React.Fragment>
      ))}

      {/* Headlights & Taillights */}
      {[-1.0, 1.0].map((lx, li) => (
        <React.Fragment key={`lgt-${li}`}>
          {/* Headlights (Front) */}
          <mesh position={[lx, 0.6, busLength / 2 + 0.05]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.0} />
          </mesh>
          {/* Taillights (Rear) */}
          <mesh position={[lx, 0.8, -busLength / 2 - 0.05]}>
            <boxGeometry args={[0.2, 0.4, 0.05]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
};

/**
 * MetropolitanBusStand:
 * Metropolitan Central Bus Terminal featuring:
 * 1. Large 2-story passenger ticketing terminal & departure lounge
 * 2. Sweeping modern canopy spanning 8 covered bus bays (Bay 1 to Bay 8)
 * 3. 6 detailed parked and boarding buses in distinct liveries (Volvo AC, City Deluxe, Express)
 * 4. Paved bus maneuvering apron with yellow queue barricades & platform signage
 */
export const MetropolitanBusStand: React.FC = () => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const isNightOrEvening = timeOfDay === 'night' || timeOfDay === 'evening';

  return (
    <group position={[-38, 0, 12]} name="MetropolitanCentralBusStand">
      {/* 1. BUS TERMINAL BASE TARMAC */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[46, 75]} />
        <meshStandardMaterial color="#1e2430" roughness={0.9} />
      </mesh>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN TERMINAL PASSENGER CONCOURSE BUILDING                  */}
      {/* ------------------------------------------------------------- */}
      <group position={[17, 0, 0]}>
        {/* Terminal Building Core */}
        <mesh position={[0, 6, 0]} castShadow receiveShadow>
          <boxGeometry args={[10, 12, 68]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>

        {/* Modern Glass Facade facing Bus Bays */}
        <mesh position={[-5.1, 6, 0]}>
          <boxGeometry args={[0.1, 10, 64]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.8}
            roughness={0.1}
            opacity={0.7}
            transparent
          />
        </mesh>

        {/* Illuminated Signboard */}
        <group position={[-5.2, 11.5, 0]}>
          <mesh>
            <boxGeometry args={[0.3, 1.8, 38]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#0284c7"
              emissiveIntensity={isNightOrEvening ? 2.5 : 1.2}
            />
          </mesh>
        </group>

        {/* Roof Overhang Trim */}
        <mesh position={[0, 12.2, 0]} castShadow>
          <boxGeometry args={[12, 0.4, 70]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 3. COVERED BUS DEPOT CANOPY WITH STEEL PYLONS                  */}
      {/* ------------------------------------------------------------- */}
      <group position={[-5, 7.5, 0]}>
        {/* Sweeping Aerodynamic Canopy Roof */}
        <mesh castShadow>
          <boxGeometry args={[32, 0.5, 70]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Translucent Skylight Strip in Canopy */}
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[8, 0.1, 66]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.75}
            roughness={0.2}
            opacity={0.5}
            transparent
          />
        </mesh>

        {/* Heavy Steel Support Columns */}
        {[-24, -8, 8, 24].map((cz, ci) => (
          <mesh key={`pylon-${ci}`} position={[-14, -3.7, cz]} castShadow>
            <cylinderGeometry args={[0.3, 0.35, 7.5, 10]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 4. DESIGNATED BUS BAYS (BAY 1 to BAY 6)                        */}
      {/* ------------------------------------------------------------- */}
      {[-24, -14, -4, 6, 16, 26].map((bayZ, bi) => (
        <group key={`bay-${bi}`} position={[6, 0, bayZ]}>
          {/* Raised Boarding Island Curb */}
          <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
            <boxGeometry args={[8, 0.3, 2.5]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
          </mesh>
          {/* Yellow Hazard Tactile Border */}
          <mesh position={[-4.0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.25, 2.5]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>
          {/* Bay Number Sign Pillar */}
          <group position={[3.5, 1.4, 0]}>
            <mesh>
              <cylinderGeometry args={[0.06, 0.06, 2.5, 8]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[0, 1.1, 0]}>
              <boxGeometry args={[0.8, 0.5, 0.1]} />
              <meshStandardMaterial color="#1d4ed8" emissive="#1d4ed8" emissiveIntensity={0.8} />
            </mesh>
          </group>
        </group>
      ))}

      {/* ------------------------------------------------------------- */}
      {/* 5. PARKED & BOARDING BUSES                                    */}
      {/* ------------------------------------------------------------- */}
      {/* Bus 1 at Bay 1: Red Deluxe Intercity Express */}
      <CityBus
        position={[-3, 0, -24]}
        rotation={[0, -Math.PI / 2, 0]}
        bodyColor="#dc2626"
        routeNumber="EXP-1"
        isMultiAxle={false}
      />

      {/* Bus 2 at Bay 2: Blue Volvo Multi-axle AC Sleeper Coach */}
      <CityBus
        position={[-4.5, 0, -14]}
        rotation={[0, -Math.PI / 2, 0]}
        bodyColor="#1d4ed8"
        roofColor="#e2e8f0"
        routeNumber="VOLVO-AC"
        isMultiAxle={true}
      />

      {/* Bus 3 at Bay 3: Green City Transport Low-Floor */}
      <CityBus
        position={[-3, 0, -4]}
        rotation={[0, -Math.PI / 2, 0]}
        bodyColor="#15803d"
        routeNumber="21G"
        isMultiAxle={false}
      />

      {/* Bus 4 at Bay 4: Orange Metro Feeder Transit */}
      <CityBus
        position={[-3, 0, 6]}
        rotation={[0, -Math.PI / 2, 0]}
        bodyColor="#ea580c"
        routeNumber="M-40"
        isMultiAxle={false}
      />

      {/* Bus 5 at Bay 5: White & Blue Superfast State Coach */}
      <CityBus
        position={[-4.5, 0, 16]}
        rotation={[0, -Math.PI / 2, 0]}
        bodyColor="#0284c7"
        roofColor="#f8fafc"
        routeNumber="SF-99"
        isMultiAxle={true}
      />

      {/* Bus 6 at Bay 6: Yellow School / University Campus Bus */}
      <CityBus
        position={[-3, 0, 26]}
        rotation={[0, -Math.PI / 2, 0]}
        bodyColor="#eab308"
        routeNumber="CAMPUS"
        isMultiAxle={false}
      />

      {/* ------------------------------------------------------------- */}
      {/* 6. PASSENGER BARRICADES & ROADWAY MARKINGS                    */}
      {/* ------------------------------------------------------------- */}
      <group position={[-16, 0.03, 0]}>
        {/* Driveway Arrow Markings (Bus In & Out) */}
        {[-20, 0, 20].map((az, ai) => (
          <mesh key={`arrow-${ai}`} position={[0, 0.01, az]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.6, 4.5]} />
            <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
          </mesh>
        ))}
      </group>
    </group>
  );
};
