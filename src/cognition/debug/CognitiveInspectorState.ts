import { 
  InternalState, 
  ActionDecision, 
  BehaviorEvaluation, 
  MemoryRecord, 
  CognitiveEvent 
} from '../types/cognition';

export interface CognitiveInspectorData {
  isCognitionEnabled: boolean;
  currentGoal: string;
  currentActivityName: string;
  internalState: InternalState;
  lastDecision: ActionDecision | null;
  evaluations: BehaviorEvaluation[];
  rejectedCandidates: { candidateId: string; reason: string }[];
  recentMemory: MemoryRecord[];
  recentEvents: CognitiveEvent[];
  
  // Side-by-side comparative inspection
  comparison: {
    baselineScheduleDecision: string;
    cognitiveSelectorDecision: string;
    divergenceReason?: string;
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
