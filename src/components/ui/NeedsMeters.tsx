import React, { useState } from 'react';
import { Zap, Utensils, Moon, Dumbbell, Brain, Users, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const NeedsMeters: React.FC = () => {
  const needs = useGameStore((state) => state.needs);
  const [collapsed, setCollapsed] = useState(false);

  const meters = [
    {
      id: 'energy',
      label: 'Energy',
      value: Math.round(needs.energy),
      icon: Zap,
      goodHigh: true,
      color: needs.energy > 50 ? 'from-emerald-500 to-teal-400' : needs.energy > 25 ? 'from-amber-500 to-yellow-400' : 'from-rose-500 to-red-400',
      textColor: needs.energy > 50 ? 'text-emerald-400' : needs.energy > 25 ? 'text-amber-400' : 'text-rose-400',
      isWarning: needs.energy <= 25,
    },
    {
      id: 'hunger',
      label: 'Hunger',
      value: Math.round(needs.hunger),
      icon: Utensils,
      goodHigh: false,
      color: needs.hunger < 50 ? 'from-emerald-500 to-teal-400' : needs.hunger < 75 ? 'from-amber-500 to-yellow-400' : 'from-rose-500 to-red-400',
      textColor: needs.hunger < 50 ? 'text-emerald-400' : needs.hunger < 75 ? 'text-amber-400' : 'text-rose-400',
      isWarning: needs.hunger >= 75,
    },
    {
      id: 'sleepiness',
      label: 'Sleepiness',
      value: Math.round(needs.sleepiness),
      icon: Moon,
      goodHigh: false,
      color: needs.sleepiness < 50 ? 'from-sky-500 to-cyan-400' : needs.sleepiness < 75 ? 'from-amber-500 to-yellow-400' : 'from-rose-500 to-red-400',
      textColor: needs.sleepiness < 50 ? 'text-sky-400' : needs.sleepiness < 75 ? 'text-amber-400' : 'text-rose-400',
      isWarning: needs.sleepiness >= 75,
    },
    {
      id: 'fatigue',
      label: 'Fatigue',
      value: Math.round(needs.fatigue),
      icon: Dumbbell,
      goodHigh: false,
      color: needs.fatigue < 50 ? 'from-blue-500 to-indigo-400' : needs.fatigue < 75 ? 'from-amber-500 to-yellow-400' : 'from-rose-500 to-red-400',
      textColor: needs.fatigue < 50 ? 'text-blue-400' : needs.fatigue < 75 ? 'text-amber-400' : 'text-rose-400',
      isWarning: needs.fatigue >= 75,
    },
    {
      id: 'focus',
      label: 'Focus',
      value: Math.round(needs.focus),
      icon: Brain,
      goodHigh: true,
      color: needs.focus > 50 ? 'from-purple-500 to-pink-400' : needs.focus > 25 ? 'from-amber-500 to-yellow-400' : 'from-rose-500 to-red-400',
      textColor: needs.focus > 50 ? 'text-purple-400' : needs.focus > 25 ? 'text-amber-400' : 'text-rose-400',
      isWarning: needs.focus <= 25,
    },
    {
      id: 'socialNeed',
      label: 'Social',
      value: Math.round(needs.socialNeed),
      icon: Users,
      goodHigh: false,
      color: needs.socialNeed < 50 ? 'from-pink-500 to-rose-400' : needs.socialNeed < 75 ? 'from-amber-500 to-yellow-400' : 'from-rose-500 to-red-500',
      textColor: needs.socialNeed < 50 ? 'text-pink-400' : needs.socialNeed < 75 ? 'text-amber-400' : 'text-rose-400',
      isWarning: needs.socialNeed >= 75,
    },
  ];

  const anyWarning = meters.some((m) => m.isWarning);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden pointer-events-auto transition-all duration-300 w-72 sm:w-80 shadow-2xl border border-slate-700/60">
      {/* Header Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-3.5 py-2 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-slate-900/50"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="tracking-wide">Simulated Needs</span>
          {anyWarning && (
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 bg-rose-500/15 px-1.5 py-0.2 rounded border border-rose-500/30">
              <AlertCircle className="w-2.5 h-2.5" /> Alert
            </span>
          )}
        </div>
        {collapsed ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>

      {/* Gauges */}
      {!collapsed && (
        <div className="p-3 grid grid-cols-2 gap-2 text-xs">
          {meters.map((meter) => {
            const Icon = meter.icon;
            return (
              <div
                key={meter.id}
                className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Icon className="w-3 h-3 text-slate-400" />
                    <span>{meter.label}</span>
                  </span>
                  <span className={`font-mono font-bold ${meter.textColor}`}>
                    {meter.value}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${meter.color} transition-all duration-300`}
                    style={{ width: `${meter.value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
