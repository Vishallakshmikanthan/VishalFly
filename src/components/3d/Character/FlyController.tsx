import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore, simulationEngine, connectomeFlyController } from '../../../store/useGameStore';
import { LOCATIONS, LOCATION_WORLD_OFFSETS } from '../../../navigation/locationGraph';
import { FruitFly } from './FruitFly';
import { createNavigationGoal, NavigationGoal } from '../../../cognition/connectome/navigation/NavigationGoalTypes';

function resolveActiveNavigationTarget(
  locationId: string,
  activeWaypointKey: string,
  currentActivity: any,
  flyPos: [number, number, number],
  flyYaw: number
): NavigationGoal | null {
  const currentLocConfig = LOCATIONS[locationId as keyof typeof LOCATIONS];
  if (!currentLocConfig) return null;

  const offset = LOCATION_WORLD_OFFSETS[locationId as keyof typeof LOCATION_WORLD_OFFSETS] || [0, 0, 0];
  const waypointCoords = currentLocConfig?.waypoints?.[activeWaypointKey];
  let targetX = 0;
  let targetY = 1.6;
  let targetZ = 0;
  let goalId = activeWaypointKey || 'destination';

  if (waypointCoords) {
    targetX = waypointCoords[0] + offset[0];
    targetY = waypointCoords[1] + offset[1];
    targetZ = waypointCoords[2] + offset[2];
  } else {
    const targetLandmarkName = currentActivity?.definition.targetLandmarkName;
    const targetLm = currentLocConfig?.landmarks.find((lm) => lm.name === targetLandmarkName) ||
      currentLocConfig?.landmarks[0];
    if (targetLm) {
      targetX = (targetLm.minX + targetLm.maxX) / 2 + offset[0];
      targetZ = (targetLm.minZ + targetLm.maxZ) / 2 + offset[2];
      targetY = (targetLm.minY !== undefined ? (targetLm.minY + (targetLm.maxY || targetLm.minY + 1.2)) / 2 : 1.6) + offset[1];
      goalId = targetLm.name;
    } else {
      return null;
    }
  }

  return createNavigationGoal([targetX, targetY, targetZ], flyPos, flyYaw, goalId);
}

/**
 * FlyController:
 * - Manages WASD / Arrow Keys + Space/Shift 3D flight mechanics
 * - Velocity damping, smooth banking, and heading rotation
 * - Strictly enforces active environment's room collision boundaries
 * - Teleports & synchronizes fly position when location changes
 * - Dynamic landmark detection for the active location
 * - Closed-loop Biological Connectome Autonomous Neural Flight Controller
 */
