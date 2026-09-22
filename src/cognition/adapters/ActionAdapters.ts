import { 
  ActionDecision 
} from '../types/cognition';
import { ActivityManager } from '../../simulation/activities/ActivityManager';
import { EventLogger } from '../../simulation/events/EventLogger';
import { FlyActivity, LocationId } from '../../types';

export interface ActionAdapterResult {
  success: boolean;
  executedType: string;
  appliedWaypoint?: string;
  appliedFlyActivity?: FlyActivity;
  appliedActionLabel?: string;
  appliedLocation?: LocationId;
  rejectionReason?: string;
}

export class ActionAdapters {
  private activityManager: ActivityManager;
  private eventLogger: EventLogger;

  constructor(activityManager: ActivityManager, eventLogger: EventLogger) {
    this.activityManager = activityManager;
    this.eventLogger = eventLogger;
  }

  /**
   * Executes a semantic action decision by interfacing with the existing activity and navigation controllers.
   * Handles rejections gracefully without throwing or breaking existing state.
   */
  public execute(decision: ActionDecision): ActionAdapterResult {
    const req = decision.actionRequest;

    switch (req.type) {
      case 'TRAVEL': {
        if (!req.targetLocation) {
          this.logRejection(decision, 'Travel request omitted targetLocation.');
          return { success: false, executedType: req.type, rejectionReason: 'Missing targetLocation' };
        }

        const currentLocation = this.activityManager.getCurrentLocation();
        if (currentLocation === req.targetLocation) {
          return {
            success: true,
            executedType: req.type,
            appliedLocation: currentLocation as LocationId,
            appliedFlyActivity: 'hovering',
            appliedActionLabel: 'At Destination',
          };
        }

        // Set target location in ActivityManager (triggers travel lifecycle state machine)
        this.activityManager.setCurrentLocation(req.targetLocation);
        return {
          success: true,
          executedType: req.type,
          appliedLocation: req.targetLocation,
          appliedFlyActivity: 'flying',
          appliedWaypoint: req.targetWaypoint || 'transit',
          appliedActionLabel: req.actionLabel || `Traveling to ${req.targetLocation}`,
        };
      }

      case 'SET_COLLEGE_SUB_BEHAVIOR': {
        const currentInstance = this.activityManager.getCurrentInstance();
        if (!currentInstance) {
          this.logRejection(decision, 'No active activity instance to apply college sub-behavior.');
          return { success: false, executedType: req.type, rejectionReason: 'No active activity instance' };
        }

        if (req.collegeSubBehavior) {
          currentInstance.selectedSubBehavior = req.collegeSubBehavior;
        }

        return {
          success: true,
          executedType: req.type,
          appliedWaypoint: req.targetWaypoint || 'student_desk_front',
          appliedFlyActivity: req.targetFlyActivity || 'sitting',
          appliedActionLabel: req.actionLabel || 'Attending College',
        };
      }

      case 'PROGRESS_WORKOUT': {
        return {
          success: true,
          executedType: req.type,
          appliedFlyActivity: req.targetFlyActivity || 'workout',
          appliedWaypoint: req.targetWaypoint || 'warmup_zone',
          appliedActionLabel: req.actionLabel || 'Exercising in Gym',
        };
      }

      case 'CONSUME_MEAL': {
        return {
          success: true,
          executedType: req.type,
          appliedFlyActivity: req.targetFlyActivity || 'eating',
          appliedWaypoint: req.targetWaypoint || 'dining_table_seat',
          appliedActionLabel: req.actionLabel || 'Consuming Meal',
        };
      }

      case 'WORK_PROJECT': {
        return {
          success: true,
          executedType: req.type,
          appliedFlyActivity: req.targetFlyActivity || 'working',
          appliedWaypoint: req.targetWaypoint || 'desk',
          appliedActionLabel: req.actionLabel || 'Coding VishalFly',
        };
      }

      case 'WORK_ASSIGNMENT': {
        return {
          success: true,
          executedType: req.type,
          appliedFlyActivity: req.targetFlyActivity || 'working',
          appliedWaypoint: req.targetWaypoint || 'desk',
          appliedActionLabel: req.actionLabel || 'Working on Assignment',
        };
      }

      case 'WALK_FAMILY_CALL': {
        return {
          success: true,
          executedType: req.type,
          appliedFlyActivity: req.targetFlyActivity || 'phone_call',
          appliedWaypoint: req.targetWaypoint || 'path_node_1',
          appliedActionLabel: req.actionLabel || 'Walking on Call',
        };
      }

      case 'PERFORM_LAUNDRY': {
        return {
          success: true,
          executedType: req.type,
          appliedFlyActivity: req.targetFlyActivity || 'laundry',
          appliedWaypoint: req.targetWaypoint || 'wardrobe',
          appliedActionLabel: req.actionLabel || 'Handling Laundry',
        };
      }

      case 'REST_OR_SLEEP': {
        return {
          success: true,
          executedType: req.type,
          appliedFlyActivity: req.targetFlyActivity || 'sleeping',
          appliedWaypoint: req.targetWaypoint || 'bed',
          appliedActionLabel: req.actionLabel || 'Resting / Sleeping',
        };
      }

      case 'CONTINUE_ACTIVITY':
      case 'IDLE_WAIT':
      default: {
        return {
          success: true,
          executedType: req.type,
          appliedFlyActivity: req.targetFlyActivity || 'hovering',
          appliedWaypoint: req.targetWaypoint || 'center',
          appliedActionLabel: req.actionLabel || 'Free Idle',
        };
      }
    }
  }

  private logRejection(decision: ActionDecision, reason: string): void {
    this.eventLogger.log({
      timestamp: decision.timestamp,
      dayNumber: 1,
      category: 'behavior',
      message: `Cognitive action rejected: ${reason} (Behavior: ${decision.selectedCandidateName})`,
    });
  }
}
