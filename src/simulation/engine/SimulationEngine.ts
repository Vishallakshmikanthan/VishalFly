import { 
  SimulationState, 
  SimulationSettings, 
  SimulationSpeed,
  CollegeSubBehavior,
  DayOfWeek,
  WorkoutType,
  MealType,
  NeedType
} from '../types/simulation';
import { FlyActivity } from '../../types';
import { DEFAULT_SIMULATION_SETTINGS } from '../config/defaults';
import { SimulationClock } from './SimulationClock';
import { SchedulePlanner } from '../planner/SchedulePlanner';
import { BehaviorSelector } from '../planner/BehaviorSelector';
import { ActivityManager } from '../activities/ActivityManager';
import { NeedsSystem } from '../needs/NeedsSystem';
import { EventLogger } from '../events/EventLogger';
import { WorkoutSystem } from '../systems/WorkoutSystem';
import { MealSystem } from '../systems/MealSystem';
import { ProjectSystem } from '../systems/ProjectSystem';
import { AssignmentSystem } from '../systems/AssignmentSystem';
import { LaundrySystem } from '../systems/LaundrySystem';
import { FoodOrderSystem } from '../systems/FoodOrderSystem';
import { FamilyCallSystem } from '../systems/FamilyCallSystem';
import { MorningRoutineSystem } from '../systems/MorningRoutineSystem';
import { SimulationPersistence } from '../persistence/SimulationPersistence';

export type SimulationStateListener = (state: SimulationState) => void;

export class SimulationEngine {
  public clock: SimulationClock;
  public planner: SchedulePlanner;
  public behaviorSelector: BehaviorSelector;
  public activityManager: ActivityManager;
  public needsSystem: NeedsSystem;
  public eventLogger: EventLogger;

  // Milestone 4 Daily Life Systems
  public workoutSystem: WorkoutSystem;
  public mealSystem: MealSystem;
  public projectSystem: ProjectSystem;
  public assignmentSystem: AssignmentSystem;
  public laundrySystem: LaundrySystem;
  public foodOrderSystem: FoodOrderSystem;
  public familyCallSystem: FamilyCallSystem;
  public morningRoutineSystem: MorningRoutineSystem;

  private isAutonomous: boolean = true;
  private currentSpot: string = 'Center Room Airspace';
  private currentWaypoint: string = 'center';
  private currentFlyActivity: FlyActivity = 'hovering';
  private selectedCollegeBehavior: CollegeSubBehavior | null = null;
  private lastHandledActivityId: string | null = null;

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

    // Initialize daily life sub-systems
    this.workoutSystem = new WorkoutSystem(this.eventLogger);
    this.mealSystem = new MealSystem(this.eventLogger);
    this.projectSystem = new ProjectSystem(this.eventLogger);
    this.assignmentSystem = new AssignmentSystem(this.eventLogger);
    this.laundrySystem = new LaundrySystem(this.eventLogger);
    this.foodOrderSystem = new FoodOrderSystem(this.eventLogger);
    this.familyCallSystem = new FamilyCallSystem(this.eventLogger);
    this.morningRoutineSystem = new MorningRoutineSystem(this.eventLogger);

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
    const deltaSimSec = tickResult.simulatedDeltaSeconds;

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

