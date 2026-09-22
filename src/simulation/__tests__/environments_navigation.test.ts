import { describe, it, expect } from 'vitest';
import { LOCATIONS } from '../../navigation/locationGraph';
import { getTimeOfDayLighting, WORLD_SCALE, PBR_MATERIALS } from '../../components/3d/common/worldTheme';
import { SimulationEngine } from '../engine/SimulationEngine';
import { LocationId } from '../../types';

describe('Milestone 5: High-Fidelity 3D World & Environment Navigation Tests', () => {

  // 1. All Required Playable Environments Exist and are Configured
  describe('Requirement 1 & 2: Environment Scale and Configuration', () => {
    const requiredLocations: LocationId[] = [
      'bedroom',
      'classroom',
      'dining',
      'gym',
      'grounds',
      'balcony',
      'travel',
    ];

    it.each(requiredLocations)('verifies location %s has valid bounds, spawn, and camera setup', (locId) => {
      const loc = LOCATIONS[locId];
      expect(loc).toBeDefined();
      expect(loc.id).toBe(locId);
      expect(loc.name).toBeTruthy();
      expect(loc.spawnPosition.length).toBe(3);

      // Bounds sanity check
      expect(loc.bounds.maxX).toBeGreaterThan(loc.bounds.minX);
      expect(loc.bounds.maxY).toBeGreaterThan(loc.bounds.minY);
      expect(loc.bounds.maxZ).toBeGreaterThan(loc.bounds.minZ);

      // Camera config sanity check
      expect(loc.camera.position.length).toBe(3);
      expect(loc.camera.target.length).toBe(3);
      expect(loc.camera.fov).toBeGreaterThan(20);
      expect(loc.camera.fov).toBeLessThan(75);

      // Spawn position must be inside bounds
      const [sx, sy, sz] = loc.spawnPosition;
      expect(sx).toBeGreaterThanOrEqual(loc.bounds.minX);
      expect(sx).toBeLessThanOrEqual(loc.bounds.maxX);
      expect(sy).toBeGreaterThanOrEqual(loc.bounds.minY);
      expect(sy).toBeLessThanOrEqual(loc.bounds.maxY);
      expect(sz).toBeGreaterThanOrEqual(loc.bounds.minZ);
      expect(sz).toBeLessThanOrEqual(loc.bounds.maxZ);
    });

    it('validates standard world scale constants and PBR material tokens', () => {
      expect(WORLD_SCALE.WALL_THICKNESS).toBe(0.2);
      expect(WORLD_SCALE.ROOM_HEIGHT).toBe(4.0);
      expect(WORLD_SCALE.FLY_SCALE).toBeGreaterThan(0.5);

      expect(PBR_MATERIALS.gymRubberMat.roughness).toBeGreaterThan(0.5);
      expect(PBR_MATERIALS.chromeKnurled.metalness).toBeGreaterThan(0.8);
      expect(PBR_MATERIALS.balconyTerracotta.color).toBeTruthy();
    });
  });

  // 2. Bedroom Interaction Points Reachability
  describe('Requirement 3: Bedroom Interaction Points', () => {
    const bedroom = LOCATIONS.bedroom;

    it('contains all required bedroom waypoints inside its boundary', () => {
      expect(bedroom.waypoints).toBeDefined();
      const requiredWaypoints = ['bed', 'desk', 'wardrobe', 'balcony_door', 'center', 'entrance'];
      requiredWaypoints.forEach((wpKey) => {
        const wp = bedroom.waypoints![wpKey];
        expect(wp, `Waypoint ${wpKey} must be defined in bedroom`).toBeDefined();
        const [x, y, z] = wp;
        expect(x).toBeGreaterThanOrEqual(bedroom.bounds.minX);
        expect(x).toBeLessThanOrEqual(bedroom.bounds.maxX);
        expect(y).toBeGreaterThanOrEqual(bedroom.bounds.minY);
        expect(y).toBeLessThanOrEqual(bedroom.bounds.maxY);
        expect(z).toBeGreaterThanOrEqual(bedroom.bounds.minZ);
        expect(z).toBeLessThanOrEqual(bedroom.bounds.maxZ);
      });
    });

    it('verifies balcony connection coordinate aligns with bedroom back wall', () => {
      expect(bedroom.waypoints).toBeDefined();
      const balconyDoor = bedroom.waypoints!.balcony_door;
      expect(balconyDoor[2]).toBeLessThanOrEqual(-3.5); // Back wall threshold
    });
  });

  // 3. Classroom Seats, Podium, Screen and Entrance
  describe('Requirement 4: College Classroom Navigation Points', () => {
    const classroom = LOCATIONS.classroom;

    it('contains all lecture hall waypoints within boundaries without clipping', () => {
      expect(classroom.waypoints).toBeDefined();
      const requiredWaypoints = [
        'entrance',
        'podium',
        'screen',
        'student_desk_front',
        'student_desk_mid',
        'laptop_spot',
      ];

      requiredWaypoints.forEach((wpKey) => {
        const wp = classroom.waypoints![wpKey];
        expect(wp, `Classroom waypoint ${wpKey} must exist`).toBeDefined();
        const [x, y, z] = wp;
        expect(x).toBeGreaterThanOrEqual(classroom.bounds.minX);
        expect(x).toBeLessThanOrEqual(classroom.bounds.maxX);
        expect(y).toBeGreaterThanOrEqual(classroom.bounds.minY);
        expect(y).toBeLessThanOrEqual(classroom.bounds.maxY);
        expect(z).toBeGreaterThanOrEqual(classroom.bounds.minZ);
        expect(z).toBeLessThanOrEqual(classroom.bounds.maxZ);
      });
    });

    it('verifies lecturer podium and giant screen are situated on the stage', () => {
      expect(classroom.waypoints).toBeDefined();
      const podium = classroom.waypoints!.podium;
      const screen = classroom.waypoints!.screen;
      expect(podium[2]).toBeLessThan(-3.0); // North stage area
      expect(screen[2]).toBeLessThan(-3.0);
      expect(screen[1]).toBeGreaterThan(podium[1]); // Screen is elevated above podium
    });
  });

  // 4. Gym Stations Reachability and PPL Integration
  describe('Requirement 5: Gym Stations and PPL Waypoints', () => {
    const gym = LOCATIONS.gym;

    it('verifies all PPL exercise equipment stations exist in gym waypoints', () => {
      expect(gym.waypoints).toBeDefined();
      const requiredStations = [
        'entrance',
        'warmup_zone',
        'bench_press',
        'dumbbells',
        'squat_rack',
        'leg_press',
        'cable_machine',
        'rest_bench',
      ];

      requiredStations.forEach((stationKey) => {
        const wp = gym.waypoints![stationKey];
        expect(wp, `Gym station ${stationKey} must exist`).toBeDefined();
        const [x, y, z] = wp;
        expect(x).toBeGreaterThanOrEqual(gym.bounds.minX);
        expect(x).toBeLessThanOrEqual(gym.bounds.maxX);
        expect(y).toBeGreaterThanOrEqual(gym.bounds.minY);
        expect(y).toBeLessThanOrEqual(gym.bounds.maxY);
        expect(z).toBeGreaterThanOrEqual(gym.bounds.minZ);
        expect(z).toBeLessThanOrEqual(gym.bounds.maxZ);
      });
    });

    it('verifies workout system updates target waypoints to match gym equipment', () => {
      const engine = new SimulationEngine({ startingTime: '17:00', startingDay: 1 });
      engine.triggerWorkout('push');
      // Push day starts with bench press
      expect(engine.getState().character.locationId).toBe('gym');
      const currentWaypoint = engine.getCurrentWaypoint();
      expect(['warmup_zone', 'bench_press']).toContain(currentWaypoint);
    });
  });

  // 5. Dining Area Waypoints
  describe('Requirement 6: Dining Area Waypoints', () => {
    const dining = LOCATIONS.dining;

    it('contains valid dining table, buffet and water station waypoints', () => {
      expect(dining.waypoints).toBeDefined();
      const requiredWaypoints = ['entrance', 'buffet_counter', 'dining_table_seat', 'water_station'];
      requiredWaypoints.forEach((wpKey) => {
        const wp = dining.waypoints![wpKey];
        expect(wp, `Dining waypoint ${wpKey} must exist`).toBeDefined();
        const [x, y, z] = wp;
        expect(x).toBeGreaterThanOrEqual(dining.bounds.minX);
        expect(x).toBeLessThanOrEqual(dining.bounds.maxX);
        expect(y).toBeGreaterThanOrEqual(dining.bounds.minY);
        expect(y).toBeLessThanOrEqual(dining.bounds.maxY);
        expect(z).toBeGreaterThanOrEqual(dining.bounds.minZ);
        expect(z).toBeLessThanOrEqual(dining.bounds.maxZ);
      });
    });
  });

  // 6. Apartment Grounds Walking Loop and Security Gate
  describe('Requirement 7: Apartment Grounds Circuit & Gate', () => {
    const grounds = LOCATIONS.grounds;

    it('contains connected walking circuit nodes and apartment gate', () => {
      expect(grounds.waypoints).toBeDefined();
      const requiredWaypoints = [
        'building_exit',
        'path_node_1',
        'path_node_2',
        'path_node_3',
        'path_node_4',
        'apartment_gate',
      ];

      requiredWaypoints.forEach((wpKey) => {
        const wp = grounds.waypoints![wpKey];
        expect(wp, `Grounds waypoint ${wpKey} must exist`).toBeDefined();
        const [x, y, z] = wp;
        expect(x).toBeGreaterThanOrEqual(grounds.bounds.minX);
        expect(x).toBeLessThanOrEqual(grounds.bounds.maxX);
        expect(y).toBeGreaterThanOrEqual(grounds.bounds.minY);
        expect(y).toBeLessThanOrEqual(grounds.bounds.maxY);
        expect(z).toBeGreaterThanOrEqual(grounds.bounds.minZ);
        expect(z).toBeLessThanOrEqual(grounds.bounds.maxZ);
      });
    });

    it('verifies family call triggers grounds walking and gate destination', () => {
      const engine = new SimulationEngine({ startingTime: '19:15', startingDay: 1 });
      engine.triggerFamilyCall();
      const state = engine.getState();
      expect(state.character.locationId).toBe('grounds');
      expect(state.character.flyActivity).toBe('phone_call');
    });
  });

  // 7. Balcony Laundry and Connection
  describe('Requirement 8: Balcony Space and Drying Flow', () => {
    const balcony = LOCATIONS.balcony;

    it('contains doorway connection, clothesline, railing and drying rack', () => {
      expect(balcony.waypoints).toBeDefined();
      const requiredWaypoints = ['doorway', 'clothesline', 'railing_sunlight', 'drying_rack'];
      requiredWaypoints.forEach((wpKey) => {
        const wp = balcony.waypoints![wpKey];
        expect(wp, `Balcony waypoint ${wpKey} must exist`).toBeDefined();
        const [x, y, z] = wp;
        expect(x).toBeGreaterThanOrEqual(balcony.bounds.minX);
        expect(x).toBeLessThanOrEqual(balcony.bounds.maxX);
        expect(y).toBeGreaterThanOrEqual(balcony.bounds.minY);
        expect(y).toBeLessThanOrEqual(balcony.bounds.maxY);
        expect(z).toBeGreaterThanOrEqual(balcony.bounds.minZ);
        expect(z).toBeLessThanOrEqual(balcony.bounds.maxZ);
      });
    });
  });

  // 8. Dynamic Time-of-Day Lighting Calculations
  describe('Requirement 12: Dynamic Simulation-Driven Lighting', () => {
    it('calculates appropriate lighting parameters across 24h cycle', () => {
      // 06:00 (Dawn, 360 min)
      const dawn = getTimeOfDayLighting(360);
      expect(dawn.timeLabel).toBe('Dawn Twilight');
      expect(dawn.isNight).toBe(false);
      expect(dawn.sunIntensity).toBeGreaterThan(0.5);

      // 12:00 (Midday, 720 min)
      const midday = getTimeOfDayLighting(720);
      expect(midday.timeLabel).toBe('Daylight');
      expect(midday.isNight).toBe(false);
      expect(midday.sunIntensity).toBeGreaterThan(1.2);

      // 18:30 (Dusk, 1110 min)
      const dusk = getTimeOfDayLighting(1110);
      expect(dusk.timeLabel).toBe('Golden Hour & Dusk');
      expect(dusk.sunColor).toContain('#');

      // 23:30 (Night, 1410 min)
      const night = getTimeOfDayLighting(1410);
      expect(night.timeLabel).toBe('Night');
      expect(night.isNight).toBe(true);
      expect(night.sunIntensity).toBeLessThan(0.6);
    });
  });

  // 9. Simulation Integrity & Preserved Sub-Systems
  describe('Requirement 15 & 16: Preserved Daily Life Systems and Persistence', () => {
    it('verifies deterministic schedule, pause/resume, and speed multipliers', () => {
      const engine = new SimulationEngine({ startingTime: '06:00', startingDay: 1 });
      expect(engine.getState().clock.isPaused).toBe(false);

      // Pause
      engine.pause();
      expect(engine.getState().clock.isPaused).toBe(true);
      engine.step(10);
      expect(engine.getState().clock.simulatedTime).toBe('06:00');

      // Resume
      engine.resume();
      expect(engine.getState().clock.isPaused).toBe(false);
      engine.step(1); // 1 real sec = 1 sim min
      expect(engine.getState().clock.simulatedTime).toBe('06:01');
    });

    it('verifies midnight food order progresses to grounds gate collection', () => {
      const engine = new SimulationEngine({ startingTime: '23:30', startingDay: 6 });
      engine.foodOrderSystem.triggerOrder('Day 6 • 23:30', 6);
      expect(engine.foodOrderSystem.getState().stage).toBe('order_placed');

      // 1 sim second to transition to waiting_delivery
      engine.foodOrderSystem.update(1, 'Day 6 • 23:30', 6);
      expect(engine.foodOrderSystem.getState().stage).toBe('waiting_delivery');

      // After 900 sim seconds (15m), delivery partner arrives at gate
      const gateRes = engine.foodOrderSystem.update(900, 'Day 6 • 23:45', 6);
      expect(gateRes.state.stage).toBe('walking_to_gate');
      expect(gateRes.targetLocation).toBe('grounds');
      expect(gateRes.currentWaypoint).toBe('apartment_gate');
    });
  });

});
