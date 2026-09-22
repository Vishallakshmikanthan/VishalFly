import React, { useState } from 'react';
import { Compass, Clock, MapPin, Calendar, ArrowRight, ScrollText, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { LocationSelector } from './LocationSelector';
import { SimulationControls } from './SimulationControls';
import { NeedsMeters } from './NeedsMeters';
import { EventLogPanel } from './EventLogPanel';
import { LOCATIONS } from '../../navigation/locationGraph';

export const HUD: React.FC = () => {
  const simulatedTime = useGameStore((state) => state.simulatedTime);
  const locationName = useGameStore((state) => state.locationName);
  const roomSubLocation = useGameStore((state) => state.roomSubLocation);
  const flyActivity = useGameStore((state) => state.flyActivity);
  const currentSpot = useGameStore((state) => state.currentSpot);
  const currentLocation = useGameStore((state) => state.currentLocation);
  const simulationClock = useGameStore((state) => state.simulationClock);
  const currentActivity = useGameStore((state) => state.currentActivity);
  const nextActivity = useGameStore((state) => state.nextActivity);
  const selectedCollegeBehavior = useGameStore((state) => state.selectedCollegeBehavior);
  const recentEvents = useGameStore((state) => state.recentEvents);

  const [isLogOpen, setIsLogOpen] = useState(false);

  const currentLocConfig = LOCATIONS[currentLocation] || LOCATIONS.bedroom;

  return (
    <>
      <header className="absolute top-0 left-0 right-0 p-3 md:p-5 pointer-events-none flex flex-col gap-3 z-20">
        {/* Top Bar: Brand + Controls + Clock */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 w-full">
          {/* Top Left: VishalFly Branding & Location */}
          <div className="flex flex-col gap-2 pointer-events-auto">
            <div className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-3">
              {/* Glowing Fly Emblem */}
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
                  <h1 className="font-extrabold text-base md:text-lg tracking-tight text-white font-sans">
                    Vishal<span className="text-amber-400">Fly</span>
                  </h1>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/20">
                    Sim v3
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

            {/* Live Sub-location & Behavior pill */}
            <div className="flex items-center gap-2">
              <div className="glass-pill px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-slate-300 self-start">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Zone:</span>
                <span className="text-amber-200 font-medium">{currentSpot}</span>
              </div>

              {selectedCollegeBehavior && (
                <div className="glass-pill px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs text-purple-300 border border-purple-500/30">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span className="capitalize font-medium">{selectedCollegeBehavior}</span>
                </div>
              )}
            </div>
          </div>

          {/* Top Center: Simulation Controls & Location Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pointer-events-auto">
            <SimulationControls />
            <LocationSelector />
          </div>

          {/* Top Right: Clock & Routine Status */}
          <div className="flex flex-col items-end gap-2 pointer-events-auto self-end md:self-auto">
            <div className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-3.5 shadow-xl">
              {/* Day & Weekday */}
              <div className="pr-3 border-r border-slate-700/60 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
                    <span>Day {simulationClock.dayNumber}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-amber-300">{simulationClock.dayOfWeek}</span>
                  </div>
                  <div className="text-[10px] uppercase font-mono text-slate-400">
                    {simulationClock.dayType} routine
                  </div>
                </div>
              </div>

              {/* Simulated Time */}
              <div className="flex items-center gap-2 pr-3 border-r border-slate-700/60">
                <Clock className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-mono text-base md:text-lg font-bold text-white tracking-wider">
                    {simulatedTime}
                  </div>
                  <div className="text-[10px] uppercase font-mono text-slate-400">
                    {currentLocConfig.timeLabel}
                  </div>
                </div>
              </div>

              {/* Events Log Trigger */}
              <button
                onClick={() => setIsLogOpen(true)}
                className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-slate-700/50"
                title="Open Simulation Events Log"
              >
                <ScrollText className="w-4 h-4 text-amber-400" />
                {recentEvents.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: Active Activity Banner */}
        <div className="flex items-center justify-between pointer-events-auto">
          {currentActivity && (
            <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg border border-amber-500/20 text-xs">
              <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </div>
                <span className="text-slate-400 uppercase font-mono text-[10px] tracking-wider">Current:</span>
                <span className="font-bold text-white tracking-tight">
                  {currentActivity.scheduleEntry.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-slate-700 capitalize">
                  {currentActivity.state}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60 capitalize hidden sm:inline">
                  Pose: {flyActivity.replace(/_/g, ' ')}
                </span>
              </div>

              {nextActivity && (
                <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-700/60 text-slate-400">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="uppercase font-mono text-[10px]">Next ({nextActivity.startTime}):</span>
                  <span className="font-medium text-slate-300">
                    {nextActivity.entry.name}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Floating Left: Simulated Needs Meters */}
      <div className="absolute top-28 left-4 md:left-6 z-10 pointer-events-none">
        <NeedsMeters />
      </div>

      {/* Slide-in Event Log Panel */}
      <EventLogPanel isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} />
    </>
  );
};
