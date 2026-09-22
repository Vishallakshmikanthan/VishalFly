import { 
  AnalyticsReport, 
  ActivityMetricItem, 
  LocationMetricItem, 
  NeedsSample 
} from './AnalyticsTypes';
import { 
  SimulationClockState, 
  ActivityInstance, 
  NeedState,
  ProjectState,
  AssignmentState,
  WorkoutSession,
  MealSession,
  FamilyCallState
} from '../types/simulation';
import { LOCATIONS } from '../../navigation/locationGraph';

export class AnalyticsTracker {
  // Time accumulated in simulated seconds
  private activityTimeSec: Record<string, { displayName: string; seconds: number; completed: number; interrupted: number }> = {};
  private locationTimeSec: Record<string, { name: string; seconds: number; visits: number }> = {};
  private collegeBehaviorSec: Record<string, number> = {
    lecture: 0,
    dozing: 0,
    laptop: 0,
    reels: 0,
    mobile_game: 0,
  };

  // Milestones counters
  private workoutsCompleted: number = 0;
  private totalSetsCompleted: number = 0;
  private totalRepsCompleted: number = 0;
  private lastWorkoutPlan: string = '';

  private mealsCompleted: number = 0;
  private lunchCount: number = 0;
  private dinnerCount: number = 0;
  private midnightOrderCount: number = 0;

  private morningRoutinesCompleted: number = 0;
  private laundryCompleted: number = 0;
  private familyCallsCompleted: number = 0;
  private familyCallMinutes: number = 0;

  // Initial reference
  private startDay: number = 1;
  private startTime: string = '06:00';

  // Needs time-series samples (bounded buffer)
  private needsSamples: NeedsSample[] = [];
  private lastNeedsSampleSimSec: number = -1;
  private readonly sampleIntervalSec: number = 300; // Sample every 5 sim minutes
  private readonly maxSamples: number = 150;

  private lastLocation: string = '';

  constructor() {
    this.initLocations();
  }

  private initLocations(): void {
    const locMap = LOCATIONS as Record<string, any>;
    Object.keys(locMap).forEach((locId) => {
      this.locationTimeSec[locId] = {
        name: locMap[locId]?.name || locId,
        seconds: 0,
        visits: 0,
      };
    });
  }

  public trackStep(params: {
    deltaSimSec: number;
    clock: SimulationClockState;
    locationId: string;
    currentActivity: ActivityInstance | null;
    needs: NeedState;
    workoutSession: WorkoutSession | null;
    projectState: ProjectState;
    assignmentState: AssignmentState;
    mealSession: MealSession | null;
    familyCallState: FamilyCallState;
  }): void {
    const { deltaSimSec, clock, locationId, currentActivity, needs } = params;
    if (deltaSimSec <= 0) return;

    // First step initialization
    if (this.lastNeedsSampleSimSec < 0) {
      this.startDay = clock.dayNumber;
      this.startTime = clock.simulatedTime;
      this.lastNeedsSampleSimSec = clock.totalElapsedSimulatedSeconds;
      this.sampleNeeds(clock, needs);
    }

    // 1. Track Location Time & Visits
    const locMap = LOCATIONS as Record<string, any>;
    if (!this.locationTimeSec[locationId]) {
      this.locationTimeSec[locationId] = {
        name: locMap[locationId]?.name || locationId,
        seconds: 0,
        visits: 0,
      };
    }
    this.locationTimeSec[locationId].seconds += deltaSimSec;
    if (this.lastLocation !== locationId) {
      this.locationTimeSec[locationId].visits += 1;
      this.lastLocation = locationId;
    }

    // 2. Track Activity Time
    if (currentActivity) {
      const actId = currentActivity.definition.id;
      if (!this.activityTimeSec[actId]) {
        this.activityTimeSec[actId] = {
          displayName: currentActivity.scheduleEntry.name,
          seconds: 0,
          completed: 0,
          interrupted: 0,
        };
      }
      this.activityTimeSec[actId].seconds += deltaSimSec;

      // College sub-behavior breakdown
      if (actId === 'college_activities' && currentActivity.selectedSubBehavior) {
        const sub = currentActivity.selectedSubBehavior;
        this.collegeBehaviorSec[sub] = (this.collegeBehaviorSec[sub] || 0) + deltaSimSec;
      }
    }

    // 3. Periodic Needs Sampling
    const elapsedSinceLastSample = clock.totalElapsedSimulatedSeconds - this.lastNeedsSampleSimSec;
    if (elapsedSinceLastSample >= this.sampleIntervalSec) {
      this.lastNeedsSampleSimSec = clock.totalElapsedSimulatedSeconds;
      this.sampleNeeds(clock, needs);
    }
  }

  private sampleNeeds(clock: SimulationClockState, needs: NeedState): void {
    const sample: NeedsSample = {
      timestamp: `Day ${clock.dayNumber} • ${clock.simulatedTime}`,
      simulatedSeconds: clock.totalElapsedSimulatedSeconds,
      currentMinutes: clock.currentMinutes,
      dayNumber: clock.dayNumber,
      needs: { ...needs },
    };

    this.needsSamples.push(sample);
    if (this.needsSamples.length > this.maxSamples) {
      this.needsSamples.shift();
    }
  }

  public recordActivityCompletion(activityId: string, displayName?: string): void {
    if (!this.activityTimeSec[activityId]) {
      this.activityTimeSec[activityId] = {
        displayName: displayName || activityId,
        seconds: 0,
        completed: 0,
        interrupted: 0,
      };
    }
    this.activityTimeSec[activityId].completed += 1;
  }

