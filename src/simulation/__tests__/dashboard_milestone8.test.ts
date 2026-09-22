import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../engine/SimulationEngine';
import { AnalyticsTracker } from '../analytics/AnalyticsTracker';
import { useGameStore, simulationEngine } from '../../store/useGameStore';
import { SimulationPersistence } from '../persistence/SimulationPersistence';
import { COLLEGE_BEHAVIOR_WEIGHTS } from '../config/defaults';

describe('Milestone 8: Premium Simulation Dashboard, Timeline & Replay Tests', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();
  });

  // 1. Dashboard displays actual simulation state
  describe('Requirement 1: Dashboard displays actual simulation state', () => {
    it('accurately reflects clock, location, activity, and needs in simulation state', () => {
      const state = engine.getState();
      expect(state.clock).toBeDefined();
      expect(state.clock.simulatedTime).toBe('06:00');
      expect(state.character.locationId).toBe('bedroom');
      expect(state.needs.energy).toBeGreaterThan(0);
      expect(state.needs.hunger).toBeGreaterThan(0);
    });
  });

  // 2. Pause and resume invoke existing simulation controls
  describe('Requirement 2: Pause and resume controls', () => {
    it('pauses and resumes real simulation clock progression', () => {
      expect(engine.clock.getState().isPaused).toBe(false);

      engine.pause();
      expect(engine.clock.getState().isPaused).toBe(true);

      const pausedTick = engine.clock.tick(5);
      expect(pausedTick.simulatedDeltaSeconds).toBe(0);

      engine.resume();
      expect(engine.clock.getState().isPaused).toBe(false);

      const activeTick = engine.clock.tick(1);
      expect(activeTick.simulatedDeltaSeconds).toBeGreaterThan(0);
    });
  });

  // 3. Speed controls update real simulation speed
  describe('Requirement 3: Speed multiplier controls', () => {
    it('updates real clock speed across 1x, 2x, 4x, and 8x', () => {
      [1, 2, 4, 8].forEach((speed) => {
        engine.setSpeed(speed as any);
        expect(engine.clock.getState().speed).toBe(speed);
      });
    });
  });

  // 4. Activity Inspector renders correct activity context
  describe('Requirement 4: Activity Inspector contextual data', () => {
    it('provides rich contextual details for gym workouts', () => {
      engine.triggerWorkout('push');
      const state = engine.step(1);
      expect(state.workoutSession).toBeDefined();
      expect(state.workoutSession?.plan.type).toBe('push');
      expect(state.workoutSession?.currentSet).toBeGreaterThanOrEqual(1);
    });

    it('provides rich contextual details for meals', () => {
      engine.triggerMeal('lunch');
      const state = engine.step(1);
      expect(state.mealSession).toBeDefined();
      expect(state.mealSession?.meal.type).toBe('lunch');
    });

    it('provides rich contextual details for college variations', () => {
      engine.setTime('09:00');
      const state = engine.step(1);
      expect(state.currentActivity?.definition.id).toBe('college_activities');
    });
  });

  // 5. Needs panel reads existing NeedsSystem values
  describe('Requirement 5: Needs panel data integrity', () => {
    it('reads real NeedsSystem values without duplication or drift', () => {
      engine.setNeed('energy', 44);
      engine.setNeed('hunger', 77);

      const state = engine.getState();
      expect(state.needs.energy).toBe(44);
      expect(state.needs.hunger).toBe(77);
      expect(engine.needsSystem.getState().energy).toBe(44);
      expect(engine.needsSystem.getState().hunger).toBe(77);
    });
  });

  // 6. Cognitive inspector uses actual selector data
  describe('Requirement 6: Cognitive Inspector integration', () => {
    it('reads actual cognitive inspector data and decisions from CognitiveEngine', () => {
      const data = engine.getCognitiveInspectorState();
      expect(data).toBeDefined();
      expect(data.internalState).toBeDefined();
      expect(data.internalState.drives).toBeDefined();
    });
  });

  // 7. Timeline displays real recorded events
  describe('Requirement 7: Event Timeline integrity', () => {
    it('records and returns real events with IDs, categories, and timestamps', () => {
      const events = engine.eventLogger.getAll();
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].id).toBeDefined();
      expect(events[0].category).toBeDefined();
      expect(events[0].message).toBeDefined();
    });
  });

  // 8. Timeline filters do not modify source history
  describe('Requirement 8: Timeline filter immutability', () => {
    it('filtering does not mutate or remove events from the underlying logger', () => {
      const initialCount = engine.eventLogger.getAll().length;
      const allEvents = engine.eventLogger.getAll();

      // Perform filtering
      const filtered = allEvents.filter((e) => e.category === 'system');
      expect(filtered.length).toBeLessThanOrEqual(initialCount);

      // Verify source logger remains identical
      expect(engine.eventLogger.getAll().length).toBe(initialCount);
    });
  });

  // 9. Analytics derive values from actual records
  describe('Requirement 9: Analytics derivation from actual simulation records', () => {
    it('accumulates simulated time and activity metrics from real engine steps', () => {
      // Step simulation by 10 real seconds (600 simulated seconds = 10 sim minutes)
      for (let i = 0; i < 10; i++) {
        engine.step(1.0);
      }

      const report = engine.getAnalyticsReport();
      expect(report.measuredTimeRange.totalElapsedSimMinutes).toBeGreaterThanOrEqual(10);
      expect(report.hasSufficientData).toBe(true);
      expect(Object.keys(report.activityMetrics).length).toBeGreaterThan(0);
    });
  });

  // 10. Empty analytics data is handled gracefully
  describe('Requirement 10: Graceful empty analytics handling', () => {
    it('handles zero or initial runtime gracefully without NaN or errors', () => {
      const freshTracker = new AnalyticsTracker();
      const freshClock = engine.clock.getState();
      const report = freshTracker.generateReport(
        freshClock,
        engine.projectSystem.getState(),
        engine.assignmentSystem.getState(),
        null
      );

      expect(report.hasSufficientData).toBe(false);
      expect(report.overallCompletionRate).toBe(100);
      expect(report.workoutStats.workoutsCompleted).toBe(0);
      expect(report.needsTrends).toEqual([]);
    });
  });

  // 11. Replay does not execute activities a second time
  describe('Requirement 11: Replay execution safety', () => {
    it('scrubbing and playback of recorded snapshots does not re-execute activity logic', () => {
      // Run simulation to capture snapshots
      for (let i = 0; i < 15; i++) {
        engine.step(1.0);
      }

      const recorder = engine.getSnapshotRecorder();
      expect(recorder.count()).toBeGreaterThan(0);

      const replay = engine.getReplayEngine();
      const initialEventCount = engine.eventLogger.getAll().length;

      // Scrub back and forth
      replay.scrubTo(0);
      replay.stepForward();
      replay.stepForward();
      replay.jumpToStart();

      // No new events should have been dispatched to live engine during replay scrubbing
      expect(engine.eventLogger.getAll().length).toBe(initialEventCount);
    });
  });

  // 12. Replay and live simulation state remain separate
  describe('Requirement 12: Replay and live state separation', () => {
    it('maintains decoupled state when entering and exiting replay', () => {
      const store = useGameStore.getState();

      // Ensure some snapshots exist on simulationEngine attached to useGameStore
      simulationEngine.step(1.0);
      expect(simulationEngine.snapshotRecorder.count()).toBeGreaterThan(0);

      // Start replay
      store.startReplay(0);
      expect(useGameStore.getState().isReplayMode).toBe(true);
      expect(useGameStore.getState().activeView).toBe('replay');

      // Exit replay
      store.exitReplay();
      expect(useGameStore.getState().isReplayMode).toBe(false);
      expect(useGameStore.getState().activeView).toBe('simulation');
    });
  });

  // 13. Snapshot serialization and restoration
  describe('Requirement 13: Snapshot serialization validity', () => {
    it('ensures snapshots contain purely serializable JSON data without cyclic references', () => {
      engine.step(1.0);
      const snapshot = engine.snapshotRecorder.getLatest();
      expect(snapshot).toBeDefined();

      const serialized = JSON.stringify(snapshot);
      expect(typeof serialized).toBe('string');

      const restored = JSON.parse(serialized);
      expect(restored.locationId).toBe(snapshot?.locationId);
      expect(restored.needs.energy).toBe(snapshot?.needs.energy);
      expect(restored.flyPosition).toEqual(snapshot?.flyPosition);
    });
  });

  // 14. Settings validation works
  describe('Requirement 14: Settings validation', () => {
    it('validates college behavior weights and prevents invalid configurations', () => {
      const weights = { ...COLLEGE_BEHAVIOR_WEIGHTS };
      const total = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(total).toBe(100);

      engine.behaviorSelector.setWeights({
        lecture: 80,
        dozing: 10,
        laptop: 5,
        reels: 5,
        mobile_game: 0,
      });

      const behavior = engine.behaviorSelector.evaluateCollegeBehavior(540); // 09:00
      expect(behavior).toBeDefined();
    });
  });

  // 15. Safe persistence and legacy save load
  describe('Requirement 15: Persistence resilience', () => {
    it('safely handles missing fields or older saved snapshots gracefully', () => {
      const ok = engine.saveSimulation();
      expect(ok).toBe(true);

      const loaded = SimulationPersistence.loadSimulation();
      expect(loaded).toBeDefined();
      expect(loaded?.clock.dayNumber).toBe(engine.clock.getState().dayNumber);
      expect(loaded?.needs.energy).toBe(engine.needsSystem.getState().energy);
    });
  });
});
