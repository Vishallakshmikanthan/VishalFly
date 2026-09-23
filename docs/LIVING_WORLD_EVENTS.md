# Milestone 5: Living World, Emergent Events & Autonomous Daily Life

## 1. Overview & Architectural Philosophy

Milestone 5 introduces a lightweight, deterministic-capable **Living World Event System** to **VishalFly**, transforming static environments into dynamic, emergent spaces where ambient creatures pass through, lighting shifts naturally, food availability fluctuates, and college/apartment interruptions occur.

Crucially, **schedules are treated as contextual priority guides rather than hardcoded rigid movement scripts**. Decisions are arbitrated through explicit, inspectable utility evaluations that synthesize:
1. Physiological need urgencies (Hunger, Thirst, Fatigue, Energy).
2. Schedule context priorities.
3. Active world events and emergent environmental stimuli.
4. Learned associative odor valences from the mushroom-body circuit.
5. Hysteresis cooldowns preventing rapid behavior oscillation.
6. Epistemic memory of visited waypoints and food depletion.

> [!IMPORTANT]
> **Scientific Integrity & Simulation Boundary**:
> World events, utility scores, and weekend human routines (laundry, food deliveries) are **simulation abstractions** inspired by daily PG life. They are **not** claims of empirical fruit-fly neurobiology or measured human behavioral psychology. The biological connectome (LIF circuit) provides low-level obstacle avoidance, looming escape, and olfactory-gustatory chemotaxis, while the Living World system provides the ecological and schedule context in which the agent lives.

---

## 2. World Event Architecture & Update Order

The living-world simulation is orchestrated inside `src/simulation/events/WorldEventSystem.ts` and integrated into the deterministic cycle of `SimulationEngine.ts`.

### Simulation Tick Execution Order
In every simulation step (`step(deltaRealSeconds)`):
1. **Clock Advance (`SimulationClock`)**: Computes simulated delta time ($\Delta t_{sim}$) and checks for day or minute rollover.
2. **World Event System Step (`WorldEventSystem.step`)**:
   - Decrements remaining durations of active events ($\tau_{rem} \leftarrow \tau_{rem} - \Delta t_{sim}$).
   - Retires expired events to historical log.
   - Evaluates periodic trigger checks at interval $I_{eval} = 5$ simulated minutes.
   - Calculates aggregate environmental effects:
     $$\text{Effects} = \bigoplus_{e \in \mathcal{E}_{active}} \text{Effect}(e)$$
3. **Needs System Update (`NeedsSystem.update`)**:
   - Applies baseline hourly decay/recovery rates modified additively by $\text{Effects.needsDeltaPerHour}$.
4. **Subsystem Progressions**: Advances active workouts, meals, laundry, assignments, or food orders.
5. **Activity Manager & Travel Transition**: If traveling, advances continuous interpolated transit. **Never teleports or snaps positions.**
6. **Cognitive Engine & Decision Arbitration (`CognitiveEngine.step`)**:
   - Ingests sensory perception, current activity, needs, and aggregate world effects.
   - Computes multi-factor utility evaluations for all behavior candidates.
   - Applies anti-oscillation cooldown hysteresis.
   - Emits winning `ActionDecision` with full inspectable breakdown.
7. **Biological Connectome Integration (`ConnectomeAdapter`)**:
   - If in `connectome` mode, maps winning cognitive goal to goal-direction headings for the central complex and local olfactory gradient ascent.
8. **Telemetry Generation & Snapshot Recording**:
   - Captures `WorldEventTelemetry` for the UI dashboard and historical replay.

---

## 3. Configurable Event Catalog

The system includes 18 declarative event definitions across 6 typed categories (`src/simulation/events/WorldEventDefinitions.ts`):

