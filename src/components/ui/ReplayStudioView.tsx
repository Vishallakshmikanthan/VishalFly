import React from 'react';
import { 
  Film, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Activity, 
  Zap, 
  BrainCircuit, 
  Dumbbell, 
  Code2 
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { ReplaySpeed } from '../../simulation/replay/ReplayTypes';

export const ReplayStudioView: React.FC = () => {
  const replayState = useGameStore((state) => state.replayState);
  const isReplayMode = useGameStore((state) => state.isReplayMode);
  const startReplay = useGameStore((state) => state.startReplay);
  const exitReplay = useGameStore((state) => state.exitReplay);
  const toggleReplayPlay = useGameStore((state) => state.toggleReplayPlay);
  const setReplaySpeed = useGameStore((state) => state.setReplaySpeed);
  const scrubReplay = useGameStore((state) => state.scrubReplay);
  const stepReplayForward = useGameStore((state) => state.stepReplayForward);
  const stepReplayBackward = useGameStore((state) => state.stepReplayBackward);
  const jumpReplayToStart = useGameStore((state) => state.jumpReplayToStart);
  const jumpReplayToEnd = useGameStore((state) => state.jumpReplayToEnd);

  const { isPlaying, playbackSpeed, currentIndex, totalSnapshots, activeSnapshot } = replayState;

  const speeds: ReplaySpeed[] = [1, 2, 4];

  // If not currently in replay mode but there are snapshots, start automatically
  React.useEffect(() => {
    if (!isReplayMode && totalSnapshots > 0) {
      startReplay(totalSnapshots - 1);
    }
  }, [isReplayMode, totalSnapshots, startReplay]);

  if (totalSnapshots === 0) {
    return (
      <div className="w-full h-full max-w-4xl mx-auto p-6 flex flex-col items-center justify-center text-slate-100 pointer-events-auto">
        <div className="glass-panel p-8 rounded-2xl border border-slate-700/60 shadow-2xl text-center max-w-md flex flex-col items-center gap-3">
          <Film className="w-12 h-12 text-slate-500 mb-1" />
          <h2 className="text-base font-bold text-white">No Replay Snapshots Available Yet</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The simulation recorder captures serializable snapshots every 3 simulated minutes and on activity/location milestones. Please let the simulation run a few moments to accumulate historical snapshots.
          </p>
          <button
            onClick={exitReplay}
            className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
          >
            Return to 3D Simulation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full max-w-6xl mx-auto p-4 md:p-6 flex flex-col gap-4 text-slate-100 overflow-y-auto pointer-events-auto">
      {/* Top Banner: Explanation & Exit */}
      <div className="glass-panel p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">Simulation Replay Studio</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40">
                Snapshot Playback
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Visual playback of recorded historical states. Live simulation is safely preserved without duplicate activity executions.
            </p>
          </div>
        </div>

        <button
          onClick={exitReplay}
          className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all shrink-0"
        >
          Exit Replay & Return Live
        </button>
      </div>

      {/* Main Scrubber & Player Card */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-2xl flex flex-col gap-4">
        {/* Scrubber Header Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="font-mono text-sm font-bold text-white">
              {activeSnapshot?.timestamp || 'Snapshot Point'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-[11px] text-slate-400 font-mono">
              Snapshot {currentIndex + 1} of {totalSnapshots}
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Simulated Day: <strong className="text-slate-200">{activeSnapshot?.dayOfWeek} (Day {activeSnapshot?.dayNumber})</strong>
          </div>
        </div>

        {/* Range Slider Scrubber */}
        <div className="flex flex-col gap-1.5">
          <input
            type="range"
            min={0}
            max={totalSnapshots - 1}
            value={currentIndex}
            onChange={(e) => scrubReplay(parseInt(e.target.value, 10))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Start (Index 0)</span>
            <span>Current: {Math.round(((currentIndex + 1) / totalSnapshots) * 100)}%</span>
            <span>Latest (Index {totalSnapshots - 1})</span>
          </div>
        </div>

        {/* Playback Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            {/* Jump to Beginning */}
            <button
              onClick={jumpReplayToStart}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              title="Jump to Start"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Step Back */}
            <button
              onClick={stepReplayBackward}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              title="Step Backward"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Play / Pause Toggle */}
            <button
              onClick={toggleReplayPlay}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                isPlaying
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause Playback' : 'Play Replay'}</span>
            </button>

            {/* Step Forward */}
            <button
              onClick={stepReplayForward}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              title="Step Forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Jump to End */}
            <button
              onClick={jumpReplayToEnd}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              title="Jump to Latest Recorded Snapshot"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Multipliers */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-900 border border-slate-800">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => setReplaySpeed(s)}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
                  playbackSpeed === s
                    ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Snapshot State Details Inspector */}
      {activeSnapshot && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Activity, Pose & Location */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                Snapshot State
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 capitalize">
                Pose: {activeSnapshot.flyActivity.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Location</span>
                </span>
                <span className="font-semibold text-white">{activeSnapshot.locationName}</span>
              </div>

              <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Current Zone Spot</span>
                <span className="font-mono text-slate-200">{activeSnapshot.currentSpot}</span>
              </div>

              {activeSnapshot.currentActivity ? (
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Active Activity</span>
                    <span className="font-bold text-purple-300">{activeSnapshot.currentActivity.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Current Action</span>
                    <span className="font-medium text-slate-200">{activeSnapshot.currentActivity.actionLabel}</span>
                  </div>
                  {activeSnapshot.currentActivity.progressPercent !== undefined && (
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${activeSnapshot.currentActivity.progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-slate-500 text-center font-mono">
                  No active scheduled activity at this snapshot.
                </div>
              )}
            </div>

            {/* Sub-system details */}
            {activeSnapshot.workoutSummary && (
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1 text-[11px] font-mono">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5" />
                  {activeSnapshot.workoutSummary.planName}
                </span>
                <span className="text-slate-300">
                  {activeSnapshot.workoutSummary.exerciseName} • Set {activeSnapshot.workoutSummary.set}/{activeSnapshot.workoutSummary.totalSets}
                </span>
              </div>
            )}

            {activeSnapshot.projectSummary && activeSnapshot.projectSummary.progress > 0 && (
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center text-[11px] font-mono">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5" />
                  {activeSnapshot.projectSummary.currentProject}
                </span>
                <span className="text-slate-300">
                  Built: {activeSnapshot.projectSummary.progress}% ({activeSnapshot.projectSummary.sessions} sessions)
                </span>
              </div>
            )}
          </div>

          {/* Card 2: Needs at this Historical Snapshot */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Snapshot Internal Needs
              </span>
              <span className="text-[10px] text-slate-400 font-mono">0-100 scale</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Energy', val: activeSnapshot.needs.energy, color: 'bg-emerald-500' },
                { label: 'Hunger', val: activeSnapshot.needs.hunger, color: 'bg-amber-500' },
                { label: 'Sleepiness', val: activeSnapshot.needs.sleepiness, color: 'bg-sky-500' },
                { label: 'Fatigue', val: activeSnapshot.needs.fatigue, color: 'bg-blue-500' },
                { label: 'Focus', val: activeSnapshot.needs.focus, color: 'bg-purple-500' },
                { label: 'Social Need', val: activeSnapshot.needs.socialNeed, color: 'bg-pink-500' },
              ].map((need) => (
                <div key={need.label} className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">{need.label}</span>
                    <span className="font-mono font-bold text-slate-200">{Math.round(need.val)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${need.color}`}
                      style={{ width: `${Math.round(need.val)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Cognitive Decision at this point */}
            {activeSnapshot.cognitiveSummary && (
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1 text-[11px] font-mono mt-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Cognitive Decision</span>
                </div>
                <p className="text-slate-300 font-sans text-xs">
                  {activeSnapshot.cognitiveSummary.selectedBehavior}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
