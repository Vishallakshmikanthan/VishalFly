import { 
  DayOfWeek, 
  SimulationSettings, 
  ScheduleEntry, 
  NeedState,
  CollegeSubBehavior 
} from '../types/simulation';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const DEFAULT_SIMULATION_SETTINGS: SimulationSettings = {
  startingDay: 1,
  startingTime: '06:00',
  startingDayOfWeek: 'Monday',
  weekendDays: ['Saturday', 'Sunday'],
  // 1 real second = 60 simulated seconds (1 sim minute)
  simulatedSecondsPerRealSecond: 60,
  // 10 simulated seconds to travel between locations
  travelDurationSeconds: 10,
  maxEventsInMemory: 100,
  collegeBehaviorIntervalMinutes: 45,
};

export const COLLEGE_BEHAVIOR_WEIGHTS: Record<CollegeSubBehavior, number> = {
  lecture: 50,
  dozing: 20,
  laptop: 15,
  reels: 10,
  mobile_game: 5,
};

export const INITIAL_NEEDS_STATE: NeedState = {
  energy: 88,
  hunger: 25,
  sleepiness: 15,
  fatigue: 10,
  focus: 85,
  socialNeed: 30,
};

export const NEEDS_THRESHOLDS = {
  CRITICAL_LOW: 15,
  WARNING_LOW: 25,
  WARNING_HIGH: 75,
  CRITICAL_HIGH: 88,
};

export const FALLBACK_SCHEDULE_ENTRY: ScheduleEntry = {
  id: 'fallback_idle',
  activityId: 'free_idle',
  name: 'Free Time & Relaxing',
  startTime: '00:00',
  endTime: '23:59',
  startMinutes: 0,
  endMinutes: 1439,
  locationId: 'bedroom',
  description: 'Unscheduled buffer time resting in the PG room.',
  isFallback: true,
};
