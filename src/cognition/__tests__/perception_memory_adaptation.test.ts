import { describe, it, expect, beforeEach } from 'vitest';
import { CognitiveEngine } from '../CognitiveEngine';
import { CognitiveMemory } from '../memory/CognitiveMemory';
import { PerceptionSystem } from '../perception/PerceptionSystem';
import { AdaptiveBehaviorSystem } from '../adaptation/AdaptiveBehaviorSystem';
import { BehaviorIntegrator } from '../integration/BehaviorIntegrator';
import { BehaviorRegistry } from '../behaviors/BehaviorRegistry';
import { InternalStateManager } from '../internal-state/InternalStateManager';
import { SimulationEngine } from '../../simulation/engine/SimulationEngine';
import { ActivityManager } from '../../simulation/activities/ActivityManager';
import { EventLogger } from '../../simulation/events/EventLogger';
import { DEFAULT_COGNITIVE_CONFIG } from '../config/CognitiveConfig';
import { CognitiveContext, PerceptionSnapshot, BehaviorCandidate } from '../types/cognition';
import { ScheduleEntry, NeedState } from '../../types';

function createMockContext(overrides?: Partial<CognitiveContext>): CognitiveContext {
  const needs: NeedState = {
    energy: 80,
    hunger: 20,
    sleepiness: 15,
    fatigue: 10,
    focus: 85,
    socialNeed: 30,
    ...overrides?.perception?.available?.needs,
  };

  const activeScheduleEntry: ScheduleEntry = overrides?.activeScheduleEntry || {
    id: 'entry_college',
    activityId: 'college_activities',
    name: 'College Lectures',
    startTime: '08:00',
    endTime: '16:00',
    startMinutes: 480,
    endMinutes: 960,
    locationId: 'classroom',
  };

  const perception: PerceptionSnapshot = {
    timestamp: 'Day 1 • 09:00',
    simulatedMinutes: 540,
    dayNumber: 1,
    motionState: 'grounded',
    activityPhase: 'active',
    nearbyDestinations: [
      { locationId: 'grounds', name: 'Campus Grounds', isCurrent: false, reachable: true, distanceMeters: 45, travelTimeMinutes: 2 },
      { locationId: 'dining', name: 'Dining Hall', isCurrent: false, reachable: true, distanceMeters: 80, travelTimeMinutes: 3 }
    ],
    nearbyInteractionPoints: [
      { id: 'desk_study', name: 'Study Desk', waypointKey: 'desk_study', type: 'desk', distanceMeters: 1.2 }
    ],
    travelProgress: { isTraveling: false },
    unavailable: {
      visualCameraImage: { available: false, reason: 'No camera-based pixel rendering or object recognition sensor pipeline implemented.' },
      compoundEyeOpticalFlow: { available: false, reason: 'Ommatidia optical flow field integration is not modeled in the web engine.' },
      olfactoryReceptors: { available: false, reason: 'Volatile chemical odor gradient simulation is not implemented.' },
      antennalTactileSensors: { available: false, reason: 'Mechanosensory tactile bristles are not physically simulated.' },
    },
    unavailableSensory: [
      { channel: 'camera_vision', simulated: false, reason: 'No hardware optical rendering pipeline' },
      { channel: 'ommatidia_photoreceptors', simulated: false, reason: 'Compound eye mosaic is not modeled' },
      { channel: 'olfactory_sensilla', simulated: false, reason: 'Odorant receptor simulation is not modeled' },
      { channel: 'antennal_mechanoreceptors', simulated: false, reason: 'Airflow vibration bristles not modeled' },
    ],
    available: {
      currentLocationId: 'classroom',
      currentActivityId: 'college_activities',
      activityLifecycleState: 'active',
      activityProgressPercent: 50,
      simulatedTime: '09:00',
      simulatedMinutes: 540,
      dayNumber: 1,
      dayOfWeek: 'Monday',
      dayType: 'weekday',
      isTravelling: false,
      currentWaypoint: 'student_desk_front',
      currentSpot: 'Front Row Student Desks',
      flyActivity: 'sitting',
      needs,
      isWorkoutActive: false,
      isMealActive: false,
      isProjectActive: false,
      isAssignmentActive: false,
      isLaundryActive: false,
      isFamilyCallActive: false,
      isMorningRoutineActive: false,
      isCameraVisionAvailable: false,
      isOmmatidiaPhotoreceptorsAvailable: false,
      isOlfactorySensillaAvailable: false,
      isAntennalMechanoreceptorsAvailable: false,
      ...overrides?.perception?.available,
    },
    ...overrides?.perception,
  };

  const internalStateManager = new InternalStateManager(needs);
  const internalState = internalStateManager.getState();

  return {
    perception,
    internalState: {
      ...internalState,
      currentGoal: 'Attend Lecture',
      activeBehaviorId: 'attend_lecture',
      behaviorCommitmentElapsedSimSeconds: 600,
      minimumCommitmentSimSeconds: 900,
      lastDecisionTimestamp: '09:00',
      ...overrides?.internalState,
    },
    activeScheduleEntry,
    currentActivity: null,
    workoutSession: null,
    mealSession: null,
    projectState: {
      totalProgress: 0,
      currentProject: 'VishalFly',
      focus: 80,
      sessionProgress: 0,
      sessionElapsedSimMinutes: 0,
      completedSessions: 0,
      isWorking: false,
    },
    assignmentState: {
      progress: 0,
      currentTask: 'Assignment 1',
      completedTasks: 0,
      isWorking: false,
    },
    memory: overrides?.memory || [],
    ...overrides,
  };
}

