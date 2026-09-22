import { SimulationEvent } from '../types/simulation';

export type EventListener = (event: SimulationEvent) => void;

export class EventLogger {
  private events: SimulationEvent[] = [];
  private maxEvents: number;
  private lastLogKey: string = '';
  private counter: number = 0;
  private listeners: Set<EventListener> = new Set();

  constructor(maxEvents: number = 100) {
    this.maxEvents = maxEvents;
  }

  public setMaxEvents(max: number): void {
    this.maxEvents = Math.max(1, max);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  /**
   * Logs an event with duplicate suppression.
   */
  public log(eventData: Omit<SimulationEvent, 'id'>): SimulationEvent | null {
    const key = `${eventData.category}_${eventData.message}_${eventData.timestamp}`;
    if (key === this.lastLogKey) {
      return null; // Suppress exact immediate duplicate
    }
    this.lastLogKey = key;

    this.counter += 1;
    const event: SimulationEvent = {
      ...eventData,
      id: `evt_${Date.now()}_${this.counter}`,
    };

    this.events.push(event);

    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Notify listeners
    this.listeners.forEach((listener) => listener(event));

    return event;
  }

  public getRecent(limit: number = 20): SimulationEvent[] {
    return this.events.slice(-Math.min(limit, this.events.length)).reverse();
  }

  public getAll(): SimulationEvent[] {
    return [...this.events];
  }

  public subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public clear(): void {
    this.events = [];
    this.lastLogKey = '';
  }
}
