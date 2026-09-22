import { describe, it, expect } from 'vitest';
import { ConnectomeGraph } from '../ConnectomeGraph';
import { LIFDynamicsEngine } from '../dynamics/LIFDynamicsEngine';
import { ConnectomeSensoryAdapter } from '../adapters/ConnectomeSensoryAdapter';
import { ConnectomeMotorAdapter } from '../adapters/ConnectomeMotorAdapter';
import loomingCircuitData from '../data/looming_escape_circuit.json';
import { BiologicalCircuitData, NeuralMotorOutputs } from '../types';

describe('Biological Connectome: Sensory and Motor Adapters', () => {
  const graph = new ConnectomeGraph(loomingCircuitData as unknown as BiologicalCircuitData);

  describe('ConnectomeSensoryAdapter', () => {
    it('1. distant obstacles (> 3.5m) produce zero looming threat signal', () => {
      const engine = new LIFDynamicsEngine(graph);
      const adapter = new ConnectomeSensoryAdapter();

      const telemetry = adapter.update(engine, {
        flyPosition: [0, 1.8, 0],
        flyVelocity: [1.0, 0, 0],
        roomBounds: { minX: -5, maxX: 5, minY: 0, maxY: 3.5, minZ: -5, maxZ: 5 },
        headingAngle: 0,
        nearestObstacleDistance: 4.5,
        approachVelocity: 1.0,
      });

      expect(telemetry.loomingThreatSignal).toBe(0);
      expect(telemetry.nearestBoundaryDistance).toBe(4.5);
    });

    it('2. approaching nearby obstacle (< 3.5m) produces looming threat current into L2', () => {
      const engine = new LIFDynamicsEngine(graph);
      const adapter = new ConnectomeSensoryAdapter();

      const telemetry = adapter.update(engine, {
        flyPosition: [4.0, 1.8, 0],
        flyVelocity: [2.5, 0, 0],
        roomBounds: { minX: -5, maxX: 5, minY: 0, maxY: 3.5, minZ: -5, maxZ: 5 },
        headingAngle: 0,
        nearestObstacleDistance: 1.0, // 1 meter away
        approachVelocity: 2.5,        // approaching at 2.5 m/s
      });

      expect(telemetry.loomingThreatSignal).toBeGreaterThan(0.5);
      expect(telemetry.rightInjectedCurrent).toBeGreaterThan(1.5);
    });

    it('3. manual threat trigger produces maximum looming threat signal', () => {
      const engine = new LIFDynamicsEngine(graph);
      const adapter = new ConnectomeSensoryAdapter();

      const telemetry = adapter.update(engine, {
        flyPosition: [0, 1.8, 0],
        flyVelocity: [0, 0, 0],
        roomBounds: { minX: -5, maxX: 5, minY: 0, maxY: 3.5, minZ: -5, maxZ: 5 },
        headingAngle: 0,
        nearestObstacleDistance: 5.0,
        approachVelocity: 0,
        isManualThreatTriggered: true,
      });

      expect(telemetry.loomingThreatSignal).toBe(1.0);
    });
  });

  describe('ConnectomeMotorAdapter', () => {
    it('4. baseline neural activity produces stable forward cruising commands', () => {
      const motorAdapter = new ConnectomeMotorAdapter();
      const motorOutputs: NeuralMotorOutputs = {
        dnEscapeSpike: false,
        dnEscapeRate: 0,
        dnSteerYaw: 0,
        dnSteerPitch: 0,
        totalMotorActivity: 0,
      };

      const command = motorAdapter.decode(motorOutputs, 0.016);
      expect(command.isEscapeTriggered).toBe(false);
      expect(command.thrustAccel).toBeGreaterThan(0);
      expect(command.flightSpeedLimit).toBe(4.2);
      expect(command.activityPose).toBe('flying');
    });

    it('5. Giant Fiber spike triggers emergency takeoff lift and high speed burst', () => {
      const motorAdapter = new ConnectomeMotorAdapter();
      const motorOutputs: NeuralMotorOutputs = {
        dnEscapeSpike: true,
        dnEscapeRate: 45.0,
        dnSteerYaw: 0.5,
        dnSteerPitch: 0.5,
        totalMotorActivity: 45.0,
      };

      const command = motorAdapter.decode(motorOutputs, 0.016);
      expect(command.isEscapeTriggered).toBe(true);
      expect(command.liftAccel).toBeGreaterThan(15.0);
      expect(command.thrustAccel).toBeGreaterThan(14.0);
      expect(command.flightSpeedLimit).toBeGreaterThan(6.0);
      expect(motorAdapter.isEscapeActive()).toBe(true);
    });

    it('6. bilateral DNp11 asymmetry produces proportional yaw steering and roll banking', () => {
      const motorAdapter = new ConnectomeMotorAdapter();
      const rightTurnOutputs: NeuralMotorOutputs = {
        dnEscapeSpike: false,
        dnEscapeRate: 0,
        dnSteerYaw: 0.8, // right turn bias
        dnSteerPitch: 0,
        totalMotorActivity: 20.0,
      };

      const command = motorAdapter.decode(rightTurnOutputs, 0.016);
      expect(command.yawTurnRate).toBeGreaterThan(1.0);
      expect(command.targetRoll).toBeLessThan(0); // banking left/right
    });
  });
});
