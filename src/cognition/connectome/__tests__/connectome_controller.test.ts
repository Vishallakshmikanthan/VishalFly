import { describe, it, expect } from 'vitest';
import { ConnectomeFlyController } from '../controller/ConnectomeFlyController';

describe('Biological Connectome: Autonomous Fly Controller & Benchmarks', () => {
  const roomBounds = {
    minX: -4.0,
    maxX: 4.0,
    minY: 0.0,
    maxY: 3.2,
    minZ: -4.0,
    maxZ: 4.0,
  };

  it('1. closed-loop step updates 3D position, velocity, and produces valid neural snapshot', () => {
    const controller = new ConnectomeFlyController();

    const update = controller.update(
      [0, 1.8, 0],
      [0, 0, 0],
      0,
      roomBounds,
      0.016 // 16 ms frame (60 fps)
    );

    expect(update.newPosition).toBeDefined();
    expect(update.newVelocity).toBeDefined();
    expect(update.newRotation).toBeDefined();
    expect(update.activityPose).toBe('flying');
    expect(update.snapshot).toBeDefined();
    expect(update.snapshot.simTimeMs).toBeGreaterThan(0);
    expect(update.snapshot.stepCount).toBeGreaterThan(0);
  });

  it('2. collision safety: coordinates remain strictly bounded within roomBounds under all forces', () => {
    const controller = new ConnectomeFlyController();

    let pos: [number, number, number] = [3.8, 1.8, 3.8]; // near corner
    let vel: [number, number, number] = [4.0, 2.0, 4.0]; // moving outwards rapidly
    let yaw = 0;

    for (let frame = 0; frame < 50; frame++) {
      const update = controller.update(pos, vel, yaw, roomBounds, 0.016);
      pos = update.newPosition;
      vel = update.newVelocity;
      yaw = update.newRotation;

      expect(pos[0]).toBeGreaterThanOrEqual(roomBounds.minX);
      expect(pos[0]).toBeLessThanOrEqual(roomBounds.maxX);
      expect(pos[1]).toBeGreaterThanOrEqual(roomBounds.minY);
      expect(pos[1]).toBeLessThanOrEqual(roomBounds.maxY);
      expect(pos[2]).toBeGreaterThanOrEqual(roomBounds.minZ);
      expect(pos[2]).toBeLessThanOrEqual(roomBounds.maxZ);
    }
  });

  it('3. manual looming threat trigger activates Giant Fiber and escape takeoff', () => {
    const controller = new ConnectomeFlyController();

    controller.triggerThreatStimulus();

    let isEscapeSeen = false;
    let pos: [number, number, number] = [0, 1.8, 0];
    let vel: [number, number, number] = [0, 0, 0];
    let yaw = 0;

    for (let frame = 0; frame < 10; frame++) {
      const update = controller.update(pos, vel, yaw, roomBounds, 0.016);
      pos = update.newPosition;
      vel = update.newVelocity;
      yaw = update.newRotation;

      if (update.isEscapeTriggered) {
        isEscapeSeen = true;
      }
    }

    expect(isEscapeSeen).toBe(true);
  });

  it('4. performance & scalability benchmark: neural step latency is under 1 millisecond (< 1000 µs)', () => {
    const controller = new ConnectomeFlyController();

    const iterations = 100;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      controller.update([0, 1.8, 0], [1.0, 0, 1.0], 0, roomBounds, 0.016);
    }

    const totalTimeMs = performance.now() - startTime;
    const avgLatencyMs = totalTimeMs / iterations;

    // Verify sub-1ms execution (ensuring Three.js 60fps loop is never stalled)
    expect(avgLatencyMs).toBeLessThan(1.0);
  });
});