      // Reset day-specific routines
      this.morningRoutineSystem.reset();
      this.laundrySystem.reset();
      this.foodOrderSystem.reset();
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
      deltaSimSec,
      timestamp,
      clockState.dayNumber
    );

    const currentInstance = this.activityManager.getCurrentInstance();
    const actId = currentInstance?.definition.id;

    // Detect activity transition for sub-systems
    if (this.lastHandledActivityId !== actId) {
      // Activity switched - conclude previous activity systems if needed
      if (this.lastHandledActivityId === 'project_work') {
        this.projectSystem.endSession(timestamp, clockState.dayNumber);
      } else if (this.lastHandledActivityId === 'college_assignments') {
        this.assignmentSystem.endSession(timestamp, clockState.dayNumber);
      } else if (this.lastHandledActivityId === 'family_call_walk') {
        this.familyCallSystem.endCall(timestamp, clockState.dayNumber);
      }
      this.lastHandledActivityId = actId || null;
    }

    let defaultPose: FlyActivity = currentInstance 
      ? currentInstance.definition.defaultFlyActivity 
      : 'hovering';
    let activeActionLabel = currentInstance?.scheduleEntry.name || 'Idle';
    let progressVal = 0;

    // 4. Sub-System Updates based on Active Activity
    if (currentInstance && !this.activityManager.isTravelling()) {
      switch (actId) {
        // Morning Routine
        case 'wake_up_morning_routine': {
          if (this.morningRoutineSystem.getState().stage === 'idle') {
            this.morningRoutineSystem.startRoutine(timestamp, clockState.dayNumber);
          }
          const mr = this.morningRoutineSystem.update(deltaSimSec, timestamp, clockState.dayNumber);
          this.currentWaypoint = mr.currentWaypoint;
          defaultPose = mr.flyActivity as FlyActivity;
          progressVal = mr.state.progressPercent;
          activeActionLabel = `Morning Routine (${mr.state.stage.replace(/_/g, ' ')})`;
          break;
        }

        // College Activities & Variations
        case 'college_activities': {
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
          this.currentWaypoint = behaviorDetails.targetWaypoint;
          defaultPose = behaviorDetails.flyActivity;
          activeActionLabel = behaviorDetails.name;

          // Needs side-effects of college behavior variation
          if (behaviorDetails.behavior === 'dozing') {
            this.needsSystem.update(deltaSimSec, {
              energyPerHour: 2,
              hungerPerHour: 0,
              sleepinessPerHour: 6,
              fatiguePerHour: -2,
              focusPerHour: -8,
              socialNeedPerHour: 0,
            }, timestamp, clockState.dayNumber);
          } else if (behaviorDetails.behavior === 'laptop') {
            this.needsSystem.update(deltaSimSec, {
              energyPerHour: -2,
              hungerPerHour: 0,
              sleepinessPerHour: 0,
              fatiguePerHour: 0,
              focusPerHour: 12,
              socialNeedPerHour: 0,
            }, timestamp, clockState.dayNumber);
          } else if (behaviorDetails.behavior === 'reels') {
            this.needsSystem.update(deltaSimSec, {
              energyPerHour: 1,
              hungerPerHour: 0,
              sleepinessPerHour: 0,
              fatiguePerHour: -4,
              focusPerHour: -6,
              socialNeedPerHour: 0,
            }, timestamp, clockState.dayNumber);
          }
          break;
        }

        // Gym Workout
        case 'gym_workout': {
          let ws = this.workoutSystem.getCurrentSession();
          if (!ws || ws.isCompleted) {
            ws = this.workoutSystem.startWorkout(clockState.dayOfWeek, timestamp, clockState.dayNumber);
          }
          const updatedSession = this.workoutSystem.update(deltaSimSec, timestamp, clockState.dayNumber);
          if (updatedSession) {
            this.currentWaypoint = this.workoutSystem.getCurrentWaypoint();
            defaultPose = this.workoutSystem.getCurrentFlyActivity();
            progressVal = updatedSession.progressPercent;
            activeActionLabel = this.workoutSystem.getCurrentActionLabel();
          }
          break;
        }

        // Dinner / Lunch Meals
        case 'dinner':
        case 'lunch': {
          const mealType: MealType = actId === 'lunch' ? 'lunch' : 'dinner';
          let ms = this.mealSystem.getCurrentSession();
          if (!ms || ms.meal.type !== mealType || ms.isCompleted) {
            ms = this.mealSystem.startMeal(mealType, timestamp, clockState.dayNumber);
          }
          const mealRes = this.mealSystem.update(deltaSimSec, timestamp, clockState.dayNumber);
          if (mealRes.session) {
            progressVal = mealRes.session.progressPercent;
            activeActionLabel = `${mealRes.session.meal.name} (${mealRes.session.progressPercent}%)`;
            defaultPose = 'eating';
            this.currentWaypoint = 'dining_table_seat';

            // Apply direct meal effect deltas
            if (mealRes.hungerDelta !== 0 || mealRes.energyDelta !== 0) {
              const currentNeeds = this.needsSystem.getState();
              this.needsSystem.setState({
                ...currentNeeds,
                hunger: Math.max(0, currentNeeds.hunger + mealRes.hungerDelta),
                energy: Math.min(100, currentNeeds.energy + mealRes.energyDelta),
              });
            }
          }
          break;
        }

        // Family Call & Walking
        case 'family_call_walk': {
          const fcState = this.familyCallSystem.getState();
          if (!fcState.isActive && !fcState.isCompleted) {
            this.familyCallSystem.startCall(timestamp, clockState.dayNumber);
          }
          const fcRes = this.familyCallSystem.update(deltaSimSec);
          this.currentWaypoint = fcRes.currentWaypoint;
          defaultPose = 'phone_call';
          activeActionLabel = `Family Call (${Math.round(fcRes.state.callDurationSimMinutes)}m)`;

          if (fcRes.socialNeedDelta !== 0) {
            const currentNeeds = this.needsSystem.getState();
            this.needsSystem.setState({
              ...currentNeeds,
              socialNeed: Math.max(0, currentNeeds.socialNeed + fcRes.socialNeedDelta),
            });
          }
          break;
        }

        // Project Work
        case 'project_work': {
          if (!this.projectSystem.getState().isWorking) {
            this.projectSystem.startSession(timestamp, clockState.dayNumber);
          }
          const ps = this.projectSystem.update(deltaSimSec, this.needsSystem.getState(), timestamp, clockState.dayNumber);
          defaultPose = 'working';
          this.currentWaypoint = 'desk';
          progressVal = Math.round(ps.totalProgress);
          activeActionLabel = `Hacking ${ps.currentProject} (${Math.round(ps.totalProgress)}%)`;
          break;
        }

        // College Assignments
        case 'college_assignments': {
          if (!this.assignmentSystem.getState().isWorking) {
            this.assignmentSystem.startSession(timestamp, clockState.dayNumber);
          }
          const as = this.assignmentSystem.update(deltaSimSec, this.needsSystem.getState(), timestamp, clockState.dayNumber);
          defaultPose = 'working';
          this.currentWaypoint = 'desk';
          progressVal = Math.round(as.progress);
          activeActionLabel = `${as.currentTask} (${Math.round(as.progress)}%)`;
          break;
        }

        // Weekend Laundry
        case 'laundry': {
          if (this.laundrySystem.getState().stage === 'idle') {
            this.laundrySystem.startLaundry(timestamp, clockState.dayNumber);
          }
          const ls = this.laundrySystem.update(deltaSimSec, timestamp, clockState.dayNumber);
          defaultPose = 'laundry';
          this.currentWaypoint = 'wardrobe';
          progressVal = ls.progressPercent;
          activeActionLabel = `Washing Laundry (${ls.progressPercent}%)`;
          break;
        }

        // Balcony Clothes Drying
        case 'dry_clothes': {
          if (this.laundrySystem.getState().stage !== 'drying') {
            this.laundrySystem.startDrying(timestamp, clockState.dayNumber);
          }
          const ls = this.laundrySystem.update(deltaSimSec, timestamp, clockState.dayNumber);
          defaultPose = 'drying_clothes';
          this.currentWaypoint = 'clothesline';
          progressVal = ls.progressPercent;
          activeActionLabel = `Balcony Drying (${ls.progressPercent}%)`;
          break;
        }

        // Midnight Food Order
        case 'midnight_food_order': {
          if (this.foodOrderSystem.getState().stage === 'idle') {
            this.foodOrderSystem.triggerOrder(timestamp, clockState.dayNumber);
          }
          const foRes = this.foodOrderSystem.update(deltaSimSec, timestamp, clockState.dayNumber);
          progressVal = foRes.state.progressPercent;
          activeActionLabel = `Midnight Order: ${foRes.state.stage.replace(/_/g, ' ')}`;
          if (foRes.currentWaypoint) {
            this.currentWaypoint = foRes.currentWaypoint;
          }
          if (foRes.targetLocation && foRes.targetLocation !== this.activityManager.getCurrentLocation()) {
            this.activityManager.setCurrentLocation(foRes.targetLocation);
          }
          if (foRes.hungerDelta !== 0) {
            const currentNeeds = this.needsSystem.getState();
            this.needsSystem.setState({
              ...currentNeeds,
              hunger: Math.max(0, currentNeeds.hunger + foRes.hungerDelta),
            });
          }
          break;
        }

        default:
          if (currentInstance.definition.targetWaypoint) {
            this.currentWaypoint = currentInstance.definition.targetWaypoint;
          }
          break;
      }

      this.currentFlyActivity = defaultPose;
      this.activityManager.setProgress(progressVal, activeActionLabel);
    } else {
      this.selectedCollegeBehavior = null;
      if (this.activityManager.isTravelling()) {
        this.currentFlyActivity = 'flying';
        this.currentWaypoint = 'transit';
      }
    }

    // 5. Update Needs System Base Modifiers
    if (currentInstance && deltaSimSec > 0) {
      this.needsSystem.update(
        deltaSimSec,
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
        flyActivity: this.currentFlyActivity,
        position: [0, 1.8, 0],
        isAutonomous: this.isAutonomous,
        isTravelling: this.activityManager.isTravelling(),
      },
      needs: this.needsSystem.getState(),
      recentEvents: this.eventLogger.getRecent(20),
      settings: this.clock.getSettings(),
      workoutSession: this.workoutSystem.getCurrentSession(),
      projectState: this.projectSystem.getState(),
      assignmentState: this.assignmentSystem.getState(),
      mealSession: this.mealSystem.getCurrentSession(),
      laundryState: this.laundrySystem.getState(),
      foodOrderState: this.foodOrderSystem.getState(),
      familyCallState: this.familyCallSystem.getState(),
      morningRoutineState: this.morningRoutineSystem.getState(),
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
    this.workoutSystem.reset();
    this.mealSystem.reset();
    this.laundrySystem.reset();
    this.foodOrderSystem.reset();
    this.familyCallSystem.reset();
    this.morningRoutineSystem.reset();
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

  public getCurrentWaypoint(): string {
    return this.currentWaypoint;
  }

  public getCurrentFlyActivity(): FlyActivity {
    return this.currentFlyActivity;
  }

  // Developer Testing Controls (DevPanel API)
  public setTime(timeString: string): void {
    this.clock.setTime(timeString);
    this.evaluateSchedule();
    this.step(0);
  }

  public setDay(dayNumber: number, dayOfWeek?: DayOfWeek): void {
    this.clock.setDay(dayNumber, dayOfWeek);
    this.evaluateSchedule();
    this.step(0);
  }

  public triggerActivity(activityId: string, locationId?: string): void {
    const clock = this.clock.getState();
    const entry = {
      id: `dev_${activityId}_${Date.now()}`,
      activityId,
      name: activityId.replace(/_/g, ' ').toUpperCase(),
      startTime: clock.simulatedTime,
      endTime: '23:59',
      startMinutes: clock.currentMinutes,
      endMinutes: 1439,
      locationId: locationId || 'bedroom',
    };
    this.activityManager.syncScheduleEntry(
      entry,
      clock.currentMinutes,
      `Day ${clock.dayNumber} • ${clock.simulatedTime}`,
      clock.dayNumber
    );
    this.step(0);
  }

  public triggerWorkout(type?: WorkoutType): void {
    const clock = this.clock.getState();
    const plan = type ? this.workoutSystem.getPlanForDay(type as any) : null;
    this.activityManager.setCurrentLocation('gym');
    this.workoutSystem.startWorkout(
      plan || clock.dayOfWeek,
      `Day ${clock.dayNumber} • ${clock.simulatedTime}`,
      clock.dayNumber
    );
    this.triggerActivity('gym_workout', 'gym');
  }

  public triggerMeal(type: MealType = 'dinner'): void {
    const clock = this.clock.getState();
    this.activityManager.setCurrentLocation('dining');
    this.mealSystem.startMeal(
      type,
      `Day ${clock.dayNumber} • ${clock.simulatedTime}`,
      clock.dayNumber
    );
    this.triggerActivity(type === 'lunch' ? 'lunch' : 'dinner', 'dining');
  }

  public triggerFamilyCall(): void {
    const clock = this.clock.getState();
    this.activityManager.setCurrentLocation('grounds');
    this.familyCallSystem.startCall(
      `Day ${clock.dayNumber} • ${clock.simulatedTime}`,
      clock.dayNumber
    );
    this.triggerActivity('family_call_walk', 'grounds');
  }

  public triggerFoodOrder(): void {
    const clock = this.clock.getState();
    this.foodOrderSystem.triggerOrder(
      `Day ${clock.dayNumber} • ${clock.simulatedTime}`,
      clock.dayNumber
    );
    this.triggerActivity('midnight_food_order', 'bedroom');
  }

  public setNeed(need: NeedType, value: number): void {
    const state = this.needsSystem.getState();
    this.needsSystem.setState({
      ...state,
      [need]: Math.max(0, Math.min(100, value)),
    });
    this.step(0);
  }

  // Persistence methods
  public saveSimulation(): boolean {
    const clock = this.clock.getState();
    const needs = this.needsSystem.getState();
    const project = this.projectSystem.getState();
    const assignment = this.assignmentSystem.getState();
    const workout = this.workoutSystem.getCurrentSession();
    const events = this.eventLogger.getAll();

    const ok = SimulationPersistence.saveSimulation({
      clock,
      needs,
      project,
      assignment,
      workout,
      events,
    });

    if (ok) {
      this.eventLogger.log({
        timestamp: `Day ${clock.dayNumber} • ${clock.simulatedTime}`,
        dayNumber: clock.dayNumber,
        category: 'system',
        message: 'Simulation state successfully persisted to localStorage.',
      });
    }

    return ok;
  }

  public loadSimulation(): boolean {
    const saved = SimulationPersistence.loadSimulation();
    if (!saved) return false;

    this.clock.setDay(saved.clock.dayNumber, saved.clock.dayOfWeek as DayOfWeek);
    this.clock.setTime(saved.clock.simulatedTime);
    this.clock.setSpeed(saved.clock.speed as SimulationSpeed);
    this.needsSystem.setState(saved.needs);
    this.projectSystem.setState(saved.project);
    this.assignmentSystem.setState(saved.assignment);
    this.workoutSystem.setSession(saved.workout);

    this.evaluateSchedule();
    this.step(0);

    this.eventLogger.log({
      timestamp: `Day ${saved.clock.dayNumber} • ${saved.clock.simulatedTime}`,
      dayNumber: saved.clock.dayNumber,
      category: 'system',
      message: 'Simulation state restored from localStorage.',
    });

    return true;
  }

  public resetSimulation(): boolean {
    SimulationPersistence.resetSimulation();
    this.restartDay();
    return true;
  }

  public getState(): SimulationState {
    return this.step(0);
  }

  public subscribe(listener: SimulationStateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  private notifyListeners(state: SimulationState): void {
    this.stateListeners.forEach((listener) => listener(state));
  }
}
