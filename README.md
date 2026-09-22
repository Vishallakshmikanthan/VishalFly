# VishalFly — Autonomous Life Simulation Engine (Milestone 3)

**VishalFly** is a 3D WebGL life simulation and interactive digital twin featuring an autonomous fruit-fly agent that follows a realistic, configurable daily timetable across university academic life, fitness routines, and personal development in Chennai.

Built with **React 19**, **TypeScript**, **Three.js**, **@react-three/fiber**, **Zustand**, and **Tailwind CSS**.

---

## What's New in Milestone 3

Milestone 3 transforms VishalFly from a manually steered 3D room into a fully autonomous, clock-driven life simulation engine.

### Core Simulation Engine Architecture
- **Decoupled Delta-Time Clock (`SimulationClock`)**: Runs on its own independent simulation delta time, insulated from React re-renders and Three.js frame rates.
- **Configurable Speed Controls**: Seamless real-time switching between `1x`, `2x`, `4x`, and `8x` simulation speeds, with instantaneous `Pause`, `Resume`, and `Restart Day` functionality.
- **Midnight & Multi-Day Rollover**: Deterministically rolls over time at midnight (23:59 -> 00:00), increments `dayNumber`, advances weekdays (`Monday` -> `Tuesday` -> ... -> `Sunday`), and automatically swaps between weekday and weekend schedules.
- **Schedule Planner (`SchedulePlanner`)**: Evaluates the active schedule entry for any simulated minute, cleanly manages overnight activities that span midnight (e.g. Sleep from 23:15 to 06:00), and provides resilient fallback activities if schedule gaps are encountered.
- **Autonomous Behavior Selector (`BehaviorSelector`)**: Introduces weighted probability variations during college lectures (Lecture 50%, Dozing 20%, Project 15%, Reels 10%, Mobile Game 5%) with evaluation interval dampening to avoid unrealistic rapid switching.
- **Activity State Machine (`ActivityManager`)**: Coordinates the full activity lifecycle (`pending` -> `travelling` -> `starting` -> `active` -> `completing` -> `completed`) with transit durations before arrival.
- **Needs System (`NeedsSystem`)**: Models 6 simulated needs (Energy, Hunger, Sleepiness, Fatigue, Focus, Social Need) clamped strictly to `[0, 100]` with hourly decay/recovery rates and threshold alert notifications.
- **Centralized Event Logger (`EventLogger`)**: Records activity transitions, departures, arrivals, college variations, and needs warnings with duplicate suppression and history filtering.
- **3D Placeholder Environments**: Graceful stylized 3D environments for locations pending asset development (`gym`, `grounds`, `balcony`, `travel`), allowing full continuous autonomous simulation without blank screens.
- **Rich Modern HUD**: Real-time clock display, weekday badge, current/next activity indicator, autonomous/manual toggle, 6 glowing dynamic needs meters, and slide-in Event Log drawer.

---

## Daily Routine Schedules

### Weekday Schedule (`src/simulation/config/schedule.json`)
| Time | Activity | Location |
| :--- | :--- | :--- |
| **06:00–06:30** | Wake up and morning routine | PG Room (`bedroom`) |
| **06:30–07:15** | Morning preparation | PG Room (`bedroom`) |
| **07:15–08:00** | Travel to college | Transit (`travel`) |
| **08:00–16:00** | College activities & lectures | College (`classroom`) |
| **16:00–16:30** | Return to PG | Transit (`travel`) |
| **16:30–17:00** | Freshen up | PG Room (`bedroom`) |
| **17:00–18:45** | Gym strength training | Fitness Gym (`gym`) |
| **18:45–19:15** | Dinner mess meal | Dining Area (`dining`) |
| **19:15–20:00** | Family call and apartment walk | Apartment Grounds (`grounds`) |
| **20:00–22:45** | Project work and upskilling | PG Room (`bedroom`) |
| **22:45–23:15** | College assignments | PG Room (`bedroom`) |
| **23:15–06:00** | Deep night sleep (overnight) | PG Room (`bedroom`) |

