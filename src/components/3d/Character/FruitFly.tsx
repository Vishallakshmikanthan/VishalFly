import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface FruitFlyProps {
  isMoving?: boolean;
}

/**
 * Procedural 3D Fruit Fly Character:
 * - Rounded golden-brown amber body with abdominal stripes
 * - Large expressive ruby compound eyes
 * - Two translucent wings with high-frequency fluttering animation
 * - Six jointed legs tucked in flight pose
 * - Delicate antennae
 * - Hovering bob & tilt idle physics
 * - Subtle ambient warm glow to stand out against dark charcoal walls
 */
export const FruitFly: React.FC<FruitFlyProps> = ({ isMoving = false }) => {
  const bodyRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);
  const leftAntennaRef = useRef<THREE.Group>(null);
  const rightAntennaRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Wing-flapping animation (rapid flutter, faster when moving)
    const flapFreq = isMoving ? 55 : 32;
    const flapAmp = isMoving ? 0.55 : 0.28;
    const flap = Math.sin(time * flapFreq) * flapAmp;

    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = flap;
      leftWingRef.current.rotation.x = Math.cos(time * flapFreq) * 0.12;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = -flap;
      rightWingRef.current.rotation.x = Math.cos(time * flapFreq) * 0.12;
    }

    // 2. Gentle hovering idle bobbing & micro-oscillation
    if (bodyRef.current) {
      const bobY = Math.sin(time * 3.5) * 0.035;
      const tiltZ = Math.sin(time * 2.2) * 0.04;
      const pitchX = Math.cos(time * 1.8) * 0.03;

      bodyRef.current.position.y = bobY;
      bodyRef.current.rotation.z = tiltZ;
      bodyRef.current.rotation.x = pitchX;
    }

    // 3. Subtle twitching of antennae
    if (leftAntennaRef.current && rightAntennaRef.current) {
      const twitch = Math.sin(time * 8) * 0.08;
      leftAntennaRef.current.rotation.y = twitch;
      rightAntennaRef.current.rotation.y = -twitch;
    }
  });

  return (
    <group ref={bodyRef} name="FruitFlyModel" scale={[1.2, 1.2, 1.2]}>
      {/* Subtle fly personal glow to ensure high visibility against dark walls */}
      <pointLight
        position={[0, 0.15, 0]}
        color="#fbbf24"
        intensity={0.65}
        distance={1.5}
        decay={2}
      />

      {/* 1. Abdomen (Rounded golden-brown ellipsoid with stripes) */}
      <group position={[0, -0.02, -0.16]} rotation={[0.2, 0, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial
            color="#d97706" // Warm golden-amber
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
        {/* Abdomen stripe rings */}
        {[-0.04, 0, 0.04].map((z, idx) => (
          <mesh key={`stripe-${idx}`} position={[0, 0, z]}>
            <torusGeometry args={[0.105, 0.012, 8, 16]} />
            <meshStandardMaterial color="#78350f" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* 2. Thorax (Chitin segment) */}
      <mesh position={[0, 0.02, 0.01]} castShadow>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color="#92400e" // Darker bronze chitin
          roughness={0.45}
          metalness={0.3}
        />
      </mesh>

      {/* 3. Head & Expressive Compound Eyes */}
      <group position={[0, 0.03, 0.12]}>
        {/* Head center */}
        <mesh castShadow>
          <sphereGeometry args={[0.065, 16, 16]} />
          <meshStandardMaterial color="#451a03" roughness={0.5} />
        </mesh>

        {/* Large Ruby Compound Eye (Left) */}
        <group position={[-0.055, 0.02, 0.02]}>
          <mesh castShadow>
            <sphereGeometry args={[0.048, 16, 16]} />
            <meshStandardMaterial
              color="#dc2626" // Vivid ruby-red
              roughness={0.15}
              metalness={0.6}
              emissive="#991b1b"
              emissiveIntensity={0.25}
            />
          </mesh>
          {/* Eye specular highlight */}
          <mesh position={[-0.02, 0.02, 0.03]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Large Ruby Compound Eye (Right) */}
        <group position={[0.055, 0.02, 0.02]}>
          <mesh castShadow>
            <sphereGeometry args={[0.048, 16, 16]} />
            <meshStandardMaterial
              color="#dc2626"
              roughness={0.15}
              metalness={0.6}
              emissive="#991b1b"
              emissiveIntensity={0.25}
            />
          </mesh>
          {/* Eye specular highlight */}
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
      </group>

      {/* 4. Translucent Wings */}
      {/* Left Wing */}
      <group ref={leftWingRef} position={[-0.05, 0.08, -0.02]}>
        <group position={[-0.14, 0, -0.05]} rotation={[-0.1, -0.2, 0.15]}>
          {/* Wing Membrane */}
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.004, 0.15]} />
            <meshPhysicalMaterial
              color="#e0f2fe"
              transparent
              opacity={0.6}
              roughness={0.1}
              transmission={0.8}
              ior={1.4}
            />
          </mesh>
          {/* Main wing vein */}
          <mesh position={[0, 0.003, 0.04]}>
            <boxGeometry args={[0.25, 0.003, 0.006]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
        </group>
      </group>

      {/* Right Wing */}
      <group ref={rightWingRef} position={[0.05, 0.08, -0.02]}>
        <group position={[0.14, 0, -0.05]} rotation={[-0.1, 0.2, -0.15]}>
          {/* Wing Membrane */}
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.004, 0.15]} />
            <meshPhysicalMaterial
              color="#e0f2fe"
              transparent
              opacity={0.6}
              roughness={0.1}
              transmission={0.8}
              ior={1.4}
            />
          </mesh>
          {/* Main wing vein */}
          <mesh position={[0, 0.003, 0.04]}>
            <boxGeometry args={[0.25, 0.003, 0.006]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
        </group>
      </group>

      {/* 5. Six Small Legs (Jointed, tucked in flight) */}
      {/* Left Legs */}
      {[
        { pos: [-0.07, -0.05, 0.06], rot: [0.3, 0, 0.5] },   // Front left
        { pos: [-0.08, -0.06, 0.00], rot: [0, 0, 0.6] },     // Mid left
        { pos: [-0.07, -0.05, -0.06], rot: [-0.3, 0, 0.7] }, // Hind left
      ].map((leg, i) => (
        <group key={`l-leg-${i}`} position={leg.pos as [number, number, number]} rotation={leg.rot as [number, number, number]}>
          {/* Upper leg segment */}
          <mesh position={[0, -0.03, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.07, 6]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
          {/* Lower leg segment */}
          <mesh position={[-0.015, -0.07, 0]} rotation={[0, 0, -0.6]}>
            <cylinderGeometry args={[0.003, 0.003, 0.06, 6]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        </group>
      ))}

      {/* Right Legs */}
      {[
        { pos: [0.07, -0.05, 0.06], rot: [0.3, 0, -0.5] },   // Front right
        { pos: [0.08, -0.06, 0.00], rot: [0, 0, -0.6] },     // Mid right
        { pos: [0.07, -0.05, -0.06], rot: [-0.3, 0, -0.7] }, // Hind right
      ].map((leg, i) => (
        <group key={`r-leg-${i}`} position={leg.pos as [number, number, number]} rotation={leg.rot as [number, number, number]}>
          {/* Upper leg segment */}
          <mesh position={[0, -0.03, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.07, 6]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
          {/* Lower leg segment */}
          <mesh position={[0.015, -0.07, 0]} rotation={[0, 0, 0.6]}>
            <cylinderGeometry args={[0.003, 0.003, 0.06, 6]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
