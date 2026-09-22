import { FamilyCallState } from '../types/simulation';
import { EventLogger } from '../events/EventLogger';

export class FamilyCallSystem {
  private state: FamilyCallState;
  private eventLogger: EventLogger;
  private walkingPathWaypoints = [
    'path_node_1',
    'path_node_2',
    'path_node_3',
    'path_node_4',
  ];
  private waypointElapsedSimSeconds: number = 0;

  constructor(eventLogger: EventLogger) {
    this.eventLogger = eventLogger;
    this.state = {
      isActive: false,
      callDurationSimMinutes: 0,
      pathWaypointIndex: 0,
      isCompleted: false,
    };
  }

  public startCall(timestamp: string, dayNumber: number): FamilyCallState {
    this.state = {
      isActive: true,
      callDurationSimMinutes: 0,
      pathWaypointIndex: 0,
      isCompleted: false,
    };
    this.waypointElapsedSimSeconds = 0;

    this.eventLogger.log({
      timestamp,
      dayNumber,
      category: 'activity',
      message: 'Family call started — catching up with home.',
      activityId: 'family_call_walk',
      locationId: 'grounds',
    });

    this.eventLogger.log({
      timestamp,
      dayNumber,
      category: 'behavior',
      message: 'Walking around apartment grounds perimeter.',
      activityId: 'family_call_walk',
      locationId: 'grounds',
    });

    return this.state;
  }

  public endCall(timestamp: string, dayNumber: number): void {
    if (this.state.isActive) {
      this.state.isActive = false;
      this.state.isCompleted = true;

      this.eventLogger.log({
        timestamp,
        dayNumber,
        category: 'activity',
        message: `Family call completed (${Math.round(this.state.callDurationSimMinutes)} mins duration).`,
        activityId: 'family_call_walk',
        locationId: 'grounds',
      });
    }
  }

  public update(
    deltaSimSeconds: number
  ): { state: FamilyCallState; currentWaypoint: string; socialNeedDelta: number } {
    if (!this.state.isActive || deltaSimSeconds <= 0) {
      return { 
        state: this.state, 
        currentWaypoint: this.walkingPathWaypoints[0], 
        socialNeedDelta: 0 
      };
    }

    const simMinutes = deltaSimSeconds / 60;
    this.state.callDurationSimMinutes += simMinutes;
    this.waypointElapsedSimSeconds += deltaSimSeconds;

    // Cycle through perimeter walking waypoints every 30 simulated seconds
    if (this.waypointElapsedSimSeconds >= 30) {
      this.waypointElapsedSimSeconds = 0;
      this.state.pathWaypointIndex = (this.state.pathWaypointIndex + 1) % this.walkingPathWaypoints.length;
    }

    // Reduces social need: rate of -40 per hour = -(40/3600) per sim sec
    const socialNeedDelta = -(40 / 3600) * deltaSimSeconds;

    return {
      state: this.state,
      currentWaypoint: this.walkingPathWaypoints[this.state.pathWaypointIndex],
      socialNeedDelta,
    };
  }

  public getState(): FamilyCallState {
    return this.state;
  }

  public setState(state: FamilyCallState): void {
    this.state = { ...state };
  }

  public reset(): void {
    this.state = {
      isActive: false,
      callDurationSimMinutes: 0,
      pathWaypointIndex: 0,
      isCompleted: false,
    };
    this.waypointElapsedSimSeconds = 0;
  }
}
