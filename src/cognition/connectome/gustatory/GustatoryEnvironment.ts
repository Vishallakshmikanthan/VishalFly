/**
 * VISHALFLY — Simulated Gustatory Environment & Food Surface Contact Model
 * 
 * Models physical contact-chemosensory perception of non-volatile chemical tastants
 * on surfaces in 3D room space (e.g. dining buffet, communal table, study fruit bowl).
 * 
 * Biological Rationale:
 * - In Drosophila melanogaster, taste (gustation) is strictly contact-mediated:
 *   gustatory receptor neurons (GRNs) on the tarsi (feet) and labellum (mouthparts)
 *   must make physical contact with a substrate to detect non-volatile tastants
 *   such as sucrose (sugar) or bitter compounds (caffeine, quinine).
 * 
 * Scientific Integrity & Provenance Declaration:
 * - [SYNTHETIC TASTANT FIELD]: The spatial tastant surface and physical contact boundary
 *   (d_contact <= 0.18 m) are synthetic mathematical approximations of room food surfaces.
 *   THEY ARE NOT MEASURED SENSORY RECEPTOR DATA.
 * - Tasting only engages when physical distance to the food surface is within contact tolerance.
 */

import { Vector3Tuple } from '../../../types';

export interface FoodSurfaceDefinition {
  id: string;
  name: string;
  locationId: string;
  position: Vector3Tuple;
  tastantType: 'sucrose' | 'bitter' | 'none';
  concentration: number; // 0.0 to 1.0
  foodRemaining: number;  // 0.0 to 100.0
  contactRadiusMeters: number; // Max distance for physical contact (e.g. 0.18m)
}

export interface SimulatedGustatoryStimulus {
  /** Whether the sensory percept is valid */
  isValid: boolean;
  /** Whether the fly is in physical contact with a food surface */
  isContact: boolean;
  /** Primary tastant category */
  tastantType: 'sucrose' | 'bitter' | 'none';
  /** Alias for tastantType */
  tastant: 'sucrose' | 'bitter' | 'none';
  /** Normalized sweet/sucrose stimulus intensity [0.0 to 1.0] */
  sweetIntensity: number;
  /** Normalized bitter/aversive stimulus intensity [0.0 to 1.0] */
  bitterIntensity: number;
  /** Net gustatory stimulus strength [0.0 to 1.0] */
  stimulusStrength: number;
  /** Measured Euclidean distance to the surface in meters */
  distanceToSurface: number;
  /** 3D position of the contact food surface */
  surfacePosition: Vector3Tuple;
  /** Remaining consumable food units on the surface [0.0 to 100.0] */
  foodRemaining: number;
  /** Descriptive name of the food surface */
  sourceName: string;
  /** Alias for sourceName */
  surfaceName: string | null;
  /** Surface identifier */
  surfaceId: string;
  /** Explicit scientific provenance label */
  provenance: 'synthetic_tastant_field';
}

export type FoodContactStimulus = SimulatedGustatoryStimulus;

export const DEFAULT_FOOD_SURFACES: FoodSurfaceDefinition[] = [
  {
    id: 'dining_buffet',
    name: 'Buffet Hot Food Counter & Chafing Dishes',
    locationId: 'dining',
    position: [-1.3, 1.2, -3.3],
    tastantType: 'sucrose',
    concentration: 1.0,
    foodRemaining: 100.0,
    contactRadiusMeters: 0.18,
  },
  {
    id: 'dining_table',
    name: 'Communal Dining Table & Meal Plates',
    locationId: 'dining',
    position: [0.0, 1.1, 0.0],
    tastantType: 'sucrose',
    concentration: 0.85,
    foodRemaining: 85.0,
    contactRadiusMeters: 0.18,
  },
  {
    id: 'bedroom_snack',
    name: 'Study Desk Fruit Bowl & Snack Delivery',
    locationId: 'bedroom',
    position: [2.2, 1.1, -2.6],
    tastantType: 'sucrose',
    concentration: 0.75,
    foodRemaining: 75.0,
    contactRadiusMeters: 0.18,
  },
];

export class GustatoryEnvironment {
  private surfaces: FoodSurfaceDefinition[];

  constructor(customSurfaces?: FoodSurfaceDefinition[]) {
    this.surfaces = customSurfaces || DEFAULT_FOOD_SURFACES.map((s) => ({ ...s }));
  }

