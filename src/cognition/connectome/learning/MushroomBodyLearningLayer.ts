/**
 * VISHALFLY — Mushroom Body Associative Odor Learning Layer
 * 
 * Implements an experimental, biologically inspired mushroom-body learning circuit
 * grounded in Janelia MaleCNS v1.0 biological neuron annotations:
 * 
 * Biological Architecture:
 * 1. Kenyon Cells (KCs):
 *    - 14292 (KCg-m_R), 11862 (KCab-s_L)
 *    - Encode sparse, high-dimensional odor representations driven by antennal lobe projection neurons.
 * 2. Dopaminergic Reinforcement Neurons (DANs):
 *    - PAM cluster: 37845 (PAM04), 28434 (PAM10) (100% consensus Dopamine).
 *    - Convey appetitive unconditioned stimulus (US) sugar reward signaling.
 *    - PPL1 cluster / modeled aversive DANs: convey aversive punishment / bitter outcomes.
 * 3. Mushroom Body Output Neurons (MBONs):
 *    - 10267 (MBON14): Cholinergic approach-directing output neuron.
 *    - 10013 (MBON01): Glutamatergic avoidance-directing output neuron.
 * 
 * Learning Rule & Mathematical Formulation:
 * - Implements a bounded three-factor dopamine-dependent synaptic plasticity rule
 *   (Hige et al. Neuron 2015; Cohn et al. Cell 2015; Aso et al. eLife 2014):
 * 
 *     Delta_W_KC_to_MBON(t) = alpha * r_KC(t) * [ R_US(t) - V_learned(CS) ] * dt
 * 
 *   Where:
 *   - r_KC(t) in [0.0, 1.0] is Kenyon cell activity driven by the active conditioned odor (CS).
 *   - R_US(t) in [-1.0, 1.0] is the reinforcement signal (+1.0 for sugar reward via PAM, -1.0 for bitter via PPL1).
 *   - alpha = 0.45 is the learning rate.
 *   - V_learned(CS) in [-1.0, 1.0] is the net learned valence:
 *       V > 0: Appetitive memory (enhances food attraction & chemotaxis).
 *       V < 0: Aversive memory (suppresses food attraction & drives avoidance).
 * 
 * Scientific Provenance:
 * - [MEASURED]: Neuron body IDs, soma locations, and consensus transmitters (KC ACh, PAM Dopamine, MBON01 Glutamate, MBON14 ACh).
 * - [MODELED PLASTICITY]: Because in vivo synaptic weight evolution is a dynamic biochemical process,
 *   the three-factor learning rule is an explicitly designated experimental computational model.
 * - [BOUNDED]: All valence and weight parameters are strictly clamped to [-1.0, 1.0] and deterministically testable.
 */

import { ConnectomeGraph } from '../ConnectomeGraph';
import { LIFDynamicsEngine } from '../dynamics/LIFDynamicsEngine';
import { BiologicalCircuitData, NeuralStateSnapshot } from '../types';
import defaultMBLearningCircuit from '../data/mushroom_body_learning_circuit.json';

export interface LearningExperienceRecord {
  timestampSec: number;
  odorCue: string;
  reinforcement: 'reward_sugar' | 'aversive_bitter' | 'neutral';
  valenceBefore: number;
  valenceAfter: number;
}

export interface LearningTelemetry {
  /** Conditioned odor cue currently perceived */
  activeOdorCue: string;
  /** Active Kenyon cell firing / recruitment level [0.0 to 1.0] */
  kcActivation: number;
  /** Dopaminergic PAM reward signal [0.0 to 1.0] */
  pamDopamineSignal: number;
  /** Dopaminergic aversive punishment signal [0.0 to 1.0] */
  ppl1DopamineSignal: number;
  /** Net unconditioned reinforcement R_US [-1.0 to 1.0] */
  reinforcementSignal: number;
  /** Learned valence for the active odor cue [-1.0 to 1.0] */
  learnedValence: number;
  /** MBON approach activity level [0.0 to 1.0] */
  mbonApproachRate: number;
  /** MBON avoidance activity level [0.0 to 1.0] */
  mbonAvoidanceRate: number;
  /** Complete learned valence map across all encountered odors */
  odorValenceMap: Record<string, number>;
  /** Historical log of learning updates */
  recentExperiences: LearningExperienceRecord[];
  /** Explicit scientific provenance label */
  provenance: 'modeled_mushroom_body_plasticity';
  /** Underlying biophysical LIF dynamics snapshot */
  snapshot: NeuralStateSnapshot;
}

export class MushroomBodyLearningLayer {
  private graph: ConnectomeGraph;
  private dynamicsEngine: LIFDynamicsEngine;

  // Verified Biological Body IDs from Janelia MaleCNS v1.0
  public readonly KC_IDS = {
    gamma: 14292,
    alphaBeta: 11862,
  };
  public readonly MBON_IDS = {
    avoidance: 10013, // MBON01
    approach: 10267,  // MBON14
  };
  public readonly DAN_IDS = {
    pam04: 37845,
    pam10: 28434,
  };

