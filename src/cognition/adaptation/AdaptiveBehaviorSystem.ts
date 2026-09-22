import { CognitiveConfig } from '../config/CognitiveConfig';
import { CognitiveMemory } from '../memory/CognitiveMemory';
import { CognitiveContext, BehaviorCandidate } from '../types/cognition';

export interface AdaptationEvaluationResult {
  scoreDelta: number;
  rulesApplied: string[];
  memoryIds: string[];
  explanation: string;
}

export class AdaptiveBehaviorSystem {
  private config: CognitiveConfig;
  private memory: CognitiveMemory;

  constructor(config: CognitiveConfig, memory: CognitiveMemory) {
    this.config = config;
    this.memory = memory;
  }

  public updateConfig(config: CognitiveConfig): void {
    this.config = config;
  }

  /**
   * Evaluates bounded, inspectable adaptation experiments for a specific candidate behavior.
   * Returns deterministic score deltas and explicit explanations.
   */
  public evaluateCandidateAdaptation(
    candidate: BehaviorCandidate,
    context: CognitiveContext,
    _baseUtility: number
  ): AdaptationEvaluationResult {
    // If adaptation or memory influence is disabled, return strict zero
    if (!this.config.isAdaptationEnabled || !this.config.isMemoryInfluenceEnabled) {
      return {
        scoreDelta: 0,
        rulesApplied: [],
        memoryIds: [],
        explanation: !this.config.isAdaptationEnabled
          ? 'Adaptation disabled by configuration.'
          : 'Memory influence disabled by configuration.',
      };
    }

    const rulesApplied: string[] = [];
    const memoryIds: string[] = [];
    let delta = 0;
    const currentMinutes = context.perception.simulatedMinutes;
    const currentLocation = context.perception.available.currentLocationId;
    const maxAdj = this.config.adaptationMaxAdjustment;

    // Rule 1: Repetition Satiety (Anti-Loop Rule for Optional Behaviors)
    const optionalBehaviorIds = ['phone_distraction', 'doze_in_class', 'room_idle', 'laptop_browse'];
    if (optionalBehaviorIds.includes(candidate.id)) {
      const recentCount = this.memory.getRepeatedBehaviorCount(candidate.id, 60, currentMinutes);
      if (recentCount > 0) {
        const penalty = Math.min(18, recentCount * 6);
        delta -= penalty;
        rulesApplied.push(`Repetition Satiety (-${penalty} pts for ${recentCount} recent selections)`);
      }
    }

    // Rule 2: Outcome Feedback Rule (Recent failures vs successes)
    const failureCount = this.memory.getRecentFailureOrRejectionCount(candidate.id, 90, currentMinutes);
    if (failureCount > 0) {
      const failurePenalty = Math.min(15, failureCount * this.config.outcomeInfluenceWeight);
      delta -= failurePenalty;
      rulesApplied.push(`Outcome Failure Penalty (-${failurePenalty} pts for ${failureCount} recent rejections)`);

      const recentFailures = this.memory.getRecentOutcomes(5, 'rejected');
      recentFailures.forEach((f) => {
        if (f.key === candidate.id || f.sourceBehaviorId === candidate.id) {
          memoryIds.push(f.id);
        }
      });
    } else {
      // Mild reinforcement if recently completed without issue
      const latestOutcome = this.memory.getLatestOutcomeForBehavior(candidate.id);
      if (latestOutcome && latestOutcome.outcome === 'completed') {
        const age = Math.abs(currentMinutes - latestOutcome.simulatedMinutes);
        if (age <= 45 && !optionalBehaviorIds.includes(candidate.id)) {
          delta += 4;
          rulesApplied.push('Recent Successful Completion Bonus (+4 pts)');
          memoryIds.push(latestOutcome.id);
        }
      }
    }

    // Rule 3: Reachable Interaction Point Proximity Preference
    // Favors optional candidates whose interaction points are in the current room
    if (candidate.id === 'room_idle' && currentLocation === 'bedroom') {
      delta += 5;
      rulesApplied.push('Current Location Convenience (+5 pts in bedroom)');
    } else if (candidate.id === 'laptop_browse' && currentLocation === 'classroom') {
      delta += 4;
      rulesApplied.push('Interaction Point Proximity (+4 pts at desk)');
    }

    // Rule 4: Routine Satiation & Prioritization Rule
    const routineMappings: Record<string, { tag: string; label: string }> = {
      perform_workout: { tag: 'workout', label: 'Gym Workout' },
      eat_meal: { tag: 'meal', label: 'Scheduled Meal' },
      perform_laundry: { tag: 'laundry', label: 'Laundry Routine' },
      family_call_walk: { tag: 'family_call', label: 'Family Call' },
      wake_up_morning_routine: { tag: 'morning_routine', label: 'Morning Routine' },
    };

    if (routineMappings[candidate.id]) {
      const routine = routineMappings[candidate.id];
      const hasCompleted = this.memory.hasCompletedRoutineRecently(
        routine.tag,
        this.config.routineMemoryWindowMinutes,
        currentMinutes
      );

      if (hasCompleted) {
        // Routine already confirmed completed within memory window
        const isCurrentlyScheduled = context.activeScheduleEntry?.activityId === candidate.id;
        // Only penalize if not actively scheduled right now
        if (!isCurrentlyScheduled) {
          delta -= 12;
          rulesApplied.push(`Routine Satiation (-12 pts: ${routine.label} already completed recently)`);
        }
      }
    }

    // Rule 5: Post-Exertion Rest Adaptation Rule
    const restCandidates = ['rest_and_sleep', 'room_idle', 'doze_in_class'];
    if (restCandidates.includes(candidate.id)) {
      const recentOutcomes = this.memory.getRecentOutcomes(10, 'completed');
      const strenuousMemories = recentOutcomes.filter((m) => {
        const isStrenuous = m.key === 'perform_workout' || m.key === 'work_project' || m.tags.includes('workout');
        const age = Math.abs(currentMinutes - m.simulatedMinutes);
        return isStrenuous && age <= 120;
      });

      if (strenuousMemories.length > 0) {
        const boost = 8;
        delta += boost;
        rulesApplied.push(`Post-Exertion Recovery (+${boost} pts following completed physical/cognitive effort)`);
        strenuousMemories.forEach((m) => memoryIds.push(m.id));
      }
    }

    // Strict clamping within configured bounds [-maxAdjustment, +maxAdjustment]
    const clampedDelta = Math.max(-maxAdj, Math.min(maxAdj, delta));

    const explanation = rulesApplied.length > 0
      ? `Adaptation adjusted score by ${clampedDelta >= 0 ? '+' : ''}${clampedDelta}: ${rulesApplied.join('; ')}`
      : 'No adaptation rules triggered for candidate.';

    return {
      scoreDelta: clampedDelta,
      rulesApplied,
      memoryIds,
      explanation,
    };
  }
}
