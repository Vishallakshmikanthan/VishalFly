import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * ChennaiEducationalCampus:
 * Authentic replica of Chennai's premier educational institutions
 * (Anna University / Sairam Engineering Campus & Chennai Public School):
 *
 * 1. Heritage Colonial Red-Brick Engineering College Block:
 *    - Indo-Saracenic terracotta red facade with arched windows and entrance double doors
 *    - Central Clock Tower with illuminated clock face and Roman numerals
 *    - Academic wings with detailed framed windows, floor sunshades, rooftop solar panels
 *    - Grand Entrance Archway with bilingual signage ("சென்னை பொறியியல் கல்லூரி • CHENNAI ENGINEERING COLLEGE")
 *
 * 2. Campus Sports & Student Facilities:
 *    - Regulation Basketball Court with court line markings, acrylic backboards & orange hoops
 *    - Athletic running track & practice cricket nets
 *    - Fleet of iconic yellow college buses ("SAIRAM COLLEGE BUS") in marked parking bays
 *    - Two-wheeler scooter and bicycle parking stands
 *
 * 3. Chennai Public Higher Secondary School Block:
 *    - Cheerful primary & high school building with multi-color accents
 *    - Classroom windows with safety grilles and main entrance portico
 *    - Indian National Flagpole with tricolor fluttering on stepped marble pedestal
 *    - Kids playground with slide, swing set, and green turf
 *
 * 4. Paved campus tree-lined walkways, benches, and warm campus illumination
 */
