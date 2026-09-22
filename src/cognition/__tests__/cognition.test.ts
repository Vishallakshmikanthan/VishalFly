import { describe, it, expect } from 'vitest';
import { BehaviorRegistry } from '../behaviors/BehaviorRegistry';
import { BehaviorIntegrator } from '../integration/BehaviorIntegrator';
import { ActionSelector } from '../action-selection/ActionSelector';
import { ActionAdapters } from '../adapters/ActionAdapters';
import { CognitiveMemory } from '../memory/CognitiveMemory';
import { InternalStateManager } from '../internal-state/InternalStateManager';
import { ConnectomeAdapter } from '../connectome/ConnectomeAdapter';
import { DEFAULT_COGNITIVE_CONFIG } from '../config/CognitiveConfig';
import { CognitiveEngine } from '../CognitiveEngine';
import { CognitiveContext, PerceptionSnapshot } from '../types/cognition';
import { ActivityManager } from '../../simulation/activities/ActivityManager';
import { EventLogger } from '../../simulation/events/EventLogger';
import { SimulationEngine } from '../../simulation/engine/SimulationEngine';
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
      isFamilyCallActive: false,
      isLaundryActive: false,
      ...overrides?.perception?.available,
    },
    unavailable: {
      visualCameraImage: { available: false, reason: 'No camera-based pixel rendering or object recognition sensor pipeline implemented.' },
      compoundEyeOpticalFlow: { available: false, reason: 'Ommatidia optical flow field integration is not modeled in the web engine.' },
      olfactoryReceptors: { available: false, reason: 'Volatile chemical odor gradient simulation is not implemented.' },
      antennalTactileSensors: { available: false, reason: 'Mechanosensory tactile bristles are not physically simulated.' },
    },
  };

  const internalStateManager = new InternalStateManager(needs);
  const internalState = internalStateManager.getState();

  return {
    perception,
    internalState: {
      ...internalState,
      ...overrides?.internalState,
    },
    activeScheduleEntry,
    currentActivity: null,
    workoutSession: null,
    mealSession: null,
    projectState: { totalProgress: 0, currentProject: 'VishalFly', focus: 80, sessionProgress: 0, sessionElapsedSimMinutes: 0, completedSessions: 0, isWorking: false },
    assignmentState: { progress: 0, currentTask: 'CS Math', completedTasks: 0, isWorking: false },
    memory: overrides?.memory || [],
    ...overrides,
  };
}

