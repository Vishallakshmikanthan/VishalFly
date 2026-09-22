/**
 * VISHALFLY — Biological Connectome Graph
 * 
 * Typed graph representation of verified biological neurons and synaptic connections.
 * Provides indexing, adjacency lookups, and graph validation.
 */

import {
  BiologicalCircuitData,
  BiologicalNeuron,
  BiologicalSynapse,
  CircuitStatistics,
} from './types';
import defaultLoomingCircuit from './data/looming_escape_circuit.json';

export class ConnectomeGraph {
  private circuitData: BiologicalCircuitData;
  private neuronsById: Map<number, BiologicalNeuron> = new Map();
  private neuronsByType: Map<string, BiologicalNeuron[]> = new Map();
  private outgoingSynapses: Map<number, BiologicalSynapse[]> = new Map();
  private incomingSynapses: Map<number, BiologicalSynapse[]> = new Map();

  constructor(data?: BiologicalCircuitData) {
    this.circuitData = data || (defaultLoomingCircuit as unknown as BiologicalCircuitData);
    this.indexGraph();
  }

  private indexGraph(): void {
    this.neuronsById.clear();
    this.neuronsByType.clear();
    this.outgoingSynapses.clear();
    this.incomingSynapses.clear();

    // 1. Index Neurons
    for (const neuron of this.circuitData.neurons) {
      this.neuronsById.set(neuron.bodyId, neuron);

      const typeList = this.neuronsByType.get(neuron.type) || [];
      typeList.push(neuron);
      this.neuronsByType.set(neuron.type, typeList);

      this.outgoingSynapses.set(neuron.bodyId, []);
      this.incomingSynapses.set(neuron.bodyId, []);
    }

    // 2. Index Synapses
    for (const synapse of this.circuitData.synapses) {
      const outList = this.outgoingSynapses.get(synapse.preBodyId);
      if (outList) {
        outList.push(synapse);
      }

      const inList = this.incomingSynapses.get(synapse.postBodyId);
      if (inList) {
        inList.push(synapse);
      }
    }
  }

  public getCircuitId(): string {
    return this.circuitData.circuitId;
  }

  public getName(): string {
    return this.circuitData.name;
  }

  public getDescription(): string {
    return this.circuitData.description;
  }

  public getDatasetVersion(): string {
    return this.circuitData.datasetVersion;
  }

  public isRealDataImported(): boolean {
    return this.circuitData.isRealDataImported;
  }

  public getStatistics(): CircuitStatistics {
    return this.circuitData.statistics;
  }

  public getNeuron(bodyId: number): BiologicalNeuron | undefined {
    return this.neuronsById.get(bodyId);
  }

  public getNeurons(): BiologicalNeuron[] {
    return Array.from(this.neuronsById.values());
  }

  public getNeuronsByType(type: string): BiologicalNeuron[] {
    return this.neuronsByType.get(type) || [];
  }

  public getOutgoingSynapses(bodyId: number): BiologicalSynapse[] {
    return this.outgoingSynapses.get(bodyId) || [];
  }

  public getIncomingSynapses(bodyId: number): BiologicalSynapse[] {
    return this.incomingSynapses.get(bodyId) || [];
  }

  public getAllSynapses(): BiologicalSynapse[] {
    return this.circuitData.synapses;
  }

  public getSensoryInputNeurons(): BiologicalNeuron[] {
    return this.circuitData.sensoryInputNeurons
      .map((id) => this.getNeuron(id))
      .filter((n): n is BiologicalNeuron => n !== undefined);
  }

  public getMotorOutputNeurons(): BiologicalNeuron[] {
    return this.circuitData.motorOutputNeurons
      .map((id) => this.getNeuron(id))
      .filter((n): n is BiologicalNeuron => n !== undefined);
  }

  public getFeatureDetectorNeurons(): BiologicalNeuron[] {
    if (!this.circuitData.featureDetectorNeurons) return [];
    return this.circuitData.featureDetectorNeurons
      .map((id) => this.getNeuron(id))
      .filter((n): n is BiologicalNeuron => n !== undefined);
  }

  /**
   * Validates graph connectivity, biological consistency, and lack of orphaned edges.
   */
  public validateIntegrity(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.circuitData.neurons.length === 0) {
      errors.push('Circuit contains zero neurons.');
    }

    if (this.circuitData.synapses.length === 0) {
      errors.push('Circuit contains zero synapses.');
    }

    for (const syn of this.circuitData.synapses) {
      if (!this.neuronsById.has(syn.preBodyId)) {
        errors.push(`Synapse references non-existent presynaptic bodyId: ${syn.preBodyId}`);
      }
      if (!this.neuronsById.has(syn.postBodyId)) {
        errors.push(`Synapse references non-existent postsynaptic bodyId: ${syn.postBodyId}`);
      }
      if (syn.synapseCount <= 0) {
        errors.push(`Synapse has non-positive synapse count: ${syn.synapseCount} for ${syn.preBodyId}->${syn.postBodyId}`);
      }
      if (syn.synapseSign !== 1 && syn.synapseSign !== -1) {
        errors.push(`Invalid synapse sign: ${syn.synapseSign} for ${syn.preBodyId}->${syn.postBodyId}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
