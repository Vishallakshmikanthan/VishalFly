import { describe, it, expect } from 'vitest';
import { CircadianRoutineEngine } from '../circadian/CircadianRoutineEngine';
import { ConnectomeFlyController } from '../controller/ConnectomeFlyController';

describe('Biological Circadian Clock & Routine Neural Training', () => {
  it('correctly shifts clock neuron firing rates and neuromodulators throughout the 24-hour cycle', () => {
    const engine = new CircadianRoutineEngine();

    // 1. Morning Wakeup (06:30)
    const morning = engine.update(390, 1, 0.05);
    expect(morning.activeLifeState).toBe('wake_up');
    expect(morning.recommendedLocation).toBe('bedroom');
    expect(morning.recommendedWaypoint).toBe('wardrobe');

    // 2. Breakfast (07:15)
    const breakfast = engine.update(435, 1, 0.05);
    expect(breakfast.activeLifeState).toBe('breakfast');
    expect(breakfast.recommendedLocation).toBe('dining');
    expect(breakfast.neuromodulators.npfHungerDrive).toBeGreaterThan(0);

    // 3. Commute 1km walk to bus stop (07:30)
    const walkBus = engine.update(450, 1, 0.05);
    expect(walkBus.activeLifeState).toBe('walk_to_bus');
    expect(walkBus.recommendedLocation).toBe('travel');

    // 4. Commute 1-hour bus to college (08:00)
    const busClg = engine.update(480, 1, 0.05);
    expect(busClg.activeLifeState).toBe('bus_to_college');
    expect(busClg.recommendedLocation).toBe('travel');

    // 5. College Lectures (10:00)
    const lecture = engine.update(600, 1, 0.05);
    expect(lecture.activeLifeState).toBe('college_lectures');
    expect(lecture.recommendedLocation).toBe('classroom');

    // 6. Canteen Lunch (12:45)
    const lunch = engine.update(765, 1, 0.05);
    expect(lunch.activeLifeState).toBe('canteen_lunch');
    expect(lunch.recommendedLocation).toBe('dining');

    // 7. Library Break & Study (13:45)
    const library = engine.update(825, 1, 0.05);
    expect(library.activeLifeState).toBe('library_study');
    expect(library.recommendedLocation).toBe('classroom');

    // 8. Wait for bus at campus (16:15)
    const waitBus = engine.update(975, 1, 0.05);
    expect(waitBus.activeLifeState).toBe('college_bus_wait');
    expect(waitBus.recommendedLocation).toBe('grounds');

    // 9. Bus commute return to room (17:00)
    const busReturn = engine.update(1020, 1, 0.05);
    expect(busReturn.activeLifeState).toBe('bus_to_pg');
    expect(busReturn.recommendedLocation).toBe('travel');

    // 10. 1km walk from bus stop to room (17:30)
    const walkRoom = engine.update(1050, 1, 0.05);
    expect(walkRoom.activeLifeState).toBe('walk_to_pg');
    expect(walkRoom.recommendedLocation).toBe('travel');

    // 11. Gym workout (18:15)
    const gym = engine.update(1095, 1, 0.05);
    expect(gym.activeLifeState).toBe('gym_workout');
    expect(gym.recommendedLocation).toBe('gym');
    expect(gym.neuromodulators.octopamineArousal).toBeGreaterThan(0);

    // 12. Dinner (19:45)
    const dinner = engine.update(1185, 1, 0.05);
    expect(dinner.activeLifeState).toBe('dinner');
    expect(dinner.recommendedLocation).toBe('dining');

    // 13. Evening Coding & LeetCode Grind for better future (21:30)
    const coding = engine.update(1290, 1, 0.05);
    expect(coding.activeLifeState).toBe('coding_leetcode_grind');
    expect(coding.recommendedLocation).toBe('bedroom');
    expect(coding.recommendedWaypoint).toBe('desk');
    expect(coding.neuromodulators.dopamineGrind).toBeGreaterThan(0);

    // 14. Deep Sleep past midnight (02:00)
    const sleep = engine.update(120, 1, 0.05);
    expect(sleep.activeLifeState).toBe('sleep');
    expect(sleep.recommendedLocation).toBe('bedroom');
  });

  it('triggers Sunday washing machine chores and balcony tea relaxation', () => {
    const engine = new CircadianRoutineEngine();
    // Sunday 10:15 AM
    const sundayChore = engine.update(615, 0, 0.05);
    expect(sundayChore.isSunday).toBe(true);
    expect(sundayChore.activeLifeState).toBe('sunday_laundry_balcony');
    expect(sundayChore.recommendedLocation).toBe('balcony');
    expect(sundayChore.stateLabel).toContain('Sunday Chores');
  });

  it('handles hometown weekend visits spending time with family', () => {
    const engine = new CircadianRoutineEngine();
    engine.setHometownTrip(true);
    // Saturday afternoon
    const hometownSat = engine.update(800, 6, 0.05);
    expect(hometownSat.isHometownTrip).toBe(true);
    expect(hometownSat.activeLifeState).toBe('hometown_visit');
    expect(hometownSat.stateLabel).toContain('Hometown Trip');
  });

  it('embeds circadian pacemaker neural states and neuromodulators into ConnectomeFlyController snapshot', () => {
    const controller = new ConnectomeFlyController();
    const result = controller.update(
      [0, 1.8, 0],
      [0, 0, 0],
      0,
      { minX: -5, maxX: 5, minY: 0, maxY: 4, minZ: -5, maxZ: 5 },
      0.05,
      null,
      'bedroom',
      10,
      1300, // 21:40 (Coding & Leetcode grind)
      1
    );

    expect(result.snapshot.circadian).toBeDefined();
    expect(result.snapshot.circadian?.activeLifeState).toBe('coding_leetcode_grind');
    expect(result.snapshot.circadian?.dopamineGrind).toBeGreaterThan(0);
  });
});
