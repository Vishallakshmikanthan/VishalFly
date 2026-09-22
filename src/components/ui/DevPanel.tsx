import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  X, 
  Play, 
  RotateCcw, 
  Save, 
  Download, 
  Clock, 
  MapPin, 
  Dumbbell, 
  Utensils, 
  PhoneCall, 
  PackageCheck,
  Zap,
  BrainCircuit,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { LocationId, NeedType } from '../../types';

interface DevPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevPanel: React.FC<DevPanelProps> = ({ isOpen, onClose }) => {
  const simulationClock = useGameStore((state) => state.simulationClock);
  const needs = useGameStore((state) => state.needs);
  const setTime = useGameStore((state) => state.setTime);
  const setDay = useGameStore((state) => state.setDay);
  const switchLocation = useGameStore((state) => state.switchLocation);
  const triggerWorkout = useGameStore((state) => state.triggerWorkout);
  const triggerMeal = useGameStore((state) => state.triggerMeal);
  const triggerFamilyCall = useGameStore((state) => state.triggerFamilyCall);
  const triggerFoodOrder = useGameStore((state) => state.triggerFoodOrder);
  const triggerActivity = useGameStore((state) => state.triggerActivity);
  const setNeedValue = useGameStore((state) => state.setNeedValue);
  const isCognitionEnabled = useGameStore((state) => state.isCognitionEnabled);
  const toggleCognition = useGameStore((state) => state.toggleCognition);
  const cognitiveData = useGameStore((state) => state.cognitiveInspectorData);
  const saveSimulation = useGameStore((state) => state.saveSimulation);
  const loadSimulation = useGameStore((state) => state.loadSimulation);
  const resetSimulation = useGameStore((state) => state.resetSimulation);

