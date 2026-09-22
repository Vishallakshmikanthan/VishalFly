/**
 * VISHALFLY — Leaky Integrate-and-Fire (LIF) Neural Dynamics Engine
 * 
 * Biophysically grounded neural simulation engine parameterized by biological
 * connectome synaptic weights and consensus neurotransmitters.
 * 
 * References:
 * - Shiu et al. (Nature 2024): Whole-brain Leaky Integrate-and-Fire Drosophila model.
 * - Lappalainen et al. (Nature 2024): Connectome-constrained Drosophila visual system dynamics.
 */

import { ConnectomeGraph } from '../ConnectomeGraph';
import {
  BiologicalNeuron,
  LIFParameters,
  NeuralMotorOutputs,
  NeuralStateSnapshot,
} from '../types';

export const DEFAULT_LIF_PARAMS: LIFParameters = {
  tauM: 15.0,            // 15 ms membrane time constant
  vRest: -60.0,          // -60 mV resting membrane potential
  vTh: -50.0,            // -50 mV action potential spike threshold
  vReset: -65.0,         // -65 mV post-spike hyperpolarization reset
  tauRef: 2.0,           // 2 ms absolute refractory period
  rInput: 10.0,          // 10.0 MOhm input membrane resistance
  gUnitExcitatory: 0.012, // 0.012 relative conductance per biological synapse (ACh)
  gUnitInhibitory: 0.018, // 0.018 relative conductance per biological synapse (GABA/Glu)
  eRevExcitatory: 0.0,   // 0 mV reversal potential for acetylcholine
  eRevInhibitory: -70.0, // -70 mV reversal potential for GABA & glutamate (GluCl)
};

export class LIFDynamicsEngine {
  private graph: ConnectomeGraph;
  private params: LIFParameters;

  // Internal index mapping
  private neuronList: BiologicalNeuron[];
  private bodyIdToIndex: Map<number, number> = new Map();
  private indexToBodyId: number[];
  private numNeurons: number;

  // Vectorized state arrays (Float32 for performance)
  private potentials: Float32Array;
  private refractoryTimers: Float32Array;
  private firingRates: Float32Array;
  private injectedCurrents: Float32Array;
  private gExc: Float32Array;
  private gInh: Float32Array;

  // Synapse adjacency precompiled for fast execution
  // Each neuron has a list of incoming connections: { preIdx, weight, isExcitatory }
  private incomingSynapsesByNeuron: Array<Array<{ preIdx: number; weight: number; isExcitatory: boolean }>>;

  // Simulation time tracking
  private simTimeMs = 0;
  private stepCount = 0;
  private recentSpikes: number[] = [];
  private lastComputeLatencyMs = 0;

  // Firing rate smoothing constant (tau_rate = 80 ms)
  private readonly tauRate = 80.0;
  private readonly tauSyn = 6.0; // synaptic conductance decay time constant (ms)

  constructor(graph: ConnectomeGraph, customParams?: Partial<LIFParameters>) {
    this.graph = graph;
    this.params = { ...DEFAULT_LIF_PARAMS, ...customParams };

    this.neuronList = this.graph.getNeurons();
    this.numNeurons = this.neuronList.length;
    this.indexToBodyId = new Array(this.numNeurons);

    for (let i = 0; i < this.numNeurons; i++) {
      const neuron = this.neuronList[i];
      this.bodyIdToIndex.set(neuron.bodyId, i);
      this.indexToBodyId[i] = neuron.bodyId;
    }

    // Allocate state buffers
    this.potentials = new Float32Array(this.numNeurons);
    this.refractoryTimers = new Float32Array(this.numNeurons);
    this.firingRates = new Float32Array(this.numNeurons);
    this.injectedCurrents = new Float32Array(this.numNeurons);
    this.gExc = new Float32Array(this.numNeurons);
    this.gInh = new Float32Array(this.numNeurons);

    // Initialize potentials to resting potential
    for (let i = 0; i < this.numNeurons; i++) {
      this.potentials[i] = this.params.vRest;
    }

    // Precompile incoming synapse lookups
    this.incomingSynapsesByNeuron = new Array(this.numNeurons);
    for (let i = 0; i < this.numNeurons; i++) {
      const bodyId = this.indexToBodyId[i];
      const incoming = this.graph.getIncomingSynapses(bodyId);
      const compiled: Array<{ preIdx: number; weight: number; isExcitatory: boolean }> = [];

      for (const syn of incoming) {
        const preIdx = this.bodyIdToIndex.get(syn.preBodyId);
        if (preIdx !== undefined) {
          compiled.push({
            preIdx,
            weight: syn.synapseCount,
            isExcitatory: syn.synapseSign > 0,
          });
        }
      }
      this.incomingSynapsesByNeuron[i] = compiled;
    }
  }

