import { 
  ConnectomeModel, 
  NeuropilMetadata, 
  ConnectomeCircuitMetadata 
} from '../types/cognition';

/**
 * Synthetic connectome fixture designed exclusively for verifying the adapter interface.
 * 
 * SCIENTIFIC HONESTY & PROVENANCE NOTICE:
 * - Real biological MaleCNS connectome files (e.g. multi-gigabyte feather / neuPrint graphs)
 *   are NOT bundled or executed in this repository.
 * - This fixture specifies verified anatomical neuropils from published Drosophila literature
 *   (e.g., Central Complex navigation structures and Mushroom Body associative regions).
 * - All circuit connection weights and pathways in this fixture are explicit software abstractions
 *   and do NOT claim to represent exact synaptic counts or biological connectivity matrices.
 */
export const SYNTHETIC_MALE_CNS_FIXTURE: ConnectomeModel = {
  datasetName: 'MaleCNS (Drosophila melanogaster) - Conceptual Adapter Reference',
  version: '0.1.0-synthetic-fixture',
  isRealDataImported: false,
  provenance: 'Virtual fixture based on published anatomical neuropil standards (Ito et al. 2014) and MaleCNS documentation.',
  neuropils: [
    {
      neuropilId: 'AL',
      standardName: 'Antennal Lobe',
      neuropilCategory: 'sensory',
      anatomicalRegion: 'Deuterocerebrum',
      publishedReference: 'Ito et al., Neuron 2014',
      verifiedInMaleCNS: true,
      notes: 'Primary olfactory processing center; receives sensory inputs from antennal receptor neurons.',
    },
    {
      neuropilId: 'ME_LO',
      standardName: 'Optic Lobe (Medulla & Lobula Complex)',
      neuropilCategory: 'sensory',
      anatomicalRegion: 'Lateral Protocerebrum',
      publishedReference: 'Fischbach & Dittrich 1989',
      verifiedInMaleCNS: true,
      notes: 'Visual processing neuropil mediating motion, color, and polarized light detection.',
    },
    {
      neuropilId: 'CX_PB',
      standardName: 'Central Complex: Protocerebral Bridge',
      neuropilCategory: 'central_complex',
      anatomicalRegion: 'Central Brain',
      publishedReference: 'Pfeiffer & Homberg 2014; Hulse et al. 2021',
      verifiedInMaleCNS: true,
      notes: 'Contains columnar neurons encoding internal heading direction and compass representation.',
    },
    {
      neuropilId: 'CX_EB',
      standardName: 'Central Complex: Ellipsoid Body',
      neuropilCategory: 'central_complex',
      anatomicalRegion: 'Central Brain',
      publishedReference: 'Seelig & Jayaraman, Nature 2015',
      verifiedInMaleCNS: true,
      notes: 'Toroidal ring attractor maintaining azimuthal heading representation (E-PG ring neurons).',
    },
    {
      neuropilId: 'CX_FB',
      standardName: 'Central Complex: Fan-Shaped Body',
      neuropilCategory: 'central_complex',
      anatomicalRegion: 'Central Brain',
      publishedReference: 'Hulse et al., eLife 2021',
      verifiedInMaleCNS: true,
      notes: 'Multilayered integrative hub for 2D translational navigation, sleep homeostasis, and vector steering.',
    },
    {
      neuropilId: 'MB_CA',
      standardName: 'Mushroom Body: Calyx',
      neuropilCategory: 'mushroom_body',
      anatomicalRegion: 'Dorsal Protocerebrum',
      publishedReference: 'Aso et al., eLife 2014',
      verifiedInMaleCNS: true,
      notes: 'Receives random projection fibers from antennal lobe projection neurons for associative representation.',
    },
    {
      neuropilId: 'MB_LOBES',
      standardName: 'Mushroom Body: Vertical and Medial Lobes',
      neuropilCategory: 'mushroom_body',
      anatomicalRegion: 'Dorsal Protocerebrum',
      publishedReference: 'Li et al., eLife 2020',
      verifiedInMaleCNS: true,
      notes: 'Site of dopamine-modulated synaptic plasticity; supports valence assignment and learned persistence.',
    },
    {
      neuropilId: 'DN_MOTOR',
      standardName: 'Descending Neurons (Pre-motor Tracts)',
      neuropilCategory: 'motor_descending',
      anatomicalRegion: 'Ventral Brain / Neck Connective',
      publishedReference: 'Namiki et al., eLife 2018',
      verifiedInMaleCNS: true,
      notes: 'Transmits steering, walking, flight initiation, and grooming motor commands to thoracic ganglia.',
    },
  ],
  circuits: [
    {
      circuitId: 'nav_heading_integration',
      name: 'Ring Attractor Heading Guidance',
      sourceNeuropil: 'CX_EB',
      targetNeuropil: 'CX_PB',
      presumedFunction: 'Maintains angular orientation representation for target heading vectors.',
      evidenceLevel: 'published_experimental',
      dataSource: 'Seelig & Jayaraman 2015; Hulse et al. 2021',
    },
    {
      circuitId: 'vector_action_integration',
      name: 'Fan-Shaped Body Goal Directed Steering',
      sourceNeuropil: 'CX_FB',
      targetNeuropil: 'DN_MOTOR',
      presumedFunction: 'Integrates internal drive state with goal heading to produce motor command bias.',
      evidenceLevel: 'published_experimental',
      dataSource: 'Rayshubskiy et al. 2020',
    },
    {
      circuitId: 'associative_valence_bias',
      name: 'Mushroom Body Output Modulation',
      sourceNeuropil: 'MB_LOBES',
      targetNeuropil: 'CX_FB',
      presumedFunction: 'Biases behavioral candidate selection based on recent outcomes and memory traces.',
      evidenceLevel: 'software_abstraction',
      dataSource: 'Abstraction inspired by MBON-fan-shaped body pathways (Scaplen et al. 2021)',
    },
  ],
};

