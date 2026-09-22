import { SnapshotRecorder } from './SnapshotRecorder';
import { ReplayPlaybackState, ReplaySpeed, SimulationSnapshot } from './ReplayTypes';

export type ReplayStateListener = (state: ReplayPlaybackState) => void;

export class ReplayEngine {
  private recorder: SnapshotRecorder;
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private playbackSpeed: ReplaySpeed = 1;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<ReplayStateListener> = new Set();

  constructor(recorder: SnapshotRecorder) {
    this.recorder = recorder;
  }

  public getPlaybackState(): ReplayPlaybackState {
    const snapshots = this.recorder.getSnapshots();
    const total = snapshots.length;
    const safeIndex = total > 0 ? Math.max(0, Math.min(this.currentIndex, total - 1)) : 0;
    const activeSnapshot = total > 0 ? snapshots[safeIndex] : null;

    return {
      isPlaying: this.isPlaying,
      playbackSpeed: this.playbackSpeed,
      currentIndex: safeIndex,
      totalSnapshots: total,
      activeSnapshot,
    };
  }

  public startReplay(initialIndex?: number): SimulationSnapshot | null {
    const total = this.recorder.count();
    if (total === 0) return null;

    this.currentIndex = initialIndex !== undefined 
      ? Math.max(0, Math.min(initialIndex, total - 1))
      : 0;

    this.notify();
    return this.recorder.getSnapshotByIndex(this.currentIndex);
  }

  public stopReplay(): void {
    this.pause();
    this.currentIndex = 0;
    this.notify();
  }

  public play(): void {
    if (this.isPlaying) return;
    const total = this.recorder.count();
    if (total <= 1) return;

    // If at the end, wrap to beginning
    if (this.currentIndex >= total - 1) {
      this.currentIndex = 0;
    }

    this.isPlaying = true;
    this.startPlaybackTimer();
    this.notify();
  }

  public pause(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.stopPlaybackTimer();
    this.notify();
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  public setSpeed(speed: ReplaySpeed): void {
    this.playbackSpeed = speed;
    if (this.isPlaying) {
      this.stopPlaybackTimer();
      this.startPlaybackTimer();
    }
    this.notify();
  }

  public scrubTo(index: number): SimulationSnapshot | null {
    const total = this.recorder.count();
    if (total === 0) return null;

    this.currentIndex = Math.max(0, Math.min(index, total - 1));
    this.notify();
    return this.recorder.getSnapshotByIndex(this.currentIndex);
  }

  public stepForward(): SimulationSnapshot | null {
    const total = this.recorder.count();
    if (total === 0) return null;

    if (this.currentIndex < total - 1) {
      this.currentIndex++;
    } else if (this.isPlaying) {
      this.pause();
    }
    this.notify();
    return this.recorder.getSnapshotByIndex(this.currentIndex);
  }

  public stepBackward(): SimulationSnapshot | null {
    const total = this.recorder.count();
    if (total === 0) return null;

    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
    this.notify();
    return this.recorder.getSnapshotByIndex(this.currentIndex);
  }

  public jumpToStart(): SimulationSnapshot | null {
    return this.scrubTo(0);
  }

  public jumpToEnd(): SimulationSnapshot | null {
    const total = this.recorder.count();
    return this.scrubTo(total - 1);
  }

  public jumpToTimestamp(timestamp: string): SimulationSnapshot | null {
    const snapshots = this.recorder.getSnapshots();
    const idx = snapshots.findIndex((s) => s.timestamp.includes(timestamp) || timestamp.includes(s.timestamp));
    if (idx !== -1) {
      return this.scrubTo(idx);
    }
    return null;
  }

  private startPlaybackTimer(): void {
    this.stopPlaybackTimer();
    // Base step interval: 600ms per snapshot step, divided by speed
    const intervalMs = Math.max(100, Math.floor(600 / this.playbackSpeed));

    this.timerId = setInterval(() => {
      const total = this.recorder.count();
      if (this.currentIndex < total - 1) {
        this.currentIndex++;
        this.notify();
      } else {
        this.pause();
      }
    }, intervalMs);
  }

  private stopPlaybackTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public subscribe(listener: ReplayStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const state = this.getPlaybackState();
    this.listeners.forEach((listener) => listener(state));
  }
}
