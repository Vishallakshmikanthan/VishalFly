import { ScheduleEntry, DayType } from '../types/simulation';
import scheduleConfig from '../config/schedule.json';
import { FALLBACK_SCHEDULE_ENTRY } from '../config/defaults';

export interface ScheduleValidationResult {
  valid: boolean;
  errors: string[];
}

export interface NextActivityInfo {
  timeMinutes: number;
  timeString: string;
  entry: ScheduleEntry;
}

export class SchedulePlanner {
  private weekdaySchedule: ScheduleEntry[];
  private weekendSchedule: ScheduleEntry[];

  constructor(customWeekday?: ScheduleEntry[], customWeekend?: ScheduleEntry[]) {
    this.weekdaySchedule = customWeekday || (scheduleConfig.weekday as ScheduleEntry[]);
    this.weekendSchedule = customWeekend || (scheduleConfig.weekend as ScheduleEntry[]);
  }

  public getCurrentSchedule(dayType: DayType): ScheduleEntry[] {
    return dayType === 'weekend' ? [...this.weekendSchedule] : [...this.weekdaySchedule];
  }

  public setSchedule(dayType: DayType, entries: ScheduleEntry[]): void {
    if (dayType === 'weekend') {
      this.weekendSchedule = [...entries];
    } else {
      this.weekdaySchedule = [...entries];
    }
  }

  /**
   * Find the active schedule entry for a given time in minutes (0 - 1439).
   */
  public getActiveEntry(timeMinutes: number, dayType: DayType): ScheduleEntry {
    const schedule = this.getCurrentSchedule(dayType);
    const minute = ((Math.floor(timeMinutes) % 1440) + 1440) % 1440;

    for (const entry of schedule) {
      if (entry.startMinutes <= entry.endMinutes) {
        // Normal daytime entry, e.g. 08:00 - 16:00
        if (minute >= entry.startMinutes && minute < entry.endMinutes) {
          return entry;
        }
      } else {
        // Overnight entry spanning midnight, e.g. 23:15 - 06:00
        if (minute >= entry.startMinutes || minute < entry.endMinutes) {
          return entry;
        }
      }
    }

    // If no entry found (gap in schedule), use configured fallback
    return {
      ...FALLBACK_SCHEDULE_ENTRY,
      startMinutes: minute,
      endMinutes: (minute + 60) % 1440,
    };
  }

  /**
   * Returns the next schedule entry following the current active entry.
   */
  public getNextEntry(timeMinutes: number, dayType: DayType): ScheduleEntry {
    const currentEntry = this.getActiveEntry(timeMinutes, dayType);
    const schedule = this.getCurrentSchedule(dayType);

    // If current is fallback, find the first entry starting after timeMinutes
    if (currentEntry.isFallback) {
      const futureEntries = schedule
        .filter((e) => e.startMinutes > timeMinutes)
        .sort((a, b) => a.startMinutes - b.startMinutes);

      if (futureEntries.length > 0) {
        return futureEntries[0];
      }
      return schedule[0]; // wraps around to earliest entry of day
    }

    // Find the entry that starts at or right after the current entry's end time
    const targetStart = currentEntry.endMinutes;
    const directNext = schedule.find((e) => e.startMinutes === targetStart);
    if (directNext) {
      return directNext;
    }

    // Otherwise find the first entry whose startMinutes > targetStart
    const sorted = [...schedule].sort((a, b) => a.startMinutes - b.startMinutes);
    const nextInOrder = sorted.find((e) => e.startMinutes >= targetStart && e.id !== currentEntry.id);
    if (nextInOrder) {
      return nextInOrder;
    }

    // Wrap around to first entry of schedule
    return sorted[0];
  }

  /**
   * Retrieves the start time and entry of the next activity transition.
   */
  public getNextActivityStart(timeMinutes: number, dayType: DayType): NextActivityInfo {
    const nextEntry = this.getNextEntry(timeMinutes, dayType);

    const startMinutes = nextEntry.startMinutes;
    const hours = Math.floor(startMinutes / 60);
    const mins = startMinutes % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

    return {
      timeMinutes: startMinutes,
      timeString,
      entry: nextEntry,
    };
  }

  /**
   * Validates a schedule list for time bounds, overlaps, and negative ranges.
   */
  public validateSchedule(entries: ScheduleEntry[]): ScheduleValidationResult {
    const errors: string[] = [];

    if (!entries || entries.length === 0) {
      return { valid: false, errors: ['Schedule contains no entries.'] };
    }

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      if (!entry.id || !entry.name || !entry.locationId) {
        errors.push(`Entry index ${i} is missing required fields (id, name, locationId).`);
      }

      if (entry.startMinutes < 0 || entry.startMinutes >= 1440) {
        errors.push(`Entry "${entry.id}" has invalid startMinutes (${entry.startMinutes}). Must be 0-1439.`);
      }

      if (entry.endMinutes < 0 || entry.endMinutes >= 1440) {
        errors.push(`Entry "${entry.id}" has invalid endMinutes (${entry.endMinutes}). Must be 0-1439.`);
      }

      if (entry.startMinutes === entry.endMinutes) {
        errors.push(`Entry "${entry.id}" has zero duration (startMinutes === endMinutes: ${entry.startMinutes}).`);
      }
    }

    // Check for overlaps among daytime entries
    const nonOvernight = entries.filter((e) => e.startMinutes < e.endMinutes);
    const sorted = [...nonOvernight].sort((a, b) => a.startMinutes - b.startMinutes);

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      if (current.endMinutes > next.startMinutes) {
        errors.push(
          `Overlapping schedule entries: "${current.id}" (${current.startTime}-${current.endTime}) overlaps with "${next.id}" (${next.startTime}-${next.endTime}).`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
