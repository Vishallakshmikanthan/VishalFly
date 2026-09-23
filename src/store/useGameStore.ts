import { create } from 'zustand';
import { 
  Vector3Tuple, 
  FlyActivity, 
  RoomBounds, 
  LightingPreset, 
  LocationId, 
  TransitionState,
  SimulationClockState,
  ActivityInstance,
  ScheduleEntry,
  NeedState,
  NeedType,
  SimulationEvent,
  SimulationSpeed,
  CollegeSubBehavior,
  SimulationState,
  WorkoutSession,
  ProjectState,
  AssignmentState,
  MealSession,
  LaundryState,
  FoodOrderState,
  FamilyCallState,
  MorningRoutineState,
  WorkoutType,
  MealType,
  DayOfWeek,
  ActiveDashboardView
} from '../types';
import { LOCATIONS } from '../navigation/locationGraph';
import { SimulationEngine } from '../simulation/engine/SimulationEngine';
import { INITIAL_NEEDS_STATE, DEFAULT_SIMULATION_SETTINGS } from '../simulation/config/defaults';
import { CognitiveInspectorData } from '../cognition/debug/CognitiveInspectorState';
import { ReplayPlaybackState, ReplaySpeed } from '../simulation/replay/ReplayTypes';
import { AnalyticsReport } from '../simulation/analytics/AnalyticsTypes';
import { SimulationSettings } from '../simulation/types/simulation';
import { ControllerMode, NeuralStateSnapshot } from '../cognition/connectome/types';
import { ConnectomeFlyController } from '../cognition/connectome/controller/ConnectomeFlyController';

export const connectomeFlyController = new ConnectomeFlyController();

interface GameState {
  // Active Location
  currentLocation: LocationId;
  transitionState: TransitionState;

  // Fly state
  flyPosition: Vector3Tuple;
  flyRotation: [number, number, number];
  flyActivity: FlyActivity;
  currentSpot: string;
  isAutonomous: boolean;
  
  // Room dimensions & bounds
  roomBounds: RoomBounds;
  
  // Simulation metadata & Clock
  simulatedTime: string;
  locationName: string;
  roomSubLocation: string;
  simulationClock: SimulationClockState;
  
  // Activity & Needs
  currentActivity: ActivityInstance | null;
  nextActivity: {
    entry: ScheduleEntry;
    startTime: string;
    startMinutes: number;
  } | null;
  needs: NeedState;
  recentEvents: SimulationEvent[];
  selectedCollegeBehavior: CollegeSubBehavior | null;

  // Milestone 4 Daily Life Systems State
  workoutSession: WorkoutSession | null;
  projectState: ProjectState;
  assignmentState: AssignmentState;
  mealSession: MealSession | null;
  laundryState: LaundryState;
  foodOrderState: FoodOrderState;
  familyCallState: FamilyCallState;
  morningRoutineState: MorningRoutineState;
  
  // Milestone 6 & 7 Cognitive Architecture State
  isCognitionEnabled: boolean;
  cognitiveInspectorData: CognitiveInspectorData | null;
  toggleCognition: () => void;
  setCognitionEnabled: (enabled: boolean) => void;
  setMemoryInfluenceEnabled: (enabled: boolean) => void;
  setAdaptationEnabled: (enabled: boolean) => void;
  clearCognitiveMemory: () => void;
  resetAdaptationDefaults: () => void;

  // Milestone Connectome Neural Brain Integration
  controllerMode: ControllerMode;
  connectomeSnapshot: NeuralStateSnapshot | null;
  setControllerMode: (mode: ControllerMode) => void;
  setConnectomeSnapshot: (snapshot: NeuralStateSnapshot) => void;
  triggerConnectomeThreat: () => void;
  pairOdorReward: (odor: string, reward: number) => void;
  resetLearningValence: () => void;
  resetFoodSurfaces: () => void;
  
  // Camera & view controls
  resetCameraTrigger: number;
  followFly: boolean;
  
  // Visuals
  lightingPreset: LightingPreset;
  
