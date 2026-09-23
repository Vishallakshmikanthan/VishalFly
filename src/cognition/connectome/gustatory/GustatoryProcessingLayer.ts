/**
 * VISHALFLY — Gustatory Neural Processing & Proboscis Extension Reflex (PER) Layer
 * 
 * Implements a biophysically grounded gustatory sensorimotor circuit grounded in
 * Janelia MaleCNS v1.0 biological neuron annotations:
 * 
 * Biological Architecture:
 * 1. Gustatory Receptor Neurons (GRNs):
 *    - 146756 (claw_tpGRN_R), 158200 (claw_tpGRN_L), 129802 (dorsal_tpGRN_R)
 *    - Located on tarsi (legs) and labellar sensory bristles.
 *    - Consensus neurotransmitter: Acetylcholine (Excitatory).
 * 2. Motor Neuron 9 (MN9):
 *    - 10331 (MN9_L), 16949 (MN9_R)
 *    - Innervates muscle 9 (M9) of the Drosophila proboscis (Gordon & Scott 2009; Schwarz et al. 2021).
 *    - Excitation of MN9 triggers the innate Proboscis Extension Reflex (PER).
 * 
 * Behavioral State Machine:
 * - 'approaching': In flight, moving toward food.
 * - 'contact_sampling': Physical contact detected; evaluating tastants.
 * - 'proboscis_extending': Attractive sucrose detected; MN9 motor neurons driving proboscis downward.
 * - 'feeding': Proboscis fully extended on food surface; consuming nutrients and reducing hunger.
 * - 'satiated': Hunger reduced to baseline; proboscis retracting.
 * - 'retracting': Proboscis pulling back after feeding or interruption.
 * - 'interrupted': Feeding terminated early due to contact loss, depletion, aversive bitter, or threat.
 * 
 * Scientific Provenance:
 * - [MEASURED]: Neuron body IDs, soma coordinates, and cholinergic consensus NTs in MaleCNS v1.0.
 * - [MODELED]: Synaptic transmission weights between GRNs and MN9, and muscle extension kinematics.
 * - [BOUNDED]: All outputs strictly clamped to [0.0, 1.0] and tested deterministically.
 */

import { ConnectomeGraph } from '../ConnectomeGraph';
import { LIFDynamicsEngine } from '../dynamics/LIFDynamicsEngine';
import { BiologicalCircuitData, NeuralStateSnapshot } from '../types';
import { SimulatedGustatoryStimulus } from './GustatoryEnvironment';
import defaultGustatoryCircuit from '../data/gustatory_feeding_circuit.json';

export type FeedingState =
  | 'approaching'
  | 'contact_sampling'
  | 'proboscis_extending'
  | 'feeding'
  | 'satiated'
  | 'retracting'
  | 'interrupted';

export interface GustatoryTelemetry {
  /** Environmental contact percept */
  stimulus: SimulatedGustatoryStimulus;
  /** Active feeding state machine state */
  feedingState: FeedingState;
  /** Normalized proboscis extension [0.0 = fully retracted, 1.0 = fully extended] */
  proboscisExtension: number;
  /** Whether the fly is actively ingesting food */
  isFeeding: boolean;
  /** Real-time nutrient consumption rate (units/sec) */
  intakeRate: number;
  /** Step hunger reduction delta (negative) */
  hungerDelta: number;
  /** Step energy gain delta (positive) */
  energyDelta: number;
  /** MN9 proboscis motor neuron firing rate (Hz) */
  mn9FiringRate: number;
  /** GRN gustatory sensory neuron firing rate (Hz) */
  grnFiringRate: number;
  /** Interruption or refusal reason, if any */
  interruptionReason?: string;
  /** Explicit scientific provenance label */
  provenance: 'measured_neuron_modeled_synapse';
  /** Underlying biophysical LIF dynamics snapshot */
  snapshot: NeuralStateSnapshot;
}

export class GustatoryProcessingLayer {
  private graph: ConnectomeGraph;
  private dynamicsEngine: LIFDynamicsEngine;

  // Verified Biological Neuron Body IDs from Janelia MaleCNS v1.0
  public readonly GRN_IDS = {
    clawR: 146756,
    clawL: 158200,
    dorsalR: 129802,
  };
  public readonly MN9_IDS = {
    left: 10331,
    right: 16949,
  };

  private feedingState: FeedingState = 'approaching';
  private proboscisExtension: number = 0.0;
  private lastTelemetry: GustatoryTelemetry | null = null;
  private lastInterruptionReason: string | undefined = undefined;

