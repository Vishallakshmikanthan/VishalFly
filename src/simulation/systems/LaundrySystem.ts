import { LaundryState } from '../types/simulation';
import { EventLogger } from '../events/EventLogger';

export class LaundrySystem {
  private state: LaundryState;
  private eventLogger: EventLogger;

  constructor(eventLogger: EventLogger) {
    this.eventLogger = eventLogger;
    this.state = {
      stage: 'idle',
      progressPercent: 0,
      elapsedSimSeconds: 0,
      isCompleted: false,
    };
  }

  public startLaundry(timestamp: string, dayNumber: number): LaundryState {
    this.state = {
      stage: 'washing',
      progressPercent: 0,
      elapsedSimSeconds: 0,
      isCompleted: false,
    };

    this.eventLogger.log({
      timestamp,
      dayNumber,
      category: 'activity',
      message: 'Weekend laundry started — washing and organizing clothes.',
      activityId: 'laundry',
      locationId: 'bedroom',
    });

    return this.state;
  }

  public startDrying(timestamp: string, dayNumber: number): LaundryState {
    this.state.stage = 'drying';
    this.state.elapsedSimSeconds = 0;
    this.state.progressPercent = 0;
    this.state.isCompleted = false;

    this.eventLogger.log({
      timestamp,
      dayNumber,
      category: 'activity',
      message: 'Clothes placed on balcony for sunlight drying.',
      activityId: 'dry_clothes',
      locationId: 'balcony',
    });

    return this.state;
  }

  public update(
    deltaSimSeconds: number,
    timestamp: string,
    dayNumber: number
  ): LaundryState {
    if (this.state.stage === 'idle' || this.state.isCompleted || deltaSimSeconds <= 0) {
      return this.state;
    }

    this.state.elapsedSimSeconds += deltaSimSeconds;

    // Washing stage takes 45 sim minutes (2700 sim seconds)
    // Drying stage takes 45 sim minutes (2700 sim seconds)
    const targetDurationSec = 2700;
    const progress = Math.min(1.0, this.state.elapsedSimSeconds / targetDurationSec);
    this.state.progressPercent = Math.min(100, Math.round(progress * 100));

    if (this.state.elapsedSimSeconds >= targetDurationSec && !this.state.isCompleted) {
      this.state.isCompleted = true;
      this.state.progressPercent = 100;

      if (this.state.stage === 'washing') {
        this.eventLogger.log({
          timestamp,
          dayNumber,
          category: 'activity',
          message: 'Laundry washing cycle completed. Ready to hang on balcony.',
          activityId: 'laundry',
          locationId: 'bedroom',
        });
      } else if (this.state.stage === 'drying') {
        this.eventLogger.log({
          timestamp,
          dayNumber,
          category: 'activity',
          message: 'Balcony clothes drying completed and folded.',
          activityId: 'dry_clothes',
          locationId: 'balcony',
        });
      }
    }

    return this.state;
  }

  public getState(): LaundryState {
    return this.state;
  }

  public setState(state: LaundryState): void {
    this.state = { ...state };
  }

  public reset(): void {
    this.state = {
      stage: 'idle',
      progressPercent: 0,
      elapsedSimSeconds: 0,
      isCompleted: false,
    };
  }
}
