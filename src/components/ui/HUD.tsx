import { Compass, Sparkles, Brain } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { NeedsMeters } from './NeedsMeters';
import { ActivityInspector } from './ActivityInspector';

interface HUDProps {
  isDevOpen?: boolean;
  setIsDevOpen?: (open: boolean) => void;
  isCognitiveOpen?: boolean;
  setIsCognitiveOpen?: (open: boolean) => void;
  isLogOpen?: boolean;
  setIsLogOpen?: (open: boolean) => void;
}

export const HUD: React.FC<HUDProps> = () => {
  const currentSpot = useGameStore((state) => state.currentSpot);
  const selectedCollegeBehavior = useGameStore((state) => state.selectedCollegeBehavior);
  const controllerMode = useGameStore((state) => state.controllerMode);
  const connectomeSnapshot = useGameStore((state) => state.connectomeSnapshot);
  const isEscapeActive = connectomeSnapshot?.motorOutputs?.dnEscapeSpike || (connectomeSnapshot?.motorOutputs?.dnEscapeRate ?? 0) > 18.0;

  return (
    <div className="w-full h-full pointer-events-none relative">
      {/* Floating Top Left: Zone Badge & Needs Meters */}
      <div className="absolute top-4 left-4 md:left-6 flex flex-col gap-2.5 z-10">
        {/* Zone Badge & Brain Mode */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          <div className="glass-pill px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs text-slate-300">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Zone:</span>
            <span className="text-amber-200 font-medium">{currentSpot}</span>
          </div>

          {/* Biological Connectome Indicator */}
          {controllerMode === 'connectome' ? (
            <div className={`glass-pill px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs border transition-all ${
              isEscapeActive 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse' 
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              <Brain className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono font-semibold">
                {isEscapeActive ? 'GF Escape Take-Off' : 'Connectome Brain (LIF)'}
              </span>
            </div>
          ) : (
            <div className="glass-pill px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs text-slate-400 border border-slate-700/60 font-mono">
              <span className="capitalize">{controllerMode} Mode</span>
            </div>
          )}

          {selectedCollegeBehavior && (
            <div className="glass-pill px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs text-purple-300 border border-purple-500/30">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="capitalize font-medium">{selectedCollegeBehavior}</span>
            </div>
          )}
        </div>

        {/* Needs Meters */}
        <div className="pointer-events-auto">
          <NeedsMeters />
        </div>
      </div>

      {/* Floating Top Right: Activity Inspector Panel */}
      <div className="absolute top-4 right-4 md:right-6 pointer-events-auto z-10">
        <ActivityInspector />
      </div>
    </div>
  );
};
