import React from 'react';
import { DiningArchitecture } from './DiningArchitecture';
import { FoodServingCounter } from './FoodServingCounter';
import { DiningTables } from './DiningTables';
import { KitchenPrepArea } from './KitchenPrepArea';
import { WaterStationAndDecor } from './WaterStationAndDecor';
import { DiningLighting } from './DiningLighting';

/**
 * DiningEnvironment assembles the entire 3D PG Dining Hall:
 * - Dining Architecture (checkered tile floor, kitchen pass-through, entrance)
 * - Food Serving Counter (chafing dishes, thali plates, sneeze guard)
 * - Dining Tables (communal tables, chairs, water carafes, napkin holders)
 * - Kitchen Prep Area (commercial refrigerator, sink, microwave, cabinets)
 * - Water Station & Decor (20L water dispenser, notice board, fan, hand wash)
 * - Dining Lighting (hanging pendant lights, buffet spotlights, warm ambient)
 */
export const DiningEnvironment: React.FC = () => {
  return (
    <group name="DiningScene">
      <DiningLighting />
      <DiningArchitecture />
      <FoodServingCounter />
      <DiningTables />
      <KitchenPrepArea />
      <WaterStationAndDecor />
    </group>
  );
};
