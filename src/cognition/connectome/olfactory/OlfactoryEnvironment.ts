/**
 * VISHALFLY — Simulated Olfactory Environment & Odor Plume Model
 * 
 * Generates synthetic environmental volatile chemical odor fields in 3D room space.
 * Models odor intensity dispersion from actual room landmarks (e.g. dining buffet,
 * study desk fruit bowl) to provide spatial sensory input to the olfactory circuit.
 * 
 * Scientific Integrity & Provenance Declaration:
 * - [SYNTHETIC FIELD]: The odor plume, spatial concentration gradient, and diffusion field
 *   are synthetic mathematical approximations of environmental volatile chemicals.
 *   THEY ARE NOT MEASURED BIOLOGICAL RECEPTOR DATA.
 * - This explicit separation prevents confusing simulated physical plumes with
 *   empirical physiological measurements.
 */

import { Vector3Tuple } from '../../../types';

export interface SimulatedOdorStimulus {
  /** Odor identity/category */
  stimulusCategory: 'food_odor' | 'neutral' | 'none';
  /** Chemical concentration / normalized stimulus intensity [0.0 to 1.0] */
  intensity: number;
  /** 3D world coordinates of the odor source [x, y, z] */
  sourceLocation: Vector3Tuple;
  /** Euclidean distance from fly to odor source in meters */
  distance: number;
  /** Directional unit vector pointing toward the highest odor concentration */
  gradient: Vector3Tuple;
  /** Whether the stimulus is valid and detectable above sensory threshold */
  isValid: boolean;
  /** Explicit scientific provenance label */
  provenance: 'synthetic_environmental_field';
  /** Descriptive label of the odor emitter (e.g. 'Buffet Hot Food Counter') */
  sourceName: string;
}

export interface OdorSourceDefinition {
  id: string;
  name: string;
  locationId: string;
  position: Vector3Tuple;
  baseIntensity: number; // Peak intensity at source (0.0 to 1.0)
  halfDecayDistanceMeters: number; // Distance at which concentration drops to 50%
}

/**
 * Standard environmental food odor sources mapped to actual room layout landmarks.
 */
export const DEFAULT_ODOR_SOURCES: OdorSourceDefinition[] = [
  {
    id: 'dining_buffet',
    name: 'Buffet Hot Food Counter & Chafing Dishes',
    locationId: 'dining',
    position: [-1.3, 1.2, -3.3],
    baseIntensity: 1.0,
    halfDecayDistanceMeters: 2.2,
  },
  {
    id: 'dining_table',
    name: 'Communal Dining Table & Meal Plates',
    locationId: 'dining',
    position: [0.0, 1.1, 0.0],
    baseIntensity: 0.85,
    halfDecayDistanceMeters: 1.8,
  },
  {
    id: 'bedroom_snack',
    name: 'Study Desk Fruit Bowl & Snack Delivery',
    locationId: 'bedroom',
    position: [2.2, 1.1, -2.6],
    baseIntensity: 0.75,
    halfDecayDistanceMeters: 1.5,
  },
];

export class OlfactoryEnvironment {
  private sources: OdorSourceDefinition[];

  constructor(customSources?: OdorSourceDefinition[]) {
    this.sources = customSources || [...DEFAULT_ODOR_SOURCES];
  }

  /**
   * Samples the volatile odor field at the fly's current position and room location.
   * Uses an inverse-quadratic turbulent diffusion dispersal model:
   *   C(d) = I_0 / (1 + (d / d_half)^2)
   */
  public sampleOdor(
    flyPosition: Vector3Tuple,
    currentLocationId: string
  ): SimulatedOdorStimulus {
    // Validate fly position coordinates
    const validPos =
      flyPosition &&
      flyPosition.length === 3 &&
      flyPosition.every(Number.isFinite);

    if (!validPos) {
      return this.createEmptyStimulus();
    }

    // Filter active sources within the current physical room location
    const activeSources = this.sources.filter((s) => s.locationId === currentLocationId);

    if (activeSources.length === 0) {
      return this.createEmptyStimulus();
    }

    // Find the strongest perceived odor source at the current fly position
    let bestStimulus: SimulatedOdorStimulus | null = null;
    let maxEffectiveIntensity = 0;

    for (const src of activeSources) {
      const dx = src.position[0] - flyPosition[0];
      const dy = src.position[1] - flyPosition[1];
      const dz = src.position[2] - flyPosition[2];

      const dist = Math.hypot(dx, dy, dz);

      // Concentration decay curve
      const dRatio = dist / Math.max(0.1, src.halfDecayDistanceMeters);
      const concentration = src.baseIntensity / (1.0 + dRatio * dRatio);

      // Minimum sensory detection threshold
      const detectionThreshold = 0.05;
      if (concentration > maxEffectiveIntensity && concentration >= detectionThreshold) {
        maxEffectiveIntensity = concentration;

        const invDist = dist > 1e-4 ? 1.0 / dist : 0;
        const grad: Vector3Tuple = [dx * invDist, dy * invDist, dz * invDist];

        bestStimulus = {
          stimulusCategory: 'food_odor',
          intensity: Math.min(1.0, Math.max(0.0, concentration)),
          sourceLocation: [...src.position],
          distance: Math.round(dist * 1000) / 1000,
          gradient: grad,
          isValid: true,
          provenance: 'synthetic_environmental_field',
          sourceName: src.name,
        };
      }
    }

    return bestStimulus || this.createEmptyStimulus();
  }

  /**
   * Helper to construct a deterministic inactive/empty odor stimulus.
   */
  public createEmptyStimulus(): SimulatedOdorStimulus {
    return {
      stimulusCategory: 'none',
      intensity: 0.0,
      sourceLocation: [0, 0, 0],
      distance: 0.0,
      gradient: [0, 0, 0],
      isValid: false,
      provenance: 'synthetic_environmental_field',
      sourceName: 'No Odor Source',
    };
  }

  public modifySourceIntensity(sourceId: string, delta: number): void {
    const source = this.sources.find((s) => s.id === sourceId);
    if (source) {
      source.baseIntensity = Math.max(0.0, Math.min(1.0, source.baseIntensity + delta));
    }
  }

  public getSources(): OdorSourceDefinition[] {
    return this.sources.map((s) => ({ ...s }));
  }
}
