import { 
  LocationId, 
  FlyActivity, 
  NeedState, 
  ActivityInstance, 
  ScheduleEntry,
  WorkoutSession,
  MealSession,
  ProjectState,
  AssignmentState,
  CollegeSubBehavior
} from '../../types';

/**
/**
 * Destination reachability metadata for perception.
 */
export interface NearbyDestinationInfo {
  locationId: LocationId;
  name: string;
  isCurrent: boolean;
  reachable: boolean;
  distanceMeters?: number;
  travelTimeMinutes?: number;
}

/**
 * Interaction points / waypoints in the current location.
 */
export interface InteractionPointInfo {
  id?: string;
  name: string;
  waypointKey: string;
  type?: string;
  distanceMeters?: number;
  coordinates?: [number, number, number];
}

/**
 * High-level agent motion / activity state.
 */
export type AgentMotionState = 'resting' | 'travelling' | 'performing_activity' | 'idle' | 'grounded' | 'airborne' | 'takeoff' | 'landing';

/**
 * Outcome status for actions and activities.
 */
export type MemoryOutcome = 'completed' | 'interrupted' | 'rejected' | 'failed' | 'cancelled';

/**
 * Perception modalities available from the existing simulation.
 */
export interface AvailableSensoryData {
  currentLocationId: LocationId;
  currentActivityId: string | null;
  activityLifecycleState: string | null;
  activityProgressPercent: number;
  simulatedTime: string;
  simulatedMinutes: number;
  dayNumber: number;
  dayOfWeek: string;
  dayType: 'weekday' | 'weekend';
  isTravelling: boolean;
  currentWaypoint: string;
  currentSpot: string;
  flyActivity: FlyActivity;
  needs: NeedState;
  
  // Specific contextual sub-states
  isWorkoutActive: boolean;
  workoutState?: string;
  isMealActive: boolean;
  isProjectActive: boolean;
  isAssignmentActive: boolean;
  isFamilyCallActive: boolean;
  isLaundryActive: boolean;
  isMorningRoutineActive?: boolean;

  // Milestone 7 Perception Expansions
  nearbyDestinations?: NearbyDestinationInfo[];
  availableInteractionPoints?: InteractionPointInfo[];
  motionState?: AgentMotionState;
  travelTargetLocation?: LocationId | null;
  travelProgressPercent?: number;
  activityPhase?: string | null;
  recentEventsSummary?: string[];
  relevantMemories?: MemoryRecord[];
  isFoodOrderActive?: boolean;

  // Sensory Grounding Declarations (Biological receptors are explicitly unavailable)
  isCameraVisionAvailable?: boolean;
  isOmmatidiaPhotoreceptorsAvailable?: boolean;
  isOlfactorySensillaAvailable?: boolean;
  isAntennalMechanoreceptorsAvailable?: boolean;
}

/**
 * Modalities explicitly acknowledged as unavailable in the simulation.
 * Ensures scientific honesty by never fabricating sensory observations.
 */
export interface UnavailableSensoryData {
  visualCameraImage: {
    available: false;
    reason: 'No camera-based pixel rendering or object recognition sensor pipeline implemented.';
  };
  compoundEyeOpticalFlow: {
    available: false;
    reason: 'Ommatidia optical flow field integration is not modeled in the web engine.';
  };
  olfactoryReceptors: {
    available: false;
    reason: 'Volatile chemical odor gradient simulation is not implemented.';
  };
  antennalTactileSensors: {
    available: false;
    reason: 'Mechanosensory tactile bristles are not physically simulated.';
  };
}

/**
 * Complete snapshot captured by the perception layer at a decision point.
 */
export interface PerceptionSnapshot {
  timestamp: string;
  simulatedMinutes: number;
  dayNumber: number;
  motionState?: AgentMotionState;
  activityPhase?: string | null;
  nearbyDestinations?: NearbyDestinationInfo[];
  nearbyInteractionPoints?: InteractionPointInfo[];
  travelProgress?: {
    isTraveling: boolean;
    fromLocation?: string;
    toLocation?: string;
    progress?: number;
  };
  unavailableSensory?: {
    channel: string;
    simulated: boolean;
    reason: string;
  }[];
  available: AvailableSensoryData;
  unavailable: UnavailableSensoryData;
}