  /**
   * Samples contact tastants at the fly's current 3D position.
   * Tasting occurs ONLY when the fly is physically within contact radius (<= 0.18m).
   */
  public sampleGustatory(
    flyPosition: Vector3Tuple,
    currentLocationId: string
  ): SimulatedGustatoryStimulus {
    const validPos =
      flyPosition &&
      flyPosition.length === 3 &&
      flyPosition.every(Number.isFinite);

    if (!validPos) {
      return this.createEmptyStimulus();
    }

    const activeSurfaces = this.surfaces.filter((s) => s.locationId === currentLocationId);
    if (activeSurfaces.length === 0) {
      return this.createEmptyStimulus();
    }

    let closestSurface: FoodSurfaceDefinition | null = null;
    let minDistance = Infinity;

    for (const surface of activeSurfaces) {
      const dx = surface.position[0] - flyPosition[0];
      const dy = surface.position[1] - flyPosition[1];
      const dz = surface.position[2] - flyPosition[2];
      const dist = Math.hypot(dx, dy, dz);

      if (dist < minDistance) {
        minDistance = dist;
        closestSurface = surface;
      }
    }

    if (!closestSurface) {
      return this.createEmptyStimulus();
    }

    const isContact = minDistance <= closestSurface.contactRadiusMeters;

    // Contact gating: If the fly is not in physical contact, no tastant can be detected
    if (!isContact) {
      return {
        isValid: true,
        isContact: false,
        tastantType: 'none',
        tastant: 'none',
        sweetIntensity: 0.0,
        bitterIntensity: 0.0,
        stimulusStrength: 0.0,
        distanceToSurface: Math.round(minDistance * 1000) / 1000,
        surfacePosition: [...closestSurface.position],
        foodRemaining: closestSurface.foodRemaining,
        sourceName: closestSurface.name,
        surfaceName: null,
        surfaceId: closestSurface.id,
        provenance: 'synthetic_tastant_field',
      };
    }

    // Depleted surface: physical contact is present, but food is exhausted
    if (closestSurface.foodRemaining <= 0) {
      return {
        isValid: true,
        isContact: true,
        tastantType: 'none',
        tastant: 'none',
        sweetIntensity: 0.0,
        bitterIntensity: 0.0,
        stimulusStrength: 0.0,
        distanceToSurface: Math.round(minDistance * 1000) / 1000,
        surfacePosition: [...closestSurface.position],
        foodRemaining: 0.0,
        sourceName: closestSurface.name,
        surfaceName: closestSurface.name,
        surfaceId: closestSurface.id,
        provenance: 'synthetic_tastant_field',
      };
    }

    // Proximity factor within the contact zone (1.0 at touch down to 0.0 at edge)
    const proximityGain = Math.max(0.0, 1.0 - minDistance / closestSurface.contactRadiusMeters);
    const concentration = Math.min(1.0, Math.max(0.0, closestSurface.concentration * proximityGain));

    const isSweet = closestSurface.tastantType === 'sucrose';
    const isBitter = closestSurface.tastantType === 'bitter';

    return {
      isValid: true,
      isContact: true,
      tastantType: closestSurface.tastantType,
      tastant: closestSurface.tastantType,
      sweetIntensity: isSweet ? concentration : 0.0,
      bitterIntensity: isBitter ? concentration : 0.0,
      stimulusStrength: concentration,
      distanceToSurface: Math.round(minDistance * 1000) / 1000,
      surfacePosition: [...closestSurface.position],
      foodRemaining: Math.round(closestSurface.foodRemaining * 10) / 10,
      sourceName: closestSurface.name,
      surfaceName: closestSurface.name,
      surfaceId: closestSurface.id,
      provenance: 'synthetic_tastant_field',
    };
  }

  public sampleContact(
    flyPosition: Vector3Tuple,
    currentLocationId: string
  ): SimulatedGustatoryStimulus {
    return this.sampleGustatory(flyPosition, currentLocationId);
  }

  /**
   * Consumes food from a specific surface during feeding.
   * @param surfaceId Identifier of the surface
   * @param amount Units of food to consume
   * @returns Actual amount consumed
   */
  public consumeFood(surfaceId: string, amount: number): number {
    const surface = this.surfaces.find((s) => s.id === surfaceId);
    if (!surface || surface.foodRemaining <= 0 || amount <= 0) {
      return 0.0;
    }
    const actualConsumed = Math.min(surface.foodRemaining, amount);
    surface.foodRemaining = Math.max(0.0, surface.foodRemaining - actualConsumed);
    return actualConsumed;
  }

  /**
   * Sets the tastant category for experimental testing (e.g. presenting bitter quinine).
   */
  public setSurfaceTastant(surfaceId: string, tastantType: 'sucrose' | 'bitter'): void {
    const surface = this.surfaces.find((s) => s.id === surfaceId);
    if (surface) {
      surface.tastantType = tastantType;
    }
  }

  /**
   * Replenishes food surfaces to initial capacity.
   */
  public reset(surfaceId?: string): void {
    this.replenishFood(surfaceId);
  }

  public replenishFood(surfaceId?: string): void {
    for (const surface of this.surfaces) {
      if (!surfaceId || surface.id === surfaceId) {
        surface.foodRemaining = 100.0;
        surface.tastantType = 'sucrose';
      }
    }
  }

  public getSurfaces(): FoodSurfaceDefinition[] {
    return this.surfaces.map((s) => ({ ...s }));
  }

  public createEmptyStimulus(): SimulatedGustatoryStimulus {
    return {
      isValid: false,
      isContact: false,
      tastantType: 'none',
      tastant: 'none',
      sweetIntensity: 0.0,
      bitterIntensity: 0.0,
      stimulusStrength: 0.0,
      distanceToSurface: Infinity,
      surfacePosition: [0, 0, 0],
      foodRemaining: 0.0,
      sourceName: 'No Food Surface',
      surfaceName: null,
      surfaceId: 'none',
      provenance: 'synthetic_tastant_field',
    };
  }
}
