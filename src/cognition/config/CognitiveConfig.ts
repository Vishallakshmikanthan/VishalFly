export interface CognitiveConfig {
  /** Master switch for cognitive decision layer */
  isCognitionEnabled: boolean;

  /** Minimum commitment time before non-urgent behaviors can switch (in sim seconds) */
  minimumCommitmentIntervalSimSeconds: number;

  /** Maximum memory records retained in bounded memory */
  memoryCapacity: number;

  /** Memory record retention duration in simulated minutes */
  memoryRetentionDurationSimMinutes: number;

  /** Interval between regular cognitive evaluations (in simulated minutes) */
  evaluationIntervalSimMinutes: number;

  /** Weight applied to schedule compatibility [0 - 2.0] */
  scheduleWeight: number;

  /** Weight applied to need relief bonus [0 - 2.0] */
  needReliefWeight: number;

  /** Weight applied to continuity/hysteresis bonus [0 - 50] */
  continuityBonusMax: number;

  /** Penalty applied per recent repetition of distracting behaviors [0 - 30] */
  repetitionPenaltyPerOccurrence: number;

  /** Thresholds for urgent need override (allows candidate override if permitted) */
  urgencyThresholds: {
    criticalEnergyLow: number;      // e.g. < 12 triggers emergency rest desire
    criticalHungerHigh: number;     // e.g. > 85 triggers emergency sustenance desire
    criticalSleepinessHigh: number; // e.g. > 88 triggers sleep desire
  };

  /** Whether debug diagnostics and events should be emitted to EventLogger */
  verboseLogging: boolean;
}

export const DEFAULT_COGNITIVE_CONFIG: CognitiveConfig = {
  isCognitionEnabled: true,
  minimumCommitmentIntervalSimSeconds: 15 * 60, // 15 sim minutes minimum commitment
  memoryCapacity: 50,
  memoryRetentionDurationSimMinutes: 180, // 3 hours
  evaluationIntervalSimMinutes: 15,
  scheduleWeight: 1.0,
  needReliefWeight: 1.0,
  continuityBonusMax: 20,
  repetitionPenaltyPerOccurrence: 12,
  urgencyThresholds: {
    criticalEnergyLow: 12,
    criticalHungerHigh: 85,
    criticalSleepinessHigh: 88,
  },
  verboseLogging: true,
};

export function validateCognitiveConfig(config: Partial<CognitiveConfig>): CognitiveConfig {
  return {
    isCognitionEnabled: config.isCognitionEnabled ?? DEFAULT_COGNITIVE_CONFIG.isCognitionEnabled,
    minimumCommitmentIntervalSimSeconds: Math.max(
      60,
      config.minimumCommitmentIntervalSimSeconds ?? DEFAULT_COGNITIVE_CONFIG.minimumCommitmentIntervalSimSeconds
    ),
    memoryCapacity: Math.max(
      10,
      Math.min(200, config.memoryCapacity ?? DEFAULT_COGNITIVE_CONFIG.memoryCapacity)
    ),
    memoryRetentionDurationSimMinutes: Math.max(
      30,
      config.memoryRetentionDurationSimMinutes ?? DEFAULT_COGNITIVE_CONFIG.memoryRetentionDurationSimMinutes
    ),
    evaluationIntervalSimMinutes: Math.max(
      1,
      config.evaluationIntervalSimMinutes ?? DEFAULT_COGNITIVE_CONFIG.evaluationIntervalSimMinutes
    ),
    scheduleWeight: Math.max(0, Math.min(3, config.scheduleWeight ?? DEFAULT_COGNITIVE_CONFIG.scheduleWeight)),
    needReliefWeight: Math.max(0, Math.min(3, config.needReliefWeight ?? DEFAULT_COGNITIVE_CONFIG.needReliefWeight)),
    continuityBonusMax: Math.max(0, Math.min(50, config.continuityBonusMax ?? DEFAULT_COGNITIVE_CONFIG.continuityBonusMax)),
    repetitionPenaltyPerOccurrence: Math.max(
      0,
      Math.min(30, config.repetitionPenaltyPerOccurrence ?? DEFAULT_COGNITIVE_CONFIG.repetitionPenaltyPerOccurrence)
    ),
    urgencyThresholds: {
      criticalEnergyLow: Math.max(
        0,
        Math.min(30, config.urgencyThresholds?.criticalEnergyLow ?? DEFAULT_COGNITIVE_CONFIG.urgencyThresholds.criticalEnergyLow)
      ),
      criticalHungerHigh: Math.max(
        60,
        Math.min(100, config.urgencyThresholds?.criticalHungerHigh ?? DEFAULT_COGNITIVE_CONFIG.urgencyThresholds.criticalHungerHigh)
      ),
      criticalSleepinessHigh: Math.max(
        60,
        Math.min(100, config.urgencyThresholds?.criticalSleepinessHigh ?? DEFAULT_COGNITIVE_CONFIG.urgencyThresholds.criticalSleepinessHigh)
      ),
    },
    verboseLogging: config.verboseLogging ?? DEFAULT_COGNITIVE_CONFIG.verboseLogging,
  };
}
