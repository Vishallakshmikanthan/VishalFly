/**
 * VISHALFLY — World Event System Engine
 * Milestone 5 Architecture
 * 
 * Manages deterministic simulation of living-world emergent events,
 * periodic condition checks, lifecycle timers, cooldown enforcement,
 * aggregate effect composition, and reproducible seeded randomness.
 */

import {
  WorldEventCategory,
  WorldEventDefinition,
  ActiveWorldEvent,
  WorldEventSettings,
  WorldEventEvaluationContext,
  AggregateWorldEffects,
  WorldEventTelemetry,
  WorldEventEffects
} from './WorldEventTypes';
import { DEFAULT_WORLD_EVENT_DEFINITIONS } from './WorldEventDefinitions';
import { EventLogger } from './EventLogger';
import { NeedsModifiers, NeedState } from '../types/simulation';

/**
 * Deterministic 32-bit pseudorandom number generator (Mulberry32).
 * Produces uniform random floats in [0, 1) reproducible from a seed.
 */
export class Mulberry32PRNG {
  private state: number;
  private readonly initialSeed: number;

  constructor(seed: number = 42) {
    this.initialSeed = seed;
    this.state = seed >>> 0;
  }

  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public reset(newSeed?: number): void {
    const s = newSeed !== undefined ? newSeed : this.initialSeed;
    this.state = s >>> 0;
  }

  public getSeed(): number {
    return this.initialSeed;
  }
}

export interface WorldEventSystemCallbacks {
  onFoodSurfaceModified?: (surfaceId: string, deltaRemaining: number) => void;
  onOdorSourceModified?: (sourceId: string, deltaIntensity: number) => void;
  onLightingChanged?: (preset: string | null) => void;
  onInstantNeedDelta?: (delta: Partial<NeedState>) => void;
}

export class WorldEventSystem {
  private definitions: Map<string, WorldEventDefinition> = new Map();
  private activeEvents: Map<string, ActiveWorldEvent> = new Map();
  private recentHistory: ActiveWorldEvent[] = [];
  private lastTriggeredSimSeconds: Map<string, number> = new Map();
  private instanceCounter: number = 0;
  private totalTriggeredCount: number = 0;

  private prng: Mulberry32PRNG;
  private settings: WorldEventSettings;
  private eventLogger: EventLogger;
  private callbacks: WorldEventSystemCallbacks;

  // Time tracking for periodic evaluation
  private lastEvaluationSimMinutes: number = -1;
  private elapsedSimSecondsAccumulator: number = 0;

  constructor(
    eventLogger?: EventLogger,
    customSettings?: Partial<WorldEventSettings>,
    customDefinitions?: WorldEventDefinition[],
    callbacks: WorldEventSystemCallbacks = {}
  ) {
    this.eventLogger = eventLogger || new EventLogger();
    this.callbacks = callbacks;

    const defaultSeed = customSettings?.deterministicSeed ?? 42;
    this.prng = new Mulberry32PRNG(defaultSeed);

    this.settings = {
      isMasterEnabled: true,
      categoryEnabled: {
        ambient_creature: true,
        lighting_ambience: true,
        food_availability: true,
        college_apartment_activity: true,
        interruption: true,
        weekend_routine: true,
        ...customSettings?.categoryEnabled,
      },
      maxConcurrentEvents: Math.max(1, customSettings?.maxConcurrentEvents ?? 4),
      maxEventHistory: Math.max(5, customSettings?.maxEventHistory ?? 50),
      evaluationIntervalSimMinutes: Math.max(1, customSettings?.evaluationIntervalSimMinutes ?? 5),
      deterministicSeed: defaultSeed,
      isDeterministic: customSettings?.isDeterministic ?? true,
      ...customSettings,
    };

    const defs = customDefinitions || DEFAULT_WORLD_EVENT_DEFINITIONS;
    for (const def of defs) {
      this.definitions.set(def.id, def);
    }
  }

  public getSettings(): WorldEventSettings {
    return { ...this.settings, categoryEnabled: { ...this.settings.categoryEnabled } };
  }

  public setMasterEnabled(enabled: boolean): void {
    this.settings.isMasterEnabled = enabled;
  }

  public setCategoryEnabled(category: WorldEventCategory, enabled: boolean): void {
    this.settings.categoryEnabled[category] = enabled;
  }

  public setSeed(seed: number): void {
    this.settings.deterministicSeed = seed;
    this.prng = new Mulberry32PRNG(seed);
  }

  public getActiveEvents(): ActiveWorldEvent[] {
    return Array.from(this.activeEvents.values());
  }