  /** Learned odor valences: odor category -> valence [-1.0 to +1.0] */
  private odorValenceMap: Record<string, number> = {
    food_odor: 0.0,
    vinegar: 0.0,
    apple_cider: 0.0,
  };

  private recentExperiences: LearningExperienceRecord[] = [];
  private lastTelemetry: LearningTelemetry | null = null;
  private simTimeElapsedSec: number = 0.0;

  // Learning parameters
  public learningRate: number = 0.45;

  constructor(customGraph?: ConnectomeGraph) {
    this.graph = customGraph || new ConnectomeGraph(defaultMBLearningCircuit as unknown as BiologicalCircuitData);
    this.dynamicsEngine = new LIFDynamicsEngine(this.graph);
  }

  public getGraph(): ConnectomeGraph {
    return this.graph;
  }

  public getEngine(): LIFDynamicsEngine {
    return this.dynamicsEngine;
  }

  /**
   * Updates associative odor learning state based on odor cue and taste reinforcement.
   * 
   * @param odorCue Odor category (e.g. 'food_odor', 'vinegar', 'none')
   * @param odorIntensity Sensed chemical concentration [0.0 to 1.0]
   * @param isFeedingSweet Whether the fly is actively consuming sweet sugar (PAM activation)
   * @param isAversiveTasting Whether the fly made contact with aversive bitter tastants (PPL1 activation)
   * @param dtSimSec Timestep in seconds
   */
  public update(
    odorCue: string,
    odorIntensity: number,
    isFeedingSweet: boolean,
    isAversiveTasting: boolean,
    dtSimSec: number
  ): LearningTelemetry {
    const dt = Math.max(0.001, Math.min(0.1, dtSimSec));
    const dtMs = dt * 1000;
    this.simTimeElapsedSec += dt;

    const safeOdorCue = odorCue && odorCue !== 'none' ? odorCue : 'none';
    const safeOdorIntensity = Number.isFinite(odorIntensity) ? Math.max(0.0, Math.min(1.0, odorIntensity)) : 0.0;

    // 1. Compute Kenyon Cell Activation from Olfactory Stimulus
    // In Drosophila, ~5-10% of KCs fire in response to any given odor
    const kcActivation = safeOdorCue !== 'none' ? safeOdorIntensity : 0.0;
    const kcSensoryCurrent = kcActivation * 2.8; // nA

    this.dynamicsEngine.setInjectedCurrent(this.KC_IDS.gamma, kcSensoryCurrent);
    this.dynamicsEngine.setInjectedCurrent(this.KC_IDS.alphaBeta, kcSensoryCurrent);

    // 2. Compute Dopaminergic Reinforcement Signaling
    // Sugar reward drives PAM dopamine neurons
    let pamDopamineSignal = 0.0;
    let ppl1DopamineSignal = 0.0;
    let reinforcementSignal = 0.0;

    if (isFeedingSweet) {
      pamDopamineSignal = 1.0;
      reinforcementSignal = 1.0;
    } else if (isAversiveTasting) {
      ppl1DopamineSignal = 1.0;
      reinforcementSignal = -1.0;
    }

    // Dopamine current injected into PAM neurons
    this.dynamicsEngine.setInjectedCurrent(this.DAN_IDS.pam04, pamDopamineSignal * 3.0);
    this.dynamicsEngine.setInjectedCurrent(this.DAN_IDS.pam10, pamDopamineSignal * 3.0);

    // 3. Step Biophysical LIF Dynamics through MB Circuit
    const snapshot = this.dynamicsEngine.step(dtMs);

    // 4. Update Learned Odor Valence via Bounded Three-Factor Plasticity Rule
    if (safeOdorCue !== 'none' && kcActivation > 0.05 && (isFeedingSweet || isAversiveTasting)) {
      const currentValence = this.odorValenceMap[safeOdorCue] ?? 0.0;
      const predictionError = reinforcementSignal - currentValence;
      const deltaValence = this.learningRate * kcActivation * predictionError * dt;
      const newValence = Math.max(-1.0, Math.min(1.0, currentValence + deltaValence));

      this.odorValenceMap[safeOdorCue] = Math.round(newValence * 1000) / 1000;

      // Log experience if meaningful change occurred
      if (Math.abs(deltaValence) > 0.001) {
        this.recentExperiences.push({
          timestampSec: Math.round(this.simTimeElapsedSec * 10) / 10,
          odorCue: safeOdorCue,
          reinforcement: isFeedingSweet ? 'reward_sugar' : 'aversive_bitter',
          valenceBefore: currentValence,
          valenceAfter: this.odorValenceMap[safeOdorCue],
        });
        if (this.recentExperiences.length > 50) {
          this.recentExperiences.shift();
        }
      }
    }

    const currentValence = this.odorValenceMap[safeOdorCue] ?? 0.0;

    // 5. Compute MBON Output Rates
    // Positive valence biases MBON14 (approach); Negative valence biases MBON01 (avoidance)
    const baseMbonApproach = (snapshot.firingRates[this.MBON_IDS.approach] ?? 0) / 25.0;
    const baseMbonAvoid = (snapshot.firingRates[this.MBON_IDS.avoidance] ?? 0) / 25.0;

    const mbonApproachRate = Math.min(1.0, Math.max(0.0, baseMbonApproach + (currentValence > 0 ? currentValence * 0.5 : 0.0)));
    const mbonAvoidanceRate = Math.min(1.0, Math.max(0.0, baseMbonAvoid + (currentValence < 0 ? Math.abs(currentValence) * 0.5 : 0.0)));

    this.lastTelemetry = {
      activeOdorCue: safeOdorCue,
      kcActivation: Math.round(kcActivation * 100) / 100,
      pamDopamineSignal: Math.round(pamDopamineSignal * 100) / 100,
      ppl1DopamineSignal: Math.round(ppl1DopamineSignal * 100) / 100,
      reinforcementSignal: Math.round(reinforcementSignal * 100) / 100,
      learnedValence: Math.round(currentValence * 1000) / 1000,
      mbonApproachRate: Math.round(mbonApproachRate * 100) / 100,
      mbonAvoidanceRate: Math.round(mbonAvoidanceRate * 100) / 100,
      odorValenceMap: { ...this.odorValenceMap },
      recentExperiences: [...this.recentExperiences],
      provenance: 'modeled_mushroom_body_plasticity',
      snapshot,
    };

    return this.lastTelemetry;
  }

