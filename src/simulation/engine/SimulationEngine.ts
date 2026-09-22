import { 
  SimulationState, 
  SimulationSettings, 
  SimulationSpeed,
  CollegeSubBehavior
} from '../types/simulation';
import { DEFAULT_SIMULATION_SETTINGS } from '../config/defaults';
import { SimulationClock } from './SimulationClock';
import { SchedulePlanner } from '../planner/SchedulePlanner';
import { BehaviorSelector } from '../planner/BehaviorSelector';
import { ActivityManager } from '../activities/ActivityManager';
import { NeedsSystem } from '../needs/NeedsSystem';
import { EventLogger } from '../events/EventLogger';

export type SimulationStateListener = (state: SimulationState) => void;

export class SimulationEngine {
  public clock: SimulationClock;
  public planner: SchedulePlanner;
  public behaviorSelector: BehaviorSelector;
  public activityManager: ActivityManager;
  public needsSystem: NeedsSystem;
  public eventLogger: EventLogger;

  private isAutonomous: boolean = true;
  private currentSpot: string = 'Center Room Airspace';
  private selectedCollegeBehavior: CollegeSubBehavior | null = null;

  // Running loop state
  private timerId: ReturnType<typeof setInterval> | null = null;
  private lastRealTimestamp: number = 0;
  private stateListeners: Set<SimulationStateListener> = new Set();
  private lastDayNumber: number = 1;
  private lastDayType: string = 'weekday';

  constructor(customSettings?: Partial<SimulationSettings>) {
    const settings = { ...DEFAULT_SIMULATION_SETTINGS, ...customSettings };

    this.eventLogger = new EventLogger(settings.maxEventsInMemory);
    this.clock = new SimulationClock(settings);
    this.planner = new SchedulePlanner();
    this.behaviorSelector = new BehaviorSelector(
      undefined,
      settings.collegeBehaviorIntervalMinutes
    );
    this.activityManager = new ActivityManager(
      'bedroom',
      this.eventLogger,
      settings.travelDurationSeconds
    );
    this.needsSystem = new NeedsSystem(this.eventLogger);

    this.lastDayNumber = this.clock.getState().dayNumber;
    this.lastDayType = this.clock.getState().dayType;

    // Log initialization event
    this.eventLogger.log({
      timestamp: `Day ${this.lastDayNumber} • ${this.clock.getState().simulatedTime}`,
      dayNumber: this.lastDayNumber,
      category: 'system',
      message: `VishalFly simulation initialized (${this.lastDayType} schedule).`,
    });

    // Initial evaluation of current schedule
    this.evaluateSchedule();
  }

  /**
   * Deterministic step function: advances simulation by deltaRealSeconds.
   */
  public step(deltaRealSeconds: number): SimulationState {
    const tickResult = this.clock.tick(deltaRealSeconds);
    const clockState = this.clock.getState();
    const timestamp = `Day ${clockState.dayNumber} • ${clockState.simulatedTime}`;

    // 1. Check Day Rollover
    if (tickResult.dayRolledOver) {
      this.eventLogger.log({
        timestamp,
        dayNumber: clockState.dayNumber,
        category: 'lifecycle',
        message: `Day ${clockState.dayNumber} begins: ${clockState.dayOfWeek} (${clockState.dayType} schedule).`,
      });

      if (clockState.dayType === 'weekend' && this.lastDayType !== 'weekend') {
        this.eventLogger.log({
          timestamp,
          dayNumber: clockState.dayNumber,
          category: 'lifecycle',
          message: 'Weekend schedule activated! Relaxed morning routines enabled.',
        });
      }
      this.lastDayType = clockState.dayType;
      this.lastDayNumber = clockState.dayNumber;
    }

    // 2. Schedule Planner & Activity Sync
    const activeEntry = this.planner.getActiveEntry(
      clockState.currentMinutes,
      clockState.dayType
    );

    this.activityManager.syncScheduleEntry(
      activeEntry,
      clockState.currentMinutes,
      timestamp,
      clockState.dayNumber
    );

    // 3. Activity State Machine Update
    this.activityManager.update(
      tickResult.simulatedDeltaSeconds,
      timestamp,
      clockState.dayNumber
    );

    const currentInstance = this.activityManager.getCurrentInstance();

    // 4. College Sub-Behavior Variation
    if (
      currentInstance &&
      currentInstance.definition.id === 'college_activities' &&
      !this.activityManager.isTravelling()
    ) {
      const prevBehavior = this.selectedCollegeBehavior;
      const behaviorDetails = this.behaviorSelector.evaluateCollegeBehavior(
        clockState.currentMinutes
      );
      this.selectedCollegeBehavior = behaviorDetails.behavior;

      if (prevBehavior !== this.selectedCollegeBehavior) {
        this.eventLogger.log({
          timestamp,
          dayNumber: clockState.dayNumber,
          category: 'behavior',
          message: `College variation: ${behaviorDetails.name}`,
          activityId: currentInstance.definition.id,
          locationId: currentInstance.targetLocation,
        });
      }

      currentInstance.selectedSubBehavior = this.selectedCollegeBehavior;
      this.currentSpot = behaviorDetails.targetLandmark;
    } else {
      this.selectedCollegeBehavior = null;
      if (currentInstance?.definition.targetLandmarkName) {
        this.currentSpot = currentInstance.definition.targetLandmarkName;
      }
    }

    // 5. Update Needs System
    if (currentInstance) {
      this.needsSystem.update(
        tickResult.simulatedDeltaSeconds,
        currentInstance.definition.needsModifiers,
        timestamp,
        clockState.dayNumber
      );
    }

    // 6. Next Activity Info
    const nextActivityInfo = this.planner.getNextActivityStart(
      clockState.currentMinutes,
      clockState.dayType
    );

    // 7. Compose State Snapshot
    const state: SimulationState = {
      clock: clockState,
      currentActivity: currentInstance,
      nextActivity: {
        entry: nextActivityInfo.entry,
        startTime: nextActivityInfo.timeString,
        startMinutes: nextActivityInfo.timeMinutes,
      },
      character: {
        locationId: this.activityManager.getCurrentLocation(),
        currentSpot: this.currentSpot,
        flyActivity: currentInstance ? currentInstance.definition.defaultFlyActivity : 'hovering',
        position: [0, 1.8, 0],
        isAutonomous: this.isAutonomous,
        isTravelling: this.activityManager.isTravelling(),
      },
      needs: this.needsSystem.getState(),
      recentEvents: this.eventLogger.getRecent(20),
      settings: this.clock.getSettings(),
    };

    // Emit to listeners
    this.notifyListeners(state);

    return state;
  }

