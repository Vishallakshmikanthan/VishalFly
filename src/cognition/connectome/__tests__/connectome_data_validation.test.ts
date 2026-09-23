import { describe, it, expect } from 'vitest';
import { ConnectomeGraph } from '../ConnectomeGraph';
import loomingCircuitData from '../data/looming_escape_circuit.json';
import compassCircuitData from '../data/compass_steering_circuit.json';
import olfactoryCircuitData from '../data/olfactory_food_circuit.json';
import gustatoryCircuitData from '../data/gustatory_feeding_circuit.json';
import learningCircuitData from '../data/mushroom_body_learning_circuit.json';
import manifestData from '../data/male_cns_manifest.json';
import { BiologicalCircuitData } from '../types';

describe('Biological Connectome: Data Validation & Ingestion Integrity', () => {
  it('1. manifest specifies verified MaleCNS v1.0 citations, license, and SHA-256 artifacts', () => {
    expect(manifestData.manifestVersion).toBe('1.0.0');
    expect(manifestData.license).toContain('CC-BY');
    expect(manifestData.scientificCitation).toContain('Berg');
    expect(manifestData.scientificCitation).toContain('Cell 189');
    expect(manifestData.reiserCitation).toContain('Reiser');

    expect(manifestData.sourceArtifacts.length).toBeGreaterThanOrEqual(2);
    for (const artifact of manifestData.sourceArtifacts) {
      expect(artifact.filename).toBeDefined();
      expect(artifact.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(artifact.sizeBytes).toBeGreaterThan(10000);
      expect(artifact.recordCount).toBeGreaterThan(0);
    }
  });

  it('2. parameter classification distinguishes measured, derived, assumed, and unmodeled elements', () => {
    const classification = manifestData.parameterClassification;
    expect(classification.directlyMeasured.length).toBeGreaterThan(0);
    expect(classification.derived.length).toBeGreaterThan(0);
    expect(classification.computationalAssumptions.length).toBeGreaterThan(0);
    expect(classification.unmodeled.length).toBeGreaterThan(0);
  });

  it('3. looming escape circuit contains verified biological neurons with valid metadata', () => {
    expect(loomingCircuitData.isRealDataImported).toBe(true);
    expect(loomingCircuitData.datasetVersion).toContain('MaleCNS v1.0');
    expect(loomingCircuitData.neurons.length).toBe(16);

    for (const neuron of loomingCircuitData.neurons) {
      expect(neuron.bodyId).toBeGreaterThan(0);
      expect(['L1', 'L2', 'Mi1', 'Tm1', 'Tm2', 'Tm3', 'Tm4', 'T2', 'LC4', 'DNp01', 'DNp11']).toContain(neuron.type);
      expect(['R', 'L']).toContain(neuron.somaSide);
      expect(neuron.somaLocation.length).toBe(3);
      expect(['acetylcholine', 'gaba', 'glutamate']).toContain(neuron.neurotransmitter);
      expect(neuron.synapseSign === 1 || neuron.synapseSign === -1).toBe(true);
      expect(neuron.ntConfidence).toBeGreaterThan(0.5);
    }
  });

  it('4. looming escape circuit contains verified synaptic connections without dangling edges', () => {
    expect(loomingCircuitData.synapses.length).toBeGreaterThan(0);
    const neuronIds = new Set(loomingCircuitData.neurons.map((n) => n.bodyId));

    for (const syn of loomingCircuitData.synapses) {
      expect(neuronIds.has(syn.preBodyId)).toBe(true);
      expect(neuronIds.has(syn.postBodyId)).toBe(true);
      expect(syn.synapseCount).toBeGreaterThan(0);
      expect(syn.synapseSign === 1 || syn.synapseSign === -1).toBe(true);
      expect(syn.evidenceLevel).toBe('measured_em');
    }
  });

  it('5. ConnectomeGraph indexes and validates looming circuit with zero errors', () => {
    const graph = new ConnectomeGraph(loomingCircuitData as unknown as BiologicalCircuitData);
    const validation = graph.validateIntegrity();
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);

    const sensoryNeurons = graph.getSensoryInputNeurons();
    expect(sensoryNeurons.length).toBe(4); // L1_R, L2_R, L1_L, L2_L

    const motorNeurons = graph.getMotorOutputNeurons();
    expect(motorNeurons.length).toBe(4); // DNp11_R, DNp11_L, DNp01_R, DNp01_L

    const lc4List = graph.getNeuronsByType('LC4');
    expect(lc4List.length).toBe(2); // LC4_R, LC4_L
  });

  it('6. compass steering circuit validates correctly with E-PG and P-EN neurons', () => {
    const graph = new ConnectomeGraph(compassCircuitData as unknown as BiologicalCircuitData);
    const validation = graph.validateIntegrity();
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);

    const epgs = graph.getNeuronsByType('E-PG');
    expect(epgs.length).toBe(4);
    const pens = graph.getNeuronsByType('P-EN');
    expect(pens.length).toBe(2);
  });

  it('7. olfactory food circuit validates biological body IDs, cholinergic transmitter, and zero dangling edges', () => {
    expect(olfactoryCircuitData.isRealDataImported).toBe(true);
    expect(olfactoryCircuitData.neurons.length).toBe(6);

    const neuronIds = new Set(olfactoryCircuitData.neurons.map((n) => n.bodyId));
    expect(neuronIds.has(10176)).toBe(true); // DM1_lPN_R
    expect(neuronIds.has(10208)).toBe(true); // DM1_lPN_L

    for (const neuron of olfactoryCircuitData.neurons) {
      expect(neuron.bodyId).toBeGreaterThan(0);
      expect(['ORN_DM1', 'DM1_lPN']).toContain(neuron.type);
      expect(neuron.neurotransmitter).toBe('acetylcholine');
      expect(neuron.synapseSign).toBe(1);
      expect(neuron.ntConfidence).toBeGreaterThan(0.9);
    }

    for (const syn of olfactoryCircuitData.synapses) {
      expect(neuronIds.has(syn.preBodyId)).toBe(true);
      expect(neuronIds.has(syn.postBodyId)).toBe(true);
      expect(syn.synapseCount).toBeGreaterThan(0);
      expect(syn.synapseSign).toBe(1);
      expect(syn.neurotransmitter).toBe('acetylcholine');
    }

    const graph = new ConnectomeGraph(olfactoryCircuitData as unknown as BiologicalCircuitData);
    const validation = graph.validateIntegrity();
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    expect(graph.getSensoryInputNeurons().length).toBe(4);
    expect(graph.getNeuronsByType('DM1_lPN').length).toBe(2);
  });

  it('8. manifest records Delta7 investigation with verified glutamate consensus and documented edge data limits', () => {
    const d7 = manifestData.delta7Investigation;
    expect(d7).toBeDefined();
    expect(d7.verifiedBiologicalNeuronCount).toBe(42);
    expect(d7.consensusNeurotransmitter).toBe('glutamate');
    expect(d7.missingEdgeData).toContain('unmeasured in local cache');
    expect(d7.implementationStatus).toContain('ExperimentalDelta7Inhibition');

    // 5 exported circuits in Milestone 4
    expect(manifestData.circuitsExported.length).toBe(5);
    const circuitFiles = manifestData.circuitsExported.map((c) => c.file);
    expect(circuitFiles).toContain('looming_escape_circuit.json');
    expect(circuitFiles).toContain('compass_steering_circuit.json');
    expect(circuitFiles).toContain('olfactory_food_circuit.json');
    expect(circuitFiles).toContain('gustatory_feeding_circuit.json');
    expect(circuitFiles).toContain('mushroom_body_learning_circuit.json');
  });

  it('9. gustatory feeding circuit validates biological body IDs, cholinergic transmitter, and zero dangling edges', () => {
    expect(gustatoryCircuitData.isRealDataImported).toBe(true);
    expect(gustatoryCircuitData.neurons.length).toBe(5);

    const neuronIds = new Set(gustatoryCircuitData.neurons.map((n) => n.bodyId));
    expect(neuronIds.has(146756)).toBe(true); // claw_tpGRN_R
    expect(neuronIds.has(158200)).toBe(true); // claw_tpGRN_L
    expect(neuronIds.has(129802)).toBe(true); // dorsal_tpGRN_R
    expect(neuronIds.has(10331)).toBe(true);  // MN9_L
    expect(neuronIds.has(16949)).toBe(true);  // MN9_R

    for (const neuron of gustatoryCircuitData.neurons) {
      expect(neuron.bodyId).toBeGreaterThan(0);
      expect(['claw_tpGRN', 'dorsal_tpGRN', 'MN9']).toContain(neuron.type);
      expect(neuron.neurotransmitter).toBe('acetylcholine');
      expect(neuron.synapseSign).toBe(1);
      expect(neuron.ntConfidence).toBeGreaterThan(0.45);
    }

    for (const syn of gustatoryCircuitData.synapses) {
      expect(neuronIds.has(syn.preBodyId)).toBe(true);
      expect(neuronIds.has(syn.postBodyId)).toBe(true);
      expect(syn.synapseCount).toBeGreaterThan(0);
      expect(syn.synapseSign).toBe(1);
    }

    const graph = new ConnectomeGraph(gustatoryCircuitData as unknown as BiologicalCircuitData);
    const validation = graph.validateIntegrity();
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    expect(graph.getSensoryInputNeurons().length).toBe(3); // claw_tpGRN (2) + dorsal_tpGRN (1)
    expect(graph.getMotorOutputNeurons().length).toBe(2);  // MN9 (2)
  });

  it('10. mushroom body learning circuit validates biological Kenyon, MBON, and PAM dopamine neurons', () => {
    expect(learningCircuitData.isRealDataImported).toBe(true);
    expect(learningCircuitData.neurons.length).toBe(6);

    const neuronIds = new Set(learningCircuitData.neurons.map((n) => n.bodyId));
    expect(neuronIds.has(14292)).toBe(true); // KCg-m
    expect(neuronIds.has(11862)).toBe(true); // KCab-s
    expect(neuronIds.has(37845)).toBe(true); // PAM04
    expect(neuronIds.has(28434)).toBe(true); // PAM10
    expect(neuronIds.has(10013)).toBe(true); // MBON01
    expect(neuronIds.has(10267)).toBe(true); // MBON14

    // PAM dopamine consensus verification
    const pam04 = learningCircuitData.neurons.find((n) => n.bodyId === 37845);
    const pam10 = learningCircuitData.neurons.find((n) => n.bodyId === 28434);
    expect(pam04?.neurotransmitter).toBe('dopamine');
    expect(pam10?.neurotransmitter).toBe('dopamine');
    expect(pam04?.ntConfidence).toBeGreaterThan(0.85);
    expect(pam10?.ntConfidence).toBeGreaterThan(0.85);

    // MBON transmitter verification: MBON01 is glutamate (inhibitory), MBON14 is ACh (excitatory)
    const mbon01 = learningCircuitData.neurons.find((n) => n.bodyId === 10013);
    const mbon14 = learningCircuitData.neurons.find((n) => n.bodyId === 10267);
    expect(mbon01?.neurotransmitter).toBe('glutamate');
    expect(mbon14?.neurotransmitter).toBe('acetylcholine');

    for (const syn of learningCircuitData.synapses) {
      expect(neuronIds.has(syn.preBodyId)).toBe(true);
      expect(neuronIds.has(syn.postBodyId)).toBe(true);
      expect(syn.synapseCount).toBeGreaterThan(0);
    }

    const graph = new ConnectomeGraph(learningCircuitData as unknown as BiologicalCircuitData);
    const validation = graph.validateIntegrity();
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});

