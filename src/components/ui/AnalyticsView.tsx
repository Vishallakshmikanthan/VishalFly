import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Dumbbell, 
  Code2, 
  GraduationCap, 
  Utensils, 
  MapPin, 
  AlertCircle,
  CheckCircle2,
  HeartHandshake
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { NeedType } from '../../types';

export const AnalyticsView: React.FC = () => {
  const analyticsReport = useGameStore((state) => state.analyticsReport);
  const refreshAnalytics = useGameStore((state) => state.refreshAnalytics);

  // Active needs to display in the line chart
  const [activeNeedToggles, setActiveNeedToggles] = useState<Record<NeedType, boolean>>({
    energy: true,
    hunger: true,
    focus: true,
    fatigue: false,
    sleepiness: false,
    socialNeed: false,
  });

  useEffect(() => {
    refreshAnalytics();
    const interval = setInterval(refreshAnalytics, 1500);
    return () => clearInterval(interval);
  }, [refreshAnalytics]);

  const {
    measuredTimeRange,
    hasSufficientData,
    activityMetrics,
    locationMetrics,
    workoutStats,
    projectStats,
    assignmentStats,
    mealStats,
    collegeStats,
    routineStats,
    needsTrends,
    overallCompletionRate,
  } = analyticsReport;

  const needColors: Record<NeedType, { stroke: string; label: string }> = {
    energy: { stroke: '#10b981', label: 'Energy' },
    hunger: { stroke: '#f59e0b', label: 'Hunger' },
    focus: { stroke: '#a855f7', label: 'Focus' },
    fatigue: { stroke: '#3b82f6', label: 'Fatigue' },
    sleepiness: { stroke: '#06b6d4', label: 'Sleepiness' },
    socialNeed: { stroke: '#ec4899', label: 'Social Need' },
  };

  const toggleNeed = (need: NeedType) => {
    setActiveNeedToggles((prev) => ({ ...prev, [need]: !prev[need] }));
  };

  // Prepare Needs Trendline SVG points
  const renderNeedsChart = () => {
    if (needsTrends.length < 2) {
      return (
        <div className="h-48 flex items-center justify-center text-xs text-slate-500 font-mono">
          Accumulating trajectory samples (minimum 2 data points required)...
        </div>
      );
    }

    const width = 640;
    const height = 180;
    const padding = 24;

    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const totalSamples = needsTrends.length;

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 select-none">
          {/* Background grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
          <line x1={padding} y1={padding + chartH * 0.5} x2={width - padding} y2={padding + chartH * 0.5} stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" opacity="0.6" />

          {/* Y Axis labels */}
          <text x={padding - 6} y={padding + 4} fill="#64748b" fontSize="9" textAnchor="end">100%</text>
          <text x={padding - 6} y={padding + chartH * 0.5 + 4} fill="#64748b" fontSize="9" textAnchor="end">50%</text>
          <text x={padding - 6} y={height - padding + 4} fill="#64748b" fontSize="9" textAnchor="end">0%</text>

          {/* Render lines for active needs */}
          {(Object.keys(activeNeedToggles) as NeedType[]).map((needKey) => {
            if (!activeNeedToggles[needKey]) return null;

            const color = needColors[needKey].stroke;
            const points = needsTrends.map((sample, idx) => {
              const x = padding + (idx / (totalSamples - 1)) * chartW;
              const val = sample.needs[needKey] ?? 0;
              const y = height - padding - (val / 100) * chartH;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(' ');

            return (
              <g key={needKey}>
                <polyline
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
                {/* Last point marker */}
                {needsTrends.length > 0 && (() => {
                  const lastIdx = needsTrends.length - 1;
                  const lastX = padding + chartW;
                  const lastVal = needsTrends[lastIdx].needs[needKey] ?? 0;
                  const lastY = height - padding - (lastVal / 100) * chartH;
                  return (
                    <circle cx={lastX} cy={lastY} r="3" fill={color} stroke="#0f172a" strokeWidth="1.5" />
                  );
                })()}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // Convert minutes into human readable hours and minutes
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  // Calculate max minutes for bar scaling
  const maxActivityMinutes = Math.max(
    ...Object.values(activityMetrics).map((a) => a.totalSimulatedMinutes),
    30
  );

  return (
    <div className="w-full h-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-5 text-slate-100 overflow-y-auto pointer-events-auto">
      {/* Top Header & Measured Time Range Banner */}
      <div className="glass-panel p-4 md:p-5 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Simulation Analytics & Observability</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/25">
                Real Simulation Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Aggregated historical metrics, metabolic need trajectories, and life milestone velocity
            </p>
          </div>
        </div>

        {/* Measured Range Badge */}
        <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs">
          <Clock className="w-4 h-4 text-amber-400" />
          <div>
            <div className="text-[11px] text-slate-400">Measured Range</div>
            <div className="font-mono text-slate-200 font-bold">
              Day {measuredTimeRange.startDay} {measuredTimeRange.startTime} → Day {measuredTimeRange.currentDay} {measuredTimeRange.currentTime}
              <span className="text-amber-400 ml-1.5">({formatTime(measuredTimeRange.totalElapsedSimMinutes)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Initializing / Data Warning State if < 5 sim minutes */}
      {!hasSufficientData && (
        <div className="glass-panel p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 block mb-0.5">Simulation Data Accumulating</span>
            <p className="text-slate-300">
              The simulation has run for {measuredTimeRange.totalElapsedSimMinutes} simulated minutes. Run the simulation (or use 4x / 8x speed) to build up richer behavioral and time-allocation statistics. All charts update automatically from real simulation state.
            </p>
          </div>
        </div>
      )}

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Total Sim Time */}
        <div className="glass-panel p-3 rounded-xl border border-slate-700/60 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" /> Sim Time
          </span>
          <span className="text-base font-bold font-mono text-white">
            {formatTime(measuredTimeRange.totalElapsedSimMinutes)}
          </span>
          <span className="text-[10px] text-slate-500">{measuredTimeRange.totalElapsedRealSeconds}s real elapsed</span>
        </div>

        {/* KPI 2: Completion Rate */}
        <div className="glass-panel p-3 rounded-xl border border-slate-700/60 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Reliability
          </span>
          <span className="text-base font-bold font-mono text-emerald-400">
            {overallCompletionRate}%
          </span>
          <span className="text-[10px] text-slate-500">Activity completion rate</span>
        </div>

        {/* KPI 3: Workouts */}
        <div className="glass-panel p-3 rounded-xl border border-slate-700/60 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
            <Dumbbell className="w-3 h-3 text-amber-400" /> Gym Workouts
          </span>
          <span className="text-base font-bold font-mono text-amber-300">
            {workoutStats.workoutsCompleted} done
          </span>
          <span className="text-[10px] text-slate-500">{workoutStats.totalSetsCompleted} sets completed</span>
        </div>

        {/* KPI 4: Project Progress */}
        <div className="glass-panel p-3 rounded-xl border border-slate-700/60 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
            <Code2 className="w-3 h-3 text-cyan-400" /> Project Built
          </span>
          <span className="text-base font-bold font-mono text-cyan-300">
            {projectStats.totalProgress}%
          </span>
          <span className="text-[10px] text-slate-500">{projectStats.completedSessions} sprints finished</span>
        </div>

        {/* KPI 5: Assignments */}
        <div className="glass-panel p-3 rounded-xl border border-slate-700/60 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
            <GraduationCap className="w-3 h-3 text-purple-400" /> Assignments
          </span>
          <span className="text-base font-bold font-mono text-purple-300">
            {assignmentStats.progress}%
          </span>
          <span className="text-[10px] text-slate-500">{assignmentStats.completedTasks} tasks submitted</span>
        </div>

        {/* KPI 6: Meals Consumed */}
        <div className="glass-panel p-3 rounded-xl border border-slate-700/60 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
            <Utensils className="w-3 h-3 text-emerald-400" /> Sustenance
          </span>
          <span className="text-base font-bold font-mono text-emerald-300">
            {mealStats.mealsCompleted} meals
          </span>
          <span className="text-[10px] text-slate-500">{mealStats.midnightOrderCount} midnight orders</span>
        </div>

        {/* KPI 7: Routines & Social */}
        <div className="glass-panel p-3 rounded-xl border border-slate-700/60 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
            <HeartHandshake className="w-3 h-3 text-pink-400" /> Routines
          </span>
          <span className="text-base font-bold font-mono text-pink-300">
            {routineStats.morningRoutinesCompleted} wakes
          </span>
          <span className="text-[10px] text-slate-500">{routineStats.familyCallsCompleted} family calls ({routineStats.familyCallMinutes}m)</span>
        </div>
      </div>

      {/* Row 2: Needs Trajectory Over Time */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Metabolic Needs Trajectory Over Time</h2>
            <span className="text-[10px] text-slate-500">({needsTrends.length} samples)</span>
          </div>

          {/* Need line toggles */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {(Object.keys(needColors) as NeedType[]).map((needKey) => {
              const active = activeNeedToggles[needKey];
              return (
                <button
                  key={needKey}
                  onClick={() => toggleNeed(needKey)}
                  className={`px-2 py-0.5 rounded-lg font-mono text-[10px] font-semibold transition-all border ${
                    active
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-slate-900/60 text-slate-500 border-transparent hover:text-slate-300'
                  }`}
                  style={{ borderColor: active ? needColors[needKey].stroke : undefined }}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: needColors[needKey].stroke }} />
                  {needColors[needKey].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart SVG */}
        {renderNeedsChart()}
      </div>

      {/* Row 3: Activity Time Allocation & College Variation Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity Time Allocation Bar Chart */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Activity Time Allocation</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Actual minutes spent</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {Object.keys(activityMetrics).length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 font-mono">
                No activity records logged yet.
              </div>
            ) : (
              Object.values(activityMetrics).map((act) => {
                const widthPercent = Math.min(100, Math.round((act.totalSimulatedMinutes / maxActivityMinutes) * 100));
                return (
                  <div key={act.activityId} className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-300 font-medium truncate max-w-[240px]">
                        {act.displayName}
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-amber-300 font-bold">{formatTime(act.totalSimulatedMinutes)}</span>
                        {act.completionCount > 0 && (
                          <span className="text-[10px] text-emerald-400">({act.completionCount} done)</span>
                        )}
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(2, widthPercent)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* College Sub-Behaviors & Location Frequency */}
        <div className="flex flex-col gap-4">
          {/* College Sub-Behaviors */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white">College Lecture Attention Breakdown</h2>
              </div>
              <span className="text-[10px] font-mono text-purple-300">
                {formatTime(collegeStats.totalSimulatedMinutes)} in class
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              {[
                { id: 'lecture', label: 'Lecture', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { id: 'dozing', label: 'Dozing', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { id: 'laptop', label: 'Laptop Hack', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { id: 'reels', label: 'Reels / Shorts', color: 'text-rose-400', bg: 'bg-rose-500/10' },
                { id: 'mobile_game', label: 'Gaming', color: 'text-purple-400', bg: 'bg-purple-500/10' },
              ].map((item) => {
                const minutes = collegeStats.behaviorDistribution[item.id] || 0;
                return (
                  <div key={item.id} className={`p-2.5 rounded-xl border border-slate-800 ${item.bg} flex flex-col gap-1`}>
                    <span className="text-[10px] text-slate-400">{item.label}</span>
                    <span className={`font-mono text-xs font-bold ${item.color}`}>
                      {formatTime(minutes)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location Visit Frequency */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">Location Visits & Occupancy</h2>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              {Object.values(locationMetrics).map((loc) => (
                <div key={loc.locationId} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-400 truncate">{loc.locationName}</span>
                  <span className="font-mono text-xs font-bold text-slate-200">
                    {formatTime(loc.totalSimulatedMinutes)}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">
                    {loc.visitCount} visits
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
