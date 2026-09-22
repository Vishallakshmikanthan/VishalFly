import { PerceptionSystem } from './perception/PerceptionSystem';
import { InternalStateManager } from './internal-state/InternalStateManager';
import { CognitiveMemory } from './memory/CognitiveMemory';
import { BehaviorRegistry } from './behaviors/BehaviorRegistry';
import { BehaviorIntegrator } from './integration/BehaviorIntegrator';
import { ActionSelector } from './action-selection/ActionSelector';
import { ActionAdapters, ActionAdapterResult } from './adapters/ActionAdapters';
import { ConnectomeAdapter } from './connectome/ConnectomeAdapter';
import { AdaptiveBehaviorSystem } from './adaptation/AdaptiveBehaviorSystem';
import { 
  CognitiveConfig, 
  validateCognitiveConfig,
  DEFAULT_COGNITIVE_CONFIG
} from './config/CognitiveConfig';
import { 
  CognitiveContext, 
  ActionDecision, 
  CognitiveEvent, 
  SerializedCognitiveData,
  MemoryOutcome,
  MemoryRecord,
  PerceptionSnapshot
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
  ScheduleEntry,
  LocationId
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
  public adaptiveSystem: AdaptiveBehaviorSystem;
  public config: CognitiveConfig;

  private events: CognitiveEvent[] = [];
  private lastDecision: ActionDecision | null = null;
  private lastEvaluationMinutes: number = -1;
  private lastPerceptionSnapshot: PerceptionSnapshot | null = null;
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
    this.adaptiveSystem = new AdaptiveBehaviorSystem(this.config, this.memory);
    this.integrator = new BehaviorIntegrator(
      this.registry,
      this.config,
      this.memory,
      this.adaptiveSystem
    );
    this.selector = new ActionSelector(this.config);
    this.adapters = new ActionAdapters(activityManager, eventLogger, this.memory);
    this.connectomeAdapter = new ConnectomeAdapter();
  }

  /**
   * Records a confirmed activity or action outcome into episodic memory.
   * Ensures completion is only recorded when confirmed by the simulation.
   */
  public recordConfirmedOutcome(params: {
    eventType: string;
    key?: string;
    value: string;
    location?: LocationId;
    locationId?: LocationId;
    outcome: MemoryOutcome;
    context?: Record<string, any>;
    tags?: string[];
    sourceBehaviorId?: string;
    salience?: number;
    timestamp: string;
    simulatedMinutes: number;
    dayNumber: number;
    category?: MemoryRecord['category'];
  }): MemoryRecord {
    return this.memory.record({
      timestamp: params.timestamp,
      simulatedMinutes: params.simulatedMinutes,
      dayNumber: params.dayNumber,
      category: params.category || 'outcome',
      eventType: params.eventType,
      key: params.key || params.eventType,
      value: params.value,
      location: params.location || params.locationId || 'bedroom',
      outcome: params.outcome,
      context: params.context || {},
      tags: params.tags || [params.eventType, params.outcome],
      sourceBehaviorId: params.sourceBehaviorId,
      salience: params.salience ?? 0.8,
    });
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

    // Retrieve relevant episodic memories for the perception snapshot
    const relevantMemories = this.config.isMemoryInfluenceEnabled
      ? this.memory.getRelevantMemories({
          currentLocation: character.locationId as LocationId,
          currentActivityId: currentActivity?.definition.id,
          tags: [currentActivity?.definition.id || '', character.locationId],
          limit: this.config.memoryRetrievalLimit,
          currentMinutes: clock.currentMinutes,
        })
      : [];

    const recentEventsSummary = this.eventLogger.getRecent(5).map((e) => e.message);

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
      recentEventsSummary,
      relevantMemories,
      travelTargetLocation: currentActivity?.state === 'travelling' ? (currentActivity.targetLocation as LocationId) : null,
      travelProgressPercent: currentActivity?.progressPercent ?? 0,
    });

    this.lastPerceptionSnapshot = perception;

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

    // 6. Behavior Integration & Utility Scoring (including bounded adaptation)
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

    // Record decision in bounded memory with deterministic outcome
    this.memory.record({
      timestamp: perception.timestamp,
      simulatedMinutes: clock.currentMinutes,
      dayNumber: clock.dayNumber,
      category: decision.selectedCandidateId.includes('distraction') ? 'distraction' : 'behavior',
      eventType: decision.selectedCandidateId,
      key: decision.selectedCandidateId,
      value: decision.selectedCandidateName,
      location: character.locationId as LocationId,
      outcome: 'completed',
      tags: ['decision', decision.selectedCandidateId],
      sourceBehaviorId: decision.selectedCandidateId,
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
   * Helper evaluation method to run integration and selection on a given context.
   */
  public evaluateAndSelect(context: CognitiveContext): ActionDecision | null {
    const integration = this.integrator.integrate(context);
    if (!integration.winningCandidate || !integration.topEvaluation) {
      return null;
    }
    return this.selector.select(integration, context);
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

    const currentLocation = (this.lastPerceptionSnapshot?.available.currentLocationId || 'bedroom') as LocationId;
    const currentActivityId = this.lastPerceptionSnapshot?.available.currentActivityId || undefined;

    const relevantMemories = this.memory.getRelevantMemories({
      currentLocation,
      currentActivityId,
      limit: this.config.memoryRetrievalLimit,
    });

    return {
      isCognitionEnabled: this.config.isCognitionEnabled,
      isMemoryInfluenceEnabled: this.config.isMemoryInfluenceEnabled,
      isAdaptationEnabled: this.config.isAdaptationEnabled,
      currentGoal: internalState.currentGoal,
      currentActivityName,
      internalState,
      lastDecision,
      evaluations,
      rejectedCandidates,
      recentMemory: this.memory.getAll().slice(-20),
      relevantMemories,
      recentEvents: this.events.slice(-20),
      lastPerceptionSnapshot: this.lastPerceptionSnapshot || undefined,
      comparison: {
        baselineScheduleDecision,
        cognitiveSelectorDecision,
        divergenceReason,
      },
      adaptationStatus: {
        isAdaptationEnabled: this.config.isAdaptationEnabled,
        isMemoryInfluenceEnabled: this.config.isMemoryInfluenceEnabled,
        maxAdjustment: this.config.adaptationMaxAdjustment,
        repetitionPenaltyWeight: this.config.repetitionPenaltyPerOccurrence,
        outcomeInfluenceWeight: this.config.outcomeInfluenceWeight,
        routineMemoryWindowMinutes: this.config.routineMemoryWindowMinutes,
        totalMemoriesCount: this.memory.getAll().length,
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

  public getConfig(): CognitiveConfig {
    return { ...this.config };
  }

  public setMemoryInfluenceEnabled(enabled: boolean): void {
    this.config.isMemoryInfluenceEnabled = enabled;
    this.integrator.updateConfig(this.config);
    this.eventLogger.log({
      timestamp: this.internalStateManager.getState().lastDecisionTimestamp,
      dayNumber: 1,
      category: 'system',
      message: `Memory influence ${enabled ? 'ENABLED' : 'DISABLED'}.`,
    });
  }

  public setAdaptationEnabled(enabled: boolean): void {
    this.config.isAdaptationEnabled = enabled;
    this.integrator.updateConfig(this.config);
    this.eventLogger.log({
      timestamp: this.internalStateManager.getState().lastDecisionTimestamp,
      dayNumber: 1,
      category: 'system',
      message: `Adaptive behavior experiments ${enabled ? 'ENABLED' : 'DISABLED'}.`,
    });
  }

  public clearMemory(): void {
    this.memory.clear();
    this.eventLogger.log({
      timestamp: this.internalStateManager.getState().lastDecisionTimestamp,
      dayNumber: 1,
      category: 'system',
      message: 'Episodic memory cleared.',
    });
  }

  public resetAdaptationDefaults(): void {
    this.updateConfig({
      isAdaptationEnabled: DEFAULT_COGNITIVE_CONFIG.isAdaptationEnabled,
      isMemoryInfluenceEnabled: DEFAULT_COGNITIVE_CONFIG.isMemoryInfluenceEnabled,
      adaptationMaxAdjustment: DEFAULT_COGNITIVE_CONFIG.adaptationMaxAdjustment,
      outcomeInfluenceWeight: DEFAULT_COGNITIVE_CONFIG.outcomeInfluenceWeight,
      routineMemoryWindowMinutes: DEFAULT_COGNITIVE_CONFIG.routineMemoryWindowMinutes,
      repetitionPenaltyPerOccurrence: DEFAULT_COGNITIVE_CONFIG.repetitionPenaltyPerOccurrence,
    });
    this.eventLogger.log({
      timestamp: this.internalStateManager.getState().lastDecisionTimestamp,
      dayNumber: 1,
      category: 'system',
      message: 'Adaptation parameters reset to defaults.',
    });
  }

  public getIsCognitionEnabled(): boolean {
    return this.config.isCognitionEnabled;
  }

  public updateConfig(config: Partial<CognitiveConfig>): void {
    this.config = validateCognitiveConfig({ ...this.config, ...config });
    this.integrator.updateConfig(this.config);
    this.selector.updateConfig(this.config);
    this.adaptiveSystem.updateConfig(this.config);
    this.memory.setCapacity(this.config.memoryCapacity);
    this.memory.setRetentionDuration(this.config.memoryRetentionDurationSimMinutes);
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
      isMemoryInfluenceEnabled: this.config.isMemoryInfluenceEnabled,
      isAdaptationEnabled: this.config.isAdaptationEnabled,
      currentGoal: this.internalStateManager.getState().currentGoal,
      activeBehaviorId: this.internalStateManager.getState().activeBehaviorId,
      behaviorCommitmentElapsedSimSeconds: this.internalStateManager.getState().behaviorCommitmentElapsedSimSeconds,
      memoryRecords: this.memory.serialize(),
      adaptationConfig: {
        adaptationMaxAdjustment: this.config.adaptationMaxAdjustment,
        outcomeInfluenceWeight: this.config.outcomeInfluenceWeight,
        routineMemoryWindowMinutes: this.config.routineMemoryWindowMinutes,
      },
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
    this.config.isMemoryInfluenceEnabled = data.isMemoryInfluenceEnabled ?? true;
    this.config.isAdaptationEnabled = data.isAdaptationEnabled ?? true;
    if (data.adaptationConfig) {
      this.config.adaptationMaxAdjustment = data.adaptationConfig.adaptationMaxAdjustment ?? this.config.adaptationMaxAdjustment;
      this.config.outcomeInfluenceWeight = data.adaptationConfig.outcomeInfluenceWeight ?? this.config.outcomeInfluenceWeight;
      this.config.routineMemoryWindowMinutes = data.adaptationConfig.routineMemoryWindowMinutes ?? this.config.routineMemoryWindowMinutes;
    }
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
