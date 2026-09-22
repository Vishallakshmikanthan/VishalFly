export interface CognitiveConfig {
  /** Master switch for cognitive decision layer */
  isCognitionEnabled: boolean;

  /** Master switch for memory influence on candidate scoring */
  isMemoryInfluenceEnabled: boolean;

  /** Master switch for adaptive behavior adjustments */
  isAdaptationEnabled: boolean;

  /** Minimum commitment time before non-urgent behaviors can switch (in sim seconds) */
  minimumCommitmentIntervalSimSeconds: number;

  /** Maximum memory records retained in bounded memory */
  memoryCapacity: number;

  /** Memory record retention duration in simulated minutes */
  memoryRetentionDurationSimMinutes: number;

  /** Max number of relevant memories retrieved per decision evaluation */
  memoryRetrievalLimit: number;

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

  /** Maximum score adjustment allowed by adaptive behavior experiments [-40, +40] */
  adaptationMaxAdjustment: number;

  /** Weight applied to recent outcome records (successes/failures) */
  outcomeInfluenceWeight: number;

  /** Rolling window (in sim minutes) to inspect routine completions */
  routineMemoryWindowMinutes: number;

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
  isMemoryInfluenceEnabled: true,
  isAdaptationEnabled: true,
  minimumCommitmentIntervalSimSeconds: 15 * 60, // 15 sim minutes minimum commitment
  memoryCapacity: 50,
  memoryRetentionDurationSimMinutes: 180, // 3 hours
  memoryRetrievalLimit: 5,
  evaluationIntervalSimMinutes: 15,
  scheduleWeight: 1.0,
  needReliefWeight: 1.0,
  continuityBonusMax: 20,
  repetitionPenaltyPerOccurrence: 12,
  adaptationMaxAdjustment: 20,
  outcomeInfluenceWeight: 10,
  routineMemoryWindowMinutes: 180,
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
    isMemoryInfluenceEnabled: config.isMemoryInfluenceEnabled ?? DEFAULT_COGNITIVE_CONFIG.isMemoryInfluenceEnabled,
    isAdaptationEnabled: config.isAdaptationEnabled ?? DEFAULT_COGNITIVE_CONFIG.isAdaptationEnabled,
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
    memoryRetrievalLimit: Math.max(
      1,
      Math.min(20, config.memoryRetrievalLimit ?? DEFAULT_COGNITIVE_CONFIG.memoryRetrievalLimit)
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
    adaptationMaxAdjustment: Math.max(
      5,
      Math.min(40, config.adaptationMaxAdjustment ?? DEFAULT_COGNITIVE_CONFIG.adaptationMaxAdjustment)
    ),
    outcomeInfluenceWeight: Math.max(
      0,
      Math.min(30, config.outcomeInfluenceWeight ?? DEFAULT_COGNITIVE_CONFIG.outcomeInfluenceWeight)
    ),
    routineMemoryWindowMinutes: Math.max(
      30,
      Math.min(720, config.routineMemoryWindowMinutes ?? DEFAULT_COGNITIVE_CONFIG.routineMemoryWindowMinutes)
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
