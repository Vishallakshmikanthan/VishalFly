import { 
  PerceptionSnapshot, 
  AvailableSensoryData, 
  UnavailableSensoryData,
  NearbyDestinationInfo,
  InteractionPointInfo,
  AgentMotionState,
  MemoryRecord
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
import { LOCATIONS } from '../../navigation/locationGraph';

export class PerceptionSystem {
  /**
   * Samples current world and agent state into a structured PerceptionSnapshot.
   * Derives strictly from actual simulation state without fabricating values.
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
    recentEventsSummary?: string[];
    relevantMemories?: MemoryRecord[];
    travelTargetLocation?: LocationId | null;
    travelProgressPercent?: number;
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
      recentEventsSummary = [],
      relevantMemories = [],
      travelTargetLocation = null,
      travelProgressPercent = 0,
    } = params;

    const currentLocationId = character.locationId as LocationId;
    const currentLocConfig = LOCATIONS[currentLocationId] || LOCATIONS.bedroom;

    // 1. Nearby reachable destinations from the location graph
    const nearbyDestinations: NearbyDestinationInfo[] = Object.keys(LOCATIONS).map((locKey) => {
      const locId = locKey as LocationId;
      const config = LOCATIONS[locId];
      const dx = config.spawnPosition[0] - currentLocConfig.spawnPosition[0];
      const dy = config.spawnPosition[1] - currentLocConfig.spawnPosition[1];
      const dz = config.spawnPosition[2] - currentLocConfig.spawnPosition[2];
      const dist = Math.max(1, Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz) * 10) / 10);
      const travelTime = Math.max(1, Math.round(dist / 10));

      return {
        locationId: locId,
        name: config.name,
        isCurrent: locId === currentLocationId,
        reachable: locId !== 'travel', // all primary nodes are reachable via the transit corridor
        distanceMeters: dist,
        travelTimeMinutes: travelTime,
      };
    });

    // 2. Available interaction points and waypoints in current location
    const availableInteractionPoints: InteractionPointInfo[] = [];
    if (currentLocConfig.waypoints) {
      for (const [wpKey, coords] of Object.entries(currentLocConfig.waypoints)) {
        const dx = (coords as number[])[0] - currentLocConfig.spawnPosition[0];
        const dy = (coords as number[])[1] - currentLocConfig.spawnPosition[1];
        const dz = (coords as number[])[2] - currentLocConfig.spawnPosition[2];
        const dist = Math.max(0.5, Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz) * 10) / 10);

        availableInteractionPoints.push({
          id: wpKey,
          name: wpKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          waypointKey: wpKey,
          type: wpKey.includes('desk') ? 'desk' : wpKey.includes('bed') ? 'bed' : wpKey.includes('food') || wpKey.includes('dining') ? 'food' : 'interaction',
          distanceMeters: dist,
          coordinates: coords as [number, number, number],
        });
      }
    }
    if (currentLocConfig.landmarks) {
      for (const lm of currentLocConfig.landmarks) {
        availableInteractionPoints.push({
          id: lm.name.toLowerCase().replace(/\s+/g, '_'),
          name: lm.name,
          waypointKey: lm.name.toLowerCase().replace(/\s+/g, '_'),
          type: 'landmark',
          distanceMeters: 2.0,
          coordinates: [(lm.minX + lm.maxX) / 2, ((lm.minY ?? 0) + (lm.maxY ?? 1)) / 2, (lm.minZ + lm.maxZ) / 2],
        });
      }
    }

    // 3. Determine motion state
    let motionState: AgentMotionState = 'grounded';
    if (character.isTravelling || currentActivity?.state === 'travelling') {
      motionState = 'travelling';
    } else if (
      character.flyActivity === 'sleeping' || 
      character.flyActivity === 'dozing' ||
      currentActivity?.definition.id === 'sleep'
    ) {
      motionState = 'resting';
    } else if (character.flyActivity === 'flying' || character.flyActivity === 'hovering') {
      motionState = 'airborne';
    } else if (currentActivity && currentActivity.state === 'active') {
      motionState = 'performing_activity';
    }

    // 4. Derive current activity phase
    let activityPhase: string | null = null;
    if (workoutSession && !workoutSession.isCompleted) {
      activityPhase = `workout_${workoutSession.state.toLowerCase()}`;
    } else if (mealSession && !mealSession.isCompleted) {
      activityPhase = `meal_${mealSession.meal.type}`;
    } else if (laundryState.stage !== 'idle' && !laundryState.isCompleted) {
      activityPhase = `laundry_${laundryState.stage}`;
    } else if (familyCallState.isActive) {
      activityPhase = 'family_call_active';
    } else if (projectState.isWorking) {
      activityPhase = 'project_sprint';
    } else if (assignmentState.isWorking) {
      activityPhase = 'assignment_working';
    } else if (currentActivity) {
      activityPhase = currentActivity.state;
    }

    const available: AvailableSensoryData = {
      currentLocationId,
      currentActivityId: currentActivity?.definition.id || null,
      activityLifecycleState: currentActivity?.state || null,
      activityProgressPercent: currentActivity?.progressPercent ?? 0,
      simulatedTime: clock.simulatedTime,
      simulatedMinutes: clock.currentMinutes,
      dayNumber: clock.dayNumber,
      dayOfWeek: clock.dayOfWeek,
      dayType: clock.dayType,
      isTravelling: character.isTravelling || currentActivity?.state === 'travelling',
      currentWaypoint,
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

      // Milestone 7 Sensory Expansions
      nearbyDestinations,
      availableInteractionPoints,
      motionState,
      travelTargetLocation: travelTargetLocation || (currentActivity?.state === 'travelling' ? (currentActivity.targetLocation as LocationId) : null),
      travelProgressPercent,
      activityPhase,
      recentEventsSummary,
      relevantMemories,

      // Sensory Grounding Declarations (Biological receptors explicitly not simulated)
      isCameraVisionAvailable: false,
      isOmmatidiaPhotoreceptorsAvailable: false,
      isOlfactorySensillaAvailable: false,
      isAntennalMechanoreceptorsAvailable: false,
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
      motionState,
      activityPhase,
      nearbyDestinations,
      nearbyInteractionPoints: availableInteractionPoints,
      travelProgress: {
        isTraveling: character.isTravelling || currentActivity?.state === 'travelling',
        fromLocation: currentLocationId,
        toLocation: (travelTargetLocation || undefined) as any,
        progress: travelProgressPercent,
      },
      unavailableSensory: [
        { channel: 'camera_vision', simulated: false, reason: unavailable.visualCameraImage.reason },
        { channel: 'ommatidia_photoreceptors', simulated: false, reason: unavailable.compoundEyeOpticalFlow.reason },
        { channel: 'olfactory_sensilla', simulated: false, reason: unavailable.olfactoryReceptors.reason },
        { channel: 'antennal_mechanoreceptors', simulated: false, reason: unavailable.antennalTactileSensors.reason },
      ],
      available,
      unavailable,
    };
  }
}
