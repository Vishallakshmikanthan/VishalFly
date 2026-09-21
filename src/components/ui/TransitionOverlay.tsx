import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { LOCATIONS } from '../../navigation/locationGraph';

export const TransitionOverlay: React.FC = () => {
  const transitionState = useGameStore((state) => state.transitionState);
  const targetConfig = transitionState.targetLocation ? LOCATIONS[transitionState.targetLocation] : null;

  return (
    <AnimatePresence>
      {transitionState.isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-[#07090ec8] backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.05, y: -10, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="glass-panel px-8 py-6 rounded-2xl flex flex-col items-center gap-4 max-w-sm text-center border border-amber-500/30 amber-glow shadow-2xl"
          >
            {/* Animated Location Compass Icon */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
                <Compass className="w-8 h-8 text-slate-950 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
              <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-semibold">
                Traveling to Destination
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight mt-1 font-sans">
                {targetConfig?.name || 'New Location'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {targetConfig?.subLocation || 'Sairam Campus'}
              </p>
            </div>

            {/* Destination schedule preview tag */}
            {targetConfig && (
              <div className="glass-pill px-3.5 py-1 rounded-full text-[11px] text-amber-200 font-mono">
                {targetConfig.initialTime} • {targetConfig.timeLabel}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
