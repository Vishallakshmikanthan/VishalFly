export type Vector3Tuple = [number, number, number];

export type FlyActivity = 
  | 'hovering'
  | 'flying'
  | 'perched_on_desk'
  | 'perched_on_laptop'
  | 'perched_on_lamp'
  | 'perched_on_plant'
  | 'perched_on_podium'
  | 'perched_on_table'
  | 'idle'
  | 'walking'
  | 'sitting'
  | 'sleeping'
  | 'working'
  | 'eating'
  | 'phone_call'
  | 'workout'
  | 'resting'
  | 'laundry'
  | 'drying_clothes'
  | 'gaming'
  | 'browsing'
  | 'dozing';

export type CharacterActivityState =
  | 'idle'
  | 'walking'
  | 'flying'
  | 'sitting'
  | 'sleeping'
  | 'working'
  | 'eating'
  | 'phone_call'
  | 'workout'
  | 'resting'
  | 'laundry'
  | 'drying_clothes'
  | 'gaming'
  | 'browsing'
  | 'dozing';

export type Waypoints = Record<string, Vector3Tuple>;
export type WalkingPath = Vector3Tuple[];

export interface RoomBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export type LightingPreset = 'dawn' | 'afternoon' | 'warm_night';

export type LocationId = 
  | 'bedroom' 
  | 'classroom' 
  | 'dining' 
  | 'gym' 
  | 'grounds' 
  | 'balcony' 
  | 'travel';

export type ActiveDashboardView = 
  | 'simulation' 
  | 'timeline' 
  | 'analytics' 
  | 'replay' 
  | 'settings'
  | 'living_world';

export * from '../simulation/types/simulation';

export interface Landmark {
  name: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY?: number;
  maxY?: number;
}

export interface CameraPreset {
  position: Vector3Tuple;
  target: Vector3Tuple;
  fov?: number;
}

export interface LocationConfig {
  id: LocationId;
  name: string;
  subLocation: string;
  initialTime: string;
  timeLabel: string;
  description: string;
  spawnPosition: Vector3Tuple;
  bounds: RoomBounds;
  camera: CameraPreset;
  landmarks: Landmark[];
  waypoints?: Record<string, Vector3Tuple>;
}

export interface TransitionState {
  isTransitioning: boolean;
  targetLocation: LocationId | null;
  message: string;
}

export interface KeyControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}
