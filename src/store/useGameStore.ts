import { create } from 'zustand';
import { Vector3Tuple, FlyActivity, RoomBounds, LightingPreset } from '../types';

interface GameState {
  // Fly state
  flyPosition: Vector3Tuple;
  flyRotation: [number, number, number];
  flyActivity: FlyActivity;
  currentSpot: string;
  
  // Room dimensions & bounds
  roomBounds: RoomBounds;
  
  // Simulation metadata
  simulatedTime: string;
  locationName: string;
  roomSubLocation: string;
  
  // Camera & view controls
  resetCameraTrigger: number;
  followFly: boolean;
  
  // Visuals
  lightingPreset: LightingPreset;
  
  // Actions
  setFlyPosition: (pos: Vector3Tuple) => void;
  setFlyRotation: (rot: [number, number, number]) => void;
  setFlyActivity: (activity: FlyActivity) => void;
  setCurrentSpot: (spot: string) => void;
  triggerResetCamera: () => void;
  setFollowFly: (follow: boolean) => void;
  toggleFollowFly: () => void;
  setLightingPreset: (preset: LightingPreset) => void;
  cycleLightingPreset: () => void;
  resetFlyToCenter: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  flyPosition: [0, 1.8, 0],
  flyRotation: [0, 0, 0],
  flyActivity: 'hovering',
  currentSpot: 'Center Room Airspace',
  
  // Room bounds (room floor is 8x8 units, centered around (0,0,0), walls from -4 to 4, height from 0 to 4.5)
  roomBounds: {
    minX: -3.6,
    maxX: 3.6,
    minY: 0.35,
    maxY: 4.2,
    minZ: -3.6,
    maxZ: 3.6,
  },
  
  simulatedTime: '06:00',
  locationName: "Vishal's PG Bedroom",
  roomSubLocation: 'Room 204 • South Wing',
  
  resetCameraTrigger: 0,
  followFly: false,
  
  lightingPreset: 'dawn',
  
  setFlyPosition: (flyPosition) => set({ flyPosition }),
  setFlyRotation: (flyRotation) => set({ flyRotation }),
  setFlyActivity: (flyActivity) => set({ flyActivity }),
  setCurrentSpot: (currentSpot) => set({ currentSpot }),
  
  triggerResetCamera: () => set((state) => ({ resetCameraTrigger: state.resetCameraTrigger + 1 })),
  
  setFollowFly: (followFly) => set({ followFly }),
  toggleFollowFly: () => set((state) => ({ followFly: !state.followFly })),
  
  setLightingPreset: (lightingPreset) => set({ lightingPreset }),
  cycleLightingPreset: () => {
    const current = get().lightingPreset;
    const next: LightingPreset = 
      current === 'dawn' ? 'afternoon' : current === 'afternoon' ? 'warm_night' : 'dawn';
    set({ lightingPreset: next });
  },
  
  resetFlyToCenter: () => {
    set({
      flyPosition: [0, 1.8, 0],
      flyRotation: [0, 0, 0],
      flyActivity: 'hovering',
      currentSpot: 'Center Room Airspace',
    });
  }
}));
