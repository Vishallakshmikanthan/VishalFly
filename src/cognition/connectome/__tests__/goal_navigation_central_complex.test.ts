import { describe, it, expect } from 'vitest';
import {
  wrapAngle,
  calculateGoalBearing,
  createNavigationGoal,
} from '../navigation/NavigationGoalTypes';
import { CentralComplexSteering } from '../central-complex/CentralComplexSteering';
import { ConnectomeFlyController } from '../controller/ConnectomeFlyController';
import { ConnectomeMotorAdapter } from '../adapters/ConnectomeMotorAdapter';
import { NeuralMotorOutputs } from '../types';
import { useGameStore } from '../../../store/useGameStore';

describe('Milestone 2: Goal-Directed Connectome Navigation & Central Complex Steering', () => {
  const roomBounds = {
    minX: -4.0,
    maxX: 4.0,
    minY: 0.2,
    maxY: 3.5,
    minZ: -4.0,
    maxZ: 4.0,
  };

  // 1. Goal Bearing and Wrapped Angular Error
  it('1. goal bearing and wrapped angular error calculations handle multi-quadrant directions and angle wrapping around +/-PI', () => {
    // Basic wrapAngle sanity
    expect(wrapAngle(0)).toBe(0);
    expect(wrapAngle(Math.PI / 2)).toBeCloseTo(Math.PI / 2, 5);
    expect(wrapAngle(-Math.PI / 2)).toBeCloseTo(-Math.PI / 2, 5);
    expect(wrapAngle(3 * Math.PI)).toBeCloseTo(Math.PI, 5);
    expect(wrapAngle(-3 * Math.PI)).toBeCloseTo(Math.PI, 5);
    expect(wrapAngle(2 * Math.PI + 0.5)).toBeCloseTo(0.5, 5);
    expect(wrapAngle(-2 * Math.PI - 0.5)).toBeCloseTo(-0.5, 5);

    // Bearing derivations (+Z is 0, +X is +PI/2, -X is -PI/2, -Z is +/-PI)
    expect(calculateGoalBearing([0, 0, 0], [0, 0, 2])).toBeCloseTo(0, 5);
    expect(calculateGoalBearing([0, 0, 0], [2, 0, 0])).toBeCloseTo(Math.PI / 2, 5);
    expect(calculateGoalBearing([0, 0, 0], [-2, 0, 0])).toBeCloseTo(-Math.PI / 2, 5);
    expect(Math.abs(calculateGoalBearing([0, 0, 0], [0, 0, -2]))).toBeCloseTo(Math.PI, 5);

    // Boundary wrapping across +/-PI: heading at +3.0 rad, target at -3.0 rad
    // Direct difference: -3.0 - 3.0 = -6.0 rad
    // Shortest turn: -6.0 + 2*PI ~= +0.283 rad (counter-clockwise turn)
    const goalCrossWrap = createNavigationGoal([-0.28, 1.8, -1.0], [0, 1.8, 0], 3.0);
    expect(goalCrossWrap.angularError).toBeGreaterThan(0);
    expect(goalCrossWrap.angularError).toBeLessThan(1.0);
  });

  // 2. Missing and Invalid Goals
  it('2. handles missing, null, undefined, and numerically invalid goals without NaN or exceptions', () => {
    const nullGoal = createNavigationGoal(null, [0, 1.8, 0], 0);
    expect(nullGoal.isValid).toBe(false);
    expect(nullGoal.angularError).toBe(0);
    expect(nullGoal.distance3D).toBe(0);

    const undefinedGoal = createNavigationGoal(undefined, [0, 1.8, 0], 0);
    expect(undefinedGoal.isValid).toBe(false);

    const nanGoal = createNavigationGoal([NaN, 1.8, 0], [0, 1.8, 0], 0);
    expect(nanGoal.isValid).toBe(false);

    const nanPosGoal = createNavigationGoal([2, 1.8, 0], [NaN, 1.8, 0], 0);
    expect(nanPosGoal.isValid).toBe(false);

    // Near-zero distance handling (fly is already on top of the goal)
    const zeroDistGoal = createNavigationGoal([1.0, 1.8, 1.0], [1.0, 1.8, 1.0], 0.5);
    expect(zeroDistGoal.isValid).toBe(true);
    expect(zeroDistGoal.distanceHorizontal).toBeLessThan(0.02);
    expect(zeroDistGoal.angularError).toBe(0);
    expect(zeroDistGoal.isArrived).toBe(true);

    // Controller safely accepts null or invalid goal
    const controller = new ConnectomeFlyController();
    const updateNull = controller.update([0, 1.8, 0], [0, 0, 0], 0, roomBounds, 0.016, null);
    expect(Number.isFinite(updateNull.newPosition[0])).toBe(true);
    expect(Number.isFinite(updateNull.newRotation)).toBe(true);
  });

  // 3. Goal Updates and Destination Changes
  it('3. dynamic goal updates and destination changes smoothly shift steering drive', () => {
    const controller = new ConnectomeFlyController();

    // Fly facing +Z (yaw = 0)
    // Goal A is to the right (+X direction -> goalBearing = +PI/2)
    // Three.js convention: Yaw = 0 is +Z, Yaw = +PI/2 is +X.
    // deltaTheta = goalBearing - flyHeading = +PI/2 - 0 = +PI/2 (positive -> turn toward +X)
    const goalRight = createNavigationGoal([3.0, 1.8, 0], [0, 1.8, 0], 0, 'desk');
    expect(goalRight.angularError).toBeCloseTo(Math.PI / 2, 2);

    const updateRight = controller.update([0, 1.8, 0], [0, 0, 0], 0, roomBounds, 0.016, goalRight);
    expect(updateRight.snapshot.centralComplex?.goalBearing).toBeCloseTo(Math.PI / 2, 2);
    expect(updateRight.snapshot.centralComplex?.steeringCommand).toBeGreaterThan(0.2);

    // Goal B changes to the left (-X direction -> goalBearing = -PI/2)
    const goalLeft = createNavigationGoal([-3.0, 1.8, 0], [0, 1.8, 0], 0, 'wardrobe');
    expect(goalLeft.angularError).toBeCloseTo(-Math.PI / 2, 2);

    const updateLeft = controller.update([0, 1.8, 0], [0, 0, 0], 0, roomBounds, 0.016, goalLeft);
    expect(updateLeft.snapshot.centralComplex?.goalBearing).toBeCloseTo(-Math.PI / 2, 2);
    expect(updateLeft.snapshot.centralComplex?.steeringCommand).toBeLessThan(-0.2);
  });

  // 4. Central Complex State Updates and Steering Output Bounds
  it('4. central complex E-PG, P-EN, and DNg02 biophysical dynamics and output bounds', () => {
    const cx = new CentralComplexSteering();

    // Simulate steering drive towards leftward goal for 50 ms
    const goal = createNavigationGoal([-2.0, 1.8, 1.0], [0, 1.8, 0], 0);
    let lastTelemetry = cx.update(0, goal, 0.02);

    for (let i = 0; i < 5; i++) {
      lastTelemetry = cx.update(0, goal, 0.02);
    }

    expect(lastTelemetry.steeringCommand).toBeLessThanOrEqual(1.0);
    expect(lastTelemetry.steeringCommand).toBeGreaterThanOrEqual(-1.0);
    expect(lastTelemetry.neuralSteerYaw).toBeLessThanOrEqual(1.0);
    expect(lastTelemetry.neuralSteerYaw).toBeGreaterThanOrEqual(-1.0);

    // Potentials must remain strictly bounded in biological range [-85 mV, +10 mV]
    for (const vm of Object.values(lastTelemetry.snapshot.potentials)) {
      expect(vm).toBeGreaterThanOrEqual(-85.0);
      expect(vm).toBeLessThanOrEqual(10.0);
    }
  });

  // 5. Neural Output Flowing into the Motor-Control Pathway
  it('5. central complex neural steering flows through motor adapter into physical yaw rates and banking', () => {
    const motorAdapter = new ConnectomeMotorAdapter();

    const leftTurnMotorOutputs: NeuralMotorOutputs = {
      dnEscapeSpike: false,
      dnEscapeRate: 0,
      dnSteerYaw: 0,
      dnSteerPitch: 0,
      totalMotorActivity: 20.0,
      dng02SteerYaw: 0.75, // Central Complex leftward steering drive
      ccActive: true,
      goalDistance: 2.5,
    };

    const cmdLeft = motorAdapter.decode(leftTurnMotorOutputs, 0.016);
    expect(cmdLeft.yawTurnRate).toBeGreaterThan(1.0);
    expect(cmdLeft.targetRoll).toBeLessThan(0); // Banking left

    const rightTurnMotorOutputs: NeuralMotorOutputs = {
      dnEscapeSpike: false,
      dnEscapeRate: 0,
      dnSteerYaw: 0,
      dnSteerPitch: 0,
      totalMotorActivity: 20.0,
      dng02SteerYaw: -0.75, // Central Complex rightward steering drive
      ccActive: true,
      goalDistance: 2.5,
    };

    const cmdRight = motorAdapter.decode(rightTurnMotorOutputs, 0.016);
    expect(cmdRight.yawTurnRate).toBeLessThan(-1.0);
    expect(cmdRight.targetRoll).toBeGreaterThan(0); // Banking right
  });

  // 6. Connectome Goal Steering Coexisting with Obstacle Responses
  it('6. goal-directed steering safely coexists with obstacle responses and room boundary avoidance', () => {
    const controller = new ConnectomeFlyController();

    // Fly is near the right boundary (pos.x = 3.8, maxX = 4.0)
    // Goal is even further to the right (pos.x = 6.0, outside the room)
    const goalOutside = createNavigationGoal([6.0, 1.8, 0], [3.8, 1.8, 0], 0);

    let pos: [number, number, number] = [3.8, 1.8, 0];
    let vel: [number, number, number] = [1.0, 0, 0];
    let yaw = 0;

    // Run for 30 frames
    for (let frame = 0; frame < 30; frame++) {
      const update = controller.update(pos, vel, yaw, roomBounds, 0.016, goalOutside);
      pos = update.newPosition;
      vel = update.newVelocity;
      yaw = update.newRotation;

      // Crucial: wall repulsion and collision boundaries must prevent flying out of the room!
      expect(pos[0]).toBeLessThanOrEqual(roomBounds.maxX);
      expect(pos[0]).toBeGreaterThanOrEqual(roomBounds.minX);
    }

    // Looming threat veto test: triggering threat stimulus must trigger Giant Fiber escape
    controller.triggerThreatStimulus();
    const escapeUpdate = controller.update(pos, vel, yaw, roomBounds, 0.016, goalOutside);
    expect(escapeUpdate.isEscapeTriggered).toBe(true);
  });

  // 7. No-Goal Free-Flight Behavior
  it('7. no-goal free-flight preserves documented cruising and boundary bouncing without divergence', () => {
    const controller = new ConnectomeFlyController();

    let pos: [number, number, number] = [0, 1.8, 0];
    let vel: [number, number, number] = [1.5, 0, 1.5];
    let yaw = 0;

    for (let frame = 0; frame < 60; frame++) {
      const update = controller.update(pos, vel, yaw, roomBounds, 0.016, null);
      pos = update.newPosition;
      vel = update.newVelocity;
      yaw = update.newRotation;

      expect(update.activityPose).toBe('flying');
      expect(Number.isFinite(pos[0])).toBe(true);
      const speed = Math.hypot(vel[0], vel[1], vel[2]);
      expect(speed).toBeLessThanOrEqual(7.501);
    }
  });

  // 8. No Schedule-Driven Teleportation or Hidden Waypoint Snapping in Connectome Mode
  it('8. no schedule-driven teleportation or hidden waypoint snapping in connectome flight', () => {
    const controller = new ConnectomeFlyController();

    const startPos: [number, number, number] = [0, 1.8, 0];
    const distantTarget: [number, number, number] = [3.0, 1.8, 3.0];
    const goal = createNavigationGoal(distantTarget, startPos, 0, 'distant_desk');

    expect(goal.distance3D).toBeGreaterThan(4.0);

    // Step 1 frame
    const update = controller.update(startPos, [0, 0, 0], 0, roomBounds, 0.016, goal);

    // In 16 ms, maximum physical travel at 4.2 m/s speed limit is ~0.07 meters
    const dx = update.newPosition[0] - startPos[0];
    const dy = update.newPosition[1] - startPos[1];
    const dz = update.newPosition[2] - startPos[2];
    const frameDistanceTraveled = Math.hypot(dx, dy, dz);

    expect(frameDistanceTraveled).toBeLessThan(0.1);
    // Verifies NO teleportation or waypoint snapping
    const remainingDistance = Math.hypot(
      distantTarget[0] - update.newPosition[0],
      distantTarget[1] - update.newPosition[1],
      distantTarget[2] - update.newPosition[2]
    );
    expect(remainingDistance).toBeGreaterThan(3.5);
  });

  // 9. Controller-Mode Compatibility
  it('9. controller mode compatibility: switching between connectome, cognitive, schedule, and manual', () => {
    const store = useGameStore.getState();

    // 1. Connectome mode
    store.setControllerMode('connectome');
    expect(useGameStore.getState().controllerMode).toBe('connectome');
    expect(useGameStore.getState().isAutonomous).toBe(true);

    // 2. Cognitive mode
    store.setControllerMode('cognitive');
    expect(useGameStore.getState().controllerMode).toBe('cognitive');
    expect(useGameStore.getState().isCognitionEnabled).toBe(true);
    expect(useGameStore.getState().isAutonomous).toBe(true);

    // 3. Schedule mode
    store.setControllerMode('schedule');
    expect(useGameStore.getState().controllerMode).toBe('schedule');
    expect(useGameStore.getState().isCognitionEnabled).toBe(false);
    expect(useGameStore.getState().isAutonomous).toBe(true);

    // 4. Manual mode
    store.setControllerMode('manual');
    expect(useGameStore.getState().controllerMode).toBe('manual');
    expect(useGameStore.getState().isAutonomous).toBe(false);

    // Restore to connectome
    store.setControllerMode('connectome');
  });

  // 10. Long-Duration Simulation Stability
  it('10. long-term simulation stability across 500+ update steps with moving goal', () => {
    const controller = new ConnectomeFlyController();

    let pos: [number, number, number] = [0, 1.8, 0];
    let vel: [number, number, number] = [0, 0, 0];
    let yaw = 0;

    for (let step = 0; step < 500; step++) {
      // Dynamic moving target orbiting in the room
      const targetAngle = (step / 500) * Math.PI * 4;
      const targetX = Math.sin(targetAngle) * 2.0;
      const targetZ = Math.cos(targetAngle) * 2.0;

      const goal = createNavigationGoal([targetX, 1.5, targetZ], pos, yaw);
      const update = controller.update(pos, vel, yaw, roomBounds, 0.016, goal);

      pos = update.newPosition;
      vel = update.newVelocity;
      yaw = update.newRotation;

      expect(Number.isFinite(pos[0])).toBe(true);
      expect(Number.isFinite(pos[1])).toBe(true);
      expect(Number.isFinite(pos[2])).toBe(true);
      expect(Number.isNaN(yaw)).toBe(false);
      expect(pos[0]).toBeGreaterThanOrEqual(roomBounds.minX);
      expect(pos[0]).toBeLessThanOrEqual(roomBounds.maxX);
    }
  });
});
