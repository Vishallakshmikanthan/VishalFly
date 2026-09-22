import { 
  InternalState, 
  CognitiveDrives, 
  PerceptionSnapshot 
} from '../types/cognition';
import { NeedState } from '../../types';

export class InternalStateManager {
  private internalState: InternalState;

  constructor(initialNeeds: NeedState) {
    this.internalState = {
      needs: { ...initialNeeds },
      drives: this.computeDrives(initialNeeds),
      currentGoal: 'Initialize daily routine',
      activeBehaviorId: null,
      behaviorCommitmentElapsedSimSeconds: 0,
      minimumCommitmentSimSeconds: 900, // 15 mins default
      recentBehaviorId: null,
      recentRepetitionCount: 0,
      lastDecisionTimestamp: 'Day 1 • 06:00',
    };
  }

  /**
   * Updates internal state from the perception snapshot (which reads existing NeedsSystem).
   */
  public update(
    perception: PerceptionSnapshot,
    deltaSimSeconds: number
  ): InternalState {
    // 1. Sync needs directly from the simulation NeedsSystem (single source of truth)
    this.internalState.needs = { ...perception.available.needs };

    // 2. Derive cognitive drives
    this.internalState.drives = this.computeDrives(this.internalState.needs);

    // 3. Update commitment duration
    if (this.internalState.activeBehaviorId) {
      this.internalState.behaviorCommitmentElapsedSimSeconds += deltaSimSeconds;
    }

    return this.getState();
  }

  /**
   * Derives psychological drives from biological needs.
   * Clarification: These are software heuristics inspired by ethological drives,
   * not claimed biological neural simulations.
   */
  private computeDrives(needs: NeedState): CognitiveDrives {
    // Arousal: High energy and low sleepiness promote arousal; fatigue dampens it.
    const rawArousal = (needs.energy * 0.5) + ((100 - needs.sleepiness) * 0.3) - (needs.fatigue * 0.2);
    const arousal = Math.max(0, Math.min(100, Math.round(rawArousal)));

    // Attentional Focus: Directly proportional to focus need, dampened if fatigued or excessively sleepy.
    const fatiguePenalty = needs.fatigue > 70 ? (needs.fatigue - 70) * 0.8 : 0;
    const sleepinessPenalty = needs.sleepiness > 75 ? (needs.sleepiness - 75) * 0.9 : 0;
    const attentionalFocus = Math.max(0, Math.min(100, Math.round(needs.focus - fatiguePenalty - sleepinessPenalty)));

    // Hunger Drive: Directly linked to hunger level
    const hungerDrive = Math.max(0, Math.min(100, needs.hunger));

    // Rest Drive: Combination of sleepiness and muscular/mental fatigue
    const rawRestDrive = (needs.sleepiness * 0.6) + (needs.fatigue * 0.4);
    const restDrive = Math.max(0, Math.min(100, Math.round(rawRestDrive)));

    // Social Drive: Directly linked to socialNeed
    const socialDrive = Math.max(0, Math.min(100, needs.socialNeed));

    // Effort Fatigue: High when fatigue is high or energy is depleted
    const rawEffortFatigue = (needs.fatigue * 0.7) + ((100 - needs.energy) * 0.3);
    const effortFatigue = Math.max(0, Math.min(100, Math.round(rawEffortFatigue)));

    return {
      arousal,
      attentionalFocus,
      hungerDrive,
      restDrive,
      socialDrive,
      effortFatigue,
    };
  }

  /**
   * Sets the newly active behavior and resets or updates commitment tracking.
   */
  public setActiveBehavior(
    behaviorId: string,
    goalDescription: string,
    timestamp: string,
    minimumCommitmentSeconds: number = 900
  ): void {
    if (this.internalState.activeBehaviorId === behaviorId) {
      // Same behavior continuing: increment repetition or maintain continuity
      this.internalState.recentRepetitionCount += 1;
    } else {
      // Behavior switch: update previous, reset commitment elapsed counter
      this.internalState.recentBehaviorId = this.internalState.activeBehaviorId;
      this.internalState.activeBehaviorId = behaviorId;
      this.internalState.behaviorCommitmentElapsedSimSeconds = 0;
      this.internalState.recentRepetitionCount = 1;
    }

    this.internalState.minimumCommitmentSimSeconds = minimumCommitmentSeconds;
    this.internalState.currentGoal = goalDescription;
    this.internalState.lastDecisionTimestamp = timestamp;
  }

  public getState(): InternalState {
    return {
      needs: { ...this.internalState.needs },
      drives: { ...this.internalState.drives },
      currentGoal: this.internalState.currentGoal,
      activeBehaviorId: this.internalState.activeBehaviorId,
      behaviorCommitmentElapsedSimSeconds: this.internalState.behaviorCommitmentElapsedSimSeconds,
      minimumCommitmentSimSeconds: this.internalState.minimumCommitmentSimSeconds,
      recentBehaviorId: this.internalState.recentBehaviorId,
      recentRepetitionCount: this.internalState.recentRepetitionCount,
      lastDecisionTimestamp: this.internalState.lastDecisionTimestamp,
    };
  }

  public setState(state: Partial<InternalState>): void {
    this.internalState = {
      ...this.internalState,
      ...state,
      needs: state.needs ? { ...state.needs } : this.internalState.needs,
      drives: state.drives ? { ...state.drives } : this.internalState.drives,
    };
  }

  public reset(initialNeeds: NeedState): void {
    this.internalState = {
      needs: { ...initialNeeds },
      drives: this.computeDrives(initialNeeds),
      currentGoal: 'Day started',
      activeBehaviorId: null,
      behaviorCommitmentElapsedSimSeconds: 0,
      minimumCommitmentSimSeconds: 900,
      recentBehaviorId: null,
      recentRepetitionCount: 0,
      lastDecisionTimestamp: 'Day 1 • 06:00',
    };
  }
}
