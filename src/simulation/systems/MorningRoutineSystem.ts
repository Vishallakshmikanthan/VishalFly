import { MorningRoutineState } from '../types/simulation';
import { EventLogger } from '../events/EventLogger';

export class MorningRoutineSystem {
  private state: MorningRoutineState;
  private eventLogger: EventLogger;

  constructor(eventLogger: EventLogger) {
    this.eventLogger = eventLogger;
    this.state = {
      stage: 'idle',
      elapsedSimSeconds: 0,
      progressPercent: 0,
      isCompleted: false,
    };
  }

  public startRoutine(timestamp: string, dayNumber: number): MorningRoutineState {
    this.state = {
      stage: 'waking_up',
      elapsedSimSeconds: 0,
      progressPercent: 0,
      isCompleted: false,
    };

    this.eventLogger.log({
      timestamp,
      dayNumber,
      category: 'lifecycle',
      message: 'VishalFly woke up.',
      activityId: 'wake_up_morning_routine',
      locationId: 'bedroom',
    });

    this.eventLogger.log({
      timestamp,
      dayNumber,
      category: 'activity',
      message: 'Morning routine started.',
      activityId: 'wake_up_morning_routine',
      locationId: 'bedroom',
    });

    return this.state;
  }

  public update(
    deltaSimSeconds: number,
    timestamp: string,
    dayNumber: number
  ): { state: MorningRoutineState; currentWaypoint: string; flyActivity: string } {
    if (this.state.stage === 'idle' || this.state.isCompleted || deltaSimSeconds <= 0) {
      return { 
        state: this.state, 
        currentWaypoint: 'bed', 
        flyActivity: 'hovering' 
      };
    }

    this.state.elapsedSimSeconds += deltaSimSeconds;

    // Routine stages across ~1800 simulated seconds (30 mins scheduled)
    // Or compressed into smooth visible sequence:
    // 0 - 300s: waking_up (at bed, stretching)
    // 300 - 800s: leaving_bed (hovering to wardrobe/center)
    // 800 - 1300s: moving_room (around room, window/plants)
    // 1300 - 1800s: preparation (at study desk, packing/reviewing)
    const totalDurationSec = 1800;
    this.state.progressPercent = Math.min(100, Math.round((this.state.elapsedSimSeconds / totalDurationSec) * 100));

    let currentWaypoint = 'bed';
    let flyActivity = 'hovering';

    if (this.state.elapsedSimSeconds < 300) {
      this.state.stage = 'waking_up';
      currentWaypoint = 'bed';
      flyActivity = 'sleeping';
    } else if (this.state.elapsedSimSeconds < 800) {
      this.state.stage = 'leaving_bed';
      currentWaypoint = 'wardrobe';
      flyActivity = 'flying';
    } else if (this.state.elapsedSimSeconds < 1300) {
      this.state.stage = 'moving_room';
      currentWaypoint = 'balcony_door';
      flyActivity = 'walking';
    } else if (this.state.elapsedSimSeconds < 1800) {
      this.state.stage = 'preparation';
      currentWaypoint = 'desk';
      flyActivity = 'working';
    } else {
      if (!this.state.isCompleted) {
        this.state.stage = 'completed';
        this.state.isCompleted = true;
        this.state.progressPercent = 100;

        this.eventLogger.log({
          timestamp,
          dayNumber,
          category: 'activity',
          message: 'Morning routine completed.',
          activityId: 'wake_up_morning_routine',
          locationId: 'bedroom',
        });
      }
      currentWaypoint = 'desk';
      flyActivity = 'sitting';
    }

    return { state: this.state, currentWaypoint, flyActivity };
  }

  public getState(): MorningRoutineState {
    return this.state;
  }

  public setState(state: MorningRoutineState): void {
    this.state = { ...state };
  }

  public reset(): void {
    this.state = {
      stage: 'idle',
      elapsedSimSeconds: 0,
      progressPercent: 0,
      isCompleted: false,
    };
  }
}