| Category | Event ID | Location | Base Probability | Duration Bounds | Effects Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ambient Creatures** | `visitor_fly_window` | `bedroom` | 0.35 | 120s – 360s | +15% attention distraction, window visitor fly spawn |
| | `fruit_flies_fruit_bowl` | `bedroom` | 0.40 | 180s – 480s | -5g food delta on desk, +20% distraction, swarm creature |
| | `balcony_birds_clothesline` | `balcony` | 0.45 | 90s – 300s | Balcony sparrows on railing, +30% distraction |
| | `courtyard_butterfly` | `grounds` | 0.35 | 150s – 420s | Courtyard butterfly gliding near garden bench |
| **Lighting & Ambience** | `golden_hour_sunbeam` | `all` | 0.60 | 300s – 900s | Afternoon lighting override, +5/h focus, fatigue reduction |
| | `cloud_cover_dimming` | `all` | 0.35 | 240s – 720s | Dawn/overcast lighting, +4/h sleepiness, rest utility bonus |
| | `desk_reading_lamp` | `bedroom` | 0.50 | 600s – 1800s | Warm night lighting, +8/h focus, study utility bonus |
| **Food Availability** | `snack_bowl_refreshed` | `bedroom` | 0.45 | 600s – 1800s | +40g snack replenished, +0.35 odor intensity, forage bonus |
| | `dining_buffet_replenished`| `dining` | 0.55 | 900s – 2400s | +50g buffet food, steam aroma increase, meal utility bonus |
| | `food_counter_clearing` | `dining` | 0.30 | 300s – 900s | -30g dining table food, odor reduction |
| **College / Apartment** | `corridor_footsteps` | `all` | 0.40 | 90s – 240s | Echoing hallway footsteps, +25% attention distraction |
| | `roommate_study_session` | `bedroom` | 0.35 | 300s – 900s | Study partner discussion, social need reduction, focus bonus |
| | `class_bell_rush` | `classroom` | 0.50 | 120s – 300s | Class change bell, hallway bustle, travel utility boost |
| | `late_night_quiet` | `bedroom` | 0.70 | 900s – 3600s | Night stillness, +6/h sleepiness, deep sleep utility boost |
| **Interruptions** | `sudden_window_draft` | `all` | 0.35 | 45s – 120s | Strong gust of air, startle reaction, relocation to lamp |
| | `desk_knock_disturbance` | `bedroom` | 0.30 | 30s – 90s | Mechanical surface vibration, flight takeoff response |
| **Weekend Routine** | `balcony_drying_breeze` | `balcony` | 0.50 | 300s – 900s | Gentle drying breeze on clothesline, energy boost |
| | `delivery_order_gate_ready`| `all` | 0.60 | 180s – 600s | Delivery partner arrival chime, dining food delivery |

---

## 4. Determinism & Seeded Pseudo-Randomness

All probabilistic events use the **Mulberry32 PRNG**, a 32-bit state generator delivering high statistical dispersion with zero external dependencies:

```typescript
export class Mulberry32PRNG {
  private state: number;

  constructor(seed: number = 42) {
    this.state = seed >>> 0;
  }

  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}
```

### Reproducibility Guarantees
- Given identical seeds and identical step intervals, two distinct simulation instances generate **identical event sequences**, identical durations, and identical outcomes.
- High simulation speeds (`2x`, `4x`, `8x`) accumulate elapsed simulation seconds and evaluate triggers at fixed simulation intervals, ensuring event generation frequency is speed-invariant.

---

## 5. Autonomous Decision-Making & Arbitration

The agent balances multiple internal drives and external factors through an inspectable multi-factor scoring function:

$$\text{FinalScore} = \text{clamp}\Big(\text{BaseUtility} \cdot \text{ScheduleCompat} + \text{NeedBonus} + \text{WorldEventBonus} + \text{LearnedValence} - \text{CooldownPenalty},\, 0,\, 100\Big)$$

### Decision Components:
1. **Base Utility ($\text{BaseUtility}$)**: Inherent behavioral drive (e.g. foraging, studying, grooming, resting).
2. **Schedule Compatibility ($\text{ScheduleCompat} \in [0.2, 1.2]$)**: Schedule entries serve as soft priorities. High compatibility provides a boost, while off-schedule behaviors receive dampening but are **not** strictly locked out.
3. **Need Urgency Bonus ($\text{NeedBonus}$)**: High physiological deficits (e.g. hunger $> 60\%$) dynamically elevate urgent corrective actions (e.g. `forage_food_seeking`, `eat_meal`).
4. **World Event Bonus ($\text{WorldEventBonus}$)**: Emergent events supply utility multipliers or bonuses to relevant behaviors (e.g. food aroma rush provides $+30\%$ foraging score).
5. **Learned Valence ($\text{LearnedValence}$)**: Memory of odor-reward pairings (Mushroom Body Kenyon Cell-to-MBON weights) boosts attraction to familiar rewarding food odors.
6. **Hysteresis Anti-Oscillation Penalty ($\text{CooldownPenalty}$)**: When switching away from a behavior, that behavior enters a 120-second simulation cooldown. If re-evaluated immediately, it incurs a steep penalty, preventing high-frequency thrashing between adjacent options.