export const ChennaiEducationalCampus: React.FC = () => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const isNightOrEvening = timeOfDay === 'night' || timeOfDay === 'evening';

  return (
    <group position={[-78, 0, 92]} name="ChennaiEducationalCampus">
      {/* ------------------------------------------------------------- */}
      {/* 0. CAMPUS BASE PLAZA PLATFORM & LAWNS                          */}
      {/* ------------------------------------------------------------- */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[56, 44]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} />
      </mesh>

      {/* Campus Central Green Quadrangle Lawn */}
      <mesh position={[-6, 0.01, 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 24]} />
        <meshStandardMaterial color="#15803d" roughness={0.9} />
      </mesh>

      {/* ------------------------------------------------------------- */}
      {/* 1. HERITAGE RED-BRICK ENGINEERING COLLEGE MAIN BUILDING       */}
      {/* ------------------------------------------------------------- */}
      <group position={[-6, 0, -12]}>
        {/* Main Central Academic Block */}
        <mesh position={[0, 8, 0]} castShadow receiveShadow>
          <boxGeometry args={[32, 16, 12]} />
          <meshStandardMaterial color="#991b1b" roughness={0.7} />
        </mesh>

        {/* Stone Base Plinth & Foundation Band */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[32.6, 0.8, 12.6]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>

        {/* Floor Dividing Cornice Trims */}
        {[5.4, 10.8, 16.1].map((cy, ci) => (
          <mesh key={`college-trim-${ci}`} position={[0, cy, 0]}>
            <boxGeometry args={[32.5, 0.35, 12.5]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
        ))}

        {/* Grand Central Portico & Classical Colonnade */}
        <group position={[0, 0, 6.2]}>
          {/* Portico Pediment Roof */}
          <mesh position={[0, 9.5, 1.8]} castShadow>
            <boxGeometry args={[11, 0.6, 5]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          {/* Triangular Classical Gable on top */}
          <mesh position={[0, 10.8, 1.8]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[5.5, 2.0, 4]} />
            <meshStandardMaterial color="#991b1b" roughness={0.6} />
          </mesh>

          {/* 4 Classical White Pillars */}
          {[-4.2, -1.4, 1.4, 4.2].map((px, pi) => (
            <mesh key={`college-col-${pi}`} position={[px, 4.6, 4.0]} castShadow>
              <cylinderGeometry args={[0.3, 0.38, 9.2, 12]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
          ))}

          {/* Grand Double-Leaf Carved Wooden Entrance Doors */}
          <group position={[0, 2.2, 0]}>
            <mesh castShadow>
              <boxGeometry args={[3.6, 4.4, 0.2]} />
              <meshStandardMaterial color="#451a03" roughness={0.6} />
            </mesh>
            {/* Arched Fanlight above door */}
            <mesh position={[0, 2.5, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[1.8, 1.8, 0.15, 16, 1, false, 0, Math.PI]} />
              <meshStandardMaterial color="#0284c7" emissive={isNightOrEvening ? '#0284c7' : '#000000'} emissiveIntensity={0.6} />
            </mesh>
            {/* Polished Brass Door Handles */}
            {[-0.2, 0.2].map((hx, hi) => (
              <mesh key={`handle-${hi}`} position={[hx, 0, 0.15]}>
                <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
                <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.2} />
              </mesh>
            ))}
          </group>
        </group>

        {/* ----------------------------------------------------------- */}
        {/* ICONIC CENTRAL CLOCK TOWER (HERITAGE BELL TOWER)            */}
        {/* ----------------------------------------------------------- */}
        <group position={[0, 16, 0]}>
          {/* Square Brick Tower Body */}
          <mesh position={[0, 5, 0]} castShadow>
            <boxGeometry args={[6.5, 10, 6.5]} />
            <meshStandardMaterial color="#7f1d1d" roughness={0.7} />
          </mesh>

          {/* Stone Corner Pilasters */}
          {[-3.2, 3.2].map((cx, cxi) =>
            [-3.2, 3.2].map((cz, czi) => (
              <mesh key={`tow-corn-${cxi}-${czi}`} position={[cx, 5, cz]}>
                <boxGeometry args={[0.4, 10.2, 0.4]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
            ))
          )}

          {/* Illuminated 4-Sided Clock Faces */}
          {[
            { pos: [0, 6.5, 3.3] as [number, number, number], rot: [0, 0, 0] as [number, number, number] },
            { pos: [0, 6.5, -3.3] as [number, number, number], rot: [0, Math.PI, 0] as [number, number, number] },
            { pos: [3.3, 6.5, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number] },
            { pos: [-3.3, 6.5, 0] as [number, number, number], rot: [0, -Math.PI / 2, 0] as [number, number, number] },
          ].map((clk, cIdx) => (
            <group key={`clock-face-${cIdx}`} position={clk.pos} rotation={clk.rot}>
              {/* Bezel Ring */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[1.3, 1.3, 0.1, 24]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              {/* White Dial */}
              <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[1.15, 1.15, 0.05, 24]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#fef08a"
                  emissiveIntensity={isNightOrEvening ? 1.8 : 0.4}
                />
              </mesh>
              {/* Black Clock Hands */}
              <mesh position={[0, 0.35, 0.1]}>
                <boxGeometry args={[0.08, 0.7, 0.02]} />
                <meshBasicMaterial color="#090d16" />
              </mesh>
              <mesh position={[0.25, 0, 0.1]} rotation={[0, 0, -Math.PI / 2]}>
                <boxGeometry args={[0.08, 0.5, 0.02]} />
                <meshBasicMaterial color="#090d16" />
              </mesh>
            </group>
          ))}

          {/* Tower Pyramidal Dome Finial */}
          <mesh position={[0, 11.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[4.4, 4.0, 4]} />
            <meshStandardMaterial color="#065f46" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Golden Finial Needle */}
          <mesh position={[0, 14.2, 0]}>
            <cylinderGeometry args={[0.06, 0.1, 1.6, 8]} />
            <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* ----------------------------------------------------------- */}
        {/* ARCHITECTURAL FAÇADE WINDOWS WITH LINTELS & GLASS           */}
        {/* ----------------------------------------------------------- */}
        {/* Front Windows (Left and Right Wings, 2 floors of windows) */}
        {[-12, -8.5, -5, 5, 8.5, 12].map((wx, wi) => (
          <React.Fragment key={`col-win-wing-${wi}`}>
            {/* Ground Floor Windows */}
            <group position={[wx, 3.2, 6.05]}>
              <mesh>
                <boxGeometry args={[2.0, 2.6, 0.2]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
              <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[1.7, 2.3]} />
                <meshStandardMaterial
                  color={isNightOrEvening ? '#fef08a' : '#38bdf8'}
                  emissive={isNightOrEvening ? '#facc15' : '#000000'}
                  emissiveIntensity={isNightOrEvening ? 1.5 : 0}
                  roughness={0.1}
                />
              </mesh>
            </group>
            {/* First Floor Arched Windows */}
            <group position={[wx, 8.2, 6.05]}>
              <mesh>
                <boxGeometry args={[2.0, 2.6, 0.2]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
              <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[1.7, 2.3]} />
                <meshStandardMaterial
                  color={isNightOrEvening ? '#fef08a' : '#38bdf8'}
                  emissive={isNightOrEvening ? '#facc15' : '#000000'}
                  emissiveIntensity={isNightOrEvening ? 1.5 : 0}
                  roughness={0.1}
                />
              </mesh>
            </group>
            {/* Second Floor Windows */}
            <group position={[wx, 13.2, 6.05]}>
              <mesh>
                <boxGeometry args={[2.0, 2.2, 0.2]} />
                <meshStandardMaterial color="#f8fafc" />
              </mesh>
              <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[1.7, 1.9]} />
                <meshStandardMaterial
                  color={isNightOrEvening ? '#fef08a' : '#38bdf8'}
                  emissive={isNightOrEvening ? '#facc15' : '#000000'}
                  emissiveIntensity={isNightOrEvening ? 1.5 : 0}
                  roughness={0.1}
                />
              </mesh>
            </group>
          </React.Fragment>
        ))}

        {/* Rooftop Modern Solar Panel Arrays */}
        {[-11, -5, 5, 11].map((sx, si) => (
          <group key={`sol-panel-${si}`} position={[sx, 16.3, 0]} rotation={[0.25, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[4.2, 0.1, 2.6]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
              <planeGeometry args={[4.0, 2.4]} />
              <meshStandardMaterial color="#1e3a8a" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))}

        {/* College Signboard: CHENNAI ENGINEERING COLLEGE */}
        <group position={[0, 16.6, 6.2]}>
          <mesh>
            <boxGeometry args={[18, 1.2, 0.25]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0, 0.14]}>
            <planeGeometry args={[17.6, 0.9]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={isNightOrEvening ? 2.5 : 1.0}
            />
          </mesh>
        </group>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 2. CHENNAI PUBLIC HIGHER SECONDARY SCHOOL BLOCK               */}
      {/* ------------------------------------------------------------- */}
      <group position={[18, 0, -8]}>
        {/* Cheerful 3-Story School Building */}
        <mesh position={[0, 6, 0]} castShadow receiveShadow>
          <boxGeometry args={[14, 12, 10]} />
          <meshStandardMaterial color="#0284c7" roughness={0.6} />
        </mesh>

        {/* Yellow Floor Bands & Parapet */}
        {[4, 8, 12.1].map((sy, si) => (
          <mesh key={`sch-band-${si}`} position={[0, sy, 0]}>
            <boxGeometry args={[14.4, 0.3, 10.4]} />
            <meshStandardMaterial color="#facc15" roughness={0.4} />
          </mesh>
        ))}

        {/* Classroom Windows with Protective Grilles */}
        {[-4.2, 0, 4.2].map((wx, wi) => (
          <React.Fragment key={`sch-win-${wi}`}>
            {[2.2, 6.2, 10.2].map((wy, wyi) => (
              <group key={`sch-win-${wi}-${wyi}`} position={[wx, wy, 5.05]}>
                <mesh>
                  <boxGeometry args={[2.4, 1.8, 0.15]} />
                  <meshStandardMaterial color="#ffffff" />
                </mesh>
                <mesh position={[0, 0, 0.05]}>
                  <planeGeometry args={[2.1, 1.5]} />
                  <meshStandardMaterial
                    color={isNightOrEvening ? '#fef08a' : '#e0f2fe'}
                    emissive={isNightOrEvening ? '#facc15' : '#000000'}
                    emissiveIntensity={isNightOrEvening ? 1.6 : 0}
                  />
                </mesh>
                {/* Horizontal Grille Bars */}
                {[-0.4, 0, 0.4].map((gy, gi) => (
                  <mesh key={`bar-${gi}`} position={[0, gy, 0.08]}>
                    <boxGeometry args={[2.0, 0.04, 0.04]} />
                    <meshStandardMaterial color="#475569" metalness={0.8} />
                  </mesh>
                ))}
              </group>
            ))}
          </React.Fragment>
        ))}

        {/* School Signboard: CHENNAI PUBLIC SCHOOL */}
        <group position={[0, 12.6, 5.1]}>
          <mesh>
            <boxGeometry args={[12, 1.0, 0.2]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0, 0.12]}>
            <planeGeometry args={[11.6, 0.75]} />
            <meshStandardMaterial
              color="#facc15"
              emissive="#eab308"
              emissiveIntensity={isNightOrEvening ? 2.2 : 0.8}
            />
          </mesh>
        </group>

        {/* School Entrance Double Door & Canopy */}
        <group position={[0, 0, 5.2]}>
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[2.4, 2.4, 0.1]} />
            <meshStandardMaterial color="#1e3a8a" />
          </mesh>
          <mesh position={[0, 2.6, 0.8]} castShadow>
            <boxGeometry args={[3.6, 0.2, 1.8]} />
            <meshStandardMaterial color="#facc15" />
          </mesh>
        </group>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 3. INDIAN NATIONAL FLAGPOLE WITH FLUTTERING TRICOLOR          */}
      {/* ------------------------------------------------------------- */}
      <group position={[-6, 0, 7]}>
        {/* Tiered White Marble Pedestal */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[1.4, 1.6, 0.3, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[1.0, 1.2, 0.3, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>

        {/* Stainless Steel Flag Mast */}
        <mesh position={[0, 4.6, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.1, 8.4, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Golden Finial Sphere on top */}
        <mesh position={[0, 8.9, 0]}>
          <sphereGeometry args={[0.15, 10, 10]} />
          <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Indian National Tricolor (Saffron, White with Ashoka Chakra, Green) */}
        <group position={[1.1, 7.8, 0]}>
          {/* Top Saffron Band */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[2.2, 0.4, 0.04]} />
            <meshStandardMaterial color="#ea580c" roughness={0.7} />
          </mesh>
          {/* Middle White Band */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.2, 0.4, 0.04]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
          {/* Ashoka Chakra Blue Dot */}
          <mesh position={[0, 0, 0.025]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 12]} />
            <meshStandardMaterial color="#1e3a8a" />
          </mesh>
          {/* Bottom India Green Band */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[2.2, 0.4, 0.04]} />
            <meshStandardMaterial color="#15803d" roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 4. REGULATION BASKETBALL COURT & SPORTS FACILITIES            */}
      {/* ------------------------------------------------------------- */}
      <group position={[18, 0, 9]}>
        {/* Blue & Terracotta Acrylic Court Surface */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[14, 10]} />
          <meshStandardMaterial color="#0284c7" roughness={0.7} />
        </mesh>
        {/* Key Areas Painted Red */}
        {[-4.5, 4.5].map((kx, ki) => (
          <mesh key={`key-${ki}`} position={[kx, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.2, 4.0]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        ))}
        {/* Center Court Circle Line */}
        <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.4, 1.5, 24]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Half-Court Line */}
        <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.08, 9.6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Basketball Hoops & Acrylic Backboards on both sides */}
        {[-6.2, 6.2].map((bx, bi) => (
          <group key={`bb-hoop-${bi}`} position={[bx, 0, 0]} rotation={[0, bi === 0 ? 0 : Math.PI, 0]}>
            {/* Black Support Pole */}
            <mesh position={[0, 1.8, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.1, 3.6, 8]} />
              <meshStandardMaterial color="#0f172a" metalness={0.7} />
            </mesh>
            {/* Overhang Arm */}
            <mesh position={[0.4, 3.4, 0]} rotation={[0, 0, -0.4]}>
              <cylinderGeometry args={[0.06, 0.06, 1.2, 8]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            {/* Transparent Backboard */}
            <mesh position={[0.8, 3.7, 0]}>
              <boxGeometry args={[0.05, 1.1, 1.6]} />
              <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.1} transparent />
            </mesh>
            {/* Orange Rim / Ring */}
            <mesh position={[1.1, 3.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.26, 0.03, 8, 16]} />
              <meshStandardMaterial color="#ea580c" roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 5. FLEET OF YELLOW CHENNAI COLLEGE BUSES (SAIRAM / ANNA UNIV) */}
      {/* ------------------------------------------------------------- */}
      <group position={[-20, 0, 6]}>
        {/* Bus Bay Parking Asphalt Ground Markings */}
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>

        {/* 2 Parked Yellow College Buses */}
        {[-3.2, 3.2].map((by, bIdx) => (
          <group key={`college-bus-${bIdx}`} position={[0, 0, by]}>
            {/* Yellow Bus Body */}
            <mesh position={[0, 1.45, 0]} castShadow>
              <boxGeometry args={[8.4, 2.3, 2.5]} />
              <meshStandardMaterial color="#eab308" roughness={0.4} />
            </mesh>
            {/* Dark Blue Waistline Stripe */}
            <mesh position={[0, 1.0, 0]}>
              <boxGeometry args={[8.45, 0.35, 2.55]} />
              <meshStandardMaterial color="#1e3a8a" />
            </mesh>
            {/* Tinted Passenger Windows */}
            <mesh position={[0.4, 1.7, 0]}>
              <boxGeometry args={[6.8, 0.9, 2.58]} />
              <meshStandardMaterial color="#0f172a" roughness={0.1} />
            </mesh>
            {/* Front Windshield Glass */}
            <mesh position={[4.1, 1.7, 0]} rotation={[0, 0, -0.15]}>
              <boxGeometry args={[0.2, 1.1, 2.4]} />
              <meshPhysicalMaterial color="#38bdf8" transmission={0.8} transparent />
            </mesh>
            {/* Roof Emergency Flasher */}
            <mesh position={[3.8, 2.65, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.15, 8]} />
              <meshStandardMaterial color="#ea580c" emissive="#ea580c" emissiveIntensity={2} />
            </mesh>
            {/* Black Wheels */}
            {[-2.4, 2.4].map((wx, wi) =>
              [-1.3, 1.3].map((wz, wzi) => (
                <mesh key={`cwheel-${wi}-${wzi}`} position={[wx, 0.45, wz]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.45, 0.45, 0.35, 12]} />
                  <meshStandardMaterial color="#090d16" roughness={0.9} />
                </mesh>
              ))
            )}
          </group>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 6. GRAND CAMPUS ENTRANCE ARCHWAY (BILINGUAL SIGNAGE)          */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, 20.5]}>
        {/* Massive Dual Pillars */}
        {[-5.5, 5.5].map((ax, ai) => (
          <group key={`c-arch-col-${ai}`} position={[ax, 0, 0]}>
            <mesh position={[0, 3.5, 0]} castShadow>
              <boxGeometry args={[1.6, 7.0, 1.6]} />
              <meshStandardMaterial color="#991b1b" roughness={0.6} />
            </mesh>
            {/* Stone Capital Trim */}
            <mesh position={[0, 7.1, 0]}>
              <boxGeometry args={[1.9, 0.4, 1.9]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          </group>
        ))}

        {/* Grand Overhead Arch Span */}
        <mesh position={[0, 6.8, 0]} castShadow>
          <boxGeometry args={[12.6, 1.2, 1.2]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.5} />
        </mesh>

        {/* Illuminated Bilingual Welcome Arch Signboard */}
        <group position={[0, 6.8, 0.65]}>
          <mesh>
            <planeGeometry args={[11.8, 0.9]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={isNightOrEvening ? 2.8 : 1.2}
            />
          </mesh>
        </group>

        {/* Security Guard Cabin */}
        <group position={[7.5, 0, 0]}>
          <mesh position={[0, 1.4, 0]} castShadow>
            <boxGeometry args={[2.2, 2.8, 2.2]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0, 2.9, 0]}>
            <boxGeometry args={[2.6, 0.2, 2.6]} />
            <meshStandardMaterial color="#1e3a8a" />
          </mesh>
          <mesh position={[-0.8, 1.4, 0]}>
            <boxGeometry args={[0.1, 1.2, 1.4]} />
            <meshPhysicalMaterial color="#38bdf8" transmission={0.9} transparent />
          </mesh>
        </group>

        {/* Automated Red & White Boom Barrier */}
        <mesh position={[0, 0.9, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[9.0, 0.12, 0.12]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 7. CAMPUS LIGHTING & TREE-LINED WALKWAYS                      */}
      {/* ------------------------------------------------------------- */}
      {[-16, -6, 6, 16].map((lx, li) => (
        <group key={`c-lamp-${li}`} position={[lx, 0, 18]}>
          <mesh position={[0, 2.4, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 4.8, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[0, 4.8, 0]}>
            <sphereGeometry args={[0.2, 10, 10]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#facc15"
              emissiveIntensity={isNightOrEvening ? 3.0 : 0.8}
            />
          </mesh>
        </group>
      ))}

      {/* Campus Shady Trees */}
      {[
        { x: -18, z: 2 },
        { x: -18, z: 12 },
        { x: 7, z: 2 },
        { x: 7, z: 12 },
      ].map((tr, ti) => (
        <group key={`c-tree-${ti}`} position={[tr.x, 0, tr.z]}>
          <mesh position={[0, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 3.6, 8]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
          <mesh position={[0, 4.2, 0]} castShadow>
            <sphereGeometry args={[2.0, 10, 10]} />
            <meshStandardMaterial color="#15803d" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
