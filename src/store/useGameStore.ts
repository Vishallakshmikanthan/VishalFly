import { create } from 'zustand';
import { Vector3Tuple, FlyActivity, RoomBounds, LightingPreset, LocationId, TransitionState } from '../types';
import { LOCATIONS } from '../navigation/locationGraph';

interface GameState {
  // Active Location
  currentLocation: LocationId;
  transitionState: TransitionState;

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
  switchLocation: (targetId: LocationId) => void;
}

const initialLoc = LOCATIONS.bedroom;

export const useGameStore = create<GameState>((set, get) => ({
  currentLocation: 'bedroom',
  transitionState: {
    isTransitioning: false,
    targetLocation: null,
    message: '',
  },

  flyPosition: [...initialLoc.spawnPosition] as Vector3Tuple,
  flyRotation: [0, 0, 0],
  flyActivity: 'hovering',
  currentSpot: 'Center Room Airspace',
  
  roomBounds: { ...initialLoc.bounds },
  
  simulatedTime: initialLoc.initialTime,
  locationName: initialLoc.name,
  roomSubLocation: initialLoc.subLocation,
  
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
    const currentLoc = LOCATIONS[get().currentLocation];
    set({
      flyPosition: [...currentLoc.spawnPosition] as Vector3Tuple,
      flyRotation: [0, 0, 0],
      flyActivity: 'hovering',
      currentSpot: 'Spawning at ' + currentLoc.name,
    });
  },

  switchLocation: (targetId: LocationId) => {
    const state = get();
    if (state.currentLocation === targetId || state.transitionState.isTransitioning) {
      return;
    }

    const targetConfig = LOCATIONS[targetId];

    // 1. Begin transition overlay
    set({
      transitionState: {
        isTransitioning: true,
        targetLocation: targetId,
        message: `Traveling to ${targetConfig.name}...`,
      },
    });

    // 2. Midpoint of transition: swap environment, bounds, spawn position, metadata
    setTimeout(() => {
      set((prev) => ({
        currentLocation: targetId,
        roomBounds: { ...targetConfig.bounds },
        flyPosition: [...targetConfig.spawnPosition] as Vector3Tuple,
        flyRotation: [0, 0, 0],
        flyActivity: 'hovering',
        locationName: targetConfig.name,
        roomSubLocation: targetConfig.subLocation,
        simulatedTime: targetConfig.initialTime,
        currentSpot: `Arrived at ${targetConfig.name}`,
        resetCameraTrigger: prev.resetCameraTrigger + 1, // trigger smooth camera re-orientation
      }));
    }, 380);

    // 3. Complete transition: remove overlay
    setTimeout(() => {
      set({
        transitionState: {
          isTransitioning: false,
          targetLocation: null,
          message: '',
        },
      });
    }, 850);
  },
}));
