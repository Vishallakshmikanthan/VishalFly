import React from 'react';
import { RotateCcw, Target, Sun, RefreshCw } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const ViewControls: React.FC = () => {
  const triggerResetCamera = useGameStore((state) => state.triggerResetCamera);
  const followFly = useGameStore((state) => state.followFly);
  const toggleFollowFly = useGameStore((state) => state.toggleFollowFly);
  const lightingPreset = useGameStore((state) => state.lightingPreset);
  const cycleLightingPreset = useGameStore((state) => state.cycleLightingPreset);
  const resetFlyToCenter = useGameStore((state) => state.resetFlyToCenter);

  const presetLabels: Record<string, string> = {
    dawn: 'Dawn 06:00',
    afternoon: 'Afternoon',
    warm_night: 'Night Study',
  };

  return (
    <div className="absolute bottom-5 right-5 z-10 pointer-events-auto flex items-center gap-2">
      {/* Lighting preset cycle button */}
      <button
        onClick={cycleLightingPreset}
        className="glass-panel px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-amber-500/40 transition-all shadow-lg active:scale-95"
        title="Cycle room lighting mode"
      >
        <Sun className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline font-mono">{presetLabels[lightingPreset]}</span>
      </button>

      {/* Follow fly camera toggle */}
      <button
        onClick={toggleFollowFly}
        className={`glass-panel px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all shadow-lg active:scale-95 ${
          followFly
            ? 'border-amber-500/80 bg-amber-500/20 text-amber-300 amber-glow-sm'
            : 'text-slate-300 hover:text-white hover:border-slate-600'
        }`}
        title="Follow fruit fly with camera"
      >
        <Target className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Follow Fly</span>
      </button>

      {/* Reset fly position */}
      <button
        onClick={resetFlyToCenter}
        className="glass-panel p-2.5 rounded-xl text-slate-300 hover:text-white hover:border-slate-600 transition-all shadow-lg active:scale-95"
        title="Recenter fly to room middle"
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>

      {/* Reset camera button */}
      <button
        onClick={triggerResetCamera}
        className="glass-panel px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-amber-300 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/60 transition-all shadow-lg active:scale-95"
        title="Reset camera to isometric view"
      >
        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
        <span>Reset View</span>
      </button>
    </div>
  );
};
