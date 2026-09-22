import { AssignmentState, NeedState } from '../types/simulation';
import { EventLogger } from '../events/EventLogger';

export class AssignmentSystem {
  private state: AssignmentState;
  private eventLogger: EventLogger;

  constructor(eventLogger: EventLogger) {
    this.eventLogger = eventLogger;
    this.state = {
      progress: 30,
      currentTask: 'Distributed Systems Lab #3',
      completedTasks: 4,
      isWorking: false,
    };
  }

  public startSession(timestamp: string, dayNumber: number): void {
    this.state.isWorking = true;

    this.eventLogger.log({
      timestamp,
      dayNumber,
      category: 'activity',
      message: `Started academic work: ${this.state.currentTask}`,
      activityId: 'college_assignments',
      locationId: 'bedroom',
    });
  }

  public endSession(timestamp: string, dayNumber: number): void {
    if (this.state.isWorking) {
      this.state.isWorking = false;

      this.eventLogger.log({
        timestamp,
        dayNumber,
        category: 'activity',
        message: `College assignment session concluded (${Math.round(this.state.progress)}% completed).`,
        activityId: 'college_assignments',
        locationId: 'bedroom',
      });
    }
  }

  public update(
    deltaSimSeconds: number,
    needs: NeedState,
    timestamp: string,
    dayNumber: number
  ): AssignmentState {
    if (!this.state.isWorking || deltaSimSeconds <= 0) {
      return this.state;
    }

    const simMinutes = deltaSimSeconds / 60;
    // Base rate: ~35% completion per 30 minutes of assignment work
    const focusFactor = 0.6 + (needs.focus / 100) * 0.5;
    const progressInc = (35 / 30) * focusFactor * simMinutes;

    this.state.progress += progressInc;

    if (this.state.progress >= 100) {
      this.state.progress = 0;
      this.state.completedTasks += 1;
      const tasks = [
        'Cloud Computing Term Paper',
        'Database Optimization Worksheet',
        'Microservices Security Report',
        'Compiler Design Syntax Tree Lab',
      ];
      this.state.currentTask = tasks[this.state.completedTasks % tasks.length];

      this.eventLogger.log({
        timestamp,
        dayNumber,
        category: 'activity',
        message: `Completed assignment task! New task assigned: ${this.state.currentTask}`,
        activityId: 'college_assignments',
        locationId: 'bedroom',
      });
    }

    return this.state;
  }

  public getState(): AssignmentState {
    return this.state;
  }

  public setState(state: AssignmentState): void {
    this.state = { ...state };
  }
}