  private evaluateSchedule(): void {
    const clockState = this.clock.getState();
    const timestamp = `Day ${clockState.dayNumber} • ${clockState.simulatedTime}`;
    const activeEntry = this.planner.getActiveEntry(
      clockState.currentMinutes,
      clockState.dayType
    );
    this.activityManager.syncScheduleEntry(
      activeEntry,
      clockState.currentMinutes,
      timestamp,
      clockState.dayNumber
    );
  }

  public start(tickRateHz: number = 20): void {
    if (this.timerId) return;

    this.lastRealTimestamp = performance.now();
    const intervalMs = Math.floor(1000 / tickRateHz);

    this.timerId = setInterval(() => {
      const now = performance.now();
      const deltaRealSeconds = Math.min((now - this.lastRealTimestamp) / 1000, 0.25);
      this.lastRealTimestamp = now;

      this.step(deltaRealSeconds);
    }, intervalMs);
  }

  public stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public pause(): void {
    this.clock.pause();
    this.eventLogger.log({
      timestamp: `Day ${this.clock.getState().dayNumber} • ${this.clock.getState().simulatedTime}`,
      dayNumber: this.clock.getState().dayNumber,
      category: 'system',
      message: 'Simulation paused.',
    });
  }

  public resume(): void {
    this.clock.resume();
    this.eventLogger.log({
      timestamp: `Day ${this.clock.getState().dayNumber} • ${this.clock.getState().simulatedTime}`,
      dayNumber: this.clock.getState().dayNumber,
      category: 'system',
      message: 'Simulation resumed.',
    });
  }

  public togglePause(): boolean {
    const isPaused = this.clock.togglePause();
    this.eventLogger.log({
      timestamp: `Day ${this.clock.getState().dayNumber} • ${this.clock.getState().simulatedTime}`,
      dayNumber: this.clock.getState().dayNumber,
      category: 'system',
      message: isPaused ? 'Simulation paused.' : 'Simulation resumed.',
    });
    return isPaused;
  }

  public setSpeed(speed: SimulationSpeed): void {
    this.clock.setSpeed(speed);
    this.eventLogger.log({
      timestamp: `Day ${this.clock.getState().dayNumber} • ${this.clock.getState().simulatedTime}`,
      dayNumber: this.clock.getState().dayNumber,
      category: 'system',
      message: `Simulation speed set to ${speed}x.`,
    });
  }

  public restartDay(): void {
    this.clock.restartDay();
    this.activityManager.reset();
    this.behaviorSelector.reset();
    this.evaluateSchedule();

    this.eventLogger.log({
      timestamp: `Day ${this.clock.getState().dayNumber} • ${this.clock.getState().simulatedTime}`,
      dayNumber: this.clock.getState().dayNumber,
      category: 'system',
      message: `Restarted current day (${this.clock.getState().dayOfWeek}).`,
    });
  }

  public setIsAutonomous(isAuto: boolean): void {
    this.isAutonomous = isAuto;
  }

  public getIsAutonomous(): boolean {
    return this.isAutonomous;
  }

  public subscribe(listener: SimulationStateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  private notifyListeners(state: SimulationState): void {
    this.stateListeners.forEach((listener) => listener(state));
  }
}
