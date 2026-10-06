import React, { useState } from 'react';
import {
  Map,
  Users,
  Building2,
  Car,
  UserCheck,
  Play,
  Pause,
  Sun,
  Moon,
  Sunset,
  Cloud,
  CloudRain,
  CloudLightning,
  Eye,
  EyeOff,
  MapPin,
  Camera,
  Target,
  RefreshCw,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { MetropolitanLayers, LocationId, SimulationSpeed } from '../../types';
import { LOCATIONS } from '../../navigation/locationGraph';

interface LayerItem {
  id: keyof MetropolitanLayers;
  label: string;
  color: string;
}

const LAYER_ITEMS: LayerItem[] = [
  { id: 'roads', label: 'Roads & Traffic', color: '#64748b' },
  { id: 'buildings', label: 'Buildings', color: '#3b82f6' },
  { id: 'residential', label: 'Residential', color: '#f97316' },
  { id: 'commercial', label: 'Commercial (Malls/Shops)', color: '#ec4899' },
  { id: 'industrial', label: 'Industrial', color: '#64748b' },
  { id: 'parks', label: 'Parks & Green Spaces', color: '#22c55e' },
  { id: 'water', label: 'Water Bodies', color: '#06b6d4' },
  { id: 'publicServices', label: 'Public Services', color: '#a855f7' },
  { id: 'people', label: 'People (Agents)', color: '#f43f5e' },
  { id: 'vehicles', label: 'Vehicles', color: '#eab308' },
  { id: 'transit', label: 'Transit (Metro/Bus)', color: '#8b5cf6' },
];

export const MetropolitanHUD: React.FC = () => {
  const simulationClock = useGameStore((state) => state.simulationClock);
  const simulatedTime = useGameStore((state) => state.simulatedTime);
  const togglePauseSimulation = useGameStore((state) => state.togglePauseSimulation);
  const setSimulationSpeed = useGameStore((state) => state.setSimulationSpeed);
  const setTime = useGameStore((state) => state.setTime);
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const setTimeOfDay = useGameStore((state) => state.setTimeOfDay);
  const weather = useGameStore((state) => state.weather);
  const setWeather = useGameStore((state) => state.setWeather);
  const currentLocation = useGameStore((state) => state.currentLocation);
  const switchLocation = useGameStore((state) => state.switchLocation);

  const metropolitanLayers = useGameStore((state) => state.metropolitanLayers);
  const toggleMetropolitanLayer = useGameStore((state) => state.toggleMetropolitanLayer);

  const showLabels = useGameStore((state) => state.showLabels);
  const toggleShowLabels = useGameStore((state) => state.toggleShowLabels);

  const cameraMode = useGameStore((state) => state.cameraMode);
  const setCameraMode = useGameStore((state) => state.setCameraMode);
  const triggerResetCamera = useGameStore((state) => state.triggerResetCamera);

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Time slider calculations (convert HH:MM to minutes 0..1440)
  const [hours, minutes] = (simulatedTime || '07:49').split(':').map(Number);
  const currentMinutes = (hours || 7) * 60 + (minutes || 49);

  const handleTimeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mins = Number(e.target.value);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    setTime(timeStr);
  };

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `VishalFly_Metropolis_${simulatedTime.replace(':', '_')}.png`;
      a.click();
    }
  };

  const speeds: SimulationSpeed[] = [1, 2, 4, 8];

  return (
    <div className="absolute inset-0 pointer-events-none z-10 p-4 md:p-6 flex flex-col justify-between select-none">
      {/* ========================================================= */}
      {/* TOP ROW: CITY OVERVIEW (Left) & LAYERS CARD (Right)       */}
      {/* ========================================================= */}
      <div className="flex justify-between items-start gap-4">
        {/* TOP LEFT: City Overview Card (Matching Reference Image) */}
        <div className="pointer-events-auto bg-[#0b0f19]/85 border border-slate-800/90 rounded-2xl p-4 shadow-2xl backdrop-blur-xl w-64 md:w-72 flex flex-col gap-3 transition-all hover:border-slate-700">
          <h2 className="text-white text-sm font-bold tracking-tight flex items-center justify-between">
            <span>City Overview</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/25">
              Live
            </span>
          </h2>

          <div className="flex flex-col gap-2.5 text-xs">
            {/* Area */}
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2 text-slate-400">
                <Map className="w-3.5 h-3.5 text-slate-400" />
                Area
              </span>
              <span className="font-semibold text-slate-100">6 km × 6 km</span>
            </div>

            {/* Population */}
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2 text-slate-400">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Population
              </span>
              <span className="font-semibold text-slate-100">50,000 (dynamic)</span>
            </div>

            {/* Buildings */}
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2 text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Buildings
              </span>
              <span className="font-semibold text-slate-100">1,200+</span>
            </div>

            {/* Vehicles */}
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2 text-slate-400">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                Vehicles
              </span>
              <span className="font-semibold text-slate-100">800+ (dynamic)</span>
            </div>

            {/* People (Agents) */}
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2 text-slate-400">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                People (Agents)
              </span>
              <span className="font-semibold text-slate-100">2,000+ (dynamic)</span>
            </div>
          </div>
        </div>

        {/* TOP RIGHT: Layers Control Card (Matching Reference Image) */}
        <div className="pointer-events-auto bg-[#0b0f19]/85 border border-slate-800/90 rounded-2xl p-4 shadow-2xl backdrop-blur-xl w-60 md:w-68 flex flex-col gap-2.5 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-sm font-bold tracking-tight">Layers</h2>
            <span className="text-[10px] text-slate-400 font-mono">
              {Object.values(metropolitanLayers).filter(Boolean).length}/{LAYER_ITEMS.length}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[340px] overflow-y-auto pr-1">
            {LAYER_ITEMS.map((layer) => {
              const isEnabled = metropolitanLayers[layer.id];
              return (
                <button
                  key={layer.id}
                  onClick={() => toggleMetropolitanLayer(layer.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    isEnabled
                      ? 'bg-slate-900/60 text-slate-200 hover:bg-slate-800/80'
                      : 'bg-transparent text-slate-500 hover:bg-slate-900/30 line-through'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform shadow-sm"
                      style={{ backgroundColor: isEnabled ? layer.color : '#334155' }}
                    />
                    <span className="truncate">{layer.label}</span>
                  </div>
                  {isEnabled ? (
                    <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-white shrink-0 ml-1" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-600 shrink-0 ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM ROW: SIMULATION CONTROLS (Left) & TOOLBAR (Center)  */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row items-end md:items-end justify-between gap-4 mt-auto">
        {/* BOTTOM LEFT: Simulation Controls Card with Time Slider */}
        <div className="pointer-events-auto bg-[#0b0f19]/85 border border-slate-800/90 rounded-2xl p-4 shadow-2xl backdrop-blur-xl w-72 md:w-80 flex flex-col gap-3 transition-all hover:border-slate-700">
          <h2 className="text-white text-sm font-bold tracking-tight">Simulation Controls</h2>

          {/* Speed & Pause Row */}
          <div className="flex items-center gap-1.5">
            {/* Play / Pause */}
            <button
              onClick={togglePauseSimulation}
              className={`p-2 rounded-xl transition-all ${
                simulationClock.isPaused
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                  : 'bg-slate-900/90 text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
              title={simulationClock.isPaused ? 'Resume Simulation' : 'Pause Simulation'}
            >
              {simulationClock.isPaused ? (
                <Play className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Pause className="w-3.5 h-3.5 fill-current" />
              )}
            </button>

            {/* Speeds: 1x, 2x, 4x, 8x */}
            {speeds.map((s) => {
              const isActive = simulationClock.speed === s;
              return (
                <button
                  key={s}
                  onClick={() => setSimulationSpeed(s)}
                  className={`flex-1 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800/80'
                  }`}
                >
                  {s}x
                </button>
              );
            })}
          </div>

          {/* Time of Day Quick Presets */}
          <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-800/60">
            {(
              [
                { id: 'morning', label: 'Morning', icon: Sun },
                { id: 'afternoon', label: 'Noon', icon: Sun },
                { id: 'evening', label: 'Evening', icon: Sunset },
                { id: 'night', label: 'Night', icon: Moon },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              const isSelected = timeOfDay === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTimeOfDay(t.id)}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-semibold transition-all border ${
                    isSelected
                      ? 'bg-amber-500/25 text-amber-300 border-amber-500/60 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border-slate-800/80'
                  }`}
                  title={`Switch to ${t.label}`}
                >
                  <Icon className="w-3.5 h-3.5 mb-0.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Time of Day Slider */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 shrink-0 flex items-center gap-1 text-[11px]">
              <span>Clock</span>
              <Sun className="w-3 h-3 text-amber-400" />
            </span>

            <input
              type="range"
              min="0"
              max="1439"
              step="5"
              value={currentMinutes}
              onChange={handleTimeSliderChange}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />

            <span className="font-mono text-amber-300 font-bold shrink-0 text-xs">
              {simulatedTime}
            </span>
          </div>

          {/* Weather Season & Dynamics Controls */}
          <div className="flex flex-col gap-1 pt-1 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
              <span>Weather Dynamics</span>
              <span className="text-amber-400 capitalize font-medium">{weather}</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(
                [
                  { id: 'clear', label: 'Clear', icon: Sun },
                  { id: 'cloudy', label: 'Cloudy', icon: Cloud },
                  { id: 'rainy', label: 'Rainy', icon: CloudRain },
                  { id: 'stormy', label: 'Storm', icon: CloudLightning },
                ] as const
              ).map((w) => {
                const Icon = w.icon;
                const isSelected = weather === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setWeather(w.id)}
                    className={`flex items-center justify-center gap-1 py-1 px-1 rounded-xl text-[10px] font-semibold transition-all border ${
                      isSelected
                        ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/60 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border-slate-800/80'
                    }`}
                    title={`Set Weather: ${w.label}`}
                  >
                    <Icon className="w-3 h-3 shrink-0" />
                    <span>{w.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM CENTER / RIGHT: Bottom Toolbar (Matching Reference Image) */}
        <div className="pointer-events-auto bg-[#0b0f19]/85 border border-slate-800/90 rounded-2xl px-4 py-2.5 shadow-2xl backdrop-blur-xl flex flex-wrap items-center gap-3">
          {/* Location Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-amber-300 border border-amber-500/40 hover:bg-slate-800 flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{LOCATIONS[currentLocation]?.name || 'Metropolitan City'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLocationDropdown && (
              <div className="absolute bottom-full left-0 mb-2 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1 z-50 flex flex-col gap-0.5">
                {Object.keys(LOCATIONS).map((locKey) => {
                  const loc = LOCATIONS[locKey as LocationId];
                  const isSelected = currentLocation === locKey;
                  return (
                    <button
                      key={locKey}
                      onClick={() => {
                        switchLocation(locKey as LocationId);
                        setShowLocationDropdown(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{loc.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Camera Buttons: Free Camera, Follow Fly, Orbit */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <button
              onClick={() => setCameraMode('free')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
                cameraMode === 'free'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Free Camera</span>
            </button>

            <button
              onClick={() => setCameraMode('follow')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
                cameraMode === 'follow'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Follow Fly</span>
            </button>

            <button
              onClick={() => setCameraMode('orbit')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
                cameraMode === 'orbit'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Orbit</span>
            </button>
          </div>

          {/* Reset View Button */}
          <button
            onClick={triggerResetCamera}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
            title="Reset to Isometric Aerial View"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset View</span>
          </button>

          {/* Show Labels Toggle Switch */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-slate-300 font-medium">Show Labels</span>
            <button
              onClick={toggleShowLabels}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                showLabels ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  showLabels ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Screenshot Button */}
          <button
            onClick={handleScreenshot}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
            title="Capture High-Res View Screenshot"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>Screenshot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
