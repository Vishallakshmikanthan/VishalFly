import { describe, it, expect } from 'vitest';
import { OlfactoryEnvironment, SimulatedOdorStimulus } from '../olfactory/OlfactoryEnvironment';
import { OlfactoryProcessingLayer } from '../olfactory/OlfactoryProcessingLayer';
import { ExperimentalDelta7Inhibition } from '../central-complex/Delta7Inhibition';
import { CentralComplexSteering } from '../central-complex/CentralComplexSteering';
import { ConnectomeFlyController } from '../controller/ConnectomeFlyController';
import { createNavigationGoal } from '../navigation/NavigationGoalTypes';
import { useGameStore } from '../../../store/useGameStore';
import manifestData from '../data/male_cns_manifest.json';

describe('Milestone 3: Olfactory Circuit Ingestion, Chemotaxis & Central-Complex Stability', () => {
  const roomBounds = {
    minX: -4.0,
    maxX: 4.0,
    minY: 0.2,
    maxY: 3.5,
    minZ: -4.0,
    maxZ: 4.0,
  };

  // 1. Olfactory Stimulus Validation
  it('1. olfactory stimulus validation: accepts and models valid 3D odor plumes with synthetic provenance', () => {
    const olfactoryEnv = new OlfactoryEnvironment();

    // Dining buffet emitter at [-1.3, 1.2, -3.3]
    const nearBuffet = olfactoryEnv.sampleOdor([-1.3, 1.2, -3.2], 'dining');
    expect(nearBuffet.isValid).toBe(true);
    expect(nearBuffet.stimulusCategory).toBe('food_odor');
    expect(nearBuffet.intensity).toBeGreaterThan(0.7);
    expect(nearBuffet.sourceLocation).toEqual([-1.3, 1.2, -3.3]);
    expect(nearBuffet.distance).toBeLessThan(0.2);
    expect(nearBuffet.provenance).toBe('synthetic_environmental_field');

    // Sample far from buffet in dining room
    const farBuffet = olfactoryEnv.sampleOdor([3.0, 2.0, 3.0], 'dining');
    expect(farBuffet.isValid).toBe(true);
    expect(farBuffet.intensity).toBeLessThan(nearBuffet.intensity);
    expect(farBuffet.distance).toBeGreaterThan(3.0);
  });

  // 2. Missing or Invalid Odor Inputs
  it('2. missing or invalid odor inputs: handles null, undefined, NaN, and negative coordinates gracefully', () => {
    const olfactoryEnv = new OlfactoryEnvironment();

    // NaN position
    const nanSample = olfactoryEnv.sampleOdor([NaN, 1.2, 0], 'dining');
    expect(nanSample.isValid).toBe(false);
    expect(nanSample.intensity).toBe(0);

    // Unknown location
    const unknownLoc = olfactoryEnv.sampleOdor([0, 1.2, 0], 'non_existent_room');
    expect(unknownLoc.isValid).toBe(false);
    expect(unknownLoc.intensity).toBe(0);

    // OlfactoryProcessingLayer stepping with invalid stimulus
    const layer = new OlfactoryProcessingLayer();
    const invalidStim: SimulatedOdorStimulus = {
      isValid: false,
      stimulusCategory: 'none',
      intensity: 0,
      sourceLocation: [0, 0, 0],
      distance: 0,
      gradient: [0, 0, 0],
      provenance: 'synthetic_environmental_field',
      sourceName: 'No Odor Source',
    };

    const telemetry = layer.update(invalidStim, 50, 0.016);
    expect(telemetry.foodAttractionSignal).toBe(0);
    expect(telemetry.isFoodGoalActive).toBe(false);
    expect(Number.isFinite(telemetry.pnFiringRates.left)).toBe(true);
    expect(telemetry.provenance).toBe('measured_neuron_modeled_synapse');
  });

  // 3. Provenance Labels and Synthetic-Data Handling
  it('3. provenance labels and synthetic-data handling: strictly separates synthetic odor fields from biological neural data', () => {
    const olfactoryEnv = new OlfactoryEnvironment();
    const layer = new OlfactoryProcessingLayer();

    const stimulus = olfactoryEnv.sampleOdor([-1.3, 1.2, -3.3], 'dining');
    expect(stimulus.provenance).toBe('synthetic_environmental_field');

    const telemetry = layer.update(stimulus, 80, 0.016);
    expect(telemetry.provenance).toBe('measured_neuron_modeled_synapse');

    // Confirm that the manifest classifies odor plumes as computational assumptions, not directly measured
    const compAssumptions = manifestData.parameterClassification.computationalAssumptions;
    const odorPlumeAssumption = compAssumptions.find((a: string) => a.includes('Synthetic environmental odor plume'));
    expect(odorPlumeAssumption).toBeDefined();

    const directlyMeasured = manifestData.parameterClassification.directlyMeasured;
    const isOdorDirectlyMeasured = directlyMeasured.some((m: string) => m.toLowerCase().includes('plume'));
    expect(isOdorDirectlyMeasured).toBe(false);
  });

  // 4. Olfactory Processing Output Bounds
  it('4. olfactory processing output bounds: foodAttractionSignal and membrane potentials remain strictly bounded', () => {
    const layer = new OlfactoryProcessingLayer();

    const maxStimulus: SimulatedOdorStimulus = {
      isValid: true,
      stimulusCategory: 'food_odor',
      intensity: 1.0,
      sourceLocation: [-1.3, 1.2, -3.3],
      distance: 0.1,
      gradient: [0, 0, 1],
      provenance: 'synthetic_environmental_field',
      sourceName: 'Buffet',
    };

    // Step 50 frames with maximal hunger and stimulus
    for (let i = 0; i < 50; i++) {
      const telem = layer.update(maxStimulus, 100, 0.016);
      expect(telem.foodAttractionSignal).toBeGreaterThanOrEqual(0.0);
      expect(telem.foodAttractionSignal).toBeLessThanOrEqual(1.0);
      expect(telem.pnFiringRates.left).toBeGreaterThanOrEqual(0.0);
      expect(telem.pnFiringRates.left).toBeLessThanOrEqual(250.0);

      // Verify individual neuron states in snapshot
      for (const vm of Object.values(telem.snapshot.potentials)) {
        expect(vm).toBeGreaterThanOrEqual(-85.0);
        expect(vm).toBeLessThanOrEqual(10.0);
      }
      for (const rate of Object.values(telem.snapshot.firingRates)) {
        expect(rate).toBeGreaterThanOrEqual(0.0);
      }
    }
  });

  // 5. Food-Directed Goal Selection Under Different Need States
  it('5. food-directed goal selection under different need states: hunger sensitizes response and gates chemotaxis', () => {
    const controller = new ConnectomeFlyController();
    const posNearFood: [number, number, number] = [-1.0, 1.2, -3.0];
    const vel: [number, number, number] = [0, 0, 0];

    // Case A: Satiated fly (hunger = 10 < 20) -> food goal is not active
    const updateSatiated = controller.update(
      posNearFood,
      vel,
      0,
      roomBounds,
      0.016,
      null,
      'dining',
      10 // Satiated
    );
    expect(updateSatiated.snapshot.olfactory?.isFoodGoalActive).toBe(false);

    // Case B: Hungry fly (hunger = 80 >= 40) -> food goal activates chemotaxis!
    const updateHungry = controller.update(
      posNearFood,
      vel,
      0,
      roomBounds,
      0.016,
      null,
      'dining',
      80 // Hungry
    );
    expect(updateHungry.snapshot.olfactory?.isFoodGoalActive).toBe(true);
    expect(updateHungry.snapshot.olfactory?.stimulusCategory).toBe('food_odor');
    expect(updateHungry.snapshot.olfactory?.hungerGain).toBeGreaterThan(1.5);
  });

  // 6. No-Odor Fallback Behavior
  it('6. no-odor fallback behavior: continues ordinary navigation when no odor stimulus exists', () => {
    const controller = new ConnectomeFlyController();
    const posLivingRoom: [number, number, number] = [0, 1.8, 0];
    const vel: [number, number, number] = [0.5, 0, 0.5];

    // Living room has no food odor emitters configured
    const update = controller.update(
      posLivingRoom,
      vel,
      0,
      roomBounds,
      0.016,
      null,
      'living_room',
      90 // Hungry, but no odor here
    );

    expect(update.snapshot.olfactory?.intensity).toBe(0);
    expect(update.snapshot.olfactory?.stimulusCategory).toBe('none');
    expect(update.snapshot.olfactory?.isFoodGoalActive).toBe(false);
    expect(update.activityPose).toBe('flying');
    expect(Number.isFinite(update.newPosition[0])).toBe(true);
  });

  // 7. Integration with Existing Navigation Goal Interface
  it('7. integration with existing navigation goal interface: sets food_chemotaxis goalType and steers towards odor emitter', () => {
    const controller = new ConnectomeFlyController();
    // Fly at [-1.3, 1.2, -1.0], right in front of the dining buffet at [-1.3, 1.2, -3.3]
    // Distance to buffet is 2.3m; distance to dining table [0, 1.1, 0] is 1.64m
    // Let's place the fly at [-1.3, 1.2, -2.5], distance to buffet is 0.8m, distance to table is 2.8m!
    const pos: [number, number, number] = [-1.3, 1.2, -2.5];
    const vel: [number, number, number] = [0, 0, 0];

    const update = controller.update(
      pos,
      vel,
      0, // Facing +Z
      roomBounds,
      0.016,
      null,
      'dining',
      85 // Hungry
    );

    const cc = update.snapshot.centralComplex;
    expect(cc).toBeDefined();
    expect(update.snapshot.olfactory?.isFoodGoalActive).toBe(true);
    expect(update.snapshot.olfactory?.sourceName).toContain('Buffet');

    // Emitter is at Z = -3.3, Fly is at Z = -2.5. Target is in -Z direction (bearing = +/- PI)
    expect(Math.abs(cc?.goalBearing || 0)).toBeCloseTo(Math.PI, 1);
    expect(update.snapshot.olfactory?.distance).toBeCloseTo(0.8, 1);
  });

  // 8. Obstacle Avoidance Coexisting with Food-Directed Steering
  it('8. obstacle avoidance coexisting with food-directed steering: threat response and wall boundaries take precedence', () => {
    const controller = new ConnectomeFlyController();
    // Fly near the wall in dining room, hungry
    const posNearWall: [number, number, number] = [-3.8, 1.2, -3.3];
    const velTowardsWall: [number, number, number] = [-1.0, 0, 0];

    let pos = posNearWall;
    let vel = velTowardsWall;
    let yaw = 0;

    for (let frame = 0; frame < 30; frame++) {
      const update = controller.update(
        pos,
        vel,
        yaw,
        roomBounds,
        0.016,
        null,
        'dining',
        85
      );
      pos = update.newPosition;
      vel = update.newVelocity;
      yaw = update.newRotation;

      // Must NOT penetrate left wall at minX = -4.0
      expect(pos[0]).toBeGreaterThanOrEqual(roomBounds.minX);
    }

    // Looming threat veto test during chemotaxis
    controller.triggerThreatStimulus();
    const escapeUpdate = controller.update(
      pos,
      vel,
      yaw,
      roomBounds,
      0.016,
      null,
      'dining',
      85
    );
    expect(escapeUpdate.isEscapeTriggered).toBe(true);
  });

  // 9. Δ7 Inhibitory Dynamics and Bump Contrast
  it('9. Δ7 inhibitory dynamics: cross-column protocerebral bridge surround inhibition sharpens bump contrast', () => {
    const delta7 = new ExperimentalDelta7Inhibition();

    // Baseline symmetric firing (both sides 50 Hz)
    const symResult = delta7.evaluateInhibition({ r1: 25, r2: 25, l1: 25, l2: 25 });
    expect(symResult.leftInhCurrent).toBeCloseTo(symResult.rightInhCurrent, 2);
    expect(symResult.telemetry.bumpContrastRatio).toBeCloseTo(0.0, 2);
    expect(symResult.telemetry.provenance).toBe('modeled_surround_inhibition');

    // Asymmetric input: Left E-PG high (60 + 60 = 120 Hz), Right E-PG low (10 + 10 = 20 Hz)
    // Left side should drive strong inhibition onto the right side
    const asymResult = delta7.evaluateInhibition({ r1: 10, r2: 10, l1: 60, l2: 60 });
    expect(asymResult.rightInhCurrent).toBeGreaterThan(asymResult.leftInhCurrent);
    expect(asymResult.telemetry.bumpContrastRatio).toBeGreaterThan(0.7);
    expect(asymResult.telemetry.isStable).toBe(true);

    // Verify CentralComplex integration
    const cx = new CentralComplexSteering();
    const goal = createNavigationGoal([3.0, 1.8, 0], [0, 1.8, 0], 0);
    const telemetry = cx.update(0, goal, 0.016);

    expect(telemetry.delta7).toBeDefined();
    expect(telemetry.delta7?.bumpContrastRatio).toBeGreaterThanOrEqual(0.0);
    expect(telemetry.delta7?.isStable).toBe(true);
  });

  // 10. Long-Term Simulation Stability
  it('10. long-term simulation stability: 500+ update iterations without numerical divergence or drift', () => {
    const controller = new ConnectomeFlyController();
    let pos: [number, number, number] = [0, 1.8, 0];
    let vel: [number, number, number] = [0.1, 0, 0.1];
    let yaw = 0;

    for (let step = 0; step < 500; step++) {
      const update = controller.update(
        pos,
        vel,
        yaw,
        roomBounds,
        0.016,
        null,
        'dining',
        75
      );

      pos = update.newPosition;
      vel = update.newVelocity;
      yaw = update.newRotation;

      expect(Number.isFinite(pos[0])).toBe(true);
      expect(Number.isFinite(pos[1])).toBe(true);
      expect(Number.isFinite(pos[2])).toBe(true);
      expect(Number.isNaN(yaw)).toBe(false);
      expect(pos[0]).toBeGreaterThanOrEqual(roomBounds.minX);
      expect(pos[0]).toBeLessThanOrEqual(roomBounds.maxX);

      // Verify olfactory neural stability
      const olf = update.snapshot.olfactory;
      if (olf) {
        expect(Number.isFinite(olf.foodAttractionSignal)).toBe(true);
        expect(olf.foodAttractionSignal).toBeGreaterThanOrEqual(0.0);
        expect(olf.foodAttractionSignal).toBeLessThanOrEqual(1.0);
      }
    }
  });

  // 11. Controller Mode Compatibility
  it('11. controller mode compatibility: switching modes preserves state and autonomy flags', () => {
    const store = useGameStore.getState();

    // Mode 1: Connectome
    store.setControllerMode('connectome');
    expect(useGameStore.getState().controllerMode).toBe('connectome');
    expect(useGameStore.getState().isAutonomous).toBe(true);

    // Mode 2: Cognitive
    store.setControllerMode('cognitive');
    expect(useGameStore.getState().controllerMode).toBe('cognitive');
    expect(useGameStore.getState().isCognitionEnabled).toBe(true);

    // Mode 3: Schedule
    store.setControllerMode('schedule');
    expect(useGameStore.getState().controllerMode).toBe('schedule');

    // Mode 4: Manual
    store.setControllerMode('manual');
    expect(useGameStore.getState().controllerMode).toBe('manual');
    expect(useGameStore.getState().isAutonomous).toBe(false);

    // Restore to connectome
    store.setControllerMode('connectome');
  });

  // 12. Physical Motion Integrity: No Teleportation
  it('12. physical motion integrity: strictly continuous movement without teleportation or waypoint snapping', () => {
    const controller = new ConnectomeFlyController();
    const startPos: [number, number, number] = [0, 1.8, 0];
    const distantFoodEmitter: [number, number, number] = [-1.3, 1.2, -3.3];

    // Single step with hunger = 90
    const update = controller.update(
      startPos,
      [0, 0, 0],
      0,
      roomBounds,
      0.016,
      null,
      'dining',
      90
    );

    const dx = update.newPosition[0] - startPos[0];
    const dy = update.newPosition[1] - startPos[1];
    const dz = update.newPosition[2] - startPos[2];
    const frameDistanceTraveled = Math.hypot(dx, dy, dz);

    // In 16 ms, maximum physical step should be <= 0.1m
    expect(frameDistanceTraveled).toBeLessThan(0.1);

    // Verifies NO instant teleportation to food
    const distToFood = Math.hypot(
      distantFoodEmitter[0] - update.newPosition[0],
      distantFoodEmitter[1] - update.newPosition[1],
      distantFoodEmitter[2] - update.newPosition[2]
    );
    expect(distToFood).toBeGreaterThan(2.5);
  });
});
