import React from 'react';
import { 
  MapPin, 
  Calendar, 
  BrainCircuit, 
  Wrench, 
  BarChart3, 
  History, 
  Film, 
  Settings, 
  Eye,
  Globe 
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { ActiveDashboardView } from '../../types';

interface AppHeaderProps {
  onOpenDevPanel: () => void;
  onOpenCognitiveInspector: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenDevPanel,
  onOpenCognitiveInspector,
}) => {
  const activeView = useGameStore((state) => state.activeView);
  const setActiveView = useGameStore((state) => state.setActiveView);
  const isReplayMode = useGameStore((state) => state.isReplayMode);
  const exitReplay = useGameStore((state) => state.exitReplay);
  const simulatedTime = useGameStore((state) => state.simulatedTime);
  const locationName = useGameStore((state) => state.locationName);
  const roomSubLocation = useGameStore((state) => state.roomSubLocation);
  const simulationClock = useGameStore((state) => state.simulationClock);

  const navItems: { id: ActiveDashboardView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'simulation', label: '3D Simulation', icon: Eye },
    { id: 'living_world', label: 'Living World', icon: Globe },
    { id: 'timeline', label: 'Timeline & Events', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'replay', label: 'Replay Studio', icon: Film },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="w-full glass-panel px-4 py-2.5 border-b border-slate-700/60 z-30 pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xl backdrop-blur-xl">
      {/* Brand & Mode */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2.5">
          {/* VishalFly Emblem */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <ellipse cx="12" cy="13" rx="3" ry="4.5" />
              <ellipse cx="7.5" cy="10" rx="3.5" ry="1.8" transform="rotate(-30 7.5 10)" fillOpacity="0.75" />
              <ellipse cx="16.5" cy="10" rx="3.5" ry="1.8" transform="rotate(30 16.5 10)" fillOpacity="0.75" />
              <circle cx="10" cy="8" r="1.2" fill="#dc2626" />
              <circle cx="14" cy="8" r="1.2" fill="#dc2626" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-sans">
                Vishal<span className="text-amber-400">Fly</span>
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/25">
                Milestone 8
              </span>
              {isReplayMode && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/25 text-purple-300 font-bold border border-purple-500/40 animate-pulse">
                  Replay Mode
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 font-sans">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{locationName}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{roomSubLocation}</span>
            </p>
          </div>
        </div>

        {/* Replay Mode Exit Button for Mobile */}
        {isReplayMode && (
          <button
            onClick={exitReplay}
            className="md:hidden px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40"
          >
            Exit Replay
          </button>
        )}
      </div>

      {/* Center: Main View Navigation Switcher */}
      <nav className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/70 border border-slate-800/80 overflow-x-auto max-w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (isReplayMode && item.id !== 'replay') {
                  exitReplay();
                }
                setActiveView(item.id);
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Clock Pill & Inspector Triggers */}
      <div className="flex items-center gap-2">
        {/* Clock & Day Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-200">
            Day {simulationClock.dayNumber}
          </span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-amber-300 font-bold">
            {simulatedTime}
          </span>
          <span className="text-[10px] uppercase font-mono px-1 rounded bg-slate-800 text-slate-400">
            {simulationClock.dayOfWeek.slice(0, 3)}
          </span>
        </div>

        {/* Cognitive Inspector Trigger */}
        <button
          onClick={onOpenCognitiveInspector}
          className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-slate-700/50"
          title="Cognitive Architecture Inspector (F4)"
        >
          <BrainCircuit className="w-4 h-4 text-cyan-400" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
        </button>

        {/* Developer Panel Trigger */}
        <button
          onClick={onOpenDevPanel}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-slate-700/50"
          title="Developer Testing Suite (F3)"
        >
          <Wrench className="w-4 h-4 text-amber-400" />
        </button>

        {/* If in replay mode, prominent exit button */}
        {isReplayMode && (
          <button
            onClick={exitReplay}
            className="hidden md:flex px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all items-center gap-1.5"
          >
            <span>Exit Replay</span>
          </button>
        )}
      </div>
    </header>
  );
};
