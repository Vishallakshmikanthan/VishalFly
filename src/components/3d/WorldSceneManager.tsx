import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { BedroomEnvironment } from './Bedroom/BedroomEnvironment';
import { ClassroomEnvironment } from './environments/Classroom/ClassroomEnvironment';
import { DiningEnvironment } from './environments/DiningArea/DiningEnvironment';

/**
 * WorldSceneManager:
 * - Switches and mounts the active 3D environment based on currentLocation in useGameStore
 * - Ensures optimal performance by rendering only the active location
 * - Modular design makes adding future locations (e.g. Gym, Library) seamless
 */
export const WorldSceneManager: React.FC = () => {
  const currentLocation = useGameStore((state) => state.currentLocation);

  return (
    <group name="ActiveWorldEnvironment">
      {currentLocation === 'bedroom' && <BedroomEnvironment />}
      {currentLocation === 'classroom' && <ClassroomEnvironment />}
      {currentLocation === 'dining' && <DiningEnvironment />}
    </group>
  );
};
