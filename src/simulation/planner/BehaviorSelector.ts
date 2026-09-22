import { CollegeSubBehavior } from '../types/simulation';
import { FlyActivity } from '../../types';
import { COLLEGE_BEHAVIOR_WEIGHTS } from '../config/defaults';

export interface BehaviorDetails {
  behavior: CollegeSubBehavior;
  name: string;
  flyActivity: FlyActivity;
  targetLandmark: string;
  description: string;
}

export const COLLEGE_BEHAVIOR_DETAILS: Record<CollegeSubBehavior, BehaviorDetails> = {
  lecture: {
    behavior: 'lecture',
    name: 'Listening to Lecture',
    flyActivity: 'perched_on_desk',
    targetLandmark: 'Front Row Student Desks',
    description: 'Perched attentively on the front desk observing the professor.',
  },
  dozing: {
    behavior: 'dozing',
    name: 'Dozing off in Class',
    flyActivity: 'perched_on_desk',
    targetLandmark: 'Back Seating & Student Backpacks',
    description: 'Resting quietly on the corner of a notebook.',
  },
  laptop: {
    behavior: 'laptop',
    name: 'Browsing Project on Laptop',
    flyActivity: 'perched_on_laptop',
    targetLandmark: 'Middle Row Student Desks',
    description: 'Perched on the laptop bezel watching code compile.',
  },
  reels: {
    behavior: 'reels',
    name: 'Watching Reels',
    flyActivity: 'perched_on_desk',
    targetLandmark: 'Middle Row Student Desks',
    description: 'Hovering near student smartphone scrolling vertical video feeds.',
  },
  mobile_game: {
    behavior: 'mobile_game',
    name: 'Playing Mobile Game',
    flyActivity: 'hovering',
    targetLandmark: 'Center Walking Aisle',
    description: 'Darting around quickly as student maneuvers in a mobile game.',
  },
};

export class BehaviorSelector {
  private weights: Record<CollegeSubBehavior, number>;
  private randomFn: () => number;
  private currentCollegeBehavior: CollegeSubBehavior | null = null;
  private lastEvaluationMinutes: number = -1;
  private intervalMinutes: number;

  constructor(
    customWeights?: Partial<Record<CollegeSubBehavior, number>>,
    intervalMinutes: number = 45,
    randomFn: () => number = Math.random
  ) {
    this.weights = { ...COLLEGE_BEHAVIOR_WEIGHTS, ...customWeights };
    this.intervalMinutes = intervalMinutes;
    this.randomFn = randomFn;
  }

  public setRandomFunction(fn: () => number): void {
    this.randomFn = fn;
  }

  public setWeights(weights: Partial<Record<CollegeSubBehavior, number>>): void {
    this.weights = { ...this.weights, ...weights };
  }

  public getWeights(): Record<CollegeSubBehavior, number> {
    return { ...this.weights };
  }

  /**
   * Evaluates and selects a sub-behavior for college activities.
   * Only re-evaluates when interval has passed or when force=true.
   */
  public evaluateCollegeBehavior(
    currentMinutes: number,
    forceReevaluate: boolean = false
  ): BehaviorDetails {
    const shouldReevaluate = 
      forceReevaluate ||
      this.currentCollegeBehavior === null ||
      this.lastEvaluationMinutes === -1 ||
      Math.abs(currentMinutes - this.lastEvaluationMinutes) >= this.intervalMinutes;

    if (!shouldReevaluate && this.currentCollegeBehavior) {
      return COLLEGE_BEHAVIOR_DETAILS[this.currentCollegeBehavior];
    }

    const selected = this.sampleWeightedBehavior();
    this.currentCollegeBehavior = selected;
    this.lastEvaluationMinutes = currentMinutes;

    return COLLEGE_BEHAVIOR_DETAILS[selected];
  }

  /**
   * Samples a behavior from configured weights using cumulative distribution.
   */
  public sampleWeightedBehavior(): CollegeSubBehavior {
    const keys = Object.keys(this.weights) as CollegeSubBehavior[];
    const totalWeight = keys.reduce((sum, key) => sum + Math.max(0, this.weights[key]), 0);

    if (totalWeight <= 0) {
      return 'lecture';
    }

    const roll = this.randomFn() * totalWeight;
    let accumulated = 0;

    for (const key of keys) {
      accumulated += Math.max(0, this.weights[key]);
      if (roll <= accumulated) {
        return key;
      }
    }

    return keys[0];
  }

  public getCurrentBehavior(): CollegeSubBehavior | null {
    return this.currentCollegeBehavior;
  }

  public reset(): void {
    this.currentCollegeBehavior = null;
    this.lastEvaluationMinutes = -1;
  }
}
