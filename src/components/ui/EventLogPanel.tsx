import React, { useState } from 'react';
import { ScrollText, X, Activity, Navigation, Sparkles, AlertTriangle, Info, Calendar } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { SimulationEventCategory } from '../../types';

interface EventLogPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventLogPanel: React.FC<EventLogPanelProps> = ({ isOpen, onClose }) => {
  const recentEvents = useGameStore((state) => state.recentEvents);
  const [filter, setFilter] = useState<string>('all');

  if (!isOpen) return null;

  const categoryIcons: Record<SimulationEventCategory, React.ReactNode> = {
    activity: <Activity className="w-3.5 h-3.5 text-amber-400" />,
    travel: <Navigation className="w-3.5 h-3.5 text-cyan-400" />,
    behavior: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
    need: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
    system: <Info className="w-3.5 h-3.5 text-slate-400" />,
    lifecycle: <Calendar className="w-3.5 h-3.5 text-emerald-400" />,
  };

  const filtered = filter === 'all'
    ? recentEvents
    : recentEvents.filter((e) => e.category === filter);

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 glass-panel z-50 flex flex-col pointer-events-auto border-l border-slate-700/70 shadow-2xl bg-[#080a0f]/90 backdrop-blur-xl animate-in slide-in-from-right duration-200">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">Simulation Event Log</h2>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/20">
            {recentEvents.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-2 border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto text-[11px] font-medium text-slate-400 scrollbar-none">
        {['all', 'activity', 'travel', 'behavior', 'need', 'lifecycle'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-all ${
              filter === cat
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500 font-mono">
            No events recorded yet.
          </div>
        ) : (
          filtered.map((event) => (
            <div
              key={event.id}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col gap-1"
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                  {categoryIcons[event.category]}
                  <span className="uppercase tracking-wider font-mono text-[9px] text-slate-400">
                    {event.category}
                  </span>
                </span>
                <span className="font-mono text-slate-500">
                  {event.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-snug pl-5 font-sans">
                {event.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
