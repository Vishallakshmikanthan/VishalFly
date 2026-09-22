/**
 * World Theme, Scale Conventions & PBR Material Tokens for VishalFly
 * Standardizes dimensions, materials, and architectural scales across all 3D environments.
 */

export const WORLD_SCALE = {
  // Architectural Dimensions (meters)
  WALL_THICKNESS: 0.2,
  ROOM_HEIGHT: 4.0,
  DOOR_WIDTH: 1.4,
  DOOR_HEIGHT: 2.3,
  WINDOW_HEIGHT: 2.8,

  // Furniture Standard Dimensions (meters)
  DESK_HEIGHT: 0.88,
  DESK_DEPTH: 1.2,
  CHAIR_SEAT_HEIGHT: 0.46,
  BED_HEIGHT: 0.65,
  BED_LENGTH: 2.4,
  BED_WIDTH: 1.8,

  // Gym Equipment Scale
  BARBELL_LENGTH: 2.0,
  BARBELL_RADIUS: 0.02,
  PLATE_RADIUS_45LB: 0.23,
  DUMBBELL_HANDLE_LENGTH: 0.18,
  RACK_HEIGHT: 2.5,

  // Character Reference Scale (meters)
  FLY_SCALE: 1.2,
  FLY_HOVER_ALTITUDE: 1.4,
};

export const PBR_MATERIALS = {
  // Architectural Surfaces
  darkWall: {
    color: '#1e232a',
    roughness: 0.88,
    metalness: 0.12,
  },
  lightWall: {
    color: '#f1f5f9',
    roughness: 0.9,
    metalness: 0.05,
  },
  trimDark: {
    color: '#14171d',
    roughness: 0.7,
    metalness: 0.2,
  },

  // Woods
  hardwoodOak: {
    color: '#523928',
    roughness: 0.55,
    metalness: 0.08,
  },
  studyDeskTeak: {
    color: '#854d0e',
    roughness: 0.65,
    metalness: 0.08,
  },
  darkWalnut: {
    color: '#3b2314',
    roughness: 0.7,
    metalness: 0.05,
  },

  // Metals
  powderCoatedSteel: {
    color: '#1f2937',
    roughness: 0.65,
    metalness: 0.82,
  },
  chromeKnurled: {
    color: '#d4d4d8',
    roughness: 0.18,
    metalness: 0.94,
  },
  brassGoldAccent: {
    color: '#d4af37',
    roughness: 0.25,
    metalness: 0.85,
  },
  gymRackRed: {
    color: '#b91c1c',
    roughness: 0.35,
    metalness: 0.55,
  },

  // Flooring
  gymRubberMat: {
    color: '#18181b',
    roughness: 0.85,
    metalness: 0.1,
  },
  gymTurfGreen: {
    color: '#15803d',
    roughness: 0.95,
    metalness: 0.0,
  },
  balconyTerracotta: {
    color: '#c2410c',
    roughness: 0.72,
    metalness: 0.05,
  },
  outdoorCourtyardGrass: {
    color: '#14532d',
    roughness: 0.92,
    metalness: 0.0,
  },
  pavedStonePath: {
    color: '#475569',
    roughness: 0.75,
    metalness: 0.15,
  },

  // Glass & Transmission
  balustradeGlass: {
    color: '#bfdbfe',
    transparent: true,
    opacity: 0.45,
    roughness: 0.1,
    transmission: 0.85,
    ior: 1.45,
  },
  classroomWindowGlass: {
    color: '#e0f2fe',
    transparent: true,
    opacity: 0.35,
    roughness: 0.08,
    transmission: 0.9,
    ior: 1.5,
  },

  // Fly Materials
  flyChitinAmber: {
    color: '#d97706',
    roughness: 0.4,
    metalness: 0.2,
  },
  flyThoraxBrown: {
    color: '#92400e',
    roughness: 0.45,
    metalness: 0.3,
  },
  flyRubyEye: {
    color: '#dc2626',
    roughness: 0.12,
    metalness: 0.65,
    emissive: '#991b1b',
    emissiveIntensity: 0.35,
  },
};

export interface TimeOfDayLightingState {
  timeLabel: string;
  sunPosition: [number, number, number];
  sunColor: string;
  sunIntensity: number;
  ambientColor: string;
  ambientIntensity: number;
  skyColor: string;
  fogColor: string;
  isNight: boolean;
}

/**
 * Calculates continuous time-of-day lighting parameters from simulated minutes past midnight (0 - 1440).
 */
export function getTimeOfDayLighting(minutes: number): TimeOfDayLightingState {
  // Normalize minutes (0 - 1440)
  const normMin = ((minutes % 1440) + 1440) % 1440;

  // 1. Night (20:00 - 05:30)
  if (normMin < 330 || normMin >= 1200) {
    return {
      timeLabel: 'Night',
      sunPosition: [2, -2, -5],
      sunColor: '#38bdf8', // Gentle moonlit blue
      sunIntensity: 0.35,
      ambientColor: '#1e293b',
      ambientIntensity: 0.45,
      skyColor: '#05070d',
      fogColor: '#07090e',
      isNight: true,
    };
  }

  // 2. Dawn / Early Morning Twilight (05:30 - 07:30 = 330 - 450 min)
  if (normMin < 450) {
    const t = (normMin - 330) / 120; // 0 to 1
    return {
      timeLabel: 'Dawn Twilight',
      sunPosition: [6 + t * 2, 3 + t * 4, -4 + t * 2],
      sunColor: '#fed7aa', // Warm peach / golden dawn
      sunIntensity: 0.8 + t * 0.5,
      ambientColor: '#cbd5e1',
      ambientIntensity: 0.5 + t * 0.15,
      skyColor: '#0f172a',
      fogColor: '#0b1120',
      isNight: false,
    };
  }

  // 3. Midday / Afternoon Daylight (07:30 - 16:45 = 450 - 1005 min)
  if (normMin < 1005) {
    return {
      timeLabel: 'Daylight',
      sunPosition: [7.5, 12.0, 5.0],
      sunColor: '#fffbeb', // Crisp pure sunlight
      sunIntensity: 1.55,
      ambientColor: '#e2e8f0',
      ambientIntensity: 0.65,
      skyColor: '#080a0f',
      fogColor: '#080a0f',
      isNight: false,
    };
  }

  // 4. Golden Hour & Dusk (16:45 - 20:00 = 1005 - 1200 min)
  const duskT = (normMin - 1005) / 195; // 0 to 1
  return {
    timeLabel: 'Golden Hour & Dusk',
    sunPosition: [6.0 - duskT * 4, 7.0 - duskT * 5, 4.0 - duskT * 2],
    sunColor: '#fb923c', // Warm amber / orange sunset
    sunIntensity: 1.4 - duskT * 0.8,
    ambientColor: '#475569',
    ambientIntensity: 0.6 - duskT * 0.2,
    skyColor: '#0c0f1d',
    fogColor: '#080a12',
    isNight: duskT > 0.7,
  };
}
