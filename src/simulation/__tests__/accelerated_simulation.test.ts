import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../engine/SimulationEngine';

describe('Milestone 6: Accelerated Simulation & Acceptance Test Suite', () => {
  it('runs an accelerated day simulation verifying all subsystems and cognitive decisions', () => {
    const engine = new SimulationEngine();
    engine.restartDay();

    // 1. Verify simulation clock starts at 06:00
    expect(engine.clock.getState().simulatedTime).toBe('06:00');
    expect(engine.cognitiveEngine.getIsCognitionEnabled()).toBe(true);

    // 2. Advance through morning routine
    // Step forward by 30 simulated minutes (1800 simulated seconds = 30 ticks of 60s)
    for (let i = 0; i < 30; i++) {
      engine.step(1.0); // 1 real sec = 60 sim sec
    }
    expect(engine.clock.getState().simulatedTime).toBe('06:30');

    // 3. Jump to College lecture hours (09:00)
    engine.setTime('09:00');
    const collegeState = engine.step(1.0); // allows transit to complete
    expect(engine.activityManager.getCurrentLocation()).toBe('classroom');
    expect(collegeState.currentActivity?.definition.id).toBe('college_activities');
    expect(collegeState.cognitive).toBeDefined();
    expect(collegeState.cognitive?.evaluations.length).toBeGreaterThan(0);
    expect(collegeState.cognitive?.lastDecision).toBeDefined();

    // 4. Jump to Gym workout (17:15)
    engine.setTime('17:15');
    const gymState = engine.step(1.0);
    expect(engine.activityManager.getCurrentLocation()).toBe('gym');
    expect(gymState.currentActivity?.definition.id).toBe('gym_workout');
    expect(gymState.workoutSession).toBeDefined();

    // 5. Jump to Dinner meal (18:50)
    engine.setTime('18:50');
    const mealState = engine.step(1.0);
    expect(engine.activityManager.getCurrentLocation()).toBe('dining');
    expect(mealState.currentActivity?.definition.id).toBe('dinner');
    expect(mealState.mealSession).toBeDefined();

    // 6. Jump to Family Call & Walk (19:20)
    engine.setTime('19:20');
    const callState = engine.step(1.0);
    expect(engine.activityManager.getCurrentLocation()).toBe('grounds');
    expect(callState.currentActivity?.definition.id).toBe('family_call_walk');
    expect(callState.familyCallState.isActive).toBe(true);

    // 7. Jump to Project work (20:30)
    engine.setTime('20:30');
    const projState = engine.step(1.0);
    expect(engine.activityManager.getCurrentLocation()).toBe('bedroom');
    expect(projState.currentActivity?.definition.id).toBe('project_work');
    expect(projState.projectState.isWorking).toBe(true);

    // 8. Jump to College assignments (22:50)
    engine.setTime('22:50');
    const assignState = engine.step(1.0);
    expect(assignState.currentActivity?.definition.id).toBe('college_assignments');
    expect(assignState.assignmentState.isWorking).toBe(true);

    // 9. Jump to Deep Sleep (23:30)
    engine.setTime('23:30');
    const sleepState = engine.step(1.0);
    expect(sleepState.currentActivity?.definition.id).toBe('sleep');

    // 10. Test Toggle Cognition: Disable and verify
    engine.setCognitionEnabled(false);
    expect(engine.cognitiveEngine.getIsCognitionEnabled()).toBe(false);
    const bypassedState = engine.step(1.0);
    expect(bypassedState.cognitive?.isCognitionEnabled).toBe(false);

    // Re-enable cognition
    engine.setCognitionEnabled(true);
    expect(engine.cognitiveEngine.getIsCognitionEnabled()).toBe(true);

    // 11. Test Persistence Save & Load
    const saveOk = engine.saveSimulation();
    expect(saveOk).toBe(true);

    const loadOk = engine.loadSimulation();
    expect(loadOk).toBe(true);

    // 12. Test Midnight rollover
    engine.setTime('23:59');
    const rolloverResult = engine.step(2.0); // 120 sim seconds -> crosses into next day 00:01
    expect(rolloverResult.clock.dayNumber).toBe(2);
    expect(rolloverResult.clock.simulatedTime).toBe('00:01');
  });
});
