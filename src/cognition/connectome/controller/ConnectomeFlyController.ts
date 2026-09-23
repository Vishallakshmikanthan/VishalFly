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
import { CentralComplexSteering } from '../central-complex/CentralComplexSteering';
import { NavigationGoal, createNavigationGoal } from '../navigation/NavigationGoalTypes';
import { NeuralStateSnapshot } from '../types';
import { OlfactoryEnvironment } from '../olfactory/OlfactoryEnvironment';
import { OlfactoryProcessingLayer } from '../olfactory/OlfactoryProcessingLayer';
import { GustatoryEnvironment } from '../gustatory/GustatoryEnvironment';
import { GustatoryProcessingLayer } from '../gustatory/GustatoryProcessingLayer';
import { MushroomBodyLearningLayer } from '../learning/MushroomBodyLearningLayer';

export interface ConnectomeFlightUpdate {
  newPosition: [number, number, number];
  newVelocity: [number, number, number];
  newRotation: number; // yaw
  pitch: number;
  roll: number;
  activityPose: 'flying' | 'sitting' | 'eating';
  isEscapeTriggered: boolean;
  proboscisExtension: number;
  isFeeding: boolean;
  hungerDelta: number;
  energyDelta: number;
  snapshot: NeuralStateSnapshot;
}

export class ConnectomeFlyController {
  private graph: ConnectomeGraph;
  private dynamicsEngine: LIFDynamicsEngine;
  private sensoryAdapter: ConnectomeSensoryAdapter;
  private centralComplex: CentralComplexSteering;
  private motorAdapter: ConnectomeMotorAdapter;
  public olfactoryEnvironment: OlfactoryEnvironment;
  public olfactoryProcessingLayer: OlfactoryProcessingLayer;
  public gustatoryEnvironment: GustatoryEnvironment;
  public gustatoryProcessingLayer: GustatoryProcessingLayer;
  public mushroomBodyLearningLayer: MushroomBodyLearningLayer;

  private isManualThreatTriggered = false;
  private threatTimerSec = 0;

  constructor(graph?: ConnectomeGraph) {
    this.graph = graph || new ConnectomeGraph();
    this.dynamicsEngine = new LIFDynamicsEngine(this.graph);
    this.sensoryAdapter = new ConnectomeSensoryAdapter();
    this.centralComplex = new CentralComplexSteering();
    this.motorAdapter = new ConnectomeMotorAdapter();
    this.olfactoryEnvironment = new OlfactoryEnvironment();
    this.olfactoryProcessingLayer = new OlfactoryProcessingLayer();
    this.gustatoryEnvironment = new GustatoryEnvironment();
    this.gustatoryProcessingLayer = new GustatoryProcessingLayer();
    this.mushroomBodyLearningLayer = new MushroomBodyLearningLayer();
  }

  public getGraph(): ConnectomeGraph {
    return this.graph;
  }

  public getEngine(): LIFDynamicsEngine {
    return this.dynamicsEngine;
  }

  public getCentralComplex(): CentralComplexSteering {
    return this.centralComplex;
  }

  public getOlfactoryEnvironment(): OlfactoryEnvironment {
    return this.olfactoryEnvironment;
  }

  public getOlfactoryProcessingLayer(): OlfactoryProcessingLayer {
    return this.olfactoryProcessingLayer;
  }

  public getGustatoryEnvironment(): GustatoryEnvironment {
    return this.gustatoryEnvironment;
  }

  public getGustatoryProcessingLayer(): GustatoryProcessingLayer {
    return this.gustatoryProcessingLayer;
  }

  public getMushroomBodyLearningLayer(): MushroomBodyLearningLayer {
    return this.mushroomBodyLearningLayer;
  }

  public triggerThreatStimulus(): void {
    this.threatTimerSec = 0.3; // 300 ms threat burst
    this.isManualThreatTriggered = true;
  }

