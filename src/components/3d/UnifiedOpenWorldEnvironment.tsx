import React from 'react';
import { BedroomEnvironment } from './Bedroom/BedroomEnvironment';
import { ClassroomEnvironment } from './environments/Classroom/ClassroomEnvironment';
import { DiningEnvironment } from './environments/DiningArea/DiningEnvironment';
import { GymEnvironment } from './environments/Gym/GymEnvironment';
import { GroundsEnvironment } from './environments/Grounds/GroundsEnvironment';
import { BalconyEnvironment } from './environments/Balcony/BalconyEnvironment';

/**
 * UnifiedOpenWorldEnvironment:
 * Seamless, unified open world combining all daily routine sectors into a single continuous coordinate space:
 * 
 * 1. Residential Sector [X: 0, Z: 0]:
 *    - Vishal's PG Room 204
 *    - Attached Terracotta Balcony with washing machine & clothesline [Z: -6]
 *    - Ground Floor Dining Mess [X: 18, Z: 0]
 *    - Residential Courtyard & Security Gate [X: -16, Z: 0]
 * 
 * 2. 1 km Walk & Commute Corridor [Z: 14 to 80]:
 *    - Asphalt thoroughfare with lane markings, curbs, street trees, streetlamps
 *    - Local Chai stalls & convenience shops along the avenue
 *    - PG Bus Stop [Z: 30] & Long Commute Highway [Z: 40 to 75]
 * 
 * 3. Commercial Fitness Sector [X: -26, Z: 36]:
 *    - Giant Olympic Gym with squat racks, benches, turf track, and dumbbell stations
 * 
 * 4. Academic Sector [Z: 85 to 115]:
 *    - Sairam College Campus Quad [Z: 85]
 *    - College Lecture Hall CS-301 with tiered desks, stage, and library study [Z: 100]
 */
