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
import { CognitiveEngine } from '../../cognition/CognitiveEngine';
import { CognitiveInspectorData } from '../../cognition/debug/CognitiveInspectorState';
import { SnapshotRecorder } from '../replay/SnapshotRecorder';
import { ReplayEngine } from '../replay/ReplayEngine';
import { AnalyticsTracker } from '../analytics/AnalyticsTracker';
import { AnalyticsReport } from '../analytics/AnalyticsTypes';
import { LOCATIONS } from '../../navigation/locationGraph';
import { LocationId } from '../../types';
import { WorldEventSystem } from '../events/WorldEventSystem';
import { 
  WorldEventCategory, 
  WorldEventTelemetry, 
  AggregateWorldEffects, 
  WorldEventEvaluationContext 
} from '../events/WorldEventTypes';

export type SimulationStateListener = (state: SimulationState) => void;

export class SimulationEngine {
  public clock: SimulationClock;
  public planner: SchedulePlanner;
  public behaviorSelector: BehaviorSelector;
  public activityManager: ActivityManager;
  public needsSystem: NeedsSystem;
  public eventLogger: EventLogger;

  // Milestone 5 Living World Event System
  public worldEventSystem: WorldEventSystem;
  private activeWorldEffects: AggregateWorldEffects;

  // Milestone 4 Daily Life Systems
  public workoutSystem: WorkoutSystem;
  public mealSystem: MealSystem;
  public projectSystem: ProjectSystem;
  public assignmentSystem: AssignmentSystem;
  public laundrySystem: LaundrySystem;
  public foodOrderSystem: FoodOrderSystem;
  public familyCallSystem: FamilyCallSystem;
  public morningRoutineSystem: MorningRoutineSystem;
  public cognitiveEngine: CognitiveEngine;

  // Milestone 8 Replay & Analytics Systems
  public snapshotRecorder: SnapshotRecorder;
  public replayEngine: ReplayEngine;
  public analyticsTracker: AnalyticsTracker;

