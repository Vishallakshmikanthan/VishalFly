import React from 'react';
import { Play, Pause, RotateCcw, Bot, User } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { SimulationSpeed } from '../../types';

export const SimulationControls: React.FC = () => {
  const simulationClock = useGameStore((state) => state.simulationClock);
  const isAutonomous = useGameStore((state) => state.isAutonomous);
  const togglePauseSimulation = useGameStore((state) => state.togglePauseSimulation);
  const setSimulationSpeed = useGameStore((state) => state.setSimulationSpeed);
  const restartSimulationDay = useGameStore((state) => state.restartSimulationDay);
  const toggleAutonomousMode = useGameStore((state) => state.toggleAutonomousMode);

  const speeds: SimulationSpeed[] = [1, 2, 4, 8];

  return (
    <div className="glass-panel p-1.5 rounded-2xl flex items-center gap-1 pointer-events-auto shadow-xl">
      {/* Autonomous / Manual Mode Toggle */}
      <button
        onClick={toggleAutonomousMode}
        className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all ${
          isAutonomous
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
            : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:text-white'
        }`}
        title={isAutonomous ? 'Autonomous Life Simulation Active' : 'Manual Flight Mode Active'}
      >
        {isAutonomous ? <Bot className="w-3.5 h-3.5 text-emerald-400" /> : <User className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline font-mono">{isAutonomous ? 'Autonomous' : 'Manual'}</span>
      </button>

      <div className="w-px h-5 bg-slate-700/60 mx-0.5" />

      {/* Pause / Resume Button */}
      <button
        onClick={togglePauseSimulation}
        className={`p-1.5 rounded-xl transition-all ${
          simulationClock.isPaused
            ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
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
      <div className="flex items-center gap-0.5">
        {speeds.map((s) => {
          const isActive = simulationClock.speed === s;
          return (
            <button
              key={s}
              onClick={() => setSimulationSpeed(s)}
              className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold transition-all ${
                isActive
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
              title={`Run simulation at ${s}x speed`}
            >
              {s}x
            </button>
          );
        })}
      </div>

      <div className="w-px h-5 bg-slate-700/60 mx-0.5" />

      {/* Restart Day Button */}
      <button
        onClick={restartSimulationDay}
        className="p-1.5 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 transition-all"
        title="Restart Current Day (06:00)"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
