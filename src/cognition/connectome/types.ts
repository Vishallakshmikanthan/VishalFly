/**
 * VISHALFLY — Biological Connectome Types & Interfaces
 * 
 * Defines strongly typed models for biological neurons, synapses, circuits,
 * and neural dynamics simulation states grounded in Janelia FlyEM MaleCNS v1.0
 * and the Reiser Lab Visual System Connectome.
 */

export type NeurotransmitterType = 
  | 'acetylcholine'
  | 'gaba'
  | 'glutamate'
  | 'dopamine'
  | 'serotonin'
  | 'octopamine'
  | 'unknown';

export interface BiologicalNeuron {
  bodyId: number;
  type: string;
  instance: string;
  superclass: string;
  somaSide: 'R' | 'L' | 'unknown';
  somaLocation: [number, number, number]; // [x, y, z] in nanometers (EM space)
  neurotransmitter: NeurotransmitterType;
  synapseSign: 1 | -1; // +1 excitatory, -1 inhibitory
  ntConfidence: number;
  isGroundTruthNT: boolean;
  experimentalValidation?: string;
  publishedReference?: string;
  dataSource: string;
}

export interface BiologicalSynapse {
  preBodyId: number;
  postBodyId: number;
  preType: string;
  postType: string;
  synapseCount: number; // Biological chemical synapse count from EM
  synapseSign: 1 | -1;
  neurotransmitter: string;
  evidenceLevel: 'measured_em' | 'statistical_synapse_table';
  dataSource: string;
}

export interface CircuitStatistics {
  neuronCount: number;
  synapseCount: number;
  totalSynapticConnections: number;
  excitatoryCount: number;
  inhibitoryCount: number;
}

export interface BiologicalCircuitData {
  circuitId: string;
  name: string;
  description: string;
  datasetVersion: string;
  retrievalDate: string;
  isRealDataImported: boolean;
  neurons: BiologicalNeuron[];
  synapses: BiologicalSynapse[];
  statistics: CircuitStatistics;
  sensoryInputNeurons: number[];
  featureDetectorNeurons?: number[];
  motorOutputNeurons: number[];
}

export interface ConnectomeManifest {
  manifestVersion: string;
  generatedAt: string;
  project: string;
  license: string;
  scientificCitation: string;
  reiserCitation: string;
  simulationReferences: string[];
  sourceArtifacts: Array<{
    filename: string;
    url: string;
    sizeBytes: number;
    sha256: string;
    recordCount: number;
    description: string;
  }>;
  circuitsExported: Array<{
    file: string;
    circuitId: string;
    neuronCount: number;
    synapseCount: number;
  }>;
  parameterClassification: {
    directlyMeasured: string[];
    derived: string[];
    computationalAssumptions: string[];
    unmodeled: string[];
  };
}

export interface LIFParameters {
  tauM: number;            // Membrane time constant (ms), e.g. 15.0 ms
  vRest: number;           // Resting membrane potential (mV), e.g. -60.0 mV
  vTh: number;             // Action potential threshold (mV), e.g. -50.0 mV
  vReset: number;          // Post-spike reset potential (mV), e.g. -65.0 mV
  tauRef: number;          // Absolute refractory period (ms), e.g. 2.0 ms
  rInput: number;          // Input membrane resistance (MOhm), e.g. 10.0 MOhm
  gUnitExcitatory: number; // Unit conductance for excitatory synapses (nS), e.g. 0.05 nS/synapse
  gUnitInhibitory: number; // Unit conductance for inhibitory synapses (nS), e.g. 0.08 nS/synapse
  eRevExcitatory: number;  // Excitatory reversal potential (mV), e.g. 0.0 mV (ACh)
  eRevInhibitory: number;  // Inhibitory reversal potential (mV), e.g. -70.0 mV (GABA/Glu)
}

export interface NeuralMotorOutputs {
  dnEscapeSpike: boolean;   // True if Giant Fiber (DNp01) spiked on this step
  dnEscapeRate: number;     // Firing rate of Giant Fiber (Hz)
  dnSteerYaw: number;       // Bilateral yaw steering command from DNp11/DNg02 (-1.0 to +1.0)
  dnSteerPitch: number;     // Vertical pitch trim from descending drive
  totalMotorActivity: number;
  dng02SteerYaw?: number;   // Steering command specifically from Central Complex DNg02 (-1.0 to +1.0)
  ccActive?: boolean;       // True if central complex goal steering is active
  goalDistance?: number;    // Distance to active navigation destination (meters)
  goalAngularError?: number;// Wrapped angular error to active goal (radians)
}

export interface NeuralStateSnapshot {
  simTimeMs: number;
  stepCount: number;
  potentials: Record<number, number>;    // bodyId -> membrane potential (mV)
  firingRates: Record<number, number>;   // bodyId -> firing rate (Hz)
  recentSpikes: number[];                // List of bodyIds that spiked in latest step
  sensoryInputs: Record<number, number>; // bodyId -> injected current (nA)
  motorOutputs: NeuralMotorOutputs;
  circuitId: string;
  computeLatencyMs: number;
  centralComplex?: {
    steeringCommand: number;
    isUsingFallback: boolean;
    headingEstimate: number;
    flyHeading: number;
    goalBearing: number;
    angularError: number;
    goalDistance: number;
    dng02FiringRates: { left: number; right: number };
  };
}

export type ControllerMode = 'schedule' | 'cognitive' | 'connectome' | 'manual';
