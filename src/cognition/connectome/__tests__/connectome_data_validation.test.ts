import { describe, it, expect } from 'vitest';
import { ConnectomeGraph } from '../ConnectomeGraph';
import loomingCircuitData from '../data/looming_escape_circuit.json';
import compassCircuitData from '../data/compass_steering_circuit.json';
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
});