export const BIOLOGICAL_MALE_CNS_MODEL: ConnectomeModel = {
  datasetName: 'Janelia FlyEM MaleCNS v1.0 (Berg et al. Cell 2026)',
  version: '1.0.0-biological',
  isRealDataImported: true,
  provenance: 'Janelia FlyEM MaleCNS v1.0 EM connectome and Reiser Lab visual system connectome (Nern et al. 2024). Verified synaptic weights and consensus neurotransmitters.',
  neuropils: SYNTHETIC_MALE_CNS_FIXTURE.neuropils,
  circuits: [
    ...SYNTHETIC_MALE_CNS_FIXTURE.circuits,
    {
      circuitId: 'looming_escape_sensorimotor',
      name: 'Visual Looming Collision Evasion Circuit',
      sourceNeuropil: 'ME_LO',
      targetNeuropil: 'DN_MOTOR',
      presumedFunction: 'Looming visual threat detection (LC4) triggering Giant Fiber (DNp01) jump take-off and steering (DNp11).',
      evidenceLevel: 'published_experimental',
      dataSource: 'Janelia MaleCNS v1.0 (Berg et al. 2026) & Nern et al. 2024',
    },
  ],
};

export class ConnectomeAdapter {
  private model: ConnectomeModel;

  constructor(customModel?: ConnectomeModel) {
    this.model = customModel || SYNTHETIC_MALE_CNS_FIXTURE;
  }

  public getModel(): ConnectomeModel {
    return this.model;
  }

  public getNeuropil(id: string): NeuropilMetadata | undefined {
    return this.model.neuropils.find((n) => n.neuropilId === id);
  }

  public getCircuitsBySource(sourceNeuropil: string): ConnectomeCircuitMetadata[] {
    return this.model.circuits.filter((c) => c.sourceNeuropil === sourceNeuropil);
  }

  public getCircuitsByTarget(targetNeuropil: string): ConnectomeCircuitMetadata[] {
    return this.model.circuits.filter((c) => c.targetNeuropil === targetNeuropil);
  }

  public isRealDataImported(): boolean {
    return this.model.isRealDataImported;
  }

  public getSummary(): {
    dataset: string;
    isRealDataImported: boolean;
    neuropilsCount: number;
    circuitsCount: number;
    provenance: string;
  } {
    return {
      dataset: this.model.datasetName,
      isRealDataImported: this.model.isRealDataImported,
      neuropilsCount: this.model.neuropils.length,
      circuitsCount: this.model.circuits.length,
      provenance: this.model.provenance,
    };
  }
}