  /**
   * Main simulation tick for closed-loop neural flight, chemotaxis, gustatory sensing, and learning.
   */
  public update(
    currentPos: [number, number, number],
    currentVel: [number, number, number],
    currentYaw: number,
    roomBounds: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number },
    dtSimSec: number,
    goal: NavigationGoal | null = null,
    currentLocationId: string = 'bedroom',
    hungerLevel: number = 0
  ): ConnectomeFlightUpdate {
    const dt = Math.max(0.001, Math.min(0.05, dtSimSec));
    const dtMs = dt * 1000;

    const pos = new THREE.Vector3(...currentPos);
    const vel = new THREE.Vector3(...currentVel);

    // 1. Compute Distance to Nearest Room Wall & Obstacle Boundaries
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

    // 2. Sensory Perception & Neural Current Injection (Visual Looming Pathway)
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

    // 3. Step Biophysical Neural Dynamics (Visual Looming Pathway)
    const snapshot = this.dynamicsEngine.step(dtMs);

    // 4. Sample Simulated Odor Field & Step Olfactory Neural Processing
    const odorStimulus = this.olfactoryEnvironment.sampleOdor(currentPos, currentLocationId);
    const olfactoryTelemetry = this.olfactoryProcessingLayer.update(odorStimulus, hungerLevel, dt);

    // 4b. Sample Gustatory Contact & Step Gustatory Processing (PER Reflex)
    const gustatoryStimulus = this.gustatoryEnvironment.sampleGustatory(currentPos, currentLocationId);
    const gustatoryTelemetry = this.gustatoryProcessingLayer.update(
      gustatoryStimulus,
      hungerLevel,
      dt,
      isThreatActive
    );

    // 4c. Step Mushroom Body Associative Odor Learning
    const isFeedingSweet = gustatoryTelemetry.isFeeding && gustatoryStimulus.tastantType === 'sucrose';
    const isAversiveTasting = gustatoryStimulus.isContact && gustatoryStimulus.tastantType === 'bitter';
    const learningTelemetry = this.mushroomBodyLearningLayer.update(
      odorStimulus.isValid ? odorStimulus.stimulusCategory : 'none',
      odorStimulus.intensity,
      isFeedingSweet,
      isAversiveTasting,
      dt
    );

    // 5. Goal Arbitration (Chemotaxis vs Learned Preference vs Contextual Navigation)
    const learnedValence = this.mushroomBodyLearningLayer.getLearnedValence(odorStimulus.stimulusCategory);
    let effectiveFoodAttraction = olfactoryTelemetry.foodAttractionSignal;

    if (learnedValence < -0.2) {
      // Learned aversive odor suppresses food attraction
      effectiveFoodAttraction = 0.0;
    } else if (learnedValence > 0.0) {
      // Rewarded odor enhances food attraction
      effectiveFoodAttraction = Math.min(1.0, effectiveFoodAttraction * (1.0 + 0.6 * learnedValence));
    }

    const isFoodChemotaxisActive =
      (effectiveFoodAttraction > 0.15 || olfactoryTelemetry.isFoodGoalActive) &&
      learnedValence >= -0.2 &&
      odorStimulus.isValid;

    let effectiveGoal = goal;
    if (isFoodChemotaxisActive) {
      const isCurrentGoalArrived = goal && goal.isArrived;
      const isCurrentGoalNull = !goal || !goal.isValid;
      const isHungerHigh = hungerLevel >= 35;

      if (isCurrentGoalNull || isCurrentGoalArrived || isHungerHigh) {
        effectiveGoal = createNavigationGoal(
          odorStimulus.sourceLocation,
          currentPos,
          currentYaw,
          odorStimulus.sourceName,
          0.18, // Landing proximity for physical contact
          'food_chemotaxis'
        );
      }
    }

    // 6. Step Central Complex (CX) Heading & Steering Circuit with Delta7 Inhibition
    const ccTelemetry = this.centralComplex.update(currentYaw, effectiveGoal, dt);

    // Merge Central Complex neural states into snapshot
    Object.assign(snapshot.potentials, ccTelemetry.snapshot.potentials);
    Object.assign(snapshot.firingRates, ccTelemetry.snapshot.firingRates);
    Object.assign(snapshot.sensoryInputs, ccTelemetry.snapshot.sensoryInputs);
    for (const spk of ccTelemetry.snapshot.recentSpikes) {
      if (!snapshot.recentSpikes.includes(spk)) {
        snapshot.recentSpikes.push(spk);
      }
    }

    // Merge Olfactory Neural Dynamics states into snapshot
    Object.assign(snapshot.potentials, olfactoryTelemetry.snapshot.potentials);
    Object.assign(snapshot.firingRates, olfactoryTelemetry.snapshot.firingRates);
    Object.assign(snapshot.sensoryInputs, olfactoryTelemetry.snapshot.sensoryInputs);
    for (const spk of olfactoryTelemetry.snapshot.recentSpikes) {
      if (!snapshot.recentSpikes.includes(spk)) {
        snapshot.recentSpikes.push(spk);
      }
    }

    // Merge Gustatory Neural Dynamics states into snapshot
    Object.assign(snapshot.potentials, gustatoryTelemetry.snapshot.potentials);
    Object.assign(snapshot.firingRates, gustatoryTelemetry.snapshot.firingRates);
    Object.assign(snapshot.sensoryInputs, gustatoryTelemetry.snapshot.sensoryInputs);
    for (const spk of gustatoryTelemetry.snapshot.recentSpikes) {
      if (!snapshot.recentSpikes.includes(spk)) {
        snapshot.recentSpikes.push(spk);
      }
    }

    // Merge Mushroom Body Learning Neural Dynamics states into snapshot
    Object.assign(snapshot.potentials, learningTelemetry.snapshot.potentials);
    Object.assign(snapshot.firingRates, learningTelemetry.snapshot.firingRates);
    Object.assign(snapshot.sensoryInputs, learningTelemetry.snapshot.sensoryInputs);
    for (const spk of learningTelemetry.snapshot.recentSpikes) {
      if (!snapshot.recentSpikes.includes(spk)) {
        snapshot.recentSpikes.push(spk);
      }
    }

    // Attach Central Complex steering command to motor outputs
    snapshot.motorOutputs.dng02SteerYaw = ccTelemetry.steeringCommand;
    snapshot.motorOutputs.ccActive = effectiveGoal !== undefined && effectiveGoal !== null && effectiveGoal.isValid;
    snapshot.motorOutputs.goalDistance = effectiveGoal?.distance3D;
    snapshot.motorOutputs.goalAngularError = effectiveGoal?.angularError;
    snapshot.centralComplex = {
      steeringCommand: ccTelemetry.steeringCommand,
      isUsingFallback: ccTelemetry.isUsingFallback,
      headingEstimate: ccTelemetry.headingEstimate,
      flyHeading: ccTelemetry.flyHeading,
      goalBearing: ccTelemetry.goalBearing,
      angularError: ccTelemetry.angularError,
      goalDistance: ccTelemetry.goalDistance,
      dng02FiringRates: ccTelemetry.dng02FiringRates,
      delta7: ccTelemetry.delta7,
    };

    // Attach Olfactory Telemetry to snapshot
    snapshot.olfactory = {
      intensity: odorStimulus.intensity,
      stimulusCategory: odorStimulus.stimulusCategory,
      sourceName: odorStimulus.sourceName,
      hungerGain: olfactoryTelemetry.hungerGain,
      foodAttractionSignal: effectiveFoodAttraction,
      isFoodGoalActive: olfactoryTelemetry.isFoodGoalActive && learnedValence >= -0.2,
      ornFiringRates: olfactoryTelemetry.ornFiringRates,
      pnFiringRates: olfactoryTelemetry.pnFiringRates,
      distance: odorStimulus.distance,
      provenance: olfactoryTelemetry.provenance,
    };

    // Attach Gustatory Telemetry to snapshot
    snapshot.gustatory = {
      isContact: gustatoryStimulus.isContact,
      contactState: gustatoryStimulus.isContact ? 'contact_detected' : 'airborne',
      foodSurfaceName: gustatoryStimulus.isContact ? (gustatoryStimulus.surfaceName || gustatoryStimulus.sourceName) : null,
      tastantType: gustatoryStimulus.tastantType,
      tastant: gustatoryStimulus.tastantType,
      sweetIntensity: gustatoryStimulus.sweetIntensity,
      bitterIntensity: gustatoryStimulus.bitterIntensity,
      stimulusStrength: gustatoryStimulus.stimulusStrength,
      proboscisExtension: gustatoryTelemetry.proboscisExtension,
      feedingState: gustatoryTelemetry.feedingState,
      isFeeding: gustatoryTelemetry.isFeeding,
      intakeRate: gustatoryTelemetry.intakeRate,
      hungerDelta: gustatoryTelemetry.hungerDelta,
      energyDelta: gustatoryTelemetry.energyDelta,
      distanceToSurface: gustatoryStimulus.distanceToSurface,
      foodRemaining: gustatoryStimulus.foodRemaining,
      mn9FiringRate: gustatoryTelemetry.mn9FiringRate,
      grnFiringRate: gustatoryTelemetry.grnFiringRate,
      interruptionReason: gustatoryTelemetry.interruptionReason,
      provenance: gustatoryTelemetry.provenance,
    };

    // Attach Learning Telemetry to snapshot
    const unconditionedStimulus: 'sucrose_reward' | 'bitter_punishment' | 'none' =
      learningTelemetry.reinforcementSignal > 0.5
        ? 'sucrose_reward'
        : learningTelemetry.reinforcementSignal < -0.5
        ? 'bitter_punishment'
        : 'none';

    snapshot.learning = {
      activeOdorCue: learningTelemetry.activeOdorCue,
      unconditionedStimulus,
      rewardSignal: learningTelemetry.reinforcementSignal,
      kcActivation: learningTelemetry.kcActivation,
      pamDopamineSignal: learningTelemetry.pamDopamineSignal,
      ppl1DopamineSignal: learningTelemetry.ppl1DopamineSignal,
      reinforcementSignal: learningTelemetry.reinforcementSignal,
      learnedValence: learningTelemetry.learnedValence,
      mbonValence: learningTelemetry.learnedValence,
      mbonApproachRate: learningTelemetry.mbonApproachRate,
      mbonAvoidanceRate: learningTelemetry.mbonAvoidanceRate,
      odorValenceMap: learningTelemetry.odorValenceMap,
      experienceHistory: learningTelemetry.recentExperiences,
      provenance: learningTelemetry.provenance,
    };

    // 7. Decode Descending Motor Commands
    const motorCommand: DecodedMotorCommand = this.motorAdapter.decode(snapshot.motorOutputs, dt);

    // 8. Apply Decoded Flight Forces to Physics
    let targetYaw = currentYaw + motorCommand.yawTurnRate * dt;

    // Wall repulsion bias to keep autonomous flight organically inside room
    if (minDistX < 1.0) {
      targetYaw += (pos.x < 0 ? 1 : -1) * dt * 2.5;
    }
    if (minDistZ < 1.0) {
      targetYaw += (pos.z < 0 ? 1 : -1) * dt * 2.5;
    }

    // 9. Feeding Surface Settling: When actively feeding, land and settle
    if (gustatoryTelemetry.isFeeding) {
      // Consume physical food from the surface
      this.gustatoryEnvironment.consumeFood(gustatoryStimulus.surfaceId, gustatoryTelemetry.intakeRate * dt);

      // Damp velocities to zero to simulate grounded feeding
      vel.x *= 0.1;
      vel.z *= 0.1;
      vel.y = 0.0;
      motorCommand.activityPose = 'sitting'; // visual proxy
    } else {
      // Forward thrust along heading direction
      const forwardX = Math.sin(targetYaw);
      const forwardZ = Math.cos(targetYaw);

      vel.x += forwardX * motorCommand.thrustAccel * dt;
      vel.z += forwardZ * motorCommand.thrustAccel * dt;

      // Vertical altitude guidance when active goal is present
      let verticalLift = motorCommand.liftAccel;
      if (effectiveGoal && effectiveGoal.isValid && !effectiveGoal.isArrived) {
        const altitudeDelta = effectiveGoal.targetPosition[1] - pos.y;
        const altitudeTrim = Math.max(-2.5, Math.min(3.5, altitudeDelta * 3.0));
        verticalLift += altitudeTrim;
      }
      vel.y += verticalLift * dt;

      // Aerodynamic damping & friction
      const damping = motorCommand.isEscapeTriggered ? 2.5 : 4.0;
      vel.x -= vel.x * damping * dt;
      vel.z -= vel.z * damping * dt;
      vel.y -= vel.y * (damping * 0.8) * dt;

      // Clamp speed limit
      if (vel.length() > motorCommand.flightSpeedLimit) {
        vel.clampLength(0, motorCommand.flightSpeedLimit);
      }
    }

    // Integrate position
    pos.addScaledVector(vel, dt);

    // Strict room collision boundaries enforcement
    const margin = 0.2;
    pos.x = Math.max(roomBounds.minX + margin, Math.min(roomBounds.maxX - margin, pos.x));
    pos.y = Math.max(roomBounds.minY + 0.1, Math.min(roomBounds.maxY - margin, pos.y));
    pos.z = Math.max(roomBounds.minZ + margin, Math.min(roomBounds.maxZ - margin, pos.z));

    // Pitch & roll banking calculation
    const pitch = gustatoryTelemetry.isFeeding ? 0.2 : THREE.MathUtils.clamp(-vel.y * 0.25, -0.4, 0.5);
    const roll = gustatoryTelemetry.isFeeding ? 0.0 : THREE.MathUtils.clamp(motorCommand.targetRoll, -0.5, 0.5);

    const activityPose: 'flying' | 'sitting' | 'eating' = gustatoryTelemetry.isFeeding
      ? 'eating'
      : motorCommand.activityPose;

    return {
      newPosition: [pos.x, pos.y, pos.z],
      newVelocity: [vel.x, vel.y, vel.z],
      newRotation: targetYaw,
      pitch,
      roll,
      activityPose,
      isEscapeTriggered: motorCommand.isEscapeTriggered,
      proboscisExtension: gustatoryTelemetry.proboscisExtension,
      isFeeding: gustatoryTelemetry.isFeeding,
      hungerDelta: gustatoryTelemetry.hungerDelta,
      energyDelta: gustatoryTelemetry.energyDelta,
      snapshot,
    };
  }

  public reset(): void {
    this.dynamicsEngine.reset();
    this.centralComplex.reset();
    this.motorAdapter.reset();
    this.olfactoryProcessingLayer.reset();
    this.gustatoryProcessingLayer.reset();
    this.mushroomBodyLearningLayer.reset();
    this.threatTimerSec = 0;
    this.isManualThreatTriggered = false;
  }

  public getLearningLayer(): MushroomBodyLearningLayer {
    return this.mushroomBodyLearningLayer;
  }

  public getGustatoryLayer(): GustatoryProcessingLayer {
    return this.gustatoryProcessingLayer;
  }

  public pairOdorReward(odor: string, reward: number): void {
    this.mushroomBodyLearningLayer.learn(odor, reward, 1.0);
    if (odor !== 'food_odor') {
      this.mushroomBodyLearningLayer.learn('food_odor', reward, 1.0);
    }
  }

  public resetLearning(): void {
    this.mushroomBodyLearningLayer.reset();
  }

  public resetFoodSurfaces(): void {
    this.gustatoryEnvironment.reset();
  }
}
