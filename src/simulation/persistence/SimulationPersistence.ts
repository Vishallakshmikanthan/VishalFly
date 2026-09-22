import { 
  SimulationClockState, 
  NeedState, 
  ProjectState, 
  AssignmentState, 
  WorkoutSession, 
  SimulationEvent 
} from '../types/simulation';
import { SerializedCognitiveData } from '../../cognition/types/cognition';

export interface SerializedSimulationData {
  version: number;
  savedAt: string;
  clock: {
    dayNumber: number;
    dayOfWeek: string;
    dayType: string;
    simulatedTime: string;
    simulatedSeconds: number;
    currentMinutes: number;
    speed: number;
  };
  needs: NeedState;
  project: ProjectState;
  assignment: AssignmentState;
  workout: WorkoutSession | null;
  events: SimulationEvent[];
  cognitive?: SerializedCognitiveData;
}

export const STORAGE_KEY = 'vishalfly_simulation_save_v1';

let inMemoryStorage: Record<string, string> = {};

const fallbackStorage: Storage = {
  getItem: (key: string) => inMemoryStorage[key] || null,
  setItem: (key: string, val: string) => { inMemoryStorage[key] = val; },
  removeItem: (key: string) => { delete inMemoryStorage[key]; },
  clear: () => { inMemoryStorage = {}; },
  key: (idx: number) => Object.keys(inMemoryStorage)[idx] || null,
  length: 0,
};

function getStorage(): Storage {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    return (globalThis as any).localStorage;
  }
  return fallbackStorage;
}

export class SimulationPersistence {
  public static saveSimulation(data: {
    clock: SimulationClockState;
    needs: NeedState;
    project: ProjectState;
    assignment: AssignmentState;
    workout: WorkoutSession | null;
    events: SimulationEvent[];
    cognitive?: SerializedCognitiveData;
  }): boolean {
    try {
      const storage = getStorage();
      if (!storage) {
        return false;
      }

      const payload: SerializedSimulationData = {
        version: 1,
        savedAt: new Date().toISOString(),
        clock: {
          dayNumber: data.clock.dayNumber,
          dayOfWeek: data.clock.dayOfWeek,
          dayType: data.clock.dayType,
          simulatedTime: data.clock.simulatedTime,
          simulatedSeconds: data.clock.simulatedSeconds,
          currentMinutes: data.clock.currentMinutes,
          speed: data.clock.speed,
        },
        needs: data.needs,
        project: data.project,
        assignment: data.assignment,
        workout: data.workout,
        events: data.events.slice(-30), // save last 30 events
        cognitive: data.cognitive,
      };

      storage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.warn('Failed to save simulation to localStorage', e);
      return false;
    }
  }

  public static loadSimulation(): SerializedSimulationData | null {
    try {
      const storage = getStorage();
      if (!storage) {
        return null;
      }

      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as SerializedSimulationData;
      if (!parsed || !parsed.clock || !parsed.needs) {
        return null;
      }

      return parsed;
    } catch (e) {
      console.warn('Failed to load simulation from localStorage', e);
      return null;
    }
  }

  public static resetSimulation(): boolean {
    try {
      const storage = getStorage();
      if (!storage) {
        return false;
      }

      storage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      console.warn('Failed to reset simulation in localStorage', e);
      return false;
    }
  }
}
