import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../store/useGameStore';

/**
 * MetropolitanInfiniteHorizon:
 * Procedural infinite urban expanse ensuring zero blank spaces when zooming out:
 * 1. Massive 3,200 x 3,200 Continuous Terrain Foundation
 * 2. 600+ Procedural Suburban Residential Houses with gabled roofs & chimneys (InstancedMesh)
 * 3. 200+ Distant Metropolitan Skyscrapers ringing outer skyline districts (InstancedMesh)
 * 4. Arterial Highway Web radiating 1.5 km to the horizon
 * 5. Animated distant traffic light streams (headlights & taillights)
 * 6. Low-poly Mountain Ranges bounding the horizon basin
 */

export const MetropolitanInfiniteHorizon: React.FC = () => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const isNightOrEvening = timeOfDay === 'night' || timeOfDay === 'evening';

  // -------------------------------------------------------------
  // 1. URBAN MULTI-STORY APARTMENTS & RESIDENTIAL BLOCKS (INSTANCED MESH)
  // -------------------------------------------------------------
  const urbanBlockCount = 420;
  const urbanBlocksRef = useRef<THREE.InstancedMesh>(null);
  const urbanTopsRef = useRef<THREE.InstancedMesh>(null);

  // Generate metropolitan residential & commercial blocks between radius 80 and 480
  const urbanBlockTransforms = useMemo(() => {
    const list: { pos: [number, number, number]; rotY: number; scale: [number, number, number] }[] = [];

    let count = 0;
    for (let ring = 0; ring < 6; ring++) {
      const radius = 85 + ring * 65;
      const blocksInRing = 35 + ring * 20;
      for (let i = 0; i < blocksInRing; i++) {
        if (count >= urbanBlockCount) break;
        const angle = (i / blocksInRing) * Math.PI * 2 + (ring * 0.2);
        const jitterX = Math.sin(i * 13) * 14;
        const jitterZ = Math.cos(i * 17) * 14;
        const x = Math.cos(angle) * radius + jitterX;
        const z = Math.sin(angle) * (radius * 0.95) + 25 + jitterZ;

        // Skip central highway & airport corridors
        if (Math.abs(x) < 22 && z > -70 && z < 110) continue;
        if (x > 80 && x < 180 && z > 90 && z < 210) continue; // Airport zone

        // Height: 4 to 12 stories (14m to 38m)
        const height = 14 + (i % 5) * 5 + (ring % 3) * 4;
        const width = 12 + (i % 4) * 3;
        const depth = 10 + (i % 3) * 3;

        list.push({
          pos: [x, height / 2, z],
          rotY: angle + Math.PI / 2 + (Math.sin(i) * 0.25),
          scale: [width, height, depth],
        });
        count++;
      }
    }
    return list;
  }, [urbanBlockCount]);

  useMemo(() => {
    const dummy = new THREE.Object3D();
    setTimeout(() => {
      if (urbanBlocksRef.current && urbanTopsRef.current) {
        urbanBlockTransforms.forEach((b, idx) => {
          // Main Building Block
          dummy.position.set(b.pos[0], b.pos[1], b.pos[2]);
          dummy.rotation.set(0, b.rotY, 0);
          dummy.scale.set(b.scale[0], b.scale[1], b.scale[2]);
          dummy.updateMatrix();
          urbanBlocksRef.current?.setMatrixAt(idx, dummy.matrix);

          // Rooftop Utility / Elevator Penthouse
          dummy.position.set(b.pos[0], b.pos[1] + b.scale[1] * 0.5 + 1.2, b.pos[2]);
          dummy.rotation.set(0, b.rotY, 0);
          dummy.scale.set(b.scale[0] * 0.4, 2.4, b.scale[2] * 0.4);
          dummy.updateMatrix();
          urbanTopsRef.current?.setMatrixAt(idx, dummy.matrix);
        });
        urbanBlocksRef.current.instanceMatrix.needsUpdate = true;
        urbanTopsRef.current.instanceMatrix.needsUpdate = true;
      }
    }, 50);
  }, [urbanBlockTransforms]);

  // -------------------------------------------------------------
  // 2. OUTER SKYLINE SKYSCRAPERS & HIGH-RISE TOWERS (INSTANCED MESH)
  // -------------------------------------------------------------
  const towerCount = 380;
  const towersRef = useRef<THREE.InstancedMesh>(null);

  const towerTransforms = useMemo(() => {
    const list: { pos: [number, number, number]; scale: [number, number, number] }[] = [];
    // 8 Surrounding Skyline Business & Financial Districts
    const districtCenters = [
      [-260, 180], // West Financial Zone
      [280, 200],  // East Waterfront Towers
      [-220, -180],// North Uptown Tech Center
      [240, -160], // South Gateway
      [-320, 20],  // Far West Tech City
      [310, -20],  // Far East Marina Towers
      [0, -280],   // North Meridian Center
      [-120, 280], // South-West Cyber Towers
    ];

    let count = 0;
    districtCenters.forEach(([dcx, dcz]) => {
      for (let i = 0; i < 50; i++) {
        if (count >= towerCount) break;
        const angle = Math.random() * Math.PI * 2;
        const dist = 15 + Math.random() * 110;
        const x = dcx + Math.cos(angle) * dist;
        const z = dcz + Math.sin(angle) * dist;
        const height = 45 + Math.random() * 95;
        const width = 12 + Math.random() * 10;
        const depth = 12 + Math.random() * 10;

        list.push({
          pos: [x, height / 2, z],
          scale: [width, height, depth],
        });
        count++;
      }
    });
    return list;
  }, [towerCount]);

  useMemo(() => {
    const dummy = new THREE.Object3D();
    setTimeout(() => {
      if (towersRef.current) {
        towerTransforms.forEach((t, idx) => {
          dummy.position.set(t.pos[0], t.pos[1], t.pos[2]);
          dummy.rotation.set(0, (idx % 4) * (Math.PI / 4), 0);
          dummy.scale.set(t.scale[0], t.scale[1], t.scale[2]);
          dummy.updateMatrix();
          towersRef.current?.setMatrixAt(idx, dummy.matrix);
        });
        towersRef.current.instanceMatrix.needsUpdate = true;
      }
    }, 50);
  }, [towerTransforms]);

  // -------------------------------------------------------------
  // 3. ANIMATED DISTANT HIGHWAY TRAFFIC TRAILS
  // -------------------------------------------------------------
  const trafficHeadlightsRef = useRef<THREE.Points>(null);
  const trafficTaillightsRef = useRef<THREE.Points>(null);

  const { headPositions, tailPositions } = useMemo(() => {
    const lightCount = 300;
    const hPos = new Float32Array(lightCount * 3);
    const tPos = new Float32Array(lightCount * 3);

    for (let i = 0; i < lightCount; i++) {
      // 4 major radial highways
      const highwayId = i % 4;
      const progress = (i / lightCount) * 850 + 60;

      if (highwayId === 0) { // North
        hPos[i * 3] = -2.5; hPos[i * 3 + 1] = 0.5; hPos[i * 3 + 2] = -progress;
        tPos[i * 3] = 2.5; tPos[i * 3 + 1] = 0.5; tPos[i * 3 + 2] = -progress;
      } else if (highwayId === 1) { // South
        hPos[i * 3] = 2.5; hPos[i * 3 + 1] = 0.5; hPos[i * 3 + 2] = progress + 25;
        tPos[i * 3] = -2.5; tPos[i * 3 + 1] = 0.5; tPos[i * 3 + 2] = progress + 25;
      } else if (highwayId === 2) { // East
        hPos[i * 3] = progress; hPos[i * 3 + 1] = 0.5; hPos[i * 3 + 2] = 22.5;
        tPos[i * 3] = progress; tPos[i * 3 + 1] = 0.5; tPos[i * 3 + 2] = 27.5;
      } else { // West
        hPos[i * 3] = -progress; hPos[i * 3 + 1] = 0.5; hPos[i * 3 + 2] = 27.5;
        tPos[i * 3] = -progress; tPos[i * 3 + 1] = 0.5; tPos[i * 3 + 2] = 22.5;
      }
    }
    return { headPositions: hPos, tailPositions: tPos };
  }, []);

  useFrame((_, delta) => {
    if (trafficHeadlightsRef.current && isNightOrEvening) {
      // Stream lights along highway lines
      const hAttr = trafficHeadlightsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const tAttr = trafficTaillightsRef.current?.geometry.attributes.position as THREE.BufferAttribute;
      if (!hAttr || !tAttr) return;

      const hArr = hAttr.array as Float32Array;
      const tArr = tAttr.array as Float32Array;

      for (let i = 0; i < 300; i++) {
        const highwayId = i % 4;
        const speed = (28 + (i % 5) * 8) * delta;

        if (highwayId === 0) { // Moving North
          hArr[i * 3 + 2] -= speed;
          if (hArr[i * 3 + 2] < -900) hArr[i * 3 + 2] = -80;
          tArr[i * 3 + 2] += speed;
          if (tArr[i * 3 + 2] > -80) tArr[i * 3 + 2] = -900;
        } else if (highwayId === 1) { // Moving South
          hArr[i * 3 + 2] += speed;
          if (hArr[i * 3 + 2] > 900) hArr[i * 3 + 2] = 90;
          tArr[i * 3 + 2] -= speed;
          if (tArr[i * 3 + 2] < 90) tArr[i * 3 + 2] = 900;
        } else if (highwayId === 2) { // Moving East
          hArr[i * 3] += speed;
          if (hArr[i * 3] > 900) hArr[i * 3] = 70;
          tArr[i * 3] -= speed;
          if (tArr[i * 3] < 70) tArr[i * 3] = 900;
        } else { // Moving West
          hArr[i * 3] -= speed;
          if (hArr[i * 3] < -900) hArr[i * 3] = -70;
          tArr[i * 3] += speed;
          if (tArr[i * 3] > -70) tArr[i * 3] = -900;
        }
      }
      hAttr.needsUpdate = true;
      tAttr.needsUpdate = true;
    }
  });

  // -------------------------------------------------------------
  // 4. LOW-POLY HORIZON MOUNTAIN RANGE (BASIN RIM)
  // -------------------------------------------------------------
  const mountainSegments = useMemo(() => {
    const list: { pos: [number, number, number]; rotY: number; scale: [number, number, number]; color: string }[] = [];
    const count = 36;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1250 + (i % 3) * 120;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const height = 180 + (Math.sin(i * 2.3) * 60) + 70;
      const width = 280 + (i % 4) * 60;
      const depth = 220 + (i % 3) * 50;

      list.push({
        pos: [x, height / 2 - 20, z],
        rotY: angle + Math.PI / 2,
        scale: [width, height, depth],
        color: i % 2 === 0 ? '#1e293b' : '#334155',
      });
    }
    return list;
  }, []);

  return (
    <group name="MetropolitanInfiniteHorizon">
      {/* 1. Endless 3,200 x 3,200 Ground Landscape Foundation */}
      <mesh position={[0, -0.15, 25]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3200, 3200]} />
        <meshStandardMaterial color="#090d16" roughness={0.96} metalness={0.04} />
      </mesh>

      {/* 2. Concentric Suburban Ring Roads & Arterial Highways */}
      <group position={[0, 0.005, 25]}>
        {/* Extended North-South Trans-City Super Highway (2 km long) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14, 1900]} />
          <meshStandardMaterial color="#0f172a" roughness={0.85} />
        </mesh>

        {/* Extended East-West Trans-City Super Highway (2 km long) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1900, 14]} />
          <meshStandardMaterial color="#0f172a" roughness={0.85} />
        </mesh>

        {/* Outer Ring Boulevard Beltway 1 (Radius 220) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[215, 225, 48]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>

        {/* Outer Ring Boulevard Beltway 2 (Radius 420) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[415, 425, 64]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
      </group>

      {/* 3. 420+ Instanced Urban Multi-story Apartment & Commercial Blocks */}
      <instancedMesh
        ref={urbanBlocksRef}
        args={[undefined, undefined, urbanBlockCount]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} metalness={0.2} />
      </instancedMesh>

      <instancedMesh
        ref={urbanTopsRef}
        args={[undefined, undefined, urbanBlockCount]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </instancedMesh>

      {/* 4. 180+ Instanced Outer Skyline Corporate & Residential Skyscrapers */}
      <instancedMesh
        ref={towersRef}
        args={[undefined, undefined, towerCount]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.65}
          roughness={0.35}
        />
      </instancedMesh>

      {/* 5. Animated Highway Headlights & Taillights (Visible Dusk/Night) */}
      {isNightOrEvening && (
        <group>
          {/* Headlights (Warm White / Golden) */}
          <points ref={trafficHeadlightsRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[headPositions, 3]}
              />
            </bufferGeometry>
            <pointsMaterial
              size={4.0}
              color="#fef08a"
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          </points>

          {/* Taillights (Ruby Red) */}
          <points ref={trafficTaillightsRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[tailPositions, 3]}
              />
            </bufferGeometry>
            <pointsMaterial
              size={3.8}
              color="#ef4444"
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          </points>
        </group>
      )}

      {/* 6. Distant Low-Poly Mountain Basin Rim (Radius 1200 - 1400) */}
      <group name="HorizonMountainBasin">
        {mountainSegments.map((m, idx) => (
          <mesh
            key={`mountain-${idx}`}
            position={m.pos}
            rotation={[0, m.rotY, 0]}
            scale={m.scale}
          >
            <coneGeometry args={[1, 1, 5]} />
            <meshStandardMaterial
              color={m.color}
              roughness={0.95}
              metalness={0.05}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
