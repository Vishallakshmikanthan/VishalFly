import { MemoryRecord } from '../types/cognition';

export class CognitiveMemory {
  private records: MemoryRecord[] = [];
  private maxCapacity: number;
  private retentionDurationSimMinutes: number;

  constructor(
    maxCapacity: number = 50,
    retentionDurationSimMinutes: number = 180
  ) {
    this.maxCapacity = Math.max(5, maxCapacity);
    this.retentionDurationSimMinutes = Math.max(10, retentionDurationSimMinutes);
  }

  /**
   * Records a memory entry with deterministic bounded ring buffer insertion.
   */
  public record(entry: Omit<MemoryRecord, 'id'>): MemoryRecord {
    const recordWithId: MemoryRecord = {
      ...entry,
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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
      // Handle day boundary or standard time progression
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
   * Used by behavior integration to apply repetition penalties (e.g. distraction loop prevention).
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