  private isAutonomous: boolean = true;
  private currentSpot: string = 'Center Room Airspace';
  private currentWaypoint: string = 'center';
  private currentFlyActivity: FlyActivity = 'hovering';
  private selectedCollegeBehavior: CollegeSubBehavior | null = null;
  private lastHandledActivityId: string | null = null;
  private recordedSubsystemCompletions: Set<string> = new Set();

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
      settings.travelDurationSeconds,
      {
        onActivityCompleted: (instance, timestamp, dayNumber) => {
          this.analyticsTracker.recordActivityCompletion(
            instance.definition.id, 
            instance.scheduleEntry.name
          );
          this.cognitiveEngine.recordConfirmedOutcome({
            eventType: `${instance.definition.id}_completed`,
            key: instance.definition.id,
            value: `Completed ${instance.scheduleEntry.name}`,
            location: (instance.targetLocation || this.activityManager.getCurrentLocation()) as any,
            outcome: 'completed',
            tags: ['activity', instance.definition.id, 'completed'],
            timestamp,
            simulatedMinutes: this.clock.getState().currentMinutes,
            dayNumber,
          });
        },
        onActivityInterrupted: (instance, timestamp, dayNumber) => {
          this.analyticsTracker.recordActivityInterruption(
            instance.definition.id, 
            instance.scheduleEntry.name
          );
          this.cognitiveEngine.recordConfirmedOutcome({
            eventType: `${instance.definition.id}_interrupted`,
            key: instance.definition.id,
            value: `Interrupted ${instance.scheduleEntry.name}`,
            location: (instance.targetLocation || this.activityManager.getCurrentLocation()) as any,
            outcome: 'interrupted',
            tags: ['activity', instance.definition.id, 'interrupted'],
            timestamp,
            simulatedMinutes: this.clock.getState().currentMinutes,
            dayNumber,
          });
        },
      }
    );
    this.needsSystem = new NeedsSystem(this.eventLogger);
    this.cognitiveEngine = new CognitiveEngine(
      this.activityManager,
      this.eventLogger,
      undefined,
      this.needsSystem.getState()
    );

    // Initialize daily life sub-systems
    this.workoutSystem = new WorkoutSystem(this.eventLogger);
    this.mealSystem = new MealSystem(this.eventLogger);
    this.projectSystem = new ProjectSystem(this.eventLogger);
    this.assignmentSystem = new AssignmentSystem(this.eventLogger);
    this.laundrySystem = new LaundrySystem(this.eventLogger);
    this.foodOrderSystem = new FoodOrderSystem(this.eventLogger);
    this.familyCallSystem = new FamilyCallSystem(this.eventLogger);
    this.morningRoutineSystem = new MorningRoutineSystem(this.eventLogger);

    // Initialize Milestone 8 Replay & Analytics
    this.snapshotRecorder = new SnapshotRecorder();
    this.replayEngine = new ReplayEngine(this.snapshotRecorder);
    this.analyticsTracker = new AnalyticsTracker();

    // Initialize Milestone 5 Living World Event System
    this.worldEventSystem = new WorldEventSystem(
      this.eventLogger,
      {
        deterministicSeed: settings.worldEventSeed ?? 42,
        isMasterEnabled: settings.enableLivingWorld ?? true,
      },
      undefined,
      {
        onInstantNeedDelta: (delta) => {
          const cur = this.needsSystem.getState();
          this.needsSystem.setState({
            ...cur,
            energy: Math.max(0, Math.min(100, cur.energy + (delta.energy ?? 0))),
            hunger: Math.max(0, Math.min(100, cur.hunger + (delta.hunger ?? 0))),
            sleepiness: Math.max(0, Math.min(100, cur.sleepiness + (delta.sleepiness ?? 0))),
            fatigue: Math.max(0, Math.min(100, cur.fatigue + (delta.fatigue ?? 0))),
            focus: Math.max(0, Math.min(100, cur.focus + (delta.focus ?? 0))),
            socialNeed: Math.max(0, Math.min(100, cur.socialNeed + (delta.socialNeed ?? 0))),
          });
        },
      }
    );
    this.activeWorldEffects = this.worldEventSystem.aggregateActiveEffects();

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
      this.recordedSubsystemCompletions.clear();
    }

    // 1b. Living World Event System Update
    const worldContext: WorldEventEvaluationContext = {
      clock: clockState,
      currentLocationId: (this.activityManager.getCurrentLocation() || 'bedroom') as LocationId,
      needs: this.needsSystem.getState(),
      activeActivityId: this.activityManager.getCurrentInstance()?.definition.id,
      isAutonomous: this.isAutonomous,
      isTravelling: this.activityManager.isTravelling(),
      hungerLevel: this.needsSystem.getState().hunger,
    };
    this.activeWorldEffects = this.worldEventSystem.update(deltaSimSec, worldContext);

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
        this.cognitiveEngine.recordConfirmedOutcome({
          eventType: 'project_work_completed',
          key: 'work_project',
          value: 'Completed VishalFly project sprint',
          location: 'bedroom',
          outcome: 'completed',
          tags: ['project', 'work', 'focus'],
          sourceBehaviorId: 'work_project',
          timestamp,
          simulatedMinutes: clockState.currentMinutes,
          dayNumber: clockState.dayNumber,
        });
      } else if (this.lastHandledActivityId === 'college_assignments') {
        this.assignmentSystem.endSession(timestamp, clockState.dayNumber);
        this.cognitiveEngine.recordConfirmedOutcome({
          eventType: 'assignment_completed',
          key: 'work_assignment',
          value: 'Completed college assignment sprint',
          location: 'bedroom',
          outcome: 'completed',
          tags: ['assignment', 'study', 'academic'],
          sourceBehaviorId: 'work_assignment',
          timestamp,
          simulatedMinutes: clockState.currentMinutes,
          dayNumber: clockState.dayNumber,
        });
      } else if (this.lastHandledActivityId === 'family_call_walk') {
        this.familyCallSystem.endCall(timestamp, clockState.dayNumber);
        this.cognitiveEngine.recordConfirmedOutcome({
          eventType: 'family_call_finished',
          key: 'family_call_walk',
          value: 'Completed evening family call walk',
          location: 'grounds',
          outcome: 'completed',
          tags: ['family_call', 'social', 'walk'],
          sourceBehaviorId: 'family_call_walk',
          timestamp,
          simulatedMinutes: clockState.currentMinutes,
          dayNumber: clockState.dayNumber,
        });
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

          if (mr.state.isCompleted) {
            const mrKey = `morning_${clockState.dayNumber}`;
            if (!this.recordedSubsystemCompletions.has(mrKey)) {
              this.recordedSubsystemCompletions.add(mrKey);
              this.analyticsTracker.recordMorningRoutineCompleted();
              this.cognitiveEngine.recordConfirmedOutcome({
                eventType: 'morning_routine_completed',
                key: 'wake_up_morning_routine',
                value: 'Completed morning routine and preparation',
                location: 'bedroom',
                outcome: 'completed',
                tags: ['morning_routine', 'routine'],
                sourceBehaviorId: 'wake_up_morning_routine',
                timestamp,
                simulatedMinutes: clockState.currentMinutes,
                dayNumber: clockState.dayNumber,
              });
            }
          }
          break;
        }

        // College Activities & Variations
        case 'college_activities': {
          let behaviorKey: CollegeSubBehavior = 'lecture';
          let behaviorName = 'Listening to Lecture';
          let landmark = 'Front Row Student Desks';
          let waypoint = 'student_desk_front';
          let pose: FlyActivity = 'sitting';

          if (this.cognitiveEngine.getIsCognitionEnabled()) {
            const cogResult = this.cognitiveEngine.step({
              clock: clockState,
              character: {
                locationId: this.activityManager.getCurrentLocation(),
                currentSpot: this.currentSpot,
                flyActivity: this.currentFlyActivity,
                position: [0, 1.8, 0],
                isAutonomous: this.isAutonomous,
                isTravelling: this.activityManager.isTravelling(),
              },
              currentActivity: currentInstance,
              activeScheduleEntry: activeEntry,
              needs: this.needsSystem.getState(),
              workoutSession: this.workoutSystem.getCurrentSession(),
              mealSession: this.mealSystem.getCurrentSession(),
              projectState: this.projectSystem.getState(),
              assignmentState: this.assignmentSystem.getState(),
              familyCallState: this.familyCallSystem.getState(),
              laundryState: this.laundrySystem.getState(),
              currentWaypoint: this.currentWaypoint,
              deltaSimSeconds: deltaSimSec,
            });

            if (cogResult.decision?.actionRequest.collegeSubBehavior) {
              behaviorKey = cogResult.decision.actionRequest.collegeSubBehavior;
              behaviorName = cogResult.decision.actionRequest.actionLabel || cogResult.decision.selectedCandidateName;
              if (cogResult.appliedWaypoint) waypoint = cogResult.appliedWaypoint;
              if (cogResult.appliedFlyActivity) pose = cogResult.appliedFlyActivity;
            }
          } else {
            const behaviorDetails = this.behaviorSelector.evaluateCollegeBehavior(
              clockState.currentMinutes
            );
            behaviorKey = behaviorDetails.behavior;
            behaviorName = behaviorDetails.name;
            landmark = behaviorDetails.targetLandmark;
            waypoint = behaviorDetails.targetWaypoint;
            pose = behaviorDetails.flyActivity;
          }

          const prevBehavior = this.selectedCollegeBehavior;
          this.selectedCollegeBehavior = behaviorKey;

          if (prevBehavior !== this.selectedCollegeBehavior) {
            this.eventLogger.log({
              timestamp,
              dayNumber: clockState.dayNumber,
              category: 'behavior',
              message: `College variation: ${behaviorName}`,
              activityId: currentInstance.definition.id,
              locationId: currentInstance.targetLocation,
            });
          }

          currentInstance.selectedSubBehavior = this.selectedCollegeBehavior;
          this.currentSpot = landmark;
          this.currentWaypoint = waypoint;
          defaultPose = pose;
          activeActionLabel = behaviorName;

          // Needs side-effects of college behavior variation
          if (behaviorKey === 'dozing') {
            this.needsSystem.update(deltaSimSec, {
              energyPerHour: 2,
              hungerPerHour: 0,
              sleepinessPerHour: 6,
              fatiguePerHour: -2,
              focusPerHour: -8,
              socialNeedPerHour: 0,
            }, timestamp, clockState.dayNumber);
          } else if (behaviorKey === 'laptop') {
            this.needsSystem.update(deltaSimSec, {
              energyPerHour: -2,
              hungerPerHour: 0,
              sleepinessPerHour: 0,
              fatiguePerHour: 0,
              focusPerHour: 12,
              socialNeedPerHour: 0,
            }, timestamp, clockState.dayNumber);
          } else if (behaviorKey === 'reels') {
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

            if (updatedSession.isCompleted || updatedSession.state === 'COMPLETE') {
              const wsKey = `workout_${clockState.dayNumber}_${updatedSession.plan.id}`;
              if (!this.recordedSubsystemCompletions.has(wsKey)) {
                this.recordedSubsystemCompletions.add(wsKey);
                this.analyticsTracker.recordWorkoutCompletion(
                  updatedSession.plan.name, 
                  updatedSession.currentSet, 
                  updatedSession.currentReps
                );
                this.cognitiveEngine.recordConfirmedOutcome({
                  eventType: 'workout_finished',
                  key: 'perform_workout',
                  value: `Finished ${updatedSession.plan.name} (${updatedSession.currentSet} sets)`,
                  location: 'gym',
                  outcome: 'completed',
                  tags: ['workout', 'gym', 'health'],
                  sourceBehaviorId: 'perform_workout',
                  timestamp,
                  simulatedMinutes: clockState.currentMinutes,
                  dayNumber: clockState.dayNumber,
                });
              }
            }
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

            if (mealRes.session.isCompleted) {
              const mealKey = `meal_${clockState.dayNumber}_${mealType}`;
              if (!this.recordedSubsystemCompletions.has(mealKey)) {
                this.recordedSubsystemCompletions.add(mealKey);
                this.analyticsTracker.recordMealCompletion(mealType);
                this.cognitiveEngine.recordConfirmedOutcome({
                  eventType: 'meal_completed',
                  key: 'eat_meal',
                  value: `Finished ${mealRes.session.meal.name}`,
                  location: 'dining',
                  outcome: 'completed',
                  tags: ['meal', 'sustenance', mealType],
                  sourceBehaviorId: 'eat_meal',
                  timestamp,
                  simulatedMinutes: clockState.currentMinutes,
                  dayNumber: clockState.dayNumber,
                });
              }
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
          defaultPose = ls.flyActivity || 'laundry';
          if (ls.currentWaypoint) this.currentWaypoint = ls.currentWaypoint;
          progressVal = ls.progressPercent;
          activeActionLabel = `Laundry: ${ls.stage.replace(/_/g, ' ')} (${ls.progressPercent}%)`;

          if (ls.targetLocation && ls.targetLocation !== this.activityManager.getCurrentLocation() && !this.activityManager.isTravelling()) {
            this.activityManager.initiateTravel(ls.targetLocation, `Moving to ${ls.targetLocation} for laundry`, timestamp, clockState.dayNumber);
          }

          if (ls.isCompleted) {
            const laundryKey = `laundry_${clockState.dayNumber}_wash`;
            if (!this.recordedSubsystemCompletions.has(laundryKey)) {
              this.recordedSubsystemCompletions.add(laundryKey);
              this.analyticsTracker.recordLaundryCompleted();
              this.cognitiveEngine.recordConfirmedOutcome({
                eventType: 'laundry_completed',
                key: 'perform_laundry',
                value: 'Completed washing laundry clothes',
                location: 'bedroom',
                outcome: 'completed',
                tags: ['laundry', 'routine'],
                sourceBehaviorId: 'perform_laundry',
                timestamp,
                simulatedMinutes: clockState.currentMinutes,
                dayNumber: clockState.dayNumber,
              });
            }
          }
          break;
        }

        // Balcony Clothes Drying
        case 'dry_clothes': {
          if (this.laundrySystem.getState().stage !== 'drying' && this.laundrySystem.getState().stage !== 'hanging_clothes') {
            this.laundrySystem.startDrying(timestamp, clockState.dayNumber);
          }
          const ls = this.laundrySystem.update(deltaSimSec, timestamp, clockState.dayNumber);
          defaultPose = ls.flyActivity || 'drying_clothes';
          if (ls.currentWaypoint) this.currentWaypoint = ls.currentWaypoint;
          progressVal = ls.progressPercent;
          activeActionLabel = `Balcony Drying: ${ls.stage.replace(/_/g, ' ')} (${ls.progressPercent}%)`;

          if (ls.targetLocation && ls.targetLocation !== this.activityManager.getCurrentLocation() && !this.activityManager.isTravelling()) {
            this.activityManager.initiateTravel(ls.targetLocation, `Moving to ${ls.targetLocation} for clothes drying`, timestamp, clockState.dayNumber);
          }

          if (ls.isCompleted) {
            const laundryKey = `laundry_${clockState.dayNumber}_drying`;
            if (!this.recordedSubsystemCompletions.has(laundryKey)) {
              this.recordedSubsystemCompletions.add(laundryKey);
              this.cognitiveEngine.recordConfirmedOutcome({
                eventType: 'laundry_completed',
                key: 'perform_laundry',
                value: 'Completed balcony clothes drying',
                location: 'balcony',
                outcome: 'completed',
                tags: ['laundry', 'routine'],
                sourceBehaviorId: 'perform_laundry',
                timestamp,
                simulatedMinutes: clockState.currentMinutes,
                dayNumber: clockState.dayNumber,
              });
            }
          }
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
          if (foRes.targetLocation && foRes.targetLocation !== this.activityManager.getCurrentLocation() && !this.activityManager.isTravelling()) {
            this.activityManager.initiateTravel(foRes.targetLocation, `Walking to ${foRes.targetLocation} for food collection`, timestamp, clockState.dayNumber);
          }
          if (foRes.hungerDelta !== 0) {
            const currentNeeds = this.needsSystem.getState();
            this.needsSystem.setState({
              ...currentNeeds,
              hunger: Math.max(0, currentNeeds.hunger + foRes.hungerDelta),
            });
          }

          if (foRes.state.stage === 'eating' || foRes.state.stage === 'completed' || foRes.state.isCompleted) {
            const foodKey = `food_order_${clockState.dayNumber}`;
            if (!this.recordedSubsystemCompletions.has(foodKey)) {
              this.recordedSubsystemCompletions.add(foodKey);
              this.analyticsTracker.recordMealCompletion('midnight_order');
              this.cognitiveEngine.recordConfirmedOutcome({
                eventType: 'food_collected',
                key: 'midnight_food_order',
                value: 'Collected midnight food delivery order',
                location: 'bedroom',
                outcome: 'completed',
                tags: ['food_order', 'meal', 'midnight_snack'],
                sourceBehaviorId: 'midnight_food_order',
                timestamp,
                simulatedMinutes: clockState.currentMinutes,
                dayNumber: clockState.dayNumber,
              });
            }
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

    // 5. Update Needs System Base Modifiers & World Event Modifiers
    if (deltaSimSec > 0) {
      const baseMods = currentInstance ? currentInstance.definition.needsModifiers : {
        energyPerHour: -1,
        hungerPerHour: 3,
        sleepinessPerHour: 2,
        fatiguePerHour: 0,
        focusPerHour: 0,
        socialNeedPerHour: 1,
      };
      const combinedMods = {
        energyPerHour: baseMods.energyPerHour + (this.activeWorldEffects?.needsDeltaPerHour?.energyPerHour ?? 0),
        hungerPerHour: baseMods.hungerPerHour + (this.activeWorldEffects?.needsDeltaPerHour?.hungerPerHour ?? 0),
        sleepinessPerHour: baseMods.sleepinessPerHour + (this.activeWorldEffects?.needsDeltaPerHour?.sleepinessPerHour ?? 0),
        fatiguePerHour: baseMods.fatiguePerHour + (this.activeWorldEffects?.needsDeltaPerHour?.fatiguePerHour ?? 0),
        focusPerHour: baseMods.focusPerHour + (this.activeWorldEffects?.needsDeltaPerHour?.focusPerHour ?? 0),
        socialNeedPerHour: baseMods.socialNeedPerHour + (this.activeWorldEffects?.needsDeltaPerHour?.socialNeedPerHour ?? 0),
      };
      this.needsSystem.update(
        deltaSimSec,
        combinedMods,
        timestamp,
        clockState.dayNumber
      );
    }

    // 6. Step Cognitive Engine (for non-college activities or general memory/state tracking)
    if (actId !== 'college_activities') {
      this.cognitiveEngine.step({
        clock: clockState,
        character: {
          locationId: this.activityManager.getCurrentLocation(),
          currentSpot: this.currentSpot,
          flyActivity: this.currentFlyActivity,
          position: [0, 1.8, 0],
          isAutonomous: this.isAutonomous,
          isTravelling: this.activityManager.isTravelling(),
        },
        currentActivity: currentInstance,
        activeScheduleEntry: activeEntry,
        needs: this.needsSystem.getState(),
        workoutSession: this.workoutSystem.getCurrentSession(),
        mealSession: this.mealSystem.getCurrentSession(),
        projectState: this.projectSystem.getState(),
        assignmentState: this.assignmentSystem.getState(),
        familyCallState: this.familyCallSystem.getState(),
        laundryState: this.laundrySystem.getState(),
        currentWaypoint: this.currentWaypoint,
        deltaSimSeconds: deltaSimSec,
        worldEffects: this.activeWorldEffects,
      });
    }

    // 7. Next Activity Info
    const nextActivityInfo = this.planner.getNextActivityStart(
      clockState.currentMinutes,
      clockState.dayType
    );

    // 8. Compose State Snapshot
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
      cognitive: this.cognitiveEngine.getInspectorData(currentInstance?.scheduleEntry.name || 'Idle'),
      livingWorld: this.worldEventSystem.getTelemetry(),
    };

    // 9. Track Analytics & Record Historical Snapshot
    this.analyticsTracker.trackStep({
      deltaSimSec,
      clock: clockState,
      locationId: this.activityManager.getCurrentLocation(),
      currentActivity: currentInstance,
      needs: this.needsSystem.getState(),
      workoutSession: this.workoutSystem.getCurrentSession(),
      projectState: this.projectSystem.getState(),
      assignmentState: this.assignmentSystem.getState(),
      mealSession: this.mealSystem.getCurrentSession(),
      familyCallState: this.familyCallSystem.getState(),
    });

    const currentLocId = this.activityManager.getCurrentLocation() as LocationId;
    const currentLocConfig = LOCATIONS[currentLocId] || LOCATIONS.bedroom;
    const isTransitionMilestone = this.lastHandledActivityId !== actId || tickResult.dayRolledOver;

    this.snapshotRecorder.record({
      timestamp,
      simulatedSeconds: clockState.totalElapsedSimulatedSeconds,
      currentMinutes: clockState.currentMinutes,
      dayNumber: clockState.dayNumber,
      dayOfWeek: clockState.dayOfWeek,
      locationId: currentLocId,
      locationName: currentLocConfig.name,
      currentSpot: this.currentSpot,
      currentWaypoint: this.currentWaypoint,
      flyActivity: this.currentFlyActivity,
      flyPosition: [...currentLocConfig.spawnPosition],
      currentActivity: currentInstance ? {
        id: currentInstance.definition.id,
        name: currentInstance.scheduleEntry.name,
        progressPercent: progressVal,
        actionLabel: activeActionLabel,
        state: currentInstance.state,
        subBehavior: this.selectedCollegeBehavior || undefined,
      } : null,
      needs: { ...this.needsSystem.getState() },
      workoutSummary: this.workoutSystem.getCurrentSession() ? {
        planName: this.workoutSystem.getCurrentSession()!.plan.name,
        exerciseName: this.workoutSystem.getCurrentSession()!.plan.exercises[this.workoutSystem.getCurrentSession()!.currentExerciseIndex]?.name || 'Exercise',
        set: this.workoutSystem.getCurrentSession()!.currentSet,
        totalSets: this.workoutSystem.getCurrentSession()!.plan.exercises[this.workoutSystem.getCurrentSession()!.currentExerciseIndex]?.sets || 3,
        reps: this.workoutSystem.getCurrentSession()!.currentReps,
        state: this.workoutSystem.getCurrentSession()!.state,
      } : null,
      projectSummary: {
        currentProject: this.projectSystem.getState().currentProject,
        progress: Math.round(this.projectSystem.getState().totalProgress),
        sessions: this.projectSystem.getState().completedSessions,
      },
      assignmentSummary: {
        task: this.assignmentSystem.getState().currentTask,
        progress: Math.round(this.assignmentSystem.getState().progress),
      },
      mealSummary: this.mealSystem.getCurrentSession() ? {
        name: this.mealSystem.getCurrentSession()!.meal.name,
        hungerReduction: this.mealSystem.getCurrentSession()!.meal.hungerReductionTotal,
      } : null,
      cognitiveSummary: this.cognitiveEngine.getIsCognitionEnabled() ? {
        goal: currentInstance?.scheduleEntry.name || 'Idle',
        selectedBehavior: activeActionLabel,
      } : null,
    }, isTransitionMilestone);

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
    this.recordedSubsystemCompletions.clear();
    this.cognitiveEngine.internalStateManager.reset(this.needsSystem.getState());
    this.cognitiveEngine.memory.clear();
    this.analyticsTracker.reset();
    this.snapshotRecorder.clear();
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
    const cognitive = this.cognitiveEngine.serialize();

    const ok = SimulationPersistence.saveSimulation({
      clock,
      needs,
      project,
      assignment,
      workout,
      events,
      cognitive,
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

    if (saved.cognitive) {
      this.cognitiveEngine.deserialize(saved.cognitive);
    }

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

  public getCognitiveEngine(): CognitiveEngine {
    return this.cognitiveEngine;
  }

  public setCognitionEnabled(enabled: boolean): void {
    this.cognitiveEngine.setCognitionEnabled(enabled);
    this.step(0);
  }

  public setMemoryInfluenceEnabled(enabled: boolean): void {
    this.cognitiveEngine.setMemoryInfluenceEnabled(enabled);
    this.step(0);
  }

  public setAdaptationEnabled(enabled: boolean): void {
    this.cognitiveEngine.setAdaptationEnabled(enabled);
    this.step(0);
  }

  public clearCognitiveMemory(): void {
    this.cognitiveEngine.clearMemory();
    this.step(0);
  }

  public resetAdaptationDefaults(): void {
    this.cognitiveEngine.resetAdaptationDefaults();
    this.step(0);
  }

  public getCognitiveInspectorState(): CognitiveInspectorData {
    return this.cognitiveEngine.getInspectorData(
      this.activityManager.getCurrentInstance()?.scheduleEntry.name || 'Idle'
    );
  }

  public getAnalyticsReport(): AnalyticsReport {
    return this.analyticsTracker.generateReport(
      this.clock.getState(),
      this.projectSystem.getState(),
      this.assignmentSystem.getState(),
      this.workoutSystem.getCurrentSession()
    );
  }

  public getReplayEngine(): ReplayEngine {
    return this.replayEngine;
  }

  public getSnapshotRecorder(): SnapshotRecorder {
    return this.snapshotRecorder;
  }

  // Milestone 5 Living World Public Methods
  public triggerWorldEvent(eventId: string): boolean {
    const worldContext: WorldEventEvaluationContext = {
      clock: this.clock.getState(),
      currentLocationId: (this.activityManager.getCurrentLocation() || 'bedroom') as LocationId,
      needs: this.needsSystem.getState(),
      activeActivityId: this.activityManager.getCurrentInstance()?.definition.id,
      isAutonomous: this.isAutonomous,
      isTravelling: this.activityManager.isTravelling(),
      hungerLevel: this.needsSystem.getState().hunger,
    };
    const res = this.worldEventSystem.triggerEvent(eventId, worldContext);
    if (res) {
      this.step(0);
    }
    return res;
  }

  public setWorldEventCategoryEnabled(category: WorldEventCategory, enabled: boolean): void {
    this.worldEventSystem.setCategoryEnabled(category, enabled);
  }

  public setWorldEventsMasterEnabled(enabled: boolean): void {
    this.worldEventSystem.setMasterEnabled(enabled);
  }

  public setWorldEventSeed(seed: number): void {
    this.worldEventSystem.setSeed(seed);
  }

  public resetWorldEvents(seed?: number): void {
    this.worldEventSystem.reset(seed);
    this.step(0);
  }

  public getWorldEventTelemetry(): WorldEventTelemetry {
    return this.worldEventSystem.getTelemetry();
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
