import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../../../store/useGameStore';
import { WeatherPreset, TimeOfDayPreset } from '../../../types';

/**
 * MetropolitanSkyAndAtmosphere:
 * Hollywood Oscar-winning natural sky & atmospheric system:
 * 1. Dynamic Hemispheric Sky Dome transitioning through Morning, Afternoon, Evening, and Night
 * 2. Celestial Sun with coronal glow disk, solar flare rings, and orbital trajectory
 * 3. Detailed Moon with lunar craters, phase glow, and pale nocturnal moonlight
 * 4. Twinkling Cosmic Starfield (2,500+ stars) and zipping Shooting Stars
 * 5. Procedural 3D Fluffy Clouds drifting dynamically on wind currents, reacting to time & weather
 * 6. Natural Wildlife: Flocks of flying birds soaring, banking, and flapping wings across the skyline
 */

// Helper to convert HH:MM to minute of day (0..1440)
function getMinutesFromTimeStr(timeStr: string): number {
  if (!timeStr) return 480; // 08:00 default
  const parts = timeStr.split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

// -------------------------------------------------------------
// 1. SKY DOME COMPONENT
// -------------------------------------------------------------
const SkyDome: React.FC<{ timeOfDay: TimeOfDayPreset; weather: WeatherPreset }> = ({
  timeOfDay,
  weather,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Pre-calculate celestial palette colors
  const skyPalettes = useMemo(() => {
    return {
      morning: {
        top: new THREE.Color('#38bdf8'),
        horizon: new THREE.Color('#fed7aa'),
        ground: new THREE.Color('#1e293b'),
      },
      afternoon: {
        top: new THREE.Color('#0284c7'),
        horizon: new THREE.Color('#93c5fd'),
        ground: new THREE.Color('#0f172a'),
      },
      evening: {
        top: new THREE.Color('#312e81'),
        horizon: new THREE.Color('#f97316'),
        ground: new THREE.Color('#18181b'),
      },
      night: {
        top: new THREE.Color('#020617'),
        horizon: new THREE.Color('#0f172a'),
        ground: new THREE.Color('#020617'),
      },
      stormy: {
        top: new THREE.Color('#1e293b'),
        horizon: new THREE.Color('#475569'),
        ground: new THREE.Color('#090d16'),
      },
    };
  }, []);

  // Sky shader material for ultra-smooth vertical gradient
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color('#38bdf8') },
        bottomColor: { value: new THREE.Color('#fed7aa') },
        offset: { value: 33 },
        exponent: { value: 0.6 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  useFrame(() => {
    if (!shaderMaterial) return;

    let target = skyPalettes[timeOfDay];
    if (weather === 'stormy') {
      target = skyPalettes.stormy;
    } else if (weather === 'cloudy' || weather === 'rainy') {
      // Blend 50% with stormy/overcast
      const stormy = skyPalettes.stormy;
      shaderMaterial.uniforms.topColor.value.lerpColors(target.top, stormy.top, 0.6);
      shaderMaterial.uniforms.bottomColor.value.lerpColors(target.horizon, stormy.horizon, 0.6);
      return;
    }

    shaderMaterial.uniforms.topColor.value.lerp(target.top, 0.05);
    shaderMaterial.uniforms.bottomColor.value.lerp(target.horizon, 0.05);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[2600, 32, 24]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
};

// -------------------------------------------------------------
// 2. CELESTIAL SUN & CORONA
// -------------------------------------------------------------
const CelestialSun: React.FC<{ timeOfDay: TimeOfDayPreset; weather: WeatherPreset; minute: number }> = ({
  timeOfDay,
  weather,
  minute,
}) => {
  const sunGroupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const { camera } = useThree();

  // Celestial arc position calculation (Sun rises at 06:00, peaks at 13:00, sets at 19:30)
  // Mapping minute (0..1440) to orbital angle
  const progress = Math.max(0, Math.min(1, (minute - 330) / (1200 - 330))); // 0 at 05:30, 1 at 20:00
  const sunAngle = progress * Math.PI; // 0 to PI
  const isNight = timeOfDay === 'night' || minute < 330 || minute > 1200;

  const sunDistance = 2100;
  const sunX = Math.cos(sunAngle - Math.PI / 2) * sunDistance * 1.1;
  const sunY = isNight ? -300 : Math.sin(sunAngle) * sunDistance * 0.75 + 100;
  const sunZ = Math.sin(sunAngle * 0.8) * 600 - 300;

  const sunColor = useMemo(() => {
    if (timeOfDay === 'morning') return '#fed7aa';
    if (timeOfDay === 'afternoon') return '#ffffff';
    if (timeOfDay === 'evening') return '#fb923c';
    return '#38bdf8';
  }, [timeOfDay]);

  const sunIntensity = useMemo(() => {
    if (isNight) return 0.05;
    if (weather === 'stormy') return 0.4;
    if (weather === 'rainy') return 0.7;
    if (weather === 'cloudy') return 1.3;
    if (timeOfDay === 'afternoon') return 2.6;
    if (timeOfDay === 'morning') return 2.2;
    return 1.8; // evening
  }, [isNight, weather, timeOfDay]);

  useFrame(() => {
    if (sunGroupRef.current) {
      sunGroupRef.current.position.lerp(new THREE.Vector3(sunX, sunY, sunZ), 0.05);
      sunGroupRef.current.lookAt(camera.position);
    }
  });

  return (
    <group>
      {/* Dynamic Sun Directional Light */}
      <directionalLight
        ref={lightRef}
        position={[sunX * 0.3, Math.max(sunY * 0.3, 40), sunZ * 0.3]}
        color={sunColor}
        intensity={sunIntensity}
        castShadow={false}
      />

      {/* Visible Sun Disk and Radiant Halo */}
      {!isNight && (
        <group ref={sunGroupRef} position={[sunX, sunY, sunZ]}>
          {/* Core Sun Disk */}
          <mesh>
            <circleGeometry args={[95, 32]} />
            <meshBasicMaterial color={sunColor} transparent opacity={weather === 'stormy' ? 0.3 : 0.95} />
          </mesh>

          {/* Inner Golden Corona Ring */}
          <mesh position={[0, 0, -2]}>
            <circleGeometry args={[180, 32]} />
            <meshBasicMaterial
              color={sunColor}
              transparent
              opacity={weather === 'clear' ? 0.45 : 0.15}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Outer Atmospheric Glow Flare */}
          <mesh position={[0, 0, -4]}>
            <circleGeometry args={[340, 32]} />
            <meshBasicMaterial
              color={timeOfDay === 'evening' ? '#ea580c' : '#fef08a'}
              transparent
              opacity={weather === 'clear' ? 0.22 : 0.08}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

// -------------------------------------------------------------
// 3. CELESTIAL MOON & LUNAR LIGHT
// -------------------------------------------------------------
const CelestialMoon: React.FC<{ timeOfDay: TimeOfDayPreset; weather: WeatherPreset }> = ({
  timeOfDay,
  weather,
}) => {
  const moonGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const isNightOrDusk = timeOfDay === 'night' || timeOfDay === 'evening';
  const moonPos: [number, number, number] = [-600, 1100, -1400];

  useFrame(() => {
    if (moonGroupRef.current) {
      moonGroupRef.current.lookAt(camera.position);
    }
  });

  if (!isNightOrDusk) return null;

  return (
    <group>
      {/* Soft Nocturnal Moonlight */}
      <directionalLight
        position={[-180, 240, -320]}
        color="#7dd3fc"
        intensity={weather === 'stormy' ? 0.15 : weather === 'rainy' ? 0.35 : 0.85}
        castShadow={false}
      />

      {/* Moon Orb & Soft Lunar Aura */}
      <group ref={moonGroupRef} position={moonPos}>
        {/* Core Moon Sphere */}
        <mesh>
          <sphereGeometry args={[75, 32, 32]} />
          <meshStandardMaterial
            color="#f1f5f9"
            emissive="#cbd5e1"
            emissiveIntensity={0.8}
            roughness={0.9}
          />
        </mesh>

        {/* Craters Detail Accents */}
        {[-22, 14, 28, -12].map((cx, i) => (
          <mesh key={`crater-${i}`} position={[cx, (i % 2 === 0 ? 1 : -1) * (18 + i * 8), 70]}>
            <circleGeometry args={[8 + i * 3, 16]} />
            <meshBasicMaterial color="#94a3b8" opacity={0.6} transparent />
          </mesh>
        ))}

        {/* Ethereal Lunar Aura Glow */}
        <mesh position={[0, 0, -2]}>
          <circleGeometry args={[160, 32]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={weather === 'clear' ? 0.3 : 0.1}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
};

// -------------------------------------------------------------
// 4. TWINKLING COSMIC STARFIELD & SHOOTING STARS
// -------------------------------------------------------------
const CosmicStarfield: React.FC<{ timeOfDay: TimeOfDayPreset; weather: WeatherPreset }> = ({
  timeOfDay,
  weather,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const meteorRef = useRef<THREE.Mesh>(null);
  const meteorTimer = useRef(0);
  const meteorActive = useRef(false);

  // 2,500 Stars distributed across celestial dome
  const { positions, originalColors } = useMemo(() => {
    const count = 2500;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Hemispheric spherical coordinates
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0) * 0.55; // Keep upper half
      const r = 2400 + Math.random() * 150;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = Math.abs(r * Math.cos(phi)) + 80;
      const z = r * Math.sin(phi) * Math.sin(theta);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Subtle star color variations (cool cyan, warm amber, brilliant white)
      const starType = Math.random();
      if (starType > 0.8) {
        col[i * 3] = 0.7; col[i * 3 + 1] = 0.85; col[i * 3 + 2] = 1.0; // Blue-white
      } else if (starType > 0.6) {
        col[i * 3] = 1.0; col[i * 3 + 1] = 0.85; col[i * 3 + 2] = 0.6; // Amber
      } else {
        col[i * 3] = 1.0; col[i * 3 + 1] = 1.0; col[i * 3 + 2] = 1.0; // Pure white
      }
    }
    return { positions: pos, originalColors: col };
  }, []);

  const isNightOrEvening = timeOfDay === 'night' || timeOfDay === 'evening';
  const starOpacity = timeOfDay === 'night' ? (weather === 'clear' ? 0.95 : 0.3) : (timeOfDay === 'evening' ? 0.4 : 0.0);

  useFrame((_, delta) => {
    if (!pointsRef.current || !isNightOrEvening) return;

    // Subtle twinkling rotation
    pointsRef.current.rotation.y += delta * 0.0015;

    // Shooting star (Meteor) animation
    meteorTimer.current += delta;
    if (meteorTimer.current > 7.0 && !meteorActive.current && timeOfDay === 'night') {
      meteorActive.current = true;
      meteorTimer.current = 0;
      if (meteorRef.current) {
        const startX = (Math.random() - 0.5) * 1200;
        const startZ = (Math.random() - 0.5) * 1200;
        meteorRef.current.position.set(startX, 1200, startZ);
        meteorRef.current.visible = true;
      }
    }

    if (meteorActive.current && meteorRef.current) {
      meteorRef.current.position.x += delta * 700;
      meteorRef.current.position.y -= delta * 350;
      meteorRef.current.position.z += delta * 400;

      if (meteorRef.current.position.y < 300) {
        meteorActive.current = false;
        meteorRef.current.visible = false;
      }
    }
  });

  if (!isNightOrEvening || starOpacity <= 0) return null;

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[originalColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={5.5}
          sizeAttenuation
          vertexColors
          transparent
          opacity={starOpacity}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Cinematic Shooting Star / Meteor Streak */}
      <mesh ref={meteorRef} visible={false}>
        <cylinderGeometry args={[0.5, 3.2, 45, 8]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

// -------------------------------------------------------------
// 5. PROCEDURAL 3D FLUFFY CLOUDS
// -------------------------------------------------------------
interface CloudPuffData {
  offset: [number, number, number];
  scale: [number, number, number];
}

interface CloudClusterData {
  initialX: number;
  initialY: number;
  initialZ: number;
  speed: number;
  puffs: CloudPuffData[];
}

const ProceduralClouds: React.FC<{ timeOfDay: TimeOfDayPreset; weather: WeatherPreset }> = ({
  timeOfDay,
  weather,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate 24 diverse cloud clusters scattered across the sky
  const cloudClusters: CloudClusterData[] = useMemo(() => {
    const list: CloudClusterData[] = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + (Math.random() * 0.4);
      const radius = 220 + Math.random() * 680;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 140 + Math.random() * 90;
      const speed = 2.5 + Math.random() * 3.5;

      // 4 to 7 overlapping puffs per cluster for volumetric cumulus feel
      const puffCount = 5 + Math.floor(Math.random() * 3);
      const puffs: CloudPuffData[] = [];
      for (let p = 0; p < puffCount; p++) {
        puffs.push({
          offset: [
            (Math.random() - 0.5) * 38,
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 28,
          ],
          scale: [
            18 + Math.random() * 16,
            12 + Math.random() * 10,
            18 + Math.random() * 16,
          ],
        });
      }

      list.push({ initialX: x, initialY: y, initialZ: z, speed, puffs });
    }
    return list;
  }, []);

  // Compute responsive cloud color based on daylight and weather
  const cloudColor = useMemo(() => {
    if (weather === 'stormy') return '#334155'; // Dark storm grey
    if (weather === 'rainy') return '#475569'; // Overcast slate
    if (weather === 'cloudy') return '#94a3b8'; // Cool diffused cloud
    if (timeOfDay === 'morning') return '#fed7aa'; // Golden peach sunrise
    if (timeOfDay === 'afternoon') return '#f8fafc'; // Crisp bright white
    if (timeOfDay === 'evening') return '#fdba74'; // Fiery sunset amber
    return '#1e293b'; // Night moonlit charcoal
  }, [weather, timeOfDay]);

  const cloudOpacity = weather === 'clear' ? 0.78 : 0.92;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Drift cloud clusters across the city along wind vector (+X, +Z)
    groupRef.current.children.forEach((child, index) => {
      const cluster = cloudClusters[index];
      if (!cluster) return;
      child.position.x += delta * cluster.speed;
      child.position.z += delta * (cluster.speed * 0.35);

      // Wrap around bounding volume
      if (child.position.x > 950) child.position.x = -950;
      if (child.position.z > 950) child.position.z = -950;
    });
  });

  return (
    <group ref={groupRef} name="SkyClouds">
      {cloudClusters.map((cluster, cIdx) => (
        <group
          key={`cloud-cluster-${cIdx}`}
          position={[cluster.initialX, cluster.initialY, cluster.initialZ]}
        >
          {cluster.puffs.map((puff, pIdx) => (
            <mesh
              key={`puff-${cIdx}-${pIdx}`}
              position={puff.offset}
              scale={puff.scale}
            >
              <sphereGeometry args={[1, 12, 10]} />
              <meshStandardMaterial
                color={cloudColor}
                roughness={0.9}
                metalness={0.0}
                transparent
                opacity={cloudOpacity}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

// -------------------------------------------------------------
// 6. ANIMATED WILDLIFE: FLOCKS OF SOARING BIRDS
// -------------------------------------------------------------
interface BirdAgent {
  id: number;
  center: [number, number, number];
  radius: number;
  speed: number;
  height: number;
  phase: number;
  wingSpeed: number;
  scale: number;
}

const FlyingBirdsFlock: React.FC<{ weather: WeatherPreset }> = ({ weather }) => {
  const birdsGroupRef = useRef<THREE.Group>(null);
  const leftWingsRef = useRef<(THREE.Mesh | null)[]>([]);
  const rightWingsRef = useRef<(THREE.Mesh | null)[]>([]);

  // Flocks circling distinct thermals over the lake and parks
  const birds: BirdAgent[] = useMemo(() => {
    const list: BirdAgent[] = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        center: i < 8 ? [-30, 0, 40] : [20, 0, -20], // Two flock centers (Lake & Park)
        radius: 35 + (i % 8) * 8,
        speed: 0.65 + (i % 4) * 0.1,
        height: 48 + (i % 5) * 9,
        phase: (i / 8) * Math.PI * 2,
        wingSpeed: 10 + (i % 3) * 2,
        scale: 0.8 + (i % 3) * 0.2,
      });
    }
    return list;
  }, []);

  useFrame(({ clock }) => {
    if (!birdsGroupRef.current) return;
    const t = clock.getElapsedTime();

    birds.forEach((bird, i) => {
      const birdMesh = birdsGroupRef.current?.children[i] as THREE.Group;
      if (!birdMesh) return;

      // Orbital flight path
      const angle = t * bird.speed + bird.phase;
      const x = bird.center[0] + Math.cos(angle) * bird.radius;
      const z = bird.center[2] + Math.sin(angle) * (bird.radius * 0.8);
      const y = bird.height + Math.sin(t * 1.5 + bird.phase) * 3.5;

      birdMesh.position.set(x, y, z);

      // Facing flight tangent direction
      const nextAngle = angle + 0.05;
      const nextX = bird.center[0] + Math.cos(nextAngle) * bird.radius;
      const nextZ = bird.center[2] + Math.sin(nextAngle) * (bird.radius * 0.8);
      birdMesh.lookAt(nextX, y, nextZ);

      // Natural banking roll when turning
      birdMesh.rotation.z = Math.sin(angle) * 0.35;

      // Realistic flapping wings animation
      const wingFlap = Math.sin(t * bird.wingSpeed) * 0.65;
      const leftWing = leftWingsRef.current[i];
      const rightWing = rightWingsRef.current[i];
      if (leftWing && rightWing) {
        leftWing.rotation.z = wingFlap;
        rightWing.rotation.z = -wingFlap;
      }
    });
  });

  // Birds seek shelter during heavy stormy weather
  if (weather === 'stormy') return null;

  return (
    <group ref={birdsGroupRef} name="FlockOfBirds">
      {birds.map((bird, i) => (
        <group key={`bird-${bird.id}`} scale={[bird.scale, bird.scale, bird.scale]}>
          {/* Bird Aerodynamic Fuselage / Body */}
          <mesh castShadow={false}>
            <coneGeometry args={[0.3, 1.4, 4]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>

          {/* Left Wing */}
          <group position={[-0.2, 0, 0]}>
            <mesh
              ref={(el) => { leftWingsRef.current[i] = el; }}
              position={[-0.8, 0, 0]}
              rotation={[0, 0, 0]}
            >
              <boxGeometry args={[1.5, 0.05, 0.5]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} />
            </mesh>
          </group>

          {/* Right Wing */}
          <group position={[0.2, 0, 0]}>
            <mesh
              ref={(el) => { rightWingsRef.current[i] = el; }}
              position={[0.8, 0, 0]}
              rotation={[0, 0, 0]}
            >
              <boxGeometry args={[1.5, 0.05, 0.5]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} />
            </mesh>
          </group>

          {/* Tail Feathers */}
          <mesh position={[0, -0.1, -0.7]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.4, 0.04, 0.6]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// -------------------------------------------------------------
// MASTER EXPORT: METROPOLITAN SKY AND ATMOSPHERE
// -------------------------------------------------------------
export const MetropolitanSkyAndAtmosphere: React.FC = () => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const weather = useGameStore((state) => state.weather);
  const simulatedTime = useGameStore((state) => state.simulatedTime);

  const currentMinute = useMemo(() => getMinutesFromTimeStr(simulatedTime), [simulatedTime]);

  return (
    <group name="MasterSkyAndAtmosphere">
      {/* 1. Dynamic Hemispheric Sky Dome */}
      <SkyDome timeOfDay={timeOfDay} weather={weather} />

      {/* 2. Celestial Sun & Directional Solar Illumination */}
      <CelestialSun timeOfDay={timeOfDay} weather={weather} minute={currentMinute} />

      {/* 3. Celestial Moon & Lunar Nocturnal Glow */}
      <CelestialMoon timeOfDay={timeOfDay} weather={weather} />

      {/* 4. Twinkling Cosmic Starfield & Shooting Stars */}
      <CosmicStarfield timeOfDay={timeOfDay} weather={weather} />

      {/* 5. 3D Procedural Volumetric Drifting Clouds */}
      <ProceduralClouds timeOfDay={timeOfDay} weather={weather} />

      {/* 6. Wildlife: Flocks of Flying Birds */}
      <FlyingBirdsFlock weather={weather} />
    </group>
  );
};
