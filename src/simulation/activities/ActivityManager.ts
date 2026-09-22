import { 
  ActivityInstance, 
  ScheduleEntry, 
  ActivityLifecycleState 
} from '../types/simulation';
import { getActivityDefinition } from './ActivityDefinitions';
import { EventLogger } from '../events/EventLogger';

export interface ActivityManagerCallbacks {
  onLocationChangeRequest?: (targetLocation: string, message: string) => void;
  onActivityStateChange?: (instance: ActivityInstance) => void;
}

export class ActivityManager {
  private currentInstance: ActivityInstance | null = null;
  private travelElapsedSeconds: number = 0;
  private travelDurationSeconds: number;
  private currentLocationId: string;
  private eventLogger: EventLogger;
  private callbacks: ActivityManagerCallbacks;
  private lastStartedScheduleEntryId: string | null = null;

  constructor(
    initialLocationId: string,
    eventLogger: EventLogger,
    travelDurationSeconds: number = 10,
    callbacks: ActivityManagerCallbacks = {}
  ) {
    this.currentLocationId = initialLocationId;
    this.eventLogger = eventLogger;
    this.travelDurationSeconds = travelDurationSeconds;
    this.callbacks = callbacks;
  }

  public getCurrentInstance(): ActivityInstance | null {
    return this.currentInstance;
  }

  public getCurrentLocation(): string {
    return this.currentLocationId;
  }

  public setCurrentLocation(loc: string): void {
    this.currentLocationId = loc;
  }

  public setTravelDuration(durationSeconds: number): void {
    this.travelDurationSeconds = Math.max(0, durationSeconds);
  }

  public transitionToActivity(
    entry: ScheduleEntry,
    timestamp: string,
    dayNumber: number
  ): void {
    this.syncScheduleEntry(entry, entry.startMinutes, timestamp, dayNumber);
  }

  /**
   * Called by the simulation engine when the schedule indicates an entry is active.
   */
  public syncScheduleEntry(
    entry: ScheduleEntry,
    currentMinutes: number,
    timestamp: string,
    dayNumber: number
  ): void {
    // If we are already running this exact schedule entry, do not restart it
    if (this.currentInstance && this.currentInstance.scheduleEntry.id === entry.id) {
      return;
    }

    // Complete previous activity if one was active
    if (this.currentInstance && this.currentInstance.state !== 'completed') {
      this.completeCurrentActivity(timestamp, dayNumber);
    }

    const definition = getActivityDefinition(entry.activityId);
    const destination = entry.locationId;
    const isDifferentLocation = destination !== this.currentLocationId && destination !== 'travel';

    const newInstance: ActivityInstance = {
      definition,
      scheduleEntry: entry,
      state: isDifferentLocation ? 'travelling' : 'starting',
      startTimeMinutes: currentMinutes,
      elapsedSimulatedSeconds: 0,
      targetLocation: destination,
    };

    this.currentInstance = newInstance;
    this.travelElapsedSeconds = 0;

    if (isDifferentLocation) {
      this.eventLogger.log({
        timestamp,
        dayNumber,
        category: 'travel',
        message: `Commencing travel to ${destination} for ${entry.name}`,
        activityId: entry.activityId,
        locationId: destination,
      });

      if (this.callbacks.onLocationChangeRequest) {
        this.callbacks.onLocationChangeRequest(
          destination,
          `Traveling to ${destination} for ${entry.name}`
        );
      }
    } else {
      this.startActivity(timestamp, dayNumber);
    }

    if (this.callbacks.onActivityStateChange && this.currentInstance) {
      this.callbacks.onActivityStateChange(this.currentInstance);
    }
  }

  private startActivity(timestamp: string, dayNumber: number): void {
    if (!this.currentInstance) return;

    this.currentInstance.state = 'active';
    this.currentLocationId = this.currentInstance.targetLocation;

    if (this.lastStartedScheduleEntryId !== this.currentInstance.scheduleEntry.id) {
      this.lastStartedScheduleEntryId = this.currentInstance.scheduleEntry.id;
      this.eventLogger.log({
        timestamp,
        dayNumber,
        category: 'activity',
        message: `Started: ${this.currentInstance.scheduleEntry.name} at ${this.currentLocationId}`,
        activityId: this.currentInstance.definition.id,
        locationId: this.currentLocationId,
      });

      if (this.currentInstance.definition.eventMessages?.onStart) {
        this.eventLogger.log({
          timestamp,
          dayNumber,
          category: 'activity',
          message: this.currentInstance.definition.eventMessages.onStart,
          activityId: this.currentInstance.definition.id,
          locationId: this.currentLocationId,
        });
      }
    }
  }

  public completeCurrentActivity(timestamp: string, dayNumber: number): void {
    if (!this.currentInstance || this.currentInstance.state === 'completed') return;

    this.currentInstance.state = 'completed';
    this.eventLogger.log({
      timestamp,
      dayNumber,
      category: 'activity',
      message: `Completed: ${this.currentInstance.scheduleEntry.name}`,
      activityId: this.currentInstance.definition.id,
      locationId: this.currentLocationId,
    });

    if (this.currentInstance.definition.eventMessages?.onComplete) {
      this.eventLogger.log({
        timestamp,
        dayNumber,
        category: 'activity',
        message: this.currentInstance.definition.eventMessages.onComplete,
        activityId: this.currentInstance.definition.id,
        locationId: this.currentLocationId,
      });
    }
  }

  public setProgress(progressPercent: number, actionLabel?: string): void {
    if (!this.currentInstance) return;
    this.currentInstance.progressPercent = Math.min(100, Math.max(0, progressPercent));
    if (actionLabel) {
      this.currentInstance.currentAction = actionLabel;
    }
  }

  /**
   * Advances the activity state machine with simulated elapsed delta time.
   */
  public update(
    deltaSimulatedSeconds: number,
    timestamp: string,
    dayNumber: number
  ): void {
    if (!this.currentInstance || deltaSimulatedSeconds <= 0) {
      return;
    }

    this.currentInstance.elapsedSimulatedSeconds += deltaSimulatedSeconds;

    // Handle travel progress
    if (this.currentInstance.state === 'travelling') {
      this.travelElapsedSeconds += deltaSimulatedSeconds;

      if (this.travelElapsedSeconds >= this.travelDurationSeconds) {
        // Arrived at destination
        this.currentLocationId = this.currentInstance.targetLocation;

        this.eventLogger.log({
          timestamp,
          dayNumber,
          category: 'travel',
          message: `Arrived at ${this.currentLocationId}`,
          locationId: this.currentLocationId,
        });

        this.startActivity(timestamp, dayNumber);

        if (this.callbacks.onActivityStateChange) {
          this.callbacks.onActivityStateChange(this.currentInstance);
        }
      }
    }
  }

  public isTravelling(): boolean {
    return this.currentInstance?.state === 'travelling';
  }

  public getLifecycleState(): ActivityLifecycleState {
    return this.currentInstance ? this.currentInstance.state : 'pending';
  }

  public reset(): void {
    this.currentInstance = null;
    this.travelElapsedSeconds = 0;
    this.lastStartedScheduleEntryId = null;
  }
}
