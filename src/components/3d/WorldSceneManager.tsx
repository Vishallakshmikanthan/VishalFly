import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { BedroomEnvironment } from './Bedroom/BedroomEnvironment';
import { ClassroomEnvironment } from './environments/Classroom/ClassroomEnvironment';
import { DiningEnvironment } from './environments/DiningArea/DiningEnvironment';
import { GymEnvironment } from './environments/Gym/GymEnvironment';
import { GroundsEnvironment } from './environments/Grounds/GroundsEnvironment';
import { BalconyEnvironment } from './environments/Balcony/BalconyEnvironment';
import { PlaceholderEnvironment } from './environments/PlaceholderEnvironment';

/**
 * WorldSceneManager:
 * - Switches and mounts the active 3D environment based on currentLocation in useGameStore
 * - Ensures optimal performance by rendering only the active location
 * - Modular design makes adding future locations seamless
 */
export const WorldSceneManager: React.FC = () => {
  const currentLocation = useGameStore((state) => state.currentLocation);

  return (
    <group name="ActiveWorldEnvironment">
      {currentLocation === 'bedroom' && <BedroomEnvironment />}
      {currentLocation === 'classroom' && <ClassroomEnvironment />}
      {currentLocation === 'dining' && <DiningEnvironment />}
      {currentLocation === 'gym' && <GymEnvironment />}
      {currentLocation === 'grounds' && <GroundsEnvironment />}
      {currentLocation === 'balcony' && <BalconyEnvironment />}
      {currentLocation === 'travel' && <PlaceholderEnvironment locationId="travel" />}
    </group>
  );
};
