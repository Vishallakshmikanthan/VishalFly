import React from 'react';
import { UnifiedOpenWorldEnvironment } from './UnifiedOpenWorldEnvironment';

/**
 * WorldSceneManager:
 * - Mounts the Unified Open World Environment containing all interconnected scenes:
 *   Roads, 1 km commute, bus stops, PG room, balcony, gym, dining mess, grounds, and college classroom.
 * - Allows seamless multi-district flight navigation in a continuous 3D world.
 */
export const WorldSceneManager: React.FC = () => {
  return (
    <group name="ActiveWorldEnvironment">
      <UnifiedOpenWorldEnvironment />
    </group>
  );
};