  public getRecentHistory(): ActiveWorldEvent[] {
    return [...this.recentHistory];
  }

  public getDefinitions(): WorldEventDefinition[] {
    return Array.from(this.definitions.values());
  }

  /**
   * Resets world event state and clears active instances.
   */
  public reset(newSeed?: number): void {
    this.activeEvents.clear();
    this.lastTriggeredSimSeconds.clear();
    this.instanceCounter = 0;
    this.totalTriggeredCount = 0;
    this.lastEvaluationSimMinutes = -1;
    this.elapsedSimSecondsAccumulator = 0;
    if (newSeed !== undefined) {
      this.setSeed(newSeed);
    } else {
      this.prng.reset();
    }
  }

  public step(
    deltaSimSeconds: number,
    context: WorldEventEvaluationContext
  ): AggregateWorldEffects {
    return this.update(deltaSimSeconds, context);
  }

  /**
   * Primary deterministic update loop:
   * 1. Updates durations of all active events, expiring completed ones.
   * 2. Runs periodic evaluation checks based on simulation time intervals.
   * 3. Aggregates live effects.
   */
  public update(
    deltaSimSeconds: number,
    context: WorldEventEvaluationContext
  ): AggregateWorldEffects {
    if (deltaSimSeconds <= 0) {
      return this.aggregateActiveEffects();
    }

    const currentSimSec = context.clock.simulatedSeconds;
    const currentMin = context.clock.currentMinutes;
    const dayNumber = context.clock.dayNumber;
    const timestamp = `Day ${dayNumber} • ${context.clock.simulatedTime}`;

    // 1. Tick and prune active events
    for (const [instId, active] of Array.from(this.activeEvents.entries())) {
      active.elapsedSimSeconds += deltaSimSeconds;
      active.remainingSimSeconds -= deltaSimSeconds;

      if (active.remainingSimSeconds <= 0) {
        // Event expired
        this.activeEvents.delete(instId);
        this.recordHistory(active);

        this.eventLogger.log({
          timestamp,
          dayNumber,
          category: 'system',
          message: `World event concluded: ${active.title}`,
          locationId: active.locationId === 'all' ? undefined : active.locationId,
        });

        // Revert lighting if this event had one
        if (active.effects.ambientLighting && this.callbacks.onLightingChanged) {
          const remainingLight = this.getActiveLightingOverride();
          this.callbacks.onLightingChanged(remainingLight);
        }
      }
    }

    // 2. Periodic condition evaluation for new events
    if (this.settings.isMasterEnabled) {
      this.elapsedSimSecondsAccumulator += deltaSimSeconds;
      const intervalSec = this.settings.evaluationIntervalSimMinutes * 60;

      const shouldEvaluate =
        this.lastEvaluationSimMinutes === -1 ||
        this.elapsedSimSecondsAccumulator >= intervalSec ||
        Math.abs(currentMin - this.lastEvaluationSimMinutes) >= this.settings.evaluationIntervalSimMinutes;

      if (shouldEvaluate) {
        this.elapsedSimSecondsAccumulator = 0;
        this.lastEvaluationSimMinutes = currentMin;
        this.evaluateEmergentTriggers(context, timestamp, dayNumber, currentSimSec);
      }
    }

    // 3. Return aggregate active effects
    return this.aggregateActiveEffects();
  }

  /**
   * Evaluates all registered event definitions against current simulation context.
   */
  private evaluateEmergentTriggers(
    context: WorldEventEvaluationContext,
    timestamp: string,
    dayNumber: number,
    currentSimSec: number
  ): void {
    if (this.activeEvents.size >= this.settings.maxConcurrentEvents) {
      return; // Bounded capacity limit reached
    }

    for (const def of this.definitions.values()) {
      if (this.activeEvents.size >= this.settings.maxConcurrentEvents) {
        break;
      }

      // Check category enabled
      if (!this.settings.categoryEnabled[def.category]) {
        continue;
      }

      // Check location compatibility
      if (def.targetLocation !== 'all' && def.targetLocation !== context.currentLocationId) {
        continue;
      }

      // Check if definition is currently already active
      const isAlreadyActive = Array.from(this.activeEvents.values()).some(
        (a) => a.definitionId === def.id
      );
      if (isAlreadyActive) {
        continue;
      }

      // Check cooldown
      const lastTriggered = this.lastTriggeredSimSeconds.get(def.id);
      if (lastTriggered !== undefined) {
        const elapsedSince = currentSimSec >= lastTriggered
          ? currentSimSec - lastTriggered
          : currentSimSec + 86400 - lastTriggered; // handle day rollover
        if (elapsedSince < def.cooldownSimSeconds) {
          continue;
        }
      }

      // Check trigger condition
      if (!def.triggerCondition(context)) {
        continue;
      }

      // Deterministic probability roll
      const roll = this.prng.next();
      if (roll <= def.baseProbability) {
        this.spawnEvent(def, context, timestamp, dayNumber, currentSimSec);
      }
    }
  }