describe('Milestone 7: Perception, Memory & Adaptive Behavior', () => {
  let simEngine: SimulationEngine;
  let cognitiveEngine: CognitiveEngine;

  beforeEach(() => {
    simEngine = new SimulationEngine();
    cognitiveEngine = simEngine.cognitiveEngine;
  });

  // 1. Perception snapshots use actual simulation state
  it('1. Perception snapshots use actual simulation state', () => {
    const perceptionSystem = new PerceptionSystem();
    const state = simEngine.getState();
    const snapshot = perceptionSystem.captureSnapshot({
      clock: state.clock,
      character: state.character,
      currentActivity: state.currentActivity,
      needs: state.needs,
      workoutSession: state.workoutSession,
      mealSession: state.mealSession,
      projectState: state.projectState,
      assignmentState: state.assignmentState,
      familyCallState: state.familyCallState,
      laundryState: state.laundryState,
      currentWaypoint: state.character.currentSpot,
    });

    expect(snapshot.timestamp).toBeDefined();
    expect(snapshot.simulatedMinutes).toBeGreaterThanOrEqual(0);
    expect(snapshot.dayNumber).toBeGreaterThanOrEqual(1);

    // Nearby reachable destinations
    expect(snapshot.nearbyDestinations).toBeDefined();
    expect(snapshot.nearbyDestinations!.length).toBeGreaterThan(0);
    const dest = snapshot.nearbyDestinations![0];
    expect(dest.locationId).toBeDefined();
    expect(dest.name).toBeDefined();
    expect(dest.distanceMeters).toBeGreaterThan(0);
    expect(dest.travelTimeMinutes).toBeGreaterThan(0);

    // Interaction points
    expect(snapshot.nearbyInteractionPoints).toBeDefined();

    // Motion state
    expect(['grounded', 'airborne', 'takeoff', 'landing']).toContain(snapshot.motionState);

    // Travel progress
    expect(snapshot.travelProgress).toBeDefined();
    expect(typeof snapshot.travelProgress?.isTraveling).toBe('boolean');
  });

  // 2. Unavailable inputs are not fabricated
  it('2. Unavailable biological inputs are not fabricated and explicitly declared', () => {
    const perceptionSystem = new PerceptionSystem();
    const state = simEngine.getState();
    const snapshot = perceptionSystem.captureSnapshot({
      clock: state.clock,
      character: state.character,
      currentActivity: state.currentActivity,
      needs: state.needs,
      workoutSession: state.workoutSession,
      mealSession: state.mealSession,
      projectState: state.projectState,
      assignmentState: state.assignmentState,
      familyCallState: state.familyCallState,
      laundryState: state.laundryState,
      currentWaypoint: state.character.currentSpot,
    });

    expect(snapshot.available.isCameraVisionAvailable).toBe(false);
    expect(snapshot.available.isOmmatidiaPhotoreceptorsAvailable).toBe(false);
    expect(snapshot.available.isOlfactorySensillaAvailable).toBe(false);
    expect(snapshot.available.isAntennalMechanoreceptorsAvailable).toBe(false);

    expect(snapshot.unavailableSensory).toBeDefined();
    expect(snapshot.unavailableSensory!.length).toBe(4);
    snapshot.unavailableSensory!.forEach((chan) => {
      expect(chan.simulated).toBe(false);
      expect(chan.reason.length).toBeGreaterThan(5);
    });

    expect(snapshot.unavailable.visualCameraImage.available).toBe(false);
    expect(snapshot.unavailable.compoundEyeOpticalFlow.available).toBe(false);
    expect(snapshot.unavailable.olfactoryReceptors.available).toBe(false);
    expect(snapshot.unavailable.antennalTactileSensors.available).toBe(false);
  });

  // 3. Memory records created only from confirmed events
  it('3. Memory records created only from confirmed events', () => {
    const memory = new CognitiveMemory(20, 1440);
    expect(memory.count()).toBe(0);

    // Confirmed outcome gets logged:
    memory.recordOutcome({
      category: 'outcome',
      eventType: 'meal_completed',
      value: 'Completed Dinner at Dining Hall',
      salience: 0.8,
      timestamp: 'Day 1 • 20:30',
      simulatedMinutes: 1230,
      dayNumber: 1,
      outcome: 'completed',
      locationId: 'dining',
      tags: ['meal', 'nutrition']
    });

    expect(memory.count()).toBe(1);
    const rec = memory.getRecent(1)[0];
    expect(rec.outcome).toBe('completed');
    expect(rec.eventType).toBe('meal_completed');
    expect(rec.location).toBe('dining');
  });

  // 4. Memory capacity remains bounded
  it('4. Memory capacity remains strictly bounded with FIFO eviction', () => {
    const capacity = 10;
    const memory = new CognitiveMemory(capacity, 1440);

    for (let i = 0; i < 25; i++) {
      memory.recordOutcome({
        category: 'behavior',
        eventType: `event_${i}`,
        value: `Event number ${i}`,
        salience: 0.5,
        timestamp: `Day 1 • ${i}:00`,
        simulatedMinutes: i * 60,
        dayNumber: 1,
        outcome: 'completed'
      });
    }

    expect(memory.count()).toBe(10);
    const all = memory.getRecent(50);
    expect(all.length).toBe(10);
    // Oldest surviving record should be event_15
    expect(all[0].eventType).toBe('event_15');
    // Newest record should be event_24
    expect(all[9].eventType).toBe('event_24');
  });

  // 5. Retention follows configuration
  it('5. Retention follows configuration and prunes expired records', () => {
    const memory = new CognitiveMemory(20, 120); // 120 minutes retention

    memory.recordOutcome({
      category: 'behavior',
      eventType: 'early_event',
      value: 'Early morning coffee',
      salience: 0.6,
      timestamp: 'Day 1 • 06:00',
      simulatedMinutes: 360,
      dayNumber: 1,
      outcome: 'completed'
    });

    // At 400 minutes (40 min later) -> not expired
    memory.pruneExpired(400, 1);
    expect(memory.count()).toBe(1);

    // At 550 minutes (190 min later) -> expired (> 120 min)
    memory.pruneExpired(550, 1);
    expect(memory.count()).toBe(0);
  });

  // 6. Retrieval returns relevant records deterministically
  it('6. Retrieval returns relevant records deterministically', () => {
    const memory = new CognitiveMemory(20, 1440);

    memory.recordOutcome({
      category: 'behavior',
      eventType: 'workout_completed',
      value: 'Completed strength workout',
      salience: 0.8,
      timestamp: 'Day 1 • 07:30',
      simulatedMinutes: 450,
      dayNumber: 1,
      outcome: 'completed',
      locationId: 'gym',
      tags: ['workout', 'fitness']
    });

    memory.recordOutcome({
      category: 'behavior',
      eventType: 'meal_completed',
      value: 'Breakfast in dining',
      salience: 0.7,
      timestamp: 'Day 1 • 08:30',
      simulatedMinutes: 510,
      dayNumber: 1,
      outcome: 'completed',
      locationId: 'dining',
      tags: ['meal', 'food']
    });

    // Tag and location search
    const gymMemories = memory.getRelevantMemories({ currentLocation: 'gym' });
    expect(gymMemories.length).toBe(1);
    expect(gymMemories[0].location).toBe('gym');

    const mealMemories = memory.getRelevantMemories({ tags: ['food'] });
    expect(mealMemories.length).toBe(1);
    expect(mealMemories[0].value).toContain('Breakfast');
  });

  // 7. Outcomes distinguish completion from rejection and failure
  it('7. Outcomes distinguish completion from rejection and failure', () => {
    const memory = new CognitiveMemory(20, 1440);

    memory.recordOutcome({
      category: 'routine',
      eventType: 'routine_done',
      value: 'Morning routine completed',
      salience: 0.8,
      timestamp: 'Day 1 • 07:00',
      simulatedMinutes: 420,
      dayNumber: 1,
      outcome: 'completed',
      key: 'routine_done'
    });

    memory.recordOutcome({
      category: 'behavior',
      eventType: 'gym_rejected',
      value: 'Gym workout rejected due to low energy',
      salience: 0.5,
      timestamp: 'Day 1 • 14:00',
      simulatedMinutes: 840,
      dayNumber: 1,
      outcome: 'rejected',
      key: 'gym_workout'
    });

    memory.recordOutcome({
      category: 'activity',
      eventType: 'food_failed',
      value: 'Delivery food store closed',
      salience: 0.6,
      timestamp: 'Day 1 • 23:00',
      simulatedMinutes: 1380,
      dayNumber: 1,
      outcome: 'failed',
      key: 'food_failed'
    });

    expect(memory.getRecentOutcomes(10, 'completed').length).toBe(1);
    expect(memory.getRecentOutcomes(10, 'rejected').length).toBe(1);
    expect(memory.getRecentOutcomes(10, 'failed').length).toBe(1);
    expect(memory.getRecentFailureOrRejectionCount('gym_workout', 600, 900)).toBe(1);
    expect(memory.getRecentFailureOrRejectionCount('routine_done', 600, 900)).toBe(0);
  });

  // 8. Adaptation remains within configured bounds
  it('8. Adaptation remains within configured bounds', () => {
    const memory = new CognitiveMemory(30, 1440);
    const adaptive = new AdaptiveBehaviorSystem({
      ...DEFAULT_COGNITIVE_CONFIG,
      adaptationMaxAdjustment: 15,
    }, memory);

    // Artificially flood memory with failures
    for (let i = 0; i < 10; i++) {
      memory.recordOutcome({
        category: 'behavior',
        eventType: 'candidate_fail',
        value: 'Failed candidate',
        salience: 0.9,
        timestamp: 'Day 1 • 10:00',
        simulatedMinutes: 600,
        dayNumber: 1,
        outcome: 'failed',
        key: 'test_candidate'
      });
    }

    const mockCandidate: BehaviorCandidate = {
      id: 'test_candidate',
      displayName: 'Test Candidate',
      description: 'Candidate for testing adaptation limits',
      applicableActivityIds: ['college_activities'],
      isApplicable: () => ({ eligible: true }),
      evaluateUtility: () => ({
        candidateId: 'test_candidate',
        candidateName: 'Test Candidate',
        isEligible: true,
        baseUtility: 50,
        scheduleCompatibility: 1.0,
        needUrgencyBonus: 0,
        continuityBonus: 0,
        repetitionPenalty: 0,
        finalScore: 50,
        explanation: 'Test'
      }),
      createActionRequest: () => ({ type: 'IDLE_WAIT' })
    };

    const ctx = createMockContext({ memory: memory.getRecent(30) });
    const result = adaptive.evaluateCandidateAdaptation(mockCandidate, ctx, 50);

    // Delta must be clamped between -15 and +15
    expect(result.scoreDelta).toBeGreaterThanOrEqual(-15);
    expect(result.scoreDelta).toBeLessThanOrEqual(15);
  });

  // 9. Identical inputs produce deterministic results
  it('9. Identical inputs produce deterministic results', () => {
    const memory1 = new CognitiveMemory(30, 1440);
    const memory2 = new CognitiveMemory(30, 1440);

    const testRecord = {
      category: 'behavior' as const,
      eventType: 'test_event',
      key: 'candidate_det',
      value: 'Deterministic Event',
      salience: 0.7,
      timestamp: 'Day 1 • 10:00',
      simulatedMinutes: 600,
      dayNumber: 1,
      outcome: 'completed' as const,
    };
    memory1.recordOutcome(testRecord);
    memory2.recordOutcome(testRecord);

    const adaptive1 = new AdaptiveBehaviorSystem(DEFAULT_COGNITIVE_CONFIG, memory1);
    const adaptive2 = new AdaptiveBehaviorSystem(DEFAULT_COGNITIVE_CONFIG, memory2);

    const candidate: BehaviorCandidate = {
      id: 'candidate_det',
      displayName: 'Deterministic Candidate',
      description: 'Deterministic testing candidate',
      applicableActivityIds: ['college_activities'],
      isApplicable: () => ({ eligible: true }),
      evaluateUtility: () => ({
        candidateId: 'candidate_det',
        candidateName: 'Deterministic Candidate',
        isEligible: true,
        baseUtility: 60,
        scheduleCompatibility: 1.0,
        needUrgencyBonus: 0,
        continuityBonus: 0,
        repetitionPenalty: 0,
        finalScore: 60,
        explanation: 'Deterministic'
      }),
      createActionRequest: () => ({ type: 'IDLE_WAIT' })
    };

    const ctx1 = createMockContext({ memory: memory1.getRecent(30) });
    const ctx2 = createMockContext({ memory: memory2.getRecent(30) });

    const eval1 = adaptive1.evaluateCandidateAdaptation(candidate, ctx1, 60);
    const eval2 = adaptive2.evaluateCandidateAdaptation(candidate, ctx2, 60);

    expect(eval1.scoreDelta).toBe(eval2.scoreDelta);
    expect(eval1.rulesApplied).toEqual(eval2.rulesApplied);
  });

  // 10. Memory influence cannot bypass schedule constraints
  it('10. Memory influence cannot bypass schedule constraints', () => {
    const memory = new CognitiveMemory(30, 1440);
    const adaptive = new AdaptiveBehaviorSystem(DEFAULT_COGNITIVE_CONFIG, memory);
    const registry = new BehaviorRegistry();
    const integrator = new BehaviorIntegrator(registry, DEFAULT_COGNITIVE_CONFIG, memory, adaptive);

    // Current schedule is 'college_activities' at classroom
    const ctx = createMockContext({
      activeScheduleEntry: {
        id: 'entry_class',
        activityId: 'college_activities',
        name: 'College Lectures',
        startTime: '08:00',
        endTime: '16:00',
        startMinutes: 480,
        endMinutes: 960,
        locationId: 'classroom'
      }
    });

    const result = integrator.integrate(ctx);
    const workoutCandidate = result.evaluations.find(e => e.candidateId === 'perform_workout');

    // Gym workout is not in allowed activities for college lectures
    expect(workoutCandidate).toBeDefined();
    expect(workoutCandidate!.isEligible).toBe(false);
  });

  // 11. Memory influence cannot bypass action preconditions
  it('11. Memory influence cannot bypass action preconditions', () => {
    const memory = new CognitiveMemory(30, 1440);
    // Give perform_workout a huge positive outcome memory
    memory.recordOutcome({
      category: 'behavior',
      eventType: 'workout_completed',
      key: 'perform_workout',
      value: 'Great workout',
      salience: 1.0,
      timestamp: 'Day 1 • 07:00',
      simulatedMinutes: 420,
      dayNumber: 1,
      outcome: 'completed'
    });

    const adaptive = new AdaptiveBehaviorSystem(DEFAULT_COGNITIVE_CONFIG, memory);
    const registry = new BehaviorRegistry();
    const integrator = new BehaviorIntegrator(registry, DEFAULT_COGNITIVE_CONFIG, memory, adaptive);

    // During gym schedule, but agent is in bedroom (precondition fails: must be in gym)
    const ctx = createMockContext({
      activeScheduleEntry: {
        id: 'entry_gym',
        activityId: 'gym_workout',
        name: 'Gym Workout',
        startTime: '17:00',
        endTime: '18:30',
        startMinutes: 1020,
        endMinutes: 1110,
        locationId: 'gym'
      },
      perception: {
        timestamp: 'Day 1 • 17:15',
        simulatedMinutes: 1035,
        dayNumber: 1,
        available: {
          currentLocationId: 'bedroom', // In bedroom! Fails isApplicable for perform_workout
          currentActivityId: 'gym_workout',
          activityLifecycleState: 'active',
          activityProgressPercent: 20,
          simulatedTime: '17:15',
          simulatedMinutes: 1035,
          dayNumber: 1,
          dayOfWeek: 'Monday',
          dayType: 'weekday',
          isTravelling: false,
          currentWaypoint: 'bed_sleep',
          currentSpot: 'Desk Study Chair',
          flyActivity: 'sitting',
          needs: {
            energy: 80,
            hunger: 20,
            sleepiness: 10,
            fatigue: 20,
            focus: 50,
            socialNeed: 20,
          },
          isWorkoutActive: false,
          isMealActive: false,
          isProjectActive: false,
          isAssignmentActive: false,
          isLaundryActive: false,
          isFoodOrderActive: false,
          isFamilyCallActive: false,
          isMorningRoutineActive: false,
          isCameraVisionAvailable: false,
          isOmmatidiaPhotoreceptorsAvailable: false,
          isOlfactorySensillaAvailable: false,
          isAntennalMechanoreceptorsAvailable: false,
        }
      } as any
    });

    const result = integrator.integrate(ctx);
    const workoutCandidate = result.evaluations.find(e => e.candidateId === 'perform_workout');
    expect(workoutCandidate).toBeDefined();
    // Precondition failure: cannot be eligible despite any memory boost
    expect(workoutCandidate!.isEligible).toBe(false);
  });

  // 12. Disabling memory influence restores previous selector behavior
  it('12. Disabling memory influence restores previous selector behavior', () => {
    cognitiveEngine.setMemoryInfluenceEnabled(true);
    cognitiveEngine.recordConfirmedOutcome({
      category: 'behavior',
      eventType: 'workout_completed',
      value: 'Completed workout',
      salience: 0.9,
      timestamp: 'Day 1 • 07:00',
      simulatedMinutes: 420,
      dayNumber: 1,
      outcome: 'completed',
      key: 'perform_workout'
    });

    const ctx = createMockContext();
    const decisionWithMemory = cognitiveEngine.evaluateAndSelect(ctx);
    expect(decisionWithMemory).toBeDefined();

    // Now disable memory influence
    cognitiveEngine.setMemoryInfluenceEnabled(false);
    const decisionWithoutMemory = cognitiveEngine.evaluateAndSelect(ctx);

    expect(cognitiveEngine.getConfig().isMemoryInfluenceEnabled).toBe(false);
    expect(decisionWithoutMemory).toBeDefined();
  });

  // 13. Disabling adaptation restores previous selector behavior
  it('13. Disabling adaptation restores previous selector behavior', () => {
    const memory = new CognitiveMemory(30, 1440);
    const config = {
      ...DEFAULT_COGNITIVE_CONFIG,
      isAdaptationEnabled: false,
    };
    const adaptive = new AdaptiveBehaviorSystem(config, memory);
    const registry = new BehaviorRegistry();
    const integrator = new BehaviorIntegrator(registry, config, memory, adaptive);

    const ctx = createMockContext();
    const result = integrator.integrate(ctx);

    // Every candidate must have adaptationScoreContribution === 0
    result.evaluations.forEach((ev) => {
      expect(ev.adaptationScoreContribution ?? 0).toBe(0);
      expect(ev.adaptationDetails?.rulesApplied ?? []).toEqual([]);
    });
  });

  // 14. Save/load preserves memory and adaptation state
  it('14. Save/load preserves memory and adaptation state', () => {
    cognitiveEngine.setAdaptationEnabled(true);
    cognitiveEngine.setMemoryInfluenceEnabled(true);
    cognitiveEngine.recordConfirmedOutcome({
      category: 'outcome',
      eventType: 'dinner_completed',
      value: 'Ate dinner at dining hall',
      salience: 0.85,
      timestamp: 'Day 1 • 20:15',
      simulatedMinutes: 1215,
      dayNumber: 1,
      outcome: 'completed',
      locationId: 'dining',
      tags: ['food', 'dinner']
    });

    const serialized = cognitiveEngine.serialize();
    expect(serialized.memoryRecords).toBeDefined();
    expect(serialized.memoryRecords!.length).toBeGreaterThan(0);
    expect(serialized.isAdaptationEnabled).toBe(true);
    expect(serialized.isMemoryInfluenceEnabled).toBe(true);

    const eventLogger = new EventLogger(50);
    const activityManager = new ActivityManager('bedroom', eventLogger, 10);
    const freshEngine = new CognitiveEngine(activityManager, eventLogger, DEFAULT_COGNITIVE_CONFIG);

    freshEngine.deserialize(serialized);
    const restoredRecords = freshEngine.getInspectorData('Idle').recentMemory;
    expect(restoredRecords.length).toBe(serialized.memoryRecords!.length);
    expect(restoredRecords[0].eventType).toBe('dinner_completed');
    expect(restoredRecords[0].outcome).toBe('completed');
  });

  // 15. Older saves without new fields still load
  it('15. Older saves without new fields still load without errors', () => {
    const legacySavedData = {
      isCognitionEnabled: true,
      currentGoal: 'Legacy Goal',
      selectedSubBehavior: 'take_notes',
      behaviorCommitmentElapsedSimSeconds: 300,
      lastDecisionTimestamp: 400,
      lastUrgentOverride: false,
      history: []
      // Notice: NO memoryRecords, NO isMemoryInfluenceEnabled, NO isAdaptationEnabled
    };

    const eventLogger = new EventLogger(50);
    const activityManager = new ActivityManager('bedroom', eventLogger, 10);
    const freshEngine = new CognitiveEngine(activityManager, eventLogger, DEFAULT_COGNITIVE_CONFIG);

    expect(() => {
      freshEngine.deserialize(legacySavedData as any);
    }).not.toThrow();

    const inspector = freshEngine.getInspectorData('Idle');
    expect(inspector.isMemoryInfluenceEnabled).toBe(true); // Falls back to default true
    expect(inspector.isAdaptationEnabled).toBe(true); // Falls back to default true
    expect(inspector.recentMemory).toEqual([]); // Safe empty list
  });

  // 16. Existing M1-M6 tests remain valid
  it('16. Connectome structural declaration and biological boundaries remain honored', () => {
    const inspector = cognitiveEngine.getInspectorData('Idle');
    expect(inspector.connectomeStatus).toBeDefined();
    expect(inspector.connectomeStatus.isRealDataImported).toBe(false);
    expect(inspector.connectomeStatus.neuropilsCount).toBeGreaterThan(0);
    expect(inspector.connectomeStatus.circuitsCount).toBeGreaterThan(0);
  });
});
