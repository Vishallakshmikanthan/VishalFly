import React from 'react';
import { 
  Dumbbell, 
  Code2, 
  Utensils, 
  PhoneCall, 
  Shirt, 
  Sparkles, 
  GraduationCap, 
  ArrowRight,
  Clock3,
  PackageCheck
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { LOCATIONS } from '../../navigation/locationGraph';

export const ActivityInspector: React.FC = () => {
  const currentActivity = useGameStore((state) => state.currentActivity);
  const nextActivity = useGameStore((state) => state.nextActivity);
  const currentLocation = useGameStore((state) => state.currentLocation);
  const flyActivity = useGameStore((state) => state.flyActivity);

  // Sub-system states
  const workoutSession = useGameStore((state) => state.workoutSession);
  const projectState = useGameStore((state) => state.projectState);
  const assignmentState = useGameStore((state) => state.assignmentState);
  const mealSession = useGameStore((state) => state.mealSession);
  const laundryState = useGameStore((state) => state.laundryState);
  const foodOrderState = useGameStore((state) => state.foodOrderState);
  const familyCallState = useGameStore((state) => state.familyCallState);

  if (!currentActivity) return null;

  const actId = currentActivity.definition.id;
  const currentLocConfig = LOCATIONS[currentLocation] || LOCATIONS.bedroom;
  const progressPercent = currentActivity.progressPercent ?? 0;
  const currentAction = currentActivity.currentAction || currentActivity.scheduleEntry.name;

  return (
    <aside aria-label="Activity Inspector" className="glass-panel p-3.5 rounded-2xl border border-amber-500/25 shadow-2xl backdrop-blur-xl w-80 md:w-96 text-slate-100 flex flex-col gap-2.5 pointer-events-auto">
      {/* Top Title & Location */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-700/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            {actId.includes('gym') ? (
              <Dumbbell className="w-4 h-4" />
            ) : actId.includes('project') ? (
              <Code2 className="w-4 h-4" />
            ) : actId.includes('dinner') || actId.includes('lunch') ? (
              <Utensils className="w-4 h-4" />
            ) : actId.includes('call') ? (
              <PhoneCall className="w-4 h-4" />
            ) : actId.includes('laundry') || actId.includes('clothes') ? (
              <Shirt className="w-4 h-4" />
            ) : actId.includes('college') ? (
              <GraduationCap className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold block">
              Current Activity
            </span>
            <h2 className="text-sm font-bold text-white tracking-tight leading-tight">
              {currentActivity.scheduleEntry.name}
            </h2>
            <span className="text-[10px] text-slate-400 block font-sans">
              Location: <span className="text-slate-200 font-medium">{currentLocConfig.name}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/30 capitalize">
            {currentActivity.state}
          </span>
          <span className="text-[9px] font-mono text-slate-400 capitalize">
            Pose: {flyActivity.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Action / State & Progress */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-medium">{currentAction}</span>
          </span>
          <span className="font-mono text-amber-300 font-semibold">{progressPercent}%</span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Contextual Sub-Card */}
      {/* 1. Workout Card */}
      {actId === 'gym_workout' && workoutSession && (
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
              {workoutSession.plan.name}
            </span>
            <span className="font-mono text-[10px] text-slate-300 px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700">
              {workoutSession.state}
            </span>
          </div>

          {workoutSession.plan.exercises[workoutSession.currentExerciseIndex] && (
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-700/40 text-center font-mono text-[11px]">
              <div className="bg-slate-900/60 p-1 rounded border border-slate-800">
                <span className="text-[9px] text-slate-400 block">Exercise</span>
                <span className="font-semibold text-slate-200 truncate block">
                  {workoutSession.plan.exercises[workoutSession.currentExerciseIndex].name}
                </span>
              </div>
              <div className="bg-slate-900/60 p-1 rounded border border-slate-800">
                <span className="text-[9px] text-slate-400 block">Set</span>
                <span className="font-semibold text-amber-300">
                  {workoutSession.currentSet} / {workoutSession.plan.exercises[workoutSession.currentExerciseIndex].sets}
                </span>
              </div>
              <div className="bg-slate-900/60 p-1 rounded border border-slate-800">
                <span className="text-[9px] text-slate-400 block">Reps</span>
                <span className="font-semibold text-emerald-400">
                  {workoutSession.state === 'REST' 
                    ? `${Math.ceil(workoutSession.restRemainingSimSeconds)}s rest`
                    : `${workoutSession.currentReps} / ${workoutSession.plan.exercises[workoutSession.currentExerciseIndex].reps}`}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Project Work Card */}
      {actId === 'project_work' && (
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-amber-400" />
              {projectState.currentProject}
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              Session: {Math.round(projectState.sessionElapsedSimMinutes)} min
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-300 pt-1 border-t border-slate-700/40">
            <span>Total Built: {Math.round(projectState.totalProgress)}%</span>
            <span className="text-emerald-400">Sessions: {projectState.completedSessions}</span>
          </div>
        </div>
      )}

      {/* 3. Meal Card */}
      {(actId === 'dinner' || actId === 'lunch') && mealSession && (
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5 text-amber-400" />
              {mealSession.meal.name}
            </span>
            <span className="font-mono text-[10px] text-emerald-400">
              -{mealSession.meal.hungerReductionTotal} Hunger
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Mess Hall dining table • Restoring metabolic energy
          </span>
        </div>
      )}

      {/* 4. Family Call Card */}
      {actId === 'family_call_walk' && (
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              Family Phone Call
            </span>
            <span className="font-mono text-[10px] text-emerald-400">
              Duration: {Math.round(familyCallState.callDurationSimMinutes)}m
            </span>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock3 className="w-3 h-3 text-slate-500" />
            Walking perimeter loop on apartment grounds
          </span>
        </div>
      )}

      {/* 5. Laundry Card */}
      {(actId === 'laundry' || actId === 'dry_clothes') && (
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Shirt className="w-3.5 h-3.5 text-amber-400" />
              {actId === 'laundry' ? 'Washing Phase' : 'Balcony Drying Phase'}
            </span>
            <span className="font-mono text-[10px] text-slate-300">
              {laundryState.progressPercent}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            {actId === 'laundry' 
              ? 'Washing in PG bedroom before hanging'
              : 'Drying clothes in sun on balcony railing'}
          </span>
        </div>
      )}

      {/* 6. College Assignment Card */}
      {actId === 'college_assignments' && (
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              {assignmentState.currentTask}
            </span>
            <span className="font-mono text-[10px] text-slate-300">
              {Math.round(assignmentState.progress)}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Reviewing lecture materials and preparing lab coursework
          </span>
        </div>
      )}

      {/* 7. Midnight Food Order Card */}
      {foodOrderState.stage !== 'idle' && (
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <PackageCheck className="w-3.5 h-3.5 text-amber-400" />
              Midnight Food Delivery
            </span>
            <span className="font-mono text-[10px] text-slate-300">
              {foodOrderState.stage.replace(/_/g, ' ')}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Delivery to gate • Pick up and late night meal feast
          </span>
        </div>
      )}

      {/* Next Activity Preview */}
      {nextActivity && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/40">
          <span className="flex items-center gap-1">
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span>Next: <strong className="text-slate-300 font-semibold">{nextActivity.entry.name}</strong></span>
          </span>
          <span className="font-mono text-slate-500 font-medium">
            {nextActivity.startTime}
          </span>
        </div>
      )}
    </aside>
  );
};
