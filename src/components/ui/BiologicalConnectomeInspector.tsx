/**
 * VISHALFLY — Biological Connectome Inspector Component
 * 
 * Provides real-time inspection, biophysical telemetry, and interactive controls
 * for the biological neural dynamics simulation grounded in Janelia FlyEM MaleCNS v1.0.
 */

import React, { useState } from 'react';
import {
  Brain,
  Zap,
  Activity,
  ShieldCheck,
  Flame,
  Cpu,
  Layers,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { ControllerMode } from '../../cognition/connectome/types';
import loomingCircuitData from '../../cognition/connectome/data/looming_escape_circuit.json';
import manifestData from '../../cognition/connectome/data/male_cns_manifest.json';

export const BiologicalConnectomeInspector: React.FC = () => {
  const controllerMode = useGameStore((state) => state.controllerMode);
  const setControllerMode = useGameStore((state) => state.setControllerMode);
  const connectomeSnapshot = useGameStore((state) => state.connectomeSnapshot);
  const triggerConnectomeThreat = useGameStore((state) => state.triggerConnectomeThreat);

  const [selectedSubTab, setSelectedSubTab] = useState<'activity' | 'circuit' | 'provenance' | 'parameters'>('activity');

  const neurons = loomingCircuitData.neurons;
  const synapses = loomingCircuitData.synapses;
  const stats = loomingCircuitData.statistics;

  const motorOutputs = connectomeSnapshot?.motorOutputs;
  const isEscapeActive = motorOutputs?.dnEscapeSpike || (motorOutputs?.dnEscapeRate ?? 0) > 18.0;

  const getNTColor = (nt: string) => {
    switch (nt.toLowerCase()) {
      case 'acetylcholine':
      case 'ach':
        return {
          bg: 'bg-emerald-500/20',
          text: 'text-emerald-300',
          border: 'border-emerald-500/40',
          name: 'ACh (Excitatory)',
        };
      case 'gaba':
        return {
          bg: 'bg-rose-500/20',
          text: 'text-rose-300',
          border: 'border-rose-500/40',
          name: 'GABA (Inhibitory)',
        };
      case 'glutamate':
      case 'glu':
        return {
          bg: 'bg-cyan-500/20',
          text: 'text-cyan-300',
          border: 'border-cyan-500/40',
          name: 'Glu (Inhibitory in CNS)',
        };
      default:
        return {
          bg: 'bg-slate-700/40',
          text: 'text-slate-300',
          border: 'border-slate-600',
          name: nt,
        };
    }
  };

  return (
    <div className="flex flex-col gap-4 text-xs font-sans text-slate-200">
      
      {/* 1. Controller Mode Selector Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
            Active Character Flight Brain Controller
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Brain className={`w-4 h-4 ${controllerMode === 'connectome' ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              {controllerMode === 'connectome' && 'Biological Connectome (LIF Dynamics)'}
              {controllerMode === 'cognitive' && 'Cognitive-Utility Decision Architecture'}
              {controllerMode === 'schedule' && 'Schedule-Driven Timetable Navigation'}
              {controllerMode === 'manual' && 'Manual Flight (WASD / Keyboard)'}
            </span>
          </div>
        </div>

        {/* Controller Mode Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'connectome', label: 'Connectome (LIF)', color: 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300' },
              { id: 'cognitive', label: 'Cognitive Utility', color: 'border-cyan-500/60 bg-cyan-500/20 text-cyan-300' },
              { id: 'schedule', label: 'Schedule', color: 'border-amber-500/60 bg-amber-500/20 text-amber-300' },
              { id: 'manual', label: 'Manual Flight', color: 'border-purple-500/60 bg-purple-500/20 text-purple-300' },
            ] as const
          ).map((m) => {
            const isActive = controllerMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setControllerMode(m.id as ControllerMode)}
                className={`px-3 py-1.5 rounded-lg border font-mono text-[11px] font-semibold transition-all ${
                  isActive
                    ? m.color + ' shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Stimulus Trigger & Real-time Escape Alert */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3">
          <div>
            <span className="font-bold text-white text-xs block">Visual Looming Collision Stimulus</span>
            <span className="text-[11px] text-slate-400">
              Injects optical looming signal into Lamina L2, activating LC4 and Giant Fiber (DNp01).
            </span>
          </div>
          <button
            onClick={triggerConnectomeThreat}
            className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold font-mono flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            Trigger Threat
          </button>
        </div>

        {/* Escape Reflex Status */}
        <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
          isEscapeActive
            ? 'bg-rose-950/40 border-rose-500/60 text-rose-200 animate-pulse'
            : 'bg-slate-900/70 border-slate-800 text-slate-400'
        }`}>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider block">Giant Fiber Reflex</span>
            <span className="text-xs font-bold text-white">
              {isEscapeActive ? 'ESCAPE TAKEOFF ACTIVE' : 'Normal Cruising Tone'}
            </span>
          </div>
          <Zap className={`w-5 h-5 ${isEscapeActive ? 'text-rose-400' : 'text-slate-600'}`} />
        </div>
      </div>

      {/* 3. Sub-tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-2 pb-1 text-xs">
        {[
          { id: 'activity', label: `Neural Activity (${neurons.length} Neurons)`, icon: Activity },
          { id: 'circuit', label: `Circuit Wiring (${synapses.length} Synapses)`, icon: Layers },
          { id: 'parameters', label: 'Model Parameters', icon: Cpu },
          { id: 'provenance', label: 'Biological Provenance', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: LIVE NEURAL ACTIVITY GRID */}
      {selectedSubTab === 'activity' && (
        <div className="flex flex-col gap-3">
          {/* Telemetry bar */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
            <div className="flex items-center gap-4">
              <span>Sim Time: <strong className="text-cyan-300">{connectomeSnapshot?.simTimeMs ?? 0} ms</strong></span>
              <span>Steps: <strong className="text-slate-300">{connectomeSnapshot?.stepCount ?? 0}</strong></span>
              <span>Compute Latency: <strong className="text-emerald-400">{(connectomeSnapshot?.computeLatencyMs ?? 0).toFixed(3)} ms</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span>Giant Fiber: <strong className="text-amber-400">{motorOutputs?.dnEscapeRate ?? 0} Hz</strong></span>
              <span>Steering Yaw: <strong className="text-cyan-400">{motorOutputs?.dnSteerYaw ?? 0}</strong></span>
            </div>
          </div>

          {/* Neurons Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Neuron ID</th>
                  <th className="p-2.5">Type &amp; Side</th>
                  <th className="p-2.5">Superclass</th>
                  <th className="p-2.5">Neurotransmitter</th>
                  <th className="p-2.5">Membrane Potential (mV)</th>
                  <th className="p-2.5">Firing Rate</th>
                  <th className="p-2.5 text-right">Spike</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {neurons.map((neuron) => {
                  const ntStyle = getNTColor(neuron.neurotransmitter);
                  const vm = connectomeSnapshot?.potentials?.[neuron.bodyId] ?? -60.0;
                  const rate = connectomeSnapshot?.firingRates?.[neuron.bodyId] ?? 0.0;
                  const hasSpiked = connectomeSnapshot?.recentSpikes?.includes(neuron.bodyId) ?? false;

                  // Normalize Vm from -75mV (0%) to -45mV (100%)
                  const vmPercent = Math.min(100, Math.max(0, ((vm + 75) / 30) * 100));

                  return (
                    <tr
                      key={neuron.bodyId}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        hasSpiked ? 'bg-cyan-500/20 font-bold text-white' : 'text-slate-300'
                      }`}
                    >
                      <td className="p-2.5 text-slate-400">{neuron.bodyId}</td>
                      <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                        <span>{neuron.type}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({neuron.instance})</span>
                      </td>
                      <td className="p-2.5 text-slate-400 font-sans text-[11px] capitalize">
                        {neuron.superclass.replace(/_/g, ' ')}
                      </td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] border ${ntStyle.bg} ${ntStyle.text} ${ntStyle.border}`}>
                          {ntStyle.name}
                        </span>
                      </td>
                      <td className="p-2.5 w-44">
                        <div className="flex items-center gap-2">
                          <span className="w-12 text-right">{vm.toFixed(1)}</span>
                          <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-150"
                              style={{ width: `${vmPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-2.5">
                        <span className={rate > 5 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                          {rate.toFixed(1)} Hz
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        {hasSpiked ? (
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                        ) : (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-700" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: CIRCUIT WIRING DIAGRAM & SYNAPSE TABLE */}
      {selectedSubTab === 'circuit' && (
        <div className="flex flex-col gap-4">
          {/* Pathway Flow Diagram */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3 font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-cyan-300 uppercase text-xs">
                Verified Sensorimotor Synaptic Pathway:
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                {stats.totalSynapticConnections} total synaptic connections ({stats.excitatoryCount} excitatory ACh, {stats.inhibitoryCount} inhibitory GABA/Glu)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase block">1. Lamina Monopolar</span>
                <span className="font-bold text-white text-sm">L1 / L2</span>
                <p className="text-[10px] text-slate-400 font-sans mt-1">Luminance &amp; OFF-edge looming stimulus input</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase block">2. Medulla Columns</span>
                <span className="font-bold text-emerald-400 text-sm">Tm2 / Tm3 / Tm4 / T2</span>
                <p className="text-[10px] text-slate-400 font-sans mt-1">Spatial motion &amp; contrast convergence (ACh)</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase block">3. Lobula Threat Detector</span>
                <span className="font-bold text-amber-400 text-sm">LC4</span>
                <p className="text-[10px] text-slate-400 font-sans mt-1">Looming expansion detector firing before impact</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase block">4. Descending Premotor</span>
                <span className="font-bold text-rose-400 text-sm">DNp01 / DNp11</span>
                <p className="text-[10px] text-slate-400 font-sans mt-1">Giant Fiber jump take-off &amp; bank steering</p>
              </div>
            </div>
          </div>

          {/* Synapses Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Presynaptic Body</th>
                  <th className="p-2.5">Postsynaptic Body</th>
                  <th className="p-2.5">Synapse Count (EM)</th>
                  <th className="p-2.5">Neurotransmitter</th>
                  <th className="p-2.5">Sign</th>
                  <th className="p-2.5">Data Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {synapses.slice(0, 15).map((syn, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 text-slate-300">
                    <td className="p-2.5 font-bold text-white">{syn.preType} ({syn.preBodyId})</td>
                    <td className="p-2.5 font-bold text-white">{syn.postType} ({syn.postBodyId})</td>
                    <td className="p-2.5 text-cyan-300 font-bold">{syn.synapseCount}</td>
                    <td className="p-2.5 capitalize">{syn.neurotransmitter}</td>
                    <td className="p-2.5">
                      {syn.synapseSign > 0 ? (
                        <span className="text-emerald-400 font-bold">+ Excitatory</span>
                      ) : (
                        <span className="text-rose-400 font-bold">- Inhibitory</span>
                      )}
                    </td>
                    <td className="p-2.5 text-slate-400 text-[10px] font-sans">{syn.dataSource}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {synapses.length > 15 && (
            <span className="text-slate-500 italic text-[11px] text-right font-mono">
              Showing top 15 of {synapses.length} verified synaptic connections.
            </span>
          )}
        </div>
      )}

      {/* SUBTAB 3: MODEL PARAMETERS AUDIT */}
      {selectedSubTab === 'parameters' && (
        <div className="flex flex-col gap-4 font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="font-bold text-emerald-300 font-mono text-xs uppercase block mb-1">
                [A] Directly Measured Biological Parameters
              </span>
              <ul className="list-disc pl-4 text-slate-300 space-y-1 text-[11px]">
                <li>211,577 neuron bodies with EM spatial coordinates (nm).</li>
                <li>Synapse counts directly counted from serial section EM.</li>
                <li>Consensus neurotransmitters (ACh, GABA, Glu) with RNASeq and FISH ground-truth validation.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="font-bold text-cyan-300 font-mono text-xs uppercase block mb-1">
                [B] Derived Biophysical Quantities
              </span>
              <ul className="list-disc pl-4 text-slate-300 space-y-1 text-[11px]">
                <li>Synaptic conductance scaled by EM synapse count: g_syn = weight * g_unit.</li>
                <li>Synaptic reversal potentials: ACh (E_rev = 0 mV), GABA/Glu (E_rev = -70 mV).</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="font-bold text-amber-300 font-mono text-xs uppercase block mb-1">
                [C] Computational Assumptions (LIF Model)
              </span>
              <ul className="list-disc pl-4 text-slate-300 space-y-1 text-[11px]">
                <li>Membrane time constant tau_m = 15.0 ms.</li>
                <li>Resting potential V_rest = -60.0 mV, Spike threshold V_th = -50.0 mV.</li>
                <li>Reset potential V_reset = -65.0 mV, Refractory period tau_ref = 2.0 ms.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="font-bold text-rose-300 font-mono text-xs uppercase block mb-1">
                [D] Unmodeled Biology
              </span>
              <ul className="list-disc pl-4 text-slate-300 space-y-1 text-[11px]">
                <li>Non-linear dendritic arborization cable attenuation.</li>
                <li>Metabotropic second-messenger cascades.</li>
                <li>Electrical gap junctions (innexins).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: BIOLOGICAL PROVENANCE */}
      {selectedSubTab === 'provenance' && (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-2">
            <span className="font-bold text-emerald-300 font-mono text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Biological Connectome Provenance &amp; Integrity
            </span>
            <p className="text-slate-300 text-xs leading-relaxed">
              Every neuron ID, connection count, and neurotransmitter in this circuit is ingested directly from the official Janelia FlyEM MaleCNS v1.0 and Reiser Lab datasets. No synaptic connections or biological parameters are fabricated.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Dataset Version:</span>
              <span className="text-white font-bold">{manifestData.project}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">License:</span>
              <span className="text-cyan-300">{manifestData.license}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Primary Citation:</span>
              <span className="text-white font-sans text-[11px] text-right max-w-lg">{manifestData.scientificCitation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Visual System Citation:</span>
              <span className="text-white font-sans text-[11px] text-right max-w-lg">{manifestData.reiserCitation}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