/**
 * Derived cognitive drives and psychological state variables.
 */
export interface CognitiveDrives {
  arousal: number;        // [0, 100] Overall neurological activation / alertness
  attentionalFocus: number; // [0, 100] Concentration capacity
  hungerDrive: number;    // [0, 100] Motivation to seek food
  restDrive: number;      // [0, 100] Motivation to rest/sleep
  socialDrive: number;    // [0, 100] Drive for social connection
  effortFatigue: number;  // [0, 100] Need to disengage from high-strain tasks
}

/**
 * Internal cognitive state representation.
 */
export interface InternalState {
  // Direct needs mapped from existing NeedsSystem (single source of truth)
  needs: NeedState;

  // Derived cognitive drives
  drives: CognitiveDrives;

  // High-level cognitive goal
  currentGoal: string;

  // Active commitment / hysteresis tracking
  activeBehaviorId: string | null;
  behaviorCommitmentElapsedSimSeconds: number;
  minimumCommitmentSimSeconds: number;

  // Recent behavior tracking
  recentBehaviorId: string | null;
  recentRepetitionCount: number;

  // Salient references
  lastDecisionTimestamp: string;
}

/**
 * Bounded Episodic Memory Record stored in CognitiveMemory.
 */
export interface MemoryRecord {
  id: string;
  timestamp: string;
  simulatedMinutes: number;
  dayNumber: number;
  eventType: string; // e.g. 'lecture_completed', 'workout_finished', 'meal_completed', 'action_rejected'
  category: 'behavior' | 'location' | 'activity' | 'distraction' | 'need_alert' | 'routine' | 'outcome' | 'world_event' | 'food_state';
  key: string;
  value: string;
  location: LocationId;
  locationId?: LocationId;
  outcome: MemoryOutcome;
  context?: Record<string, any>;
  tags: string[];
  sourceBehaviorId?: string;
  salience: number; // 0.0 to 1.0
  expiresAtSimMinutes?: number;
}

/**
 * Action request produced by the cognitive layer.
 */
export type SemanticActionType = 
  | 'TRAVEL'
  | 'SET_COLLEGE_SUB_BEHAVIOR'
  | 'CONTINUE_ACTIVITY'
  | 'PROGRESS_WORKOUT'
  | 'CONSUME_MEAL'
  | 'WORK_PROJECT'
  | 'WORK_ASSIGNMENT'
  | 'WALK_FAMILY_CALL'
  | 'PERFORM_LAUNDRY'
  | 'REST_OR_SLEEP'
  | 'IDLE_WAIT';

export interface ActionRequest {
  type: SemanticActionType;
  targetLocation?: LocationId;
  targetWaypoint?: string;
  targetFlyActivity?: FlyActivity;
  collegeSubBehavior?: CollegeSubBehavior;
  actionLabel?: string;
  payload?: Record<string, any>;
}

/**
 * Diagnostic record of cognitive processing.
 */
export interface CognitiveEvent {
  id: string;
  timestamp: string;
  simulatedMinutes: number;
  category: 'evaluation' | 'selection' | 'interruption' | 'rejection' | 'adapter' | 'adaptation' | 'memory';
  message: string;
  behaviorId?: string;
  details?: Record<string, any>;
}

/**
 * Context provided to behavior candidate evaluators.
 */
export interface CognitiveContext {
  perception: PerceptionSnapshot;
  internalState: InternalState;
  activeScheduleEntry: ScheduleEntry | null;
  currentActivity: ActivityInstance | null;
  workoutSession: WorkoutSession | null;
  mealSession: MealSession | null;
  projectState: ProjectState;
  assignmentState: AssignmentState;
  memory: MemoryRecord[];
  worldEffects?: any;
  learnedValences?: Record<string, number>;
  activeCooldowns?: Record<string, number>;
}

