import { SimulationSnapshot } from './ReplayTypes';

export class SnapshotRecorder {
  private snapshots: SimulationSnapshot[] = [];
  private maxSnapshots: number;
  private lastRecordedSimSeconds: number = -1;
  private minIntervalSimSeconds: number;
  private nextIndex: number = 0;

  constructor(maxSnapshots: number = 500, minIntervalSimSeconds: number = 180) {
    this.maxSnapshots = maxSnapshots;
    this.minIntervalSimSeconds = minIntervalSimSeconds;
  }

  public shouldRecord(
    simulatedSeconds: number, 
    forceMilestone: boolean = false
  ): boolean {
    if (forceMilestone) return true;
    if (this.lastRecordedSimSeconds < 0) return true;
    const diff = Math.abs(simulatedSeconds - this.lastRecordedSimSeconds);
    return diff >= this.minIntervalSimSeconds;
  }

  public record(
    snapshotData: Omit<SimulationSnapshot, 'id' | 'index'>,
    forceMilestone: boolean = false
  ): SimulationSnapshot | null {
    if (!this.shouldRecord(snapshotData.simulatedSeconds, forceMilestone)) {
      return null;
    }

    const snapshot: SimulationSnapshot = {
      ...snapshotData,
      id: `snap_${Date.now()}_${this.nextIndex}`,
      index: this.nextIndex++,
    };

    this.snapshots.push(snapshot);
    this.lastRecordedSimSeconds = snapshotData.simulatedSeconds;

    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  public getSnapshots(): SimulationSnapshot[] {
    return [...this.snapshots];
  }

  public getSnapshotByIndex(index: number): SimulationSnapshot | null {
    if (index < 0 || index >= this.snapshots.length) return null;
    return this.snapshots[index] || null;
  }

  public getLatest(): SimulationSnapshot | null {
    if (this.snapshots.length === 0) return null;
    return this.snapshots[this.snapshots.length - 1];
  }

  public getEarliest(): SimulationSnapshot | null {
    if (this.snapshots.length === 0) return null;
    return this.snapshots[0];
  }

  public findClosestTo(simulatedSeconds: number, dayNumber?: number): SimulationSnapshot | null {
    if (this.snapshots.length === 0) return null;

    let closest = this.snapshots[0];
    let minDiff = Infinity;

    for (const snap of this.snapshots) {
      if (dayNumber !== undefined && snap.dayNumber !== dayNumber) {
        continue;
      }
      const diff = Math.abs(snap.simulatedSeconds - simulatedSeconds);
      if (diff < minDiff) {
        minDiff = diff;
        closest = snap;
      }
    }

    return closest;
  }

  public count(): number {
    return this.snapshots.length;
  }

  public clear(): void {
    this.snapshots = [];
    this.lastRecordedSimSeconds = -1;
    this.nextIndex = 0;
  }
}
