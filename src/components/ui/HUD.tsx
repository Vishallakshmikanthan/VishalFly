import React from 'react';
import { Compass, Sparkles } from 'lucide-react';
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

  return (
    <div className="w-full h-full pointer-events-none relative">
      {/* Floating Top Left: Zone Badge & Needs Meters */}
      <div className="absolute top-4 left-4 md:left-6 flex flex-col gap-2.5 z-10">
        {/* Zone Badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="glass-pill px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs text-slate-300">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Zone:</span>
            <span className="text-amber-200 font-medium">{currentSpot}</span>
          </div>

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