  /**
   * Inject external sensory current into a specific biological neuron.
   * @param bodyId Biological bodyId
   * @param currentNanoAmps Current in nA
   */
  public setInjectedCurrent(bodyId: number, currentNanoAmps: number): void {
    const idx = this.bodyIdToIndex.get(bodyId);
    if (idx !== undefined) {
      this.injectedCurrents[idx] = currentNanoAmps;
    }
  }

  /**
   * Reset all external sensory injected currents to baseline.
   */
  public clearInjectedCurrents(): void {
    this.injectedCurrents.fill(0);
  }

  /**
   * Step neural dynamics forward by durationDeltaMs.
   * Internally sub-steps at 1 ms for numerical integration stability.
   */
  public step(durationDeltaMs: number): NeuralStateSnapshot {
    const startTime = performance.now();
    const dtMs = 1.0; // 1 ms sub-step
    const subSteps = Math.max(1, Math.min(50, Math.round(durationDeltaMs / dtMs)));
    const actualDt = durationDeltaMs / subSteps;

    const spikesInStep: number[] = [];

    for (let step = 0; step < subSteps; step++) {
      const stepSpikes: boolean[] = new Array(this.numNeurons).fill(false);

      // 1. Decay synaptic conductances
      const decaySyn = Math.exp(-actualDt / this.tauSyn);
      for (let i = 0; i < this.numNeurons; i++) {
        this.gExc[i] *= decaySyn;
        this.gInh[i] *= decaySyn;
      }

      // 2. Membrane potential update for each neuron
      for (let i = 0; i < this.numNeurons; i++) {
        // If refractory, clamp to reset potential and decrement timer
        if (this.refractoryTimers[i] > 0) {
          this.refractoryTimers[i] -= actualDt;
          this.potentials[i] = this.params.vReset;
          continue;
        }

        const v = this.potentials[i];

        // Synaptic currents: I_syn = g_exc * (E_exc - V) + g_inh * (E_inh - V)
        const iSynExc = this.gExc[i] * (this.params.eRevExcitatory - v);
        const iSynInh = this.gInh[i] * (this.params.eRevInhibitory - v);
        const iInj = this.injectedCurrents[i];

        // Leak current: I_leak = (V_rest - V) / tau_m
        const dvLeak = (this.params.vRest - v) / this.params.tauM;
        const dvSyn = (iSynExc + iSynInh + iInj * this.params.rInput) * (actualDt / this.params.tauM);

        let nextV = v + dvLeak * actualDt + dvSyn;

        // Check spike threshold
        if (nextV >= this.params.vTh) {
          stepSpikes[i] = true;
          this.potentials[i] = this.params.vReset;
          this.refractoryTimers[i] = this.params.tauRef;
          spikesInStep.push(this.indexToBodyId[i]);
        } else {
          this.potentials[i] = Math.max(-85.0, Math.min(10.0, nextV));
        }
      }

      // 3. Propagate spikes to postsynaptic conductances
      for (let postIdx = 0; postIdx < this.numNeurons; postIdx++) {
        const synapses = this.incomingSynapsesByNeuron[postIdx];
        for (const syn of synapses) {
          if (stepSpikes[syn.preIdx]) {
            if (syn.isExcitatory) {
              this.gExc[postIdx] = Math.min(8.0, this.gExc[postIdx] + syn.weight * this.params.gUnitExcitatory);
            } else {
              this.gInh[postIdx] = Math.min(8.0, this.gInh[postIdx] + syn.weight * this.params.gUnitInhibitory);
            }
          }
        }
      }

      // 4. Update smoothed firing rates: dr/dt = -r/tau_rate + (spike ? 1/dt : 0)
      const decayRate = Math.exp(-actualDt / this.tauRate);
      for (let i = 0; i < this.numNeurons; i++) {
        this.firingRates[i] *= decayRate;
        if (stepSpikes[i]) {
          this.firingRates[i] += (1000.0 / this.tauRate); // instantaneous rate in Hz
        }
      }

      this.simTimeMs += actualDt;
      this.stepCount++;
    }

    this.recentSpikes = spikesInStep;
    this.lastComputeLatencyMs = performance.now() - startTime;

    return this.getSnapshot();
  }

