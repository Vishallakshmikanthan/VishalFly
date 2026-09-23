/**
 * VISHALFLY — World Event Catalog & Default Definitions
 * Milestone 5 Architecture
 * 
 * Provides declarative definitions for all configurable living-world events.
 * Trigger preconditions, durations, cooldowns, and effects are fully typed
 * and deterministic-capable.
 */

import { WorldEventDefinition } from './WorldEventTypes';

export const DEFAULT_WORLD_EVENT_DEFINITIONS: WorldEventDefinition[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Ambient Creatures
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'visitor_fly_window',
    title: 'Visitor Fly Near Window',
    category: 'ambient_creature',
    targetLocation: 'bedroom',
    description: 'An ambient fruit fly hovers near the sunlit bedroom windowpane.',
    minDurationSimSeconds: 120, // 2 sim mins
    maxDurationSimSeconds: 360, // 6 sim mins
    cooldownSimSeconds: 900,    // 15 sim mins
    baseProbability: 0.35,
    triggerCondition: (ctx) => ctx.currentLocationId === 'bedroom' && ctx.clock.currentMinutes >= 360 && ctx.clock.currentMinutes <= 1140,
    effects: {
      attentionDistraction: 0.15,
      suggestedWaypoint: 'window',
      ambientCreature: {
        name: 'Window Visitor Fly',
        type: 'fly',
        spotOrWaypoint: 'window',
        description: 'Small fruit fly exploring glass condensation.',
      },
    },
  },
  {
    id: 'fruit_flies_fruit_bowl',
    title: 'Fruit Flies Near Snack Bowl',
    category: 'ambient_creature',
    targetLocation: 'bedroom',
    description: 'A tiny cluster of fruit flies lands near the ripe banana and fruit bowl on the desk.',
    minDurationSimSeconds: 180,
    maxDurationSimSeconds: 480,
    cooldownSimSeconds: 1200,
    baseProbability: 0.4,
    triggerCondition: (ctx) => ctx.currentLocationId === 'bedroom',
    effects: {
      attentionDistraction: 0.2,
      suggestedWaypoint: 'desk',
      foodSurfacesDelta: [{ surfaceId: 'bedroom_snack', deltaRemaining: -5 }],
      ambientCreature: {
        name: 'Desk Fruit Fly Swarm',
        type: 'fly',
        spotOrWaypoint: 'desk',
        description: 'Tasting ripe sugars on the banana peel.',
      },
    },
  },
  {
    id: 'balcony_birds_clothesline',
    title: 'Sparrows on Balcony Railing',
    category: 'ambient_creature',
    targetLocation: 'balcony',
    description: 'Two inquisitive sparrows flutter onto the balcony railing near the clothesline.',
    minDurationSimSeconds: 90,
    maxDurationSimSeconds: 300,
    cooldownSimSeconds: 1200,
    baseProbability: 0.45,
    triggerCondition: (ctx) => ctx.currentLocationId === 'balcony' && ctx.clock.currentMinutes >= 360 && ctx.clock.currentMinutes <= 1100,
    effects: {
      attentionDistraction: 0.3,
      suggestedWaypoint: 'clothesline',
      ambientCreature: {
        name: 'Balcony Sparrows',
        type: 'bird',
        spotOrWaypoint: 'clothesline',
        description: 'Perched on railing chirping in the morning air.',
      },
    },
  },
  {
    id: 'courtyard_butterfly',
    title: 'Courtyard Butterfly in Flight',
    category: 'ambient_creature',
    targetLocation: 'grounds',
    description: 'A colorful garden butterfly glides peacefully past the courtyard trees.',
    minDurationSimSeconds: 150,
    maxDurationSimSeconds: 420,
    cooldownSimSeconds: 1500,
    baseProbability: 0.35,
    triggerCondition: (ctx) => ctx.currentLocationId === 'grounds' && ctx.clock.currentMinutes >= 420 && ctx.clock.currentMinutes <= 1080,
    effects: {
      attentionDistraction: 0.25,
      suggestedWaypoint: 'garden_bench',
      ambientCreature: {
        name: 'Courtyard Butterfly',
        type: 'insect',
        spotOrWaypoint: 'garden_bench',
        description: 'Gracefully fluttering between flower bushes.',
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Lighting & Environmental Ambience
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'golden_hour_sunbeam',
    title: 'Late Afternoon Golden Hour',
    category: 'lighting_ambience',
    targetLocation: 'all',
    description: 'Warm, low-angle golden sunlight pours across the room through the glass.',
    minDurationSimSeconds: 300, // 5 sim mins
    maxDurationSimSeconds: 900, // 15 sim mins
    cooldownSimSeconds: 3600,   // 1 hour
    baseProbability: 0.6,
    triggerCondition: (ctx) => ctx.clock.currentMinutes >= 960 && ctx.clock.currentMinutes <= 1110, // 16:00 - 18:30
    effects: {
      ambientLighting: 'afternoon',
      needsDeltaPerHour: {
        focusPerHour: 5,
        fatiguePerHour: -3,
      },
      activityUtilityBonus: {
        attend_lecture: 1.1,
        work_project: 1.15,
        forage_food_seeking: 1.1,
      },
    },
  },
  {
    id: 'cloud_cover_dimming',
    title: 'Overcast Cloud Cover Dimming',
    category: 'lighting_ambience',
    targetLocation: 'all',
    description: 'A heavy rain cloud drifts overhead, casting cool shadows into the space.',
    minDurationSimSeconds: 240,
    maxDurationSimSeconds: 720,
    cooldownSimSeconds: 2400,
    baseProbability: 0.35,
    triggerCondition: (ctx) => ctx.clock.currentMinutes >= 480 && ctx.clock.currentMinutes <= 960,
    effects: {
      ambientLighting: 'dawn',
      needsDeltaPerHour: {
        sleepinessPerHour: 4,
        energyPerHour: -2,
      },
      activityUtilityBonus: {
        doze_off: 1.25,
        rest_and_sleep: 1.2,
      },
    },
  },
  {
    id: 'desk_reading_lamp',
    title: 'Study Desk Reading Lamp Warmth',
    category: 'lighting_ambience',
    targetLocation: 'bedroom',
    description: 'The desk task lamp illuminates the workspace with a focused amber glow.',
    minDurationSimSeconds: 600,
    maxDurationSimSeconds: 1800,
    cooldownSimSeconds: 3000,
    baseProbability: 0.5,
    triggerCondition: (ctx) => ctx.currentLocationId === 'bedroom' && (ctx.clock.currentMinutes >= 1200 || ctx.clock.currentMinutes <= 300),
    effects: {
      ambientLighting: 'warm_night',
      needsDeltaPerHour: {
        focusPerHour: 8,
      },
      activityUtilityBonus: {
        work_project: 1.2,
        work_assignment: 1.2,
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Food Availability Changes
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'snack_bowl_refreshed',
    title: 'Desk Snack Bowl Replenished',
    category: 'food_availability',
    targetLocation: 'bedroom',
    description: 'Fresh sliced mango and fruit slices are placed into the desk snack bowl.',
    minDurationSimSeconds: 600,
    maxDurationSimSeconds: 1800,
    cooldownSimSeconds: 3600,
    baseProbability: 0.45,
    triggerCondition: (ctx) => ctx.currentLocationId === 'bedroom',
    effects: {
      foodSurfacesDelta: [{ surfaceId: 'bedroom_snack', deltaRemaining: 40 }],
      odorSourcesDelta: [{ sourceId: 'bedroom_snack', deltaIntensity: 0.35 }],
      suggestedWaypoint: 'desk',
      activityUtilityBonus: {
        forage_food_seeking: 1.4,
        eat_meal: 1.3,
      },
    },
  },
  {
    id: 'dining_buffet_replenished',
    title: 'Dining Buffet Fresh Hot Service',
    category: 'food_availability',
    targetLocation: 'dining',
    description: 'Steam rises as freshly prepared hot trays arrive at the dining buffet station.',
    minDurationSimSeconds: 900,
    maxDurationSimSeconds: 2400,
    cooldownSimSeconds: 4800,
    baseProbability: 0.55,
    triggerCondition: (ctx) => ctx.currentLocationId === 'dining',
    effects: {
      foodSurfacesDelta: [{ surfaceId: 'dining_buffet', deltaRemaining: 50 }],
      odorSourcesDelta: [{ sourceId: 'dining_buffet', deltaIntensity: 0.4 }],
      suggestedWaypoint: 'buffet_station',
      activityUtilityBonus: {
        forage_food_seeking: 1.5,
        eat_meal: 1.45,
      },
    },
  },
  {
    id: 'food_counter_clearing',
    title: 'Food Trays Cleared for Cleaning',
    category: 'food_availability',
    targetLocation: 'dining',
    description: 'Staff wipe down the communal table and clear empty food plates.',
    minDurationSimSeconds: 300,
    maxDurationSimSeconds: 900,
    cooldownSimSeconds: 3600,
    baseProbability: 0.3,
    triggerCondition: (ctx) => ctx.currentLocationId === 'dining',
    effects: {
      foodSurfacesDelta: [{ surfaceId: 'dining_table', deltaRemaining: -30 }],
      odorSourcesDelta: [{ sourceId: 'dining_table', deltaIntensity: -0.25 }],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. College and Apartment Activity Fluctuations
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'corridor_footsteps',
    title: 'Corridor Footsteps & Door Bustle',
    category: 'college_apartment_activity',
    targetLocation: 'all',
    description: 'Footsteps and casual conversations echo from the hallway outside.',
    minDurationSimSeconds: 90,
    maxDurationSimSeconds: 240,
    cooldownSimSeconds: 900,
    baseProbability: 0.4,
    triggerCondition: (ctx) => ctx.clock.currentMinutes >= 480 && ctx.clock.currentMinutes <= 1260,
    effects: {
      attentionDistraction: 0.25,
      needsDeltaPerHour: {
        focusPerHour: -4,
        socialNeedPerHour: -2,
      },
    },
  },
  {
    id: 'roommate_study_session',
    title: 'Roommate Collaborative Study Chat',
    category: 'college_apartment_activity',
    targetLocation: 'bedroom',
    description: 'A study partner drops by to discuss an upcoming engineering assignment.',
    minDurationSimSeconds: 300,
    maxDurationSimSeconds: 900,
    cooldownSimSeconds: 3600,
    baseProbability: 0.35,
    triggerCondition: (ctx) => ctx.currentLocationId === 'bedroom' && ctx.clock.currentMinutes >= 840 && ctx.clock.currentMinutes <= 1260,
    effects: {
      attentionDistraction: 0.3,
      needsDeltaPerHour: {
        socialNeedPerHour: -8,
        focusPerHour: 3,
      },
      activityUtilityBonus: {
        work_assignment: 1.25,
      },
    },
  },
  {
    id: 'class_bell_rush',
    title: 'College Lecture Bell Ring & Hallway Rush',
    category: 'college_apartment_activity',
    targetLocation: 'classroom',
    description: 'The period bell sounds; students gather materials and change classrooms.',
    minDurationSimSeconds: 120,
    maxDurationSimSeconds: 300,
    cooldownSimSeconds: 3000,
    baseProbability: 0.5,
    triggerCondition: (ctx) => ctx.currentLocationId === 'classroom',
    effects: {
      attentionDistraction: 0.35,
      needsDeltaPerHour: {
        focusPerHour: -6,
      },
      activityUtilityBonus: {
        travel_to_scheduled: 1.3,
      },
    },
  },
  {
    id: 'late_night_quiet',
    title: 'Late Night Apartment Stillness',
    category: 'college_apartment_activity',
    targetLocation: 'bedroom',
    description: 'The apartment building grows silent as city traffic fades into calm night.',
    minDurationSimSeconds: 900,
    maxDurationSimSeconds: 3600,
    cooldownSimSeconds: 7200,
    baseProbability: 0.7,
    triggerCondition: (ctx) => ctx.currentLocationId === 'bedroom' && (ctx.clock.currentMinutes >= 1380 || ctx.clock.currentMinutes <= 330),
    effects: {
      attentionDistraction: 0.05,
      needsDeltaPerHour: {
        sleepinessPerHour: 6,
        fatiguePerHour: -4,
      },
      activityUtilityBonus: {
        rest_and_sleep: 1.35,
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Occasional Interruptions & Environmental Drafts
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'sudden_window_draft',
    title: 'Sudden Window Air Breeze Draft',
    category: 'interruption',
    targetLocation: 'all',
    description: 'A sudden gust of cool evening breeze sweeps across the airspace, dislodging perches.',
    minDurationSimSeconds: 45,
    maxDurationSimSeconds: 120,
    cooldownSimSeconds: 900,
    baseProbability: 0.35,
    triggerCondition: (ctx) => !ctx.isTravelling,
    effects: {
      attentionDistraction: 0.45,
      interruptBehaviorId: 'respond_to_interruption',
      suggestedWaypoint: 'center',
      activityUtilityBonus: {
        respond_to_interruption: 1.6,
      },
    },
  },
  {
    id: 'desk_knock_disturbance',
    title: 'Desk Surface Mechanical Vibration',
    category: 'interruption',
    targetLocation: 'bedroom',
    description: 'A heavy textbook is set down firmly on the desk, vibrating the wood surface.',
    minDurationSimSeconds: 30,
    maxDurationSimSeconds: 90,
    cooldownSimSeconds: 1200,
    baseProbability: 0.3,
    triggerCondition: (ctx) => ctx.currentLocationId === 'bedroom' && !ctx.isTravelling,
    effects: {
      attentionDistraction: 0.5,
      interruptBehaviorId: 'respond_to_interruption',
      suggestedWaypoint: 'lamp',
      activityUtilityBonus: {
        respond_to_interruption: 1.7,
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Weekend-Specific Emergent Routines
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'balcony_drying_breeze',
    title: 'Balcony Gentle Laundry Drying Breeze',
    category: 'weekend_routine',
    targetLocation: 'balcony',
    description: 'Warm breeze ripples the freshly hung laundry on the balcony clothesline.',
    minDurationSimSeconds: 300,
    maxDurationSimSeconds: 900,
    cooldownSimSeconds: 1800,
    baseProbability: 0.5,
    triggerCondition: (ctx) => ctx.clock.dayType === 'weekend' && ctx.currentLocationId === 'balcony',
    effects: {
      suggestedWaypoint: 'clothesline',
      needsDeltaPerHour: {
        fatiguePerHour: -5,
        energyPerHour: 3,
      },
    },
  },
  {
    id: 'delivery_order_gate_ready',
    title: 'Food Delivery Partner at Gate',
    category: 'weekend_routine',
    targetLocation: 'all',
    description: 'The apartment gate bell chimes — midnight food order delivery partner has arrived!',
    minDurationSimSeconds: 180,
    maxDurationSimSeconds: 600,
    cooldownSimSeconds: 3600,
    baseProbability: 0.6,
    triggerCondition: (ctx) => ctx.clock.dayType === 'weekend' && ctx.clock.currentMinutes >= 1320, // 22:00 onwards
    effects: {
      attentionDistraction: 0.4,
      suggestedWaypoint: 'apartment_gate',
      foodSurfacesDelta: [{ surfaceId: 'dining_table', deltaRemaining: 45 }],
      odorSourcesDelta: [{ sourceId: 'dining_table', deltaIntensity: 0.45 }],
      activityUtilityBonus: {
        midnight_food_order: 1.8,
        forage_food_seeking: 1.5,
      },
    },
  },
];

export const WORLD_EVENT_DEFINITIONS = DEFAULT_WORLD_EVENT_DEFINITIONS;
