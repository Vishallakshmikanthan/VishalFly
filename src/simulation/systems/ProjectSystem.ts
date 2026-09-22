import { ProjectState, NeedState } from '../types/simulation';
import { EventLogger } from '../events/EventLogger';

export class ProjectSystem {
  private state: ProjectState;
  private eventLogger: EventLogger;
  private lastLoggedProgressMilestone: number = 0;

  constructor(eventLogger: EventLogger, initialProjectName: string = 'VishalFly') {
    this.eventLogger = eventLogger;
    this.state = {
      totalProgress: 15, // Initial baseline progress
      currentProject: initialProjectName,
      focus: 80,
      sessionProgress: 0,
      sessionElapsedSimMinutes: 0,
      completedSessions: 0,
      isWorking: false,
    };
    this.lastLoggedProgressMilestone = this.state.totalProgress;
  }

  public startSession(timestamp: string, dayNumber: number): void {
    this.state.isWorking = true;
    this.state.sessionProgress = 0;
    this.state.sessionElapsedSimMinutes = 0;

    this.eventLogger.log({
      timestamp,
      dayNumber,
      category: 'activity',
      message: `Project session started — ${this.state.currentProject}`,
      activityId: 'project_work',
      locationId: 'bedroom',
    });
  }

  public endSession(timestamp: string, dayNumber: number): void {
    if (this.state.isWorking) {
      this.state.isWorking = false;
      this.state.completedSessions += 1;

      this.eventLogger.log({
        timestamp,
        dayNumber,
        category: 'activity',
        message: `Project session completed (${this.state.currentProject}: ${Math.round(this.state.totalProgress)}% total progress).`,
        activityId: 'project_work',
        locationId: 'bedroom',
      });
    }
  }

  public update(
    deltaSimSeconds: number,
    needs: NeedState,
    timestamp: string,
    dayNumber: number
  ): ProjectState {
    if (!this.state.isWorking || deltaSimSeconds <= 0) {
      return this.state;
    }

    const simMinutes = deltaSimSeconds / 60;
    this.state.sessionElapsedSimMinutes += simMinutes;

    // Progression model:
    // Base rate: ~10% total project progress per 60 simulated minutes
    // Modulated by Focus (0-100, normal=70) and Energy/Fatigue
    const focusMultiplier = 0.5 + (needs.focus / 100) * 0.7; // 0.5 to 1.2
    const energyMultiplier = 0.6 + (needs.energy / 100) * 0.4; // 0.6 to 1.0
    const fatiguePenalty = Math.max(0.7, 1.0 - (needs.fatigue / 100) * 0.3); // 0.7 to 1.0

    const progressRatePerMinute = (10 / 60) * focusMultiplier * energyMultiplier * fatiguePenalty;
    const addedProgress = progressRatePerMinute * simMinutes;

    this.state.totalProgress = Math.min(100, this.state.totalProgress + addedProgress);
    this.state.sessionProgress += addedProgress;
    this.state.focus = needs.focus;

    // Log progress milestone every 5%
    if (this.state.totalProgress - this.lastLoggedProgressMilestone >= 5) {
      const milestone = Math.floor(this.state.totalProgress);
      this.lastLoggedProgressMilestone = milestone;
      this.eventLogger.log({
        timestamp,
        dayNumber,
        category: 'behavior',
        message: `Project ${this.state.currentProject} milestone reached: ${milestone}%.`,
        activityId: 'project_work',
        locationId: 'bedroom',
      });
    }

    return this.state;
  }

  public getState(): ProjectState {
    return this.state;
  }

  public setState(state: ProjectState): void {
    this.state = { ...state };
    this.lastLoggedProgressMilestone = Math.floor(this.state.totalProgress);
  }

  public setProjectName(name: string): void {
    this.state.currentProject = name;
  }
}
