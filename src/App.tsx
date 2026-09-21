import React from 'react';
import { Scene } from './components/3d/Scene';
import { HUD } from './components/ui/HUD';
import { ControlsGuide } from './components/ui/ControlsGuide';
import { ViewControls } from './components/ui/ViewControls';

export const App: React.FC = () => {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#080a0f] font-sans">
      {/* 1. 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* 2. HUD & User Interface Layer */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        <HUD />
        <ControlsGuide />
        <ViewControls />
      </div>
    </main>
  );
};

export default App;