---

## 6. Memory and Adaptation Extensions

`CognitiveMemory.ts` has been extended to support bounded, structured episodic records:
- **Spatial Waypoint Memory**: Records visited room waypoints (`recordVisitedWaypoint`) with timestamps. Enables exploratory diversity by penalizing recently visited interaction perches.
- **Food Depletion Memory**: Remembers depleted food surfaces (`recordFoodSurfaceOutcome`) for up to 90 simulated minutes, avoiding fruit bowls or counters known to be exhausted.
- **World Event Memory**: Stores significant environmental events (`recordWorldEvent`) with salience ratings and 90-minute retention.
- **Bounded Resource Usage**: Memory records are bounded to a maximum capacity (default 60 records) and pruned chronologically, preventing memory leaks during indefinite simulation sessions.

---

## 7. Continuous World Interactions & Weekend Routines

### Non-Teleporting Physical Travel
To preserve immersion and locomotion realism, world interactions **never teleport or snap the agent**:
- Transitions between the bedroom, balcony, and apartment gate route through `activityManager.initiateTravel(targetLocation)`.
- The agent enters a continuous `travelling` state, smoothly moving along spatial flight corridors toward destination landmarks.

### Weekend Routine State Progression
- **Weekend Laundry**:
  - `startLaundry()` initiates wardrobe sorting in the bedroom (`stage: 'washing'`).
  - Agent physically travels to the balcony clothesline (`stage: 'drying'`).
  - Ambient breezes ripple the hanging clothes.
  - Return travel brings the agent back to the bedroom upon completion.
- **Midnight Food Order Delivery**:
  - Event `delivery_order_gate_ready` signals arrival of delivery partner at the gate.
  - Fly navigates toward the apartment entrance / dining pickup station.
  - Food is collected and brought to the dining table.
  - Transitions directly into feeding behavior with replenishing hunger recovery.

---

## 8. Living World Dashboard UI

A dedicated **Living World** panel is accessible directly from the top navigation bar (`Globe` icon) or by clicking the floating active event badge in the 3D HUD:
- **Active Emergent Events**: Displays event card, category badge, elapsed/remaining duration progress bar, and active effects summary.
- **Cumulative Influence Telemetry**: Real-time readouts of cumulative hunger drift, focus drift, distraction factor, and lighting preset override.
- **Decision Arbitration Inspector**: Displays active behavior, target zone, and live breakdown of base utility, need weights, schedule compatibility, world event bonuses, and hysteresis penalties.
- **Category Toggles & Seed Sandbox**: Six independent category checkboxes, seed re-roll/input, master pause switch, and one-click manual event trigger sandbox buttons.
- **Recent Event History Log**: Chronological log of recent emergent occurrences with sim timestamps and completion statuses.

---

## 9. Verification & Build Summary

### Test Suite Execution
- **Test Command**: `npm run test`
- **Results**: 14 test suites, **185 tests passed, 0 failed**.
- **Coverage**: Full automated verification across all 16 Milestone 5 specifications:
  1. Deterministic generation under fixed seed.
  2. Event trigger preconditions and duration bounds.
  3. Countdown progression and expiration cleanup.
  4. Category toggles and master disabled switch.
  5. Bounded concurrent event counts ($\le 4$) and history ($\le 50$).
  6. Correct routing of event effects to physiological needs.
  7. Schedule context influencing arbitration without hardcoding.
  8. Hysteresis cooldowns preventing rapid behavior oscillation.
  9. Food surface depletion and learned valence influencing destination selection.
  10. Manual flight mode remaining fully responsive and unblocked.
  11. 3D spatial boundaries and obstacle bounds preserved.
  12. Weekend laundry and food order state progressions.
  13. Absence of instant teleportation during world interactions.
  14. Accelerated simulation stability ($8\times$ speed).
  15. Full backward compatibility with Milestone 1–4 subsystems.
  16. Live telemetry synchronicity with internal simulation state.

### Production Build
- **Build Command**: `npm run build` (`tsc -b && vite build`)
- **Status**: Build succeeded cleanly with zero TypeScript errors.