  // Actions
  setFlyPosition: (pos: Vector3Tuple) => void;
  setFlyRotation: (rot: [number, number, number]) => void;
  setFlyActivity: (activity: FlyActivity) => void;
  setCurrentSpot: (spot: string) => void;
  triggerResetCamera: () => void;
  setFollowFly: (follow: boolean) => void;
  toggleFollowFly: () => void;
  setLightingPreset: (preset: LightingPreset) => void;
  cycleLightingPreset: () => void;
  resetFlyToCenter: () => void;
  switchLocation: (targetId: LocationId, travelMessage?: string) => void;
  
  // Autonomous Simulation Actions
  toggleAutonomousMode: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  togglePauseSimulation: () => void;
  setSimulationSpeed: (speed: SimulationSpeed) => void;
  restartSimulationDay: () => void;
  syncFromSimulation: (state: SimulationState) => void;

  // Developer Testing Controls
  triggerWorkout: (type?: WorkoutType) => void;
  triggerMeal: (type?: MealType) => void;
  triggerFamilyCall: () => void;
  triggerFoodOrder: () => void;
  triggerActivity: (activityId: string, locationId?: LocationId) => void;
  setTime: (time: string) => void;
  setDay: (day: number, dayOfWeek?: DayOfWeek) => void;
  setNeedValue: (need: NeedType, value: number) => void;
  saveSimulation: () => boolean;
  loadSimulation: () => boolean;
  resetSimulation: () => void;

  // Milestone 8 Premium Dashboard & View Routing
  activeView: ActiveDashboardView;
  setActiveView: (view: ActiveDashboardView) => void;

  // Milestone 8 Replay Studio
  isReplayMode: boolean;
  replayState: ReplayPlaybackState;
  startReplay: (initialIndex?: number) => void;
  exitReplay: () => void;
  playReplay: () => void;
  pauseReplay: () => void;
  toggleReplayPlay: () => void;
  setReplaySpeed: (speed: ReplaySpeed) => void;
  scrubReplay: (index: number) => void;
  stepReplayForward: () => void;
  stepReplayBackward: () => void;
  jumpReplayToStart: () => void;
  jumpReplayToEnd: () => void;
  jumpReplayToEvent: (timestamp: string) => void;

  // Milestone 8 Analytics
  analyticsReport: AnalyticsReport;
  refreshAnalytics: () => void;

  // Milestone 8 Settings
  simulationSettings: SimulationSettings;
  updateSimulationSettings: (settings: Partial<SimulationSettings>) => void;
  resetSimulationSettings: () => void;
}

const initialLoc = LOCATIONS.bedroom;

// Create singleton simulation engine
export const simulationEngine = new SimulationEngine();

