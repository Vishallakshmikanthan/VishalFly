import { 
  CognitiveContext, 
  ActionDecision, 
  ActionRequest 
} from '../types/cognition';
import { IntegrationResult } from '../integration/BehaviorIntegrator';
import { CognitiveConfig } from '../config/CognitiveConfig';

export class ActionSelector {
  private config: CognitiveConfig;

  constructor(config: CognitiveConfig) {
    this.config = config;
  }

  public updateConfig(config: Partial<CognitiveConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Applies safety guards and schedule authority to the winning behavior candidate,
   * returning the final ActionDecision.
   */
  public selectAction(
    integration: IntegrationResult,
    context: CognitiveContext
  ): ActionDecision {
    const timestamp = context.perception.timestamp;
    const { winningCandidate, topEvaluation, evaluations, rejectedCandidates } = integration;

    // Safety Guard 1: In Transit Guard
    // If agent is currently travelling between locations, preserve travel until arrival.
    if (context.perception.available.isTravelling) {
      const travelRequest: ActionRequest = {
        type: 'TRAVEL',
        targetLocation: (context.activeScheduleEntry?.locationId as any) || 'bedroom',
        targetWaypoint: 'center',
        targetFlyActivity: 'flying',
        actionLabel: 'Traveling in Transit',
      };

      return {
        selectedCandidateId: 'travel_to_scheduled',
        selectedCandidateName: 'Travel in Transit',
        actionRequest: travelRequest,
        confidence: 1.0,
        isUrgentOverride: false,
        explanation: 'Active travel phase in progress; motion safety guard prevents mid-transit behavior switching.',
        evaluations,
        rejectedCandidates,
        timestamp,
      };
    }

    // Safety Guard 2: Multi-Stage Non-Interruptible Activities
    // Do not abort mid-exercise set or drying sequence
    const workoutSession = context.workoutSession;
    if (
      workoutSession &&
      !workoutSession.isCompleted &&
      (workoutSession.state === 'LIFT' || workoutSession.state === 'SETUP')
    ) {
      const currentCandidate = winningCandidate?.id === 'perform_workout' ? winningCandidate : null;
      if (!currentCandidate) {
        return {
          selectedCandidateId: 'perform_workout',
          selectedCandidateName: 'Gym Strength Training (Locked)',
          actionRequest: {
            type: 'PROGRESS_WORKOUT',
            targetFlyActivity: 'workout',
            actionLabel: 'Executing Active Workout Set',
          },
          confidence: 0.95,
          isUrgentOverride: false,
          explanation: 'Workout active set in progress (LIFT/SETUP); protected from interruption by activity safety guard.',
          evaluations,
          rejectedCandidates,
          timestamp,
        };
      }
    }

    // Safety Guard 3: Minimum Commitment Interval (Hysteresis Guard)
    // Prevents oscillation to minor distractions before minimum commitment time elapsed
    const activeBehaviorId = context.internalState.activeBehaviorId;
    const commitmentElapsed = context.internalState.behaviorCommitmentElapsedSimSeconds;
    const minCommitment = context.internalState.minimumCommitmentSimSeconds;

    if (
      activeBehaviorId &&
      winningCandidate &&
      winningCandidate.id !== activeBehaviorId &&
      commitmentElapsed < minCommitment
    ) {
      // Check if winning candidate is an urgent need override
      const isUrgent = this.checkUrgentNeed(context, winningCandidate.id);
      
      if (!isUrgent) {
        // If the current active behavior is still eligible, enforce commitment!
        const currentActiveCandidate = evaluations.find(
          (e) => e.candidateId === activeBehaviorId && e.isEligible
        );

        if (currentActiveCandidate) {
          return {
            selectedCandidateId: activeBehaviorId,
            selectedCandidateName: currentActiveCandidate.candidateName,
            actionRequest: {
              type: 'CONTINUE_ACTIVITY',
              actionLabel: `Continuing committed behavior (${Math.round((minCommitment - commitmentElapsed) / 60)}m left)`,
            },
            confidence: 0.85,
            isUrgentOverride: false,
            explanation: `Hysteresis guard active: committed to '${currentActiveCandidate.candidateName}' for ${Math.round(minCommitment / 60)} min (${Math.round(commitmentElapsed / 60)}m elapsed). Suppressed switch to '${winningCandidate.displayName}'.`,
            evaluations,
            rejectedCandidates,
            timestamp,
          };
        }
      }
    }

    // If no candidate was eligible, fallback safely
    if (!winningCandidate || !topEvaluation) {
      return {
        selectedCandidateId: 'fallback_idle',
        selectedCandidateName: 'Fallback Activity',
        actionRequest: {
          type: 'IDLE_WAIT',
          actionLabel: 'Observing Schedule Fallback',
        },
        confidence: 0.5,
        isUrgentOverride: false,
        explanation: 'No behavior candidates passed preconditions; falling back to schedule baseline.',
        evaluations,
        rejectedCandidates,
        timestamp,
      };
    }

    // Check if this selection constitutes an urgent override
    const isUrgentOverride = this.checkUrgentNeed(context, winningCandidate.id);
    const actionRequest = winningCandidate.createActionRequest(context);

    return {
      selectedCandidateId: winningCandidate.id,
      selectedCandidateName: winningCandidate.displayName,
      actionRequest,
      confidence: topEvaluation.finalScore / 100,
      isUrgentOverride,
      explanation: topEvaluation.explanation,
      evaluations,
      rejectedCandidates,
      timestamp,
    };
  }

  /**
   * Evaluates if a behavior qualifies as an urgent physiological need override.
   */
  private checkUrgentNeed(context: CognitiveContext, candidateId: string): boolean {
    const needs = context.perception.available.needs;
    const thresh = this.config.urgencyThresholds;

    if (candidateId === 'eat_meal' && needs.hunger >= thresh.criticalHungerHigh) {
      return true;
    }
    if (candidateId === 'rest_and_sleep' && (needs.sleepiness >= thresh.criticalSleepinessHigh || needs.energy <= thresh.criticalEnergyLow)) {
      return true;
    }

    return false;
  }
}
