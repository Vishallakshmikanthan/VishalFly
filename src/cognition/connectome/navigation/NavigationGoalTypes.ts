/**
 * VISHALFLY — Navigation Goal & Spatial Orientation Types
 * 
 * Typed representations and mathematical utilities for goal-directed navigation.
 * Standardizes coordinate conventions, angular wrapping, and bearing derivations.
 * 
 * Coordinate & Heading Conventions (Three.js):
 * - Position: [X, Y, Z] (Y is altitude/up, X is lateral, Z is longitudinal)
 * - Heading: Yaw angle around Y-axis in radians.
 *   - Yaw = 0: Facing +Z
 *   - Yaw = +PI/2: Facing +X (turned right 90 deg)
 *   - Yaw = -PI/2: Facing -X (turned left 90 deg)
 *   - Yaw = +/-PI: Facing -Z (turned 180 deg)
 * - Angular error: deltaTheta = wrapAngle(goalBearing - currentHeading)
 *   - deltaTheta > 0: Goal is to the left (counter-clockwise)
 *   - deltaTheta < 0: Goal is to the right (clockwise)
 */

export interface NavigationGoal {
  /** Target destination in 3D world coordinates [x, y, z] */
  targetPosition: [number, number, number];
  /** Current fly position [x, y, z] */
  currentPosition: [number, number, number];
  /** Current fly yaw heading angle in radians */
  currentHeading: number;
  /** Whether the goal is valid and actively pursued */
  isValid: boolean;
  /** Human-readable identifier for diagnostics (e.g. 'desk', 'bed', landmark name) */
  goalId?: string;
  /** Euclidean distance in 3D space (meters) */
  distance3D: number;
  /** Horizontal plane (XZ) distance (meters) */
  distanceHorizontal: number;
  /** Vertical altitude delta (targetY - currentY) in meters */
  verticalDistance: number;
  /** Azimuthal bearing from current position to goal in radians */
  goalBearing: number;
  /** Wrapped angular difference between goal bearing and fly heading in [-PI, +PI] */
  angularError: number;
  /** Whether the fly has arrived within the destination threshold */
  isArrived: boolean;
}

/**
 * Normalizes an angle in radians to the principal interval [-PI, +PI].
 * Handles multi-revolution wrapping and numerical edge cases.
 */
export function wrapAngle(radians: number): number {
  if (!Number.isFinite(radians)) return 0;
  const twoPi = 2 * Math.PI;
  let wrapped = ((radians + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
  // Guard against rare floating point -PI edge
  if (wrapped <= -Math.PI) wrapped += twoPi;
  return wrapped;
}

/**
 * Computes azimuthal bearing in radians from `fromPos` to `toPos` in the XZ plane.
 * Follows the +Z forward, +X right heading convention (atan2(dx, dz)).
 */
export function calculateGoalBearing(
  fromPos: [number, number, number],
  toPos: [number, number, number]
): number {
  const dx = toPos[0] - fromPos[0];
  const dz = toPos[2] - fromPos[2];
  if (!Number.isFinite(dx) || !Number.isFinite(dz)) return 0;
  if (Math.hypot(dx, dz) < 1e-4) return 0;
  return Math.atan2(dx, dz);
}

/**
 * Factory helper to safely construct a validated NavigationGoal.
 * Handles missing goals, NaN/Infinity coordinates, and near-zero distances.
 */
export function createNavigationGoal(
  targetPos: [number, number, number] | null | undefined,
  currentPos: [number, number, number],
  currentHeading: number,
  goalId = 'destination',
  arrivalRadius = 0.4
): NavigationGoal {
  // Validate current position and heading
  const validCurrent =
    currentPos &&
    currentPos.length === 3 &&
    currentPos.every(Number.isFinite) &&
    Number.isFinite(currentHeading);

  const safeCurrent: [number, number, number] = validCurrent
    ? [currentPos[0], currentPos[1], currentPos[2]]
    : [0, 0, 0];
  const safeHeading = Number.isFinite(currentHeading) ? wrapAngle(currentHeading) : 0;

  // Validate target position
  const validTarget =
    targetPos &&
    targetPos.length === 3 &&
    targetPos.every(Number.isFinite);

  if (!validTarget || !validCurrent) {
    return {
      targetPosition: [0, 0, 0],
      currentPosition: safeCurrent,
      currentHeading: safeHeading,
      isValid: false,
      goalId,
      distance3D: 0,
      distanceHorizontal: 0,
      verticalDistance: 0,
      goalBearing: safeHeading,
      angularError: 0,
      isArrived: false,
    };
  }

  const dx = targetPos[0] - safeCurrent[0];
  const dy = targetPos[1] - safeCurrent[1];
  const dz = targetPos[2] - safeCurrent[2];

  const distHoriz = Math.hypot(dx, dz);
  const dist3D = Math.hypot(distHoriz, dy);
  const isNearZero = distHoriz < 0.02;

  const bearing = isNearZero ? safeHeading : Math.atan2(dx, dz);
  const angError = isNearZero ? 0 : wrapAngle(bearing - safeHeading);
  const isArrived = dist3D <= arrivalRadius;

  return {
    targetPosition: [targetPos[0], targetPos[1], targetPos[2]],
    currentPosition: safeCurrent,
    currentHeading: safeHeading,
    isValid: true,
    goalId,
    distance3D: Math.round(dist3D * 1000) / 1000,
    distanceHorizontal: Math.round(distHoriz * 1000) / 1000,
    verticalDistance: Math.round(dy * 1000) / 1000,
    goalBearing: Math.round(bearing * 1000) / 1000,
    angularError: Math.round(angError * 1000) / 1000,
    isArrived,
  };
}
