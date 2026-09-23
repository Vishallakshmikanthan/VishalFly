import { 
  BehaviorCandidate, 
  CognitiveContext, 
  BehaviorEvaluation, 
  ActionRequest 
} from '../types/cognition';

export class BehaviorRegistry {
  private candidates: Map<string, BehaviorCandidate> = new Map();

  constructor() {
    this.registerDefaultCandidates();
  }

  public register(candidate: BehaviorCandidate): void {
    this.candidates.set(candidate.id, candidate);
  }

  public get(id: string): BehaviorCandidate | undefined {
    return this.candidates.get(id);
  }

  public getAll(): BehaviorCandidate[] {
    return Array.from(this.candidates.values());
  }

  /**
   * Registers all core behavior candidates mapped to VishalFly's daily life activities.
   */
  private registerDefaultCandidates(): void {
    // 1. Travel to Scheduled Activity
    this.register({
      id: 'travel_to_scheduled',
      displayName: 'Travel to Scheduled Activity',
      description: 'Fly or commute toward the location required by the active schedule entry.',
      isApplicable: (ctx: CognitiveContext) => {
        if (!ctx.activeScheduleEntry) {
          return { eligible: false, reason: 'No active schedule entry.' };
        }
        if (ctx.perception.available.isTravelling) {
          return { eligible: false, reason: 'Already in transit.' };
        }
        const targetLoc = ctx.activeScheduleEntry.locationId;
        const currentLoc = ctx.perception.available.currentLocationId;
        if (targetLoc === currentLoc) {
          return { eligible: false, reason: 'Already at scheduled destination.' };
        }
        return { eligible: true };
      },
      evaluateUtility: (ctx: CognitiveContext): BehaviorEvaluation => {
        const targetLoc = ctx.activeScheduleEntry?.locationId || 'bedroom';
        const isCurrentActive = ctx.currentActivity?.scheduleEntry.id === ctx.activeScheduleEntry?.id;
        const base = isCurrentActive ? 85 : 75;
        const urgencyBonus = isCurrentActive ? 15 : 5;
        const finalScore = Math.min(100, base + urgencyBonus);

        return {
          candidateId: 'travel_to_scheduled',
          candidateName: 'Travel to Scheduled Activity',
          isEligible: true,
          baseUtility: base,
          scheduleCompatibility: 1.0,
          needUrgencyBonus: urgencyBonus,
          continuityBonus: 0,
          repetitionPenalty: 0,
          finalScore,
          explanation: `Agent is at ${ctx.perception.available.currentLocationId} but scheduled for ${ctx.activeScheduleEntry?.name} at ${targetLoc}.`,
        };
      },
      createActionRequest: (ctx: CognitiveContext): ActionRequest => ({
        type: 'TRAVEL',
        targetLocation: (ctx.activeScheduleEntry?.locationId as any) || 'bedroom',
        targetWaypoint: 'center',
        targetFlyActivity: 'flying',
        actionLabel: `Commuting to ${ctx.activeScheduleEntry?.locationId}`,
      }),
    });

    // 2. Attend College Lecture
    this.register({
      id: 'attend_lecture',
      displayName: 'Attend College Lecture',
      description: 'Sit attentively on the front desk observing the professor during lecture.',
      applicableActivityIds: ['college_activities'],
      isApplicable: (ctx: CognitiveContext) => {
        if (ctx.perception.available.currentLocationId !== 'classroom') {
          return { eligible: false, reason: 'Must be in classroom to attend lecture.' };
        }
        if (ctx.activeScheduleEntry?.activityId !== 'college_activities') {
          return { eligible: false, reason: 'Not currently during college lecture schedule.' };
        }
        return { eligible: true };
      },
      evaluateUtility: (ctx: CognitiveContext): BehaviorEvaluation => {
        const drives = ctx.internalState.drives;
        const focusBonus = Math.round(drives.attentionalFocus * 0.25);
        const sleepinessPenalty = Math.round(ctx.perception.available.needs.sleepiness * 0.2);
        const base = 65;
        const finalScore = Math.max(10, Math.min(100, base + focusBonus - sleepinessPenalty));

        return {
          candidateId: 'attend_lecture',
          candidateName: 'Attend College Lecture',
          isEligible: true,
          baseUtility: base,
          scheduleCompatibility: 1.0,
          needUrgencyBonus: focusBonus,
          continuityBonus: 0,
          repetitionPenalty: sleepinessPenalty,
          finalScore,
          explanation: `Focus drive (${drives.attentionalFocus}) favors lecture attendance.`,
        };
      },
      createActionRequest: (): ActionRequest => ({
        type: 'SET_COLLEGE_SUB_BEHAVIOR',
        collegeSubBehavior: 'lecture',
        targetFlyActivity: 'sitting',
        targetWaypoint: 'student_desk_front',
        actionLabel: 'Listening to Lecture',
      }),
    });

    // 3. Doze in Class
    this.register({
      id: 'doze_in_class',
      displayName: 'Doze off in Class',
      description: 'Rest on desk corner due to accumulated sleepiness or fatigue.',
      applicableActivityIds: ['college_activities'],
      isApplicable: (ctx: CognitiveContext) => {
        if (ctx.perception.available.currentLocationId !== 'classroom') {
          return { eligible: false, reason: 'Must be in classroom.' };
        }
        if (ctx.activeScheduleEntry?.activityId !== 'college_activities') {
          return { eligible: false, reason: 'Only during college activities.' };
        }
        return { eligible: true };
      },
      evaluateUtility: (ctx: CognitiveContext): BehaviorEvaluation => {
        const restDrive = ctx.internalState.drives.restDrive;
        const base = 20;
        const urgencyBonus = Math.round(restDrive * 0.65);
        const finalScore = Math.max(5, Math.min(95, base + urgencyBonus));

        return {
          candidateId: 'doze_in_class',
          candidateName: 'Doze off in Class',
          isEligible: true,
          baseUtility: base,
          scheduleCompatibility: 0.5,
          needUrgencyBonus: urgencyBonus,
          continuityBonus: 0,
          repetitionPenalty: 0,
          finalScore,
          explanation: `Rest drive is ${restDrive} / 100, inducing drowsiness.`,
        };
      },
      createActionRequest: (): ActionRequest => ({
        type: 'SET_COLLEGE_SUB_BEHAVIOR',
        collegeSubBehavior: 'dozing',
        targetFlyActivity: 'dozing',
        targetWaypoint: 'student_desk_front',
        actionLabel: 'Dozing off in Class',
      }),
    });

    // 4. Laptop Browsing / Research
    this.register({
      id: 'laptop_browse',
      displayName: 'Browse Project on Laptop',
      description: 'Perched on the laptop facing the screen in focused technical browsing.',
      applicableActivityIds: ['college_activities'],
      isApplicable: (ctx: CognitiveContext) => {
        if (ctx.perception.available.currentLocationId !== 'classroom') {
          return { eligible: false, reason: 'Must be in classroom.' };
        }
        if (ctx.activeScheduleEntry?.activityId !== 'college_activities') {
          return { eligible: false, reason: 'Only applicable during college activities.' };
        }
        return { eligible: true };
      },
      evaluateUtility: (ctx: CognitiveContext): BehaviorEvaluation => {
        const focusDrive = ctx.internalState.drives.attentionalFocus;
        const base = 35;
        const bonus = Math.round(focusDrive * 0.4);
        const finalScore = Math.min(90, base + bonus);

        return {
          candidateId: 'laptop_browse',
          candidateName: 'Browse Project on Laptop',
          isEligible: true,
          baseUtility: base,
          scheduleCompatibility: 0.8,
          needUrgencyBonus: bonus,
          continuityBonus: 0,
          repetitionPenalty: 0,
          finalScore,
          explanation: `Attentional focus (${focusDrive}) directs energy to project browsing.`,
        };
      },
      createActionRequest: (): ActionRequest => ({
        type: 'SET_COLLEGE_SUB_BEHAVIOR',
        collegeSubBehavior: 'laptop',
        targetFlyActivity: 'browsing',
        targetWaypoint: 'laptop_spot',
        actionLabel: 'Browsing Project on Laptop',
      }),
    });

    // 5. Phone Entertainment Distraction (Reels / Mobile Game)
    this.register({
      id: 'phone_distraction',
      displayName: 'Use Phone for Entertainment',
      description: 'Quick leisure break watching video reels or playing a mobile game.',
      applicableActivityIds: ['college_activities', 'weekend_free_time'],
      isApplicable: (ctx: CognitiveContext) => {
        // Disallowed during active workout or deep night sleep
        const currentAct = ctx.activeScheduleEntry?.activityId;
        if (currentAct === 'gym_workout' || currentAct === 'sleep') {
          return { eligible: false, reason: 'Distraction disallowed during workout or sleep.' };
        }
        return { eligible: true };
      },
      evaluateUtility: (ctx: CognitiveContext): BehaviorEvaluation => {
        const socialDrive = ctx.internalState.drives.socialDrive;
        const fatigue = ctx.perception.available.needs.fatigue;
        const focus = ctx.perception.available.needs.focus;

        const base = 25;
        const lowFocusBonus = focus < 50 ? Math.round((50 - focus) * 0.4) : 0;
        const socialBonus = Math.round(socialDrive * 0.2);
        const fatigueBonus = fatigue > 60 ? Math.round((fatigue - 60) * 0.3) : 0;
        const finalScore = Math.min(80, base + lowFocusBonus + socialBonus + fatigueBonus);

        return {
          candidateId: 'phone_distraction',
          candidateName: 'Use Phone for Entertainment',
          isEligible: true,
          baseUtility: base,
          scheduleCompatibility: 0.4,
          needUrgencyBonus: lowFocusBonus + socialBonus,
          continuityBonus: 0,
          repetitionPenalty: 0,
          finalScore,
          explanation: `Waning focus (${focus}) and social drive (${socialDrive}) encourage casual mobile usage.`,
        };
      },
      createActionRequest: (): ActionRequest => ({
        type: 'SET_COLLEGE_SUB_BEHAVIOR',
        collegeSubBehavior: 'reels',
        targetFlyActivity: 'sitting',
        targetWaypoint: 'student_desk_mid',
        actionLabel: 'Watching Reels',
      }),
    });

    // 6. Gym Strength Training (Workout)
    this.register({
      id: 'perform_workout',
      displayName: 'Gym Strength Training',
      description: 'Execute structured PPL gym sets, exercises, and rest periods.',
      applicableActivityIds: ['gym_workout'],
      isApplicable: (ctx: CognitiveContext) => {
        if (ctx.perception.available.currentLocationId !== 'gym') {
          return { eligible: false, reason: 'Must be in the Gym to workout.' };
        }
        if (ctx.activeScheduleEntry?.activityId !== 'gym_workout') {
          return { eligible: false, reason: 'Workout only during scheduled gym hours.' };
        }
        return { eligible: true };
      },
      evaluateUtility: (ctx: CognitiveContext): BehaviorEvaluation => {
        const energy = ctx.perception.available.needs.energy;
        const base = 75;
        // Severe exhaustion decreases eagerness, but commitment keeps it high
        const energyModifier = energy > 30 ? 10 : -15;
        const finalScore = Math.max(40, Math.min(95, base + energyModifier));

        return {
          candidateId: 'perform_workout',
          candidateName: 'Gym Strength Training',
          isEligible: true,
          baseUtility: base,
          scheduleCompatibility: 1.0,
          needUrgencyBonus: energyModifier > 0 ? energyModifier : 0,
          continuityBonus: 0,
          repetitionPenalty: 0,
          finalScore,
          explanation: `Scheduled workout aligned with gym location (Energy: ${energy}%).`,
        };
      },
      createActionRequest: (): ActionRequest => ({
        type: 'PROGRESS_WORKOUT',
        targetFlyActivity: 'workout',
        targetWaypoint: 'warmup_zone',
        actionLabel: 'Performing Workout',
      }),
    });

    // 7. Eat Scheduled Meal
    this.register({
      id: 'eat_meal',
      displayName: 'Eat Scheduled Meal',
      description: 'Consume meal in dining area or room to satisfy hunger and recover energy.',
      applicableActivityIds: ['dinner', 'lunch', 'midnight_food_order'],
      isApplicable: (ctx: CognitiveContext) => {
        const actId = ctx.activeScheduleEntry?.activityId;
        const isDiningMeal = actId === 'dinner' || actId === 'lunch';
        const isMidnightOrder = actId === 'midnight_food_order';

        if (isDiningMeal && ctx.perception.available.currentLocationId !== 'dining') {
          return { eligible: false, reason: 'Must be in dining hall to consume mess meal.' };
        }
        if (isMidnightOrder && ctx.perception.available.currentLocationId !== 'bedroom') {
          return { eligible: false, reason: 'Must be in bedroom for late food order.' };
        }
        if (!isDiningMeal && !isMidnightOrder) {
          return { eligible: false, reason: 'No scheduled meal active.' };
        }
        return { eligible: true };
      },
      evaluateUtility: (ctx: CognitiveContext): BehaviorEvaluation => {
        const hunger = ctx.perception.available.needs.hunger;
        const hungerDrive = ctx.internalState.drives.hungerDrive;
        const base = 70;
        const hungerBonus = Math.round(hungerDrive * 0.3);
        const finalScore = Math.min(100, base + hungerBonus);

        return {
          candidateId: 'eat_meal',
          candidateName: 'Eat Scheduled Meal',
          isEligible: true,
          baseUtility: base,
          scheduleCompatibility: 1.0,
          needUrgencyBonus: hungerBonus,
          continuityBonus: 0,
          repetitionPenalty: 0,
          finalScore,
          explanation: `Hunger level is ${hunger}%, creating high drive for sustenance.`,
        };
      },
      createActionRequest: (): ActionRequest => ({
        type: 'CONSUME_MEAL',
        targetFlyActivity: 'eating',
        targetWaypoint: 'dining_table_seat',
        actionLabel: 'Eating Meal',
      }),
    });

    // 8. Project Work & Upskilling
    this.register({
      id: 'work_project',
      displayName: 'Work on Project',
      description: 'Focused software engineering session on VishalFly digital twin.',
      applicableActivityIds: ['project_work'],
      isApplicable: (ctx: CognitiveContext) => {
        if (ctx.perception.available.currentLocationId !== 'bedroom') {
          return { eligible: false, reason: 'Must be in PG bedroom at study desk.' };
        }
        if (ctx.activeScheduleEntry?.activityId !== 'project_work') {
          return { eligible: false, reason: 'Only during scheduled project work.' };
        }
        return { eligible: true };
      },
      evaluateUtility: (ctx: CognitiveContext): BehaviorEvaluation => {
        const focus = ctx.internalState.drives.attentionalFocus;
        const base = 70;
        const focusBonus = Math.round(focus * 0.25);
        const finalScore = Math.min(95, base + focusBonus);

        return {
          candidateId: 'work_project',
          candidateName: 'Work on Project',
          isEligible: true,
          baseUtility: base,
          scheduleCompatibility: 1.0,
          needUrgencyBonus: focusBonus,
          continuityBonus: 0,
          repetitionPenalty: 0,
          finalScore,
          explanation: `Project sprint scheduled; Attentional focus is ${focus}%.`,
        };
      },
      createActionRequest: (): ActionRequest => ({
        type: 'WORK_PROJECT',
        targetFlyActivity: 'working',
        targetWaypoint: 'desk',
        actionLabel: 'Hacking VishalFly Project',
      }),
    });

    // 9. Work on Assignment
    this.register({
      id: 'work_assignment',
      displayName: 'Work on Assignment',
      description: 'Complete pending college assignments and problem sheets.',
      applicableActivityIds: ['college_assignments'],
      isApplicable: (ctx: CognitiveContext) => {
        if (ctx.perception.available.currentLocationId !== 'bedroom') {
          return { eligible: false, reason: 'Must be in PG bedroom.' };
        }
        if (ctx.activeScheduleEntry?.activityId !== 'college_assignments') {
          return { eligible: false, reason: 'Only during scheduled assignment hours.' };
        }
        return { eligible: true };
      },
      evaluateUtility: (_ctx: CognitiveContext): BehaviorEvaluation => {
        const base = 70;
        const finalScore = 85;

        return {
          candidateId: 'work_assignment',
          candidateName: 'Work on Assignment',
          isEligible: true,
          baseUtility: base,
          scheduleCompatibility: 1.0,
          needUrgencyBonus: 15,
          continuityBonus: 0,
          repetitionPenalty: 0,
          finalScore,
          explanation: 'Academic assignment obligation requires timely submission.',
        };
      },
      createActionRequest: (): ActionRequest => ({
        type: 'WORK_ASSIGNMENT',
        targetFlyActivity: 'working',
        targetWaypoint: 'desk',
        actionLabel: 'Solving College Assignment',
      }),
    });

    // 10. Walk during Family Call
    this.register({
      id: 'family_call_walk',
      displayName: 'Walk during Family Call',
      description: 'Stroll around apartment courtyard garden while on family phone call.',
      applicableActivityIds: ['family_call_walk'],
      isApplicable: (ctx: CognitiveContext) => {
        if (ctx.perception.available.currentLocationId !== 'grounds') {
          return { eligible: false, reason: 'Must be at grounds for courtyard walk.' };
        }
        if (ctx.activeScheduleEntry?.activityId !== 'family_call_walk') {
          return { eligible: false, reason: 'Only during family call schedule.' };
        }
        return { eligible: true };
      },
      evaluateUtility: (ctx: CognitiveContext): BehaviorEvaluation => {
        const socialDrive = ctx.internalState.drives.socialDrive;
        const base = 70;
        const socialBonus = Math.round(socialDrive * 0.25);
        const finalScore = Math.min(95, base + socialBonus);

        return {
          candidateId: 'family_call_walk',
          candidateName: 'Walk during Family Call',
          isEligible: true,
          baseUtility: base,
          scheduleCompatibility: 1.0,
          needUrgencyBonus: socialBonus,
          continuityBonus: 0,
          repetitionPenalty: 0,
          finalScore,
          explanation: `Family connection satisfies social need (Social Drive: ${socialDrive}%).`,
        };
      },
      createActionRequest: (): ActionRequest => ({
        type: 'WALK_FAMILY_CALL',
        targetFlyActivity: 'phone_call',
        targetWaypoint: 'path_node_1',
        actionLabel: 'Walking on Family Call',
      }),
    });

    // 11. Perform Laundry Stage
    this.register({
      id: 'perform_laundry',
      displayName: 'Perform Laundry Stage',
      description: 'Sort and wash clothes in PG room or hang to dry on balcony clothesline.',
      applicableActivityIds: ['laundry', 'dry_clothes'],
      isApplicable: (ctx: CognitiveContext) => {
        const actId = ctx.activeScheduleEntry?.activityId;
        if (actId === 'laundry' && ctx.perception.available.currentLocationId !== 'bedroom') {
          return { eligible: false, reason: 'Must be in bedroom for washing.' };
        }
        if (actId === 'dry_clothes' && ctx.perception.available.currentLocationId !== 'balcony') {
          return { eligible: false, reason: 'Must be on balcony for clothes drying.' };
        }
        if (actId !== 'laundry' && actId !== 'dry_clothes') {
          return { eligible: false, reason: 'Not in laundry schedule window.' };
        }
        return { eligible: true };
      },
      evaluateUtility: (_ctx: CognitiveContext): BehaviorEvaluation => {
        const base = 70;
        const finalScore = 80;

        return {
          candidateId: 'perform_laundry',
          candidateName: 'Perform Laundry Stage',
          isEligible: true,
          baseUtility: base,
          scheduleCompatibility: 1.0,
          needUrgencyBonus: 10,
          continuityBonus: 0,
          repetitionPenalty: 0,
          finalScore,
          explanation: 'Weekend maintenance routine: keeping clothes fresh and clean.',
        };
      },
      createActionRequest: (ctx: CognitiveContext): ActionRequest => {
        const isDrying = ctx.activeScheduleEntry?.activityId === 'dry_clothes';
        return {
          type: 'PERFORM_LAUNDRY',
          targetFlyActivity: isDrying ? 'drying_clothes' : 'laundry',
          targetWaypoint: isDrying ? 'clothesline' : 'wardrobe',
          actionLabel: isDrying ? 'Drying Clothes on Balcony' : 'Washing Clothes',
        };
      },
    });

    // 12. Rest and Sleep
    this.register({
      id: 'rest_and_sleep',
      displayName: 'Rest or Sleep',
      description: 'Sleep on bed to recharge energy and eliminate sleepiness.',
      applicableActivityIds: ['sleep', 'wake_up_morning_routine'],
      isApplicable: (ctx: CognitiveContext) => {
        if (ctx.perception.available.currentLocationId !== 'bedroom') {
          return { eligible: false, reason: 'Must be in bedroom for bed sleep.' };
        }
        // Either scheduled sleep OR critical exhaustion
        const isScheduled = ctx.activeScheduleEntry?.activityId === 'sleep' || 
                            ctx.activeScheduleEntry?.activityId === 'wake_up_morning_routine';
        const isExhausted = ctx.perception.available.needs.energy < 10 || 
                            ctx.perception.available.needs.sleepiness > 92;
        if (!isScheduled && !isExhausted) {
          return { eligible: false, reason: 'Neither scheduled sleep nor critical exhaustion.' };
        }
        return { eligible: true };
      },
      evaluateUtility: (ctx: CognitiveContext): BehaviorEvaluation => {
        const sleepiness = ctx.perception.available.needs.sleepiness;
        const energy = ctx.perception.available.needs.energy;
        const restDrive = ctx.internalState.drives.restDrive;

        const isScheduled = ctx.activeScheduleEntry?.activityId === 'sleep';
        const base = isScheduled ? 85 : 40;
        const urgencyBonus = Math.round(restDrive * 0.35) + (energy < 15 ? 20 : 0);
        const finalScore = Math.min(100, base + urgencyBonus);

        return {
          candidateId: 'rest_and_sleep',
          candidateName: 'Rest or Sleep',
          isEligible: true,
          baseUtility: base,
          scheduleCompatibility: isScheduled ? 1.0 : 0.4,
          needUrgencyBonus: urgencyBonus,
          continuityBonus: 0,
          repetitionPenalty: 0,
          finalScore,
          explanation: `Rest drive (${restDrive}) and sleepiness (${sleepiness}%) dictate biological recovery.`,
        };
      },
      createActionRequest: (): ActionRequest => ({
        type: 'REST_OR_SLEEP',
        targetFlyActivity: 'sleeping',
        targetWaypoint: 'bed',
        actionLabel: 'Sleeping in Bed',
      }),
    });

    // 13. Room Idle / Free Buffer
    this.register({
      id: 'room_idle',
      displayName: 'PG Room Free Time',
      description: 'Relax in PG room airspace during unscheduled gaps.',
      isApplicable: (ctx: CognitiveContext) => {
        if (ctx.perception.available.currentLocationId !== 'bedroom') {
          return { eligible: false, reason: 'Must be in bedroom.' };
        }
        return { eligible: true };
      },
      evaluateUtility: (): BehaviorEvaluation => {
        return {
          candidateId: 'room_idle',
          candidateName: 'PG Room Free Time',
          isEligible: true,
          baseUtility: 25,
          scheduleCompatibility: 0.5,
          needUrgencyBonus: 0,
          continuityBonus: 0,
          repetitionPenalty: 0,
          finalScore: 25,
          explanation: 'Low-priority baseline idle candidate when no urgent demands exist.',
        };
      },
      createActionRequest: (): ActionRequest => ({
        type: 'IDLE_WAIT',
        targetFlyActivity: 'hovering',
        targetWaypoint: 'center',
        actionLabel: 'Relaxing in PG Room',
      }),
    });

    // 14. Milestone 5: Foraging & Autonomous Food Seeking
    this.register({
      id: 'forage_food_seeking',
      displayName: 'Autonomous Food Foraging',
      description: 'Seek out remembered, freshly refreshed, or smelled food surfaces driven by hunger and odor valence.',
      isApplicable: (ctx: CognitiveContext) => {
        if (ctx.perception.available.isTravelling) {
          return { eligible: false, reason: 'In transit; cannot begin foraging.' };
        }
        const hunger = ctx.perception.available.needs.hunger;
        const hasFoodEvent = !!ctx.worldEffects?.activityUtilityBonuses?.forage_food_seeking;
        const hasPositiveOdor = (ctx.learnedValences?.['food_odor'] ?? 0) > 0.2;
        if (hunger < 25 && !hasFoodEvent && !hasPositiveOdor) {
          return { eligible: false, reason: 'Hunger low and no active food cues present.' };
        }
        return { eligible: true };
      },
      evaluateUtility: (ctx: CognitiveContext): BehaviorEvaluation => {
        const hunger = ctx.perception.available.needs.hunger;
        const base = 40;
        const needUrgencyBonus = Math.round(hunger * 0.5);
        const eventBonusMultiplier = ctx.worldEffects?.activityUtilityBonuses?.forage_food_seeking || 1.0;
        const worldEventBonus = Math.round((eventBonusMultiplier - 1.0) * 35);
        const valence = ctx.learnedValences?.['food_odor'] ?? 0.0;
        const learnedValenceBonus = Math.round(valence * 20);

        // Schedule compatibility: Higher during meals or free time, moderate during study
        const actId = ctx.activeScheduleEntry?.activityId;
        const isMealSchedule = actId === 'lunch' || actId === 'dinner' || actId === 'midnight_food_order';
        const scheduleCompatibility = isMealSchedule ? 1.0 : hunger > 75 ? 0.8 : 0.5;

        const cooldownPenalty = (ctx.activeCooldowns?.['forage_food_seeking'] ?? 0) > 0 ? 30 : 0;
        const finalScore = Math.max(5, Math.min(100, Math.round(
          base * scheduleCompatibility + needUrgencyBonus + worldEventBonus + learnedValenceBonus - cooldownPenalty
        )));

        return {
          candidateId: 'forage_food_seeking',
          candidateName: 'Autonomous Food Foraging',
          isEligible: true,
          baseUtility: base,
          scheduleCompatibility,
          needUrgencyBonus,
          continuityBonus: 0,
          repetitionPenalty: 0,
          worldEventBonus,
          learnedValenceBonus,
          cooldownPenalty,
          finalScore,
          explanation: `Foraging driven by hunger (${hunger}%), world event bonus (+${worldEventBonus}), and odor valence (+${learnedValenceBonus}).`,
        };
      },
      createActionRequest: (ctx: CognitiveContext): ActionRequest => {
        const currentLoc = ctx.perception.available.currentLocationId;
        const isDining = currentLoc === 'dining';
        const targetWaypoint = isDining ? 'dining_table_seat' : 'desk';
        return {
          type: isDining ? 'CONTINUE_ACTIVITY' : 'TRAVEL',
          targetLocation: isDining ? 'dining' : 'bedroom',
          targetWaypoint,
          targetFlyActivity: 'flying',
          actionLabel: 'Foraging for Food Sources',
        };
      },
    });

    // 15. Milestone 5: Response to Sudden Environmental Interruptions
    this.register({
      id: 'respond_to_interruption',
      displayName: 'Respond to Environmental Disturbance',
      description: 'React swiftly to sudden drafts, door movements, or vibrations by relocating to a calmer perch.',
      isApplicable: (ctx: CognitiveContext) => {
        if (ctx.perception.available.isTravelling) {
          return { eligible: false, reason: 'Already in transit.' };
        }
        if (!ctx.worldEffects?.activeInterruptBehavior && !ctx.worldEffects?.activityUtilityBonuses?.respond_to_interruption) {
          return { eligible: false, reason: 'No active environmental disturbance.' };
        }
        return { eligible: true };
      },
      evaluateUtility: (_ctx: CognitiveContext): BehaviorEvaluation => {
        const base = 85;
        const worldEventBonus = 15;
        const finalScore = Math.min(100, base + worldEventBonus);

        return {
          candidateId: 'respond_to_interruption',
          candidateName: 'Respond to Environmental Disturbance',
          isEligible: true,
          baseUtility: base,
          scheduleCompatibility: 1.0,
          needUrgencyBonus: 10,
          continuityBonus: 0,
          repetitionPenalty: 0,
          worldEventBonus,
          finalScore,
          explanation: 'Sudden mechanical vibration or airflow draft detected; initiating startle relocation.',
        };
      },
      createActionRequest: (ctx: CognitiveContext): ActionRequest => ({
        type: 'CONTINUE_ACTIVITY',
        targetWaypoint: ctx.worldEffects?.suggestedWaypoint || 'lamp',
        targetFlyActivity: 'flying',
        actionLabel: 'Relocating from Disturbance',
      }),
    });

    // 16. Milestone 5: Ambient Creature & Environment Observation
    this.register({
      id: 'observe_ambient_stimulus',
      displayName: 'Observe Ambient Creature or Scene',
      description: 'Orient toward visiting ambient creatures or golden hour sunbeams.',
      isApplicable: (ctx: CognitiveContext) => {
        const hasCreatures = (ctx.worldEffects?.ambientCreatures?.length ?? 0) > 0;
        const hasWaypoint = !!ctx.worldEffects?.suggestedWaypoint;
        if (!hasCreatures && !hasWaypoint) {
          return { eligible: false, reason: 'No active ambient stimulus present.' };
        }
        return { eligible: true };
      },
      evaluateUtility: (ctx: CognitiveContext): BehaviorEvaluation => {
        const base = 45;
        const distraction = ctx.worldEffects?.attentionDistraction ?? 0.2;
        const worldEventBonus = Math.round(distraction * 30);
        const finalScore = Math.min(80, base + worldEventBonus);

        return {
          candidateId: 'observe_ambient_stimulus',
          candidateName: 'Observe Ambient Creature or Scene',
          isEligible: true,
          baseUtility: base,
          scheduleCompatibility: 0.7,
          needUrgencyBonus: 0,
          continuityBonus: 0,
          repetitionPenalty: 0,
          worldEventBonus,
          finalScore,
          explanation: `Inquisitive orientation driven by ambient creature or light stimulus (${Math.round(distraction * 100)}% salience).`,
        };
      },
      createActionRequest: (ctx: CognitiveContext): ActionRequest => ({
        type: 'CONTINUE_ACTIVITY',
        targetWaypoint: ctx.worldEffects?.suggestedWaypoint || 'window',
        targetFlyActivity: 'hovering',
        actionLabel: 'Observing Ambient Scene',
      }),
    });
  }
}
