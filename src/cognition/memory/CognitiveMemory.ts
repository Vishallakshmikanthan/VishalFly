import { MemoryRecord, MemoryOutcome } from '../types/cognition';
import { LocationId } from '../../types';

export class CognitiveMemory {
  private records: MemoryRecord[] = [];
  private maxCapacity: number;
  private retentionDurationSimMinutes: number;
  private idCounter: number = 0;

  constructor(
    maxCapacity: number = 50,
    retentionDurationSimMinutes: number = 180
  ) {
    this.maxCapacity = Math.max(5, maxCapacity);
    this.retentionDurationSimMinutes = Math.max(10, retentionDurationSimMinutes);
  }

  public setCapacity(capacity: number): void {
    this.maxCapacity = Math.max(5, capacity);
    if (this.records.length > this.maxCapacity) {
      this.records = this.records.slice(-this.maxCapacity);
    }
  }

  public setRetentionDuration(simMinutes: number): void {
    this.retentionDurationSimMinutes = Math.max(10, simMinutes);
  }

  /**
   * Records an episodic memory entry with deterministic bounded ring buffer insertion.
   * Backwards-compatible with previous simple key/value records.
   */
  public record(entry: Partial<MemoryRecord> & {
    timestamp: string;
    simulatedMinutes: number;
    dayNumber: number;
    category: MemoryRecord['category'];
    key: string;
    value: string;
    salience: number;
  }): MemoryRecord {
    this.idCounter += 1;
    const safeEvent = (entry.eventType || entry.key || 'event').replace(/\s+/g, '_').toLowerCase();
    const generatedId = entry.id || `mem_d${entry.dayNumber}_m${entry.simulatedMinutes}_${safeEvent}_${this.idCounter}`;

    const recordWithId: MemoryRecord = {
      id: generatedId,
      timestamp: entry.timestamp,
      simulatedMinutes: entry.simulatedMinutes,
      dayNumber: entry.dayNumber,
      eventType: entry.eventType || entry.key,
      category: entry.category,
      key: entry.key,
      value: entry.value,
      location: (entry.location as LocationId) || 'bedroom',
      outcome: entry.outcome || 'completed',
      context: entry.context || {},
      tags: entry.tags || [entry.category, entry.key],
      sourceBehaviorId: entry.sourceBehaviorId,
      salience: Math.max(0, Math.min(1, entry.salience)),
      expiresAtSimMinutes: entry.expiresAtSimMinutes ?? (entry.simulatedMinutes + this.retentionDurationSimMinutes),
    };

    this.records.push(recordWithId);

    // Enforce bounded capacity
    if (this.records.length > this.maxCapacity) {
      this.records.shift(); // Remove oldest record
    }

    return recordWithId;
  }

  /**
   * Helper alias for recording confirmed outcomes.
   */
  public recordOutcome(entry: Partial<MemoryRecord> & {
    timestamp: string;
    simulatedMinutes: number;
    dayNumber: number;
    category: MemoryRecord['category'];
    value: string;
    salience: number;
    key?: string;
    eventType?: string;
    outcome?: MemoryOutcome;
    locationId?: LocationId;
    tags?: string[];
    candidateId?: string;
  }): MemoryRecord {
    return this.record({
      ...entry,
      key: entry.key || entry.eventType || entry.candidateId || 'outcome',
      location: entry.locationId || entry.location,
    });
  }

  /**
   * Returns total count of memory records stored.
   */
  public count(): number {
    return this.records.length;
  }

  /**
   * Returns recent records up to limit (oldest to newest among slice).
   */
  public getRecent(limit: number = 10): MemoryRecord[] {
    return this.records.slice(-limit);
  }

  /**
   * Prunes expired records based on retention policy.
   */
  public pruneExpired(currentMinutes: number, dayNumber: number = 1): void {
    const totalMinutes = (dayNumber - 1) * 1440 + currentMinutes;
    this.prune(totalMinutes);
  }

  /**
   * Returns all memory records (oldest to newest).
   */
  public getAll(): MemoryRecord[] {
    return [...this.records];
  }

