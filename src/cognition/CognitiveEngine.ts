import { PerceptionSystem } from './perception/PerceptionSystem';
import { InternalStateManager } from './internal-state/InternalStateManager';
import { CognitiveMemory } from './memory/CognitiveMemory';
import { BehaviorRegistry } from './behaviors/BehaviorRegistry';
import { BehaviorIntegrator } from './integration/BehaviorIntegrator';
import { ActionSelector } from './action-selection/ActionSelector';
import { ActionAdapters, ActionAdapterResult } from './adapters/ActionAdapters';
import { ConnectomeAdapter } from './connectome/ConnectomeAdapter';
import { 
  CognitiveConfig, 
  validateCognitiveConfig 
} from './config/CognitiveConfig';
import { 
  CognitiveContext, 
  ActionDecision, 
  CognitiveEvent, 
  SerializedCognitiveData 
} from './types/cognition';
import { CognitiveInspectorData } from './debug/CognitiveInspectorState';
import { 
  SimulationClockState, 
  ActivityInstance, 
  NeedState, 
  CharacterState, 
  WorkoutSession, 
  MealSession, 
  ProjectState, 
  AssignmentState, 
  FamilyCallState, 
  LaundryState, 
  ScheduleEntry 
} from '../types';
import { ActivityManager } from '../simulation/activities/ActivityManager';
import { EventLogger } from '../simulation/events/EventLogger';

export interface CognitiveStepParams {
  clock: SimulationClockState;
  character: CharacterState;
  currentActivity: ActivityInstance | null;
  activeScheduleEntry: ScheduleEntry | null;
  needs: NeedState;
  workoutSession: WorkoutSession | null;
  mealSession: MealSession | null;
  projectState: ProjectState;
  assignmentState: AssignmentState;
  familyCallState: FamilyCallState;
  laundryState: LaundryState;
  currentWaypoint: string;
  deltaSimSeconds: number;
  forceEvaluate?: boolean;
}

export interface CognitiveStepResult {
  isCognitionEnabled: boolean;
  decision: ActionDecision | null;
  adapterResult: ActionAdapterResult | null;
  appliedWaypoint?: string;
  appliedFlyActivity?: any;
  appliedActionLabel?: string;
}

export class CognitiveEngine {
  public perceptionSystem: PerceptionSystem;
  public internalStateManager: InternalStateManager;
  public memory: CognitiveMemory;
  public registry: BehaviorRegistry;
  public integrator: BehaviorIntegrator;
  public selector: ActionSelector;
  public adapters: ActionAdapters;
  public connectomeAdapter: ConnectomeAdapter;
  public config: CognitiveConfig;

  private events: CognitiveEvent[] = [];
  private lastDecision: ActionDecision | null = null;
  private lastEvaluationMinutes: number = -1;
  private eventLogger: EventLogger;

  constructor(
    activityManager: ActivityManager,
    eventLogger: EventLogger,
    customConfig?: Partial<CognitiveConfig>,
    initialNeeds?: NeedState
  ) {
    this.eventLogger = eventLogger;
    this.config = validateCognitiveConfig(customConfig || {});

    this.perceptionSystem = new PerceptionSystem();
    this.internalStateManager = new InternalStateManager(
      initialNeeds || {
        energy: 88,
        hunger: 25,
        sleepiness: 15,
        fatigue: 10,
        focus: 85,
        socialNeed: 30,
      }
    );
    this.memory = new CognitiveMemory(
      this.config.memoryCapacity,
      this.config.memoryRetentionDurationSimMinutes
    );
    this.registry = new BehaviorRegistry();
    this.integrator = new BehaviorIntegrator(
      this.registry,
      this.config,
      this.memory
    );
    this.selector = new ActionSelector(this.config);
    this.adapters = new ActionAdapters(activityManager, eventLogger);
    this.connectomeAdapter = new ConnectomeAdapter();
  }

