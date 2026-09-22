import { MealDefinition, MealSession, MealType } from '../types/simulation';
import { EventLogger } from '../events/EventLogger';

export const MEAL_DEFINITIONS: Record<MealType, MealDefinition> = {
  breakfast: {
    type: 'breakfast',
    name: 'South Indian Breakfast',
    durationSimMinutes: 30,
    hungerReductionTotal: 55,
    energyGainTotal: 15,
    focusGainTotal: 5,
  },
  lunch: {
    type: 'lunch',
    name: 'Lunch Mess Meal',
    durationSimMinutes: 45,
    hungerReductionTotal: 65,
    energyGainTotal: 10,
    focusGainTotal: 2,
  },
  dinner: {
    type: 'dinner',
    name: 'Dinner Mess Meal',
    durationSimMinutes: 30,
    hungerReductionTotal: 60,
    energyGainTotal: 12,
    focusGainTotal: 0,
  },
  midnight_snack: {
    type: 'midnight_snack',
    name: 'Midnight Delivered Food',
    durationSimMinutes: 20,
    hungerReductionTotal: 50,
    energyGainTotal: 8,
    focusGainTotal: -2,
  },
};

export class MealSystem {
  private currentSession: MealSession | null = null;
  private eventLogger: EventLogger;

  constructor(eventLogger: EventLogger) {
    this.eventLogger = eventLogger;
  }

  public startMeal(mealType: MealType, timestamp: string, dayNumber: number): MealSession {
    const mealDef = MEAL_DEFINITIONS[mealType] || MEAL_DEFINITIONS.dinner;

    this.currentSession = {
      meal: mealDef,
      elapsedSimSeconds: 0,
      progressPercent: 0,
      isCompleted: false,
    };

    this.eventLogger.log({
      timestamp,
      dayNumber,
      category: 'activity',
      message: `${mealDef.name} started.`,
      activityId: mealType === 'lunch' ? 'lunch' : 'dinner',
      locationId: 'dining',
    });

    return this.currentSession;
  }

  public update(
    deltaSimSeconds: number,
    timestamp: string,
    dayNumber: number
  ): { session: MealSession | null; hungerDelta: number; energyDelta: number } {
    if (!this.currentSession || this.currentSession.isCompleted || deltaSimSeconds <= 0) {
      return { session: this.currentSession, hungerDelta: 0, energyDelta: 0 };
    }

    const session = this.currentSession;
    session.elapsedSimSeconds += deltaSimSeconds;

    const totalDurationSec = session.meal.durationSimMinutes * 60;
    const progress = Math.min(1.0, session.elapsedSimSeconds / totalDurationSec);
    session.progressPercent = Math.min(100, Math.round(progress * 100));

    // Calculate rates proportional to elapsed time
    const portionFraction = deltaSimSeconds / totalDurationSec;
    const hungerDelta = -session.meal.hungerReductionTotal * portionFraction;
    const energyDelta = session.meal.energyGainTotal * portionFraction;

    if (session.elapsedSimSeconds >= totalDurationSec && !session.isCompleted) {
      session.isCompleted = true;
      session.progressPercent = 100;

      this.eventLogger.log({
        timestamp,
        dayNumber,
        category: 'activity',
        message: `${session.meal.name} completed.`,
        activityId: session.meal.type === 'lunch' ? 'lunch' : 'dinner',
        locationId: 'dining',
      });
    }

    return { session, hungerDelta, energyDelta };
  }

  public getCurrentSession(): MealSession | null {
    return this.currentSession;
  }

  public reset(): void {
    this.currentSession = null;
  }

  public setSession(session: MealSession | null): void {
    this.currentSession = session;
  }
}
