import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../store/useGameStore';
import { LOCATIONS } from '../../../navigation/locationGraph';
import { FruitFly } from './FruitFly';

/**
 * FlyController:
 * - Manages WASD / Arrow Keys + Space/Shift 3D flight mechanics
 * - Velocity damping, smooth banking, and heading rotation
 * - Strictly enforces active environment's room collision boundaries
 * - Teleports & synchronizes fly position when location changes
 * - Dynamic landmark detection for the active location
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

  // Flight vectors
  const position = useRef(new THREE.Vector3(...flyPosition));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const pitch = useRef(0);
  const roll = useRef(0);

  const [isMoving, setIsMoving] = useState(false);

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
    if (moving !== isMoving) {
      setIsMoving(moving);
      setFlyActivity(moving ? 'flying' : 'hovering');
    }

    if (moving) {
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
    } else {
      pitch.current = THREE.MathUtils.lerp(pitch.current, 0, dt * 6);
      roll.current = THREE.MathUtils.lerp(roll.current, 0, dt * 6);
    }

    // Apply air friction / damping
    velocity.current.x -= velocity.current.x * friction * dt;
    velocity.current.y -= velocity.current.y * friction * dt;
    velocity.current.z -= velocity.current.z * friction * dt;

    // Clamp maximum speed
    if (velocity.current.length() > moveSpeed) {
      velocity.current.clampLength(0, moveSpeed);
    }

    // Update position
    position.current.addScaledVector(velocity.current, dt);

    // Enforce active room boundaries
    const { minX, maxX, minY, maxY, minZ, maxZ } = roomBounds;

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

    // Apply to group
    if (groupRef.current) {
      groupRef.current.position.copy(position.current);
      groupRef.current.rotation.y = currentRotation.current;
      groupRef.current.rotation.x = pitch.current;
      groupRef.current.rotation.z = roll.current;
    }

    // Update global store coordinates
    setFlyPosition([position.current.x, position.current.y, position.current.z]);

    // Dynamic landmark location detection based on active location
    const px = position.current.x;
    const py = position.current.y;
    const pz = position.current.z;

    const currentLocConfig = LOCATIONS[currentLocation];
    const activeLandmarks = currentLocConfig ? currentLocConfig.landmarks : [];
    let spot = `Airspace • ${currentLocConfig ? currentLocConfig.name : 'Room'}`;

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
    setCurrentSpot(spot);
  });

  return (
    <group ref={groupRef} position={[...flyPosition]}>
      <FruitFly isMoving={isMoving} />
    </group>
  );
};
