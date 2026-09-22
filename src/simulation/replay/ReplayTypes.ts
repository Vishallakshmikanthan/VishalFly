import { 
  DayOfWeek, 
  FlyActivity, 
  Vector3Tuple, 
  LocationId, 
  NeedState 
} from '../../types';

export interface SimulationSnapshot {
  id: string;
  index: number;
  timestamp: string; // e.g. "Day 1 • 06:15"
  simulatedSeconds: number;
  currentMinutes: number;
  dayNumber: number;
  dayOfWeek: DayOfWeek;
  locationId: LocationId;
  locationName: string;
  currentSpot: string;
  currentWaypoint: string;
  flyActivity: FlyActivity;
  flyPosition: Vector3Tuple;
  currentActivity: {
    id: string;
    name: string;
    progressPercent: number;
    actionLabel: string;
    state: string;
    subBehavior?: string;
  } | null;
  needs: NeedState;
  workoutSummary?: {
    planName: string;
    exerciseName: string;
    set: number;
    totalSets: number;
    reps: number;
    state: string;
  } | null;
  projectSummary?: {
    currentProject: string;
    progress: number;
    sessions: number;
  } | null;
  assignmentSummary?: {
    task: string;
    progress: number;
  } | null;
  mealSummary?: {
    name: string;
    hungerReduction: number;
  } | null;
  cognitiveSummary?: {
    goal: string;
    selectedBehavior: string;
    explanation?: string;
  } | null;
}

export type ReplaySpeed = 1 | 2 | 4;

export interface ReplayPlaybackState {
  isPlaying: boolean;
  playbackSpeed: ReplaySpeed;
  currentIndex: number;
  totalSnapshots: number;
  activeSnapshot: SimulationSnapshot | null;
}