  /**
   * Spawns an active event from a definition.
   */
  private spawnEvent(
    def: WorldEventDefinition,
    context: WorldEventEvaluationContext,
    timestamp: string,
    dayNumber: number,
    currentSimSec: number
  ): ActiveWorldEvent {
    this.instanceCounter += 1;
    this.totalTriggeredCount += 1;

    // Deterministic duration calculation between min and max
    const durationRange = Math.max(0, def.maxDurationSimSeconds - def.minDurationSimSeconds);
    const durationOffset = Math.round(this.prng.next() * durationRange);
    const duration = def.minDurationSimSeconds + durationOffset;

    const instanceId = `we_${def.id}_${dayNumber}_${this.instanceCounter}`;

    const activeInstance: ActiveWorldEvent = {
      instanceId,
      definitionId: def.id,
      title: def.title,
      category: def.category,
      locationId: def.targetLocation,
      description: def.description,
      startedAtSimMinutes: context.clock.currentMinutes,
      durationSimSeconds: duration,
      remainingSimSeconds: duration,
      elapsedSimSeconds: 0,
      effects: { ...def.effects },
      timestamp,
      dayNumber,
    };

    this.activeEvents.set(instanceId, activeInstance);
    this.lastTriggeredSimSeconds.set(def.id, currentSimSec);

    // Apply immediate effects
    this.applyImmediateEffects(def.effects);

    // Log occurrence
    this.eventLogger.log({
      timestamp,
      dayNumber,
      category: 'system',
      message: `World event triggered: ${def.title} — ${def.description}`,
      locationId: def.targetLocation === 'all' ? undefined : def.targetLocation,
    });

    return activeInstance;
  }

  /**
   * Manually triggers a specific event definition by ID for testing or user controls.
   * Manually triggers an event by definition ID (DevPanel/testing trigger).
   */
  public triggerEvent(
    eventId: string,
    context?: WorldEventEvaluationContext
  ): boolean {
    if (!this.settings.isMasterEnabled) {
      return false;
    }

    const def = this.definitions.get(eventId);
    if (!def) {
      return false;
    }

    if (this.settings.categoryEnabled[def.category] === false) {
      return false;
    }

    const ctx: WorldEventEvaluationContext = context || {
      clock: {
        simulatedTime: '12:00',
        simulatedSeconds: 43200,
        currentMinutes: 720,
        dayNumber: 1,
        dayOfWeek: 'Monday' as const,
        dayType: 'weekday' as const,
        speed: 1 as const,
        isPaused: false,
        totalElapsedSimulatedSeconds: 0,
        totalElapsedRealSeconds: 0,
      },
      currentLocationId: 'bedroom' as const,
      needs: { energy: 100, hunger: 0, sleepiness: 0, fatigue: 0, focus: 100, socialNeed: 50 },
      isAutonomous: true,
      isTravelling: false,
      hungerLevel: 0,
    };

    if (this.activeEvents.size >= this.settings.maxConcurrentEvents) {
      // Remove the oldest event to make room
      const oldestKey = this.activeEvents.keys().next().value;
      if (oldestKey) {
        const oldEvent = this.activeEvents.get(oldestKey)!;
        this.activeEvents.delete(oldestKey);
        this.recordHistory(oldEvent);
      }
    }

    const timestamp = `Day ${ctx.clock.dayNumber} • ${ctx.clock.simulatedTime}`;
    this.spawnEvent(
      def,
      ctx,
      timestamp,
      ctx.clock.dayNumber,
      ctx.clock.simulatedSeconds
    );
    return true;
  }

  private applyImmediateEffects(effects: WorldEventEffects): void {
    // 1. Food surfaces deltas
    if (effects.foodSurfacesDelta && this.callbacks.onFoodSurfaceModified) {
      for (const delta of effects.foodSurfacesDelta) {
        this.callbacks.onFoodSurfaceModified(delta.surfaceId, delta.deltaRemaining);
      }
    }

    // 2. Odor sources deltas
    if (effects.odorSourcesDelta && this.callbacks.onOdorSourceModified) {
      for (const delta of effects.odorSourcesDelta) {
        this.callbacks.onOdorSourceModified(delta.sourceId, delta.deltaIntensity);
      }
    }

    // 3. Ambient lighting override
    if (effects.ambientLighting && this.callbacks.onLightingChanged) {
      this.callbacks.onLightingChanged(effects.ambientLighting);
    }

    // 4. Instant need steps
    if (effects.needsInstantDelta && this.callbacks.onInstantNeedDelta) {
      this.callbacks.onInstantNeedDelta(effects.needsInstantDelta);
    }
  }

