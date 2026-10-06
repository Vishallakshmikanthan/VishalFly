import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

/**
 * ChennaiTidelParkOMR:
 * Tidel Park & Rajiv Gandhi Salai (OMR IT Expressway Corridor):
 * 1. The iconic Tidel Park building complex with stepped architectural blocks & glass curtain walls
 * 2. Glowing tech company billboards (TCS, Zoho, Cognizant, Infosys)
 * 3. OMR multi-lane IT expressway with toll plaza gates and digital LED electronic signage
 * 4. Landscaped palm medians, pedestrian skywalks, and IT shuttle bus pick-up bays
 */
export const ChennaiTidelParkOMR: React.FC = () => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const isNightOrEvening = timeOfDay === 'night' || timeOfDay === 'evening';

  return (
    <group position={[-65, 0, 48]} name="ChennaiTidelParkOMRDistrict">
      {/* ------------------------------------------------------------- */}
      {/* 1. TIDEL PARK ICONIC STEPPED TECH COMPLEX                      */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, 0]}>
        {/* Central Main Block (Height: 38m, Width: 42m) */}
        <mesh position={[0, 19, 0]} castShadow receiveShadow>
          <boxGeometry args={[42, 38, 24]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Stepped Wing Block 1 (West Wing, Height: 30m) */}
        <mesh position={[-26, 15, 0]} castShadow receiveShadow>
          <boxGeometry args={[16, 30, 20]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Stepped Wing Block 2 (East Wing, Height: 24m) */}
        <mesh position={[26, 12, 0]} castShadow receiveShadow>
          <boxGeometry args={[16, 24, 20]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Reflective Emerald & Cyan Glass Curtain Walls */}
        <mesh position={[0, 19, 12.1]}>
          <boxGeometry args={[40, 36, 0.2]} />
          <meshPhysicalMaterial
            color="#06b6d4"
            transmission={0.85}
            roughness={0.1}
            opacity={0.7}
            transparent
          />
        </mesh>
        <mesh position={[-26, 15, 10.1]}>
          <boxGeometry args={[15, 28, 0.2]} />
          <meshPhysicalMaterial
            color="#0284c7"
            transmission={0.85}
            roughness={0.1}
            opacity={0.7}
            transparent
          />
        </mesh>
        <mesh position={[26, 12, 10.1]}>
          <boxGeometry args={[15, 22, 0.2]} />
          <meshPhysicalMaterial
            color="#0284c7"
            transmission={0.85}
            roughness={0.1}
            opacity={0.7}
            transparent
          />
        </mesh>

        {/* Illuminated Rooftop Signboard: "TIDEL PARK" */}
        <group position={[0, 40, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[26, 3.2, 0.4]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <mesh position={[0, 0, 0.25]}>
            <planeGeometry args={[25, 2.6]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={isNightOrEvening ? 2.5 : 1.2}
            />
          </mesh>
        </group>

        {/* Tech Company Illuminated Office Logos (Zoho, TCS, Cognizant) */}
        {[-14, 0, 14].map((lx, li) => (
          <group key={`tech-logo-${li}`} position={[lx, 32, 12.3]}>
            <mesh>
              <boxGeometry args={[9, 2.2, 0.2]} />
              <meshStandardMaterial
                color={li === 0 ? '#ef4444' : li === 1 ? '#3b82f6' : '#10b981'}
                emissive={li === 0 ? '#dc2626' : li === 1 ? '#2563eb' : '#059669'}
                emissiveIntensity={isNightOrEvening ? 2.0 : 0.8}
              />
            </mesh>
          </group>
        ))}

        {/* Entrance Atrium Portico with Landscaped Courtyard */}
        <mesh position={[0, 4, 15]} castShadow>
          <boxGeometry args={[18, 0.5, 8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        {[-8, 8].map((cx, ci) => (
          <mesh key={`ent-col-${ci}`} position={[cx, 2, 17]}>
            <cylinderGeometry args={[0.3, 0.35, 4, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 2. OMR IT EXPRESSWAY TOLL PLAZA & HIGHWAY GANTRY              */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, 26]}>
        {/* Overhead Toll Plaza Canopy */}
        <mesh position={[0, 5.5, 0]} castShadow>
          <boxGeometry args={[34, 0.6, 6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        {/* Toll Booth Cubicles */}
        {[-12, -4, 4, 12].map((bx, bi) => (
          <group key={`toll-b-${bi}`} position={[bx, 1.5, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.6, 3, 2.4]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.4} />
            </mesh>
            {/* Toll Green/Red Lane Signal */}
            <mesh position={[0, 2.8, 1.25]}>
              <sphereGeometry args={[0.18, 8, 8]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={3.0} />
            </mesh>
          </group>
        ))}

        {/* OMR Electronic LED Destination Board */}
        <group position={[0, 8.2, 0]}>
          <mesh>
            <boxGeometry args={[24, 2.0, 0.3]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0, 0.2]}>
            <planeGeometry args={[23, 1.6]} />
            <meshStandardMaterial
              color="#eab308"
              emissive="#ca8a04"
              emissiveIntensity={isNightOrEvening ? 2.5 : 1.2}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};
