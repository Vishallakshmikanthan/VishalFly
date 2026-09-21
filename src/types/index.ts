export type Vector3Tuple = [number, number, number];

export type FlyActivity = 
  | 'hovering'
  | 'flying'
  | 'perched_on_desk'
  | 'perched_on_laptop'
  | 'perched_on_lamp'
  | 'perched_on_plant';

export interface RoomBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export type LightingPreset = 'dawn' | 'afternoon' | 'warm_night';

export interface KeyControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}