  /**
   * Returns a complete, inspectable snapshot of the neural state.
   */
  public getSnapshot(): NeuralStateSnapshot {
    const potentialsMap: Record<number, number> = {};
    const firingRatesMap: Record<number, number> = {};
    const sensoryInputsMap: Record<number, number> = {};

    for (let i = 0; i < this.numNeurons; i++) {
      const bid = this.indexToBodyId[i];
      potentialsMap[bid] = Math.round(this.potentials[i] * 10) / 10;
      firingRatesMap[bid] = Math.round(this.firingRates[i] * 10) / 10;
      sensoryInputsMap[bid] = Math.round(this.injectedCurrents[i] * 100) / 100;
    }

    // Decode Motor Outputs from verified Descending Neurons
    // DNp01 (Giant Fiber: 10001 / 10010): Escape takeoff reflex
    // DNp11 (Flight steering: 10106 [R] / 10259 [L]): Yaw & pitch bias
    const gfRightIdx = this.bodyIdToIndex.get(10001);
    const gfLeftIdx = this.bodyIdToIndex.get(10010);
    const dnp11RightIdx = this.bodyIdToIndex.get(10106);
    const dnp11LeftIdx = this.bodyIdToIndex.get(10259);

    const gfSpike = this.recentSpikes.includes(10001) || this.recentSpikes.includes(10010);
    const gfRate = Math.max(
      gfRightIdx !== undefined ? this.firingRates[gfRightIdx] : 0,
      gfLeftIdx !== undefined ? this.firingRates[gfLeftIdx] : 0
    );

    const rRate = dnp11RightIdx !== undefined ? this.firingRates[dnp11RightIdx] : 0;
    const lRate = dnp11LeftIdx !== undefined ? this.firingRates[dnp11LeftIdx] : 0;
    const dnSteerYaw = Math.max(-1.0, Math.min(1.0, (lRate - rRate) / 25.0));
    const dnSteerPitch = Math.max(-1.0, Math.min(1.0, (rRate + lRate) / 50.0));

    const totalMotorActivity = gfRate + rRate + lRate;

    const motorOutputs: NeuralMotorOutputs = {
      dnEscapeSpike: gfSpike,
      dnEscapeRate: Math.round(gfRate * 10) / 10,
      dnSteerYaw: Math.round(dnSteerYaw * 100) / 100,
      dnSteerPitch: Math.round(dnSteerPitch * 100) / 100,
      totalMotorActivity: Math.round(totalMotorActivity * 10) / 10,
    };

    return {
      simTimeMs: Math.round(this.simTimeMs * 10) / 10,
      stepCount: this.stepCount,
      potentials: potentialsMap,
      firingRates: firingRatesMap,
      recentSpikes: [...this.recentSpikes],
      sensoryInputs: sensoryInputsMap,
      motorOutputs,
      circuitId: this.graph.getCircuitId(),
      computeLatencyMs: Math.round(this.lastComputeLatencyMs * 1000) / 1000,
    };
  }

  public getParameters(): LIFParameters {
    return { ...this.params };
  }

  public reset(): void {
    for (let i = 0; i < this.numNeurons; i++) {
      this.potentials[i] = this.params.vRest;
    }
    this.refractoryTimers.fill(0);
    this.firingRates.fill(0);
    this.injectedCurrents.fill(0);
    this.gExc.fill(0);
    this.gInh.fill(0);
    this.simTimeMs = 0;
    this.stepCount = 0;
    this.recentSpikes = [];
  }
}