/**
 * Evaluation output for a candidate behavior.
 */
export interface BehaviorEvaluation {
  candidateId: string;
  candidateName: string;
  isEligible: boolean;
  disqualificationReason?: string;
  baseUtility: number;       // [0, 100]
  scheduleCompatibility: number; // [-1.0, 1.0] multiplier
  needUrgencyBonus: number;   // [0, 100]
  continuityBonus: number;    // [0, 50] (hysteresis)
  repetitionPenalty: number;  // [0, 50]
  worldEventBonus?: number;   // [0, 40] bonus from active living world events
  learnedValenceBonus?: number; // [-30, 30] bonus from Mushroom Body associative odor learning
  cooldownPenalty?: number;   // [0, 50] penalty from behavior switching cooldown
  memoryScoreContribution?: number; // [-20, 20] from relevant memories
  adaptationScoreContribution?: number; // [-20, 20] bounded adaptation
  adaptationScoreDelta?: number; // alias for adaptation score adjustment
  adaptationRulesApplied?: string[]; // list of rules applied
  adaptationDetails?: {
    rulesApplied: string[];
    memoryIds: string[];
    scoreDelta: number;
  };
  finalScore: number;         // [0, 100]
  explanation: string;
}

/**
 * Behavior Candidate definition in the registry.
 */
export interface BehaviorCandidate {
  id: string;
  displayName: string;
  description: string;
  
  // Activity contexts in which this candidate can be considered
  applicableActivityIds?: string[];
  
  // Preconditions test
  isApplicable: (context: CognitiveContext) => { eligible: boolean; reason?: string };
  
  // Utility evaluation function
  evaluateUtility: (context: CognitiveContext) => BehaviorEvaluation;
  
  // Generator for the action request
  createActionRequest: (context: CognitiveContext) => ActionRequest;
}

/**
 * Final Action Decision produced by ActionSelector.
 */
export interface ActionDecision {
  selectedCandidateId: string;
  selectedCandidateName: string;
  actionRequest: ActionRequest;
  confidence: number;
  isUrgentOverride: boolean;
  explanation: string;
  evaluations: BehaviorEvaluation[];
  rejectedCandidates: { candidateId: string; reason: string }[];
  timestamp: string;
  decisionBreakdown?: {
    scheduleContextScore: number;
    needDriveScore: number;
    worldEventScore: number;
    learnedValenceScore: number;
    hysteresisScore: number;
  };
  cooldownRemainingSeconds?: number;
}

/**
 * Connectome data adapter interfaces.
 * Defines the contract for future real connectome ingestion without
 * fabricating unverified biological connections.
 */
export interface NeuropilMetadata {
  neuropilId: string;
  standardName: string;
  neuropilCategory: 'sensory' | 'central_complex' | 'mushroom_body' | 'motor_descending';
  anatomicalRegion: string;
  publishedReference?: string;
  verifiedInMaleCNS: boolean;
  notes: string;
}

export interface ConnectomeCircuitMetadata {
  circuitId: string;
  name: string;
  sourceNeuropil: string;
  targetNeuropil: string;
  presumedFunction: string;
  evidenceLevel: 'published_experimental' | 'connectome_inferred' | 'software_abstraction';
  dataSource?: string;
}

export interface ConnectomeModel {
  datasetName: string;
  version: string;
  isRealDataImported: boolean;
  provenance: string;
  neuropils: NeuropilMetadata[];
  circuits: ConnectomeCircuitMetadata[];
}

/**
 * Serializable cognitive snapshot for persistence.
 */
export interface SerializedCognitiveData {
  isCognitionEnabled: boolean;
  isMemoryInfluenceEnabled?: boolean;
  isAdaptationEnabled?: boolean;
  currentGoal: string;
  activeBehaviorId: string | null;
  behaviorCommitmentElapsedSimSeconds: number;
  memoryRecords: MemoryRecord[];
  adaptationConfig?: Record<string, any>;
  lastDecision?: {
    selectedCandidateId: string;
    timestamp: string;
    explanation: string;
  };
}
