import { 
  SimulationClockState, 
  SimulationSpeed, 
  DayOfWeek, 
  SimulationSettings 
} from '../types/simulation';
import { DAYS_OF_WEEK, DEFAULT_SIMULATION_SETTINGS } from '../config/defaults';

export interface ClockTickResult {
  simulatedDeltaSeconds: number;
  dayRolledOver: boolean;
  minuteChanged: boolean;
  previousTime: string;
  currentTime: string;
}

export class SimulationClock {
  private settings: SimulationSettings;
  private state: SimulationClockState;
  private previousFormattedMinute: string;

  constructor(customSettings?: Partial<SimulationSettings>) {
    this.settings = { ...DEFAULT_SIMULATION_SETTINGS, ...customSettings };
    
    const initialMinutes = this.parseTimeToMinutes(this.settings.startingTime);
    const initialSeconds = initialMinutes * 60;
    const initialDayOfWeek = this.settings.startingDayOfWeek;
    const initialDayType = this.isWeekendDay(initialDayOfWeek) ? 'weekend' : 'weekday';

    this.state = {
      simulatedTime: this.formatMinutesToHHMM(initialMinutes),
      simulatedSeconds: initialSeconds,
      currentMinutes: initialMinutes,
      dayNumber: this.settings.startingDay,
      dayOfWeek: initialDayOfWeek,
      dayType: initialDayType,
      speed: 1,
      isPaused: false,
      totalElapsedSimulatedSeconds: 0,
      totalElapsedRealSeconds: 0,
    };

    this.previousFormattedMinute = this.state.simulatedTime;
  }

  public parseTimeToMinutes(timeStr: string): number {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return (hours * 60 + minutes) % 1440;
  }

  public formatMinutesToHHMM(totalMinutes: number): string {
    const clamped = Math.floor(totalMinutes) % 1440;
    const hours = Math.floor(clamped / 60);
    const mins = clamped % 60;
    const hh = hours.toString().padStart(2, '0');
    const mm = mins.toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  public isWeekendDay(day: DayOfWeek): boolean {
    return this.settings.weekendDays.includes(day);
  }

  public tick(deltaRealSeconds: number): ClockTickResult {
    const clampedRealDt = Math.max(0, deltaRealSeconds);
    this.state.totalElapsedRealSeconds += clampedRealDt;

    if (this.state.isPaused || clampedRealDt <= 0) {
      return {
        simulatedDeltaSeconds: 0,
        dayRolledOver: false,
        minuteChanged: false,
        previousTime: this.state.simulatedTime,
        currentTime: this.state.simulatedTime,
      };
    }

    const previousTime = this.state.simulatedTime;
    const simulatedDeltaSeconds = 
      clampedRealDt * this.settings.simulatedSecondsPerRealSecond * this.state.speed;

    this.state.totalElapsedSimulatedSeconds += simulatedDeltaSeconds;
    this.state.simulatedSeconds += simulatedDeltaSeconds;

    let dayRolledOver = false;

    // Handle midnight rollover (86,400 seconds = 24 hours)
    while (this.state.simulatedSeconds >= 86400) {
      this.state.simulatedSeconds -= 86400;
      this.state.dayNumber += 1;
      dayRolledOver = true;

      // Advance day of week
      const currentDayIndex = DAYS_OF_WEEK.indexOf(this.state.dayOfWeek);
      const nextDayIndex = (currentDayIndex + 1) % DAYS_OF_WEEK.length;
      this.state.dayOfWeek = DAYS_OF_WEEK[nextDayIndex];
      this.state.dayType = this.isWeekendDay(this.state.dayOfWeek) ? 'weekend' : 'weekday';
    }

    this.state.currentMinutes = Math.floor(this.state.simulatedSeconds / 60);
    this.state.simulatedTime = this.formatMinutesToHHMM(this.state.currentMinutes);

    const minuteChanged = this.state.simulatedTime !== this.previousFormattedMinute;
    if (minuteChanged) {
      this.previousFormattedMinute = this.state.simulatedTime;
    }

    return {
      simulatedDeltaSeconds,
      dayRolledOver,
      minuteChanged,
      previousTime,
      currentTime: this.state.simulatedTime,
    };
  }

  public pause(): void {
    this.state.isPaused = true;
  }

  public resume(): void {
    this.state.isPaused = false;
  }

  public togglePause(): boolean {
    this.state.isPaused = !this.state.isPaused;
    return this.state.isPaused;
  }

  public setSpeed(speed: SimulationSpeed): void {
    if ([1, 2, 4, 8].includes(speed)) {
      this.state.speed = speed;
    }
  }

  public setTime(timeStr: string): void {
    const mins = this.parseTimeToMinutes(timeStr);
    this.state.simulatedSeconds = mins * 60;
    this.state.currentMinutes = mins;
    this.state.simulatedTime = this.formatMinutesToHHMM(mins);
    this.previousFormattedMinute = this.state.simulatedTime;
  }

  public restartDay(targetTime?: string): void {
    const restartTime = targetTime || this.settings.startingTime;
    const mins = this.parseTimeToMinutes(restartTime);
    this.state.simulatedSeconds = mins * 60;
    this.state.currentMinutes = mins;
    this.state.simulatedTime = this.formatMinutesToHHMM(mins);
    this.previousFormattedMinute = this.state.simulatedTime;
  }

  public getState(): SimulationClockState {
    return { ...this.state };
  }

  public getSettings(): SimulationSettings {
    return { ...this.settings };
  }

  public setSettings(newSettings: Partial<SimulationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }
}
