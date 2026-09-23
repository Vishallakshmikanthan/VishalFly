import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { FlyActivity } from '../../../types';

interface FruitFlyProps {
  isMoving?: boolean;
  activity?: FlyActivity;
  proboscisExtension?: number; // 0.0 (retracted) to 1.0 (fully extended)
  isFeeding?: boolean;
}

/**
 * Procedural 3D Fruit Fly Character with 15 Distinct Activity Poses:
 * - IDLE, WALKING, FLYING, SITTING, SLEEPING, WORKING, EATING, PHONE_CALL
 * - WORKOUT, RESTING, LAUNDRY, DRYING_CLOTHES, GAMING, BROWSING, DOZING
 * - Expressive ruby compound eyes with variable glow
 * - Dynamic translucent wings with state-dependent fluttering & folding
 * - Articulated proboscis with Proboscis Extension Reflex (PER) and labellar tasting pads
 * - Six jointed legs and twitching antennae
 */
export const FruitFly: React.FC<FruitFlyProps> = ({ 
  isMoving = false, 
  activity = 'hovering',
  proboscisExtension = 0.0,
  isFeeding = false,
}) => {
  const bodyRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);
  const leftAntennaRef = useRef<THREE.Group>(null);
  const rightAntennaRef = useRef<THREE.Group>(null);
  const proboscisRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Wing-flapping and folding animation per activity state
    let flapFreq = isMoving ? 55 : 32;
    let flapAmp = isMoving ? 0.55 : 0.28;
    let wingFoldZ = 0;
    let wingPitchX = 0;

    const isGrounded = activity === 'sleeping' || activity === 'sitting' || activity === 'resting';
    const isWorkingState = activity === 'working' || activity === 'browsing';
    const isGaming = activity === 'gaming';
    const isDozing = activity === 'dozing';
    const isEating = activity === 'eating';
    const isWorkout = activity === 'workout';
    const isCall = activity === 'phone_call';

    if (activity === 'sleeping') {
      flapFreq = 8;
      flapAmp = 0.02; // barely breathing
      wingFoldZ = -0.3;
    } else if (isGrounded) {
      flapFreq = 12;
      flapAmp = 0.06;
      wingFoldZ = -0.2;
    } else if (isDozing) {
      flapFreq = 14;
      flapAmp = 0.12;
    } else if (isWorkout) {
      flapFreq = 60;
      flapAmp = 0.6;
    } else if (isGaming) {
      flapFreq = 48;
      flapAmp = 0.45;
    }

    const flap = Math.sin(time * flapFreq) * flapAmp + wingFoldZ;
    wingPitchX = Math.cos(time * flapFreq) * 0.12;

    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = flap;
      leftWingRef.current.rotation.x = wingPitchX;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = -flap;
      rightWingRef.current.rotation.x = wingPitchX;
    }

    // 2. Body pose, bobbing, and orientation per activity state
    if (bodyRef.current) {
      let bobY = Math.sin(time * 3.5) * 0.035;
      let tiltZ = Math.sin(time * 2.2) * 0.04;
      let pitchX = Math.cos(time * 1.8) * 0.03;
      let yawY = 0;

      if (activity === 'sleeping') {
        bobY = Math.sin(time * 1.5) * 0.01 - 0.05; // Resting flat
        pitchX = 0.15; // Lowered head
        tiltZ = 0;
      } else if (isDozing) {
        bobY = Math.sin(time * 2.0) * 0.02 - 0.03;
        pitchX = 0.28; // Drooping head
        tiltZ = Math.sin(time * 1.2) * 0.08;
      } else if (isEating) {
        // Rhythmic dipping forward
        bobY = Math.sin(time * 7) * 0.04 - 0.03;
        pitchX = 0.2 + Math.sin(time * 7) * 0.1;
      } else if (isWorkout) {
        // High-energy rhythmic pressing/bobbing
        bobY = Math.sin(time * 9) * 0.08;
        pitchX = Math.cos(time * 9) * 0.1;
      } else if (isCall) {
        // Walking call sway and head tilt
        tiltZ = 0.18 + Math.sin(time * 2.5) * 0.06;
        bobY = Math.sin(time * 4.5) * 0.025;
      } else if (isGaming) {
        // Darting micro-jitters
        yawY = Math.sin(time * 18) * 0.12;
        pitchX = Math.cos(time * 14) * 0.08;
      } else if (activity === 'browsing') {
        // Horizontal scan across monitor
        yawY = Math.sin(time * 2.0) * 0.22;
      } else if (isWorkingState) {
        pitchX = -0.1; // Alert upright pose facing laptop
      }

      bodyRef.current.position.y = bobY;
      bodyRef.current.rotation.z = tiltZ;
      bodyRef.current.rotation.x = pitchX;
      bodyRef.current.rotation.y = yawY;
    }

    // 3. Antennae twitching
    if (leftAntennaRef.current && rightAntennaRef.current) {
      const twitchSpeed = isGaming ? 24 : isWorkingState ? 14 : isDozing ? 3 : 8;
      const twitchAmp = isDozing ? 0.02 : 0.08;
      const twitch = Math.sin(time * twitchSpeed) * twitchAmp;
      leftAntennaRef.current.rotation.y = twitch;
      rightAntennaRef.current.rotation.y = -twitch;
    }

    // 4. Proboscis extension & rhythmic feeding dipping
    if (proboscisRef.current) {
      const ext = proboscisExtension > 0 ? proboscisExtension : (activity === 'eating' || isEating || isFeeding ? 0.95 : 0.0);
      const extY = -0.04 - ext * 0.055;
      const extZ = 0.02 + ext * 0.035;
      const extPitch = ext * 0.25 + ((isEating || isFeeding) ? Math.sin(time * 12) * 0.06 : 0);
      proboscisRef.current.position.y = extY;
      proboscisRef.current.position.z = extZ;
      proboscisRef.current.rotation.x = extPitch;
      proboscisRef.current.scale.set(1 + ext * 0.15, 1 + ext * 0.75, 1 + ext * 0.15);
    }

    // 5. Dynamic eye luminescence and personal point light
    if (lightRef.current) {
      if (activity === 'sleeping' || isDozing) {
        lightRef.current.intensity = 0.2;
      } else if (isWorkout) {
        lightRef.current.intensity = 0.9;
      } else {
        lightRef.current.intensity = 0.65;
      }
    }
  });

  const eyeColor = activity === 'sleeping' ? '#7f1d1d' : '#dc2626';
  const eyeEmissive = activity === 'sleeping' ? '#450a0a' : isMoving || activity === 'workout' ? '#b91c1c' : '#991b1b';

  return (
    <group ref={bodyRef} name="FruitFlyModel" scale={[1.2, 1.2, 1.2]}>
      {/* Subtle fly personal glow */}
      <pointLight
        ref={lightRef}
        position={[0, 0.15, 0]}
        color="#fbbf24"
        intensity={0.65}
        distance={1.5}
        decay={2}
      />

      {/* 1. Abdomen (Rounded golden-brown amber with dark chitin rings) */}
      <group position={[0, -0.02, -0.16]} rotation={[0.2, 0, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial
            color="#d97706"
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
        {[-0.04, 0, 0.04].map((z, idx) => (
          <mesh key={`stripe-${idx}`} position={[0, 0, z]}>
            <torusGeometry args={[0.105, 0.012, 8, 16]} />
            <meshStandardMaterial color="#78350f" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* 2. Thorax */}
      <mesh position={[0, 0.02, 0.01]} castShadow>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color="#92400e"
          roughness={0.45}
          metalness={0.3}
        />
      </mesh>

      {/* 3. Head & Compound Eyes */}
      <group position={[0, 0.03, 0.12]}>
        <mesh castShadow>
          <sphereGeometry args={[0.065, 16, 16]} />
          <meshStandardMaterial color="#451a03" roughness={0.5} />
        </mesh>

        {/* Large Ruby Eye (Left) */}
        <group position={[-0.055, 0.02, 0.02]}>
          <mesh castShadow>
            <sphereGeometry args={[0.048, 16, 16]} />
            <meshStandardMaterial
              color={eyeColor}
              roughness={0.15}
              metalness={0.6}
              emissive={eyeEmissive}
              emissiveIntensity={0.3}
            />
          </mesh>
          <mesh position={[-0.02, 0.02, 0.03]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Large Ruby Eye (Right) */}
        <group position={[0.055, 0.02, 0.02]}>
          <mesh castShadow>
            <sphereGeometry args={[0.048, 16, 16]} />
            <meshStandardMaterial
              color={eyeColor}
              roughness={0.15}
              metalness={0.6}
              emissive={eyeEmissive}
              emissiveIntensity={0.3}
            />
          </mesh>
          <mesh position={[0.02, 0.02, 0.03]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Antennae */}
        <group ref={leftAntennaRef} position={[-0.02, 0.055, 0.05]}>
          <mesh position={[-0.015, 0.04, 0.02]} rotation={[0.4, 0, -0.3]}>
            <cylinderGeometry args={[0.003, 0.003, 0.08, 6]} />
            <meshStandardMaterial color="#fef08a" />
          </mesh>
          <mesh position={[-0.03, 0.075, 0.04]}>
            <sphereGeometry args={[0.008, 6, 6]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
        </group>

        <group ref={rightAntennaRef} position={[0.02, 0.055, 0.05]}>
          <mesh position={[0.015, 0.04, 0.02]} rotation={[0.4, 0, 0.3]}>
            <cylinderGeometry args={[0.003, 0.003, 0.08, 6]} />
            <meshStandardMaterial color="#fef08a" />
          </mesh>
          <mesh position={[0.03, 0.075, 0.04]}>
            <sphereGeometry args={[0.008, 6, 6]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
        </group>

        {/* Articulated Proboscis with PER Extension & Labellar Tasting Lobes */}
        <group ref={proboscisRef} position={[0, -0.04, 0.02]}>
          {/* Basal Rostrum Cone */}
          <mesh position={[0, -0.012, 0]}>
            <cylinderGeometry args={[0.014, 0.018, 0.025, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.6} />
          </mesh>
          {/* Haustellum Shaft */}
          <mesh position={[0, -0.032, 0.004]} rotation={[0.15, 0, 0]}>
            <cylinderGeometry args={[0.009, 0.011, 0.03, 8]} />
            <meshStandardMaterial color="#92400e" roughness={0.5} />
          </mesh>
          {/* Labellar Lobes (Tasting pads with sensory hairs) */}
          <group position={[0, -0.052, 0.008]}>
            {/* Left Labellar Pad */}
            <mesh position={[-0.012, 0, 0]} rotation={[0, 0, 0.25]}>
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshStandardMaterial color="#b45309" roughness={0.4} />
            </mesh>
            {/* Right Labellar Pad */}
            <mesh position={[0.012, 0, 0]} rotation={[0, 0, -0.25]}>
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshStandardMaterial color="#b45309" roughness={0.4} />
            </mesh>
            {/* Sugar nutrient glow during active feeding */}
            {(activity === 'eating' || isFeeding || proboscisExtension > 0.4) && (
              <mesh position={[0, -0.006, 0]}>
                <sphereGeometry args={[0.007, 8, 8]} />
                <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={0.7} />
              </mesh>
            )}
          </group>
        </group>
      </group>

      {/* 4. Translucent Wings */}
      <group ref={leftWingRef} position={[-0.05, 0.08, -0.02]}>
        <group position={[-0.14, 0, -0.05]} rotation={[-0.1, -0.2, 0.15]}>
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.004, 0.15]} />
            <meshPhysicalMaterial
              color="#e0f2fe"
              transparent
              opacity={0.65}
              roughness={0.1}
              transmission={0.85}
              ior={1.4}
            />
          </mesh>
          <mesh position={[0, 0.003, 0.04]}>
            <boxGeometry args={[0.25, 0.003, 0.006]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
        </group>
      </group>

      <group ref={rightWingRef} position={[0.05, 0.08, -0.02]}>
        <group position={[0.14, 0, -0.05]} rotation={[-0.1, 0.2, -0.15]}>
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.004, 0.15]} />
            <meshPhysicalMaterial
              color="#e0f2fe"
              transparent
              opacity={0.65}
              roughness={0.1}
              transmission={0.85}
              ior={1.4}
            />
          </mesh>
          <mesh position={[0, 0.003, 0.04]}>
            <boxGeometry args={[0.25, 0.003, 0.006]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
        </group>
      </group>

      {/* 5. Six Jointed Legs */}
      {[
        { pos: [-0.07, -0.05, 0.06], rot: [0.3, 0, 0.5] },
        { pos: [-0.08, -0.06, 0.00], rot: [0, 0, 0.6] },
        { pos: [-0.07, -0.05, -0.06], rot: [-0.3, 0, 0.7] },
      ].map((leg, i) => (
        <group key={`l-leg-${i}`} position={leg.pos as [number, number, number]} rotation={leg.rot as [number, number, number]}>
          <mesh position={[0, -0.03, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.07, 6]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
          <mesh position={[-0.015, -0.07, 0]} rotation={[0, 0, -0.6]}>
            <cylinderGeometry args={[0.003, 0.003, 0.06, 6]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        </group>
      ))}

      {[
        { pos: [0.07, -0.05, 0.06], rot: [0.3, 0, -0.5] },
        { pos: [0.08, -0.06, 0.00], rot: [0, 0, -0.6] },
        { pos: [0.07, -0.05, -0.06], rot: [-0.3, 0, -0.7] },
      ].map((leg, i) => (
        <group key={`r-leg-${i}`} position={leg.pos as [number, number, number]} rotation={leg.rot as [number, number, number]}>
          <mesh position={[0, -0.03, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.07, 6]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
          <mesh position={[0.015, -0.07, 0]} rotation={[0, 0, 0.6]}>
            <cylinderGeometry args={[0.003, 0.003, 0.06, 6]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        </group>
      ))}

      {/* 6. Contact Depth Shadow Disk */}
      <mesh position={[0, -0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.18, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>
    </group>
  );
};
