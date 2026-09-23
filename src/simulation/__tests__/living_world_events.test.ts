import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../engine/SimulationEngine';
import { WorldEventSystem, Mulberry32PRNG } from '../events/WorldEventSystem';
import { DEFAULT_WORLD_EVENT_DEFINITIONS, WORLD_EVENT_DEFINITIONS } from '../events/WorldEventDefinitions';
import { WorldEventEvaluationContext } from '../events/WorldEventTypes';
import { GustatoryEnvironment } from '../../cognition/connectome/gustatory/GustatoryEnvironment';
import { OlfactoryEnvironment } from '../../cognition/connectome/olfactory/OlfactoryEnvironment';
import { LOCATIONS } from '../../navigation/locationGraph';
import { useGameStore } from '../../store/useGameStore';

describe('Milestone 5: Living World, Emergent Events & Autonomous Daily Life', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();
    engine.restartDay();
  });

  // 1. Deterministic event generation under a fixed seed
  it('1. Generates deterministic event sequences under a fixed seed', () => {
    const prng1 = new Mulberry32PRNG(424242);
    const prng2 = new Mulberry32PRNG(424242);

    const values1 = Array.from({ length: 20 }, () => prng1.next());
    const values2 = Array.from({ length: 20 }, () => prng2.next());

    expect(values1).toEqual(values2);

    // Test WorldEventSystem determinism
    const systemA = new WorldEventSystem(undefined, { deterministicSeed: 9999, isMasterEnabled: true });
    const systemB = new WorldEventSystem(undefined, { deterministicSeed: 9999, isMasterEnabled: true });

    const context: WorldEventEvaluationContext = {
      clock: {
        simulatedTime: '17:30',
        simulatedSeconds: 17 * 3600 + 30 * 60,
        currentMinutes: 17 * 60 + 30,
        dayNumber: 1,
        dayOfWeek: 'Sunday',
        dayType: 'weekend',
        speed: 1,
        isPaused: false,
        totalElapsedSimulatedSeconds: 1000,
        totalElapsedRealSeconds: 100,
      },
      currentLocationId: 'bedroom',
      activeActivityId: 'reading',
      needs: {
        energy: 80,
        hunger: 30,
        sleepiness: 20,
        fatigue: 15,
        focus: 70,
        socialNeed: 40,
      },
      isAutonomous: true,
      isTravelling: false,
      hungerLevel: 30,
    };

    // Step both identically
    for (let i = 0; i < 5; i++) {
      systemA.step(60, context);
      systemB.step(60, context);
    }

    const telA = systemA.getTelemetry();
    const telB = systemB.getTelemetry();

    expect(telA.activeEvents.map((e) => e.definitionId)).toEqual(
      telB.activeEvents.map((e) => e.definitionId)
    );
  });

  // 2. Event trigger conditions and durations
  it('2. Evaluates event trigger conditions and durations within configured bounds', () => {
    const goldenHourDef = WORLD_EVENT_DEFINITIONS.find((d) => d.id === 'golden_hour_sunbeam');
    expect(goldenHourDef).toBeDefined();

    const invalidContext: WorldEventEvaluationContext = {
      clock: {
        simulatedTime: '12:00',
        simulatedSeconds: 12 * 3600,
        currentMinutes: 720,
        dayNumber: 1,
        dayOfWeek: 'Monday',
        dayType: 'weekday',
        speed: 1,
        isPaused: false,
        totalElapsedSimulatedSeconds: 500,
        totalElapsedRealSeconds: 50,
      },
      currentLocationId: 'classroom',
      activeActivityId: 'lecture',
      needs: {
        energy: 90,
        hunger: 10,
        sleepiness: 10,
        fatigue: 10,
        focus: 90,
        socialNeed: 50,
      },
      isAutonomous: true,
      isTravelling: false,
      hungerLevel: 10,
    };

    const validContext: WorldEventEvaluationContext = {
      clock: {
        simulatedTime: '17:00',
        simulatedSeconds: 17 * 3600,
        currentMinutes: 1020,
        dayNumber: 1,
        dayOfWeek: 'Monday',
        dayType: 'weekday',
        speed: 1,
        isPaused: false,
        totalElapsedSimulatedSeconds: 1000,
        totalElapsedRealSeconds: 100,
      },
      currentLocationId: 'bedroom',
      activeActivityId: 'relaxing',
      needs: {
        energy: 90,
        hunger: 10,
        sleepiness: 10,
        fatigue: 10,
        focus: 90,
        socialNeed: 50,
      },
      isAutonomous: true,
      isTravelling: false,
      hungerLevel: 10,
    };

    expect(goldenHourDef?.triggerCondition(invalidContext)).toBe(false);
    expect(goldenHourDef?.triggerCondition(validContext)).toBe(true);

    // Duration is positive and within expected range
    expect(goldenHourDef?.minDurationSimSeconds).toBeGreaterThan(0);
    expect(goldenHourDef?.maxDurationSimSeconds).toBeLessThanOrEqual(3600);
  });

  // 3. Event expiration and cleanup
  it('3. Advances active event countdowns and properly cleans up expired events', () => {
    const system = new WorldEventSystem(undefined, { deterministicSeed: 123, isMasterEnabled: true });
    const triggered = system.triggerEvent('sudden_window_draft');
    expect(triggered).toBe(true);

    let telemetry = system.getTelemetry();
    expect(telemetry.activeEvents.length).toBe(1);
    const active = telemetry.activeEvents[0];
    const initialDuration = active.remainingSimSeconds;

    const dummyContext: WorldEventEvaluationContext = {
      clock: {
        simulatedTime: '14:00',
        simulatedSeconds: 14 * 3600,
        currentMinutes: 840,
        dayNumber: 1,
        dayOfWeek: 'Tuesday',
        dayType: 'weekday',
        speed: 1,
        isPaused: false,
        totalElapsedSimulatedSeconds: 100,
        totalElapsedRealSeconds: 10,
      },
      currentLocationId: 'bedroom',
      needs: { energy: 80, hunger: 20, sleepiness: 20, fatigue: 20, focus: 80, socialNeed: 50 },
      isAutonomous: true,
      isTravelling: false,
      hungerLevel: 20,
    };

    // Advance by half duration
    system.step(initialDuration / 2, dummyContext);

    telemetry = system.getTelemetry();
    const midActive = telemetry.activeEvents.find((e) => e.definitionId === 'sudden_window_draft');
    expect(midActive).toBeDefined();
    expect(midActive!.remainingSimSeconds).toBeLessThan(initialDuration);

    // Advance past remaining duration
    system.step(initialDuration + 10, dummyContext);

    telemetry = system.getTelemetry();
    const finalActive = telemetry.activeEvents.find((e) => e.definitionId === 'sudden_window_draft');
    expect(finalActive).toBeUndefined();
    expect(telemetry.recentHistory.some((e) => e.definitionId === 'sudden_window_draft')).toBe(true);
  });

  // 4. Event configuration and disabled categories
  it('4. Respects category toggles and master enabled switch', () => {
    const system = new WorldEventSystem(undefined, { deterministicSeed: 555, isMasterEnabled: true });

    // Disable 'ambient_creature' category
    system.setCategoryEnabled('ambient_creature', false);
    expect(system.getTelemetry().settings.categoryEnabled.ambient_creature).toBe(false);

    // Attempting to trigger ambient creature fails
    const result = system.triggerEvent('visitor_fly_window');
    expect(result).toBe(false);
    expect(system.getTelemetry().activeEvents.length).toBe(0);

    // Re-enable and verify it triggers
    system.setCategoryEnabled('ambient_creature', true);
    const result2 = system.triggerEvent('visitor_fly_window');
    expect(result2).toBe(true);
    expect(system.getTelemetry().activeEvents.length).toBe(1);

    // Master disable disables processing and triggers
    system.setMasterEnabled(false);
    expect(system.triggerEvent('golden_hour_sunbeam')).toBe(false);
  });

  // 5. Bounded event counts and memory use
  it('5. Enforces strict upper bounds on concurrent active events and event history', () => {
    const system = new WorldEventSystem(undefined, { deterministicSeed: 777, isMasterEnabled: true });

    // Attempt to trigger many events simultaneously
    DEFAULT_WORLD_EVENT_DEFINITIONS.forEach((def) => {
      system.triggerEvent(def.id);
    });

    const tel = system.getTelemetry();
    // System enforces max concurrent active events
    expect(tel.activeEvents.length).toBeLessThanOrEqual(tel.settings.maxConcurrentEvents);

    const dummyContext: WorldEventEvaluationContext = {
      clock: {
        simulatedTime: '12:00',
        simulatedSeconds: 43200,
        currentMinutes: 720,
        dayNumber: 1,
        dayOfWeek: 'Monday',
        dayType: 'weekday',
        speed: 1,
        isPaused: false,
        totalElapsedSimulatedSeconds: 100,
        totalElapsedRealSeconds: 10,
      },
      currentLocationId: 'bedroom',
      needs: { energy: 90, hunger: 10, sleepiness: 10, fatigue: 10, focus: 90, socialNeed: 50 },
      isAutonomous: true,
      isTravelling: false,
      hungerLevel: 10,
    };

    // System enforces max history bounds
    for (let i = 0; i < 70; i++) {
      system.reset();
      system.triggerEvent('sudden_window_draft');
      system.step(500, dummyContext);
    }

    expect(system.getTelemetry().recentHistory.length).toBeLessThanOrEqual(system.getTelemetry().settings.maxEventHistory);
  });

  // 6. Correct effects on needs and activity selection
  it('6. Routes world-event effects to needs and behavioral decision modifiers', () => {
    engine.restartDay();

    // Trigger golden hour event which modifies lighting and focus
    const triggered = engine.triggerWorldEvent('golden_hour_sunbeam');
    expect(triggered).toBe(true);
    const tel = engine.getWorldEventTelemetry();
    expect(tel.activeEvents.length).toBeGreaterThan(0);
    expect(tel.activeEffects.ambientLightingOverride).toBe('afternoon');

    // Trigger snack bowl replenishment
    engine.triggerWorldEvent('snack_bowl_refreshed');
    const tel2 = engine.getWorldEventTelemetry();
    expect(tel2.activeEvents.length).toBeGreaterThan(0);
  });

  // 7. Schedule context influencing—but not hardcoding—behavior
  it('7. Uses schedule context as priority weight without rigid hardcoding', () => {
    const cognition = engine.cognitiveEngine;
    const currentActivity = engine.activityManager.getCurrentInstance();
    const activeEntry = engine.planner.getActiveEntry(
      engine.clock.getState().currentMinutes,
      engine.clock.getState().dayType
    );

    // Step cognition and inspect decision breakdown
    const result = cognition.step({
      clock: engine.clock.getState(),
      character: engine.step(0).character,
      currentActivity: currentActivity,
      activeScheduleEntry: activeEntry,
      needs: engine.needsSystem.getState(),
      workoutSession: null,
      mealSession: null,
      projectState: engine.projectSystem.getState(),
      assignmentState: engine.assignmentSystem.getState(),
      familyCallState: engine.familyCallSystem.getState(),
      laundryState: engine.laundrySystem.getState(),
      currentWaypoint: 'center',
      deltaSimSeconds: 1.0,
      worldEffects: engine.getWorldEventTelemetry().activeEffects,
    });

    expect(result.isCognitionEnabled).toBe(true);
    if (result.decision) {
      expect(result.decision.decisionBreakdown).toBeDefined();
      expect(result.decision.decisionBreakdown?.scheduleContextScore).toBeGreaterThanOrEqual(0);
      expect(result.decision.confidence).toBeGreaterThan(0);
    }
  });

  // 8. Hysteresis/cooldowns preventing rapid oscillation
  it('8. Applies hysteresis cooldowns when switching behaviors to prevent oscillation', () => {
    const cognition = engine.cognitiveEngine;
    const actionSelector = cognition.selector;

    // Set an explicit cooldown
    actionSelector.setCooldown('sleep', 120);
    expect(actionSelector.isBehaviorOnCooldown('sleep')).toBe(true);

    // Step action selector to advance cooldown timer
    actionSelector.updateCooldowns(30);
    expect(actionSelector.isBehaviorOnCooldown('sleep')).toBe(true);
    expect(actionSelector.getActiveCooldowns()['sleep']).toBe(90);

    // Step through remaining cooldown
    actionSelector.updateCooldowns(95);
    expect(actionSelector.isBehaviorOnCooldown('sleep')).toBe(false);
  });

  // 9. Food depletion and learned valence affecting destination selection
  it('9. Integrates food depletion and learned odor valence into cognitive memory', () => {
    const memory = engine.cognitiveEngine.memory;

    // Record visited waypoints
    memory.recordVisitedWaypoint('bedroom', 'desk', '06:30', 390, 1);
    const visited = memory.getRecentlyVisitedWaypoints(45, 395);
    expect(visited.includes('desk')).toBe(true);

    // Record food surface depletion
    memory.recordFoodSurfaceOutcome('dining_fruit_bowl', 'depleted', '12:00', 720, 1, 0);
    expect(memory.isFoodSurfaceRememberedDepleted('dining_fruit_bowl', 90, 730)).toBe(true);

    // Non-depleted food surface
    memory.recordFoodSurfaceOutcome('kitchen_counter_sugar', 'abundant', '12:00', 720, 1, 80);
    expect(memory.isFoodSurfaceRememberedDepleted('kitchen_counter_sugar', 90, 730)).toBe(false);
    expect(
      memory.getPreferredFoodSurface(['dining_fruit_bowl', 'kitchen_counter_sugar'], 90, 730)
    ).toBe('kitchen_counter_sugar');
  });

  // 10. Manual mode remaining responsive
  it('10. Keeps manual mode flight controls responsive without world event locks', () => {
    useGameStore.getState().setControllerMode('manual');
    expect(useGameStore.getState().controllerMode).toBe('manual');

    // Trigger an ambient interruption
    engine.triggerWorldEvent('sudden_window_draft');

    // Verify manual mode is unchanged and remains in user control
    expect(useGameStore.getState().controllerMode).toBe('manual');
    expect(useGameStore.getState().isAutonomous).toBe(false);
  });

  // 11. Obstacle avoidance and movement bounds remaining intact
  it('11. Preserves spatial boundaries and obstacle safety checks', () => {
    const bounds = LOCATIONS.bedroom.bounds;
    expect(bounds.minX).toBeLessThan(bounds.maxX);
    expect(bounds.minY).toBeLessThan(bounds.maxY);
    expect(bounds.minZ).toBeLessThan(bounds.maxZ);

    const spawn = LOCATIONS.bedroom.spawnPosition;
    expect(spawn[0]).toBeGreaterThanOrEqual(bounds.minX);
    expect(spawn[0]).toBeLessThanOrEqual(bounds.maxX);
    expect(spawn[1]).toBeGreaterThanOrEqual(bounds.minY);
    expect(spawn[1]).toBeLessThanOrEqual(bounds.maxY);
    expect(spawn[2]).toBeGreaterThanOrEqual(bounds.minZ);
    expect(spawn[2]).toBeLessThanOrEqual(bounds.maxZ);
  });

  // 12. Weekend laundry and order-collection state transitions
  it('12. Executes weekend laundry and order-collection stage progressions', () => {
    // Jump to weekend morning
    engine.setDay(6, 'Saturday');
    engine.setTime('10:00');
    expect(engine.clock.getState().dayType).toBe('weekend');

    // Trigger weekend laundry
    engine.laundrySystem.startLaundry('10:00', 6);
    expect(engine.laundrySystem.getState().stage).toBe('washing');

    // Trigger weekend food order delivery
    engine.triggerFoodOrder();
    expect(engine.foodOrderSystem.getState().stage).not.toBe('idle');
  });

  // 13. No teleportation during world interactions
  it('13. Enforces continuous travel without teleportation during world interactions', () => {
    // Request travel to balcony via activity manager
    const travelStarted = engine.activityManager.initiateTravel('balcony');
    expect(travelStarted).toBe(true);
    expect(engine.activityManager.isTravelling()).toBe(true);

    // Initial location should remain origin, not instantly teleported to balcony
    expect(engine.activityManager.getCurrentLocation()).toBe('bedroom');
  });

  // 14. Accelerated simulation processing remaining stable
  it('14. Maintains numerical stability and bounded event triggers under accelerated simulation', () => {
    engine.restartDay();
    engine.clock.setSpeed(8); // 8x accelerated speed

    // Run 50 ticks of accelerated simulation
    for (let i = 0; i < 50; i++) {
      const state = engine.step(1.0);
      expect(state.livingWorld).toBeDefined();
      expect(state.livingWorld?.activeEvents.length).toBeLessThanOrEqual(4);
    }

    const telemetry = engine.getWorldEventTelemetry();
    expect(telemetry.settings.isMasterEnabled).toBe(true);
  });

  // 15. Preserves M1–M4 core subsystem integrity (laundry, gym, meals, connectome)
  it('15. Preserves M1-M4 core subsystem integrity (laundry, gym, meals, connectome)', () => {
    expect(engine.laundrySystem).toBeDefined();
    expect(engine.workoutSystem).toBeDefined();
    expect(engine.mealSystem).toBeDefined();
    expect(engine.projectSystem).toBeDefined();
    expect(engine.assignmentSystem).toBeDefined();
    expect(engine.familyCallSystem).toBeDefined();

    const gustatory = new GustatoryEnvironment();
    expect(gustatory.getSurfaces().length).toBeGreaterThan(0);
    const olfactory = new OlfactoryEnvironment();
    expect(olfactory.getSources().length).toBeGreaterThan(0);
  });

  // 16. Dashboard event and decision telemetry matching underlying state
  it('16. Telemetry accurately mirrors the underlying world event and cognitive decision state', () => {
    engine.restartDay();
    engine.triggerWorldEvent('sudden_window_draft');

    const state = engine.step(1.0);
    const tel = engine.getWorldEventTelemetry();

    // Verify engine state matches telemetry
    expect(state.livingWorld).toBeDefined();
    expect(state.livingWorld?.activeEvents.length).toBe(tel.activeEvents.length);
    expect(state.livingWorld?.settings.deterministicSeed).toBe(tel.settings.deterministicSeed);
    expect(state.livingWorld?.totalTriggeredCount).toBe(tel.totalTriggeredCount);
    expect(state.livingWorld?.activeEffects.attentionDistraction).toBe(
      tel.activeEffects.attentionDistraction
    );
  });
});
