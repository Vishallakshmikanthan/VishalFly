import React, { useEffect } from 'react';
import { Home, GraduationCap, UtensilsCrossed, Dumbbell, Trees, Sun, LucideIcon } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { LocationId } from '../../types';

interface LocationButton {
  id: LocationId;
  label: string;
  sublabel: string;
  icon: LucideIcon;
  keyNum: string;
}

const buttons: LocationButton[] = [
  {
    id: 'bedroom',
    label: 'PG Room',
    sublabel: 'Room 204',
    icon: Home,
    keyNum: '1',
  },
  {
    id: 'classroom',
    label: 'Classroom',
    sublabel: 'CS-301',
    icon: GraduationCap,
    keyNum: '2',
  },
  {
    id: 'dining',
    label: 'Dining Area',
    sublabel: 'Shared Mess',
    icon: UtensilsCrossed,
    keyNum: '3',
  },
  {
    id: 'gym',
    label: 'Gym',
    sublabel: 'Fitness',
    icon: Dumbbell,
    keyNum: '4',
  },
  {
    id: 'grounds',
    label: 'Grounds',
    sublabel: 'Gate & Loop',
    icon: Trees,
    keyNum: '5',
  },
  {
    id: 'balcony',
    label: 'Balcony',
    sublabel: 'Terrace',
    icon: Sun,
    keyNum: '6',
  },
];

export const LocationSelector: React.FC = () => {
  const currentLocation = useGameStore((state) => state.currentLocation);
  const switchLocation = useGameStore((state) => state.switchLocation);
  const isTransitioning = useGameStore((state) => state.transitionState.isTransitioning);

  // Keyboard hotkeys for fast location switching (1 - 6)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '1') switchLocation('bedroom');
      if (e.key === '2') switchLocation('classroom');
      if (e.key === '3') switchLocation('dining');
      if (e.key === '4') switchLocation('gym');
      if (e.key === '5') switchLocation('grounds');
      if (e.key === '6') switchLocation('balcony');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [switchLocation]);

  return (
    <nav aria-label="World Location Selector" className="glass-panel p-1.5 rounded-2xl flex items-center gap-1.5 pointer-events-auto">
      {buttons.map((btn) => {
        const Icon = btn.icon;
        const isActive = currentLocation === btn.id;

        return (
          <button
            key={btn.id}
            onClick={() => switchLocation(btn.id)}
            disabled={isTransitioning}
            className={`group relative px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 amber-glow-sm shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
            }`}
            title={`Navigate to ${btn.label} (Press ${btn.keyNum})`}
          >
            <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:scale-110 ${
              isActive ? 'text-amber-400' : 'text-slate-400'
            }`} />

            <div className="text-left hidden md:block">
              <span className="block leading-tight">{btn.label}</span>
              <span className={`text-[10px] font-normal leading-none ${
                isActive ? 'text-amber-300/70' : 'text-slate-500'
              }`}>
                {btn.sublabel}
              </span>
            </div>

            {/* Numeric hotkey badge */}
            <span className={`font-mono text-[9px] px-1 py-0.2 rounded border hidden lg:inline-block ${
              isActive
                ? 'bg-amber-500/30 text-amber-200 border-amber-500/40'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              {btn.keyNum}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