  /**
   * Filters active memory records (non-expired relative to current simulation minute).
   */
  public getActive(currentMinutes: number): MemoryRecord[] {
    return this.records.filter((rec) => {
      if (rec.expiresAtSimMinutes === undefined) return true;
      return rec.expiresAtSimMinutes >= currentMinutes;
    });
  }

  /**
   * Queries records by category.
   */
  public getByCategory(category: MemoryRecord['category']): MemoryRecord[] {
    return this.records.filter((rec) => rec.category === category);
  }

  /**
   * Counts how many times a particular key/behavior was recorded recently.
   * Used by behavior integration to apply repetition penalties.
   */
  public getRecentCount(
    category: MemoryRecord['category'],
    key: string,
    withinSimMinutes: number,
    currentMinutes: number
  ): number {
    return this.records.filter((rec) => {
      if (rec.category !== category || rec.key !== key) return false;
      const age = Math.abs(currentMinutes - rec.simulatedMinutes);
      return age <= withinSimMinutes;
    }).length;
  }

  /**
   * Returns recent confirmed events, newest first.
   */
  public getRecentEvents(limit: number = 10): MemoryRecord[] {
    return this.records
      .slice(-Math.min(limit, this.records.length))
      .reverse();
  }

  /**
   * Returns recent records filtered by action/activity outcome.
   */
  public getRecentOutcomes(limit: number = 10, outcomeFilter?: MemoryOutcome): MemoryRecord[] {
    const matching = outcomeFilter
      ? this.records.filter((r) => r.outcome === outcomeFilter)
      : this.records.filter((r) => r.outcome !== undefined);

    return matching
      .slice(-Math.min(limit, matching.length))
      .reverse();
  }

  /**
   * Returns unique locations visited within the given time window.
   */
  public getRecentlyVisitedLocations(withinSimMinutes: number = 180, currentMinutes: number): LocationId[] {
    const recentLocs: LocationId[] = [];
    for (let i = this.records.length - 1; i >= 0; i--) {
      const rec = this.records[i];
      const age = Math.abs(currentMinutes - rec.simulatedMinutes);
      if (age <= withinSimMinutes && rec.location) {
        if (!recentLocs.includes(rec.location)) {
          recentLocs.push(rec.location);
        }
      }
    }
    return recentLocs;
  }

  /**
   * Counts how many times a specific behavior was executed within a time window.
   */
  public getRepeatedBehaviorCount(
    behaviorIdOrKey: string,
    withinSimMinutes: number,
    currentMinutes: number
  ): number {
    return this.records.filter((rec) => {
      if (rec.key !== behaviorIdOrKey && rec.sourceBehaviorId !== behaviorIdOrKey) return false;
      const age = Math.abs(currentMinutes - rec.simulatedMinutes);
      return age <= withinSimMinutes;
    }).length;
  }

