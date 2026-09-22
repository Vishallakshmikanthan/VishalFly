import React, { useState, useEffect } from 'react';
import { Scene } from './components/3d/Scene';
import { AppHeader } from './components/ui/AppHeader';
import { SimulationControlBar } from './components/ui/SimulationControlBar';
import { HUD } from './components/ui/HUD';
import { ControlsGuide } from './components/ui/ControlsGuide';
import { ViewControls } from './components/ui/ViewControls';
import { TransitionOverlay } from './components/ui/TransitionOverlay';
import { TimelineView } from './components/ui/TimelineView';
import { AnalyticsView } from './components/ui/AnalyticsView';
import { ReplayStudioView } from './components/ui/ReplayStudioView';
import { SettingsView } from './components/ui/SettingsView';
import { DevPanel } from './components/ui/DevPanel';
import { CognitiveInspector } from './components/ui/CognitiveInspector';
import { useGameStore } from './store/useGameStore';

export const App: React.FC = () => {
  const activeView = useGameStore((state) => state.activeView);

  const [isDevOpen, setIsDevOpen] = useState(false);
  const [isCognitiveOpen, setIsCognitiveOpen] = useState(false);

  // Global F3 & F4 keyboard listener for developer panel and cognitive inspector
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'F3') {
        e.preventDefault();
        setIsDevOpen((prev) => !prev);
      } else if (e.code === 'F4') {
        e.preventDefault();
        setIsCognitiveOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#080a0f] font-sans flex flex-col">
      {/* 1. 3D WebGL Canvas Layer (Active in background) */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* 2. Top Application Navigation Header */}
      <AppHeader
        onOpenDevPanel={() => setIsDevOpen(true)}
        onOpenCognitiveInspector={() => setIsCognitiveOpen(true)}
      />

      {/* 3. Main Dashboard View Container */}
      <div className="relative flex-1 z-10 overflow-hidden pointer-events-none">
        {/* View 1: 3D Simulation World */}
        {activeView === 'simulation' && (
          <div className="w-full h-full relative">
            <HUD />
            <ControlsGuide />
            <ViewControls />
          </div>
        )}

        {/* View 2: Event Timeline */}
        {activeView === 'timeline' && (
          <div className="w-full h-full bg-[#080a0f]/85 backdrop-blur-xl pointer-events-auto overflow-hidden animate-in fade-in duration-200">
            <TimelineView />
          </div>
        )}

        {/* View 3: Analytics Dashboard */}
        {activeView === 'analytics' && (
          <div className="w-full h-full bg-[#080a0f]/85 backdrop-blur-xl pointer-events-auto overflow-hidden animate-in fade-in duration-200">
            <AnalyticsView />
          </div>
        )}

        {/* View 4: Replay Studio */}
        {activeView === 'replay' && (
          <div className="w-full h-full bg-[#080a0f]/80 backdrop-blur-md pointer-events-auto overflow-hidden animate-in fade-in duration-200">
            <ReplayStudioView />
          </div>
        )}

        {/* View 5: Settings & Config */}
        {activeView === 'settings' && (
          <div className="w-full h-full bg-[#080a0f]/85 backdrop-blur-xl pointer-events-auto overflow-hidden animate-in fade-in duration-200">
            <SettingsView />
          </div>
        )}
      </div>

      {/* 4. Docked Bottom Simulation Control Bar */}
      <div className="relative z-20 px-4 pb-3 pointer-events-none">
        <div className="max-w-6xl mx-auto pointer-events-auto">
          <SimulationControlBar />
        </div>
      </div>

      {/* 5. Location Transition Overlay */}
      <TransitionOverlay />

      {/* 6. Modals */}
      <DevPanel isOpen={isDevOpen} onClose={() => setIsDevOpen(false)} />
      <CognitiveInspector isOpen={isCognitiveOpen} onClose={() => setIsCognitiveOpen(false)} />
    </main>
  );
};

export default App;
