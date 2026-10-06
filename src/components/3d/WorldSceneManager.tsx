import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { UnifiedOpenWorldEnvironment } from './UnifiedOpenWorldEnvironment';
import { BedroomEnvironment } from './Bedroom/BedroomEnvironment';
import { DiningEnvironment } from './environments/DiningArea/DiningEnvironment';
import { ClassroomEnvironment } from './environments/Classroom/ClassroomEnvironment';
import { GymEnvironment } from './environments/Gym/GymEnvironment';
import { BalconyEnvironment } from './environments/Balcony/BalconyEnvironment';
import { GroundsEnvironment } from './environments/Grounds/GroundsEnvironment';

/**
 * WorldSceneManager:
 * Intelligently manages active 3D scenes:
 * 1. When in 'metropolitan':
 *    Mounts the sprawling Open-World Metropolis with Airport, Central Railway Station,
 *    Central Bus Stand, Skyscraper Towers, Shopping Malls, and interactive community buildings.
 * 2. When clicking 'bedroom', 'dining', 'classroom', or 'gym':
 *    Instantly mounts the dedicated, high-detail FULL ROOM INTERIOR (centered at [0, 0, 0]),
 *    providing complete 360-degree inspection and full interface access to see the entire room!
 */
export const WorldSceneManager: React.FC = () => {
  const currentLocation = useGameStore((state) => state.currentLocation);

  // 1. FULL PG BEDROOM INTERIOR (Room 204)
  if (currentLocation === 'bedroom') {
    return (
      <group name="ActiveFullRoom_Bedroom">
        <ambientLight intensity={1.1} color="#f8fafc" />
        <BedroomEnvironment />
        {/* Attached Terrace Balcony */}
        <group position={[1.9, 0, -6.2]}>
          <BalconyEnvironment />
        </group>
      </group>
    );
  }

  // 2. FULL CANTEEN / PG MESS INTERIOR
  if (currentLocation === 'dining') {
    return (
      <group name="ActiveFullRoom_Dining">
        <ambientLight intensity={1.2} color="#fef3c7" />
        <DiningEnvironment />
      </group>
    );
  }

  // 3. FULL SAIRAM COLLEGE LECTURE HALL (CS-301)
  if (currentLocation === 'classroom') {
    return (
      <group name="ActiveFullRoom_Classroom">
        <ambientLight intensity={1.2} color="#f0f9ff" />
        <ClassroomEnvironment />
      </group>
    );
  }

  // 4. FULL POWERFIT FITNESS GYM INTERIOR
  if (currentLocation === 'gym') {
    return (
      <group name="ActiveFullRoom_Gym">
        <ambientLight intensity={1.2} color="#f8fafc" />
        <GymEnvironment />
      </group>
    );
  }

  // 5. BALCONY OUTDOOR TERRACE
  if (currentLocation === 'balcony') {
    return (
      <group name="ActiveFullRoom_Balcony">
        <ambientLight intensity={1.3} color="#fef08a" />
        <BalconyEnvironment />
      </group>
    );
  }

  // 6. APARTMENT GROUNDS
  if (currentLocation === 'grounds') {
    return (
      <group name="ActiveFullRoom_Grounds">
        <ambientLight intensity={1.2} color="#e0f2fe" />
        <GroundsEnvironment />
      </group>
    );
  }

  // 7. DEFAULT: UNIFIED OPEN-WORLD METROPOLITAN CITY
  return (
    <group name="ActiveWorldEnvironment">
      <UnifiedOpenWorldEnvironment />
    </group>
  );
};
