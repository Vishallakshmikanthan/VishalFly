import React, { useState } from 'react';
import {
  Home,
  Utensils,
  GraduationCap,
  Dumbbell,
  Sun,
  Building2,
  Compass,
  Camera,
  RotateCcw,
  Sparkles,
  MapPin,
  Eye,
  ChevronRight,
  Tv,
  Coffee,
  BookOpen
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { LocationId } from '../../types';
import { LOCATIONS } from '../../navigation/locationGraph';
import { NeedsMeters } from './NeedsMeters';
import { ActivityInspector } from './ActivityInspector';

interface RoomCameraPreset {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pos: [number, number, number];
  target: [number, number, number];
}

export const RoomFullInterfaceHUD: React.FC = () => {
  const currentLocation = useGameStore((state) => state.currentLocation);
  const switchLocation = useGameStore((state) => state.switchLocation);
  const currentSpot = useGameStore((state) => state.currentSpot);
  const setCurrentSpot = useGameStore((state) => state.setCurrentSpot);
  const setFlyPosition = useGameStore((state) => state.setFlyPosition);
  const setCustomCameraPose = useGameStore((state) => state.setCustomCameraPose);
  const triggerResetCamera = useGameStore((state) => state.triggerResetCamera);
  const cameraMode = useGameStore((state) => state.cameraMode);
  const setCameraMode = useGameStore((state) => state.setCameraMode);

  const [activePreset, setActivePreset] = useState<string>('overview');

  const locConfig = LOCATIONS[currentLocation] || LOCATIONS.bedroom;

  // Tailored camera perspectives for each room
  const cameraPresets: RoomCameraPreset[] = React.useMemo(() => {
    if (currentLocation === 'bedroom') {
      return [
        { id: 'overview', label: 'Full Room View', icon: Eye, pos: [6.8, 5.5, 6.8], target: [0, 1.2, 0] },
        { id: 'desk', label: 'Study Desk & Laptop', icon: Tv, pos: [3.4, 2.2, -1.2], target: [2.2, 1.1, -2.6] },
        { id: 'bed', label: 'Bed & Blanket', icon: Home, pos: [-0.8, 2.2, -0.8], target: [-2.2, 0.9, -2.1] },
        { id: 'balcony', label: 'Balcony Portal', icon: Sun, pos: [2.2, 2.4, -1.6], target: [1.9, 1.4, -4.5] },
      ];
    }
    if (currentLocation === 'dining') {
      return [
        { id: 'overview', label: 'Full Canteen View', icon: Eye, pos: [7.2, 5.8, 7.2], target: [0, 1.2, 0] },
        { id: 'buffet', label: 'Serving Counter', icon: Utensils, pos: [0.8, 2.2, -1.8], target: [-1.3, 1.2, -3.3] },
        { id: 'tables', label: 'Dining Tables', icon: Coffee, pos: [2.5, 2.4, 2.2], target: [0, 1.1, 0] },
        { id: 'kitchen', label: 'Kitchen & Water', icon: Sparkles, pos: [2.0, 2.4, 0.2], target: [3.3, 1.2, 1.6] },
      ];
    }
    if (currentLocation === 'classroom') {
      return [
        { id: 'overview', label: 'Full Hall View', icon: Eye, pos: [8.2, 6.8, 8.2], target: [0, 1.4, 0] },
        { id: 'stage', label: 'Teaching Stage & Podium', icon: GraduationCap, pos: [1.2, 2.5, -1.5], target: [0, 1.4, -3.2] },
        { id: 'desks', label: 'Student Tiered Desks', icon: BookOpen, pos: [3.2, 2.8, 3.2], target: [0, 1.2, 0] },
        { id: 'screen', label: 'Projector Screen', icon: Tv, pos: [0, 2.2, -1.5], target: [0, 2.5, -4.0] },
      ];
    }
    if (currentLocation === 'gym') {
      return [
        { id: 'overview', label: 'Full Gym View', icon: Eye, pos: [7.5, 6.2, 7.5], target: [0, 1.2, 0] },
        { id: 'bench', label: 'Bench Press Station', icon: Dumbbell, pos: [0.5, 2.0, 0.8], target: [-1.5, 0.9, -0.5] },
        { id: 'rack', label: 'Squat Power Rack', icon: Dumbbell, pos: [-0.8, 2.2, -1.0], target: [-2.2, 1.4, -2.5] },
        { id: 'weights', label: 'Dumbbell Rack & Turf', icon: Dumbbell, pos: [0.8, 2.2, -1.2], target: [2.2, 1.1, -2.5] },
      ];
    }
    return [
      { id: 'overview', label: 'Overview', icon: Eye, pos: [6.5, 5.5, 6.5], target: [0, 1.2, 0] },
    ];
  }, [currentLocation]);

  const handlePresetSelect = (preset: RoomCameraPreset) => {
    setActivePreset(preset.id);
    setCustomCameraPose({ pos: preset.pos, target: preset.target });
  };

  const navRooms: { id: LocationId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'metropolitan', label: 'Metropolis City', icon: Building2 },
    { id: 'bedroom', label: "My Room (204)", icon: Home },
    { id: 'dining', label: 'Canteen (Mess)', icon: Utensils },
    { id: 'classroom', label: 'Lecture Hall (CS-301)', icon: GraduationCap },
    { id: 'gym', label: 'Gym (PowerFit)', icon: Dumbbell },
    { id: 'balcony', label: 'Balcony', icon: Sun },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-10 p-3 md:p-5 flex flex-col justify-between select-none">
      {/* ============================================================= */}
      {/* TOP HEADER: ROOM IDENTITY, RETURN TO METROPOLIS & ROOM TABS   */}
      {/* ============================================================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        {/* Left: Active Room Banner */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          {/* Main Room Tag */}
          <div className="glass-panel px-3.5 py-2 rounded-2xl flex items-center gap-2.5 shadow-2xl border border-slate-700/80 bg-slate-900/90 backdrop-blur-xl">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {currentLocation === 'bedroom' && <Home className="w-4 h-4 text-amber-400" />}
              {currentLocation === 'dining' && <Utensils className="w-4 h-4 text-amber-400" />}
              {currentLocation === 'classroom' && <GraduationCap className="w-4 h-4 text-indigo-400" />}
              {currentLocation === 'gym' && <Dumbbell className="w-4 h-4 text-sky-400" />}
              {currentLocation === 'balcony' && <Sun className="w-4 h-4 text-amber-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white text-sm font-extrabold tracking-tight">
                  {locConfig.name}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Full Room Access
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {locConfig.subLocation}
              </p>
            </div>
          </div>

          {/* PROMINENT "RETURN TO METROPOLIS" BUTTON */}
          <button
            onClick={() => switchLocation('metropolitan')}
            className="group px-3.5 py-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-500/25 border border-sky-400/40 transition-all transform hover:scale-105 active:scale-95"
            title="Return to the full open-world Metropolitan City"
          >
            <Building2 className="w-4 h-4 text-sky-200 group-hover:animate-bounce shrink-0" />
            <span>Return to Metropolis</span>
          </button>
        </div>

        {/* Right: Quick Switch Room Tabs */}
        <div className="pointer-events-auto glass-panel p-1 rounded-2xl flex flex-wrap items-center gap-1 shadow-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          {navRooms.map((nr) => {
            const Icon = nr.icon;
            const isActive = currentLocation === nr.id;
            return (
              <button
                key={nr.id}
                onClick={() => switchLocation(nr.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title={`Switch to ${nr.label}`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{nr.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================= */}
      {/* MIDDLE ROW: HOTSPOTS PANEL (Left) & TELEMETRY (Right)         */}
      {/* ============================================================= */}
      <div className="flex justify-between items-end gap-4">
        {/* Bottom Left: Interactive Room Hotspots */}
        <div className="pointer-events-auto flex flex-col gap-2 max-w-xs">
          <div className="glass-panel p-3 rounded-2xl border border-slate-800/90 bg-slate-900/90 shadow-2xl backdrop-blur-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Room Hotspots
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Click to Fly
              </span>
            </div>

            <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
              {Object.entries(locConfig.waypoints || {}).map(([wpKey, coords]) => (
                <button
                  key={wpKey}
                  onClick={() => {
                    setFlyPosition([coords[0], coords[1] + 0.3, coords[2]]);
                    setCurrentSpot(`Hovering at ${wpKey.replace(/_/g, ' ')}`);
                  }}
                  className="px-2 py-1 rounded-lg text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors flex items-center justify-between"
                >
                  <span className="capitalize">{wpKey.replace(/_/g, ' ')}</span>
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                </button>
              ))}
            </div>
          </div>

          {/* Current Spot Pill */}
          <div className="glass-pill px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs text-slate-300 shadow-md">
            <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-400">Spot:</span>
            <span className="text-amber-200 font-medium truncate">{currentSpot}</span>
          </div>
        </div>

        {/* Bottom Right: Needs Meters & Fly Activity */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <ActivityInspector />
          <NeedsMeters />
        </div>
      </div>

      {/* ============================================================= */}
      {/* BOTTOM CENTER: CAMERA PERSPECTIVES TOOLBAR                    */}
      {/* ============================================================= */}
      <div className="pointer-events-auto mx-auto glass-panel p-1.5 rounded-2xl flex flex-wrap items-center justify-center gap-1.5 shadow-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl">
        <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
          <Camera className="w-3.5 h-3.5 text-sky-400" />
          Camera Views:
        </span>

        {/* Camera Preset Buttons */}
        {cameraPresets.map((cp) => {
          const Icon = cp.icon;
          const isSelected = activePreset === cp.id;
          return (
            <button
              key={cp.id}
              onClick={() => handlePresetSelect(cp)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 border border-sky-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{cp.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-slate-700 mx-1" />

        {/* Reset Camera Button */}
        <button
          onClick={() => {
            setActivePreset('overview');
            setCustomCameraPose(null);
            triggerResetCamera();
          }}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Reset Camera (Press R)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Orbit Mode Auto-Rotate Toggle */}
        <button
          onClick={() => setCameraMode(cameraMode === 'orbit' ? 'free' : 'orbit')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
            cameraMode === 'orbit'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Toggle 360 Auto-Rotate Orbit"
        >
          <span>360° Orbit</span>
        </button>
      </div>
    </div>
  );
};
