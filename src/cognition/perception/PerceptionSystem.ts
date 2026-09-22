import { 
  PerceptionSnapshot, 
  AvailableSensoryData, 
  UnavailableSensoryData 
} from '../types/cognition';
import { 
  SimulationClockState, 
  ActivityInstance, 
  NeedState, 
  CharacterState, 
  WorkoutSession, 
  MealSession, 
  ProjectState, 
  AssignmentState, 
  FamilyCallState, 
  LaundryState,
  LocationId
} from '../../types';

export class PerceptionSystem {
  /**
   * Samples current world and agent state into a structured PerceptionSnapshot.
   */
  public captureSnapshot(params: {
    clock: SimulationClockState;
    character: CharacterState;
    currentActivity: ActivityInstance | null;
    needs: NeedState;
    workoutSession: WorkoutSession | null;
    mealSession: MealSession | null;
    projectState: ProjectState;
    assignmentState: AssignmentState;
    familyCallState: FamilyCallState;
    laundryState: LaundryState;
    currentWaypoint: string;
  }): PerceptionSnapshot {
    const {
      clock,
      character,
      currentActivity,
      needs,
      workoutSession,
      mealSession,
      projectState,
      assignmentState,
      familyCallState,
      laundryState,
      currentWaypoint,
    } = params;

    const available: AvailableSensoryData = {
      currentLocationId: character.locationId as LocationId,
      currentActivityId: currentActivity?.definition.id || null,
      activityLifecycleState: currentActivity?.state || null,
      activityProgressPercent: currentActivity?.progressPercent ?? 0,
      simulatedTime: clock.simulatedTime,
      simulatedMinutes: clock.currentMinutes,
      dayNumber: clock.dayNumber,
      dayOfWeek: clock.dayOfWeek,
      dayType: clock.dayType,
      isTravelling: character.isTravelling,
      currentWaypoint: currentWaypoint,
      currentSpot: character.currentSpot,
      flyActivity: character.flyActivity,
      needs: { ...needs },

      // Sub-system context
      isWorkoutActive: workoutSession !== null && !workoutSession.isCompleted,
      workoutState: workoutSession?.state,
      isMealActive: mealSession !== null && !mealSession.isCompleted,
      isProjectActive: projectState.isWorking,
      isAssignmentActive: assignmentState.isWorking,
      isFamilyCallActive: familyCallState.isActive,
      isLaundryActive: laundryState.stage !== 'idle' && !laundryState.isCompleted,
    };

    const unavailable: UnavailableSensoryData = {
      visualCameraImage: {
        available: false,
        reason: 'No camera-based pixel rendering or object recognition sensor pipeline implemented.',
      },
      compoundEyeOpticalFlow: {
        available: false,
        reason: 'Ommatidia optical flow field integration is not modeled in the web engine.',
      },
      olfactoryReceptors: {
        available: false,
        reason: 'Volatile chemical odor gradient simulation is not implemented.',
      },
      antennalTactileSensors: {
        available: false,
        reason: 'Mechanosensory tactile bristles are not physically simulated.',
      },
    };

    return {
      timestamp: `Day ${clock.dayNumber} • ${clock.simulatedTime}`,
      simulatedMinutes: clock.currentMinutes,
      dayNumber: clock.dayNumber,
      available,
      unavailable,
    };
  }
}
