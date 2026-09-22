import React, { useState } from 'react';
import { 
  Settings, 
  Sparkles, 
  BrainCircuit, 
  Save, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Sun 
} from 'lucide-react';
import { useGameStore, simulationEngine } from '../../store/useGameStore';
import { COLLEGE_BEHAVIOR_WEIGHTS } from '../../simulation/config/defaults';
import { CollegeSubBehavior, SimulationSpeed, LightingPreset } from '../../types';

export const SettingsView: React.FC = () => {
  const simulationSettings = useGameStore((state) => state.simulationSettings);
  const updateSimulationSettings = useGameStore((state) => state.updateSimulationSettings);
  const resetSimulationSettings = useGameStore((state) => state.resetSimulationSettings);

  const isCognitionEnabled = useGameStore((state) => state.isCognitionEnabled);
  const toggleCognition = useGameStore((state) => state.toggleCognition);
  const setMemoryInfluenceEnabled = useGameStore((state) => state.setMemoryInfluenceEnabled);
  const setAdaptationEnabled = useGameStore((state) => state.setAdaptationEnabled);
  const clearCognitiveMemory = useGameStore((state) => state.clearCognitiveMemory);
  const resetAdaptationDefaults = useGameStore((state) => state.resetAdaptationDefaults);

  const lightingPreset = useGameStore((state) => state.lightingPreset);
  const setLightingPreset = useGameStore((state) => state.setLightingPreset);

  // Local state for college weights
  const [weights, setWeights] = useState<Record<CollegeSubBehavior, number>>({
    lecture: COLLEGE_BEHAVIOR_WEIGHTS.lecture,
    dozing: COLLEGE_BEHAVIOR_WEIGHTS.dozing,
    laptop: COLLEGE_BEHAVIOR_WEIGHTS.laptop,
    reels: COLLEGE_BEHAVIOR_WEIGHTS.reels,
    mobile_game: COLLEGE_BEHAVIOR_WEIGHTS.mobile_game,
  });

  const [activeSpeed, setActiveSpeed] = useState<SimulationSpeed>(
    (simulationSettings.simulatedSecondsPerRealSecond === 120 ? 2 : simulationSettings.simulatedSecondsPerRealSecond === 240 ? 4 : simulationSettings.simulatedSecondsPerRealSecond === 480 ? 8 : 1) as SimulationSpeed
  );

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  // Compute total weight
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const isValidWeight = totalWeight > 0;

  const handleWeightChange = (key: CollegeSubBehavior, val: number) => {
    setWeights((prev) => ({ ...prev, [key]: Math.max(0, val) }));
  };

  const handleSaveSettings = () => {
    if (!isValidWeight) return;

    // Apply weights to simulation engine's behavior selector
    simulationEngine.behaviorSelector.setWeights(weights);

    // Update settings in store
    updateSimulationSettings({
      simulatedSecondsPerRealSecond: activeSpeed * 60,
    });

    setSaveBanner('Settings saved and applied successfully!');
    setTimeout(() => setSaveBanner(null), 3000);
  };

  const handleResetToDefaults = () => {
    setWeights({ ...COLLEGE_BEHAVIOR_WEIGHTS });
    simulationEngine.behaviorSelector.setWeights(COLLEGE_BEHAVIOR_WEIGHTS);
    setActiveSpeed(1);
    setLightingPreset('dawn');
    resetSimulationSettings();
    resetAdaptationDefaults();
    setShowResetConfirm(false);

    setSaveBanner('Configuration restored to factory defaults.');
    setTimeout(() => setSaveBanner(null), 3000);
  };

  return (
    <div className="w-full h-full max-w-5xl mx-auto p-4 md:p-6 flex flex-col gap-5 text-slate-100 overflow-y-auto pointer-events-auto">
      {/* Top Header */}
      <div className="glass-panel p-4 md:p-5 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Simulation Settings & Configuration</h1>
            <p className="text-xs text-slate-400">
              Tune simulation probabilities, cognitive architecture toggles, and environment defaults
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveSettings}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save & Apply</span>
          </button>
        </div>
      </div>

      {/* Save Notification Banner */}
      {saveBanner && (
        <div className="glass-panel p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* Section 1: College Variation Probabilities */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">College Lecture Behavior Weights</h2>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Total Weight: <strong className={isValidWeight ? 'text-amber-300' : 'text-rose-400'}>{totalWeight}</strong>
            {!isValidWeight && <span className="text-rose-400 ml-1.5 font-sans">(At least one weight must be &gt; 0)</span>}
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Configure the probabilistic likelihood for each student behavior during classroom hours. The simulation normalizes weights dynamically during selection.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { id: 'lecture' as CollegeSubBehavior, label: 'Lecture Attention', desc: 'Front row attentive note taking' },
            { id: 'dozing' as CollegeSubBehavior, label: 'Dozing Off', desc: 'Sleepy head nodding' },
            { id: 'laptop' as CollegeSubBehavior, label: 'Laptop Hack', desc: 'Coding on laptop' },
            { id: 'reels' as CollegeSubBehavior, label: 'Reels / Shorts', desc: 'Browsing phone feeds' },
            { id: 'mobile_game' as CollegeSubBehavior, label: 'Mobile Gaming', desc: 'Tapping gaming screen' },
          ].map((item) => {
            const val = weights[item.id];
            const percent = totalWeight > 0 ? Math.round((val / totalWeight) * 100) : 0;
            return (
              <div key={item.id} className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">{item.label}</span>
                  <span className="font-mono text-amber-300 font-bold">{percent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={val}
                  onChange={(e) => handleWeightChange(item.id, parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
                />
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>Weight: {val}</span>
                  <span className="text-slate-500 truncate max-w-[100px]">{item.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Cognitive Architecture Controls */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <BrainCircuit className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Cognitive Architecture Subsystems (M6/M7)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Toggle 1: Master Cognition */}
          <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between gap-2.5">
            <div>
              <span className="font-bold text-white block mb-1">Cognitive Engine</span>
              <p className="text-[11px] text-slate-400">
                Multi-candidate utility evaluation and connectome appraisal. When disabled, uses deterministic rule scheduler.
              </p>
            </div>
            <button
              onClick={toggleCognition}
              className={`w-full py-2 rounded-lg font-semibold transition-all ${
                isCognitionEnabled
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {isCognitionEnabled ? 'Enabled (Active)' : 'Disabled'}
            </button>
          </div>

          {/* Toggle 2: Episodic Memory */}
          <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between gap-2.5">
            <div>
              <span className="font-bold text-white block mb-1">Episodic Memory Influence</span>
              <p className="text-[11px] text-slate-400">
                Allows past experience outcomes (completed vs interrupted) to bias candidate utility scores.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMemoryInfluenceEnabled(true)}
                className="flex-1 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold"
              >
                Enable
              </button>
              <button
                onClick={clearCognitiveMemory}
                className="px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold"
                title="Wipe episodic memories"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Toggle 3: Adaptation */}
          <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between gap-2.5">
            <div>
              <span className="font-bold text-white block mb-1">Behavioral Adaptation</span>
              <p className="text-[11px] text-slate-400">
                Reinforces successful actions and penalizes repeated failures dynamically over time.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdaptationEnabled(true)}
                className="flex-1 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-semibold"
              >
                Enable
              </button>
              <button
                onClick={resetAdaptationDefaults}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Visual & Lighting Defaults */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Sun className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white">Environment & Visual Preferences</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            { id: 'dawn' as LightingPreset, label: 'Dawn 06:00', desc: 'Soft golden morning sun rays' },
            { id: 'afternoon' as LightingPreset, label: 'Afternoon 14:00', desc: 'Bright daylight natural balance' },
            { id: 'warm_night' as LightingPreset, label: 'Night Study 22:00', desc: 'Warm PG study lamp ambience' },
          ].map((preset) => {
            const isSelected = lightingPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setLightingPreset(preset.id)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/50 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="font-bold text-sm text-white">{preset.label}</span>
                <span className="text-[11px] text-slate-400">{preset.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="glass-panel p-5 rounded-2xl border border-rose-500/40 shadow-2xl max-w-sm flex flex-col gap-3 text-xs">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Restore Factory Defaults?</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              This will reset all college behavior weights, simulation speed defaults, and lighting presets back to factory defaults.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleResetToDefaults}
                className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
