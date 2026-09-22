/**
 * VISHALFLY — Autonomous Connectome Fly Controller
 * 
 * Orchestrates the closed-loop autonomous flight controller driven by the
 * biological connectome neural dynamics engine:
 * 
 * 3D World State -> Sensory Perception -> Neural Injection -> LIF Simulation -> Motor Decoding -> Physical 3D Flight
 */

import * as THREE from 'three';
import { ConnectomeGraph } from '../ConnectomeGraph';
import { LIFDynamicsEngine } from '../dynamics/LIFDynamicsEngine';
import { ConnectomeSensoryAdapter, SensoryEnvironmentPercept } from '../adapters/ConnectomeSensoryAdapter';
import { ConnectomeMotorAdapter, DecodedMotorCommand } from '../adapters/ConnectomeMotorAdapter';
import { NeuralStateSnapshot } from '../types';

export interface ConnectomeFlightUpdate {
  newPosition: [number, number, number];
  newVelocity: [number, number, number];
  newRotation: number; // yaw
  pitch: number;
  roll: number;
  activityPose: 'flying' | 'sitting';
  isEscapeTriggered: boolean;
  snapshot: NeuralStateSnapshot;
}

export class ConnectomeFlyController {
  private graph: ConnectomeGraph;
  private dynamicsEngine: LIFDynamicsEngine;
  private sensoryAdapter: ConnectomeSensoryAdapter;
  private motorAdapter: ConnectomeMotorAdapter;

  private isManualThreatTriggered = false;
  private threatTimerSec = 0;

  constructor(graph?: ConnectomeGraph) {
    this.graph = graph || new ConnectomeGraph();
    this.dynamicsEngine = new LIFDynamicsEngine(this.graph);
    this.sensoryAdapter = new ConnectomeSensoryAdapter();
    this.motorAdapter = new ConnectomeMotorAdapter();
  }

  public getGraph(): ConnectomeGraph {
    return this.graph;
  }

  public getEngine(): LIFDynamicsEngine {
    return this.dynamicsEngine;
  }

  public triggerThreatStimulus(): void {
    this.threatTimerSec = 0.3; // 300 ms threat burst
    this.isManualThreatTriggered = true;
  }

  /**
   * Main closed-loop autonomous update step.
   */
  public update(
    currentPos: [number, number, number],
    currentVel: [number, number, number],
    currentYaw: number,
    roomBounds: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number },
    deltaSimSec: number
  ): ConnectomeFlightUpdate {
    const dt = Math.max(0.001, Math.min(0.1, deltaSimSec));
    const dtMs = dt * 1000;

    const pos = new THREE.Vector3(...currentPos);
    const vel = new THREE.Vector3(...currentVel);

    // 1. Compute Nearest Boundary Distance & Approach Velocity
    // Calculate distance to closest room walls
    const distMinX = pos.x - roomBounds.minX;
    const distMaxX = roomBounds.maxX - pos.x;
    const distMinY = pos.y - roomBounds.minY;
    const distMaxY = roomBounds.maxY - pos.y;
    const distMinZ = pos.z - roomBounds.minZ;
    const distMaxZ = roomBounds.maxZ - pos.z;

    const minDistX = Math.min(distMinX, distMaxX);
    const minDistY = Math.min(distMinY, distMaxY);
    const minDistZ = Math.min(distMinZ, distMaxZ);

    const nearestObstacleDist = Math.max(0.05, Math.min(minDistX, minDistY, minDistZ));

    // Approach velocity towards the nearest boundary
    let approachSpeed = 0;
    if (minDistX === distMinX && vel.x < 0) approachSpeed = Math.abs(vel.x);
    else if (minDistX === distMaxX && vel.x > 0) approachSpeed = vel.x;
    else if (minDistZ === distMinZ && vel.z < 0) approachSpeed = Math.abs(vel.z);
    else if (minDistZ === distMaxZ && vel.z > 0) approachSpeed = vel.z;
    else if (minDistY === distMinY && vel.y < 0) approachSpeed = Math.abs(vel.y);

    const isThreatActive = this.threatTimerSec > 0 || this.isManualThreatTriggered;
    if (this.threatTimerSec > 0) {
      this.threatTimerSec = Math.max(0, this.threatTimerSec - dt);
    }
    this.isManualThreatTriggered = false; // reset one-shot trigger

    // 2. Sensory Perception & Neural Current Injection
    const percept: SensoryEnvironmentPercept = {
      flyPosition: currentPos,
      flyVelocity: currentVel,
      roomBounds,
      headingAngle: currentYaw,
      nearestObstacleDistance: nearestObstacleDist,
      approachVelocity: approachSpeed,
      ambientLightLevel: 0.85,
      isManualThreatTriggered: isThreatActive,
    };

    this.sensoryAdapter.update(this.dynamicsEngine, percept);

    // 3. Step Biophysical Neural Dynamics
    const snapshot = this.dynamicsEngine.step(dtMs);

    // 4. Decode Descending Motor Commands
    const motorCommand: DecodedMotorCommand = this.motorAdapter.decode(snapshot.motorOutputs, dt);

    // 5. Apply Decoded Flight Forces to Physics
    let targetYaw = currentYaw + motorCommand.yawTurnRate * dt;

    // Wall repulsion bias to keep autonomous flight organically inside room
    if (minDistX < 1.0) {
      targetYaw += (pos.x < 0 ? 1 : -1) * dt * 2.5;
    }
    if (minDistZ < 1.0) {
      targetYaw += (pos.z < 0 ? 1 : -1) * dt * 2.5;
    }

    // Forward thrust along heading direction
    const forwardX = Math.sin(targetYaw);
    const forwardZ = Math.cos(targetYaw);

    vel.x += forwardX * motorCommand.thrustAccel * dt;
    vel.z += forwardZ * motorCommand.thrustAccel * dt;
    vel.y += motorCommand.liftAccel * dt;

    // Aerodynamic damping & friction
    const damping = motorCommand.isEscapeTriggered ? 2.5 : 4.0;
    vel.x -= vel.x * damping * dt;
    vel.z -= vel.z * damping * dt;
    vel.y -= vel.y * (damping * 0.8) * dt;

    // Clamp speed limit
    if (vel.length() > motorCommand.flightSpeedLimit) {
      vel.clampLength(0, motorCommand.flightSpeedLimit);
    }

    // Integrate position
    pos.addScaledVector(vel, dt);

    // Strict room collision boundaries enforcement
    const margin = 0.2;
    pos.x = Math.max(roomBounds.minX + margin, Math.min(roomBounds.maxX - margin, pos.x));
    pos.y = Math.max(roomBounds.minY + 0.1, Math.min(roomBounds.maxY - margin, pos.y));
    pos.z = Math.max(roomBounds.minZ + margin, Math.min(roomBounds.maxZ - margin, pos.z));

    // Pitch & roll banking calculation
    const pitch = THREE.MathUtils.clamp(-vel.y * 0.25, -0.4, 0.5);
    const roll = THREE.MathUtils.clamp(motorCommand.targetRoll, -0.5, 0.5);

    return {
      newPosition: [pos.x, pos.y, pos.z],
      newVelocity: [vel.x, vel.y, vel.z],
      newRotation: targetYaw,
      pitch,
      roll,
      activityPose: motorCommand.activityPose,
      isEscapeTriggered: motorCommand.isEscapeTriggered,
      snapshot,
    };
  }

  public reset(): void {
    this.dynamicsEngine.reset();
    this.motorAdapter.reset();
  }
}
