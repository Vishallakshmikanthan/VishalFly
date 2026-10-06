import React from 'react';
import { MetropolitanCity } from './metropolitan/MetropolitanCity';
import { MetropolitanCommunityZone } from './metropolitan/MetropolitanCommunityZone';
import { ClassroomEnvironment } from './environments/Classroom/ClassroomEnvironment';

/**
 * UnifiedOpenWorldEnvironment:
 * Seamless, unified open-world combining the bustling Metropolitan City
 * and the micro routine sectors into a single continuous coordinate space:
 * 
 * 1. Metropolitan City (Full Urban System matching Reference Image):
 *    - Lake & Waterfront Park with traditional Pagoda Gazebo
 *    - Luxury Decorated High-rise Apartments & Residential Suburbs
 *    - Multi-story Shopping Mall with digital LED billboards ("MALL", etc.)
 *    - Commercial Offices Skyscraper Towers
 *    - Commercial High Street Shops & Restaurants with outdoor cafe patio
 *    - Healthcare Hospital Complex with Red Cross & Trauma Helipad
 *    - Industrial Logistics & Warehousing Zone with cargo containers & semi-trucks
 *    - Massively Expanded PowerFit Mega Gym with complete equipment zones
 *    - Elevated Concrete Metro Viaduct & Articulated Blue/White Metro Train
 *    - Multi-lane Boulevard Network with Animated Traffic (cars, taxis, buses, vans)
 *    - Animated Roaming Pedestrian Agents (people walking across the city)
 *    - 3D Floating Landmark Badges
 * 
 * 2. Nested Micro Routine Interior Sectors:
 *    - Vishal's PG Bedroom [0, 0, 0]
 *    - Attached Terracotta Balcony [1.9, 0, -6.2]
 *    - PG Dining Mess [18, 0, -2]
 *    - Apartment Grounds & Gate [-18, 0, -2]
 *    - Sairam College Campus Lecture Hall [0, 0, 100]
 */
export const UnifiedOpenWorldEnvironment: React.FC = () => {
  return (
    <group name="UnifiedOpenWorld">
      {/* 1. MASTER METROPOLITAN CITY SYSTEM */}
      <MetropolitanCity />

      {/* 2. COMMUNITY ZONE IN MARKED AREA: PG Bedroom, Canteen & Gym (Individual, visible, clickable buildings) */}
      <MetropolitanCommunityZone />

      {/* Sector E: Sairam College Campus Quad & Lecture Hall CS-301 [Relocated off-road to [-28, 0, 95]] */}
      <group position={[-28, 0, 95]} name="Sector_CollegeClassroom">
        {/* Sairam Academic Campus Plaza Base Platform */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[26, 22]} />
          <meshStandardMaterial color="#1e293b" roughness={0.85} />
        </mesh>

        {/* Campus Quad Lawn */}
        <mesh position={[-6.0, 0.03, 6.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 8]} />
          <meshStandardMaterial color="#15803d" roughness={0.9} />
        </mesh>

        {/* Grand Sairam Campus Entrance Archway (Connecting towards Boulevard Sidewalk) */}
        <group position={[11.5, 0, 2]}>
          {[-2.5, 2.5].map((cz, ci) => (
            <mesh key={`college-col-${ci}`} position={[0, 2.5, cz]} castShadow>
              <boxGeometry args={[0.8, 5.0, 0.8]} />
              <meshStandardMaterial color="#475569" roughness={0.6} />
            </mesh>
          ))}
          {/* Overhead Beam */}
          <mesh position={[0, 4.8, 0]} castShadow>
            <boxGeometry args={[0.9, 0.7, 5.8]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} />
          </mesh>
          {/* Sairam Banner Sign */}
          <mesh position={[0.46, 4.8, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[5.2, 0.5]} />
            <meshStandardMaterial color="#1d4ed8" emissive="#1e40af" emissiveIntensity={0.6} />
          </mesh>
        </group>

        {/* Student Bicycle Parking Stand */}
        <group position={[-7.0, 0, -6.0]}>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.1, 0.7, 4.5]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          {[-1.5, -0.5, 0.5, 1.5].map((bz, bi) => (
            <mesh key={`bike-${bi}`} position={[0.4, 0.45, bz]} rotation={[0, 0, 0.15]}>
              <boxGeometry args={[1.4, 0.9, 0.3]} />
              <meshStandardMaterial color={bi % 2 === 0 ? '#ef4444' : '#3b82f6'} metalness={0.7} />
            </mesh>
          ))}
        </group>

        {/* Classroom Interior Shell */}
        <ClassroomEnvironment />
      </group>
    </group>
  );
};
