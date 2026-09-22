import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore, simulationEngine } from '../../../store/useGameStore';
import { LOCATIONS } from '../../../navigation/locationGraph';

interface InteractionHighlightProps {
  /** Override specific waypoint if desired, otherwise automatically determined */
  waypointKey?: string;
  color?: string;
}

/**
 * 3D Contextual Interaction Highlight (Milestone 5 Req #13):
 * Renders a restrained, pulsating holographic beacon / ground marker
 * at the active point of interest (e.g., active gym station, study desk,
 * dining table, balcony clothesline, apartment security gate).
 */
export const InteractionHighlight: React.FC<InteractionHighlightProps> = ({
  waypointKey,
  color = '#f59e0b',
}) => {
  const currentLocation = useGameStore((state) => state.currentLocation);
  const currentActivity = useGameStore((state) => state.currentActivity);
  const workoutSession = useGameStore((state) => state.workoutSession);
  const foodOrderState = useGameStore((state) => state.foodOrderState);

  const ringRef = useRef<THREE.Mesh>(null);
  const beaconRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));

  // Determine active waypoint key
  let activeKey = waypointKey;
  if (!activeKey) {
    if (currentLocation === 'gym' && workoutSession && !workoutSession.isCompleted) {
      activeKey = simulationEngine.getCurrentWaypoint();
    } else if (currentLocation === 'grounds' && foodOrderState && (foodOrderState.stage === 'walking_to_gate' || foodOrderState.stage === 'collecting_food')) {
      activeKey = 'apartment_gate';
    } else if (currentLocation === 'bedroom') {
      const actId = currentActivity?.definition.id;
      if (actId === 'project_work' || actId === 'college_assignments') {
        activeKey = 'desk';
      } else if (actId === 'sleep' || actId === 'wake_up_morning_routine') {
        activeKey = 'bed';
      } else if (actId === 'laundry') {
        activeKey = 'wardrobe';
      }
    } else if (currentLocation === 'dining') {
      activeKey = 'dining_table_seat';
    } else if (currentLocation === 'balcony') {
      activeKey = 'clothesline';
    } else if (currentLocation === 'classroom') {
      const actId = currentActivity?.definition.id;
      if (actId === 'college_activities') {
        activeKey = simulationEngine.getCurrentWaypoint() || 'student_desk_front';
      }
    }
  }

  const locConfig = LOCATIONS[currentLocation];
  const coords = activeKey && locConfig?.waypoints ? locConfig.waypoints[activeKey] : null;

  useFrame((state, delta) => {
    if (!coords || !beaconRef.current) return;

    const time = state.clock.getElapsedTime();

    // Smooth position lerp towards active target
    const targetY = Math.max(0.04, Math.min(coords[1] * 0.4, 0.2));
    const targetVec = new THREE.Vector3(coords[0], targetY, coords[2]);
    currentPos.current.lerp(targetVec, Math.min(delta * 8, 1));
    beaconRef.current.position.copy(currentPos.current);

    // Subtle breathing pulse
    if (ringRef.current) {
      const pulse = 1 + Math.sin(time * 3.0) * 0.08;
      ringRef.current.scale.set(pulse, pulse, pulse);
      ringRef.current.rotation.z += delta * 0.8;
    }
  });

  if (!coords) return null;

  return (
    <group ref={beaconRef} position={[coords[0], 0.04, coords[2]]} name="InteractionBeacon">
      {/* Outer subtle rotating ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.48, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner glowing core disk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Vertical subtle indicator beam */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.02, 0.08, 0.7, 12, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Soft local ground illumination */}
      <pointLight
        position={[0, 0.25, 0]}
        color={color}
        intensity={0.7}
        distance={2.0}
        decay={2}
      />
    </group>
  );
};
