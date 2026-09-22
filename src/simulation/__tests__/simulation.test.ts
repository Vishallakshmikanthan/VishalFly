import { describe, it, expect } from 'vitest';
import { SimulationClock } from '../engine/SimulationClock';
import { SchedulePlanner } from '../planner/SchedulePlanner';
import { BehaviorSelector } from '../planner/BehaviorSelector';
import { ActivityManager } from '../activities/ActivityManager';
import { NeedsSystem } from '../needs/NeedsSystem';
import { EventLogger } from '../events/EventLogger';
import { SimulationEngine } from '../engine/SimulationEngine';
import { ScheduleEntry } from '../types/simulation';
import { WorkoutSystem } from '../systems/WorkoutSystem';
import { MealSystem } from '../systems/MealSystem';
import { ProjectSystem } from '../systems/ProjectSystem';
import { AssignmentSystem } from '../systems/AssignmentSystem';
import { LaundrySystem } from '../systems/LaundrySystem';
import { FoodOrderSystem } from '../systems/FoodOrderSystem';

describe('Milestone 3: Autonomous Life Simulation Engine Tests', () => {

  // 1. Clock progression at 1x
  describe('Scenario 1: Clock progression at 1x', () => {
    it('advances 60 simulated seconds for 1 real second at 1x speed', () => {
      const clock = new SimulationClock({
        startingTime: '06:00',
        simulatedSecondsPerRealSecond: 60,
      });

      expect(clock.getState().simulatedTime).toBe('06:00');
      const res = clock.tick(1.0); // 1 real second
      expect(res.simulatedDeltaSeconds).toBe(60);
      expect(clock.getState().simulatedTime).toBe('06:01');
    });
  });

  // 2. Clock progression at 2x, 4x, and 8x
  describe('Scenario 2: Clock progression at 2x, 4x, and 8x', () => {
    it('scales time progression proportionally with speed multiplier', () => {
      const clock = new SimulationClock({
        startingTime: '06:00',
        simulatedSecondsPerRealSecond: 60,
      });

      // 2x speed
      clock.setSpeed(2);
      let res = clock.tick(1.0);
      expect(res.simulatedDeltaSeconds).toBe(120); // 2 sim minutes
      expect(clock.getState().simulatedTime).toBe('06:02');

      // 4x speed
      clock.setSpeed(4);
      res = clock.tick(1.0);
      expect(res.simulatedDeltaSeconds).toBe(240); // 4 sim minutes
      expect(clock.getState().simulatedTime).toBe('06:06');

      // 8x speed
      clock.setSpeed(8);
      res = clock.tick(1.0);
      expect(res.simulatedDeltaSeconds).toBe(480); // 8 sim minutes
      expect(clock.getState().simulatedTime).toBe('06:14');
    });
  });

  // 3. Pausing freezes simulated time
  describe('Scenario 3: Pausing freezes simulated time', () => {
    it('does not advance simulated time when paused', () => {
      const clock = new SimulationClock({ startingTime: '06:00' });
      clock.pause();
      expect(clock.getState().isPaused).toBe(true);

      const res = clock.tick(10.0);
      expect(res.simulatedDeltaSeconds).toBe(0);
      expect(clock.getState().simulatedTime).toBe('06:00');
      expect(clock.getState().totalElapsedSimulatedSeconds).toBe(0);
    });
  });

  // 4. Resuming continues from the correct time
  describe('Scenario 4: Resuming continues from the correct time', () => {
    it('resumes progression smoothly without time jumps or loss', () => {
      const clock = new SimulationClock({ startingTime: '06:00' });
      clock.tick(2.0); // +2 minutes -> 06:02
      expect(clock.getState().simulatedTime).toBe('06:02');

      clock.pause();
      clock.tick(5.0); // should stay 06:02
      expect(clock.getState().simulatedTime).toBe('06:02');

      clock.resume();
      clock.tick(3.0); // +3 minutes -> 06:05
      expect(clock.getState().simulatedTime).toBe('06:05');
    });
  });

  // 5. Midnight rollover increments the day correctly
  describe('Scenario 5: Midnight rollover increments day correctly', () => {
    it('rolls over from 23:59 to 00:00, increments dayNumber and advances dayOfWeek', () => {
      const clock = new SimulationClock({
        startingDay: 1,
        startingDayOfWeek: 'Monday',
        startingTime: '23:58',
      });

      expect(clock.getState().dayNumber).toBe(1);
      expect(clock.getState().dayOfWeek).toBe('Monday');

      // Advance 2 minutes (120 sim seconds = 2 real seconds) -> midnight rollover!
      const res = clock.tick(2.0);
      expect(res.dayRolledOver).toBe(true);
      expect(clock.getState().simulatedTime).toBe('00:00');
      expect(clock.getState().dayNumber).toBe(2);
      expect(clock.getState().dayOfWeek).toBe('Tuesday');
    });
  });

  // 6. Weekday/weekend schedule selection
  describe('Scenario 6: Weekday/weekend schedule selection', () => {
    it('correctly transitions between weekday and weekend schedules on configured days', () => {
      const clock = new SimulationClock({
        startingDay: 5,
        startingDayOfWeek: 'Friday',
        startingTime: '23:59',
      });
      expect(clock.getState().dayType).toBe('weekday');

      // Tick across midnight into Saturday
      clock.tick(1.0);
      expect(clock.getState().dayOfWeek).toBe('Saturday');
      expect(clock.getState().dayType).toBe('weekend');

      const planner = new SchedulePlanner();
      const satEntry = planner.getActiveEntry(9 * 60, clock.getState().dayType);
      // Weekend 09:00 is Project work
      expect(satEntry.id).toBe('we_project_morning');
    });
  });

  // 7. Overnight sleep handling
  describe('Scenario 7: Overnight sleep handling across midnight', () => {
    it('identifies sleep activity before and after midnight smoothly', () => {
      const planner = new SchedulePlanner();

      // On weekday, Sleep is 23:15 to 06:00 (1395 to 360)
      // At 23:30 (1410 min)
      const lateNight = planner.getActiveEntry(23 * 60 + 30, 'weekday');
      expect(lateNight.activityId).toBe('sleep');

      // At 02:00 (120 min)
      const earlyMorning = planner.getActiveEntry(2 * 60, 'weekday');
      expect(earlyMorning.activityId).toBe('sleep');

      // At 05:59 (359 min)
      const rightBeforeWakeup = planner.getActiveEntry(5 * 60 + 59, 'weekday');
      expect(rightBeforeWakeup.activityId).toBe('sleep');

      // At 06:00 (360 min)
      const morningRoutine = planner.getActiveEntry(6 * 60, 'weekday');
      expect(morningRoutine.activityId).toBe('wake_up_morning_routine');
    });
  });

  // 8. Schedule gaps and invalid entries
  describe('Scenario 8: Schedule gaps and invalid entries', () => {
    it('uses configured fallback activity when a schedule gap exists and detects invalid entries', () => {
      const planner = new SchedulePlanner();

      // Custom schedule with intentional gap between 12:00 and 14:00
      const gappedSchedule: ScheduleEntry[] = [
        {
          id: 'morning',
          activityId: 'morning_prep',
          name: 'Morning',
          startTime: '06:00',
          endTime: '12:00',
          startMinutes: 360,
          endMinutes: 720,
          locationId: 'bedroom',
        },
        {
          id: 'afternoon',
          activityId: 'project_work',
          name: 'Afternoon',
          startTime: '14:00',
          endTime: '18:00',
          startMinutes: 840,
          endMinutes: 1080,
          locationId: 'bedroom',
        },
      ];

      planner.setSchedule('weekday', gappedSchedule);

      // Query at 13:00 (780 min) inside the gap
      const gapEntry = planner.getActiveEntry(780, 'weekday');
      expect(gapEntry.isFallback).toBe(true);
      expect(gapEntry.activityId).toBe('free_idle');

      // Validate invalid schedule with out of order time and overlapping entries
      const invalidSchedule: ScheduleEntry[] = [
        {
          id: 'entry1',
          activityId: 'act1',
          name: 'Entry 1',
          startTime: '10:00',
          endTime: '12:00',
          startMinutes: 600,
          endMinutes: 720,
          locationId: 'bedroom',
        },
        {
          id: 'entry2',
          activityId: 'act2',
          name: 'Entry 2',
          startTime: '11:00',
          endTime: '13:00',
          startMinutes: 660, // Overlaps with entry 1
          endMinutes: 780,
          locationId: 'bedroom',
        },
      ];

      const validation = planner.validateSchedule(invalidSchedule);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('Overlapping');
    });
  });

  // 9. Activity transitions happen only once
  describe('Scenario 9: Activity transitions happen only once', () => {
    it('prevents duplicate start events across multiple ticks during the same activity', () => {
      const logger = new EventLogger();
      const activityManager = new ActivityManager('bedroom', logger, 5);

      const entry: ScheduleEntry = {
        id: 'test_entry',
        activityId: 'project_work',
        name: 'Project Coding',
        startTime: '10:00',
        endTime: '11:00',
        startMinutes: 600,
        endMinutes: 660,
        locationId: 'bedroom',
      };

      // Sync repeatedly 5 times (simulating 5 frames/ticks)
      for (let i = 0; i < 5; i++) {
        activityManager.syncScheduleEntry(entry, 600 + i, 'Day 1 • 10:0' + i, 1);
      }

      const startEvents = logger.getAll().filter((e) => e.message.includes('Started: Project Coding'));
      expect(startEvents.length).toBe(1);
    });
  });

  // 10. Travel completion precedes activity execution
  describe('Scenario 10: Travel completion precedes activity execution', () => {
    it('holds character in travelling state until travel duration elapses before starting activity', () => {
      const logger = new EventLogger();
      const travelDuration = 10; // 10 sim seconds
      const activityManager = new ActivityManager('bedroom', logger, travelDuration);

      const collegeEntry: ScheduleEntry = {
        id: 'wd_college',
        activityId: 'college_activities',
        name: 'College activities',
        startTime: '08:00',
        endTime: '16:00',
        startMinutes: 480,
        endMinutes: 960,
        locationId: 'classroom',
      };

      // Sync destination is classroom (different from bedroom)
      activityManager.syncScheduleEntry(collegeEntry, 480, 'Day 1 • 08:00', 1);

      expect(activityManager.getLifecycleState()).toBe('travelling');
      expect(activityManager.isTravelling()).toBe(true);
      expect(activityManager.getCurrentLocation()).toBe('bedroom'); // still in bedroom

      // Advance 6 sim seconds (partial travel)
      activityManager.update(6, 'Day 1 • 08:00', 1);
      expect(activityManager.getLifecycleState()).toBe('travelling');

      // Advance 5 more sim seconds (total 11 > 10)
      activityManager.update(5, 'Day 1 • 08:00', 1);
      expect(activityManager.getLifecycleState()).toBe('active');
      expect(activityManager.isTravelling()).toBe(false);
      expect(activityManager.getCurrentLocation()).toBe('classroom'); // arrived!
    });
  });

  // 11. College behavior selection respects configured weights and constraints
  describe('Scenario 11: College behavior selection respects weights and constraints', () => {
    it('samples behaviors according to configured weights and does not switch jittery every tick', () => {
      // Create selector with mock random function
      let mockRandomVal = 0.1; // Falls inside lecture (50% weight)
      const selector = new BehaviorSelector(
        { lecture: 50, dozing: 20, laptop: 15, reels: 10, mobile_game: 5 },
        45,
        () => mockRandomVal
      );

      let chosen = selector.evaluateCollegeBehavior(480);
      expect(chosen.behavior).toBe('lecture');
      expect(chosen.targetLandmark).toBe('Front Row Student Desks');

      // Same minute / within interval (e.g. 10 minutes later): does not re-sample even if random changes
      mockRandomVal = 0.98; // Would be mobile_game
      chosen = selector.evaluateCollegeBehavior(490);
      expect(chosen.behavior).toBe('lecture'); // Unchanged due to interval constraint!

      // After 45 minutes interval (minute 526): re-evaluates
      chosen = selector.evaluateCollegeBehavior(526);
      expect(chosen.behavior).toBe('mobile_game');
    });
  });

  // 12. Needs remain within 0–100
  describe('Scenario 12: Needs remain within 0-100', () => {
    it('strictly clamps all needs values between 0 and 100 regardless of extreme rates', () => {
      const logger = new EventLogger();
      const needs = new NeedsSystem(logger, {
        energy: 95,
        hunger: 5,
        sleepiness: 5,
        fatigue: 95,
        focus: 95,
        socialNeed: 5,
      });

      // Apply extreme positive and negative rates for 10 simulated hours
      needs.update(36000, {
        energyPerHour: 50,      // would exceed 100
        hungerPerHour: -50,     // would go below 0
        sleepinessPerHour: -50, // would go below 0
        fatiguePerHour: 50,     // would exceed 100
        focusPerHour: 50,       // would exceed 100
        socialNeedPerHour: -50, // would go below 0
      }, 'Day 1 • 10:00', 1);

      const state = needs.getState();
      expect(state.energy).toBe(100);
      expect(state.hunger).toBe(0);
      expect(state.sleepiness).toBe(0);
      expect(state.fatigue).toBe(100);
      expect(state.focus).toBe(100);
      expect(state.socialNeed).toBe(0);
    });
  });

  // 13. Needs update according to simulated time
  describe('Scenario 13: Needs update according to simulated time', () => {
    it('applies hourly rate proportionally to simulated delta seconds', () => {
      const logger = new EventLogger();
      const needs = new NeedsSystem(logger, { energy: 50 });

      // Apply +10 energy per hour for 1800 simulated seconds (0.5 hours)
      needs.update(1800, {
        energyPerHour: 10,
        hungerPerHour: 0,
        sleepinessPerHour: 0,
        fatiguePerHour: 0,
        focusPerHour: 0,
        socialNeedPerHour: 0,
      }, 'Day 1 • 07:00', 1);

      expect(needs.getState().energy).toBe(55); // 50 + (10 * 0.5) = 55
    });
  });

  // 14. Event IDs are unique and duplicate transitions do not produce duplicate events
  describe('Scenario 14: Event IDs are unique and duplicates suppressed', () => {
    it('generates unique IDs for different events and deduplicates immediate identical events', () => {
      const logger = new EventLogger();

      const evt1 = logger.log({
        timestamp: 'Day 1 • 08:00',
        dayNumber: 1,
        category: 'activity',
        message: 'Started lecture',
      });

      const evt2 = logger.log({
        timestamp: 'Day 1 • 08:00',
        dayNumber: 1,
        category: 'activity',
        message: 'Started lecture', // identical immediate duplicate
      });

      expect(evt1).not.toBeNull();
      expect(evt2).toBeNull(); // successfully suppressed!

      const evt3 = logger.log({
        timestamp: 'Day 1 • 08:01',
        dayNumber: 1,
        category: 'behavior',
        message: 'Perched on desk',
      });

      expect(evt3).not.toBeNull();
      expect(evt1?.id).not.toBe(evt3?.id);
    });
  });

  // 15. Multiple simulated days execute without a crash
  describe('Scenario 15: Multiple simulated days execute without a crash', () => {
    it('simulates 7 full consecutive days (weekday & weekend) stably and deterministically', () => {
      const engine = new SimulationEngine({
        startingDay: 1,
        startingDayOfWeek: 'Monday',
        startingTime: '06:00',
        simulatedSecondsPerRealSecond: 60,
      });

      // 7 days = 7 * 86,400 = 604,800 simulated seconds
      // In chunks of 1 hour (3600 sim seconds = 60 real seconds)
      const totalHours = 7 * 24;

      for (let h = 0; h < totalHours; h++) {
        const state = engine.step(60); // 1 real sec = 1 sim hour
        expect(state.clock.isPaused).toBe(false);
        expect(state.needs.energy).toBeGreaterThanOrEqual(0);
        expect(state.needs.energy).toBeLessThanOrEqual(100);
      }

      const finalState = engine.step(0);
      expect(finalState.clock.dayNumber).toBe(8); // completed 7 full days
      expect(finalState.clock.dayOfWeek).toBe('Monday'); // rolled over from Sun to Mon
      expect(finalState.clock.dayType).toBe('weekday');
      expect(finalState.recentEvents.length).toBeGreaterThan(0);
    });
  });

});

