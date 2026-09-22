import { ActivityDefinition } from '../types/simulation';

export const ACTIVITY_DEFINITIONS: Record<string, ActivityDefinition> = {
  wake_up_morning_routine: {
    id: 'wake_up_morning_routine',
    displayName: 'Morning Wakeup Routine',
    requiredLocation: 'bedroom',
    defaultFlyActivity: 'hovering',
    targetLandmarkName: 'Hovering over Bed & Orange Blanket',
    needsModifiers: {
      energyPerHour: 4,
      hungerPerHour: 6,
      sleepinessPerHour: -8,
      fatiguePerHour: -4,
      focusPerHour: 10,
      socialNeedPerHour: 1,
    },
  },

  morning_preparation: {
    id: 'morning_preparation',
    displayName: 'Morning Preparation',
    requiredLocation: 'bedroom',
    defaultFlyActivity: 'perched_on_desk',
    targetLandmarkName: 'Near Study Desk & Laptop',
    needsModifiers: {
      energyPerHour: -2,
      hungerPerHour: 8,
      sleepinessPerHour: -2,
      fatiguePerHour: 2,
      focusPerHour: 6,
      socialNeedPerHour: 2,
    },
  },

  travel_to_college: {
    id: 'travel_to_college',
    displayName: 'Commute to College',
    requiredLocation: 'travel',
    defaultFlyActivity: 'flying',
    targetLandmarkName: 'Transit Corridor',
    needsModifiers: {
      energyPerHour: -4,
      hungerPerHour: 6,
      sleepinessPerHour: 4,
      fatiguePerHour: 4,
      focusPerHour: -4,
      socialNeedPerHour: 4,
    },
  },

  college_activities: {
    id: 'college_activities',
    displayName: 'College Lecture & Campus',
    requiredLocation: 'classroom',
    defaultFlyActivity: 'perched_on_desk',
    targetLandmarkName: 'Front Row Student Desks',
    needsModifiers: {
      energyPerHour: -5,
      hungerPerHour: 7,
      sleepinessPerHour: 8,
      fatiguePerHour: 3,
      focusPerHour: 14,
      socialNeedPerHour: 8,
    },
  },

  return_to_pg: {
    id: 'return_to_pg',
    displayName: 'Return Commute to PG',
    requiredLocation: 'travel',
    defaultFlyActivity: 'flying',
    targetLandmarkName: 'Transit Corridor',
    needsModifiers: {
      energyPerHour: -4,
      hungerPerHour: 8,
      sleepinessPerHour: 5,
      fatiguePerHour: 5,
      focusPerHour: -5,
      socialNeedPerHour: 2,
    },
  },

  freshen_up: {
    id: 'freshen_up',
    displayName: 'Freshen Up & Reset',
    requiredLocation: 'bedroom',
    defaultFlyActivity: 'hovering',
    targetLandmarkName: 'Near Bedroom Entrance',
    needsModifiers: {
      energyPerHour: 6,
      hungerPerHour: 5,
      sleepinessPerHour: -5,
      fatiguePerHour: -8,
      focusPerHour: 6,
      socialNeedPerHour: 0,
    },
  },

  gym_workout: {
    id: 'gym_workout',
    displayName: 'Gym Strength Training',
    requiredLocation: 'gym',
    defaultFlyActivity: 'flying',
    targetLandmarkName: 'Gym Floor & Dumbbells',
    needsModifiers: {
      energyPerHour: -18,
      hungerPerHour: 14,
      sleepinessPerHour: -2,
      fatiguePerHour: 26,
      focusPerHour: 10,
      socialNeedPerHour: 6,
    },
  },

  dinner: {
    id: 'dinner',
    displayName: 'Dinner Mess Meal',
    requiredLocation: 'dining',
    defaultFlyActivity: 'perched_on_table',
    targetLandmarkName: 'Communal Dining Table',
    needsModifiers: {
      energyPerHour: 12,
      hungerPerHour: -60,
      sleepinessPerHour: 5,
      fatiguePerHour: -6,
      focusPerHour: 0,
      socialNeedPerHour: -15,
    },
  },

  family_call_walk: {
    id: 'family_call_walk',
    displayName: 'Family Call & Walk',
    requiredLocation: 'grounds',
    defaultFlyActivity: 'flying',
    targetLandmarkName: 'Apartment Courtyard Garden',
    needsModifiers: {
      energyPerHour: 3,
      hungerPerHour: 4,
      sleepinessPerHour: 2,
      fatiguePerHour: 1,
      focusPerHour: 6,
      socialNeedPerHour: -40,
    },
  },

  project_work: {
    id: 'project_work',
    displayName: 'Project Work & Upskilling',
    requiredLocation: 'bedroom',
    defaultFlyActivity: 'perched_on_laptop',
    targetLandmarkName: 'Near Study Desk & Laptop',
    needsModifiers: {
      energyPerHour: -6,
      hungerPerHour: 5,
      sleepinessPerHour: 8,
      fatiguePerHour: 2,
      focusPerHour: 18,
      socialNeedPerHour: 3,
    },
  },

  college_assignments: {
    id: 'college_assignments',
    displayName: 'College Assignments',
    requiredLocation: 'bedroom',
    defaultFlyActivity: 'perched_on_desk',
    targetLandmarkName: 'Near Study Desk & Laptop',
    needsModifiers: {
      energyPerHour: -5,
      hungerPerHour: 4,
      sleepinessPerHour: 10,
      fatiguePerHour: 3,
      focusPerHour: 14,
      socialNeedPerHour: 1,
    },
  },

  sleep: {
    id: 'sleep',
    displayName: 'Deep Night Sleep',
    requiredLocation: 'bedroom',
    defaultFlyActivity: 'hovering',
    targetLandmarkName: 'Hovering over Bed & Orange Blanket',
    needsModifiers: {
      energyPerHour: 16,
      hungerPerHour: 4,
      sleepinessPerHour: -22,
      fatiguePerHour: -16,
      focusPerHour: 6,
      socialNeedPerHour: 0,
    },
  },

  laundry: {
    id: 'laundry',
    displayName: 'Weekend Laundry',
    requiredLocation: 'bedroom',
    defaultFlyActivity: 'flying',
    targetLandmarkName: 'Near PG Wardrobe',
    needsModifiers: {
      energyPerHour: -4,
      hungerPerHour: 5,
      sleepinessPerHour: -2,
      fatiguePerHour: 6,
      focusPerHour: 4,
      socialNeedPerHour: 2,
    },
  },

  dry_clothes: {
    id: 'dry_clothes',
    displayName: 'Balcony Clothes Drying',
    requiredLocation: 'balcony',
    defaultFlyActivity: 'hovering',
    targetLandmarkName: 'Balcony Sunlight Railing',
    needsModifiers: {
      energyPerHour: -2,
      hungerPerHour: 3,
      sleepinessPerHour: -3,
      fatiguePerHour: 3,
      focusPerHour: 5,
      socialNeedPerHour: 4,
    },
  },

  lunch: {
    id: 'lunch',
    displayName: 'Weekend Lunch',
    requiredLocation: 'dining',
    defaultFlyActivity: 'perched_on_table',
    targetLandmarkName: 'Communal Dining Table',
    needsModifiers: {
      energyPerHour: 10,
      hungerPerHour: -55,
      sleepinessPerHour: 6,
      fatiguePerHour: -4,
      focusPerHour: 0,
      socialNeedPerHour: -12,
    },
  },

  weekend_free_time: {
    id: 'weekend_free_time',
    displayName: 'Grounds Free Time',
    requiredLocation: 'grounds',
    defaultFlyActivity: 'flying',
    targetLandmarkName: 'Apartment Courtyard Garden',
    needsModifiers: {
      energyPerHour: 4,
      hungerPerHour: 4,
      sleepinessPerHour: -2,
      fatiguePerHour: -2,
      focusPerHour: 2,
      socialNeedPerHour: 6,
    },
  },

  free_idle: {
    id: 'free_idle',
    displayName: 'Free Time / Idle',
    requiredLocation: 'bedroom',
    defaultFlyActivity: 'hovering',
    targetLandmarkName: 'Center Room Airspace',
    needsModifiers: {
      energyPerHour: 1,
      hungerPerHour: 3,
      sleepinessPerHour: 2,
      fatiguePerHour: -2,
      focusPerHour: 0,
      socialNeedPerHour: 2,
    },
  },
};

export function getActivityDefinition(id: string): ActivityDefinition {
  return ACTIVITY_DEFINITIONS[id] || ACTIVITY_DEFINITIONS.free_idle;
}
