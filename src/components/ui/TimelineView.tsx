import React, { useState, useMemo } from 'react';
import { 
  ScrollText, 
  Search, 
  Activity, 
  Navigation, 
  Sparkles, 
  AlertTriangle, 
  Calendar, 
  Info, 
  Film, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Dumbbell, 
  Utensils, 
  Code2, 
  GraduationCap, 
  Shirt, 
  PhoneCall, 
  PackageCheck 
} from 'lucide-react';
import { useGameStore, simulationEngine } from '../../store/useGameStore';
import { SimulationEvent, SimulationEventCategory } from '../../types';

export const TimelineView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<SimulationEvent | null>(null);

  const jumpReplayToEvent = useGameStore((state) => state.jumpReplayToEvent);

  // Fetch all recorded events from engine's EventLogger
  const allEvents = useMemo(() => {
    return simulationEngine.eventLogger.getAll().reverse();
  }, [useGameStore((state) => state.recentEvents)]);

  const categoryIcons: Record<SimulationEventCategory, React.ReactNode> = {
    activity: <Activity className="w-4 h-4 text-amber-400" />,
    travel: <Navigation className="w-4 h-4 text-cyan-400" />,
    behavior: <Sparkles className="w-4 h-4 text-purple-400" />,
    need: <AlertTriangle className="w-4 h-4 text-rose-400" />,
    system: <Info className="w-4 h-4 text-slate-400" />,
    lifecycle: <Calendar className="w-4 h-4 text-emerald-400" />,
  };

  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'activity', label: 'Activities' },
    { id: 'travel', label: 'Travel & Locations' },
    { id: 'behavior', label: 'Behaviors' },
    { id: 'need', label: 'Needs Alerts' },
    { id: 'lifecycle', label: 'Day Lifecycle' },
    { id: 'workout', label: 'Workouts' },
    { id: 'meals', label: 'Meals & Food' },
    { id: 'project', label: 'Project Work' },
    { id: 'academic', label: 'Academics' },
  ];

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'workout') {
          if (!event.message.toLowerCase().includes('gym') && !event.message.toLowerCase().includes('workout')) {
            return false;
          }
        } else if (selectedCategory === 'meals') {
          if (!event.message.toLowerCase().includes('meal') && !event.message.toLowerCase().includes('dinner') && !event.message.toLowerCase().includes('food') && !event.message.toLowerCase().includes('lunch')) {
            return false;
          }
        } else if (selectedCategory === 'project') {
          if (!event.message.toLowerCase().includes('project') && !event.message.toLowerCase().includes('vishalfly')) {
            return false;
          }
        } else if (selectedCategory === 'academic') {
          if (!event.message.toLowerCase().includes('college') && !event.message.toLowerCase().includes('assignment') && !event.message.toLowerCase().includes('lecture')) {
            return false;
          }
        } else if (event.category !== selectedCategory) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesMsg = event.message.toLowerCase().includes(q);
        const matchesTime = event.timestamp.toLowerCase().includes(q);
        const matchesLoc = event.locationId?.toLowerCase().includes(q) || false;
        const matchesAct = event.activityId?.toLowerCase().includes(q) || false;
        return matchesMsg || matchesTime || matchesLoc || matchesAct;
      }

      return true;
    });
  }, [allEvents, selectedCategory, searchQuery]);

  const handleJumpToReplay = (event: SimulationEvent) => {
    jumpReplayToEvent(event.timestamp);
  };

  const getSubsystemIcon = (event: SimulationEvent) => {
    const text = event.message.toLowerCase();
    if (text.includes('gym') || text.includes('workout')) return <Dumbbell className="w-3.5 h-3.5 text-amber-400" />;
    if (text.includes('meal') || text.includes('dinner') || text.includes('lunch')) return <Utensils className="w-3.5 h-3.5 text-emerald-400" />;
    if (text.includes('project')) return <Code2 className="w-3.5 h-3.5 text-cyan-400" />;
    if (text.includes('college') || text.includes('lecture') || text.includes('assignment')) return <GraduationCap className="w-3.5 h-3.5 text-purple-400" />;
    if (text.includes('laundry') || text.includes('clothes')) return <Shirt className="w-3.5 h-3.5 text-sky-400" />;
    if (text.includes('call')) return <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />;
    if (text.includes('food') && text.includes('order')) return <PackageCheck className="w-3.5 h-3.5 text-amber-300" />;
    return categoryIcons[event.category] || <Info className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="w-full h-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-4 text-slate-100 overflow-hidden pointer-events-auto">
      {/* Top Banner / Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 glass-panel p-4 rounded-2xl border border-slate-700/60 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <ScrollText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Simulation Event Timeline
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                {allEvents.length} Events Logged
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Chronological log of activities, state transitions, college variations, and daily milestones
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events, locations, activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/70 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Events List & Inspector Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0 overflow-hidden">
        {/* Left: Events Stream (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-700/60 p-3 overflow-y-auto flex flex-col gap-2">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
              <ScrollText className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-400">No events found matching current criteria.</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting the search query or category filter.</p>
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const isSelected = selectedEvent?.id === evt.id;
              const isCompleted = evt.message.toLowerCase().includes('finished') || evt.message.toLowerCase().includes('completed');
              const isAlert = evt.category === 'need';

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/60 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-slate-800 border border-slate-700/50">
                        {getSubsystemIcon(evt)}
                      </div>
                      <span className="font-mono text-[11px] font-bold text-amber-300">
                        {evt.timestamp}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/40">
                        {evt.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Done
                        </span>
                      )}
                      {isAlert && (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Alert
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJumpToReplay(evt);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-slate-700 text-[10px] font-medium flex items-center gap-1 transition-colors"
                        title="Jump to this moment in Replay Studio"
                      >
                        <Film className="w-3 h-3 text-amber-400" />
                        <span>Replay</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 pl-7 leading-relaxed font-sans">
                    {evt.message}
                  </p>

                  {evt.locationId && (
                    <div className="flex items-center gap-1 pl-7 text-[10px] text-slate-400 font-mono">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span className="capitalize">{evt.locationId}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Event Inspector (1 col) */}
        <div className="glass-panel rounded-2xl border border-slate-700/60 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Event Detail Inspector</h2>
          </div>

          {selectedEvent ? (
            <div className="flex flex-col gap-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-amber-300 font-bold">{selectedEvent.timestamp}</span>
                  <span className="uppercase font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedEvent.category}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white leading-snug">
                  {selectedEvent.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Day Number</span>
                  <span className="font-bold text-slate-200">Day {selectedEvent.dayNumber}</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Location</span>
                  <span className="font-bold text-slate-200 capitalize">
                    {selectedEvent.locationId || 'Unspecified'}
                  </span>
                </div>
              </div>

              {selectedEvent.activityId && (
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                  <span className="text-[10px] text-slate-400 block">Linked Activity</span>
                  <span className="font-semibold text-amber-300">{selectedEvent.activityId}</span>
                </div>
              )}

              <button
                onClick={() => handleJumpToReplay(selectedEvent)}
                className="w-full mt-2 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Film className="w-4 h-4" />
                <span>Jump into Replay at this Event</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>Select any event in the timeline to inspect full details and jump into visual replay.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
