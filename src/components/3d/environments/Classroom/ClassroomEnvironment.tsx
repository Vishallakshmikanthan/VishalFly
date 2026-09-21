import React from 'react';
import { ClassroomArchitecture } from './ClassroomArchitecture';
import { TeachingStage } from './TeachingStage';
import { StudentDesks } from './StudentDesks';
import { ClassroomDecor } from './ClassroomDecor';
import { ClassroomLighting } from './ClassroomLighting';

/**
 * ClassroomEnvironment assembles the entire 3D College Lecture Hall:
 * - Classroom Architecture (slat acoustic walls, tiled floor, entrance, windows)
 * - Teaching Stage (elevated dais, lectern, presentation screen, whiteboard)
 * - Student Desks (tiered rows, chairs, laptops, notebooks, water bottles)
 * - Classroom Decor (backpacks, ceiling projector, wall clock, wastebin)
 * - Classroom Lighting (LED troffers, stage spotlight, ambient fill)
 */
export const ClassroomEnvironment: React.FC = () => {
  return (
    <group name="ClassroomScene">
      <ClassroomLighting />
      <ClassroomArchitecture />
      <TeachingStage />
      <StudentDesks />
      <ClassroomDecor />
    </group>
  );
};
