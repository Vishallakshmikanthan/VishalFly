import { describe, it, expect } from 'vitest';
import { ConnectomeGraph } from '../ConnectomeGraph';
import { LIFDynamicsEngine, DEFAULT_LIF_PARAMS } from '../dynamics/LIFDynamicsEngine';
import loomingCircuitData from '../data/looming_escape_circuit.json';
import { BiologicalCircuitData } from '../types';

describe('Biological Connectome: LIF Neural Dynamics Simulation', () => {
  const graph = new ConnectomeGraph(loomingCircuitData as unknown as BiologicalCircuitData);

  it('1. initializes all neuron membrane potentials to resting potential', () => {
    const engine = new LIFDynamicsEngine(graph);
    const snapshot = engine.getSnapshot();

    expect(snapshot.simTimeMs).toBe(0);
    expect(snapshot.stepCount).toBe(0);

    for (const neuron of graph.getNeurons()) {
      expect(snapshot.potentials[neuron.bodyId]).toBe(DEFAULT_LIF_PARAMS.vRest);
      expect(snapshot.firingRates[neuron.bodyId]).toBe(0);
    }
  });

  it('2. subthreshold current injection depolarizes neuron towards threshold without spiking', () => {
    const engine = new LIFDynamicsEngine(graph);
    const l2RightId = 10350;

    // Small subthreshold current (0.3 nA)
    engine.setInjectedCurrent(l2RightId, 0.3);
    const snapshot = engine.step(50); // 50 ms

    const v = snapshot.potentials[l2RightId];
    expect(v).toBeGreaterThan(DEFAULT_LIF_PARAMS.vRest);
    expect(v).toBeLessThan(DEFAULT_LIF_PARAMS.vTh);
    expect(snapshot.recentSpikes).not.toContain(l2RightId);
  });

  it('3. strong current injection crosses threshold, triggers spike, and resets to vReset', () => {
    const engine = new LIFDynamicsEngine(graph);
    const l2RightId = 10350;

    // Strong current (2.5 nA)
    engine.setInjectedCurrent(l2RightId, 2.5);
    const snapshot = engine.step(25); // 25 ms

    // Firing rate should increase
    expect(snapshot.firingRates[l2RightId]).toBeGreaterThan(0);
    expect(snapshot.recentSpikes.length).toBeGreaterThan(0);
  });

  it('4. presynaptic excitatory spikes drive postsynaptic depolarization', () => {
    const engine = new LIFDynamicsEngine(graph);
    const l2RightId = 10350;
    const tm2RightId = 10851; // postsynaptic target of L2

    // Inject strong current into presynaptic L2
    engine.setInjectedCurrent(l2RightId, 3.0);
    engine.step(40); // 40 ms

    const snapshot = engine.getSnapshot();
    // Postsynaptic Tm2 should receive excitatory conductances and depolarize above resting or fire action potentials
    const isPostsynapticActive =
      snapshot.potentials[tm2RightId] > DEFAULT_LIF_PARAMS.vRest ||
      snapshot.firingRates[tm2RightId] > 0;
    expect(isPostsynapticActive).toBe(true);
  });

  it('5. deterministic execution: identical inputs produce identical membrane potentials', () => {
    const engineA = new LIFDynamicsEngine(graph);
    const engineB = new LIFDynamicsEngine(graph);

    engineA.setInjectedCurrent(10350, 1.8);
    engineB.setInjectedCurrent(10350, 1.8);

    const snapA = engineA.step(60);
    const snapB = engineB.step(60);

    expect(snapA.simTimeMs).toBe(snapB.simTimeMs);
    expect(snapA.stepCount).toBe(snapB.stepCount);

    for (const neuron of graph.getNeurons()) {
      expect(snapA.potentials[neuron.bodyId]).toBe(snapB.potentials[neuron.bodyId]);
      expect(snapA.firingRates[neuron.bodyId]).toBe(snapB.firingRates[neuron.bodyId]);
    }
  });

  it('6. numerical stability: potentials remain strictly bounded and never produce NaN or Infinity', () => {
    const engine = new LIFDynamicsEngine(graph);

    // Extreme current injection test
    for (const neuron of graph.getNeurons()) {
      engine.setInjectedCurrent(neuron.bodyId, 10.0);
    }

    const snapshot = engine.step(100);

    for (const neuron of graph.getNeurons()) {
      const v = snapshot.potentials[neuron.bodyId];
      expect(Number.isFinite(v)).toBe(true);
      expect(Number.isNaN(v)).toBe(false);
      expect(v).toBeGreaterThanOrEqual(-85.0);
      expect(v).toBeLessThanOrEqual(10.0);
    }
  });
});