  /**
   * Retrieves relevant memories matching location, activity, or tags with deterministic relevance scoring.
   */
  public getRelevantMemories(params: {
    currentLocation?: LocationId;
    currentActivityId?: string;
    tags?: string[];
    limit?: number;
    currentMinutes?: number;
  }): MemoryRecord[] {
    const { currentLocation, currentActivityId, tags = [], limit = 5, currentMinutes } = params;

    const scored = this.records.map((rec) => {
      let score = 0;

      // Location match
      if (currentLocation && rec.location === currentLocation) {
        score += 3;
      }

      // Activity ID or key match
      if (currentActivityId && (rec.key === currentActivityId || rec.eventType === currentActivityId)) {
        score += 4;
      }

      // Tag overlap match
      if (tags.length > 0 && rec.tags) {
        for (const t of tags) {
          if (rec.tags.includes(t)) {
            score += 2;
          }
        }
      }

      // Recency boost if currentMinutes is known
      if (currentMinutes !== undefined) {
        const age = Math.abs(currentMinutes - rec.simulatedMinutes);
        if (age < 60) score += 2;
        else if (age < 180) score += 1;
      }

      // Salience weighting
      score += rec.salience;

      return { record: rec, score };
    });

    return scored
      .filter((item) => item.score > 1.0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.record.simulatedMinutes - a.record.simulatedMinutes;
      })
      .slice(0, limit)
      .map((item) => item.record);
  }

  /**
   * Checks if a routine or activity has been confirmed completed recently.
   */
  public hasCompletedRoutineRecently(
    routineTagOrKey: string,
    withinSimMinutes: number,
    currentMinutes: number
  ): boolean {
    return this.records.some((rec) => {
      if (rec.outcome !== 'completed') return false;
      const matchesKey = rec.key === routineTagOrKey || rec.eventType === routineTagOrKey;
      const matchesTag = rec.tags && rec.tags.includes(routineTagOrKey);
      if (!matchesKey && !matchesTag) return false;
      const age = Math.abs(currentMinutes - rec.simulatedMinutes);
      return age <= withinSimMinutes;
    });
  }

  /**
   * Counts recent failures or rejections for a behavior.
   */
  public getRecentFailureOrRejectionCount(
    behaviorId: string,
    withinSimMinutes: number,
    currentMinutes: number
  ): number {
    return this.records.filter((rec) => {
      if (rec.key !== behaviorId && rec.sourceBehaviorId !== behaviorId) return false;
      if (rec.outcome !== 'rejected' && rec.outcome !== 'failed') return false;
      const age = Math.abs(currentMinutes - rec.simulatedMinutes);
      return age <= withinSimMinutes;
    }).length;
  }

  /**
   * Gets the most recent record matching a category.
   */
  public getLatestByCategory(category: MemoryRecord['category']): MemoryRecord | null {
    for (let i = this.records.length - 1; i >= 0; i--) {
      if (this.records[i].category === category) {
        return this.records[i];
      }
    }
    return null;
  }

  /**
   * Gets the latest outcome recorded for a specific behavior ID.
   */
  public getLatestOutcomeForBehavior(behaviorId: string): MemoryRecord | null {
    for (let i = this.records.length - 1; i >= 0; i--) {
      const rec = this.records[i];
      if (rec.key === behaviorId || rec.sourceBehaviorId === behaviorId) {
        return rec;
      }
    }
    return null;
  }

  /**
   * Records a visited waypoint / spatial perch into short-term spatial memory.
   */
  public recordVisitedWaypoint(
    locationId: LocationId,
    waypoint: string,
    timestamp: string,
    simMinutes: number,
    dayNumber: number
  ): MemoryRecord {
    return this.record({
      timestamp,
      simulatedMinutes: simMinutes,
      dayNumber,
      category: 'location',
      eventType: 'visited_waypoint',
      key: waypoint,
      value: `Visited ${waypoint} at ${locationId}`,
      location: locationId,
      outcome: 'completed',
      tags: ['spatial', locationId, waypoint],
      salience: 0.6,
      expiresAtSimMinutes: simMinutes + 60, // 60 sim minutes short-term spatial memory
    });
  }

  /**
   * Retrieves unique waypoints visited within the specified time window.
   */
  public getRecentlyVisitedWaypoints(
    withinSimMinutes: number = 45,
    currentMinutes: number
  ): string[] {
    const waypoints: string[] = [];
    for (let i = this.records.length - 1; i >= 0; i--) {
      const rec = this.records[i];
      if (rec.category === 'location' && rec.eventType === 'visited_waypoint') {
        const age = Math.abs(currentMinutes - rec.simulatedMinutes);
        if (age <= withinSimMinutes && !waypoints.includes(rec.key)) {
          waypoints.push(rec.key);
        }
      }
    }
    return waypoints;
  }

  /**
   * Checks if a waypoint was visited recently.
   */
  public isWaypointRecentlyVisited(
    waypoint: string,
    withinSimMinutes: number = 45,
    currentMinutes: number
  ): boolean {
    return this.getRecentlyVisitedWaypoints(withinSimMinutes, currentMinutes).includes(waypoint);
  }

  /**
   * Records a food surface outcome into memory (e.g. depleted vs abundant).
   */
  public recordFoodSurfaceOutcome(
    surfaceId: string,
    outcome: 'depleted' | 'abundant' | 'consumed',
    timestamp: string,
    simMinutes: number,
    dayNumber: number,
    foodRemaining?: number
  ): MemoryRecord {
    return this.record({
      timestamp,
      simulatedMinutes: simMinutes,
      dayNumber,
      category: 'food_state',
      eventType: `food_${outcome}`,
      key: surfaceId,
      value: `Food surface ${surfaceId} is ${outcome} (remaining: ${foodRemaining ?? 0})`,
      location: 'dining',
      outcome: outcome === 'depleted' ? 'failed' : 'completed',
      tags: ['food', surfaceId, outcome],
      context: { foodRemaining: foodRemaining ?? 0 },
      salience: outcome === 'depleted' ? 0.85 : 0.7,
      expiresAtSimMinutes: simMinutes + 120, // 2-hour retention
    });
  }

  /**
   * Checks if a food surface is remembered as depleted.
   */
  public isFoodSurfaceRememberedDepleted(
    surfaceId: string,
    withinSimMinutes: number = 90,
    currentMinutes: number
  ): boolean {
    for (let i = this.records.length - 1; i >= 0; i--) {
      const rec = this.records[i];
      if (rec.category === 'food_state' && rec.key === surfaceId) {
        const age = Math.abs(currentMinutes - rec.simulatedMinutes);
        if (age <= withinSimMinutes) {
          return rec.eventType === 'food_depleted';
        }
      }
    }
    return false;
  }

  /**
   * Selects the preferred food surface among candidates, avoiding depleted ones.
   */
  public getPreferredFoodSurface(
    candidateSurfaceIds: string[],
    withinSimMinutes: number = 90,
    currentMinutes: number
  ): string | null {
    if (!candidateSurfaceIds || candidateSurfaceIds.length === 0) return null;
    const nonDepleted = candidateSurfaceIds.filter(
      (id) => !this.isFoodSurfaceRememberedDepleted(id, withinSimMinutes, currentMinutes)
    );
    return nonDepleted.length > 0 ? nonDepleted[0] : candidateSurfaceIds[0];
  }

  /**
   * Records an episodic memory of an environmental world event.
   */
  public recordWorldEvent(
    eventId: string,
    category: string,
    summary: string,
    locationId: LocationId | 'all',
    timestamp: string,
    simMinutes: number,
    dayNumber: number
  ): MemoryRecord {
    return this.record({
      timestamp,
      simulatedMinutes: simMinutes,
      dayNumber,
      category: 'world_event',
      eventType: eventId,
      key: eventId,
      value: summary,
      location: locationId === 'all' ? 'bedroom' : locationId,
      outcome: 'completed',
      tags: ['world_event', category, eventId],
      salience: 0.75,
      expiresAtSimMinutes: simMinutes + 90,
    });
  }

  /**
   * Gets recent world event memory records.
   */
  public getRecentWorldEvents(
    withinSimMinutes: number = 60,
    currentMinutes: number
  ): MemoryRecord[] {
    return this.records.filter((rec) => {
      if (rec.category !== 'world_event') return false;
      const age = Math.abs(currentMinutes - rec.simulatedMinutes);
      return age <= withinSimMinutes;
    });
  }

  /**
   * Prunes expired records based on retention policy.
   */
  public prune(currentMinutes: number): void {
    this.records = this.records.filter((rec) => {
      if (rec.expiresAtSimMinutes === undefined) return true;
      return rec.expiresAtSimMinutes >= currentMinutes;
    });
  }

  /**
   * Serialization support for persistence.
   */
  public serialize(): MemoryRecord[] {
    return this.records.map((r) => ({ ...r }));
  }

  /**
   * Deserialization support for persistence.
   */
  public deserialize(records: MemoryRecord[]): void {
    if (Array.isArray(records)) {
      this.records = records.slice(-this.maxCapacity);
    }
  }

  public clear(): void {
    this.records = [];
  }
}
