import React from 'react';
import { Compass, Clock, MapPin } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { LocationSelector } from './LocationSelector';
import { LOCATIONS } from '../../navigation/locationGraph';

export const HUD: React.FC = () => {
  const simulatedTime = useGameStore((state) => state.simulatedTime);
  const locationName = useGameStore((state) => state.locationName);
  const roomSubLocation = useGameStore((state) => state.roomSubLocation);
  const flyActivity = useGameStore((state) => state.flyActivity);
  const currentSpot = useGameStore((state) => state.currentSpot);
  const currentLocation = useGameStore((state) => state.currentLocation);

  const currentLocConfig = LOCATIONS[currentLocation] || LOCATIONS.bedroom;

  return (
    <header className="absolute top-0 left-0 right-0 p-4 md:p-6 pointer-events-none flex flex-col md:flex-row justify-between items-start md:items-center gap-3 z-10">
      {/* Top Left: VishalFly Branding & Location */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        <div className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-3">
          {/* Glowing Fly Emblem */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-4c0-.28.22-.5.5-.5s.5.22.5.5v4zm-1-6.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" opacity="0.2"/>
              <ellipse cx="12" cy="13" rx="3" ry="4.5" />
              <ellipse cx="7.5" cy="10" rx="3.5" ry="1.8" transform="rotate(-30 7.5 10)" fillOpacity="0.75" />
              <ellipse cx="16.5" cy="10" rx="3.5" ry="1.8" transform="rotate(30 16.5 10)" fillOpacity="0.75" />
              <circle cx="10" cy="8" r="1.2" fill="#dc2626" />
              <circle cx="14" cy="8" r="1.2" fill="#dc2626" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base md:text-lg tracking-tight text-white font-sans">
                Vishal<span className="text-amber-400">Fly</span>
              </h1>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/20">
                World v2
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 font-sans">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{locationName}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{roomSubLocation}</span>
            </p>
          </div>
        </div>

        {/* Live Sub-location pill */}
        <div className="glass-pill px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-slate-300 self-start transition-all">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Zone:</span>
          <span className="text-amber-200 font-medium">{currentSpot}</span>
        </div>
      </div>

      {/* Top Center: Location Navigation Selector */}
      <div className="pointer-events-auto self-start md:self-auto">
        <LocationSelector />
      </div>

      {/* Top Right: Clock & Simulation State */}
      <div className="flex flex-col items-end gap-2 pointer-events-auto self-end md:self-auto">
        <div className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-3.5">
          {/* Simulated Time */}
          <div className="flex items-center gap-2 pr-3 border-r border-slate-700/60">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <div className="font-mono text-sm md:text-base font-bold text-white tracking-wider">
                {simulatedTime}
              </div>
              <div className="text-[10px] uppercase font-mono text-slate-400">
                {currentLocConfig.timeLabel}
              </div>
            </div>
          </div>

          {/* Activity State Pill */}
          <div className="flex items-center gap-2">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            <div className="text-right">
              <span className="block text-xs font-semibold text-slate-200 capitalize">
                {flyActivity}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Avatar Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
