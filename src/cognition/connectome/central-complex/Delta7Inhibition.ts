/**
 * VISHALFLY — Central Complex Protocerebral Bridge (PB) Δ7 Inhibition Layer
 * 
 * Implements a modular inhibitory component modeling the biological role of
 * Protocerebral Bridge Δ7 (Delta7) interneurons in central-complex heading stability.
 * 
 * Biological Rationale & Investigation Findings:
 * - Janelia MaleCNS v1.0 contains 42 verified biological Delta7 neurons (21 Right, 21 Left).
 * - Consensus neurotransmitter is 100% Glutamate (predicted and confirmed).
 * - In Drosophila central nervous system, glutamate is an INHIBITORY transmitter
 *   acting on glutamate-gated chloride channels (GluCl-alpha) with reversal potential
 *   E_rev = -70.0 mV (Liu & Wilson 2013; Franconville et al., eLife 2018; Turner-Evans et al. 2020).
 * - Delta7 neurons receive excitatory cholinergic input from E-PG compass neurons in
 *   specific PB glomeruli and project wide-field cross-column inhibition to opposing
 *   columns, creating surround inhibition that sharpens the heading bump and prevents
 *   runaway excitation or multi-peak ambiguity (Hulse et al., eLife 2021).
 * 
 * Scientific Provenance & Classification:
 * - [MEASURED]: 42 biological Delta7 neuron body IDs and glutamatergic identity in MaleCNS v1.0.
 * - [MODELED ABSTRACTION]: Because individual EM synapse tables connecting the 42 Delta7
 *   cells to 4-quadrant E-PG channels are not in the local cache, this component is
 *   explicitly designated as an experimental modeled abstraction.
 * - [CONDUCTANCE GROUNDED]: Uses the existing LIF engine's inhibitory reversal convention
 *   (E_rev = -70.0 mV) and bounded inhibitory conductance scaling.
 */

export interface Delta7Parameters {
  /** Whether Delta7 surround inhibition is active */
  enabled: boolean;
  /** Relative cross-column inhibitory coupling strength [0.0 to 1.0] */
  inhibitionStrength: number;
  /** Inhibitory reversal potential in mV (-70.0 mV for GluCl) */
  eRevInhibitory: number;
}

export interface Delta7Telemetry {
  /** Whether the inhibitory component is actively engaged */
  isEnabled: boolean;
  /** Total inhibitory suppression current applied to left heading channel (nA) */
  leftInhibition: number;
  /** Total inhibitory suppression current applied to right heading channel (nA) */
  rightInhibition: number;
  /** Compass bump contrast ratio [0.0 = completely flat/saturated, 1.0 = sharp single peak] */
  bumpContrastRatio: number;
  /** Numerical stability flag (true if rates and potentials are strictly bounded) */
  isStable: boolean;
  /** Biological and modeling provenance label */
  provenance: 'modeled_surround_inhibition';
}

export const DEFAULT_DELTA7_PARAMS: Delta7Parameters = {
  enabled: true,
  inhibitionStrength: 0.35,
  eRevInhibitory: -70.0,
};

export class ExperimentalDelta7Inhibition {
  private params: Delta7Parameters;
  private lastTelemetry: Delta7Telemetry;

  constructor(customParams?: Partial<Delta7Parameters>) {
    this.params = { ...DEFAULT_DELTA7_PARAMS, ...customParams };
    this.lastTelemetry = {
      isEnabled: this.params.enabled,
      leftInhibition: 0.0,
      rightInhibition: 0.0,
      bumpContrastRatio: 1.0,
      isStable: true,
      provenance: 'modeled_surround_inhibition',
    };
  }

  public getParams(): Delta7Parameters {
    return { ...this.params };
  }

  public setParams(updated: Partial<Delta7Parameters>): void {
    this.params = { ...this.params, ...updated };
  }

  /**
   * Evaluates bilateral E-PG heading activity and computes cross-column surround inhibition.
   * When Left E-PG is active, Delta7 suppresses Right E-PG channels, and vice-versa.
   * 
   * @param epgRates Firing rates of the 4 E-PG quadrant neurons (Hz)
   * @param epgPotentials Membrane potentials of the 4 E-PG neurons (mV)
   * @returns Inhibitory adjustments for left and right channels
   */
  public evaluateInhibition(
    epgRates: { r1: number; r2: number; l1: number; l2: number },
    epgPotentials?: Record<number, number>
  ): {
    leftInhCurrent: number;
    rightInhCurrent: number;
    telemetry: Delta7Telemetry;
  } {
    if (!this.params.enabled) {
      this.lastTelemetry = {
        isEnabled: false,
        leftInhibition: 0.0,
        rightInhibition: 0.0,
        bumpContrastRatio: 1.0,
        isStable: true,
        provenance: 'modeled_surround_inhibition',
      };
      return { leftInhCurrent: 0.0, rightInhCurrent: 0.0, telemetry: this.lastTelemetry };
    }

    // Bilateral activity sums
    const rightActivity = Math.max(0, (epgRates.r1 ?? 0) + (epgRates.r2 ?? 0));
    const leftActivity = Math.max(0, (epgRates.l1 ?? 0) + (epgRates.l2 ?? 0));
    const totalActivity = rightActivity + leftActivity;

    // Cross-column inhibition:
    // Right E-PG excitation drives Delta7_R, which projects inhibitory current to Left E-PG
    // Left E-PG excitation drives Delta7_L, which projects inhibitory current to Right E-PG
    const maxInhibitionCurrent = 1.2; // nA
    const leftInhCurrent = Math.min(
      maxInhibitionCurrent,
      (rightActivity / 30.0) * this.params.inhibitionStrength * maxInhibitionCurrent
    );
    const rightInhCurrent = Math.min(
      maxInhibitionCurrent,
      (leftActivity / 30.0) * this.params.inhibitionStrength * maxInhibitionCurrent
    );

    // Compass Bump Contrast Ratio:
    // Measures bump sharpness: |R - L| / (R + L + epsilon)
    // When one hemisphere dominates, contrast -> 1.0 (clean localized bump).
    // When both fire equally with high rate, contrast -> 0.0 (unstable/saturated).
    const contrast = totalActivity > 0.1
      ? Math.abs(rightActivity - leftActivity) / (totalActivity + 1e-4)
      : 1.0;

    // Numerical stability check
    let isStable = true;
    if (epgPotentials) {
      for (const vm of Object.values(epgPotentials)) {
        if (!Number.isFinite(vm) || vm < -90.0 || vm > 20.0) {
          isStable = false;
          break;
        }
      }
    }
    if (!Number.isFinite(rightActivity) || !Number.isFinite(leftActivity) || totalActivity > 400.0) {
      isStable = false;
    }

    this.lastTelemetry = {
      isEnabled: true,
      leftInhibition: Math.round(leftInhCurrent * 1000) / 1000,
      rightInhibition: Math.round(rightInhCurrent * 1000) / 1000,
      bumpContrastRatio: Math.round(contrast * 100) / 100,
      isStable,
      provenance: 'modeled_surround_inhibition',
    };

    return {
      leftInhCurrent,
      rightInhCurrent,
      telemetry: this.lastTelemetry,
    };
  }

  public getTelemetry(): Delta7Telemetry {
    return this.lastTelemetry;
  }

  public reset(): void {
    this.lastTelemetry = {
      isEnabled: this.params.enabled,
      leftInhibition: 0.0,
      rightInhibition: 0.0,
      bumpContrastRatio: 1.0,
      isStable: true,
      provenance: 'modeled_surround_inhibition',
    };
  }
}
