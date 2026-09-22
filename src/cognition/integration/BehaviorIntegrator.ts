import { 
  BehaviorRegistry 
} from '../behaviors/BehaviorRegistry';
import { 
  CognitiveContext, 
  BehaviorEvaluation, 
  BehaviorCandidate 
} from '../types/cognition';
import { CognitiveConfig } from '../config/CognitiveConfig';
import { CognitiveMemory } from '../memory/CognitiveMemory';
import { AdaptiveBehaviorSystem } from '../adaptation/AdaptiveBehaviorSystem';

export interface IntegrationResult {
  winningCandidate: BehaviorCandidate | null;
  topEvaluation: BehaviorEvaluation | null;
  evaluations: BehaviorEvaluation[];
  rejectedCandidates: { candidateId: string; reason: string }[];
  explanation: string;
}

export class BehaviorIntegrator {
  private registry: BehaviorRegistry;
  private config: CognitiveConfig;
  private memory: CognitiveMemory;
  private adaptiveSystem: AdaptiveBehaviorSystem;

  constructor(
    registry: BehaviorRegistry,
    config: CognitiveConfig,
    memory: CognitiveMemory,
    adaptiveSystem?: AdaptiveBehaviorSystem
  ) {
    this.registry = registry;
    this.config = config;
    this.memory = memory;
    this.adaptiveSystem = adaptiveSystem || new AdaptiveBehaviorSystem(config, memory);
  }

  public updateConfig(config: Partial<CognitiveConfig>): void {
    this.config = { ...this.config, ...config };
    this.adaptiveSystem.updateConfig(this.config);
  }

  /**
   * Evaluates all candidates deterministically against current context,
   * applying utility weights, continuity bonuses (hysteresis), repetition penalties,
   * bounded adaptive behavior experiments, and strict deterministic tie-breaking.
   */
  public integrate(context: CognitiveContext): IntegrationResult {
    const candidates = this.registry.getAll();
    const evaluations: BehaviorEvaluation[] = [];
    const rejectedCandidates: { candidateId: string; reason: string }[] = [];

    const activeBehaviorId = context.internalState.activeBehaviorId;
    const currentMinutes = context.perception.simulatedMinutes;

    for (const candidate of candidates) {
      // 1. Preconditions & Applicability Test
      const applicability = candidate.isApplicable(context);
      if (!applicability.eligible) {
        rejectedCandidates.push({
          candidateId: candidate.id,
          reason: applicability.reason || 'Preconditions not met.',
        });
        evaluations.push({
          candidateId: candidate.id,
          candidateName: candidate.displayName,
          isEligible: false,
          disqualificationReason: applicability.reason,
          baseUtility: 0,
          scheduleCompatibility: 0,
          needUrgencyBonus: 0,
          continuityBonus: 0,
          repetitionPenalty: 0,
          memoryScoreContribution: 0,
          adaptationScoreContribution: 0,
          finalScore: 0,
          explanation: `Ineligible: ${applicability.reason}`,
        });
        continue;
      }

      // 2. Base Utility Evaluation
      const rawEval = candidate.evaluateUtility(context);

      // 3. Modulate by Configurable Weights
      const weightedBase = rawEval.baseUtility * (rawEval.scheduleCompatibility > 0 ? this.config.scheduleWeight : 1.0);
      const weightedUrgency = rawEval.needUrgencyBonus * this.config.needReliefWeight;

      // 4. Continuity Bonus (Hysteresis) to prevent rapid behavioral oscillation
      let continuityBonus = 0;
      if (candidate.id === activeBehaviorId) {
        // Boost currently running behavior
        continuityBonus = this.config.continuityBonusMax;
      }

      // 5. Repetition Penalty from Cognitive Memory (e.g. distraction decay)
      let repetitionPenalty = 0;
      if (candidate.id === 'phone_distraction') {
        const recentCount = this.memory.getRecentCount(
          'distraction',
          candidate.id,
          60, // past 60 sim minutes
          currentMinutes
        );
        repetitionPenalty = recentCount * this.config.repetitionPenaltyPerOccurrence;
      }

      // 6. Milestone 7 Bounded Adaptive Behavior Experiment Evaluation
      let adaptationScoreContribution = 0;
      let adaptationDetails: BehaviorEvaluation['adaptationDetails'] = undefined;

      if (this.config.isAdaptationEnabled && this.config.isMemoryInfluenceEnabled) {
        const adaptRes = this.adaptiveSystem.evaluateCandidateAdaptation(
          candidate,
          context,
          weightedBase
        );
        adaptationScoreContribution = adaptRes.scoreDelta;
        adaptationDetails = {
          rulesApplied: adaptRes.rulesApplied,
          memoryIds: adaptRes.memoryIds,
          scoreDelta: adaptRes.scoreDelta,
        };
      }

      // 7. Compute Final Clamped Score [0, 100]
      const totalScore = weightedBase + weightedUrgency + continuityBonus - repetitionPenalty + adaptationScoreContribution;
      const finalScore = Math.max(0, Math.min(100, Math.round(totalScore)));

      const adaptExpl = adaptationScoreContribution !== 0
        ? `, Adaptation: ${adaptationScoreContribution >= 0 ? '+' : ''}${adaptationScoreContribution} (${adaptationDetails?.rulesApplied.join(', ') || ''})`
        : '';

      evaluations.push({
        candidateId: candidate.id,
        candidateName: candidate.displayName,
        isEligible: true,
        baseUtility: Math.round(weightedBase),
        scheduleCompatibility: rawEval.scheduleCompatibility,
        needUrgencyBonus: Math.round(weightedUrgency),
        continuityBonus,
        repetitionPenalty,
        memoryScoreContribution: adaptationScoreContribution,
        adaptationScoreContribution,
        adaptationDetails,
        finalScore,
        explanation: `${rawEval.explanation} [Score: ${finalScore}] (Base: ${Math.round(weightedBase)}, Urgency: +${Math.round(weightedUrgency)}, Continuity: +${continuityBonus}, RepPenalty: -${repetitionPenalty}${adaptExpl})`,
      });
    }

    // 8. Sort evaluations by eligibility, final score descending, and deterministic candidateId tie-breaking
    evaluations.sort((a, b) => {
      if (a.isEligible !== b.isEligible) {
        return a.isEligible ? -1 : 1;
      }
      if (b.finalScore !== a.finalScore) {
        return b.finalScore - a.finalScore;
      }
      // Lexicographical tie-breaker for 100% determinism
      return a.candidateId.localeCompare(b.candidateId);
    });

    const eligibleEvaluations = evaluations.filter((e) => e.isEligible);
    const topEvaluation = eligibleEvaluations.length > 0 ? eligibleEvaluations[0] : null;
    const winningCandidate = topEvaluation ? this.registry.get(topEvaluation.candidateId) || null : null;

    const explanation = topEvaluation
      ? `Selected '${topEvaluation.candidateName}' with score ${topEvaluation.finalScore}. Reason: ${topEvaluation.explanation}`
      : 'No eligible behavior candidates found for current context.';

    return {
      winningCandidate,
      topEvaluation,
      evaluations,
      rejectedCandidates,
      explanation,
    };
  }
}
