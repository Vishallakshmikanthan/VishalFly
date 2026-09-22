import { NeedState } from '../../types';

export interface ActivityMetricItem {
  activityId: string;
  displayName: string;
  totalSimulatedMinutes: number;
  completionCount: number;
  interruptionCount: number;
}

export interface LocationMetricItem {
  locationId: string;
  locationName: string;
  totalSimulatedMinutes: number;
  visitCount: number;
}

export interface NeedsSample {
  timestamp: string;
  simulatedSeconds: number;
  currentMinutes: number;
  dayNumber: number;
  needs: NeedState;
}

export interface AnalyticsReport {
  measuredTimeRange: {
    startDay: number;
    startTime: string;
    currentDay: number;
    currentTime: string;
    totalElapsedSimMinutes: number;
    totalElapsedRealSeconds: number;
  };
  hasSufficientData: boolean; // false if < 5 sim minutes
  activityMetrics: Record<string, ActivityMetricItem>;
  locationMetrics: Record<string, LocationMetricItem>;
  workoutStats: {
    workoutsCompleted: number;
    totalSetsCompleted: number;
    totalRepsCompleted: number;
    lastPlanName?: string;
  };
  projectStats: {
    totalProgress: number;
    completedSessions: number;
    projectName: string;
  };
  assignmentStats: {
    progress: number;
    completedTasks: number;
    currentTask: string;
  };
  mealStats: {
    mealsCompleted: number;
    lunchCount: number;
    dinnerCount: number;
    midnightOrderCount: number;
  };
  collegeStats: {
    totalSimulatedMinutes: number;
    behaviorDistribution: Record<string, number>;
  };
  routineStats: {
    morningRoutinesCompleted: number;
    laundryCompleted: number;
    familyCallsCompleted: number;
    familyCallMinutes: number;
  };
  needsTrends: NeedsSample[];
  overallCompletionRate: number; // percentage (e.g. 85.5)
}
