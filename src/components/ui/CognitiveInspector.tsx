import React, { useState } from 'react';
import { 
  BrainCircuit, 
  X, 
  ToggleLeft, 
  ToggleRight, 
  Activity, 
  Zap, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Compass, 
  History, 
  Layers, 
  Info,
  Flame,
  BatteryCharging,
  Eye,
  Radar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  Trash2,
  Sliders
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { MemoryOutcome } from '../../cognition/types/cognition';
import { BiologicalConnectomeInspector } from './BiologicalConnectomeInspector';

interface CognitiveInspectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CognitiveInspector: React.FC<CognitiveInspectorProps> = ({ isOpen, onClose }) => {
  const isCognitionEnabled = useGameStore((state) => state.isCognitionEnabled);
  const toggleCognition = useGameStore((state) => state.toggleCognition);
  const setMemoryInfluenceEnabled = useGameStore((state) => state.setMemoryInfluenceEnabled);
  const setAdaptationEnabled = useGameStore((state) => state.setAdaptationEnabled);
  const clearCognitiveMemory = useGameStore((state) => state.clearCognitiveMemory);
  const resetAdaptationDefaults = useGameStore((state) => state.resetAdaptationDefaults);
  const cognitiveData = useGameStore((state) => state.cognitiveInspectorData);
  const currentActivity = useGameStore((state) => state.currentActivity);

  const [activeTab, setActiveTab] = useState<
    'decision' | 'candidates' | 'perception' | 'memory' | 'adaptation' | 'drives' | 'comparison' | 'connectome'
  >('decision');

  if (!isOpen) return null;

  const internalState = cognitiveData?.internalState;
  const drives = internalState?.drives;
  const lastDecision = cognitiveData?.lastDecision;
  const evaluations = cognitiveData?.evaluations || [];
  const rejected = cognitiveData?.rejectedCandidates || [];
  const memory = cognitiveData?.recentMemory || [];
  const relevantMemories = cognitiveData?.relevantMemories || [];
  const comparison = cognitiveData?.comparison;
  const snapshot = cognitiveData?.lastPerceptionSnapshot;
  const adaptationStatus = cognitiveData?.adaptationStatus;

  const isMemoryEnabled = cognitiveData?.isMemoryInfluenceEnabled ?? true;
  const isAdaptationOn = cognitiveData?.isAdaptationEnabled ?? true;

  const renderOutcomeBadge = (outcome?: MemoryOutcome) => {
    switch (outcome) {
      case 'completed':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> completed
          </span>
        );
      case 'interrupted':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" /> interrupted
          </span>
        );
      case 'rejected':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <XCircle className="w-2.5 h-2.5" /> rejected
          </span>
        );
      case 'failed':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
            <XCircle className="w-2.5 h-2.5" /> failed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-700/50 text-slate-300 border border-slate-600/40 flex items-center gap-1">
            cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md pointer-events-auto">
      <div className="glass-panel w-full max-w-5xl max-h-[92vh] rounded-2xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/40 flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-700/60 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  Connectome Cognitive Inspector
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                    Milestones 6 &amp; 7
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Perception snapshots, episodic outcomes, candidate scoring &amp; adaptive behavior
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Master Toggle Button */}
            <button
              onClick={toggleCognition}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all border ${
                isCognitionEnabled 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              title="Toggle Cognitive Decision Layer"
            >
              {isCognitionEnabled ? (
                <>
                  <ToggleRight className="w-4 h-4 text-cyan-400" />
                  <span>Cognitive Layer: ACTIVE</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-slate-400" />
                  <span>Cognitive Layer: BYPASSED</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 px-5 gap-1 overflow-x-auto text-xs">
          {[
            { id: 'decision', label: 'Decision & Explainability', icon: Sparkles },
            { id: 'candidates', label: 'Candidate Registry', icon: Layers },
            { id: 'perception', label: 'Perception Snapshot', icon: Radar },
            { id: 'memory', label: `Episodic Memory (${memory.length})`, icon: History },
            { id: 'adaptation', label: 'Adaptive Experiments', icon: Sliders },
            { id: 'drives', label: 'Internal Drives', icon: Zap },
            { id: 'comparison', label: 'Schedule vs Cognitive', icon: Compass },
            { id: 'connectome', label: 'Biological Connectome', icon: BrainCircuit },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2.5 font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(92vh-130px)] text-xs">
          
          {/* TAB 1: DECISION & EXPLANATION */}
          {activeTab === 'decision' && (
            <div className="flex flex-col gap-4">
              {/* Quick Adaptive Controls Bar */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-mono text-slate-300 font-semibold">Subsystem Influences:</span>
                  
                  {/* Memory Influence Toggle */}
                  <button
                    onClick={() => setMemoryInfluenceEnabled(!isMemoryEnabled)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
                      isMemoryEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {isMemoryEnabled ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                    Memory Influence: {isMemoryEnabled ? 'ON' : 'OFF'}
                  </button>

                  {/* Adaptive Behavior Toggle */}
                  <button
                    onClick={() => setAdaptationEnabled(!isAdaptationOn)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
                      isAdaptationOn
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {isAdaptationOn ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                    Adaptive Tuning: {isAdaptationOn ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={resetAdaptationDefaults}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Adaptation
                  </button>
                  <button
                    onClick={clearCognitiveMemory}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-[11px] transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear Memory
                  </button>
                </div>
              </div>

              {/* Goal & Status Banner */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">
                    Current High-Level Goal
                  </span>
                  <span className="text-sm font-bold text-white">
                    {internalState?.currentGoal || 'Autonomous Routine'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                      Active Schedule Entry
                    </span>
                    <span className="text-xs font-semibold text-amber-300">
                      {currentActivity?.scheduleEntry.name || 'Idle'}
                    </span>
                  </div>
                  <div className="h-7 w-px bg-slate-700" />
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                      Commitment Hysteresis
                    </span>
                    <span className="text-xs font-mono text-cyan-300">
                      {Math.round((internalState?.behaviorCommitmentElapsedSimSeconds ?? 0) / 60)}m / {Math.round((internalState?.minimumCommitmentSimSeconds ?? 900) / 60)}m
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected Action Card */}
              {lastDecision ? (
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/40 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                      <span className="font-mono text-xs uppercase text-cyan-400 font-bold">
                        Selected Action Decision
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {lastDecision.isUrgentOverride && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                          URGENT OVERRIDE
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                        Confidence: {Math.round(lastDecision.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{lastDecision.selectedCandidateName}</span>
                    <span className="text-xs font-mono text-slate-400">({lastDecision.actionRequest.type})</span>
                  </div>

                  <p className="text-slate-300 text-xs bg-slate-900/70 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans">
                    <span className="text-cyan-400 font-semibold">Integrator Explanation: </span>
                    {lastDecision.explanation}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-center">
                  No cognitive decision recorded yet. Step simulation to trigger evaluation.
                </div>
              )}

              {/* Rejected Candidates & Preconditions */}
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Precondition Disqualifications &amp; Rejections ({rejected.length})
                </h3>
                {rejected.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rejected.map((rej, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col gap-1">
                        <span className="font-bold text-slate-300 font-mono text-[11px]">
                          {rej.candidateId}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {rej.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-[11px]">All evaluated candidates satisfied preconditions.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CANDIDATE REGISTRY TABLE */}
          {activeTab === 'candidates' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono">
                  Behavior Candidates Registry &amp; Scoring Breakdown (Milestone 7)
                </h3>
                <span className="text-slate-400 text-[11px]">
                  Evaluations: {evaluations.length}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Candidate</th>
                      <th className="p-2.5">Eligible</th>
                      <th className="p-2.5">Base</th>
                      <th className="p-2.5">Urgency</th>
                      <th className="p-2.5">Continuity</th>
                      <th className="p-2.5">Rep. Penalty</th>
                      <th className="p-2.5">Adaptation Δ</th>
                      <th className="p-2.5 text-right font-bold text-cyan-300">Final Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {evaluations.map((ev) => {
                      const isWinner = ev.candidateId === lastDecision?.selectedCandidateId;
                      const delta = ev.adaptationScoreDelta ?? 0;
                      return (
                        <tr 
                          key={ev.candidateId} 
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isWinner ? 'bg-cyan-500/15 font-semibold text-white' : 'text-slate-300'
                          }`}
                        >
                          <td className="p-2.5 font-medium flex items-center gap-1.5">
                            {isWinner && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                            <div>
                              <div>{ev.candidateName}</div>
                              {ev.adaptationRulesApplied && ev.adaptationRulesApplied.length > 0 && (
                                <div className="text-[10px] text-cyan-400 font-mono">
                                  {ev.adaptationRulesApplied.join(', ')}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2.5">
                            {ev.isEligible ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Eligible
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 border border-red-500/30">
                                Ineligible
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-mono">{ev.baseUtility}</td>
                          <td className="p-2.5 font-mono text-emerald-400">+{ev.needUrgencyBonus}</td>
                          <td className="p-2.5 font-mono text-cyan-400">+{ev.continuityBonus}</td>
                          <td className="p-2.5 font-mono text-amber-400">-{ev.repetitionPenalty}</td>
                          <td className="p-2.5 font-mono">
                            {delta > 0 ? (
                              <span className="text-emerald-400 font-bold">+{delta}</span>
                            ) : delta < 0 ? (
                              <span className="text-rose-400 font-bold">{delta}</span>
                            ) : (
                              <span className="text-slate-500">0</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-sm text-cyan-300">
                            {ev.finalScore}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PERCEPTION SNAPSHOT */}
          {activeTab === 'perception' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                  <Radar className="w-3.5 h-3.5 text-cyan-400" />
                  Sensory Perception Snapshot (Physical Simulation State)
                </h3>
                <span className="text-slate-400 font-mono text-[11px]">
                  Timestamp: {snapshot?.timestamp || 'N/A'}
                </span>
              </div>

              {snapshot ? (
                <div className="flex flex-col gap-4">
                  {/* Motion State & Progress */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Agent Motion State</span>
                      <span className="text-sm font-bold text-cyan-300 capitalize">
                        {snapshot.motionState || 'grounded'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Activity Phase</span>
                      <span className="text-sm font-bold text-emerald-300 capitalize">
                        {snapshot.activityPhase || 'none'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Travel Progress</span>
                      <span className="text-sm font-bold text-amber-300">
                        {snapshot.travelProgress?.isTraveling 
                          ? `${Math.round((snapshot.travelProgress.progress ?? 0) * 100)}% (${snapshot.travelProgress.fromLocation} → ${snapshot.travelProgress.toLocation})` 
                          : 'Stationary'}
                      </span>
                    </div>
                  </div>

                  {/* Reachable Destinations */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
                    <span className="font-mono text-xs text-slate-300 font-bold uppercase flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      Reachable Destinations ({snapshot.nearbyDestinations?.length || 0})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {snapshot.nearbyDestinations?.map((dest) => (
                        <div key={dest.locationId} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-white block">{dest.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Distance: {dest.distanceMeters}m</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                            ~{dest.travelTimeMinutes}m travel
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interaction Points */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
                    <span className="font-mono text-xs text-slate-300 font-bold uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Detected Interaction Points ({snapshot.nearbyInteractionPoints?.length || 0})
                    </span>
                    {snapshot.nearbyInteractionPoints && snapshot.nearbyInteractionPoints.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {snapshot.nearbyInteractionPoints.map((pt) => (
                          <div key={pt.id} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                            <div>
                              <span className="font-medium text-white block">{pt.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono capitalize">{pt.type}</span>
                            </div>
                            <span className="text-[10px] text-cyan-300 font-mono">
                              {pt.distanceMeters !== undefined ? pt.distanceMeters.toFixed(1) : '1.0'}m
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No specific interaction points in active room.</p>
                    )}
                  </div>

                  {/* Sensory Reality & Grounding Declaration */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex flex-col gap-2">
                    <span className="font-mono text-xs text-cyan-300 font-bold uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      Sensory Reality &amp; Grounding Declaration
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      Perception is grounded exclusively in simulation state (character coordinate, schedule clock, needs, and navigation graph).
                      <strong> Biological sensor streams are NOT simulated or fabricated:</strong>
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                      <div className="p-2 rounded bg-slate-800/80 border border-slate-700 text-slate-400 flex items-center justify-between">
                        <span>Camera Vision:</span>
                        <span className="text-rose-400 font-bold">UNAVAILABLE</span>
                      </div>
                      <div className="p-2 rounded bg-slate-800/80 border border-slate-700 text-slate-400 flex items-center justify-between">
                        <span>Ommatidia Photoreceptors:</span>
                        <span className="text-rose-400 font-bold">UNAVAILABLE</span>
                      </div>
                      <div className="p-2 rounded bg-slate-800/80 border border-slate-700 text-slate-400 flex items-center justify-between">
                        <span>Olfactory Sensilla:</span>
                        <span className="text-rose-400 font-bold">UNAVAILABLE</span>
                      </div>
                      <div className="p-2 rounded bg-slate-800/80 border border-slate-700 text-slate-400 flex items-center justify-between">
                        <span>Antennal Bristles:</span>
                        <span className="text-rose-400 font-bold">UNAVAILABLE</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 italic">No perception snapshot recorded yet.</p>
              )}
            </div>
          )}

          {/* TAB 4: EPISODIC MEMORY */}
          {activeTab === 'memory' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-cyan-400" />
                    Bounded Episodic Memory ({memory.length} Records)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Deterministic IDs, outcome tracking, and bounded ring-buffer capacity (50 records).
                  </p>
                </div>
                <button
                  onClick={clearCognitiveMemory}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Episodic Memory
                </button>
              </div>

              {/* Relevant Memories Card */}
              {relevantMemories && relevantMemories.length > 0 && (
                <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/40 flex flex-col gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    Memories Retrieved for Current Decision Context ({relevantMemories.length})
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {relevantMemories.map((rec) => (
                      <div key={rec.id} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400">{rec.timestamp}</span>
                          <span className="font-semibold text-white">{rec.value}</span>
                          {(rec.locationId || rec.location) && (
                            <span className="text-[10px] text-slate-400 font-mono">@{rec.locationId || rec.location}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {renderOutcomeBadge(rec.outcome)}
                          <span className="text-[10px] font-mono text-cyan-300">
                            Salience: {Math.round(rec.salience * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Memory List */}
              {memory.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {memory.slice().reverse().map((rec) => (
                    <div 
                      key={rec.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1.5 font-mono text-[11px]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">{rec.timestamp}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 capitalize border border-slate-700">
                            {rec.eventType || rec.category}
                          </span>
                          <span className="text-white font-medium">{rec.value}</span>
                          {(rec.locationId || rec.location) && (
                            <span className="text-slate-400 text-[10px]">@{rec.locationId || rec.location}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {renderOutcomeBadge(rec.outcome)}
                          <span className="text-slate-400 text-[10px]">
                            Salience: {Math.round(rec.salience * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Tags & Context */}
                      {rec.tags && rec.tags.length > 0 && (
                        <div className="flex items-center gap-1 pt-1 text-[10px] text-slate-400 font-mono">
                          <span>Tags:</span>
                          {rec.tags.map((t) => (
                            <span key={t} className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No confirmed memory records logged yet.</p>
              )}
            </div>
          )}

          {/* TAB 5: ADAPTIVE BEHAVIOR EXPERIMENTS */}
          {activeTab === 'adaptation' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    Adaptive Behavior System Parameters &amp; Rules
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Inspectable, bounded adaptation rules constrained within [-{adaptationStatus?.maxAdjustment ?? 20}, +{adaptationStatus?.maxAdjustment ?? 20}] score deltas.
                  </p>
                </div>
                <button
                  onClick={resetAdaptationDefaults}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Defaults
                </button>
              </div>

              {/* Status Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Max Score Clamping</span>
                  <span className="text-base font-bold text-cyan-300 font-mono">
                    ±{adaptationStatus?.maxAdjustment ?? 20} pts
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Outcome Weight</span>
                  <span className="text-base font-bold text-emerald-300 font-mono">
                    {adaptationStatus?.outcomeInfluenceWeight ?? 1.0}x
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Routine Window</span>
                  <span className="text-base font-bold text-amber-300 font-mono">
                    {adaptationStatus?.routineMemoryWindowMinutes ?? 120} min
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Memories</span>
                  <span className="text-base font-bold text-white font-mono">
                    {adaptationStatus?.totalMemoriesCount ?? memory.length}
                  </span>
                </div>
              </div>

              {/* The 5 Adaptation Rules */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs uppercase text-slate-300 font-bold">
                  Active Bounded Adaptation Rules:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="font-bold text-cyan-300 block mb-1 font-mono text-xs">1. Repetition Satiety</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Penalizes consecutively repeated sub-behaviors (-3 pts per repeat, max -15) to prevent obsessive micro-action loops.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="font-bold text-emerald-300 block mb-1 font-mono text-xs">2. Outcome Feedback</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Boosts successfully completed routines (+4 pts) while penalizing recent failures, cancellations, or rejections (-6 pts).
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="font-bold text-amber-300 block mb-1 font-mono text-xs">3. Interaction Point Proximity</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Provides opportunism bonus (+3 to +6 pts) when physical interaction affordances (desks, gym equipment, food) are nearby.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="font-bold text-purple-300 block mb-1 font-mono text-xs">4. Routine Satiation</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Deprioritizes routines that were recently completed within the last 120 simulated minutes (-12 pts).
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 sm:col-span-2">
                    <span className="font-bold text-rose-300 block mb-1 font-mono text-xs">5. Post-Exertion Rest Adaptation</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Boosts rest and hydration (+8 pts) and penalizes heavy physical exertion (-10 pts) within 60 minutes after completing a workout.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: INTERNAL STATE & DRIVES */}
          {activeTab === 'drives' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Derived Cognitive Drives (Bio-Inspired Heuristics)
              </h3>

              {drives ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { name: 'Arousal / Activation', value: drives.arousal, icon: Flame, color: 'from-amber-500 to-orange-500' },
                    { name: 'Attentional Focus', value: drives.attentionalFocus, icon: Eye, color: 'from-blue-500 to-cyan-500' },
                    { name: 'Hunger Drive', value: drives.hungerDrive, icon: Activity, color: 'from-red-500 to-amber-500' },
                    { name: 'Rest / Sleep Drive', value: drives.restDrive, icon: BatteryCharging, color: 'from-purple-500 to-indigo-500' },
                    { name: 'Social Drive', value: drives.socialDrive, icon: Sparkles, color: 'from-pink-500 to-rose-500' },
                    { name: 'Effort Fatigue', value: drives.effortFatigue, icon: ShieldAlert, color: 'from-yellow-500 to-amber-600' },
                  ].map((drive, idx) => {
                    const Icon = drive.icon;
                    return (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-medium text-slate-300">
                            <Icon className="w-3.5 h-3.5 text-cyan-400" />
                            {drive.name}
                          </span>
                          <span className="font-mono font-bold text-white">{drive.value}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${drive.color} transition-all duration-300`}
                            style={{ width: `${drive.value}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-400">No drives computed.</p>
              )}

              {/* Needs Integration Notice */}
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Single Source of Truth:</strong> Drives are strictly derived from the existing <code className="text-cyan-300 font-mono">NeedsSystem</code>. No duplicate need state is maintained.
                </span>
              </div>
            </div>
          )}

          {/* TAB 7: SCHEDULE VS COGNITIVE COMPARISON */}
          {activeTab === 'comparison' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Schedule Baseline vs Cognitive Selector Decision
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Schedule Baseline */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    Schedule-Driven Baseline
                  </span>
                  <span className="text-sm font-bold text-white">
                    {comparison?.baselineScheduleDecision || 'None'}
                  </span>
                  <p className="text-xs text-slate-400 font-sans">
                    Deterministic activity dictated strictly by daily timetable slot.
                  </p>
                </div>

                {/* Cognitive Selector Decision */}
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/40 flex flex-col gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                    Cognitive Selector Choice
                  </span>
                  <span className="text-sm font-bold text-white">
                    {comparison?.cognitiveSelectorDecision || 'None'}
                  </span>
                  <p className="text-xs text-slate-400 font-sans">
                    Modulated sub-behavior chosen via utility scoring, attention, and physiological state.
                  </p>
                </div>
              </div>

              {/* Comparison Diagnosis */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1.5">
                <span className="font-mono uppercase text-[10px] text-slate-400 font-bold">
                  Divergence Analysis
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {comparison?.divergenceReason || 'Decisions are in synchronization.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 8: BIOLOGICAL CONNECTOME NEURAL BRAIN INTEGRATION */}
          {activeTab === 'connectome' && (
            <BiologicalConnectomeInspector />
          )}

        </div>
      </div>
    </div>
  );
};