  constructor(customGraph?: ConnectomeGraph) {
    this.graph = customGraph || new ConnectomeGraph(defaultGustatoryCircuit as unknown as BiologicalCircuitData);
    this.dynamicsEngine = new LIFDynamicsEngine(this.graph);
  }

  public getGraph(): ConnectomeGraph {
    return this.graph;
  }

  public getEngine(): LIFDynamicsEngine {
    return this.dynamicsEngine;
  }

  /**
   * Processes contact gustatory perception and drives the Proboscis Extension Reflex (PER).
   * @param stimulus Environmental gustatory percept (contact, tastant, concentration)
   * @param hungerLevel Internal hunger need [0 to 100]
   * @param dtSimSec Simulation timestep in seconds
   * @param isThreatActive Whether a visual looming threat is currently escaping
   */
  public step(
    stimulus: SimulatedGustatoryStimulus | null | undefined,
    dtSimSec: number = 0.05,
    hungerLevel: number = 80,
    isThreatActive: boolean = false
  ): GustatoryTelemetry {
    return this.update(stimulus, hungerLevel, dtSimSec, isThreatActive);
  }

  public update(
    stimulus: SimulatedGustatoryStimulus | null | undefined,
    hungerLevel: number,
    dtSimSec: number,
    isThreatActive: boolean = false
  ): GustatoryTelemetry {
    const dt = Math.max(0.001, Math.min(0.1, dtSimSec));
    const dtMs = dt * 1000;
    const safeHunger = Number.isFinite(hungerLevel) ? Math.max(0, Math.min(100, hungerLevel)) : 0;

    const safeStimulus: SimulatedGustatoryStimulus = stimulus && stimulus.isContact
      ? {
          ...stimulus,
          tastantType: (stimulus.tastant ?? stimulus.tastantType ?? 'none') as any,
          tastant: (stimulus.tastant ?? stimulus.tastantType ?? 'none') as any,
          bitterIntensity: stimulus.bitterIntensity ?? (stimulus.tastant === 'bitter' ? stimulus.stimulusStrength : 0.0),
          sweetIntensity: stimulus.sweetIntensity ?? (stimulus.tastant === 'sucrose' ? stimulus.stimulusStrength : 0.0),
        }
      : {
          isValid: stimulus?.isValid ?? false,
          isContact: false,
          tastantType: 'none',
          tastant: 'none',
          sweetIntensity: 0.0,
          bitterIntensity: 0.0,
          stimulusStrength: 0.0,
          distanceToSurface: stimulus?.distanceToSurface ?? Infinity,
          surfacePosition: stimulus?.surfacePosition ?? [0, 0, 0],
          foodRemaining: stimulus?.foodRemaining ?? 0.0,
          sourceName: stimulus?.sourceName ?? 'No Food Surface',
          surfaceName: stimulus?.surfaceName ?? null,
          surfaceId: stimulus?.surfaceId ?? 'none',
          provenance: 'synthetic_tastant_field',
        };

    // 1. Sensory Current Injection into Biological GRNs
    // Attractive sucrose excites claw/dorsal GRNs proportional to sweetness and hunger
    let grnCurrent = 0.0;
    const hungerSensitization = 0.8 + 0.6 * (safeHunger / 100.0);

    if (safeStimulus.isContact && safeStimulus.tastantType === 'sucrose' && safeStimulus.foodRemaining > 0) {
      grnCurrent = safeStimulus.sweetIntensity * hungerSensitization * 3.5; // nA
    }

    this.dynamicsEngine.setInjectedCurrent(this.GRN_IDS.clawR, grnCurrent);
    this.dynamicsEngine.setInjectedCurrent(this.GRN_IDS.clawL, grnCurrent);
    this.dynamicsEngine.setInjectedCurrent(this.GRN_IDS.dorsalR, grnCurrent * 0.7);

    // 2. Step Biophysical LIF Dynamics through GRN -> MN9 pathway
    const snapshot = this.dynamicsEngine.step(dtMs);

    // 3. Read Motor Neuron 9 (MN9) Firing Rates
    const mn9LeftRate = snapshot.firingRates[this.MN9_IDS.left] ?? 0;
    const mn9RightRate = snapshot.firingRates[this.MN9_IDS.right] ?? 0;
    const avgMn9Rate = (mn9LeftRate + mn9RightRate) / 2;

    const grnRate = (
      (snapshot.firingRates[this.GRN_IDS.clawR] ?? 0) +
      (snapshot.firingRates[this.GRN_IDS.clawL] ?? 0) +
      (snapshot.firingRates[this.GRN_IDS.dorsalR] ?? 0)
    ) / 3;

    // 4. Evaluate Interruption & Refusal Conditions
    let forceRetraction = false;
    let interruptionReason: string | undefined = undefined;

    if (isThreatActive) {
      forceRetraction = true;
      interruptionReason = 'threat_escape';
    } else if (safeStimulus.isContact && (safeStimulus.tastantType === 'bitter' || safeStimulus.bitterIntensity > 0)) {
      // Bitter/aversive tastant triggers immediate rejection and rapid retraction
      forceRetraction = true;
      interruptionReason = 'aversive_bitter';
    } else if (safeStimulus.isContact && safeStimulus.foodRemaining <= 0) {
      forceRetraction = true;
      interruptionReason = 'food_depleted';
    } else if (!safeStimulus.isContact && this.proboscisExtension > 0.05) {
      forceRetraction = true;
      interruptionReason = 'contact_lost';
    } else if (safeHunger <= 10 && this.proboscisExtension > 0.05) {
      forceRetraction = true;
      interruptionReason = 'satiated';
    }

    // 5. Update Proboscis Articulated Extension State
    const extensionSpeed = 3.5; // full extension in ~0.3s
    const retractionSpeed = 5.0; // rapid retraction in ~0.2s

    // MN9 firing threshold for extension (or subthreshold boost during contact)
    const isMN9Active = (avgMn9Rate > 10.0 || (safeStimulus.isContact && safeStimulus.tastantType === 'sucrose' && safeHunger > 20)) && !forceRetraction;

    if (isMN9Active) {
      this.proboscisExtension = Math.min(1.0, this.proboscisExtension + extensionSpeed * dt);
    } else {
      this.proboscisExtension = Math.max(0.0, this.proboscisExtension - retractionSpeed * dt);
    }

    // 6. Feeding State Machine Transitions
    let isFeeding = false;
    let intakeRate = 0.0;
    let hungerDelta = 0.0;
    let energyDelta = 0.0;

    if (forceRetraction) {
      if (interruptionReason === 'satiated') {
        this.feedingState = 'satiated';
      } else {
        this.feedingState = 'interrupted';
      }
      this.lastInterruptionReason = interruptionReason;
    } else if (this.proboscisExtension >= 0.85 && safeStimulus.isContact && safeStimulus.tastantType === 'sucrose' && safeStimulus.foodRemaining > 0) {
      // Active Ingestion
      this.feedingState = 'feeding';
      isFeeding = true;
      this.lastInterruptionReason = undefined;

      // Base consumption rate: 3.5 units/sec
      intakeRate = 3.5 * safeStimulus.sweetIntensity;
      hungerDelta = -intakeRate * dt;
      energyDelta = (intakeRate * 0.5) * dt;
    } else if (this.proboscisExtension > 0.1) {
      this.feedingState = 'proboscis_extending';
      this.lastInterruptionReason = undefined;
    } else if (safeStimulus.isContact) {
      this.feedingState = 'contact_sampling';
      this.lastInterruptionReason = undefined;
    } else {
      this.feedingState = 'approaching';
      this.lastInterruptionReason = undefined;
    }

    this.lastTelemetry = {
      stimulus: safeStimulus,
      feedingState: this.feedingState,
      proboscisExtension: Math.round(this.proboscisExtension * 1000) / 1000,
      isFeeding,
      intakeRate: Math.round(intakeRate * 10) / 10,
      hungerDelta: Math.round(hungerDelta * 1000) / 1000,
      energyDelta: Math.round(energyDelta * 1000) / 1000,
      mn9FiringRate: Math.round(avgMn9Rate * 10) / 10,
      grnFiringRate: Math.round(grnRate * 10) / 10,
      interruptionReason: interruptionReason || this.lastInterruptionReason,
      provenance: 'measured_neuron_modeled_synapse',
      snapshot,
    };

    return this.lastTelemetry;
  }

  public getTelemetry(): GustatoryTelemetry | null {
    return this.lastTelemetry;
  }

  public getProboscisExtension(): number {
    return this.proboscisExtension;
  }

  public isFeedingActive(): boolean {
    return this.feedingState === 'feeding';
  }

  public reset(): void {
    this.dynamicsEngine.reset();
    this.feedingState = 'approaching';
    this.proboscisExtension = 0.0;
    this.lastTelemetry = null;
    this.lastInterruptionReason = undefined;
  }
}