  /**
   * Explicit experimental pairing trigger: pairs an odor with positive sugar reward.
   */
  public pairOdorWithReward(odorCategory: string, rewardStrength: number = 1.0): void {
    const cat = odorCategory || 'food_odor';
    const current = this.odorValenceMap[cat] ?? 0.0;
    const update = this.learningRate * Math.max(0.2, rewardStrength) * (1.0 - current);
    this.odorValenceMap[cat] = Math.max(-1.0, Math.min(1.0, current + update));

    this.recentExperiences.push({
      timestampSec: Math.round(this.simTimeElapsedSec * 10) / 10,
      odorCue: cat,
      reinforcement: 'reward_sugar',
      valenceBefore: current,
      valenceAfter: this.odorValenceMap[cat],
    });
  }

  /**
   * Explicit experimental pairing trigger: pairs an odor with aversive bitter punishment.
   */
  public pairOdorWithPunishment(odorCategory: string, punishmentStrength: number = 1.0): void {
    const cat = odorCategory || 'food_odor';
    const current = this.odorValenceMap[cat] ?? 0.0;
    const update = this.learningRate * Math.max(0.2, punishmentStrength) * (-1.0 - current);
    this.odorValenceMap[cat] = Math.max(-1.0, Math.min(1.0, current + update));

    this.recentExperiences.push({
      timestampSec: Math.round(this.simTimeElapsedSec * 10) / 10,
      odorCue: cat,
      reinforcement: 'aversive_bitter',
      valenceBefore: current,
      valenceAfter: this.odorValenceMap[cat],
    });
  }

  public learn(
    odorCategory: string,
    reinforcement: number,
    dt: number = 1.0
  ): { deltaV: number; newValence: number } {
    if (!odorCategory || !Number.isFinite(reinforcement)) {
      return { deltaV: 0.0, newValence: this.getLearnedValence(odorCategory) };
    }
    const cat = odorCategory;
    const current = this.odorValenceMap[cat] ?? 0.0;
    const target = Math.max(-1.0, Math.min(1.0, reinforcement));
    const effectiveDt = Number.isFinite(dt) ? Math.max(0.001, Math.min(5.0, dt)) : 1.0;
    const deltaV = this.learningRate * (target - current) * effectiveDt;
    const newValence = Math.max(-1.0, Math.min(1.0, current + deltaV));
    this.odorValenceMap[cat] = Math.round(newValence * 1000) / 1000;

    this.recentExperiences.push({
      timestampSec: Math.round(this.simTimeElapsedSec * 10) / 10,
      odorCue: cat,
      reinforcement: reinforcement > 0 ? 'reward_sugar' : reinforcement < 0 ? 'aversive_bitter' : 'neutral',
      valenceBefore: current,
      valenceAfter: this.odorValenceMap[cat],
    });

    return {
      deltaV: Math.round(deltaV * 1000) / 1000,
      newValence: this.odorValenceMap[cat],
    };
  }

  public getExperienceHistory(): LearningExperienceRecord[] {
    return [...this.recentExperiences];
  }

  public getLearnedValence(odorCategory: string): number {
    return this.odorValenceMap[odorCategory] ?? 0.0;
  }

  public getTelemetry(): LearningTelemetry | null {
    return this.lastTelemetry;
  }

  /**
   * Resets all learned valences to documented baseline (unconditioned, 0.0).
   */
  public reset(): void {
    this.dynamicsEngine.reset();
    this.odorValenceMap = {
      food_odor: 0.0,
      vinegar: 0.0,
      apple_cider: 0.0,
    };
    this.recentExperiences = [];
    this.lastTelemetry = null;
    this.simTimeElapsedSec = 0.0;
  }
}