  /**
   * Main step function called from SimulationEngine during autonomous simulation updates.
   */
  public step(params: CognitiveStepParams): CognitiveStepResult {
    const {
      clock,
      character,
      currentActivity,
      activeScheduleEntry,
      needs,
      workoutSession,
      mealSession,
      projectState,
      assignmentState,
      familyCallState,
      laundryState,
      currentWaypoint,
      deltaSimSeconds,
      forceEvaluate,
    } = params;

    // 1. Perception
    const perception = this.perceptionSystem.captureSnapshot({
      clock,
      character,
      currentActivity,
      needs,
      workoutSession,
      mealSession,
      projectState,
      assignmentState,
      familyCallState,
      laundryState,
      currentWaypoint,
    });

    // 2. Internal State Update
    const internalState = this.internalStateManager.update(perception, deltaSimSeconds);

    // 3. Prune Expired Memory
    this.memory.prune(clock.currentMinutes);

    // If cognition is disabled, bypass decision execution completely!
    if (!this.config.isCognitionEnabled) {
      return {
        isCognitionEnabled: false,
        decision: null,
        adapterResult: null,
      };
    }

    // 4. Determine if cognitive evaluation should run
    const minutesSinceLastEval = this.lastEvaluationMinutes === -1 
      ? 999 
      : Math.abs(clock.currentMinutes - this.lastEvaluationMinutes);

    const isActivityChanged = currentActivity?.scheduleEntry.id !== activeScheduleEntry?.id;
    const shouldEvaluate = 
      forceEvaluate ||
      this.lastDecision === null ||
      isActivityChanged ||
      minutesSinceLastEval >= this.config.evaluationIntervalSimMinutes;

    if (!shouldEvaluate && this.lastDecision) {
      // Re-run adapter for current decision if needed
      return {
        isCognitionEnabled: true,
        decision: this.lastDecision,
        adapterResult: null,
      };
    }

    // 5. Build Cognitive Context
    const context: CognitiveContext = {
      perception,
      internalState,
      activeScheduleEntry,
      currentActivity,
      workoutSession,
      mealSession,
      projectState,
      assignmentState,
      memory: this.memory.getActive(clock.currentMinutes),
    };

    // 6. Behavior Integration & Utility Scoring
    const integration = this.integrator.integrate(context);

    // 7. Action Selection with Safety Guards & Hysteresis
    const decision = this.selector.selectAction(integration, context);
    this.lastDecision = decision;
    this.lastEvaluationMinutes = clock.currentMinutes;

    // 8. Update Commitment and Memory
    this.internalStateManager.setActiveBehavior(
      decision.selectedCandidateId,
      decision.actionRequest.actionLabel || decision.selectedCandidateName,
      perception.timestamp,
      this.config.minimumCommitmentIntervalSimSeconds
    );

    // Record decision in memory
    this.memory.record({
      timestamp: perception.timestamp,
      simulatedMinutes: clock.currentMinutes,
      dayNumber: clock.dayNumber,
      category: decision.selectedCandidateId.includes('distraction') ? 'distraction' : 'behavior',
      key: decision.selectedCandidateId,
      value: decision.selectedCandidateName,
      salience: decision.confidence,
    });

    // 9. Execute semantic action via adapters
    const adapterResult = this.adapters.execute(decision);

    // Log diagnostic event if verbose
    if (this.config.verboseLogging) {
      this.logEvent({
        timestamp: perception.timestamp,
        simulatedMinutes: clock.currentMinutes,
        category: 'selection',
        message: `Selected '${decision.selectedCandidateName}' (${Math.round(decision.confidence * 100)}% conf). ${decision.explanation}`,
        behaviorId: decision.selectedCandidateId,
      });
    }

    return {
      isCognitionEnabled: true,
      decision,
      adapterResult,
      appliedWaypoint: adapterResult.appliedWaypoint,
      appliedFlyActivity: adapterResult.appliedFlyActivity,
      appliedActionLabel: adapterResult.appliedActionLabel,
    };
  }

  /**
   * Generates a complete snapshot of cognitive state for the UI inspector.
   */
  public getInspectorData(currentActivityName: string = 'None'): CognitiveInspectorData {
    const internalState = this.internalStateManager.getState();
    const lastDecision = this.lastDecision;
    const evaluations = lastDecision ? lastDecision.evaluations : [];
    const rejectedCandidates = lastDecision ? lastDecision.rejectedCandidates : [];

    // Comparative check: Baseline schedule decision vs Cognitive decision
    const baselineScheduleDecision = currentActivityName;
    const cognitiveSelectorDecision = lastDecision ? lastDecision.selectedCandidateName : 'None';
    const divergenceReason = baselineScheduleDecision !== cognitiveSelectorDecision
      ? lastDecision?.explanation
      : 'Cognitive decision is in full harmony with schedule.';

    return {
      isCognitionEnabled: this.config.isCognitionEnabled,
      currentGoal: internalState.currentGoal,
      currentActivityName,
      internalState,
      lastDecision,
      evaluations,
      rejectedCandidates,
      recentMemory: this.memory.getAll().slice(-15),
      recentEvents: this.events.slice(-20),
      comparison: {
        baselineScheduleDecision,
        cognitiveSelectorDecision,
        divergenceReason,
      },
      connectomeStatus: this.connectomeAdapter.getSummary(),
    };
  }

  public setCognitionEnabled(enabled: boolean): void {
    this.config.isCognitionEnabled = enabled;
    this.eventLogger.log({
      timestamp: this.internalStateManager.getState().lastDecisionTimestamp,
      dayNumber: 1,
      category: 'system',
      message: `Cognitive decision layer ${enabled ? 'ENABLED' : 'DISABLED (legacy schedule mode)'}.`,
    });
  }

  public getIsCognitionEnabled(): boolean {
    return this.config.isCognitionEnabled;
  }

  public updateConfig(config: Partial<CognitiveConfig>): void {
    this.config = validateCognitiveConfig({ ...this.config, ...config });
    this.integrator.updateConfig(this.config);
    this.selector.updateConfig(this.config);
  }

  public logEvent(entry: Omit<CognitiveEvent, 'id'>): void {
    const evt: CognitiveEvent = {
      ...entry,
      id: `cog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    this.events.push(evt);
    if (this.events.length > 50) {
      this.events.shift();
    }
  }

  public serialize(): SerializedCognitiveData {
    return {
      isCognitionEnabled: this.config.isCognitionEnabled,
      currentGoal: this.internalStateManager.getState().currentGoal,
      activeBehaviorId: this.internalStateManager.getState().activeBehaviorId,
      behaviorCommitmentElapsedSimSeconds: this.internalStateManager.getState().behaviorCommitmentElapsedSimSeconds,
      memoryRecords: this.memory.serialize(),
      lastDecision: this.lastDecision ? {
        selectedCandidateId: this.lastDecision.selectedCandidateId,
        timestamp: this.lastDecision.timestamp,
        explanation: this.lastDecision.explanation,
      } : undefined,
    };
  }

  public deserialize(data: SerializedCognitiveData): void {
    if (!data) return;
    this.config.isCognitionEnabled = data.isCognitionEnabled ?? true;
    if (data.currentGoal || data.activeBehaviorId) {
      this.internalStateManager.setState({
        currentGoal: data.currentGoal || 'Restored',
        activeBehaviorId: data.activeBehaviorId || null,
        behaviorCommitmentElapsedSimSeconds: data.behaviorCommitmentElapsedSimSeconds || 0,
      });
    }
    if (data.memoryRecords) {
      this.memory.deserialize(data.memoryRecords);
    }
  }
}