export const UnifiedOpenWorldEnvironment: React.FC = () => {
  return (
    <group name="UnifiedOpenWorld">
      {/* ========================================================= */}
      {/* 1. VAST GLOBAL TERRAIN / LANDSCAPE                         */}
      {/* ========================================================= */}
      <mesh position={[0, -0.05, 50]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[220, 240]} />
        <meshStandardMaterial color="#0b1120" roughness={0.92} metalness={0.1} />
      </mesh>

      {/* Concrete Pavements & District Ground Plates */}
      {/* Residential PG District Foundation */}
      <mesh position={[0, 0, -2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[56, 30]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* College Campus District Foundation */}
      <mesh position={[0, 0, 100]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[65, 45]} />
        <meshStandardMaterial color="#1e293b" roughness={0.82} />
      </mesh>

      {/* ========================================================= */}
      {/* 2. THE 1 KM CONTINUOUS ROAD & COMMUTE ARTERY              */}
      {/* ========================================================= */}
      {/* 4-Lane Asphalt Highway linking PG District to College Campus */}
      <group position={[0, 0.02, 50]}>
        {/* Main Road Surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[14, 110]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>

        {/* Center Yellow Double Lines */}
        {[-0.15, 0.15].map((offX, i) => (
          <mesh key={`center-line-${i}`} position={[offX, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.12, 108]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
        ))}

        {/* White Lane Markings */}
        {Array.from({ length: 18 }).map((_, idx) => {
          const zPos = -50 + idx * 6;
          return (
            <React.Fragment key={`lane-stripes-${idx}`}>
              <mesh position={[-3.5, 0.006, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.15, 3.0]} />
                <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
              </mesh>
              <mesh position={[3.5, 0.006, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.15, 3.0]} />
                <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
              </mesh>
            </React.Fragment>
          );
        })}

        {/* Roadside Safety Curbs */}
        {[-7.2, 7.2].map((cx, idx) => (
          <group key={`curb-${idx}`} position={[cx, 0.1, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.5, 0.22, 110]} />
              <meshStandardMaterial color="#64748b" roughness={0.7} />
            </mesh>
          </group>
        ))}

        {/* Streetlamp Posts along the 1km Highway */}
        {Array.from({ length: 8 }).map((_, idx) => {
          const zPos = -48 + idx * 14;
          return (
            <React.Fragment key={`highway-lamps-${idx}`}>
              {/* Left Side Lamp */}
              <group position={[-7.8, 0, zPos]}>
                <mesh position={[0, 2.5, 0]} castShadow>
                  <cylinderGeometry args={[0.06, 0.08, 5.0, 8]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} />
                </mesh>
                <mesh position={[0.6, 5.0, 0]} rotation={[0, 0, -0.4]}>
                  <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} />
                </mesh>
                <pointLight position={[1.2, 4.8, 0]} intensity={1.1} color="#fef08a" distance={16} decay={2} />
              </group>
              {/* Right Side Lamp */}
              <group position={[7.8, 0, zPos]}>
                <mesh position={[0, 2.5, 0]} castShadow>
                  <cylinderGeometry args={[0.06, 0.08, 5.0, 8]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} />
                </mesh>
                <mesh position={[-0.6, 5.0, 0]} rotation={[0, 0, 0.4]}>
                  <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} />
                </mesh>
                <pointLight position={[-1.2, 4.8, 0]} intensity={1.1} color="#fef08a" distance={16} decay={2} />
              </group>
            </React.Fragment>
          );
        })}
      </group>

      {/* ========================================================= */}
      {/* 3. LOCAL BUS STOPS & URBAN TRANSIT SHELTERS                */}
      {/* ========================================================= */}
      {/* Bus Stop 1: Near PG accommodation [X: 8.5, Z: 26] */}
      <group position={[9.2, 0, 26]} name="PG_Bus_Stop">
        {/* Shelter Base Platform */}
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <boxGeometry args={[4.2, 0.2, 2.4]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>
        {/* Metal Pillars */}
        {[[-1.8, -0.9], [1.8, -0.9], [-1.8, 0.9], [1.8, 0.9]].map(([px, pz], i) => (
          <mesh key={`b1-pillar-${i}`} position={[px, 1.4, pz]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 2.6, 8]} />
            <meshStandardMaterial color="#0284c7" metalness={0.8} />
          </mesh>
        ))}
        {/* Canopy Roof */}
        <mesh position={[0, 2.7, 0]} castShadow>
          <boxGeometry args={[4.6, 0.08, 2.8]} />
          <meshStandardMaterial color="#0369a1" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Bus Stop Signboard */}
        <group position={[-2.4, 2.2, 1.2]}>
          <mesh position={[0, -0.8, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 2.8, 8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[0.8, 0.8, 0.05]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        </group>
      </group>

      {/* Bus Stop 2: College Campus Terminal [X: 9.2, Z: 78] */}
      <group position={[9.2, 0, 78]} name="College_Campus_Bus_Terminal">
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <boxGeometry args={[5.2, 0.2, 2.8]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>
        {/* Shelter Canopy */}
        <mesh position={[0, 2.8, 0]} castShadow>
          <boxGeometry args={[5.6, 0.08, 3.2]} />
          <meshStandardMaterial color="#059669" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 4. CHENNAI COMMUTE BUS (1-Hour Travel Model)              */}
      {/* ========================================================= */}
      <group position={[-3.6, 0, 48]} name="Chennai_Transit_Bus">
        {/* Bus Body Chassis */}
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 2.4, 9.5]} />
          <meshStandardMaterial color="#e11d48" roughness={0.35} metalness={0.3} />
        </mesh>
        {/* Bus Cream Top Band */}
        <mesh position={[0, 2.3, 0]}>
          <boxGeometry args={[2.82, 0.6, 9.52]} />
          <meshStandardMaterial color="#fef08a" roughness={0.4} />
        </mesh>
        {/* Windows Strip */}
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[2.85, 0.8, 9.0]} />
          <meshPhysicalMaterial color="#38bdf8" transmission={0.6} opacity={0.5} transparent />
        </mesh>
        {/* Wheels */}
        {[[-1.45, -2.8], [1.45, -2.8], [-1.45, 2.8], [1.45, 2.8]].map(([wx, wz], wi) => (
          <group key={`wheel-${wi}`} position={[wx, 0.45, wz]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.45, 0.45, 0.35, 16]} />
              <meshStandardMaterial color="#18181b" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========================================================= */}
      {/* 5. ROADSIDE SHOPS, CHAI STALL & TREES                     */}
      {/* ========================================================= */}
      {/* Tea/Coffee Stall & Convenience Kiosk near Bus Stop [X: -9.5, Z: 26] */}
      <group position={[-10.5, 0, 26]} name="Chai_Tea_Stall">
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.6, 2.8, 3.2]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.7} />
        </mesh>
        {/* Awning Canopy */}
        <mesh position={[0.4, 2.6, 0]} rotation={[0, 0, 0.25]} castShadow>
          <boxGeometry args={[1.6, 0.05, 3.4]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <pointLight position={[1.2, 2.2, 0]} intensity={0.9} color="#fbbf24" distance={6} />
      </group>

      {/* Street Trees alongside Road */}
      {[-40, -25, -10, 5, 20, 35, 60, 75, 90].map((tz, ti) => (
        <React.Fragment key={`tree-pair-${ti}`}>
          {/* Left Tree */}
          <group position={[-9.8, 0, tz]}>
            <mesh position={[0, 1.4, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.25, 2.8, 8]} />
              <meshStandardMaterial color="#78350f" roughness={0.9} />
            </mesh>
            <mesh position={[0, 3.4, 0]} castShadow>
              <sphereGeometry args={[1.5, 12, 12]} />
              <meshStandardMaterial color="#15803d" roughness={0.8} />
            </mesh>
          </group>
          {/* Right Tree */}
          <group position={[9.8, 0, tz]}>
            <mesh position={[0, 1.4, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.25, 2.8, 8]} />
              <meshStandardMaterial color="#78350f" roughness={0.9} />
            </mesh>
            <mesh position={[0, 3.4, 0]} castShadow>
              <sphereGeometry args={[1.5, 12, 12]} />
              <meshStandardMaterial color="#15803d" roughness={0.8} />
            </mesh>
          </group>
        </React.Fragment>
      ))}

      {/* ========================================================= */}
      {/* 6. DISTRICT SECTOR MOUNT POINTS (Zero-Cut Seamless Flow)   */}
      {/* ========================================================= */}
      {/* Sector A: Vishal's PG Bedroom Room 204 [Origin: 0, 0, 0] */}
      <group position={[0, 0, 0]} name="Sector_PGBedroom">
        <BedroomEnvironment />
      </group>

      {/* Sector B: Balcony with Washing Machine & Clothesline [Z: -6.2] */}
      <group position={[1.9, 0, -6.2]} name="Sector_BalconyLaundry">
        <BalconyEnvironment />
      </group>

      {/* Sector C: PG Dining Hall / Mess [X: 18, Z: -2] */}
      <group position={[18, 0, -2]} name="Sector_DiningHall">
        <DiningEnvironment />
      </group>

      {/* Sector D: Apartment Grounds & Security Gate [X: -18, Z: -2] */}
      <group position={[-18, 0, -2]} name="Sector_ApartmentGrounds">
        <GroundsEnvironment />
      </group>

      {/* Sector E: Massive Commercial Gym [X: -26, Z: 36] */}
      <group position={[-26, 0, 36]} name="Sector_MegaGym">
        <GymEnvironment />
      </group>

      {/* Sector F: Sairam College Campus Lecture Hall CS-301 [X: 0, Z: 100] */}
      <group position={[0, 0, 100]} name="Sector_CollegeClassroom">
        <ClassroomEnvironment />
      </group>
    </group>
  );
};
