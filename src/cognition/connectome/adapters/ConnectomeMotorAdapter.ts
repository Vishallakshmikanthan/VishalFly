/**
 * VISHALFLY — Connectome Motor Output Adapter
 * 
 * Decodes descending premotor neural activity (Giant Fiber DNp01 & steering DNp11)
 * into physical flight control forces, turning rates, and escape behaviors.
 * 
 * Biological Grounding:
 * - DNp01 (Giant Fiber): Dorsal longitudinal muscle & tergotrochanteral motor drive
 *   initiating ballistic escape jump/takeoff in response to looming visual threats.
 * - DNp11 / DNg02: Wing motor neuropil steering bias controlling asymmetric wing stroke amplitude.
 */

import { NeuralMotorOutputs } from '../types';

export interface DecodedMotorCommand {
  thrustAccel: number;        // Forward acceleration (m/s^2)
  liftAccel: number;          // Vertical acceleration (m/s^2)
  yawTurnRate: number;        // Yaw angular velocity (rad/s)
  targetRoll: number;         // Roll banking angle (rad)
  isEscapeTriggered: boolean; // Giant Fiber reflex active
  flightSpeedLimit: number;   // Max forward velocity (m/s)
  activityPose: 'flying' | 'sitting';
}

export class ConnectomeMotorAdapter {
  private escapeTimerMs = 0;
  private readonly escapeDurationMs = 600; // Duration of ballistic escape burst

  /**
   * Decodes descending neuron firing states into physical flight forces.
   */
  public decode(motorOutputs: NeuralMotorOutputs, deltaSimSec: number): DecodedMotorCommand {
    const dtMs = deltaSimSec * 1000;

    // 1. Process Giant Fiber (DNp01) Escape Reflex
    if (motorOutputs.dnEscapeSpike || motorOutputs.dnEscapeRate > 5.0) {
      this.escapeTimerMs = this.escapeDurationMs;
    } else if (this.escapeTimerMs > 0) {
      this.escapeTimerMs = Math.max(0, this.escapeTimerMs - dtMs);
    }

    const isEscapeActive = this.escapeTimerMs > 0;

    if (isEscapeActive) {
      // High-intensity escape takeoff burst
      const burstPhase = this.escapeTimerMs / this.escapeDurationMs; // 1.0 down to 0.0
      const lift = 18.0 + burstPhase * 12.0;   // Rapid vertical ascent
      const thrust = 15.0 + burstPhase * 8.0;  // Forward acceleration
      const yaw = (motorOutputs.dnSteerYaw !== 0 ? motorOutputs.dnSteerYaw : 1.0) * 3.5;
      const roll = (motorOutputs.dnSteerYaw > 0 ? -0.45 : 0.45);

      return {
        thrustAccel: thrust,
        liftAccel: lift,
        yawTurnRate: yaw,
        targetRoll: roll,
        isEscapeTriggered: true,
        flightSpeedLimit: 7.5,
        activityPose: 'flying',
      };
    }

    // 2. Normal Autonomous Flight Cruise & Steering (DNp11 driven)
    // Moderate forward cruise drive modulated by descending motor tone
    const baselineThrust = 8.0;
    const liftHolding = 0.5; // slight buoyant lift to counteract gravity
    const yawSteer = motorOutputs.dnSteerYaw * 2.2;
    const bankingRoll = -motorOutputs.dnSteerYaw * 0.35;

    return {
      thrustAccel: baselineThrust,
      liftAccel: liftHolding,
      yawTurnRate: yawSteer,
      targetRoll: bankingRoll,
      isEscapeTriggered: false,
      flightSpeedLimit: 4.2,
      activityPose: 'flying',
    };
  }

  public isEscapeActive(): boolean {
    return this.escapeTimerMs > 0;
  }

  public reset(): void {
    this.escapeTimerMs = 0;
  }
}
