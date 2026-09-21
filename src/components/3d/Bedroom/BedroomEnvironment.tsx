import React from 'react';
import { Architecture } from './Architecture';
import { Bed } from './Bed';
import { StudyDesk } from './StudyDesk';
import { DeskChair } from './DeskChair';
import { StorageAndShelves } from './StorageAndShelves';
import { WindowAndBalcony } from './WindowAndBalcony';
import { PlantsAndDecor } from './PlantsAndDecor';
import { LightingRig } from './LightingRig';

/**
 * BedroomEnvironment assembles the entire 3D cutaway PG Bedroom:
 * - Architecture (dark charcoal walls, hardwood floor, entrance, balcony threshold)
 * - Bed (frame, white pillows, vivid orange blanket, nightstand lamp)
 * - Study Desk (open laptop with glowing code, articulated desk lamp, notebooks)
 * - Desk Chair (ergonomic swivel chair)
 * - Storage & Shelves (wardrobe, floating shelves, books, posters)
 * - Window & Balcony (sliding glass door, balcony railing, sunrise sky)
 * - Plants & Decor (monstera, succulent, rug, 06:00 wall clock, slippers)
 * - LightingRig (sunlight, shadows, ambient presets)
 */
export const BedroomEnvironment: React.FC = () => {
  return (
    <group name="BedroomScene">
      <LightingRig />
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