export const useGameStore = create<GameState>((set, get) => {
  const initialClock = simulationEngine.clock.getState();

  return {
    currentLocation: 'bedroom',
    transitionState: {
      isTransitioning: false,
      targetLocation: null,
      message: '',
    },

    flyPosition: [...initialLoc.spawnPosition] as Vector3Tuple,
    flyRotation: [0, 0, 0],
    flyActivity: 'hovering',
    currentSpot: 'Center Room Airspace',
    isAutonomous: true,
    
    roomBounds: { ...initialLoc.bounds },
    
    simulatedTime: initialClock.simulatedTime,
    locationName: initialLoc.name,
    roomSubLocation: initialLoc.subLocation,
    simulationClock: initialClock,

    currentActivity: null,
    nextActivity: null,
    needs: { ...INITIAL_NEEDS_STATE },
    recentEvents: simulationEngine.eventLogger.getRecent(20),
    selectedCollegeBehavior: null,

    workoutSession: null,
    projectState: simulationEngine.projectSystem.getState(),
    assignmentState: simulationEngine.assignmentSystem.getState(),
    mealSession: null,
    laundryState: simulationEngine.laundrySystem.getState(),
    foodOrderState: simulationEngine.foodOrderSystem.getState(),
    familyCallState: simulationEngine.familyCallSystem.getState(),
    morningRoutineState: simulationEngine.morningRoutineSystem.getState(),

    // Milestone 6 Cognitive State
    isCognitionEnabled: simulationEngine.cognitiveEngine.getIsCognitionEnabled(),
    cognitiveInspectorData: simulationEngine.getCognitiveInspectorState(),

    // Milestone Connectome Neural Brain State
    controllerMode: 'connectome',
    connectomeSnapshot: null,
    setControllerMode: (controllerMode) => {
      if (controllerMode === 'cognitive') {
        simulationEngine.setCognitionEnabled(true);
      } else if (controllerMode === 'schedule') {
        simulationEngine.setCognitionEnabled(false);
      }
      set({
        controllerMode,
        isAutonomous: controllerMode !== 'manual',
        isCognitionEnabled: simulationEngine.cognitiveEngine.getIsCognitionEnabled(),
        cognitiveInspectorData: simulationEngine.getCognitiveInspectorState(),
      });
    },
    setConnectomeSnapshot: (connectomeSnapshot) => set({ connectomeSnapshot }),
    triggerConnectomeThreat: () => connectomeFlyController.triggerThreatStimulus(),
    pairOdorReward: (odor, reward) => connectomeFlyController.pairOdorReward(odor, reward),
    resetLearningValence: () => connectomeFlyController.resetLearning(),
    resetFoodSurfaces: () => connectomeFlyController.resetFoodSurfaces(),

    // Milestone 8 View Routing, Replay, Analytics & Settings
    activeView: 'simulation',
    isReplayMode: false,
    replayState: simulationEngine.replayEngine.getPlaybackState(),
    analyticsReport: simulationEngine.getAnalyticsReport(),
    simulationSettings: { ...DEFAULT_SIMULATION_SETTINGS, ...simulationEngine.clock.getSettings() },
    
    resetCameraTrigger: 0,
    followFly: false,
    
    lightingPreset: 'dawn',
    
    setFlyPosition: (flyPosition) => set({ flyPosition }),
    setFlyRotation: (flyRotation) => set({ flyRotation }),
    setFlyActivity: (flyActivity) => set({ flyActivity }),
    setCurrentSpot: (currentSpot) => set({ currentSpot }),
    
    triggerResetCamera: () => set((state) => ({ resetCameraTrigger: state.resetCameraTrigger + 1 })),
    
    setFollowFly: (followFly) => set({ followFly }),
    toggleFollowFly: () => set((state) => ({ followFly: !state.followFly })),
    
    setLightingPreset: (lightingPreset) => set({ lightingPreset }),
    cycleLightingPreset: () => {
      const current = get().lightingPreset;
      const next: LightingPreset = 
        current === 'dawn' ? 'afternoon' : current === 'afternoon' ? 'warm_night' : 'dawn';
      set({ lightingPreset: next });
    },
    
    resetFlyToCenter: () => {
      const currentLoc = LOCATIONS[get().currentLocation] || LOCATIONS.bedroom;
      set({
        flyPosition: [...currentLoc.spawnPosition] as Vector3Tuple,
        flyRotation: [0, 0, 0],
        flyActivity: 'hovering',
        currentSpot: 'Spawning at ' + currentLoc.name,
      });
    },

    switchLocation: (targetId: LocationId, travelMessage?: string) => {
      const state = get();
      if (state.currentLocation === targetId || state.transitionState.isTransitioning) {
        return;
      }

      const targetConfig = LOCATIONS[targetId] || LOCATIONS.bedroom;

      // 1. Begin transition overlay
      set({
        transitionState: {
          isTransitioning: true,
          targetLocation: targetId,
          message: travelMessage || `Traveling to ${targetConfig.name}...`,
        },
      });

      // 2. Midpoint of transition: swap environment, bounds, spawn position, metadata
      setTimeout(() => {
        set((prev) => ({
          currentLocation: targetId,
          roomBounds: { ...targetConfig.bounds },
          flyPosition: [...targetConfig.spawnPosition] as Vector3Tuple,
          flyRotation: [0, 0, 0],
          flyActivity: 'hovering',
          locationName: targetConfig.name,
          roomSubLocation: targetConfig.subLocation,
          currentSpot: `Arrived at ${targetConfig.name}`,
          resetCameraTrigger: prev.resetCameraTrigger + 1,
        }));

        // Inform simulation activity manager of location sync
        simulationEngine.activityManager.setCurrentLocation(targetId);
      }, 380);

      // 3. Complete transition: remove overlay
      setTimeout(() => {
        set({
          transitionState: {
            isTransitioning: false,
            targetLocation: null,
            message: '',
          },
        });
      }, 850);
    },

    toggleAutonomousMode: () => {
      const nextAuto = !get().isAutonomous;
      simulationEngine.setIsAutonomous(nextAuto);
      set({ isAutonomous: nextAuto });
    },

    pauseSimulation: () => {
      simulationEngine.pause();
      set({ simulationClock: simulationEngine.clock.getState() });
    },

    resumeSimulation: () => {
      simulationEngine.resume();
      set({ simulationClock: simulationEngine.clock.getState() });
    },

    togglePauseSimulation: () => {
      const isPaused = simulationEngine.togglePause();
      set({ simulationClock: simulationEngine.clock.getState() });
      return isPaused;
    },

    setSimulationSpeed: (speed: SimulationSpeed) => {
      simulationEngine.setSpeed(speed);
      set({ simulationClock: simulationEngine.clock.getState() });
    },

    restartSimulationDay: () => {
      simulationEngine.restartDay();
      const state = simulationEngine.step(0);
      get().syncFromSimulation(state);
    },

    syncFromSimulation: (simState: SimulationState) => {
      const current = get();

      // If replay mode is active, do not overwrite the visual historical state!
      if (current.isReplayMode) {
        return;
      }

      // Check if simulation triggered location change in autonomous mode
      const targetLoc = simState.character.locationId as LocationId;
      if (
        current.isAutonomous &&
        targetLoc &&
        targetLoc !== current.currentLocation &&
        !current.transitionState.isTransitioning &&
        LOCATIONS[targetLoc]
      ) {
        current.switchLocation(targetLoc, `Autonomous Travel to ${LOCATIONS[targetLoc].name}`);
      }

      set({
        simulationClock: simState.clock,
        simulatedTime: simState.clock.simulatedTime,
        currentActivity: simState.currentActivity,
        nextActivity: simState.nextActivity,
        needs: simState.needs,
        recentEvents: simState.recentEvents,
        selectedCollegeBehavior: simState.currentActivity?.selectedSubBehavior || null,
        workoutSession: simState.workoutSession,
        projectState: simState.projectState,
        assignmentState: simState.assignmentState,
        mealSession: simState.mealSession,
        laundryState: simState.laundryState,
        foodOrderState: simState.foodOrderState,
        familyCallState: simState.familyCallState,
        morningRoutineState: simState.morningRoutineState,
        cognitiveInspectorData: simState.cognitive || simulationEngine.getCognitiveInspectorState(),
        isCognitionEnabled: simulationEngine.cognitiveEngine.getIsCognitionEnabled(),
      });
    },

    toggleCognition: () => {
      const next = !get().isCognitionEnabled;
      simulationEngine.setCognitionEnabled(next);
      set({ 
        isCognitionEnabled: next,
        cognitiveInspectorData: simulationEngine.getCognitiveInspectorState(),
      });
    },

    setCognitionEnabled: (enabled: boolean) => {
      simulationEngine.setCognitionEnabled(enabled);
      set({ 
        isCognitionEnabled: enabled,
        cognitiveInspectorData: simulationEngine.getCognitiveInspectorState(),
      });
    },

    setMemoryInfluenceEnabled: (enabled: boolean) => {
      simulationEngine.setMemoryInfluenceEnabled(enabled);
      set({ 
        cognitiveInspectorData: simulationEngine.getCognitiveInspectorState(),
      });
    },

    setAdaptationEnabled: (enabled: boolean) => {
      simulationEngine.setAdaptationEnabled(enabled);
      set({ 
        cognitiveInspectorData: simulationEngine.getCognitiveInspectorState(),
      });
    },

    clearCognitiveMemory: () => {
      simulationEngine.clearCognitiveMemory();
      set({ 
        cognitiveInspectorData: simulationEngine.getCognitiveInspectorState(),
      });
    },

    resetAdaptationDefaults: () => {
      simulationEngine.resetAdaptationDefaults();
      set({ 
        cognitiveInspectorData: simulationEngine.getCognitiveInspectorState(),
      });
    },

    // Developer Testing Controls
    triggerWorkout: (type) => {
      simulationEngine.triggerWorkout(type);
      get().switchLocation('gym', 'Teleporting to Gym for Workout');
    },

    triggerMeal: (type = 'dinner') => {
      simulationEngine.triggerMeal(type);
      get().switchLocation('dining', 'Heading to Dining Hall for Meal');
    },

    triggerFamilyCall: () => {
      simulationEngine.triggerFamilyCall();
      get().switchLocation('grounds', 'Going to Courtyard for Family Call');
    },

    triggerFoodOrder: () => {
      simulationEngine.triggerFoodOrder();
      get().switchLocation('bedroom', 'Ordering Late Night Food in Room');
    },

    triggerActivity: (activityId, locationId = 'bedroom') => {
      simulationEngine.triggerActivity(activityId, locationId);
      if (locationId !== get().currentLocation) {
        get().switchLocation(locationId, `Triggering ${activityId}`);
      }
    },

    setTime: (timeStr) => {
      simulationEngine.setTime(timeStr);
    },

    setDay: (day, dayOfWeek) => {
      simulationEngine.setDay(day, dayOfWeek);
    },

    setNeedValue: (need, value) => {
      simulationEngine.setNeed(need, value);
    },

    saveSimulation: () => {
      return simulationEngine.saveSimulation();
    },

    loadSimulation: () => {
      return simulationEngine.loadSimulation();
    },

    resetSimulation: () => {
      simulationEngine.resetSimulation();
      get().switchLocation('bedroom', 'Resetting simulation');
      set({
        analyticsReport: simulationEngine.getAnalyticsReport(),
        replayState: simulationEngine.replayEngine.getPlaybackState(),
      });
    },

    // Milestone 8 Actions
    setActiveView: (view: ActiveDashboardView) => {
      if (view === 'analytics') {
        get().refreshAnalytics();
      }
      set({ activeView: view });
    },

    startReplay: (initialIndex?: number) => {
      const snap = simulationEngine.replayEngine.startReplay(initialIndex);
      if (snap) {
        // Pause live simulation during replay
        simulationEngine.pause();
        set({
          isReplayMode: true,
          activeView: 'replay',
          currentLocation: snap.locationId,
          currentSpot: snap.currentSpot,
          flyActivity: snap.flyActivity,
          flyPosition: snap.flyPosition,
          needs: snap.needs,
          simulatedTime: snap.timestamp.split('• ')[1] || snap.timestamp,
          replayState: simulationEngine.replayEngine.getPlaybackState(),
        });
      }
    },

    exitReplay: () => {
      simulationEngine.replayEngine.stopReplay();
      set({
        isReplayMode: false,
        activeView: 'simulation',
        replayState: simulationEngine.replayEngine.getPlaybackState(),
      });
      // Synchronize back to live engine state
      get().syncFromSimulation(simulationEngine.getState());
    },

    playReplay: () => {
      simulationEngine.replayEngine.play();
    },

    pauseReplay: () => {
      simulationEngine.replayEngine.pause();
    },

    toggleReplayPlay: () => {
      simulationEngine.replayEngine.togglePlay();
    },

    setReplaySpeed: (speed: ReplaySpeed) => {
      simulationEngine.replayEngine.setSpeed(speed);
    },

    scrubReplay: (index: number) => {
      const snap = simulationEngine.replayEngine.scrubTo(index);
      if (snap && get().isReplayMode) {
        set({
          currentLocation: snap.locationId,
          currentSpot: snap.currentSpot,
          flyActivity: snap.flyActivity,
          flyPosition: snap.flyPosition,
          needs: snap.needs,
          simulatedTime: snap.timestamp.split('• ')[1] || snap.timestamp,
        });
      }
    },

    stepReplayForward: () => {
      const snap = simulationEngine.replayEngine.stepForward();
      if (snap && get().isReplayMode) {
        set({
          currentLocation: snap.locationId,
          currentSpot: snap.currentSpot,
          flyActivity: snap.flyActivity,
          flyPosition: snap.flyPosition,
          needs: snap.needs,
          simulatedTime: snap.timestamp.split('• ')[1] || snap.timestamp,
        });
      }
    },

    stepReplayBackward: () => {
      const snap = simulationEngine.replayEngine.stepBackward();
      if (snap && get().isReplayMode) {
        set({
          currentLocation: snap.locationId,
          currentSpot: snap.currentSpot,
          flyActivity: snap.flyActivity,
          flyPosition: snap.flyPosition,
          needs: snap.needs,
          simulatedTime: snap.timestamp.split('• ')[1] || snap.timestamp,
        });
      }
    },

    jumpReplayToStart: () => {
      const snap = simulationEngine.replayEngine.jumpToStart();
      if (snap && get().isReplayMode) {
        set({
          currentLocation: snap.locationId,
          currentSpot: snap.currentSpot,
          flyActivity: snap.flyActivity,
          flyPosition: snap.flyPosition,
          needs: snap.needs,
          simulatedTime: snap.timestamp.split('• ')[1] || snap.timestamp,
        });
      }
    },

    jumpReplayToEnd: () => {
      const snap = simulationEngine.replayEngine.jumpToEnd();
      if (snap && get().isReplayMode) {
        set({
          currentLocation: snap.locationId,
          currentSpot: snap.currentSpot,
          flyActivity: snap.flyActivity,
          flyPosition: snap.flyPosition,
          needs: snap.needs,
          simulatedTime: snap.timestamp.split('• ')[1] || snap.timestamp,
        });
      }
    },

    jumpReplayToEvent: (timestamp: string) => {
      const snap = simulationEngine.replayEngine.jumpToTimestamp(timestamp);
      if (snap) {
        simulationEngine.pause();
        set({
          isReplayMode: true,
          activeView: 'replay',
          currentLocation: snap.locationId,
          currentSpot: snap.currentSpot,
          flyActivity: snap.flyActivity,
          flyPosition: snap.flyPosition,
          needs: snap.needs,
          simulatedTime: snap.timestamp.split('• ')[1] || snap.timestamp,
          replayState: simulationEngine.replayEngine.getPlaybackState(),
        });
      }
    },

    refreshAnalytics: () => {
      set({ analyticsReport: simulationEngine.getAnalyticsReport() });
    },

    updateSimulationSettings: (newSettings: Partial<SimulationSettings>) => {
      const current = get().simulationSettings;
      const merged = { ...current, ...newSettings };
      if (newSettings.simulatedSecondsPerRealSecond !== undefined) {
        simulationEngine.clock.setSpeed(1); // resets scale appropriately
      }
      set({ simulationSettings: merged });
    },

    resetSimulationSettings: () => {
      set({ simulationSettings: { ...DEFAULT_SIMULATION_SETTINGS } });
    },
  };
});

// Subscribe simulation engine to push state changes to store
simulationEngine.subscribe((state) => {
  useGameStore.getState().syncFromSimulation(state);
});

// Subscribe replay engine to push playback updates to store
simulationEngine.replayEngine.subscribe((replayState) => {
  const isReplay = useGameStore.getState().isReplayMode;
  if (isReplay && replayState.activeSnapshot) {
    const snap = replayState.activeSnapshot;
    useGameStore.setState({
      replayState,
      currentLocation: snap.locationId,
      currentSpot: snap.currentSpot,
      flyActivity: snap.flyActivity,
      flyPosition: snap.flyPosition,
      needs: snap.needs,
      simulatedTime: snap.timestamp.split('• ')[1] || snap.timestamp,
    });
  } else {
    useGameStore.setState({ replayState });
  }
});

// Start simulation engine loop automatically
simulationEngine.start(15);