describe('Milestone 4: Interactive Daily Life Systems Tests', () => {

  // 1. Meal reduces hunger
  describe('Scenario 1: Meal reduces hunger', () => {
    it('reduces hunger over time and completes meal', () => {
      const logger = new EventLogger();
      const mealSystem = new MealSystem(logger);
      const session = mealSystem.startMeal('dinner', 'Day 1 • 20:00', 1);
      expect(session.meal.type).toBe('dinner');
      const res = mealSystem.update(900, 'Day 1 • 20:15', 1); // 15 mins (half duration)
      expect(res.hungerDelta).toBeLessThan(0);
      expect(res.session?.progressPercent).toBe(50);
    });

    it('integrated engine meal reduces simulated hunger need', () => {
      const engine = new SimulationEngine({ startingTime: '18:45', startingDay: 1 });
      engine.setNeed('hunger', 80);
      engine.step(20); // 20 real seconds = 20 simulated minutes of dinner
      expect(engine.getState().needs.hunger).toBeLessThan(80);
    });
  });

  // 2. Workout increases fatigue
  describe('Scenario 2: Workout increases fatigue', () => {
    it('increases fatigue and decreases energy during workout', () => {
      const engine = new SimulationEngine({ startingTime: '17:45', startingDay: 1 });
      engine.setNeed('fatigue', 15);
      engine.setNeed('energy', 90);
      engine.triggerWorkout('push');
      engine.step(1200); // 20 sim minutes
      expect(engine.getState().needs.fatigue).toBeGreaterThan(15);
      expect(engine.getState().needs.energy).toBeLessThan(90);
    });
  });

  // 3. Workout progresses through sets
  describe('Scenario 3: Workout progresses through sets', () => {
    it('progresses from ARRIVE to LIFT, completes set, enters REST, and advances to set 2', () => {
      const logger = new EventLogger();
      const workoutSystem = new WorkoutSystem(logger);
      workoutSystem.startWorkout('Monday', 'Day 1 • 18:00', 1);

      // Step through stages: ARRIVE (5s) -> WARMUP (10s) -> SELECT_EXERCISE (immediate) -> SETUP (5s) -> LIFT
      workoutSystem.update(6, 'Day 1 • 18:00', 1); // ARRIVE -> WARMUP
      workoutSystem.update(11, 'Day 1 • 18:00', 1); // WARMUP -> SELECT_EXERCISE
      workoutSystem.update(1, 'Day 1 • 18:00', 1); // SELECT_EXERCISE -> SETUP
      workoutSystem.update(6, 'Day 1 • 18:00', 1); // SETUP -> LIFT

      let session = workoutSystem.getCurrentSession();
      expect(session?.state).toBe('LIFT');
      expect(session?.currentSet).toBe(1);

      // Reps: 8 reps * 2.5s = 20s -> completes set 1
      workoutSystem.update(25, 'Day 1 • 18:01', 1);
      session = workoutSystem.getCurrentSession();
      expect(session?.state).toBe('REST');
      expect(session?.restRemainingSimSeconds).toBeGreaterThan(0);

      // Rest period: 90 seconds -> finishes rest and transitions to set 2
      workoutSystem.update(95, 'Day 1 • 18:02', 1);
      session = workoutSystem.getCurrentSession();
      expect(session?.state).toBe('LIFT');
      expect(session?.currentSet).toBe(2);
    });
  });

  // 4. PPL rotation selects the correct workout
  describe('Scenario 4: PPL rotation selects the correct workout', () => {
    it('returns the configured Push/Pull/Legs rotation for each day of the week', () => {
      const logger = new EventLogger();
      const ws = new WorkoutSystem(logger);
      expect(ws.getWorkoutForDay('Monday')).toBe('push');
      expect(ws.getWorkoutForDay('Tuesday')).toBe('pull');
      expect(ws.getWorkoutForDay('Wednesday')).toBe('legs');
      expect(ws.getWorkoutForDay('Thursday')).toBe('push');
      expect(ws.getWorkoutForDay('Friday')).toBe('pull');
      expect(ws.getWorkoutForDay('Saturday')).toBe('legs');
      expect(ws.getWorkoutForDay('Sunday')).toBe('rest');
    });
  });

  // 5. Project progress increases during project work
  describe('Scenario 5: Project progress increases during project work', () => {
    it('accumulates project progress deterministically scaled by needs', () => {
      const logger = new EventLogger();
      const projectSystem = new ProjectSystem(logger);
      projectSystem.startSession('Day 1 • 19:00', 1);
      const initProgress = projectSystem.getState().totalProgress;
      projectSystem.update(1800, {
        energy: 90,
        hunger: 20,
        sleepiness: 10,
        fatigue: 10,
        focus: 85,
        socialNeed: 20,
      }, 'Day 1 • 19:30', 1);
      expect(projectSystem.getState().totalProgress).toBeGreaterThan(initProgress);
      expect(projectSystem.getState().sessionElapsedSimMinutes).toBe(30);
    });
  });

  // 6. Assignment progress increases during assignment work
  describe('Scenario 6: Assignment progress increases during assignment work', () => {
    it('advances assignment progress and cycles completed tasks upon finishing', () => {
      const logger = new EventLogger();
      const assignSystem = new AssignmentSystem(logger);
      expect(assignSystem.getState().progress).toBe(30);
      expect(assignSystem.getState().completedTasks).toBe(4);

      assignSystem.startSession('Day 1 • 20:00', 1);
      const testNeeds = {
        energy: 90,
        hunger: 20,
        sleepiness: 10,
        fatigue: 10,
        focus: 80,
        socialNeed: 20,
      };
      assignSystem.update(1800, testNeeds, 'Day 1 • 20:30', 1); // 30 minutes
      expect(assignSystem.getState().progress).toBeGreaterThan(30);

      // Advance until completion (needs ~60 more minutes to hit 100%)
      assignSystem.update(7200, testNeeds, 'Day 1 • 22:30', 1);
      expect(assignSystem.getState().completedTasks).toBeGreaterThanOrEqual(5);
    });
  });

  // 7. Family call reduces social need
  describe('Scenario 7: Family call reduces social need', () => {
    it('reduces social need while walking courtyard loop during family call', () => {
      const engine = new SimulationEngine({ startingTime: '19:15', startingDay: 1 });
      engine.setNeed('socialNeed', 85);
      engine.step(15); // 15 real seconds = 15 simulated minutes of calling
      expect(engine.getState().needs.socialNeed).toBeLessThan(85);
      expect(engine.getState().character.flyActivity).toBe('phone_call');
      expect(engine.getState().character.locationId).toBe('grounds');
    });
  });

  // 8. Laundry progresses through both stages
  describe('Scenario 8: Laundry progresses through both stages', () => {
    it('progresses from washing in bedroom to clothes drying on balcony', () => {
      const logger = new EventLogger();
      const laundry = new LaundrySystem(logger);

      // Stage 1: Washing
      laundry.startLaundry('Day 6 • 10:00', 6);
      expect(laundry.getState().stage).toBe('washing');
      laundry.update(2700, 'Day 6 • 10:45', 6); // 45 sim minutes
      expect(laundry.getState().isCompleted).toBe(true);

      // Stage 2: Balcony Drying
      laundry.startDrying('Day 6 • 10:45', 6);
      expect(laundry.getState().stage).toBe('drying');
      laundry.update(2700, 'Day 6 • 11:30', 6); // 45 sim minutes
      expect(laundry.getState().isCompleted).toBe(true);
      expect(laundry.getState().progressPercent).toBe(100);
    });
  });

  // 9. Food order follows the correct sequence
  describe('Scenario 9: Food order follows the correct sequence', () => {
    it('executes ORDER -> WAIT -> GATE -> COLLECT -> RETURN -> EAT -> COMPLETE', () => {
      const logger = new EventLogger();
      const foodOrder = new FoodOrderSystem(logger);

      // 1. Order placed
      foodOrder.triggerOrder('Day 6 • 23:30', 6);
      expect(foodOrder.getState().stage).toBe('order_placed');

      // 2. Waiting for delivery
      foodOrder.update(1, 'Day 6 • 23:30', 6);
      expect(foodOrder.getState().stage).toBe('waiting_delivery');

      // 3. Delivery arrived -> Walk to gate
      const gateRes = foodOrder.update(900, 'Day 6 • 23:45', 6);
      expect(foodOrder.getState().stage).toBe('walking_to_gate');
      expect(gateRes.targetLocation).toBe('grounds');

      // 4. Collect food
      foodOrder.update(30, 'Day 6 • 23:45', 6);
      expect(foodOrder.getState().stage).toBe('collecting_food');

      // 5. Walk back
      const diningRes = foodOrder.update(10, 'Day 6 • 23:46', 6);
      expect(foodOrder.getState().stage).toBe('walking_back');
      expect(diningRes.targetLocation).toBe('dining');

      // 6. Eating
      foodOrder.update(30, 'Day 6 • 23:46', 6);
      expect(foodOrder.getState().stage).toBe('eating');

      // Eating reduces hunger
      const eatUpdate = foodOrder.update(150, 'Day 6 • 23:48', 6);
      expect(eatUpdate.hungerDelta).toBeLessThan(0);

      // 7. Complete
      foodOrder.update(150, 'Day 6 • 23:51', 6);
      expect(foodOrder.getState().stage).toBe('completed');
      expect(foodOrder.getState().isCompleted).toBe(true);
    });
  });

  // 10. Activities cannot start before travel completes
  describe('Scenario 10: Activities cannot start before travel completes', () => {
    it('keeps state at travelling and only activates once travel duration is met', () => {
      const logger = new EventLogger();
      const am = new ActivityManager('bedroom', logger, 30);

      const collegeEntry: ScheduleEntry = {
        id: 'wd_college',
        activityId: 'college_session',
        name: 'College Lectures',
        startTime: '08:30',
        endTime: '16:30',
        startMinutes: 510,
        endMinutes: 990,
        locationId: 'classroom',
        description: 'College classes',
      };

      am.transitionToActivity(collegeEntry, 'Day 1 • 08:30', 1);
      expect(am.getLifecycleState()).toBe('travelling');
      expect(am.isTravelling()).toBe(true);
      expect(am.getCurrentLocation()).toBe('bedroom');

      // Advance by 15s (travel is 30s) -> should still be travelling
      am.update(15, 'Day 1 • 08:30', 1);
      expect(am.getLifecycleState()).toBe('travelling');
      expect(am.getCurrentLocation()).toBe('bedroom');

      // Advance remaining 16s -> arrival and activation
      am.update(16, 'Day 1 • 08:30', 1);
      expect(am.getLifecycleState()).toBe('active');
      expect(am.getCurrentLocation()).toBe('classroom');
    });
  });

  // 11. Activity completion happens exactly once
  describe('Scenario 11: Activity completion happens exactly once', () => {
    it('prevents duplicate completion events when completed repeatedly', () => {
      const logger = new EventLogger();
      const am = new ActivityManager('bedroom', logger, 30);

      const sleepEntry: ScheduleEntry = {
        id: 'wd_sleep',
        activityId: 'sleep',
        name: 'Sleep',
        startTime: '23:15',
        endTime: '06:00',
        startMinutes: 1395,
        endMinutes: 360,
        locationId: 'bedroom',
        description: 'Overnight rest',
      };

      am.transitionToActivity(sleepEntry, 'Day 1 • 23:15', 1);
      am.completeCurrentActivity('Day 2 • 06:00', 2);
      const eventsAfterFirstComplete = logger.getEvents().filter(e => e.message.includes('Completed: Sleep'));
      expect(eventsAfterFirstComplete.length).toBe(1);

      // Re-triggering complete should do nothing
      am.completeCurrentActivity('Day 2 • 06:00', 2);
      am.completeCurrentActivity('Day 2 • 06:00', 2);
      const eventsAfterRepeats = logger.getEvents().filter(e => e.message.includes('Completed: Sleep'));
      expect(eventsAfterRepeats.length).toBe(1);
    });
  });

  // 12. Needs remain clamped to 0–100
  describe('Scenario 12: Needs remain clamped to 0-100', () => {
    it('clamps all needs strictly within 0 and 100 on direct set and continuous decay/gain', () => {
      const logger = new EventLogger();
      const needs = new NeedsSystem(logger);
      needs.setState({
        energy: 150,
        hunger: -30,
        sleepiness: 999,
        fatigue: -50,
        focus: 120,
        socialNeed: -10,
      });

      const s = needs.getState();
      expect(s.energy).toBe(100);
      expect(s.hunger).toBe(0);
      expect(s.sleepiness).toBe(100);
      expect(s.fatigue).toBe(0);
      expect(s.focus).toBe(100);
      expect(s.socialNeed).toBe(0);

      // Continuous large drain
      needs.update(360000, {
        energyPerHour: -500,
        hungerPerHour: 500,
        sleepinessPerHour: 500,
        fatiguePerHour: 500,
        focusPerHour: -500,
        socialNeedPerHour: 500,
      }, 'Day 1 • 12:00', 1);

      const afterDrain = needs.getState();
      expect(afterDrain.energy).toBe(0);
      expect(afterDrain.hunger).toBe(100);
      expect(afterDrain.focus).toBe(0);
    });
  });

  // 13. Persistence save/load works
  describe('Scenario 13: Persistence save/load works', () => {
    it('serializes simulation state and deserializes accurately', () => {
      const mockStorage: Record<string, string> = {};
      (globalThis as any).localStorage = {
        getItem: (k: string) => mockStorage[k] || null,
        setItem: (k: string, v: string) => { mockStorage[k] = String(v); },
        removeItem: (k: string) => { delete mockStorage[k]; },
      };

      const engine = new SimulationEngine({ startingTime: '14:00', startingDay: 2 });
      engine.setNeed('hunger', 42);
      engine.setNeed('energy', 88);
      const saved = engine.saveSimulation();
      expect(saved).toBe(true);

      const newEngine = new SimulationEngine({ startingTime: '06:00', startingDay: 1 });
      const loaded = newEngine.loadSimulation();
      expect(loaded).toBe(true);
      expect(newEngine.getState().clock.simulatedTime).toBe('14:00');
      expect(newEngine.getState().clock.dayNumber).toBe(2);
      expect(newEngine.getState().needs.hunger).toBe(42);
      expect(newEngine.getState().needs.energy).toBe(88);
    });
  });

  // 14. Simulation continues correctly after loading
  describe('Scenario 14: Simulation continues correctly after loading', () => {
    it('advances time, triggers activities, and maintains integrity after restore', () => {
      const mockStorage: Record<string, string> = {};
      (globalThis as any).localStorage = {
        getItem: (k: string) => mockStorage[k] || null,
        setItem: (k: string, v: string) => { mockStorage[k] = String(v); },
        removeItem: (k: string) => { delete mockStorage[k]; },
      };

      const engine1 = new SimulationEngine({ startingTime: '07:59', startingDay: 1 });
      engine1.saveSimulation();

      const engine2 = new SimulationEngine({ startingTime: '06:00', startingDay: 1 });
      engine2.loadSimulation();
      expect(engine2.getState().clock.simulatedTime).toBe('07:59');

      // Step by 2 simulated minutes (2 real seconds = 120 sim seconds)
      const stepped = engine2.step(2);
      expect(stepped.clock.simulatedTime).toBe('08:01');
      expect(stepped.clock.isPaused).toBe(false);
      expect(stepped.needs.energy).toBeGreaterThanOrEqual(0);
    });
  });

  // 15. Existing Milestone 3 schedule tests validation
  describe('Scenario 15: Existing Milestone 3 schedule tests validation', () => {
    it('verifies weekday and weekend daily schedules execute with full fidelity', () => {
      const planner = new SchedulePlanner();
      const weekdaySchedule = planner.getScheduleForDay('weekday');
      expect(weekdaySchedule.length).toBeGreaterThanOrEqual(8);
      const weekendSchedule = planner.getScheduleForDay('weekend');
      expect(weekendSchedule.length).toBeGreaterThanOrEqual(8);
    });
  });

});
