import { LaundryState } from '../types/simulation';
import { EventLogger } from '../events/EventLogger';
import { FlyActivity } from '../../types';

export interface LaundryUpdateResult extends LaundryState {
  targetLocation?: string;
  currentWaypoint?: string;
  flyActivity?: FlyActivity;
}

export class LaundrySystem {
  private state: LaundryState;
  private eventLogger: EventLogger;
  private targetDurationSec: number = 2700; // 45 sim minutes

  constructor(eventLogger: EventLogger) {
    this.eventLogger = eventLogger;
    this.state = {
      stage: 'idle',
      progressPercent: 0,
      elapsedSimSeconds: 0,
      isCompleted: false,
    };
  }

  public setTargetDuration(durationSec: number): void {
    this.targetDurationSec = Math.max(10, durationSec);
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
      message: 'Weekend laundry started: washing and organizing clothes in bedroom wardrobe.',
      activityId: 'laundry',
      locationId: 'bedroom',
    });

    return this.state;
  }

  public startDrying(timestamp: string, dayNumber: number): LaundryState {
    this.state = {
      stage: 'drying',
      progressPercent: 0,
      elapsedSimSeconds: 0,
      isCompleted: false,
    };

    this.eventLogger.log({
      timestamp,
      dayNumber,
      category: 'activity',
      message: 'Clothes placed on balcony for sunlight drying across clothesline.',
      activityId: 'dry_clothes',
      locationId: 'balcony',
    });

    return this.state;
  }

  public update(
    deltaSimSeconds: number,
    timestamp: string,
    dayNumber: number
  ): LaundryUpdateResult {
    if (this.state.stage === 'idle' || this.state.isCompleted || deltaSimSeconds <= 0) {
      return { ...this.state };
    }

    this.state.elapsedSimSeconds += deltaSimSeconds;

    let targetLocation: string | undefined = undefined;
    let currentWaypoint: string | undefined = undefined;
    let flyActivity: FlyActivity = 'laundry';

    const targetSec = this.targetDurationSec;
    const progress = Math.min(1.0, this.state.elapsedSimSeconds / targetSec);
    this.state.progressPercent = Math.min(100, Math.round(progress * 100));

    if (this.state.stage === 'washing' || this.state.stage === 'preparing_clothes') {
      targetLocation = 'bedroom';
      currentWaypoint = 'wardrobe';
      flyActivity = 'laundry';

      if (this.state.elapsedSimSeconds >= targetSec && !this.state.isCompleted) {
        this.state.isCompleted = true;
        this.state.progressPercent = 100;

        this.eventLogger.log({
          timestamp,
          dayNumber,
          category: 'activity',
          message: 'Laundry washing cycle completed. Ready to hang on balcony.',
          activityId: 'laundry',
          locationId: 'bedroom',
        });
      }
    } else if (
      this.state.stage === 'drying' ||
      this.state.stage === 'hanging_clothes' ||
      this.state.stage === 'collecting_clothes' ||
      this.state.stage === 'returning_to_room'
    ) {
      // During drying phase, character moves to balcony clothesline, dries, and returns to bedroom when done
      if (progress < 0.85) {
        targetLocation = 'balcony';
        currentWaypoint = 'clothesline';
        flyActivity = 'drying_clothes';
      } else {
        // Return behavior back to bedroom wardrobe
        targetLocation = 'bedroom';
        currentWaypoint = 'wardrobe';
        flyActivity = 'flying';
      }

      if (this.state.elapsedSimSeconds >= targetSec && !this.state.isCompleted) {
        this.state.isCompleted = true;
        this.state.progressPercent = 100;
        flyActivity = 'sitting';

        this.eventLogger.log({
          timestamp,
          dayNumber,
          category: 'activity',
          message: 'Balcony clothes drying completed and folded back in room.',
          activityId: 'dry_clothes',
          locationId: 'bedroom',
        });
      }
    }

    return {
      ...this.state,
      targetLocation,
      currentWaypoint,
      flyActivity,
    };
  }

  public getState(): LaundryState {
    return { ...this.state };
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
