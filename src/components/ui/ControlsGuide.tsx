import React, { useState } from 'react';
import { Gamepad2, MousePointer, ChevronUp, ChevronDown } from 'lucide-react';

export const ControlsGuide: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-5 left-5 z-10 pointer-events-auto">
      <div className="glass-panel rounded-xl overflow-hidden transition-all duration-300 w-64 md:w-72">
        {/* Header Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-slate-900/40"
        >
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Flight & Camera Controls</span>
          </div>
          {collapsed ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {/* Collapsible Content */}
        {!collapsed && (
          <div className="p-3.5 space-y-2.5 text-xs">
            {/* Fly movement */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Fly Horizontal</span>
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">W</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">A</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">S</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">D</kbd>
              </div>
            </div>

            {/* Altitude */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Fly Ascend / Descend</span>
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">Space</kbd>
                <span className="text-slate-500">/</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">Shift</kbd>
              </div>
            </div>

            <div className="h-px bg-slate-800/80 my-1.5" />

            {/* Orbit / Zoom */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Orbit Room</span>
              <span className="font-mono text-[11px] text-slate-300 flex items-center gap-1">
                <MousePointer className="w-3 h-3 text-slate-400" /> Left Drag
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Zoom In / Out</span>
              <span className="font-mono text-[11px] text-slate-300">
                Mouse Wheel
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
