import { NeedState, NeedType } from '../types/simulation';
import { NeedsModifiers } from '../types/simulation';
import { INITIAL_NEEDS_STATE, NEEDS_THRESHOLDS } from '../config/defaults';
import { EventLogger } from '../events/EventLogger';

export class NeedsSystem {
  private state: NeedState;
  private eventLogger: EventLogger;
  private alertedThresholds: Set<string> = new Set();

  constructor(eventLogger: EventLogger, initialState?: Partial<NeedState>) {
    this.eventLogger = eventLogger;
    this.state = {
      ...INITIAL_NEEDS_STATE,
      ...initialState,
    };
  }

  public getState(): NeedState {
    return { ...this.state };
  }

  public setNeed(type: NeedType, value: number): void {
    this.state[type] = this.clamp(value, 0, 100);
  }

  public clamp(value: number, min: number = 0, max: number = 100): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Applies hourly modifiers multiplied by simulated delta time.
   */
  public update(
    deltaSimulatedSeconds: number,
    modifiers: NeedsModifiers,
    timestamp: string,
    dayNumber: number
  ): void {
    if (deltaSimulatedSeconds <= 0) return;

    const deltaHours = deltaSimulatedSeconds / 3600;

    this.state.energy = this.clamp(this.state.energy + modifiers.energyPerHour * deltaHours);
    this.state.hunger = this.clamp(this.state.hunger + modifiers.hungerPerHour * deltaHours);
    this.state.sleepiness = this.clamp(this.state.sleepiness + modifiers.sleepinessPerHour * deltaHours);
    this.state.fatigue = this.clamp(this.state.fatigue + modifiers.fatiguePerHour * deltaHours);
    this.state.focus = this.clamp(this.state.focus + modifiers.focusPerHour * deltaHours);
    this.state.socialNeed = this.clamp(this.state.socialNeed + modifiers.socialNeedPerHour * deltaHours);

    this.checkThresholds(timestamp, dayNumber);
  }

  private checkThresholds(timestamp: string, dayNumber: number): void {
    const checks: { type: NeedType; name: string; highMessage: string; lowMessage: string }[] = [
      {
        type: 'energy',
        name: 'Energy',
        highMessage: 'Energy is high and revitalized.',
        lowMessage: 'Energy is critically low! Fly needs rest.',
      },
      {
        type: 'hunger',
        name: 'Hunger',
        highMessage: 'Hunger is very high! Needs a meal soon.',
        lowMessage: 'Well-fed and satiated.',
      },
      {
        type: 'sleepiness',
        name: 'Sleepiness',
        highMessage: 'Sleepiness is severe! Struggles to stay awake.',
        lowMessage: 'Fully awake and alert.',
      },
      {
        type: 'fatigue',
        name: 'Fatigue',
        highMessage: 'Physical fatigue is intense from workout.',
        lowMessage: 'Physical fatigue is completely recovered.',
      },
      {
        type: 'focus',
        name: 'Focus',
        highMessage: 'Peak focus and mental clarity!',
        lowMessage: 'Focus has deteriorated; prone to distraction.',
      },
      {
        type: 'socialNeed',
        name: 'Social Need',
        highMessage: 'Social isolation felt; family call recommended.',
        lowMessage: 'Socially fulfilled and connected.',
      },
    ];

    for (const item of checks) {
      const val = this.state[item.type];
      const highKey = `${item.type}_high`;
      const lowKey = `${item.type}_low`;

      if (val >= NEEDS_THRESHOLDS.CRITICAL_HIGH) {
        if (!this.alertedThresholds.has(highKey)) {
          this.alertedThresholds.add(highKey);
          this.alertedThresholds.delete(lowKey);
          this.eventLogger.log({
            timestamp,
            dayNumber,
            category: 'need',
            message: item.highMessage,
          });
        }
      } else if (val <= NEEDS_THRESHOLDS.CRITICAL_LOW) {
        if (!this.alertedThresholds.has(lowKey)) {
          this.alertedThresholds.add(lowKey);
          this.alertedThresholds.delete(highKey);
          this.eventLogger.log({
            timestamp,
            dayNumber,
            category: 'need',
            message: item.lowMessage,
          });
        }
      } else {
        // Clear alerts when returned to normal band
        if (val > 30 && val < 70) {
          this.alertedThresholds.delete(highKey);
          this.alertedThresholds.delete(lowKey);
        }
      }
    }
  }

  public reset(initialState?: Partial<NeedState>): void {
    this.state = {
      ...INITIAL_NEEDS_STATE,
      ...initialState,
    };
    this.alertedThresholds.clear();
  }
}