  const [customTime, setCustomTime] = useState(simulationClock.simulatedTime);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    setCustomTime(simulationClock.simulatedTime);
  }, [simulationClock.simulatedTime]);

  if (!isOpen) return null;

  const handleSave = () => {
    const ok = saveSimulation();
    setSaveStatus(ok ? 'Saved to localStorage!' : 'Failed to save');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleLoad = () => {
    const ok = loadSimulation();
    setSaveStatus(ok ? 'Loaded from localStorage!' : 'No save found');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md pointer-events-auto">
      <div className="glass-panel w-full max-w-2xl max-h-[85vh] rounded-2xl border border-amber-500/40 shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-700/60 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Simulation Developer Panel
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                  F3 Shortcut
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Deterministic override & testing suite for Milestone 4 life systems
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 flex flex-col gap-5 overflow-y-auto max-h-[calc(85vh-70px)] text-xs">
          {/* Status Message */}
          {saveStatus && (
            <div className="px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium text-center">
              {saveStatus}
            </div>
          )}

          {/* Section 1: Time & Day Jumps */}
          <div className="flex flex-col gap-2.5">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Clock & Schedule Jumps
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: '06:00 (Wake Routine)', time: '06:00' },
                { label: '08:00 (College)', time: '08:00' },
                { label: '17:00 (Gym Workout)', time: '17:00' },
                { label: '18:45 (Dinner Meal)', time: '18:45' },
                { label: '19:15 (Family Call)', time: '19:15' },
                { label: '20:00 (Project Work)', time: '20:00' },
                { label: '22:45 (Assignments)', time: '22:45' },
                { label: '23:30 (Midnight Food)', time: '23:30' },
              ].map((jump, idx) => (
                <button
                  key={idx}
                  onClick={() => setTime(jump.time)}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-200 border border-slate-700/60 transition-all text-left font-mono text-[11px]"
                >
                  <span className="font-bold block text-white">{jump.time}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{jump.label}</span>
                </button>
              ))}
            </div>

            {/* Custom Time & Day Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                placeholder="HH:MM"
                className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-white font-mono text-xs w-28 text-center"
              />
              <button
                onClick={() => setTime(customTime)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
              >
                Set Time
              </button>
              <div className="h-4 w-px bg-slate-700 mx-1" />
              <button
                onClick={() => setDay(simulationClock.dayNumber, 'Monday')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono ${simulationClock.dayType === 'weekday' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'}`}
              >
                Weekday Schedule
              </button>
              <button
                onClick={() => setDay(simulationClock.dayNumber, 'Saturday')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono ${simulationClock.dayType === 'weekend' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'}`}
              >
                Weekend Schedule
              </button>
            </div>
          </div>

          {/* Section 2: Direct Activity Triggers */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-700/50">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-amber-400" />
              Direct Activity Triggers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-medium">
              <button
                onClick={() => triggerWorkout('push')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 flex items-center gap-2"
              >
                <Dumbbell className="w-4 h-4 text-amber-400" />
                <span>Trigger Push Workout</span>
              </button>
              <button
                onClick={() => triggerWorkout('pull')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 flex items-center gap-2"
              >
                <Dumbbell className="w-4 h-4 text-amber-400" />
                <span>Trigger Pull Workout</span>
              </button>
              <button
                onClick={() => triggerWorkout('legs')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 flex items-center gap-2"
              >
                <Dumbbell className="w-4 h-4 text-amber-400" />
                <span>Trigger Legs Workout</span>
              </button>
              <button
                onClick={() => triggerMeal('dinner')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 flex items-center gap-2"
              >
                <Utensils className="w-4 h-4 text-emerald-400" />
                <span>Trigger Dinner Meal</span>
              </button>
              <button
                onClick={() => triggerFamilyCall()}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-cyan-400" />
                <span>Trigger Family Call</span>
              </button>
              <button
                onClick={() => triggerFoodOrder()}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-purple-300 flex items-center gap-2"
              >
                <PackageCheck className="w-4 h-4 text-purple-400" />
                <span>Midnight Food Order</span>
              </button>
              <button
                onClick={() => triggerActivity('project_work', 'bedroom')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
              >
                Trigger Project Work
              </button>
              <button
                onClick={() => triggerActivity('laundry', 'bedroom')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
              >
                Trigger Laundry
              </button>
              <button
                onClick={() => triggerActivity('dry_clothes', 'balcony')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
              >
                Trigger Balcony Drying
              </button>
            </div>
          </div>

          {/* Section 3: Teleport Locations */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-700/50">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Teleport Location
            </h3>
            <div className="flex flex-wrap gap-2">
              {(['bedroom', 'classroom', 'dining', 'gym', 'grounds', 'balcony', 'travel'] as LocationId[]).map((loc) => (
                <button
                  key={loc}
                  onClick={() => switchLocation(loc, `Developer Teleport to ${loc}`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700 capitalize font-mono text-xs"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Needs Modifiers */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-700/50">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Modify Needs Meters
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.keys(needs) as NeedType[]).filter(k => typeof needs[k] === 'number').map((needKey) => (
                <div key={needKey} className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[11px] font-mono capitalize text-slate-300">
                    <span>{needKey.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-amber-300 font-bold">{Math.round(needs[needKey])}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={needs[needKey]}
                    onChange={(e) => setNeedValue(needKey, Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Connectome Cognitive Architecture */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                Connectome Cognitive Architecture (Milestone 6)
              </h3>
              <button
                onClick={toggleCognition}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all border ${
                  isCognitionEnabled 
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isCognitionEnabled ? (
                  <>
                    <ToggleRight className="w-4 h-4 text-cyan-400" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 text-slate-400" />
                    <span>Bypassed</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/60 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Current Goal:</span>
                <span className="text-white font-medium">{cognitiveData?.currentGoal || 'Autonomous'}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Selected Action:</span>
                <span className="text-cyan-300 font-mono font-bold">
                  {cognitiveData?.lastDecision?.selectedCandidateName || 'None'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Memory Records:</span>
                <span className="text-slate-300 font-mono">{cognitiveData?.recentMemory?.length ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Section 5: Persistence & Reset */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow"
              >
                <Save className="w-4 h-4" />
                Save State
              </button>
              <button
                onClick={handleLoad}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Load Saved State
              </button>
            </div>

            <button
              onClick={resetSimulation}
              className="px-3 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 font-semibold flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
