import React, { useState } from 'react';
import { 
  Calendar, 
  BrainCircuit, 
  Wrench, 
  BarChart3, 
  History, 
  Settings, 
  Box,
  Globe,
  Sun,
  CloudRain,
  ChevronDown
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { ActiveDashboardView, LocationId } from '../../types';
import { LOCATIONS } from '../../navigation/locationGraph';

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
  const currentLocation = useGameStore((state) => state.currentLocation);
  const switchLocation = useGameStore((state) => state.switchLocation);
  const simulationClock = useGameStore((state) => state.simulationClock);
  const cycleLightingPreset = useGameStore((state) => state.cycleLightingPreset);
  const weather = useGameStore((state) => state.weather);
  const cycleWeather = useGameStore((state) => state.cycleWeather);

  const [showLocationMenu, setShowLocationMenu] = useState(false);

  const navItems: { id: ActiveDashboardView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'simulation', label: '3D Simulation', icon: Box },
    { id: 'living_world', label: 'Living World', icon: Globe },
    { id: 'timeline', label: 'Timeline & Events', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="w-full glass-panel px-4 py-2 border-b border-slate-800/80 z-30 pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xl backdrop-blur-xl">
      {/* Brand & Location Dropdown */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2.5">
          {/* VishalFly Emblem */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <ellipse cx="12" cy="13" rx="3" ry="4.5" />
              <ellipse cx="7.5" cy="10" rx="3.5" ry="1.8" transform="rotate(-30 7.5 10)" fillOpacity="0.75" />
              <ellipse cx="16.5" cy="10" rx="3.5" ry="1.8" transform="rotate(30 16.5 10)" fillOpacity="0.75" />
              <circle cx="10" cy="8" r="1.2" fill="#dc2626" />
              <circle cx="14" cy="8" r="1.2" fill="#dc2626" />
            </svg>
          </div>

          <span className="font-extrabold text-base tracking-tight text-white font-sans">
            Vishal<span className="text-amber-400">Fly</span>
          </span>

          {/* Location Selector Pill (matching reference image) */}
          <div className="relative">
            <button
              onClick={() => setShowLocationMenu(!showLocationMenu)}
              className="px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-amber-500/40 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span>{LOCATIONS[currentLocation]?.name || 'Metropolitan City'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLocationMenu && (
              <div className="absolute top-full left-0 mt-1.5 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1 z-50 flex flex-col gap-0.5">
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
                    </button>
                  );
                })}
              </div>
            )}
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
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Clock Pill & Weather Icon Toggle */}
      <div className="flex items-center gap-2">
        {/* Clock & Day Pill (Matching Reference Image: Day 1  07:49  MON) */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-200">
            Day {simulationClock.dayNumber}
          </span>
          <span className="font-mono text-amber-300 font-bold">
            {simulatedTime}
          </span>
          <span className="text-[10px] uppercase font-mono px-1 rounded bg-slate-800 text-slate-400">
            {simulationClock.dayOfWeek.slice(0, 3)}
          </span>
        </div>

        {/* Day / Night Time Toggle (Sun Icon) */}
        <button
          onClick={cycleLightingPreset}
          className="p-2 rounded-xl text-amber-300 bg-slate-900/70 hover:bg-slate-800 border border-slate-800 transition-all shadow-sm"
          title="Cycle Day/Night/Twilight Time of Day"
        >
          <Sun className="w-4 h-4 text-amber-400" />
        </button>

        {/* Dynamic Weather Toggle (CloudRain Icon) */}
        <button
          onClick={cycleWeather}
          className={`p-2 rounded-xl border transition-all shadow-sm ${
            weather !== 'clear'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              : 'text-slate-300 bg-slate-900/70 hover:bg-slate-800 border-slate-800'
          }`}
          title={`Cycle Weather (Current: ${weather})`}
        >
          <CloudRain className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Cognitive Architecture Inspector */}
        <button
          onClick={onOpenCognitiveInspector}
          className="p-2 rounded-xl text-cyan-400 bg-slate-900/70 hover:bg-slate-800 border border-slate-800 transition-all shadow-sm"
          title="Cognitive Connectome Inspector (F4)"
        >
          <BrainCircuit className="w-4 h-4" />
        </button>

        {/* Dev Panel */}
        <button
          onClick={onOpenDevPanel}
          className="p-2 rounded-xl text-slate-300 bg-slate-900/70 hover:bg-slate-800 border border-slate-800 transition-all shadow-sm"
          title="Developer Testing Suite (F3)"
        >
          <Wrench className="w-4 h-4 text-amber-400" />
        </button>
      </div>
    </header>
  );
};