describe('Milestone 6: Connectome-Inspired Cognitive Architecture Tests', () => {

  // Test 1: Behavior candidates registration
  it('1. registers default behavior candidates correctly', () => {
    const registry = new BehaviorRegistry();
    const candidates = registry.getAll();
    expect(candidates.length).toBeGreaterThanOrEqual(10);

    const ids = candidates.map((c) => c.id);
    expect(ids).toContain('travel_to_scheduled');
    expect(ids).toContain('attend_lecture');
    expect(ids).toContain('doze_in_class');
    expect(ids).toContain('laptop_browse');
    expect(ids).toContain('phone_distraction');
    expect(ids).toContain('perform_workout');
    expect(ids).toContain('eat_meal');
    expect(ids).toContain('work_project');
    expect(ids).toContain('work_assignment');
    expect(ids).toContain('family_call_walk');
    expect(ids).toContain('perform_laundry');
    expect(ids).toContain('rest_and_sleep');
  });

  // Test 2: Preconditions exclude invalid candidates
  it('2. preconditions exclude invalid candidates for current location and state', () => {
    const registry = new BehaviorRegistry();
    // Agent is at classroom
    const context = createMockContext();

    // Workout candidate requires location === 'gym'
    const workout = registry.get('perform_workout')!;
    const workoutApp = workout.isApplicable(context);
    expect(workoutApp.eligible).toBe(false);
    expect(workoutApp.reason).toContain('Gym');

    // Eat meal candidate requires location === 'dining'
    const eatMeal = registry.get('eat_meal')!;
    const eatApp = eatMeal.isApplicable(context);
    expect(eatApp.eligible).toBe(false);

    // Attend lecture should be eligible in classroom during college
    const lecture = registry.get('attend_lecture')!;
    expect(lecture.isApplicable(context).eligible).toBe(true);
  });

  // Test 3: Schedule constraints are respected
  it('3. schedule constraints are respected by prioritizing travel when at wrong location', () => {
    const registry = new BehaviorRegistry();
    const memory = new CognitiveMemory();
    const integrator = new BehaviorIntegrator(registry, DEFAULT_COGNITIVE_CONFIG, memory);
    const selector = new ActionSelector(DEFAULT_COGNITIVE_CONFIG);

    // Agent is at bedroom, but scheduled for college in classroom
    const context = createMockContext({
      perception: {
        timestamp: 'Day 1 • 08:15',
        simulatedMinutes: 495,
        dayNumber: 1,
        available: {
          currentLocationId: 'bedroom',
          currentActivityId: 'college_activities',
          activityLifecycleState: 'pending',
          activityProgressPercent: 0,
          simulatedTime: '08:15',
          simulatedMinutes: 495,
          dayNumber: 1,
          dayOfWeek: 'Monday',
          dayType: 'weekday',
          isTravelling: false,
          currentWaypoint: 'center',
          currentSpot: 'Center Room',
          flyActivity: 'hovering',
          needs: { energy: 80, hunger: 20, sleepiness: 15, fatigue: 10, focus: 85, socialNeed: 30 },
          isWorkoutActive: false,
          isMealActive: false,
          isProjectActive: false,
          isAssignmentActive: false,
          isFamilyCallActive: false,
          isLaundryActive: false,
        },
        unavailable: {
          visualCameraImage: { available: false, reason: 'No camera-based pixel rendering or object recognition sensor pipeline implemented.' },
          compoundEyeOpticalFlow: { available: false, reason: 'Ommatidia optical flow field integration is not modeled in the web engine.' },
          olfactoryReceptors: { available: false, reason: 'Volatile chemical odor gradient simulation is not implemented.' },
          antennalTactileSensors: { available: false, reason: 'Mechanosensory tactile bristles are not physically simulated.' },
        },
      },
      activeScheduleEntry: {
        id: 'entry_college',
        activityId: 'college_activities',
        name: 'College Lectures',
        startTime: '08:00',
        endTime: '16:00',
        startMinutes: 480,
        endMinutes: 960,
        locationId: 'classroom',
      },
    });

    const integration = integrator.integrate(context);
    const decision = selector.selectAction(integration, context);

    expect(decision.selectedCandidateId).toBe('travel_to_scheduled');
    expect(decision.actionRequest.type).toBe('TRAVEL');
    expect(decision.actionRequest.targetLocation).toBe('classroom');
  });

  // Test 4: Determinism for identical inputs
  it('4. selector is 100% deterministic for identical inputs', () => {
    const registry = new BehaviorRegistry();
    const memory = new CognitiveMemory();
    const integrator = new BehaviorIntegrator(registry, DEFAULT_COGNITIVE_CONFIG, memory);
    const selector = new ActionSelector(DEFAULT_COGNITIVE_CONFIG);

    const context1 = createMockContext();
    const context2 = createMockContext();

    const decision1 = selector.selectAction(integrator.integrate(context1), context1);
    const decision2 = selector.selectAction(integrator.integrate(context2), context2);

    expect(decision1.selectedCandidateId).toBe(decision2.selectedCandidateId);
    expect(decision1.confidence).toBe(decision2.confidence);
    expect(decision1.explanation).toBe(decision2.explanation);
  });

  // Test 5: Deterministic tie-breaking
  it('5. tie-breaking is deterministic using lexicographical candidateId ordering', () => {
    const registry = new BehaviorRegistry();
    const memory = new CognitiveMemory();
    const integrator = new BehaviorIntegrator(registry, DEFAULT_COGNITIVE_CONFIG, memory);

    // Register two synthetic candidates with identical scores
    registry.register({
      id: 'z_candidate',
      displayName: 'Z Candidate',
      description: 'Test',
      isApplicable: () => ({ eligible: true }),
      evaluateUtility: () => ({
        candidateId: 'z_candidate',
        candidateName: 'Z Candidate',
        isEligible: true,
        baseUtility: 50,
        scheduleCompatibility: 1.0,
        needUrgencyBonus: 0,
        continuityBonus: 0,
        repetitionPenalty: 0,
        finalScore: 50,
        explanation: 'Tie test',
      }),
      createActionRequest: () => ({ type: 'IDLE_WAIT' }),
    });

    registry.register({
      id: 'a_candidate',
      displayName: 'A Candidate',
      description: 'Test',
      isApplicable: () => ({ eligible: true }),
      evaluateUtility: () => ({
        candidateId: 'a_candidate',
        candidateName: 'A Candidate',
        isEligible: true,
        baseUtility: 50,
        scheduleCompatibility: 1.0,
        needUrgencyBonus: 0,
        continuityBonus: 0,
        repetitionPenalty: 0,
        finalScore: 50,
        explanation: 'Tie test',
      }),
      createActionRequest: () => ({ type: 'IDLE_WAIT' }),
    });

    const context = createMockContext();
    const result = integrator.integrate(context);

    // 'a_candidate' should beat 'z_candidate' in tie-breaker
    const topTwo = result.evaluations.filter((e) => e.candidateId === 'a_candidate' || e.candidateId === 'z_candidate');
    expect(topTwo[0].candidateId).toBe('a_candidate');
  });

  // Test 6: Need urgency affects utility according to configuration
  it('6. need urgency boosts behavior utility according to configuration weights', () => {
    const registry = new BehaviorRegistry();
    const memory = new CognitiveMemory();
    const integrator = new BehaviorIntegrator(registry, DEFAULT_COGNITIVE_CONFIG, memory);

    // High sleepiness context in classroom
    const contextAlert = createMockContext();
    const contextSleepy = createMockContext({
      perception: {
        ...createMockContext().perception,
        available: {
          ...createMockContext().perception.available,
          needs: { energy: 40, hunger: 20, sleepiness: 85, fatigue: 60, focus: 20, socialNeed: 10 },
        },
      },
    });

    const resultAlert = integrator.integrate(contextAlert);
    const resultSleepy = integrator.integrate(contextSleepy);

    const dozeAlert = resultAlert.evaluations.find((e) => e.candidateId === 'doze_in_class')!;
    const dozeSleepy = resultSleepy.evaluations.find((e) => e.candidateId === 'doze_in_class')!;

    expect(dozeSleepy.finalScore).toBeGreaterThan(dozeAlert.finalScore);
  });

  // Test 7: Active multi-stage activities are not accidentally interrupted
  it('7. active multi-stage workout activity (LIFT) is protected by safety guards', () => {
    const selector = new ActionSelector(DEFAULT_COGNITIVE_CONFIG);

    const context = createMockContext({
      perception: {
        ...createMockContext().perception,
        available: {
          ...createMockContext().perception.available,
          currentLocationId: 'gym',
          isWorkoutActive: true,
          workoutState: 'LIFT',
        },
      },
      workoutSession: {
        plan: { id: 'push', name: 'Push Day', type: 'push', exercises: [] },
        currentExerciseIndex: 0,
        currentSet: 2,
        currentReps: 8,
        state: 'LIFT',
        stateElapsedSimSeconds: 15,
        restRemainingSimSeconds: 0,
        progressPercent: 45,
        isCompleted: false,
      },
    });

    const mockIntegration = {
      winningCandidate: { id: 'phone_distraction', displayName: 'Phone', description: '', isApplicable: () => ({ eligible: true }), evaluateUtility: () => ({ finalScore: 90 } as any), createActionRequest: () => ({ type: 'SET_COLLEGE_SUB_BEHAVIOR' } as any) },
      topEvaluation: { candidateId: 'phone_distraction', candidateName: 'Phone', isEligible: true, baseUtility: 90, scheduleCompatibility: 1, needUrgencyBonus: 0, continuityBonus: 0, repetitionPenalty: 0, finalScore: 90, explanation: '' },
      evaluations: [],
      rejectedCandidates: [],
      explanation: '',
    };

    const decision = selector.selectAction(mockIntegration as any, context);
    expect(decision.selectedCandidateId).toBe('perform_workout');
    expect(decision.explanation).toContain('Workout active set in progress (LIFT/SETUP)');
  });

  // Test 8: Invalid travel requests are rejected
  it('8. invalid travel requests without target location are rejected by adapters', () => {
    const eventLogger = new EventLogger(50);
    const activityManager = new ActivityManager('bedroom', eventLogger, 10);
    const adapters = new ActionAdapters(activityManager, eventLogger);

    const invalidDecision = {
      selectedCandidateId: 'bad_travel',
      selectedCandidateName: 'Bad Travel',
      actionRequest: { type: 'TRAVEL' as const }, // missing targetLocation
      confidence: 1.0,
      isUrgentOverride: false,
      explanation: 'Invalid',
      evaluations: [],
      rejectedCandidates: [],
      timestamp: 'Day 1 • 09:00',
    };

    const res = adapters.execute(invalidDecision);
    expect(res.success).toBe(false);
    expect(res.rejectionReason).toContain('Missing targetLocation');
  });

  // Test 9: Hysteresis prevents rapid behavior oscillation
  it('9. hysteresis commitment interval prevents rapid switching to frivolous distractions', () => {
    const selector = new ActionSelector(DEFAULT_COGNITIVE_CONFIG);

    // Agent currently committed to attend_lecture, only 3 minutes elapsed out of 15 min minimum
    const context = createMockContext({
      internalState: {
        ...createMockContext().internalState,
        activeBehaviorId: 'attend_lecture',
        behaviorCommitmentElapsedSimSeconds: 180, // 3 minutes
        minimumCommitmentSimSeconds: 900,         // 15 minutes
      },
    });

    const mockIntegration = {
      winningCandidate: { id: 'phone_distraction', displayName: 'Use Phone for Entertainment', description: '', isApplicable: () => ({ eligible: true }), evaluateUtility: () => ({ finalScore: 70 } as any), createActionRequest: () => ({ type: 'SET_COLLEGE_SUB_BEHAVIOR' } as any) },
      topEvaluation: { candidateId: 'phone_distraction', candidateName: 'Use Phone for Entertainment', isEligible: true, baseUtility: 70, scheduleCompatibility: 1, needUrgencyBonus: 0, continuityBonus: 0, repetitionPenalty: 0, finalScore: 70, explanation: '' },
      evaluations: [
        { candidateId: 'phone_distraction', candidateName: 'Use Phone for Entertainment', isEligible: true, baseUtility: 70, scheduleCompatibility: 1, needUrgencyBonus: 0, continuityBonus: 0, repetitionPenalty: 0, finalScore: 70, explanation: '' },
        { candidateId: 'attend_lecture', candidateName: 'Attend College Lecture', isEligible: true, baseUtility: 65, scheduleCompatibility: 1, needUrgencyBonus: 0, continuityBonus: 0, repetitionPenalty: 0, finalScore: 65, explanation: '' },
      ],
      rejectedCandidates: [],
      explanation: '',
    };

    const decision = selector.selectAction(mockIntegration as any, context);
    // Hysteresis should preserve attend_lecture!
    expect(decision.selectedCandidateId).toBe('attend_lecture');
    expect(decision.explanation).toContain('Hysteresis guard active');
  });

  // Test 10: Action adapters call the correct existing systems
  it('10. action adapters translate semantic actions into correct activity/navigation calls', () => {
    const eventLogger = new EventLogger(50);
    const activityManager = new ActivityManager('bedroom', eventLogger, 10);
    const adapters = new ActionAdapters(activityManager, eventLogger);

    const travelDecision = {
      selectedCandidateId: 'travel_to_scheduled',
      selectedCandidateName: 'Travel to College',
      actionRequest: { type: 'TRAVEL' as const, targetLocation: 'classroom' as const },
      confidence: 0.9,
      isUrgentOverride: false,
      explanation: 'Travel call',
      evaluations: [],
      rejectedCandidates: [],
      timestamp: 'Day 1 • 07:15',
    };

    const travelRes = adapters.execute(travelDecision);
    expect(travelRes.success).toBe(true);
    expect(travelRes.appliedLocation).toBe('classroom');
    expect(activityManager.getCurrentLocation()).toBe('classroom');
  });

  // Test 11: Rejected actions produce diagnostic events
  it('11. rejected actions log diagnostic error events to EventLogger', () => {
    const eventLogger = new EventLogger(50);
    const activityManager = new ActivityManager('bedroom', eventLogger, 10);
    const adapters = new ActionAdapters(activityManager, eventLogger);

    adapters.execute({
      selectedCandidateId: 'bad_action',
      selectedCandidateName: 'Bad Action',
      actionRequest: { type: 'TRAVEL' as const }, // missing target
      confidence: 1,
      isUrgentOverride: false,
      explanation: 'fail',
      evaluations: [],
      rejectedCandidates: [],
      timestamp: 'Day 1 • 10:00',
    });

    const recent = eventLogger.getRecent(5);
    const rejection = recent.find((e) => e.message.includes('Cognitive action rejected'));
    expect(rejection).toBeDefined();
  });

  // Test 12: Memory capacity is bounded
  it('12. memory capacity is strictly bounded by maxCapacity', () => {
    const memory = new CognitiveMemory(5, 120);

    for (let i = 0; i < 10; i++) {
      memory.record({
        timestamp: `0${i}:00`,
        simulatedMinutes: i * 60,
        dayNumber: 1,
        category: 'behavior',
        key: `action_${i}`,
        value: `Action ${i}`,
        salience: 0.5,
      });
    }

    expect(memory.getAll().length).toBe(5);
    // Oldest should have been evicted; newest should be action_9
    expect(memory.getAll()[4].key).toBe('action_9');
    expect(memory.getAll()[0].key).toBe('action_5');
  });

  // Test 13: Memory retrieval follows configured policy
  it('13. memory retrieval returns active unexpired records and category filters', () => {
    const memory = new CognitiveMemory(20, 60); // 60 sim mins retention

    memory.record({
      timestamp: '08:00',
      simulatedMinutes: 480,
      dayNumber: 1,
      category: 'distraction',
      key: 'phone_distraction',
      value: 'Watched reels',
      salience: 0.8,
      expiresAtSimMinutes: 540,
    });

    memory.record({
      timestamp: '09:30',
      simulatedMinutes: 570,
      dayNumber: 1,
      category: 'behavior',
      key: 'attend_lecture',
      value: 'Attended lecture',
      salience: 0.9,
      expiresAtSimMinutes: 630,
    });

    // At minute 550, first record is expired
    const activeAt550 = memory.getActive(550);
    expect(activeAt550.length).toBe(1);
    expect(activeAt550[0].key).toBe('attend_lecture');

    // Count recent distractions within 60 mins of minute 500
    const count = memory.getRecentCount('distraction', 'phone_distraction', 60, 500);
    expect(count).toBe(1);
  });

  // Test 14: Persistence round-trip preserves supported cognitive state
  it('14. persistence round-trip serializes and restores cognitive state', () => {
    const eventLogger = new EventLogger(50);
    const activityManager = new ActivityManager('bedroom', eventLogger, 10);
    const engine = new CognitiveEngine(activityManager, eventLogger);

    engine.internalStateManager.setActiveBehavior('work_project', 'Hacking VishalFly', 'Day 1 • 20:00', 900);
    engine.memory.record({
      timestamp: 'Day 1 • 20:00',
      simulatedMinutes: 1200,
      dayNumber: 1,
      category: 'behavior',
      key: 'work_project',
      value: 'Hacking VishalFly',
      salience: 0.9,
    });

    const serialized = engine.serialize();
    expect(serialized.activeBehaviorId).toBe('work_project');
    expect(serialized.memoryRecords.length).toBe(1);

    // Create new engine and restore
    const engine2 = new CognitiveEngine(activityManager, eventLogger);
    engine2.deserialize(serialized);

    expect(engine2.internalStateManager.getState().activeBehaviorId).toBe('work_project');
    expect(engine2.memory.getAll().length).toBe(1);
    expect(engine2.memory.getAll()[0].key).toBe('work_project');
  });

  // Test 15: Missing cognitive save data does not break older saves
  it('15. missing cognitive save data does not break older save files', () => {
    const engine = new SimulationEngine();
    // Simulate loading older save lacking cognitive property
    const legacySave = {
      version: 1,
      savedAt: '2026-09-20T00:00:00Z',
      clock: {
        dayNumber: 2,
        dayOfWeek: 'Tuesday',
        dayType: 'weekday',
        simulatedTime: '10:00',
        simulatedSeconds: 36000,
        currentMinutes: 600,
        speed: 1,
      },
      needs: { energy: 75, hunger: 30, sleepiness: 20, fatigue: 15, focus: 80, socialNeed: 40 },
      project: { totalProgress: 20, currentProject: 'VishalFly', focus: 80, sessionProgress: 0, sessionElapsedSimMinutes: 0, completedTasks: 0, isWorking: false } as any,
      assignment: { progress: 30, currentTask: 'CS301', completedTasks: 1, isWorking: false },
      workout: null,
      events: [],
      // Notice: cognitive is omitted entirely!
    };

    // Store in localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('vishalfly_simulation_save_v1', JSON.stringify(legacySave));
      const ok = engine.loadSimulation();
      expect(ok).toBe(true);
      expect(engine.clock.getState().simulatedTime).toBe('10:00');
      // Cognitive engine should safely keep defaults
      expect(engine.getCognitiveEngine().getIsCognitionEnabled()).toBe(true);
    }
  });

  // Test 16: Disabling cognition restores the existing decision path
  it('16. disabling cognition restores legacy decision path', () => {
    const engine = new SimulationEngine();
    engine.setTime('09:00'); // Classroom lecture time

    engine.setCognitionEnabled(false);
    expect(engine.getCognitiveEngine().getIsCognitionEnabled()).toBe(false);

    const state = engine.step(1.0);
    // Simulation state should run without errors in legacy mode
    expect(state.currentActivity).toBeDefined();
    expect(state.cognitive?.isCognitionEnabled).toBe(false);

    // Re-enable cognition
    engine.setCognitionEnabled(true);
    expect(engine.getCognitiveEngine().getIsCognitionEnabled()).toBe(true);
  });

  // Test 17: Connectome adapter boundary integrity
  it('17. connectome adapter provides synthetic fixtures and declares biological honesty', () => {
    const adapter = new ConnectomeAdapter();
    expect(adapter.isRealDataImported()).toBe(false);
    const summary = adapter.getSummary();
    expect(summary.isRealDataImported).toBe(false);
    expect(summary.neuropilsCount).toBeGreaterThan(5);
    expect(summary.provenance).toContain('Ito et al');

    // Central complex neuropils must be present
    const eb = adapter.getNeuropil('CX_EB');
    expect(eb).toBeDefined();
    expect(eb?.standardName).toContain('Ellipsoid Body');
  });
});
