import { FlyActivity, Vector3Tuple, RoomBounds, CameraPreset, Landmark } from '../../types';

export type DayOfWeek = 
  | 'Monday' 
  | 'Tuesday' 
  | 'Wednesday' 
  | 'Thursday' 
  | 'Friday' 
  | 'Saturday' 
  | 'Sunday';

export type DayType = 'weekday' | 'weekend';

export type SimulationSpeed = 1 | 2 | 4 | 8;

export type ActivityLifecycleState = 
  | 'pending'
  | 'travelling'
  | 'starting'
  | 'active'
  | 'completing'
  | 'completed';

export type NeedType = 
  | 'energy'
  | 'hunger'
  | 'sleepiness'
  | 'fatigue'
  | 'focus'
  | 'socialNeed';

export type CollegeSubBehavior = 
  | 'lecture'
  | 'dozing'
  | 'laptop'
  | 'reels'
  | 'mobile_game';

export type SimulationEventCategory = 
  | 'activity'
  | 'travel'
  | 'behavior'
  | 'need'
  | 'system'
  | 'lifecycle';

export interface LocationDefinition {
  id: string;
  name: string;
  subLocation: string;
  initialTime: string;
  timeLabel: string;
  description: string;
  spawnPosition: Vector3Tuple;
  bounds: RoomBounds;
  camera: CameraPreset;
  landmarks: Landmark[];
  isPlaceholder?: boolean;
}

export interface SimulationClockState {
  simulatedTime: string; // e.g. "06:30"
  simulatedSeconds: number; // 0 to 86399
  currentMinutes: number; // 0 to 1439
  dayNumber: number; // 1, 2, 3...
  dayOfWeek: DayOfWeek;
  dayType: DayType;
  speed: SimulationSpeed;
  isPaused: boolean;
  totalElapsedSimulatedSeconds: number;
  totalElapsedRealSeconds: number;
}

export interface ScheduleEntry {
  id: string;
  activityId: string;
  name: string;
  startTime: string; // "06:00"
  endTime: string;   // "06:30"
  startMinutes: number; // 0-1439
  endMinutes: number;   // 0-1439
  locationId: string;
  description?: string;
  behaviorTag?: string;
  isFallback?: boolean;
}

export interface NeedsModifiers {
  energyPerHour: number;
  hungerPerHour: number;
  sleepinessPerHour: number;
  fatiguePerHour: number;
  focusPerHour: number;
  socialNeedPerHour: number;
}

export interface ActivityDefinition {
  id: string;
  displayName: string;
  requiredLocation: string;
  defaultFlyActivity: FlyActivity;
  needsModifiers: NeedsModifiers;
  targetLandmarkName?: string;
  completionCondition?: string;
}

export interface ActivityInstance {
  definition: ActivityDefinition;
  scheduleEntry: ScheduleEntry;
  state: ActivityLifecycleState;
  startTimeMinutes: number;
  elapsedSimulatedSeconds: number;
  selectedSubBehavior?: CollegeSubBehavior;
  targetLocation: string;
}

export interface NeedState {
  energy: number;      // 0 - 100
  hunger: number;      // 0 - 100
  sleepiness: number;  // 0 - 100
  fatigue: number;     // 0 - 100
  focus: number;       // 0 - 100
  socialNeed: number;  // 0 - 100
  lastAlertTimestamp?: number;
}

export interface CharacterState {
  locationId: string;
  currentSpot: string;
  flyActivity: FlyActivity;
  position: Vector3Tuple;
  isAutonomous: boolean;
  isTravelling: boolean;
}

export interface SimulationEvent {
  id: string;
  timestamp: string; // formatted: "Day 1 • 06:15"
  dayNumber: number;
  category: SimulationEventCategory;
  message: string;
  activityId?: string;
  locationId?: string;
}

export interface SimulationSettings {
  startingDay: number;
  startingTime: string;
  startingDayOfWeek: DayOfWeek;
  weekendDays: DayOfWeek[];
  simulatedSecondsPerRealSecond: number; // 1 real sec = 60 sim sec
  travelDurationSeconds: number;        // travel duration in sim seconds
  maxEventsInMemory: number;
  collegeBehaviorIntervalMinutes: number;
}

export interface SimulationState {
  clock: SimulationClockState;
  currentActivity: ActivityInstance | null;
  nextActivity: {
    entry: ScheduleEntry;
    startTime: string;
    startMinutes: number;
  } | null;
  character: CharacterState;
  needs: NeedState;
  recentEvents: SimulationEvent[];
  settings: SimulationSettings;
}
