import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Bot, 
  User, 
  Target, 
  Camera, 
  MapPin, 
  Activity, 
  AlertTriangle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { SimulationSpeed, LocationId } from '../../types';
import { LOCATIONS } from '../../navigation/locationGraph';

export const SimulationControlBar: React.FC = () => {
  const simulationClock = useGameStore((state) => state.simulationClock);
  const isAutonomous = useGameStore((state) => state.isAutonomous);
  const togglePauseSimulation = useGameStore((state) => state.togglePauseSimulation);
  const setSimulationSpeed = useGameStore((state) => state.setSimulationSpeed);
  const restartSimulationDay = useGameStore((state) => state.restartSimulationDay);
  const toggleAutonomousMode = useGameStore((state) => state.toggleAutonomousMode);
  const triggerResetCamera = useGameStore((state) => state.triggerResetCamera);
  const followFly = useGameStore((state) => state.followFly);
  const toggleFollowFly = useGameStore((state) => state.toggleFollowFly);
  const currentLocation = useGameStore((state) => state.currentLocation);
  const switchLocation = useGameStore((state) => state.switchLocation);
  const currentActivity = useGameStore((state) => state.currentActivity);
  const isReplayMode = useGameStore((state) => state.isReplayMode);

  const [showConfirmRestart, setShowConfirmRestart] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);

  const speeds: SimulationSpeed[] = [1, 2, 4, 8];
  const currentLocConfig = LOCATIONS[currentLocation] || LOCATIONS.bedroom;

  const handleRestart = () => {
    restartSimulationDay();
    setShowConfirmRestart(false);
  };

  return (
    <div className="w-full glass-panel px-4 py-2 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xl border border-slate-700/60 pointer-events-auto backdrop-blur-xl">
      {/* Group 1: Autonomous Mode & State Badges */}
      <div className="flex items-center gap-2">
        {/* Autonomous / Manual Flight Toggle */}
        <button
          onClick={toggleAutonomousMode}
          disabled={isReplayMode}
          className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all ${
            isReplayMode
              ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500'
              : isAutonomous
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:text-white'
          }`}
          title={isAutonomous ? 'Autonomous Life Simulation Active' : 'Manual Flight Mode Active'}
        >
          {isAutonomous ? <Bot className="w-3.5 h-3.5 text-emerald-400" /> : <User className="w-3.5 h-3.5" />}
          <span className="font-mono">{isAutonomous ? 'Autonomous' : 'Manual'}</span>
        </button>

        {/* Location Dropdown / Badge */}
        <div className="relative">
          <button
            onClick={() => setShowLocationMenu(!showLocationMenu)}
            disabled={isReplayMode}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 text-slate-300 border border-slate-700/60 flex items-center gap-1.5 text-xs font-medium transition-all"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-white">{currentLocConfig.name}</span>
            {showLocationMenu ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showLocationMenu && !isReplayMode && (
            <div className="absolute bottom-full left-0 mb-2 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1 z-50 flex flex-col gap-0.5">
              {Object.keys(LOCATIONS).map((locKey) => {
                const loc = LOCATIONS[locKey as LocationId];
                const isSelected = currentLocation === locKey;
                return (
                  <button
                    key={locKey}
                    onClick={() => {
                      switchLocation(locKey as LocationId);
                      setShowLocationMenu(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{loc.name}</span>
                    <span className="text-[10px] text-slate-500">{loc.timeLabel}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Current Activity Pill */}
        {currentActivity && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 font-medium">
            <Activity className="w-3 h-3 text-amber-400" />
            <span className="truncate max-w-[140px]">{currentActivity.scheduleEntry.name}</span>
            {currentActivity.progressPercent !== undefined && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 font-bold">
                {currentActivity.progressPercent}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Group 2: Simulation Clock Controls (Play, Pause, Speed) */}
      <div className="flex items-center gap-1.5">
        {/* Pause / Resume Button */}
        <button
          onClick={togglePauseSimulation}
          disabled={isReplayMode}
          className={`p-2 rounded-xl transition-all ${
            isReplayMode
              ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
              : simulationClock.isPaused
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
              : 'bg-slate-800/80 text-slate-200 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
          }`}
          title={simulationClock.isPaused ? 'Resume Simulation' : 'Pause Simulation'}
        >
          {simulationClock.isPaused ? (
            <Play className="w-4 h-4 fill-current" />
          ) : (
            <Pause className="w-4 h-4 fill-current" />
          )}
        </button>

        {/* Speed Multipliers */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-900/80 border border-slate-800">
          {speeds.map((s) => {
            const isActive = simulationClock.speed === s;
            return (
              <button
                key={s}
                onClick={() => setSimulationSpeed(s)}
                disabled={isReplayMode}
                className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold transition-all ${
                  isReplayMode
                    ? 'text-slate-600 cursor-not-allowed'
                    : isActive
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
                title={`Run simulation at ${s}x speed`}
              >
                {s}x
              </button>
            );
          })}
        </div>

        {/* Restart Day Button with Confirmation */}
        <div className="relative">
          <button
            onClick={() => setShowConfirmRestart(true)}
            disabled={isReplayMode}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 border border-slate-700/60 transition-all"
            title="Restart Day (06:00)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {showConfirmRestart && (
            <div className="absolute bottom-full right-0 mb-2 w-60 p-3 rounded-xl bg-slate-900 border border-rose-500/40 shadow-2xl z-50 text-xs flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Restart Day 1?</span>
              </div>
              <p className="text-[11px] text-slate-300">
                This will reset the clock to 06:00 and restart today's routines.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
                <button
                  onClick={() => setShowConfirmRestart(false)}
                  className="px-2 py-1 rounded text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestart}
                  className="px-2.5 py-1 rounded bg-rose-500 text-slate-950 font-bold hover:bg-rose-600"
                >
                  Confirm Restart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Group 3: Camera & View Helper Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Follow Fly Camera Toggle */}
        <button
          onClick={toggleFollowFly}
          className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all border ${
            followFly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
          }`}
          title="Toggle camera following fly position"
        >
          <Target className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Follow Fly</span>
        </button>

        {/* Reset Camera to Isometric View ('R') */}
        <button
          onClick={triggerResetCamera}
          className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition-all"
          title="Reset Camera (Press 'R')"
        >
          <Camera className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">Reset Camera</span>
        </button>
      </div>
    </div>
  );
};
