/**
 * VISHALFLY — Connectome Sensory Adapter
 * 
 * Bridges 3D simulation environment percepts into biophysically scaled
 * injected currents (I_inj) for biological sensory neurons in the connectome.
 * 
 * Target Biological Sensory Neurons:
 * - L1: Lamina monopolar neuron (ON-luminance channels: 10465 [R], 10466 [L])
 * - L2: Lamina monopolar neuron (OFF-contrast looming channels: 10350 [R], 10351 [L])
 */

import { LIFDynamicsEngine } from '../dynamics/LIFDynamicsEngine';

export interface SensoryEnvironmentPercept {
  flyPosition: [number, number, number];
  flyVelocity: [number, number, number];
  roomBounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
  headingAngle: number; // fly yaw in radians
  nearestObstacleDistance: number; // meters to closest room boundary or obstacle
  approachVelocity: number; // positive if moving towards obstacle (m/s)
  ambientLightLevel?: number; // 0.0 to 1.0
  isManualThreatTriggered?: boolean; // debug trigger
}

export interface SensoryEncodingTelemetry {
  loomingThreatSignal: number;
  luminanceDrive: number;
  leftInjectedCurrent: number;
  rightInjectedCurrent: number;
  nearestBoundaryDistance: number;
}

export class ConnectomeSensoryAdapter {
  private sensoryNeuronIds = {
    l1Right: 10465,
    l2Right: 10350,
    l1Left: 10466,
    l2Left: 10351,
  };

  private lastTelemetry: SensoryEncodingTelemetry = {
    loomingThreatSignal: 0,
    luminanceDrive: 0,
    leftInjectedCurrent: 0,
    rightInjectedCurrent: 0,
    nearestBoundaryDistance: 5.0,
  };

  /**
   * Encodes physical 3D sensory stimuli and injects currents into the neural engine.
   */
  public update(engine: LIFDynamicsEngine, percept: SensoryEnvironmentPercept): SensoryEncodingTelemetry {
    // 1. Calculate Looming Threat Stimulus
    // In Drosophila, approaching objects create an expanding visual angle (theta)
    // with angular expansion rate r/v that drives LC4 looming detectors.
    const detectionRadius = 3.5; // meters
    const dist = Math.max(0.1, percept.nearestObstacleDistance);
    const approachSpeed = Math.max(0, percept.approachVelocity);

    let loomingSignal = 0;
    if (dist < detectionRadius && approachSpeed > 0.1) {
      // Looming intensity scales inversely with distance and directly with approach velocity
      loomingSignal = Math.min(1.0, (approachSpeed / dist) * 0.7);
    }

    if (percept.isManualThreatTriggered) {
      loomingSignal = 1.0;
    }

    // 2. Luminance & Contrast Stimulus
    const ambientLight = percept.ambientLightLevel ?? 0.8;
    const l1Current = ambientLight * 0.3; // baseline tonic drive (nA)

    // 3. Looming drive injected into L2 (primary OFF/looming contrast detector)
    // Scale: 0 to 2.5 nA (sufficient to drive L2 -> Tm2/Tm4 -> LC4 action potentials)
    const loomingCurrent = loomingSignal * 2.8;

    // Asymmetry based on velocity direction
    const velX = percept.flyVelocity[0];
    const leftBias = velX < -0.1 ? 1.2 : 1.0;
    const rightBias = velX > 0.1 ? 1.2 : 1.0;

    const currentLeft = (l1Current + loomingCurrent) * leftBias;
    const currentRight = (l1Current + loomingCurrent) * rightBias;

    // 4. Inject currents into verified biological neurons
    engine.setInjectedCurrent(this.sensoryNeuronIds.l1Right, l1Current);
    engine.setInjectedCurrent(this.sensoryNeuronIds.l1Left, l1Current);
    engine.setInjectedCurrent(this.sensoryNeuronIds.l2Right, currentRight);
    engine.setInjectedCurrent(this.sensoryNeuronIds.l2Left, currentLeft);

    // If looming threat is present, directly drive lobula LC4 looming detectors (12032 [R], 12033 [L])
    const lc4Drive = loomingSignal > 0 ? loomingSignal * 3.5 : 0;
    engine.setInjectedCurrent(12032, lc4Drive);
    engine.setInjectedCurrent(12033, lc4Drive);

    this.lastTelemetry = {
      loomingThreatSignal: Math.round(loomingSignal * 100) / 100,
      luminanceDrive: Math.round(ambientLight * 100) / 100,
      leftInjectedCurrent: Math.round(currentLeft * 100) / 100,
      rightInjectedCurrent: Math.round(currentRight * 100) / 100,
      nearestBoundaryDistance: Math.round(dist * 100) / 100,
    };

    return this.lastTelemetry;
  }

  public getTelemetry(): SensoryEncodingTelemetry {
    return this.lastTelemetry;
  }
}