  private getActiveLightingOverride(): string | null {
    for (const active of this.activeEvents.values()) {
      if (active.effects.ambientLighting) {
        return active.effects.ambientLighting;
      }
    }
    return null;
  }

  /**
   * Aggregates all currently active event effects into a unified modifier structure.
   */
  public aggregateActiveEffects(): AggregateWorldEffects {
    const combinedNeedsModifiers: NeedsModifiers = {
      energyPerHour: 0,
      hungerPerHour: 0,
      sleepinessPerHour: 0,
      fatiguePerHour: 0,
      focusPerHour: 0,
      socialNeedPerHour: 0,
    };

    let lightingOverride: any = null;
    let maxDistraction = 0.0;
    let suggestedWaypoint: string | null = null;
    const ambientCreatures: any[] = [];
    const combinedActivityBonuses: Record<string, number> = {};
    let activeInterruptBehavior: string | null = null;

    for (const active of this.activeEvents.values()) {
      const eff = active.effects;

      // Needs delta rates
      if (eff.needsDeltaPerHour) {
        if (eff.needsDeltaPerHour.energyPerHour) combinedNeedsModifiers.energyPerHour += eff.needsDeltaPerHour.energyPerHour;
        if (eff.needsDeltaPerHour.hungerPerHour) combinedNeedsModifiers.hungerPerHour += eff.needsDeltaPerHour.hungerPerHour;
        if (eff.needsDeltaPerHour.sleepinessPerHour) combinedNeedsModifiers.sleepinessPerHour += eff.needsDeltaPerHour.sleepinessPerHour;
        if (eff.needsDeltaPerHour.fatiguePerHour) combinedNeedsModifiers.fatiguePerHour += eff.needsDeltaPerHour.fatiguePerHour;
        if (eff.needsDeltaPerHour.focusPerHour) combinedNeedsModifiers.focusPerHour += eff.needsDeltaPerHour.focusPerHour;
        if (eff.needsDeltaPerHour.socialNeedPerHour) combinedNeedsModifiers.socialNeedPerHour += eff.needsDeltaPerHour.socialNeedPerHour;
      }

      // Lighting override (last active wins)
      if (eff.ambientLighting) {
        lightingOverride = eff.ambientLighting;
      }

      // Max distraction
      if (eff.attentionDistraction && eff.attentionDistraction > maxDistraction) {
        maxDistraction = eff.attentionDistraction;
      }

      // Suggested waypoint
      if (eff.suggestedWaypoint) {
        suggestedWaypoint = eff.suggestedWaypoint;
      }

      // Ambient creatures
      if (eff.ambientCreature) {
        ambientCreatures.push(eff.ambientCreature);
      }

      // Interruption behavior
      if (eff.interruptBehaviorId) {
        activeInterruptBehavior = eff.interruptBehaviorId;
      }

      // Activity utility bonuses
      if (eff.activityUtilityBonus) {
        for (const [key, bonus] of Object.entries(eff.activityUtilityBonus)) {
          combinedActivityBonuses[key] = Math.max(
            combinedActivityBonuses[key] || 1.0,
            bonus
          );
        }
      }
    }

    return {
      needsDeltaPerHour: combinedNeedsModifiers,
      ambientLightingOverride: lightingOverride,
      attentionDistraction: maxDistraction,
      suggestedWaypoint,
      ambientCreatures,
      activityUtilityBonuses: combinedActivityBonuses,
      activeInterruptBehavior,
    };
  }

  private recordHistory(event: ActiveWorldEvent): void {
    this.recentHistory.unshift(event);
    if (this.recentHistory.length > this.settings.maxEventHistory) {
      this.recentHistory = this.recentHistory.slice(0, this.settings.maxEventHistory);
    }
  }

  /**
   * Generates a telemetry snapshot for UI panels.
   */
  public getTelemetry(): WorldEventTelemetry {
    return {
      activeEvents: this.getActiveEvents(),
      recentHistory: this.getRecentHistory(),
      activeEffects: this.aggregateActiveEffects(),
      settings: this.getSettings(),
      totalTriggeredCount: this.totalTriggeredCount,
      lastEvaluationSimMinutes: this.lastEvaluationSimMinutes,
    };
  }
}
