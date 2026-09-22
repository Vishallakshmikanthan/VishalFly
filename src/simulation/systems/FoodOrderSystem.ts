import { FoodOrderState } from '../types/simulation';
import { EventLogger } from '../events/EventLogger';

export class FoodOrderSystem {
  private state: FoodOrderState;
  private eventLogger: EventLogger;

  constructor(eventLogger: EventLogger) {
    this.eventLogger = eventLogger;
    this.state = {
      stage: 'idle',
      elapsedSimSeconds: 0,
      deliveryDurationSimSeconds: 900, // 15 sim minutes
      progressPercent: 0,
      isCompleted: false,
    };
  }

  public triggerOrder(timestamp: string, dayNumber: number): FoodOrderState {
    this.state = {
      stage: 'order_placed',
      elapsedSimSeconds: 0,
      deliveryDurationSimSeconds: 900,
      progressPercent: 0,
      isCompleted: false,
    };

    this.eventLogger.log({
      timestamp,
      dayNumber,
      category: 'activity',
      message: 'Food order placed — waiting for delivery partner.',
      locationId: 'bedroom',
    });

    return this.state;
  }

  public update(
    deltaSimSeconds: number,
    timestamp: string,
    dayNumber: number
  ): { state: FoodOrderState; hungerDelta: number; targetLocation?: string; currentWaypoint?: string } {
    if (this.state.stage === 'idle' || this.state.isCompleted || deltaSimSeconds <= 0) {
      return { state: this.state, hungerDelta: 0 };
    }

    this.state.elapsedSimSeconds += deltaSimSeconds;
    let hungerDelta = 0;
    let targetLocation: string | undefined = undefined;
    let currentWaypoint: string | undefined = undefined;

    switch (this.state.stage) {
      case 'order_placed':
        this.state.stage = 'waiting_delivery';
        this.state.elapsedSimSeconds = 0;
        break;

      case 'waiting_delivery':
        // Wait simulated delivery time (15 mins)
        this.state.progressPercent = Math.min(
          35,
          Math.round((this.state.elapsedSimSeconds / this.state.deliveryDurationSimSeconds) * 35)
        );

        if (this.state.elapsedSimSeconds >= this.state.deliveryDurationSimSeconds) {
          this.state.stage = 'walking_to_gate';
          this.state.elapsedSimSeconds = 0;
          targetLocation = 'grounds';
          currentWaypoint = 'apartment_gate';

          this.eventLogger.log({
            timestamp,
            dayNumber,
            category: 'travel',
            message: 'Delivery partner arrived outside! Walking to apartment gate.',
            locationId: 'grounds',
          });
        }
        break;

      case 'walking_to_gate':
        currentWaypoint = 'apartment_gate';
        this.state.progressPercent = 45;
        // Walking takes ~30 sim seconds
        if (this.state.elapsedSimSeconds >= 30) {
          this.state.stage = 'collecting_food';
          this.state.elapsedSimSeconds = 0;

          this.eventLogger.log({
            timestamp,
            dayNumber,
            category: 'activity',
            message: 'Food collected at apartment gate from delivery executive.',
            locationId: 'grounds',
          });
        }
        break;

      case 'collecting_food':
        currentWaypoint = 'apartment_gate';
        this.state.progressPercent = 55;
        if (this.state.elapsedSimSeconds >= 10) {
          this.state.stage = 'walking_back';
          this.state.elapsedSimSeconds = 0;
          targetLocation = 'dining';
          currentWaypoint = 'dining_table_seat';

          this.eventLogger.log({
            timestamp,
            dayNumber,
            category: 'travel',
            message: 'Carrying hot meal back to dining table.',
            locationId: 'dining',
          });
        }
        break;

      case 'walking_back':
        targetLocation = 'dining';
        currentWaypoint = 'dining_table_seat';
        this.state.progressPercent = 65;
        if (this.state.elapsedSimSeconds >= 30) {
          this.state.stage = 'eating';
          this.state.elapsedSimSeconds = 0;

          this.eventLogger.log({
            timestamp,
            dayNumber,
            category: 'activity',
            message: 'Midnight meal feast started at dining table.',
            locationId: 'dining',
          });
        }
        break;

      case 'eating': {
        currentWaypoint = 'dining_table_seat';
        const eatingDuration = 300; // 5 sim minutes
        this.state.progressPercent = Math.min(
          100,
          65 + Math.round((this.state.elapsedSimSeconds / eatingDuration) * 35)
        );

        const portion = deltaSimSeconds / eatingDuration;
        hungerDelta = -48 * portion; // reduce hunger

        if (this.state.elapsedSimSeconds >= eatingDuration) {
          this.state.stage = 'completed';
          this.state.isCompleted = true;
          this.state.progressPercent = 100;

          this.eventLogger.log({
            timestamp,
            dayNumber,
            category: 'activity',
            message: 'Midnight meal completed — hunger fully satisfied.',
            locationId: 'dining',
          });
        }
        break;
      }

      case 'completed':
        this.state.progressPercent = 100;
        this.state.isCompleted = true;
        break;
    }

    return { state: this.state, hungerDelta, targetLocation, currentWaypoint };
  }

  public getState(): FoodOrderState {
    return this.state;
  }

  public setState(state: FoodOrderState): void {
    this.state = { ...state };
  }

  public reset(): void {
    this.state = {
      stage: 'idle',
      elapsedSimSeconds: 0,
      deliveryDurationSimSeconds: 900,
      progressPercent: 0,
      isCompleted: false,
    };
  }
}