### Weekend Schedule
| Time | Activity | Location |
| :--- | :--- | :--- |
| **08:30–09:00** | Wake up and morning routine | PG Room (`bedroom`) |
| **09:00–10:00** | Project work | PG Room (`bedroom`) |
| **10:00–11:00** | Weekend laundry | PG Room (`bedroom`) |
| **11:00–12:00** | Dry clothes in sunlight | Balcony (`balcony`) |
| **12:00–13:00** | Lunch mess meal | Dining Area (`dining`) |
| **13:00–16:00** | Project work sprint | PG Room (`bedroom`) |
| **16:00–17:00** | Free time & courtyard stroll | Apartment Grounds (`grounds`) |
| **17:00–18:30** | Gym workout | Fitness Gym (`gym`) |
| **18:30–19:00** | Dinner mess meal | Dining Area (`dining`) |
| **19:00–20:00** | Family call and walking | Apartment Grounds (`grounds`) |
| **20:00–23:30** | Night project hacking | PG Room (`bedroom`) |
| **23:30–08:30** | Weekend deep sleep (overnight) | PG Room (`bedroom`) |

---

## Implemented vs Deferred Features

### Implemented in Milestone 3
- [x] Modular simulation engine independent of React and Three.js rendering loops.
- [x] Controllable simulation clock with delta-time updates, pause/resume, 1x/2x/4x/8x multipliers, and day restart.
- [x] Midnight rollover handling and multi-day progression with weekday/weekend automatic schedule switching.
- [x] Overnight sleep span resolution crossing midnight.
- [x] Schedule planner with gap-handling fallback activity and schedule validation.
- [x] College sub-behavior weighted selector with dampened evaluation intervals.
- [x] Activity lifecycle state machine (`pending` -> `travelling` -> `starting` -> `active` -> `completing` -> `completed`).
- [x] Autonomous location transitions with travel durations.
- [x] 6-parameter Needs system (Energy, Hunger, Sleepiness, Fatigue, Focus, Social) clamped between 0 and 100 with threshold alerts.
- [x] Deduplicating Event Logger with category filtering.
- [x] HUD integration with simulation controls, needs meters, next activity countdown, and event log drawer.
- [x] 15-scenario automated unit test suite passing 100%.

### Deferred to Future Milestones
- [ ] Detailed Push/Pull/Legs exercise state machine with animated gym equipment interactions.
- [ ] Physics-based laundry loading and clothes-hanging animation sequences on the balcony.
- [ ] Midnight food collection stealth sequence in the mess kitchen.
- [ ] High-fidelity 3D modeling of Gym, Balcony, Apartment Grounds, and Transit environments (currently rendered as sleek stylized placeholder stages).
- [ ] Advanced long-term statistics and retrospective analytics charts.

---

## Getting Started & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone or navigate to the repository
cd VishalFly

# Install dependencies
npm install
```

### Running Locally
```bash
# Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### Running Unit Tests
```bash
# Execute the comprehensive 15-scenario simulation engine test suite
npm test
```

### Production Build
```bash
npm run build
```

---

## Controls
- **Autonomous Mode**: Enabled by default. The fly navigates autonomously to activity landmarks and follows the daily schedule.
- **Manual Flight**: Use `W`, `A`, `S`, `D` to fly horizontally; `Space` to ascend, `Shift` or `C` to descend. Manual keyboard input seamlessly overrides autonomous navigation.
- **Simulation Speed**: Click `1x`, `2x`, `4x`, or `8x` on the top bar.
- **Pause / Resume**: Click the Play/Pause button or toggle simulation state.
- **Event Log**: Click the scroll icon in the top right to open the real-time simulation event stream.
- **Location Switching**: Press `1` for PG Room, `2` for Classroom, `3` for Dining Area, or let the schedule transit autonomously.
