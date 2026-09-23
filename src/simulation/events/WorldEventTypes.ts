/**
 * VISHALFLY — Living World & Emergent Events Type Definitions
 * Milestone 5 Architecture
 * 
 * Defines typed events, trigger preconditions, duration parameters,
 * and effects for the deterministic living world event simulation.
 * 
 * Scientific Integrity & Provenance Declaration:
 * - [SIMULATION ABSTRACTION]: World events (ambient creatures, drafts, lighting,
 *   deliveries, noises) are synthetic narrative/behavioral abstractions.
 *   THEY ARE NOT CLAIMS OF MEASURED DROSOPHILA MELANOGASTER NATURAL FIELD BIOLOGY
 *   OR HUMAN BEHAVIORAL RECORDINGS.
 */

import { LocationId, LightingPreset } from '../../types';
import { NeedsModifiers, NeedState, SimulationClockState } from '../types/simulation';

export type WorldEventCategory =
  | 'ambient_creature'
  | 'lighting_ambience'
  | 'food_availability'
  | 'college_apartment_activity'
  | 'interruption'
  | 'weekend_routine';

export interface AmbientCreatureData {
  name: string;
  type: 'fly' | 'bird' | 'insect';
  spotOrWaypoint: string;
  description: string;
}

export interface WorldEventEffects {
  /** Modifiers applied to continuous needs change rates */
  needsDeltaPerHour?: Partial<NeedsModifiers>;
  /** Discrete need step changes applied upon event start */
  needsInstantDelta?: Partial<NeedState>;
  /** Lighting preset override while event is active */
  ambientLighting?: LightingPreset | null;
  /** Attention distraction level [0.0 to 1.0] */
  attentionDistraction?: number;
  /** Food units added or removed on surfaces (surfaceId -> delta) */
  foodSurfacesDelta?: Array<{ surfaceId: string; deltaRemaining: number }>;
  /** Volatile odor plume intensity adjustment (sourceId -> delta) */
  odorSourcesDelta?: Array<{ sourceId: string; deltaIntensity: number }>;
  /** Behavior candidate recommended for interruption response */
  interruptBehaviorId?: string;
  /** Suggested room waypoint for investigative action */
  suggestedWaypoint?: string;
  /** Ambient creature visible in scene */
  ambientCreature?: AmbientCreatureData;
  /** Multiplier on specific behavior utilities */
  activityUtilityBonus?: Record<string, number>;
}

export interface WorldEventEvaluationContext {
  clock: SimulationClockState;
  currentLocationId: LocationId;
  needs: NeedState;
  activeActivityId?: string;
  isAutonomous: boolean;
  isTravelling: boolean;
  hungerLevel: number;
}

export interface WorldEventDefinition {
  id: string;
  title: string;
  category: WorldEventCategory;
  /** Target location or 'all' for room-agnostic events */
  targetLocation: LocationId | 'all';
  /** Human-readable explanation */
  description: string;
  /** Minimum duration in simulated seconds */
  minDurationSimSeconds: number;
  /** Maximum duration in simulated seconds */
  maxDurationSimSeconds: number;
  /** Minimum time between re-triggers in simulated seconds */
  cooldownSimSeconds: number;
  /** Base probability [0.0 to 1.0] per periodic check */
  baseProbability: number;
  /** Trigger preconditions */
  triggerCondition: (ctx: WorldEventEvaluationContext) => boolean;
  /** Configured effects when event activates */
  effects: WorldEventEffects;
}

export interface ActiveWorldEvent {
  instanceId: string;
  definitionId: string;
  title: string;
  category: WorldEventCategory;
  locationId: LocationId | 'all';
  description: string;
  startedAtSimMinutes: number;
  durationSimSeconds: number;
  remainingSimSeconds: number;
  elapsedSimSeconds: number;
  effects: WorldEventEffects;
  timestamp: string;
  dayNumber: number;
}

export interface WorldEventSettings {
  isMasterEnabled: boolean;
  categoryEnabled: Record<WorldEventCategory, boolean>;
  maxConcurrentEvents: number;
  maxEventHistory: number;
  evaluationIntervalSimMinutes: number;
  deterministicSeed: number;
  isDeterministic: boolean;
}

export interface AggregateWorldEffects {
  needsDeltaPerHour: NeedsModifiers;
  ambientLightingOverride: LightingPreset | null;
  attentionDistraction: number;
  suggestedWaypoint: string | null;
  ambientCreatures: AmbientCreatureData[];
  activityUtilityBonuses: Record<string, number>;
  activeInterruptBehavior: string | null;
}

export interface WorldEventTelemetry {
  activeEvents: ActiveWorldEvent[];
  recentHistory: ActiveWorldEvent[];
  activeEffects: AggregateWorldEffects;
  settings: WorldEventSettings;
  totalTriggeredCount: number;
  lastEvaluationSimMinutes: number;
}
