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
  BookOpen, 
  Layers, 
  Info,
  Flame,
  BatteryCharging,
  Eye
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

interface CognitiveInspectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CognitiveInspector: React.FC<CognitiveInspectorProps> = ({ isOpen, onClose }) => {
  const isCognitionEnabled = useGameStore((state) => state.isCognitionEnabled);
  const toggleCognition = useGameStore((state) => state.toggleCognition);
  const cognitiveData = useGameStore((state) => state.cognitiveInspectorData);
  const currentActivity = useGameStore((state) => state.currentActivity);

  const [activeTab, setActiveTab] = useState<'decision' | 'candidates' | 'drives' | 'memory' | 'comparison' | 'connectome'>('decision');

  if (!isOpen) return null;

  const internalState = cognitiveData?.internalState;
  const drives = internalState?.drives;
  const lastDecision = cognitiveData?.lastDecision;
  const evaluations = cognitiveData?.evaluations || [];
  const rejected = cognitiveData?.rejectedCandidates || [];
  const memory = cognitiveData?.recentMemory || [];
  const comparison = cognitiveData?.comparison;
  const connectome = cognitiveData?.connectomeStatus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-md pointer-events-auto">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-2xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/40 flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-700/60 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  Connectome Cognitive Inspector
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                    Milestone 6
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Real-time sensory integration, candidate utility scoring & explainability
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Toggle Button */}
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
                  <span>Cognitive Mode: ACTIVE</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-slate-400" />
                  <span>Cognitive Mode: BYPASSED</span>
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
            { id: 'decision', label: 'Decision & Explanation', icon: Sparkles },
            { id: 'candidates', label: 'Candidate Registry', icon: Layers },
            { id: 'drives', label: 'Internal State & Drives', icon: Zap },
            { id: 'comparison', label: 'Schedule vs Cognitive', icon: Compass },
            { id: 'memory', label: 'Cognitive Memory', icon: History },
            { id: 'connectome', label: 'Connectome Adapter', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
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
        <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(90vh-130px)] text-xs">
          
          {/* TAB 1: DECISION & EXPLANATION */}
          {activeTab === 'decision' && (
            <div className="flex flex-col gap-4">
              {/* Status Banner */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">
                    Current High-Level Goal
                  </span>
                  <span className="text-sm font-bold text-white">
                    {internalState?.currentGoal || 'Autonomous Routine'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
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
                      Hysteresis Commitment
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

              {/* Rejected Candidates & Safety Guards */}
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Disqualified Candidates & Safety Guard Interventions ({rejected.length})
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
                  Behavior Candidates Registry & Scoring Breakdown
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
                      <th className="p-2.5 text-right font-bold text-cyan-300">Final Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {evaluations.map((ev) => {
                      const isWinner = ev.candidateId === lastDecision?.selectedCandidateId;
                      return (
                        <tr 
                          key={ev.candidateId} 
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isWinner ? 'bg-cyan-500/15 font-semibold text-white' : 'text-slate-300'
                          }`}
                        >
                          <td className="p-2.5 font-medium flex items-center gap-1.5">
                            {isWinner && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                            {ev.candidateName}
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

          {/* TAB 3: INTERNAL STATE & DRIVES */}
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

          {/* TAB 4: SCHEDULE VS COGNITIVE COMPARISON */}
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

          {/* TAB 5: COGNITIVE MEMORY */}
          {activeTab === 'memory' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-cyan-400" />
                  Bounded Working & Episodic Memory ({memory.length} Records)
                </h3>
                <span className="text-slate-400 text-[11px] font-mono">
                  Capacity: 50 Records max
                </span>
              </div>

              {memory.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {memory.slice().reverse().map((rec) => (
                    <div 
                      key={rec.id}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 font-mono text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{rec.timestamp}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 capitalize border border-slate-700">
                          {rec.category}
                        </span>
                        <span className="text-white font-medium">{rec.value}</span>
                      </div>
                      <span className="text-slate-400 text-[10px]">
                        Salience: {Math.round(rec.salience * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No memory records logged yet.</p>
              )}
            </div>
          )}

          {/* TAB 6: CONNECTOME ADAPTER & SCIENTIFIC STATUS */}
          {activeTab === 'connectome' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Scientific Honesty & Boundary Declaration</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  This architecture is inspired by Drosophila neuroethological circuits (central complex navigation and mushroom body associative memory abstractions). 
                  <strong> No real biological connectome data file from the MaleCNS dataset is bundled or simulated</strong>. The adapter interface defines structural schemas and verified neuropil taxonomy from published literature for future dataset ingestion.
                </p>
              </div>

              {connectome && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dataset Adapter Reference:</span>
                    <span className="text-cyan-300 font-bold">{connectome.dataset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Real Biological Data Imported:</span>
                    <span className="text-amber-400 font-bold">
                      {connectome.isRealDataImported ? 'YES' : 'NO (Synthetic Structural Fixture)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Neuropils Defined:</span>
                    <span className="text-white">{connectome.neuropilsCount} Anatomical Centers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exemplar Circuits:</span>
                    <span className="text-white">{connectome.circuitsCount} Pathway Schemas</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-slate-400 text-[11px] font-sans">
                    <strong>Provenance: </strong>{connectome.provenance}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
