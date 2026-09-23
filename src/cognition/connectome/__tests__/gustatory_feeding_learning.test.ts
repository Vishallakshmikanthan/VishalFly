import { describe, it, expect } from 'vitest';
import { GustatoryEnvironment, FoodContactStimulus } from '../gustatory/GustatoryEnvironment';
import { GustatoryProcessingLayer } from '../gustatory/GustatoryProcessingLayer';
import { MushroomBodyLearningLayer } from '../learning/MushroomBodyLearningLayer';
import { ConnectomeFlyController } from '../controller/ConnectomeFlyController';
import { createNavigationGoal } from '../navigation/NavigationGoalTypes';
import { useGameStore } from '../../../store/useGameStore';

describe('Milestone 4: Gustatory Feeding, Proboscis Extension & Associative Odor Learning', () => {
  const roomBounds = {
    minX: -4.0,
    maxX: 4.0,
    minY: 0.2,
    maxY: 3.5,
    minZ: -4.0,
    maxZ: 4.0,
  };

  // 1. No gustatory sampling without valid contact
  it('1. no gustatory sampling without valid physical contact (airborne distance > 0.18m)', () => {
    const env = new GustatoryEnvironment();
    // Fly hovering at 0.5m above the buffet table at [-1.3, 1.2, -3.3]
    const airborne = env.sampleContact([-1.3, 1.7, -3.3], 'dining');

    expect(airborne.isContact).toBe(false);
    expect(airborne.tastant).toBe('none');
    expect(airborne.stimulusStrength).toBe(0.0);
    expect(airborne.surfaceName).toBeNull();
    expect(airborne.distanceToSurface).toBeGreaterThan(0.18);
  });

  // 2. Valid contact produces bounded gustatory input
  it('2. valid contact produces bounded gustatory input within [0.0, 1.0]', () => {
    const env = new GustatoryEnvironment();
    // Fly landing exactly on the buffet table at [-1.3, 1.25, -3.3]
    const contact = env.sampleContact([-1.3, 1.25, -3.3], 'dining');

    expect(contact.isContact).toBe(true);
    expect(contact.isValid).toBe(true);
    expect(contact.tastant).toBe('sucrose');
    expect(contact.stimulusStrength).toBeGreaterThan(0.0);
    expect(contact.stimulusStrength).toBeLessThanOrEqual(1.0);
    expect(contact.surfaceName).toContain('Buffet');
    expect(contact.provenance).toBe('synthetic_tastant_field');
  });

  // 3. Invalid or unavailable stimulus follows the documented fallback
  it('3. invalid or unavailable stimulus follows documented fallback gracefully', () => {
    const env = new GustatoryEnvironment();

    // NaN coordinates
    const nanContact = env.sampleContact([NaN, 1.2, 0], 'dining');
    expect(nanContact.isValid).toBe(false);
    expect(nanContact.isContact).toBe(false);
    expect(nanContact.stimulusStrength).toBe(0.0);
    expect(nanContact.tastant).toBe('none');

    // Unknown location
    const unknownContact = env.sampleContact([0, 1.2, 0], 'unknown_room');
    expect(unknownContact.isContact).toBe(false);
    expect(unknownContact.stimulusStrength).toBe(0.0);

    // Gustatory layer step with invalid stimulus
    const layer = new GustatoryProcessingLayer();
    const fallbackOut = layer.step(nanContact, 0.05, 80, false);
    expect(fallbackOut.isFeeding).toBe(false);
    expect(fallbackOut.proboscisExtension).toBe(0.0);
    expect(fallbackOut.feedingState).toBe('approaching');
  });

  // 4. Feeding cannot start without contact
  it('4. feeding cannot start without physical contact or when airborne', () => {
    const layer = new GustatoryProcessingLayer();
    const airborneStimulus: FoodContactStimulus = {
      isContact: false,
      isValid: true,
      surfaceId: 'none',
      surfaceName: null,
      sourceName: 'No Food Surface',
      surfacePosition: [0, 0, 0],
      tastant: 'none',
      tastantType: 'none',
      sweetIntensity: 0.0,
      bitterIntensity: 0.0,
      stimulusStrength: 0.0,
      foodRemaining: 100,
      distanceToSurface: 0.5,
      provenance: 'synthetic_tastant_field',
    };

    // Step for multiple frames while hungry
    for (let i = 0; i < 20; i++) {
      const out = layer.step(airborneStimulus, 0.05, 80, false);
      expect(out.isFeeding).toBe(false);
      expect(out.proboscisExtension).toBe(0.0);
      expect(out.intakeRate).toBe(0.0);
    }
  });

  // 5. Proboscis state transitions and retraction
  it('5. proboscis state articulates from 0 to 1 during PER and retracts upon contact loss', () => {
    const layer = new GustatoryProcessingLayer();
    const sucroseStimulus: FoodContactStimulus = {
      isContact: true,
      isValid: true,
      surfaceId: 'dining_buffet',
      surfaceName: 'Buffet Table',
      sourceName: 'Buffet Table',
      surfacePosition: [-1.3, 1.2, -3.3],
      tastant: 'sucrose',
      tastantType: 'sucrose',
      sweetIntensity: 0.9,
      bitterIntensity: 0.0,
      stimulusStrength: 0.9,
      foodRemaining: 100,
      distanceToSurface: 0.05,
      provenance: 'synthetic_tastant_field',
    };

    // Frame 1: contact sampling / extension initiation
    let out = layer.step(sucroseStimulus, 0.05, 80, false);
    expect(['contact_sampling', 'proboscis_extending']).toContain(out.feedingState);

    // Frames 2-10: proboscis extension reflex (PER)
    for (let i = 0; i < 15; i++) {
      out = layer.step(sucroseStimulus, 0.05, 80, false);
    }
    expect(out.proboscisExtension).toBeGreaterThan(0.5);
    expect(out.proboscisExtension).toBeLessThanOrEqual(1.0);
    expect(out.feedingState).toBe('feeding');
    expect(out.isFeeding).toBe(true);

    // Now lose contact
    const contactLostStimulus: FoodContactStimulus = {
      ...sucroseStimulus,
      isContact: false,
      distanceToSurface: 0.35,
    };
    out = layer.step(contactLostStimulus, 0.05, 80, false);
    expect(out.isFeeding).toBe(false);
    expect(out.interruptionReason).toBe('contact_lost');

    // Several retraction frames
    for (let i = 0; i < 20; i++) {
      out = layer.step(contactLostStimulus, 0.05, 80, false);
    }
    expect(out.proboscisExtension).toBeLessThan(0.05);
  });

  // 6. Hunger and energy change gradually and remain bounded
  it('6. hunger and energy change gradually at ~3.5 units/s and avoid instantaneous resets', () => {
    const layer = new GustatoryProcessingLayer();
    const sucroseStimulus: FoodContactStimulus = {
      isContact: true,
      isValid: true,
      surfaceId: 'dining_buffet',
      surfaceName: 'Buffet Table',
      sourceName: 'Buffet Table',
      surfacePosition: [-1.3, 1.2, -3.3],
      tastant: 'sucrose',
      tastantType: 'sucrose',
      sweetIntensity: 1.0,
      bitterIntensity: 0.0,
      stimulusStrength: 1.0,
      foodRemaining: 100,
      distanceToSurface: 0.02,
      provenance: 'synthetic_tastant_field',
    };

    // Advance into feeding state
    let out: any;
    for (let i = 0; i < 20; i++) {
      out = layer.step(sucroseStimulus, 0.05, 85, false);
    }
    expect(out.isFeeding).toBe(true);

    // In 1 second of feeding (20 steps of dt = 0.05s)
    let totalHungerReduction = 0;
    let totalEnergyGain = 0;
    for (let i = 0; i < 20; i++) {
      out = layer.step(sucroseStimulus, 0.05, 85, false);
      totalHungerReduction += Math.abs(out.hungerDelta);
      totalEnergyGain += out.energyDelta;
    }

    // Expect gradual intake ~3.5 units/s (not 0, and not an instant 100 reset)
    expect(totalHungerReduction).toBeGreaterThan(2.0);
    expect(totalHungerReduction).toBeLessThan(5.0);
    expect(totalEnergyGain).toBeGreaterThan(1.5);
    expect(totalEnergyGain).toBeLessThan(4.0);
  });

  // 7. Feeding stops when food is depleted or contact is lost
  it('7. feeding stops cleanly when food surface is depleted', () => {
    const env = new GustatoryEnvironment();
    const layer = new GustatoryProcessingLayer();

    // Consume all food on the buffet surface
    env.consumeFood('dining_buffet', 100.0);
    const depletedContact = env.sampleContact([-1.3, 1.25, -3.3], 'dining');
    expect(depletedContact.isContact).toBe(true);
    expect(depletedContact.foodRemaining).toBe(0.0);

    const out = layer.step(depletedContact, 0.05, 80, false);
    expect(out.isFeeding).toBe(false);
    expect(out.interruptionReason).toBe('food_depleted');
  });

  // 8. Aversive input interrupts or prevents feeding as specified
  it('8. aversive bitter input interrupts and prevents feeding immediately', () => {
    const layer = new GustatoryProcessingLayer();
    const bitterStimulus: FoodContactStimulus = {
      isContact: true,
      isValid: true,
      surfaceId: 'cleaning_substrate',
      surfaceName: 'Disinfected Countertop',
      sourceName: 'Disinfected Countertop',
      surfacePosition: [0, 1.0, 0],
      tastant: 'bitter',
      tastantType: 'bitter',
      sweetIntensity: 0.0,
      bitterIntensity: 0.9,
      stimulusStrength: 0.9,
      foodRemaining: 100,
      distanceToSurface: 0.05,
      provenance: 'synthetic_tastant_field',
    };

    const out = layer.step(bitterStimulus, 0.05, 80, false);
    expect(out.isFeeding).toBe(false);
    expect(out.interruptionReason).toBe('aversive_bitter');
    expect(out.proboscisExtension).toBe(0.0);
  });

  // 9. Reward experience updates the learning state
  it('9. sucrose reward outcome updates mushroom body learning state (delta V > 0)', () => {
    const learning = new MushroomBodyLearningLayer();
    const preValence = learning.getLearnedValence('apple_cider_vinegar');
    expect(preValence).toBe(0.0);

    // 1 trial pairing with sugar reward (R_US = +1.0)
    const result = learning.learn('apple_cider_vinegar', 1.0, 1.0);
    expect(result.deltaV).toBeGreaterThan(0.3);
    expect(result.newValence).toBeGreaterThan(0.3);
    expect(result.newValence).toBeLessThanOrEqual(1.0);
    expect(learning.getLearnedValence('apple_cider_vinegar')).toBe(result.newValence);
  });

  // 10. Repeated odor–outcome experiences produce the documented preference change
  it('10. repeated reward trials asymptotically increase preference toward +1.0 bound', () => {
    const learning = new MushroomBodyLearningLayer();

    let val = 0.0;
    for (let trial = 0; trial < 10; trial++) {
      const res = learning.learn('banana', 1.0, 0.5);
      expect(res.newValence).toBeGreaterThanOrEqual(val);
      val = res.newValence;
    }

    expect(val).toBeGreaterThan(0.8);
    expect(val).toBeLessThanOrEqual(1.0);
  });

  // 11. Learning values remain bounded and numerically stable
  it('11. learning values remain strictly bounded within [-1.0, 1.0] under extreme iterations', () => {
    const learning = new MushroomBodyLearningLayer();

    // 100 trials of strong positive reward
    for (let i = 0; i < 100; i++) {
      learning.learn('hyper_positive', 10.0, 2.0);
    }
    expect(learning.getLearnedValence('hyper_positive')).toBe(1.0);

    // 100 trials of strong negative aversive punishment
    for (let i = 0; i < 100; i++) {
      learning.learn('hyper_negative', -10.0, 2.0);
    }
    expect(learning.getLearnedValence('hyper_negative')).toBe(-1.0);

    // NaN / invalid odor handling
    const nanRes = learning.learn('', NaN, NaN);
    expect(nanRes.newValence).toBe(0.0);
  });

  // 12. Reset restores the documented initial learning state
  it('12. reset restores documented initial learning state (zero valence and cleared history)', () => {
    const learning = new MushroomBodyLearningLayer();
    learning.learn('odor_a', 1.0, 1.0);
    learning.learn('odor_b', -1.0, 1.0);

    expect(learning.getLearnedValence('odor_a')).toBeGreaterThan(0);
    expect(learning.getLearnedValence('odor_b')).toBeLessThan(0);
    expect(learning.getExperienceHistory().length).toBe(2);

    learning.reset();
    expect(learning.getLearnedValence('odor_a')).toBe(0.0);
    expect(learning.getLearnedValence('odor_b')).toBe(0.0);
    expect(learning.getExperienceHistory().length).toBe(0);
  });

  // 13. Learned preference actually affects food selection or arbitration
  it('13. learned odor valence measurably modulates olfactory chemotaxis attraction', () => {
    const controller = new ConnectomeFlyController();

    // Position fly near the dining room buffet odor emitter
    const pos: [number, number, number] = [-1.3, 1.5, -2.5];
    const vel: [number, number, number] = [0, 0, 0];

    // Case A: Naive odor preference (valence = 0)
    controller.reset();
    const naiveRes = controller.update(pos, vel, 0, roomBounds, 0.05, null, 'dining', 80);
    const naiveAttraction = naiveRes.snapshot.olfactory?.foodAttractionSignal ?? 0;
    expect(naiveAttraction).toBeGreaterThan(0);

    // Case B: Positively conditioned odor preference (valence = +1.0)
    controller.pairOdorReward('apple_cider_vinegar', 1.0);
    controller.pairOdorReward('apple_cider_vinegar', 1.0);
    const positiveRes = controller.update(pos, vel, 0, roomBounds, 0.05, null, 'dining', 80);
    const positiveAttraction = positiveRes.snapshot.olfactory?.foodAttractionSignal ?? 0;
    expect(positiveAttraction).toBeGreaterThanOrEqual(naiveAttraction);

    // Case C: Negatively conditioned odor preference (valence = -1.0, aversive shock)
    controller.pairOdorReward('apple_cider_vinegar', -1.0);
    controller.pairOdorReward('apple_cider_vinegar', -1.0);
    controller.pairOdorReward('apple_cider_vinegar', -1.0);
    const aversiveRes = controller.update(pos, vel, 0, roomBounds, 0.05, null, 'dining', 80);
    const aversiveAttraction = aversiveRes.snapshot.olfactory?.foodAttractionSignal ?? 0;
    // Negatively learned odor suppresses chemotaxis attraction to zero
    expect(aversiveAttraction).toBe(0.0);
  });

  // 14. Learning cannot bypass obstacle avoidance or physical movement constraints
  it('14. learned preference cannot bypass physical room bounds or obstacles', () => {
    const controller = new ConnectomeFlyController();
    controller.pairOdorReward('apple_cider_vinegar', 1.0);

    // Fly placed right at the edge of the room boundary
    const nearBoundaryPos: [number, number, number] = [3.9, 1.5, 3.9];
    const fastVel: [number, number, number] = [5.0, 0, 5.0];

    const res = controller.update(nearBoundaryPos, fastVel, 0, roomBounds, 0.1, null, 'dining', 80);
    // Boundary clamping (roomBounds max = 4.0 - margin 0.2 = 3.8)
    expect(res.newPosition[0]).toBeLessThanOrEqual(roomBounds.maxX - 0.2);
    expect(res.newPosition[2]).toBeLessThanOrEqual(roomBounds.maxZ - 0.2);
  });

  // 15. Existing olfactory chemotaxis and Δ7 behavior remain integrated
  it('15. olfactory chemotaxis and Delta7 compass steering remain integrated alongside gustatory subsystem', () => {
    const controller = new ConnectomeFlyController();
    const pos: [number, number, number] = [-1.3, 1.5, -2.5];
    const res = controller.update(pos, [0, 0, 0], 0, roomBounds, 0.05, null, 'dining', 80);

    // Delta7 telemetry exists and is stable
    expect(res.snapshot.centralComplex?.delta7).toBeDefined();
    expect(res.snapshot.centralComplex?.delta7?.isStable).toBe(true);

    // Olfactory telemetry exists
    expect(res.snapshot.olfactory).toBeDefined();
    expect(res.snapshot.olfactory?.intensity).toBeGreaterThan(0);

    // Gustatory telemetry exists
    expect(res.snapshot.gustatory).toBeDefined();
    expect(res.snapshot.gustatory?.contactState).toBe('airborne');

    // Learning telemetry exists
    expect(res.snapshot.learning).toBeDefined();
  });

  // 16. Schedule, cognitive, connectome, and manual modes remain compatible
  it('16. all controller modes (connectome, cognitive, schedule, manual) remain compatible', () => {
    const store = useGameStore.getState();

    // Mode switching without error
    store.setControllerMode('connectome');
    expect(useGameStore.getState().controllerMode).toBe('connectome');

    store.setControllerMode('cognitive');
    expect(useGameStore.getState().controllerMode).toBe('cognitive');

    store.setControllerMode('schedule');
    expect(useGameStore.getState().controllerMode).toBe('schedule');

    store.setControllerMode('manual');
    expect(useGameStore.getState().controllerMode).toBe('manual');

    // Restore to connectome
    store.setControllerMode('connectome');
    expect(useGameStore.getState().controllerMode).toBe('connectome');
  });

  // 17. No teleportation, waypoint snapping, or feeding without contact
  it('17. no teleportation or snapping occurs when reaching a waypoint without contact', () => {
    const controller = new ConnectomeFlyController();
    const startPos: [number, number, number] = [-1.3, 2.2, -3.3];
    const startVel: [number, number, number] = [0, 0, 0];
    const goal = createNavigationGoal([-1.3, 1.2, -3.3], startPos, 0, 'dining_table', 0.4, 'schedule_waypoint');

    const dt = 0.05;
    const res = controller.update(startPos, startVel, 0, roomBounds, dt, goal, 'dining', 80);

    // Distance moved in single frame must be bounded by speed limit * dt (smooth flight, not a snap)
    const dx = res.newPosition[0] - startPos[0];
    const dy = res.newPosition[1] - startPos[1];
    const dz = res.newPosition[2] - startPos[2];
    const distanceStep = Math.sqrt(dx * dx + dy * dy + dz * dz);

    expect(distanceStep).toBeLessThan(0.3); // max speed 2.5 * 0.05 = 0.125m
    expect(res.isFeeding).toBe(false);      // distance > 0.18m, so cannot feed
    expect(res.proboscisExtension).toBe(0.0);
  });

  // 18. Inspector telemetry corresponds to the underlying state
  it('18. inspector snapshot telemetry strictly corresponds to underlying physiological state', () => {
    const controller = new ConnectomeFlyController();
    // Place fly directly on buffet surface in contact and step to complete proboscis extension
    const contactPos: [number, number, number] = [-1.3, 1.25, -3.3];
    let res: any;
    for (let i = 0; i < 15; i++) {
      res = controller.update(contactPos, [0, 0, 0], 0, roomBounds, 0.05, null, 'dining', 80);
    }

    const snap = res.snapshot;
    expect(snap.gustatory).toBeDefined();
    expect(snap.gustatory?.contactState).toBe('contact_detected');
    expect(snap.gustatory?.foodSurfaceName).toContain('Buffet');
    expect(snap.gustatory?.tastant).toBe('sucrose');
    expect(snap.gustatory?.stimulusStrength).toBeGreaterThan(0.5);
    expect(snap.gustatory?.isFeeding).toBe(true);

    expect(snap.learning).toBeDefined();
    expect(snap.learning?.activeOdorCue).toBe('food_odor');
    expect(snap.learning?.unconditionedStimulus).toBe('sucrose_reward');
    expect(snap.learning?.rewardSignal).toBe(1.0);
  });
});