export const FlyController: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Zustand store actions and state
  const setFlyPosition = useGameStore((state) => state.setFlyPosition);
  const setFlyActivity = useGameStore((state) => state.setFlyActivity);
  const setCurrentSpot = useGameStore((state) => state.setCurrentSpot);
  const roomBounds = useGameStore((state) => state.roomBounds);
  const currentLocation = useGameStore((state) => state.currentLocation);
  const flyPosition = useGameStore((state) => state.flyPosition);
  const flyActivity = useGameStore((state) => state.flyActivity);
  const isAutonomous = useGameStore((state) => state.isAutonomous);
  const controllerMode = useGameStore((state) => state.controllerMode);
  const setConnectomeSnapshot = useGameStore((state) => state.setConnectomeSnapshot);
  const currentActivity = useGameStore((state) => state.currentActivity);
  const needs = useGameStore((state) => state.needs);
  const simulationClock = useGameStore((state) => state.simulationClock);

  // Flight vectors
  const position = useRef(new THREE.Vector3(...flyPosition));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const pitch = useRef(0);
  const roll = useRef(0);

  // Performance: Throttle UI/Zustand store dispatches so React doesn't re-render 60 times a second
  const lastStoreSyncTime = useRef(0);
  const lastSnapshotSyncTime = useRef(0);
  const lastSpotSyncTime = useRef(0);

  const [isMoving, setIsMoving] = useState(false);
  const [proboscisExt, setProboscisExt] = useState(0);
  const [isFeedingActive, setIsFeedingActive] = useState(false);

  // Sync position whenever location changes or external teleport happens
  useEffect(() => {
    position.current.set(...flyPosition);
    velocity.current.set(0, 0, 0);
    targetRotation.current = 0;
    currentRotation.current = 0;
    pitch.current = 0;
    roll.current = 0;
    if (groupRef.current) {
      groupRef.current.position.set(...flyPosition);
    }
  }, [currentLocation]);

  // Keyboard state
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'Space':
          keys.current.up = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyC':
          keys.current.down = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'Space':
          keys.current.up = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyC':
          keys.current.down = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);

    const moveSpeed = 4.2;
    const accel = 18.0;
    const friction = 6.5;

    // Calculate desired acceleration vector
    const moveDir = new THREE.Vector3(0, 0, 0);

    if (keys.current.forward) moveDir.z -= 1;
    if (keys.current.backward) moveDir.z += 1;
    if (keys.current.left) moveDir.x -= 1;
    if (keys.current.right) moveDir.x += 1;
    if (keys.current.up) moveDir.y += 1;
    if (keys.current.down) moveDir.y -= 1;

    const moving = moveDir.lengthSq() > 0;

    if (moving) {
      if (!isMoving) {
        setIsMoving(true);
        setFlyActivity('flying');
      }
      moveDir.normalize();
      velocity.current.x += moveDir.x * accel * dt;
      velocity.current.y += moveDir.y * accel * dt;
      velocity.current.z += moveDir.z * accel * dt;

      // Calculate yaw angle for horizontal steering
      if (Math.abs(moveDir.x) > 0.01 || Math.abs(moveDir.z) > 0.01) {
        targetRotation.current = Math.atan2(moveDir.x, moveDir.z) + Math.PI;
      }

      // Calculate banking angles
      pitch.current = THREE.MathUtils.lerp(pitch.current, moveDir.y * -0.35, dt * 10);
      roll.current = THREE.MathUtils.lerp(roll.current, -moveDir.x * 0.4, dt * 10);
    } else if (controllerMode === 'connectome') {
      // 1. Biological Connectome Neural Dynamics Closed-Loop Autonomous Flight
      // Resolve active contextual navigation goal from schedule/activity simulation
      const activeWaypointKey = simulationEngine.getCurrentWaypoint();
      const currentGoal = resolveActiveNavigationTarget(
        currentLocation,
        activeWaypointKey,
        currentActivity,
        [position.current.x, position.current.y, position.current.z],
        targetRotation.current
      );

      const dayMap: Record<string, number> = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };
      const dayIndex = simulationClock?.dayOfWeek ? dayMap[simulationClock.dayOfWeek] ?? 1 : 1;

      const result = connectomeFlyController.update(
        [position.current.x, position.current.y, position.current.z],
        [velocity.current.x, velocity.current.y, velocity.current.z],
        targetRotation.current,
        roomBounds,
        dt,
        currentGoal,
        currentLocation,
        needs?.hunger ?? 0,
        simulationClock?.currentMinutes ?? 360,
        dayIndex
      );

      position.current.set(...result.newPosition);
      velocity.current.set(...result.newVelocity);
      targetRotation.current = result.newRotation;
      pitch.current = THREE.MathUtils.lerp(pitch.current, result.pitch, dt * 8);
      roll.current = THREE.MathUtils.lerp(roll.current, result.roll, dt * 8);

      setProboscisExt(result.proboscisExtension);
      setIsFeedingActive(result.isFeeding);

      // Apply gradual need updates from feeding to simulation engine
      if (result.isFeeding && (result.hungerDelta !== 0 || result.energyDelta !== 0)) {
        const currentHunger = needs?.hunger ?? 0;
        const currentEnergy = needs?.energy ?? 100;
        simulationEngine.setNeed('hunger', Math.max(0, currentHunger + result.hungerDelta));
        simulationEngine.setNeed('energy', Math.min(100, currentEnergy + result.energyDelta));
      }

      const flightSpeed = velocity.current.length();
      const currentSimPose = simulationEngine.getCurrentFlyActivity();

      // Check arrival proximity to destination
      if (result.isFeeding) {
        if (isMoving) setIsMoving(false);
        setFlyActivity('eating');
      } else if (currentGoal && currentGoal.isArrived) {
        if (isMoving) setIsMoving(false);
        // Settle into schedule/activity pose when arrived at destination
        setFlyActivity(currentSimPose);
      } else if (flightSpeed > 0.3) {
        if (!isMoving) setIsMoving(true);
        setFlyActivity('flying');
      } else {
        if (isMoving) setIsMoving(false);
        setFlyActivity(result.activityPose);
      }

      // Throttle snapshot dispatch to Zustand store at 15 Hz (~66ms) instead of 60Hz/120Hz
      const now = performance.now();
      if (now - lastSnapshotSyncTime.current > 65) {
        setConnectomeSnapshot(result.snapshot);
        lastSnapshotSyncTime.current = now;
      }
    } else if (isAutonomous) {
      // 2. Schedule-Driven & Cognitive Utility Waypoint Navigation
      const currentLocConfig = LOCATIONS[currentLocation];
      const activeWaypointKey = simulationEngine.getCurrentWaypoint();
      const waypointCoords = currentLocConfig?.waypoints?.[activeWaypointKey];

      let targetX = 0;
      let targetY = 1.6;
      let targetZ = 0;

      if (waypointCoords) {
        targetX = waypointCoords[0];
        targetY = waypointCoords[1];
        targetZ = waypointCoords[2];
      } else {
        const targetLandmarkName = currentActivity?.definition.targetLandmarkName;
        const targetLm = currentLocConfig?.landmarks.find((lm) => lm.name === targetLandmarkName) ||
          currentLocConfig?.landmarks[0];
        if (targetLm) {
          targetX = (targetLm.minX + targetLm.maxX) / 2;
          targetZ = (targetLm.minZ + targetLm.maxZ) / 2;
          targetY = targetLm.minY !== undefined ? (targetLm.minY + (targetLm.maxY || targetLm.minY + 1.2)) / 2 : 1.6;
        }
      }

      // Small organic micro-wander around target waypoint
      const timeSec = performance.now() / 1000;
      const wanderX = targetX + Math.sin(timeSec * 1.4) * 0.15;
      const wanderY = targetY + Math.sin(timeSec * 2.1) * 0.08;
      const wanderZ = targetZ + Math.cos(timeSec * 1.1) * 0.15;

      const autoDir = new THREE.Vector3(
        wanderX - position.current.x,
        wanderY - position.current.y,
        wanderZ - position.current.z
      );
      const dist = autoDir.length();

      // Dynamic movement speed & acceleration based on activity
      const currentSimPose = simulationEngine.getCurrentFlyActivity();
      let autoSpeed = 4.2;
      let autoAccel = 16.0;

      if (currentSimPose === 'phone_call') {
        autoSpeed = 2.4; // steady walking pace
        autoAccel = 10.0;
      } else if (currentSimPose === 'workout') {
        autoSpeed = 3.6;
        autoAccel = 14.0;
      } else if (currentLocation === 'travel') {
        autoSpeed = 5.2;
        autoAccel = 22.0;
      }

      // Clamp to autoSpeed
      if (velocity.current.length() > autoSpeed) {
        velocity.current.clampLength(0, autoSpeed);
      }

      if (dist > 0.35) {
        autoDir.normalize();
        // Acceleration towards waypoint
        velocity.current.x += autoDir.x * autoAccel * dt;
        velocity.current.y += autoDir.y * (autoAccel * 0.8) * dt;
        velocity.current.z += autoDir.z * autoAccel * dt;

        targetRotation.current = Math.atan2(autoDir.x, autoDir.z) + Math.PI;
        if (!isMoving) {
          setIsMoving(true);
          setFlyActivity('flying');
        }
      } else {
        // Arrived at waypoint: decelerate and adopt active state pose
        velocity.current.multiplyScalar(0.85);
        if (isMoving) {
          setIsMoving(false);
        }
        setFlyActivity(currentSimPose);
      }

      pitch.current = THREE.MathUtils.lerp(pitch.current, 0, dt * 6);
      roll.current = THREE.MathUtils.lerp(roll.current, 0, dt * 6);
    } else {
      if (isMoving) {
        setIsMoving(false);
        setFlyActivity('hovering');
      }
      pitch.current = THREE.MathUtils.lerp(pitch.current, 0, dt * 6);
      roll.current = THREE.MathUtils.lerp(roll.current, 0, dt * 6);
    }

    // Apply air friction / damping
    velocity.current.x -= velocity.current.x * friction * dt;
    velocity.current.y -= velocity.current.y * friction * dt;
    velocity.current.z -= velocity.current.z * friction * dt;

    // Clamp maximum speed for manual flight
    if (!isAutonomous && velocity.current.length() > moveSpeed) {
      velocity.current.clampLength(0, moveSpeed);
    }

    // Update position
    position.current.addScaledVector(velocity.current, dt);

    // Enforce active room boundaries (or vast open-world boundary bounds)
    const effectiveBounds = isAutonomous && controllerMode === 'connectome'
      ? { minX: -55, maxX: 45, minY: 0.15, maxY: 12.0, minZ: -15, maxZ: 125 }
      : roomBounds;

    const { minX, maxX, minY, maxY, minZ, maxZ } = effectiveBounds;

    if (position.current.x < minX) {
      position.current.x = minX;
      velocity.current.x *= -0.3; // Gentle bumper bounce
    } else if (position.current.x > maxX) {
      position.current.x = maxX;
      velocity.current.x *= -0.3;
    }

    if (position.current.y < minY) {
      position.current.y = minY;
      velocity.current.y = 0;
    } else if (position.current.y > maxY) {
      position.current.y = maxY;
      velocity.current.y *= -0.3;
    }

    if (position.current.z < minZ) {
      position.current.z = minZ;
      velocity.current.z *= -0.3;
    } else if (position.current.z > maxZ) {
      position.current.z = maxZ;
      velocity.current.z *= -0.3;
    }

    // Smooth rotation slerp
    currentRotation.current = THREE.MathUtils.lerp(
      currentRotation.current,
      targetRotation.current,
      dt * 12
    );

    // Apply to Three.js Object3D directly (instant 60fps GPU transform, zero React overhead)
    if (groupRef.current) {
      groupRef.current.position.copy(position.current);
      groupRef.current.rotation.y = currentRotation.current;
      groupRef.current.rotation.x = pitch.current;
      groupRef.current.rotation.z = roll.current;
    }

    // Performance: Throttle React global store coordinate updates to 20 Hz (~50ms)
    const nowTime = performance.now();
    if (nowTime - lastStoreSyncTime.current > 50) {
      setFlyPosition([position.current.x, position.current.y, position.current.z]);
      lastStoreSyncTime.current = nowTime;
    }

    // Dynamic landmark location detection (throttled to 5 Hz / 200ms)
    if (nowTime - lastSpotSyncTime.current > 200) {
      lastSpotSyncTime.current = nowTime;
      const px = position.current.x;
      const py = position.current.y;
      const pz = position.current.z;

      let spot = `Airspace • ${LOCATIONS[currentLocation]?.name || 'Chennai World'}`;

      // Sector-based open world spot identification
      if (pz > 70 && pz < 120) {
        spot = 'Sairam College Campus & Lecture Hall CS-301';
      } else if (pz > 20 && pz <= 70 && px < -18) {
        spot = 'Mega Fitness Gym & Workout Center';
      } else if (pz > 12 && pz <= 70) {
        spot = '1 km Commute Thoroughfare & Chennai Bus Transit';
      } else if (px > 10 && pz < 10) {
        spot = 'PG Dining Mess & Meal Area';
      } else if (px < -10 && pz < 10) {
        spot = 'Apartment Grounds Courtyard & Security Gate';
      } else if (pz < -4) {
        spot = 'Balcony Laundry & Clothes Drying Railing';
      } else {
        const currentLocConfig = LOCATIONS[currentLocation];
        const activeLandmarks = currentLocConfig ? currentLocConfig.landmarks : [];
        for (const lm of activeLandmarks) {
          if (
            px >= lm.minX && px <= lm.maxX &&
            pz >= lm.minZ && pz <= lm.maxZ &&
            (lm.minY === undefined || py >= lm.minY) &&
            (lm.maxY === undefined || py <= lm.maxY)
          ) {
            spot = lm.name;
            break;
          }
        }
      }

      setCurrentSpot(spot);
    }
  });

  return (
    <group ref={groupRef} position={[...flyPosition]}>
      <FruitFly
        isMoving={isMoving}
        activity={flyActivity}
        proboscisExtension={proboscisExt}
        isFeeding={isFeedingActive}
      />
    </group>
  );
};