  public recordActivityInterruption(activityId: string, displayName?: string): void {
    if (!this.activityTimeSec[activityId]) {
      this.activityTimeSec[activityId] = {
        displayName: displayName || activityId,
        seconds: 0,
        completed: 0,
        interrupted: 0,
      };
    }
    this.activityTimeSec[activityId].interrupted += 1;
  }

  public recordWorkoutCompletion(planName: string, sets: number, reps: number): void {
    this.workoutsCompleted += 1;
    this.totalSetsCompleted += sets;
    this.totalRepsCompleted += reps;
    this.lastWorkoutPlan = planName;
  }

  public recordMealCompletion(type: string): void {
    this.mealsCompleted += 1;
    if (type === 'lunch') this.lunchCount += 1;
    else if (type === 'dinner') this.dinnerCount += 1;
    else if (type === 'midnight_order') this.midnightOrderCount += 1;
  }

  public recordMorningRoutineCompleted(): void {
    this.morningRoutinesCompleted += 1;
  }

  public recordLaundryCompleted(): void {
    this.laundryCompleted += 1;
  }

  public recordFamilyCallCompleted(simMinutes: number): void {
    this.familyCallsCompleted += 1;
    this.familyCallMinutes += Math.round(simMinutes);
  }

  public generateReport(
    clock: SimulationClockState,
    projectState: ProjectState,
    assignmentState: AssignmentState,
    workoutSession: WorkoutSession | null
  ): AnalyticsReport {
    const totalSimMinutes = Math.floor(clock.totalElapsedSimulatedSeconds / 60);
    const hasSufficientData = totalSimMinutes >= 5;

    // Convert activity time to minutes
    const activityMetrics: Record<string, ActivityMetricItem> = {};
    let totalCompletions = 0;
    let totalInterruptions = 0;

    Object.entries(this.activityTimeSec).forEach(([id, data]) => {
      activityMetrics[id] = {
        activityId: id,
        displayName: data.displayName,
        totalSimulatedMinutes: Math.round(data.seconds / 60),
        completionCount: data.completed,
        interruptionCount: data.interrupted,
      };
      totalCompletions += data.completed;
      totalInterruptions += data.interrupted;
    });

    // Convert location time to minutes
    const locationMetrics: Record<string, LocationMetricItem> = {};
    Object.entries(this.locationTimeSec).forEach(([id, data]) => {
      locationMetrics[id] = {
        locationId: id,
        locationName: data.name,
        totalSimulatedMinutes: Math.round(data.seconds / 60),
        visitCount: data.visits,
      };
    });

    // College behavior distribution in minutes
    const collegeDist: Record<string, number> = {};
    let totalCollegeSec = 0;
    Object.entries(this.collegeBehaviorSec).forEach(([sub, sec]) => {
      collegeDist[sub] = Math.round(sec / 60);
      totalCollegeSec += sec;
    });

    const totalEvents = totalCompletions + totalInterruptions;
    const overallCompletionRate = totalEvents > 0
      ? Math.round((totalCompletions / totalEvents) * 100)
      : 100;

    return {
      measuredTimeRange: {
        startDay: this.startDay,
        startTime: this.startTime,
        currentDay: clock.dayNumber,
        currentTime: clock.simulatedTime,
        totalElapsedSimMinutes: totalSimMinutes,
        totalElapsedRealSeconds: Math.round(clock.totalElapsedRealSeconds),
      },
      hasSufficientData,
      activityMetrics,
      locationMetrics,
      workoutStats: {
        workoutsCompleted: this.workoutsCompleted,
        totalSetsCompleted: this.totalSetsCompleted,
        totalRepsCompleted: this.totalRepsCompleted,
        lastPlanName: this.lastWorkoutPlan || workoutSession?.plan.name,
      },
      projectStats: {
        totalProgress: Math.round(projectState.totalProgress),
        completedSessions: projectState.completedSessions,
        projectName: projectState.currentProject,
      },
      assignmentStats: {
        progress: Math.round(assignmentState.progress),
        completedTasks: assignmentState.completedTasks,
        currentTask: assignmentState.currentTask,
      },
      mealStats: {
        mealsCompleted: this.mealsCompleted,
        lunchCount: this.lunchCount,
        dinnerCount: this.dinnerCount,
        midnightOrderCount: this.midnightOrderCount,
      },
      collegeStats: {
        totalSimulatedMinutes: Math.round(totalCollegeSec / 60),
        behaviorDistribution: collegeDist,
      },
      routineStats: {
        morningRoutinesCompleted: this.morningRoutinesCompleted,
        laundryCompleted: this.laundryCompleted,
        familyCallsCompleted: this.familyCallsCompleted,
        familyCallMinutes: this.familyCallMinutes,
      },
      needsTrends: [...this.needsSamples],
      overallCompletionRate,
    };
  }

  public reset(): void {
    this.activityTimeSec = {};
    this.initLocations();
    Object.keys(this.collegeBehaviorSec).forEach((k) => (this.collegeBehaviorSec[k] = 0));
    this.workoutsCompleted = 0;
    this.totalSetsCompleted = 0;
    this.totalRepsCompleted = 0;
    this.lastWorkoutPlan = '';
    this.mealsCompleted = 0;
    this.lunchCount = 0;
    this.dinnerCount = 0;
    this.midnightOrderCount = 0;
    this.morningRoutinesCompleted = 0;
    this.laundryCompleted = 0;
    this.familyCallsCompleted = 0;
    this.familyCallMinutes = 0;
    this.needsSamples = [];
    this.lastNeedsSampleSimSec = -1;
    this.lastLocation = '';
  }
}
