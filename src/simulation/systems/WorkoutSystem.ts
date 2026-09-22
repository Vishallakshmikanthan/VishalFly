import { 
  DayOfWeek, 
  WorkoutPlan, 
  WorkoutSession 
} from '../types/simulation';
import workoutConfig from '../config/workout.json';
import { EventLogger } from '../events/EventLogger';

export class WorkoutSystem {
  private currentSession: WorkoutSession | null = null;
  private eventLogger: EventLogger;
  private weeklyRotation: Record<string, string>;
  private plans: Record<string, WorkoutPlan>;
  private restLogged: boolean = false;

  constructor(eventLogger: EventLogger) {
    this.eventLogger = eventLogger;
    this.weeklyRotation = workoutConfig.weeklyRotation;
    this.plans = workoutConfig.plans as Record<string, WorkoutPlan>;
  }

  public getWorkoutForDay(dayOfWeek: DayOfWeek): string {
    return this.weeklyRotation[dayOfWeek] || 'push';
  }

  public getPlanForDay(dayOfWeek: DayOfWeek): WorkoutPlan | null {
    const workoutType = this.weeklyRotation[dayOfWeek] || 'push';
    if (workoutType === 'rest') return null;
    return this.plans[workoutType] || this.plans.push;
  }

  public startWorkout(planOrDay: WorkoutPlan | DayOfWeek, timestamp: string, dayNumber: number): WorkoutSession {
    let plan: WorkoutPlan;
    if (typeof planOrDay === 'string') {
      const p = this.getPlanForDay(planOrDay);
      plan = p || this.plans.push;
    } else {
      plan = planOrDay;
    }

    this.currentSession = {
      plan,
      currentExerciseIndex: 0,
      currentSet: 1,
      currentReps: 0,
      state: 'ARRIVE',
      stateElapsedSimSeconds: 0,
      restRemainingSimSeconds: 0,
      progressPercent: 0,
      isCompleted: false,
    };

    this.restLogged = false;

    this.eventLogger.log({
      timestamp,
      dayNumber,
      category: 'activity',
      message: `Gym session started — ${plan.name}`,
      activityId: 'gym_workout',
      locationId: 'gym',
    });

    return this.currentSession;
  }

  public update(
    deltaSimSeconds: number,
    timestamp: string,
    dayNumber: number
  ): WorkoutSession | null {
    if (!this.currentSession || this.currentSession.isCompleted || deltaSimSeconds <= 0) {
      return this.currentSession;
    }

    const session = this.currentSession;
    const currentEx = session.plan.exercises[session.currentExerciseIndex];
    if (!currentEx) {
      session.isCompleted = true;
      session.state = 'COMPLETE';
      session.progressPercent = 100;
      return session;
    }

    session.stateElapsedSimSeconds += deltaSimSeconds;

    switch (session.state) {
      case 'ARRIVE':
        if (session.stateElapsedSimSeconds >= 5) {
          session.state = 'WARMUP';
          session.stateElapsedSimSeconds = 0;
          this.eventLogger.log({
            timestamp,
            dayNumber,
            category: 'behavior',
            message: 'Gym warmup & dynamic stretching started.',
            locationId: 'gym',
          });
        }
        break;

      case 'WARMUP':
        if (session.stateElapsedSimSeconds >= 10) {
          session.state = 'SELECT_EXERCISE';
          session.stateElapsedSimSeconds = 0;
        }
        break;

      case 'SELECT_EXERCISE':
        session.state = 'SETUP';
        session.stateElapsedSimSeconds = 0;
        this.eventLogger.log({
          timestamp,
          dayNumber,
          category: 'behavior',
          message: `Setting up equipment for ${currentEx.name}.`,
          locationId: 'gym',
        });
        break;

      case 'SETUP':
        if (session.stateElapsedSimSeconds >= 5) {
          session.state = 'LIFT';
          session.stateElapsedSimSeconds = 0;
          session.currentReps = 0;
        }
        break;

      case 'LIFT': {
        // Calculate simulated reps: approx 2.5 sim seconds per rep
        const repDuration = 2.5;
        const totalRepsDone = Math.min(
          currentEx.reps,
          Math.floor(session.stateElapsedSimSeconds / repDuration)
        );
        session.currentReps = totalRepsDone;

        if (session.stateElapsedSimSeconds >= currentEx.reps * repDuration) {
          session.currentReps = currentEx.reps;
          this.eventLogger.log({
            timestamp,
            dayNumber,
            category: 'activity',
            message: `${currentEx.name} — Set ${session.currentSet} completed.`,
            locationId: 'gym',
          });

          // Check if more sets remain for this exercise
          if (session.currentSet < currentEx.sets) {
            session.state = 'REST';
            session.stateElapsedSimSeconds = 0;
            session.restRemainingSimSeconds = currentEx.restDurationSeconds;
            this.restLogged = false;
          } else {
            // Exercise complete
            if (session.currentExerciseIndex + 1 < session.plan.exercises.length) {
              session.state = 'REST';
              session.stateElapsedSimSeconds = 0;
              session.restRemainingSimSeconds = 30; // transition rest
              this.restLogged = false;
            } else {
              // Workout complete!
              session.state = 'COMPLETE';
              session.isCompleted = true;
              session.progressPercent = 100;
              this.eventLogger.log({
                timestamp,
                dayNumber,
                category: 'activity',
                message: `Workout completed — ${session.plan.name}`,
                locationId: 'gym',
              });
            }
          }
        }
        break;
      }

      case 'REST':
        if (!this.restLogged) {
          this.eventLogger.log({
            timestamp,
            dayNumber,
            category: 'behavior',
            message: 'Rest period started.',
            locationId: 'gym',
          });
          this.restLogged = true;
        }

        session.restRemainingSimSeconds = Math.max(
          0,
          session.restRemainingSimSeconds - deltaSimSeconds
        );

        if (session.restRemainingSimSeconds <= 0) {
          this.eventLogger.log({
            timestamp,
            dayNumber,
            category: 'behavior',
            message: 'Rest period completed.',
            locationId: 'gym',
          });

          if (session.currentSet < currentEx.sets) {
            session.currentSet += 1;
            session.currentReps = 0;
            session.state = 'LIFT';
            session.stateElapsedSimSeconds = 0;
          } else {
            session.currentExerciseIndex += 1;
            session.currentSet = 1;
            session.currentReps = 0;
            session.state = 'SETUP';
            session.stateElapsedSimSeconds = 0;
          }
        }
        break;

      case 'NEXT_SET':
        session.currentSet += 1;
        session.currentReps = 0;
        session.state = 'LIFT';
        session.stateElapsedSimSeconds = 0;
        break;

      case 'NEXT_EXERCISE':
        session.currentExerciseIndex += 1;
        session.currentSet = 1;
        session.currentReps = 0;
        session.state = 'SETUP';
        session.stateElapsedSimSeconds = 0;
        break;

      case 'COMPLETE':
        session.progressPercent = 100;
        session.isCompleted = true;
        break;
    }

    // Calculate overall progress across all sets of all exercises
    this.updateProgressPercent();

    return session;
  }

