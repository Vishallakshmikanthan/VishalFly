import { 
  InternalState, 
  ActionDecision, 
  BehaviorEvaluation, 
  MemoryRecord, 
  CognitiveEvent,
  PerceptionSnapshot
} from '../types/cognition';

export interface CognitiveInspectorData {
  isCognitionEnabled: boolean;
  isMemoryInfluenceEnabled: boolean;
  isAdaptationEnabled: boolean;
  currentGoal: string;
  currentActivityName: string;
  internalState: InternalState;
  lastDecision: ActionDecision | null;
  evaluations: BehaviorEvaluation[];
  rejectedCandidates: { candidateId: string; reason: string }[];
  recentMemory: MemoryRecord[];
  relevantMemories: MemoryRecord[];
  recentEvents: CognitiveEvent[];
  lastPerceptionSnapshot?: PerceptionSnapshot;
  
  // Side-by-side comparative inspection
  comparison: {
    baselineScheduleDecision: string;
    cognitiveSelectorDecision: string;
    divergenceReason?: string;
  };

  // Adaptation experiment parameters & inspection
  adaptationStatus: {
    isAdaptationEnabled: boolean;
    isMemoryInfluenceEnabled: boolean;
    maxAdjustment: number;
    repetitionPenaltyWeight: number;
    outcomeInfluenceWeight: number;
    routineMemoryWindowMinutes: number;
    totalMemoriesCount: number;
  };

  // Connectome Adapter & Scientific Status Info
  connectomeStatus: {
    dataset: string;
    isRealDataImported: boolean;
    neuropilsCount: number;
    circuitsCount: number;
    provenance: string;
  };
}
