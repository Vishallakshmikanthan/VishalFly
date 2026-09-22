import React from 'react';
import { Architecture } from './Architecture';
import { Bed } from './Bed';
import { StudyDesk } from './StudyDesk';
import { DeskChair } from './DeskChair';
import { StorageAndShelves } from './StorageAndShelves';
import { WindowAndBalcony } from './WindowAndBalcony';
import { PlantsAndDecor } from './PlantsAndDecor';
import { LightingRig } from './LightingRig';
import { TimeOfDayLighting } from '../common/TimeOfDayLighting';
import { InteractionHighlight } from '../common/InteractionHighlight';

/**
 * BedroomEnvironment assembles the entire 3D cutaway PG Bedroom (Room 204):
 * - Dynamic Time-of-Day lighting & contextual interaction highlight
 * - Architecture (dark charcoal walls, hardwood floor, entrance, balcony threshold)
 * - Bed (frame, white pillows, vivid orange blanket, nightstand lamp, phone charger)
 * - Study Desk (laptop with glowing code, articulated lamp, stationery, water bottle)
 * - Desk Chair (ergonomic swivel chair)
 * - Storage & Shelves (wardrobe, floating shelves, books, posters)
 * - Window & Balcony (sliding glass door, balcony railing, horizon view)
 * - Plants & Decor (monstera, succulent, rug, wall clock, slippers)
 */
export const BedroomEnvironment: React.FC = () => {
  return (
    <group name="BedroomScene">
      <TimeOfDayLighting isInterior={true} accentColor="#fbbf24" />
      <LightingRig />
      <InteractionHighlight color="#f59e0b" />
      <Architecture />
      <Bed />
      <StudyDesk />
      <DeskChair />
      <StorageAndShelves />
      <WindowAndBalcony />
      <PlantsAndDecor />
    </group>
  );
};
