import React, { useState } from 'react';
import {
  Globe,
  Sparkles,
  Zap,
  Clock,
  RefreshCw,
  Sliders,
  Shield,
  Sun,
  Flame,
  Utensils,
  Wind,
  Coffee,
  Play,
  RotateCcw,
  CheckCircle2,
  Shirt,
  BrainCircuit,
  Activity,
  Layers
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { WorldEventCategory } from '../../simulation/events/WorldEventTypes';
import { DEFAULT_WORLD_EVENT_DEFINITIONS } from '../../simulation/events/WorldEventDefinitions';

export const LivingWorldView: React.FC = () => {
  const livingWorld = useGameStore((state) => state.livingWorldTelemetry);
  const simulatedTime = useGameStore((state) => state.simulatedTime);
  const simulationClock = useGameStore((state) => state.simulationClock);
  const activeActivity = useGameStore((state) => state.currentActivity);
  const currentSpot = useGameStore((state) => state.currentSpot);
  const cognitiveData = useGameStore((state) => state.cognitiveInspectorData);
  const isWeekend = simulationClock.dayType === 'weekend';

  const triggerWorldEvent = useGameStore((state) => state.triggerWorldEvent);
  const setWorldEventCategoryEnabled = useGameStore((state) => state.setWorldEventCategoryEnabled);
  const setWorldEventsMasterEnabled = useGameStore((state) => state.setWorldEventsMasterEnabled);
  const setWorldEventSeed = useGameStore((state) => state.setWorldEventSeed);
  const resetWorldEvents = useGameStore((state) => state.resetWorldEvents);

  const [customSeedInput, setCustomSeedInput] = useState<string>(
    livingWorld?.settings?.deterministicSeed?.toString() ?? '42'
  );

  if (!livingWorld) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono">
        <Activity className="w-6 h-6 animate-spin text-amber-400 mr-2" />
        Initializing Living World Telemetry...
      </div>
    );
  }

  const categoryLabels: Record<WorldEventCategory, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
    ambient_creature: { label: 'Ambient Creatures', icon: Wind, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    lighting_ambience: { label: 'Lighting & Ambience', icon: Sun, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    food_availability: { label: 'Food Availability', icon: Utensils, color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
    college_apartment_activity: { label: 'College / Apartment Activity', icon: Coffee, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
    interruption: { label: 'Occasional Interruptions', icon: Zap, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
    weekend_routine: { label: 'Weekend Routine (Laundry & Orders)', icon: Shirt, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  };

  const handleApplySeed = () => {
    const parsed = parseInt(customSeedInput, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setWorldEventSeed(parsed);
    }
  };

  const handleRerollSeed = () => {
    const nextSeed = Math.floor(Math.random() * 1000000);
    setCustomSeedInput(nextSeed.toString());
    setWorldEventSeed(nextSeed);
  };

  const effects = livingWorld.activeEffects;
  const bestEval = cognitiveData?.evaluations?.[0];
  const lastDec = cognitiveData?.lastDecision;

  return (
    <div className="w-full h-full overflow-y-auto px-4 py-6 md:px-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Header Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Globe className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Living World & Emergent Events
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Milestone 5
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Lightweight, deterministic world-event generation, contextual arbitration & autonomous weekend routines.
              </p>
            </div>
          </div>
        </div>

        {/* Master & Seed Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setWorldEventsMasterEnabled(!livingWorld.settings.isMasterEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              livingWorld.settings.isMasterEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {livingWorld.settings.isMasterEnabled ? 'World Events: ACTIVE' : 'World Events: DISABLED'}
          </button>

          {/* Seed Setting */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 font-mono">Seed:</span>
            <input
              type="number"
              value={customSeedInput}
              onChange={(e) => setCustomSeedInput(e.target.value)}
              className="w-20 bg-slate-800 text-amber-300 font-mono px-1.5 py-0.5 rounded border border-slate-700 text-xs focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleApplySeed}
              title="Apply Seed"
              className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </button>
            <button
              onClick={handleRerollSeed}
              title="Reroll Seed"
              className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>

          {/* Reset System */}
          <button
            onClick={() => resetWorldEvents()}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5"
            title="Clear all active events and history"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Reset Events
          </button>
        </div>
      </div>

      {/* 2. Top Stats & Telemetry Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Active Events</div>
            <div className="text-lg font-bold text-white font-mono">
              {livingWorld.activeEvents.length} / {livingWorld.settings.maxConcurrentEvents} max
            </div>
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Sim Time / Mode</div>
            <div className="text-base font-bold text-cyan-300 font-mono">
              {simulatedTime} <span className="text-xs font-normal text-slate-400">({isWeekend ? 'Weekend' : 'Weekday'})</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Total Triggers</div>
            <div className="text-lg font-bold text-purple-300 font-mono">{livingWorld.totalTriggeredCount}</div>
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">PRNG Mode</div>
            <div className="text-sm font-bold text-emerald-300 font-mono">
              {livingWorld.settings.isDeterministic ? 'Mulberry32 (Seeded)' : 'Standard PRNG'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Active Events & Cumulative Drift */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Emergent Events */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Active World Events ({livingWorld.activeEvents.length})
              </h2>
              <span className="text-[11px] font-mono text-slate-400">Auto-expires via simulation clock</span>
            </div>

            {livingWorld.activeEvents.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                <Sparkles className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-400">No active emergent events at this moment.</p>
                <p className="text-xs text-slate-500">
                  Ambient conditions are nominal. Events trigger automatically during simulation or via Sandbox below.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {livingWorld.activeEvents.map((event) => {
                  const catConfig = categoryLabels[event.category] || {
                    label: event.category,
                    icon: Sparkles,
                    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                  };
                  const Icon = catConfig.icon;
                  const progressPct = Math.max(0, Math.min(100, (event.remainingSimSeconds / event.durationSimSeconds) * 100));

                  return (
                    <div
                      key={event.instanceId}
                      className="p-4 rounded-xl bg-slate-900/70 border border-slate-700/60 shadow-lg space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                            <Icon className="w-4 h-4 text-amber-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{event.title}</span>
                              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${catConfig.color}`}>
                                {catConfig.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{event.description}</p>
                          </div>
                        </div>

                        <div className="text-right font-mono text-xs">
                          <span className="text-amber-300 font-bold">{Math.round(event.remainingSimSeconds)}s</span>
                          <span className="text-slate-500"> / {event.durationSimSeconds}s</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      {/* Effects breakdown tags */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                        {event.effects.needsDeltaPerHour?.hungerPerHour && (
                          <span className="px-2 py-0.5 rounded bg-orange-500/15 text-orange-300 border border-orange-500/25">
                            Hunger {event.effects.needsDeltaPerHour.hungerPerHour > 0 ? '+' : ''}{event.effects.needsDeltaPerHour.hungerPerHour}/h
                          </span>
                        )}
                        {event.effects.needsDeltaPerHour?.focusPerHour && (
                          <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                            Focus {event.effects.needsDeltaPerHour.focusPerHour > 0 ? '+' : ''}{event.effects.needsDeltaPerHour.focusPerHour}/h
                          </span>
                        )}
                        {event.effects.attentionDistraction && (
                          <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/25">
                            Distraction +{(event.effects.attentionDistraction * 100).toFixed(0)}%
                          </span>
                        )}
                        {event.effects.ambientLighting && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25">
                            Lighting: {event.effects.ambientLighting}
                          </span>
                        )}
                        {event.effects.ambientCreature && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                            Creature: {event.effects.ambientCreature.name}
                          </span>
                        )}
                        {event.effects.suggestedWaypoint && (
                          <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/25">
                            Waypoint: {event.effects.suggestedWaypoint}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Aggregate Environmental & Needs Modifiers */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Cumulative Living-World Influence
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Hunger Drift Delta</span>
                <span className="text-base font-bold text-orange-300">
                  {effects.needsDeltaPerHour.hungerPerHour > 0 ? '+' : ''}{effects.needsDeltaPerHour.hungerPerHour.toFixed(1)}/h
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Focus Drift Delta</span>
                <span className="text-base font-bold text-cyan-300">
                  {effects.needsDeltaPerHour.focusPerHour > 0 ? '+' : ''}{effects.needsDeltaPerHour.focusPerHour.toFixed(1)}/h
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Distraction Factor</span>
                <span className="text-base font-bold text-rose-300">+{(effects.attentionDistraction * 100).toFixed(0)}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Active Lighting Override</span>
                <span className="text-sm font-bold text-amber-300 capitalize">{effects.ambientLightingOverride || 'Default'}</span>
              </div>
            </div>
          </div>

          {/* Autonomous Decision Arbitration & Cooldown Inspector */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                Autonomous Decision Arbitration (Heuristic Scoring)
              </h2>
              <span className="text-[11px] font-mono text-purple-400">Simulation Abstraction</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <span className="text-xs text-slate-400 block">Selected Behavior</span>
                  <span className="text-base font-bold text-amber-300 capitalize font-mono">
                    {lastDec?.selectedCandidateId || bestEval?.candidateId || activeActivity?.definition.id || 'forage_food_seeking'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Target Location / Zone</span>
                  <span className="text-xs font-mono text-slate-200">{activeActivity?.targetLocation || currentSpot}</span>
                </div>
              </div>

              {/* Score Breakdown Table */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Base Behavioral Score:</span>
                  <span className="text-slate-200">{bestEval?.baseUtility?.toFixed(2) ?? '40.00'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Need Urgency Weight:</span>
                  <span className="text-orange-400">+{bestEval?.needUrgencyBonus?.toFixed(2) ?? '0.00'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Schedule Compatibility:</span>
                  <span className="text-blue-400">
                    {bestEval?.scheduleCompatibility !== undefined ? `${(bestEval.scheduleCompatibility * 100).toFixed(0)}%` : '100%'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>World Event Modifiers:</span>
                  <span className="text-purple-400">+{bestEval?.worldEventBonus?.toFixed(2) ?? '0.00'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Learned MB Odor Valence:</span>
                  <span className="text-emerald-400">+{bestEval?.learnedValenceBonus?.toFixed(2) ?? '0.00'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Hysteresis Cooldown Penalty:</span>
                  <span className="text-rose-400">{bestEval?.cooldownPenalty ? `-${bestEval.cooldownPenalty.toFixed(2)}` : '0.00'}</span>
                </div>
                <div className="flex justify-between font-bold text-white border-t border-slate-800 pt-1.5">
                  <span>Final Decision Score:</span>
                  <span className="text-amber-400">{bestEval?.finalScore?.toFixed(2) ?? '60.00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Category Toggles, Manual Sandbox, and Event History */}
        <div className="space-y-6">
          
          {/* Category Configuration */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Event Categories
            </h2>
            <div className="space-y-2">
              {(Object.keys(categoryLabels) as WorldEventCategory[]).map((cat) => {
                const config = categoryLabels[cat];
                const Icon = config.icon;
                const isEnabled = livingWorld.settings.categoryEnabled[cat] ?? true;

                return (
                  <label
                    key={cat}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-300 font-medium">{config.label}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => setWorldEventCategoryEnabled(cat, e.target.checked)}
                      className="rounded border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0 bg-slate-800"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Interactive Trigger Sandbox */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Manual Trigger Sandbox
            </h2>
            <p className="text-xs text-slate-400">
              Force-trigger emergent events directly to inspect physical reactions and arbitration.
            </p>

            <div className="grid grid-cols-1 gap-2">
              {DEFAULT_WORLD_EVENT_DEFINITIONS.map((def) => (
                <button
                  key={def.id}
                  onClick={() => triggerWorldEvent(def.id)}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800/80 text-left border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between text-xs group"
                >
                  <div className="flex items-center gap-2">
                    <Play className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="text-slate-200 font-medium">{def.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{def.maxDurationSimSeconds}s</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Event History Log */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Recent Event History
            </h2>

            {livingWorld.recentHistory.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No events logged yet in current session.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {livingWorld.recentHistory.slice(-15).map((entry) => (
                  <div
                    key={entry.instanceId}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="text-white font-medium block">{entry.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">{entry.timestamp}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {entry.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