  private updateProgressPercent(): void {
    if (!this.currentSession) return;
    const session = this.currentSession;
    if (session.isCompleted) {
      session.progressPercent = 100;
      return;
    }

    let totalSetsAll = 0;
    let completedSetsAll = 0;

    session.plan.exercises.forEach((ex, idx) => {
      totalSetsAll += ex.sets;
      if (idx < session.currentExerciseIndex) {
        completedSetsAll += ex.sets;
      } else if (idx === session.currentExerciseIndex) {
        completedSetsAll += Math.max(0, session.currentSet - 1);
        if (session.state === 'LIFT') {
          completedSetsAll += session.currentReps / (ex.reps || 1);
        }
      }
    });

    session.progressPercent = totalSetsAll > 0 
      ? Math.min(100, Math.round((completedSetsAll / totalSetsAll) * 100)) 
      : 0;
  }

  public getCurrentSession(): WorkoutSession | null {
    return this.currentSession;
  }

  public getCurrentWaypoint(): string {
    if (!this.currentSession) return 'entrance';
    const session = this.currentSession;
    if (session.state === 'ARRIVE' || session.state === 'WARMUP') return 'warmup_zone';
    if (session.state === 'REST') return 'rest_bench';
    const ex = session.plan.exercises[session.currentExerciseIndex];
    return ex?.equipmentWaypoint || 'bench_press';
  }

  public getCurrentFlyActivity(): 'workout' | 'resting' | 'walking' | 'flying' {
    if (!this.currentSession) return 'flying';
    if (this.currentSession.state === 'LIFT') return 'workout';
    if (this.currentSession.state === 'REST') return 'resting';
    return 'walking';
  }

  public getCurrentActionLabel(): string {
    if (!this.currentSession) return 'Idle';
    const s = this.currentSession;
    const ex = s.plan.exercises[s.currentExerciseIndex];
    if (s.isCompleted) return 'Workout Finished';
    if (s.state === 'WARMUP') return 'Warmup & Mobility';
    if (s.state === 'ARRIVE') return 'Entering Gym';
    if (s.state === 'SETUP') return `Preparing ${ex ? ex.name : 'Station'}`;
    if (s.state === 'REST') return `Resting (${Math.ceil(s.restRemainingSimSeconds)}s)`;
    if (s.state === 'LIFT') return `${ex ? ex.name : 'Exercise'} — Set ${s.currentSet}/${ex ? ex.sets : 3} (${s.currentReps} Reps)`;
    return 'Workout in Progress';
  }

  public reset(): void {
    this.currentSession = null;
    this.restLogged = false;
  }

  public setSession(session: WorkoutSession | null): void {
    this.currentSession = session;
  }
}
