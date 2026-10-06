/**
 * VISHALFLY — Biological Circadian Clock & Chore Routine Engine
 * 
 * Implements Drosophila circadian pacemaker neural dynamics (sLNv, lLNv, DN1p)
 * and neuromodulatory arousal systems (PAM Dopamine, Octopamine, NPF)
 * grounded in published fruit fly chronobiology:
 * 
 * - sLNv / lLNv: Small/Large ventral lateral neurons releasing Pigment-Dispersing Factor (PDF)
 * - DN1p: Dorsal neurons synchronizing morning/evening anticipation peaks
 * - PAM Dopamine Cluster: Mediates motivation for high-focus tasks (Coding & LeetCode)
 * - Octopaminergic Arousal: Motor burst for gym, commuting, and chores
 * - Neuropeptide F (NPF): Drives hunger and feeding search cycles
 */

import { ConnectomeGraph } from '../ConnectomeGraph';
import { LIFDynamicsEngine } from '../dynamics/LIFDynamicsEngine';
import { BiologicalCircuitData, NeuralStateSnapshot } from '../types';
import defaultCircadianCircuit from '../data/circadian_clock_circuit.json';

export type FlyLifeState =
  | 'sleep'
  | 'wake_up'
  | 'breakfast'
  | 'walk_to_bus'
  | 'bus_to_college'
  | 'college_lectures'
  | 'canteen_lunch'
  | 'library_study'
  | 'college_bus_wait'
  | 'bus_to_pg'
  | 'walk_to_pg'
  | 'freshen_up'
  | 'gym_workout'
  | 'dinner'
  | 'evening_walk_call'
  | 'coding_leetcode_grind'
  | 'sunday_laundry_balcony'
  | 'hometown_visit';

export interface CircadianRoutineTelemetry {
  simHour: number;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  isSunday: boolean;
  isHometownTrip: boolean;
  activeLifeState: FlyLifeState;
  stateLabel: string;
  recommendedLocation: 'bedroom' | 'classroom' | 'dining' | 'gym' | 'grounds' | 'balcony' | 'travel';
  recommendedWaypoint: string;
  targetLandmark: string;
  clockNeuronFiringRates: {
    slnv: number;
    llnv: number;
    dn1p: number;
  };
  neuromodulators: {
    dopamineGrind: number;   // 0.0 to 1.0 (Focus & Coding drive)
    octopamineArousal: number; // 0.0 to 1.0 (Physical motor burst / Gym)
    npfHungerDrive: number;    // 0.0 to 1.0 (Appetite / Feeding search)
    pdfArousalTiter: number;   // 0.0 to 1.0 (Circadian wakefulness)
  };
  snapshot: NeuralStateSnapshot;
}

export class CircadianRoutineEngine {
  private graph: ConnectomeGraph;
  private dynamicsEngine: LIFDynamicsEngine;

  public readonly SLNV_ID = 30001;
  public readonly LLNV_ID = 30002;
  public readonly DN1P_ID = 30003;
  public readonly PAM_DA_ID = 30004;
  public readonly OA_VUM_ID = 30005;
  public readonly NPF_ID = 30006;

  private isHometownWeekend: boolean = false;

  constructor(customGraph?: ConnectomeGraph) {
    this.graph = customGraph || new ConnectomeGraph(defaultCircadianCircuit as unknown as BiologicalCircuitData);
    this.dynamicsEngine = new LIFDynamicsEngine(this.graph);
  }

  public setHometownTrip(enabled: boolean): void {
    this.isHometownWeekend = enabled;
  }

  public getIsHometownTrip(): boolean {
    return this.isHometownWeekend;
  }

  /**
   * Evaluates the active 24-hour routine state from simulation clock minutes (0-1440)
   * and day of week (0=Sunday ... 6=Saturday).
   */
  public update(simMinutes: number, dayOfWeek: number = 1, dtSimSec: number = 0.05): CircadianRoutineTelemetry {
    const hour = (simMinutes / 60) % 24;
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;

    // 1. Compute Circadian Pacemaker Photoperiod Firing Drive
    // Morning peak at 07:00, Evening peak at 18:00 (bimodal Drosophila locomotor activity)
    const morningPhase = Math.exp(-Math.pow((hour - 7.0) / 2.2, 2));
    const eveningPhase = Math.exp(-Math.pow((hour - 18.5) / 2.5, 2));
    const midnightGrindPhase = (hour >= 20.0 || hour < 0.75) ? 1.0 : 0.0;
    const sleepPhase = (hour >= 0.75 && hour < 6.0) ? 1.0 : 0.0;

    // Injected current to clock and neuromodulatory neurons (nA)
    const iSlnv = 2.0 * (1.0 - sleepPhase) + morningPhase * 3.5;
    const iLlnv = 1.8 * (1.0 - sleepPhase) + eveningPhase * 3.0;
    const iDn1p = sleepPhase * 3.8 + 0.5;

    // PAM Dopamine strongly activated during evening Coding & LeetCode grind and Project Work
    const iPamDa = midnightGrindPhase * 4.2 + (eveningPhase * 1.5);
    // Octopamine surge during gym hours and morning walks
    const gymHour = hour >= 17.0 && hour < 18.75;
    const iOa = (gymHour ? 4.8 : 0.8) + (morningPhase * 1.5);
    // NPF peaks at meal times: breakfast (07:00-07:30), lunch (12:30-13:30), dinner (18:45-19:30)
    const isMealHour = (hour >= 7.0 && hour < 7.6) || (hour >= 12.3 && hour < 13.5) || (hour >= 18.75 && hour < 19.5);
    const iNpf = isMealHour ? 4.5 : 0.5;

    this.dynamicsEngine.setInjectedCurrent(this.SLNV_ID, iSlnv);
    this.dynamicsEngine.setInjectedCurrent(this.LLNV_ID, iLlnv);
    this.dynamicsEngine.setInjectedCurrent(this.DN1P_ID, iDn1p);
    this.dynamicsEngine.setInjectedCurrent(this.PAM_DA_ID, iPamDa);
    this.dynamicsEngine.setInjectedCurrent(this.OA_VUM_ID, iOa);
    this.dynamicsEngine.setInjectedCurrent(this.NPF_ID, iNpf);

    const dtMs = Math.max(1.0, Math.min(100.0, dtSimSec * 1000));
    const snapshot = this.dynamicsEngine.step(dtMs);

    const slnvRate = snapshot.firingRates[this.SLNV_ID] || 0;
    const llnvRate = snapshot.firingRates[this.LLNV_ID] || 0;
    const dn1pRate = snapshot.firingRates[this.DN1P_ID] || 0;
    const pamDaRate = snapshot.firingRates[this.PAM_DA_ID] || 0;
    const oaRate = snapshot.firingRates[this.OA_VUM_ID] || 0;
    const npfRate = snapshot.firingRates[this.NPF_ID] || 0;

    // 2. Resolve Life State according to User's Strict Order
    let lifeState: FlyLifeState = 'sleep';
    let location: 'bedroom' | 'classroom' | 'dining' | 'gym' | 'grounds' | 'balcony' | 'travel' = 'bedroom';
    let waypoint = 'bed';
    let landmark = 'Hovering over Bed & Orange Blanket';
    let label = 'Restorative Sleep';

    if (this.isHometownWeekend && (isSaturday || isSunday)) {
      lifeState = 'hometown_visit';
      location = 'bedroom';
      waypoint = 'bed';
      landmark = 'Relaxing with Family in Hometown';
      label = 'Weekend Hometown Trip (Spending time with Family)';
    } else if (isSunday && hour >= 9.5 && hour < 11.5) {
      // User chore: Sunday washing clothes in washing machine, dries in balcony, tea/coffee
      lifeState = 'sunday_laundry_balcony';
      location = 'balcony';
      waypoint = 'clothesline';
      landmark = 'Balcony Sunlight Railing';
      label = 'Sunday Chores (Washing Machine, Drying Clothes, Balcony Tea/Coffee)';
    } else {
      // Regular Daily Routine in Chennai PG
      if (hour >= 0.75 && hour < 6.0) {
        lifeState = 'sleep';
        location = 'bedroom';
        waypoint = 'bed';
        landmark = 'Hovering over Bed & Orange Blanket';
        label = 'Deep Sleep';
      } else if (hour >= 6.0 && hour < 7.0) {
        lifeState = 'wake_up';
        location = 'bedroom';
        waypoint = 'wardrobe';
        landmark = 'Near PG Wardrobe';
        label = 'Wake up & Get Ready for College';
      } else if (hour >= 7.0 && hour < 7.4) {
        lifeState = 'breakfast';
        location = 'dining';
        waypoint = 'dining_table_seat';
        landmark = 'Communal Dining Table';
        label = 'Eats Breakfast';
      } else if (hour >= 7.4 && hour < 7.7) {
        lifeState = 'walk_to_bus';
        location = 'travel';
        waypoint = 'transit';
        landmark = '1 km Walk to PG Bus Stop';
        label = 'Walking 1km to Bus Stop';
      } else if (hour >= 7.7 && hour < 8.7) {
        lifeState = 'bus_to_college';
        location = 'travel';
        waypoint = 'transit';
        landmark = '1-Hour Chennai Bus Commute';
        label = 'Boarding Bus & 1-Hour Travel to College';
      } else if (hour >= 8.7 && hour < 12.3) {
        lifeState = 'college_lectures';
        location = 'classroom';
        waypoint = 'student_desk_front';
        landmark = 'Front Row Student Desks';
        label = 'Attending College Lectures';
      } else if (hour >= 12.3 && hour < 13.3) {
        lifeState = 'canteen_lunch';
        location = 'dining';
        waypoint = 'buffet_counter';
        landmark = 'Buffet Hot Food Counter & Chafing Dishes';
        label = 'Eating Lunch in College Canteen';
      } else if (hour >= 13.3 && hour < 14.5) {
        lifeState = 'library_study';
        location = 'classroom';
        waypoint = 'laptop_spot';
        landmark = 'Middle Row Student Desks';
        label = 'College Library Study & Break';
      } else if (hour >= 14.5 && hour < 16.0) {
        lifeState = 'college_lectures';
        location = 'classroom';
        waypoint = 'student_desk_front';
        landmark = 'Front Row Student Desks';
        label = 'Afternoon Practical Classes';
      } else if (hour >= 16.0 && hour < 16.4) {
        lifeState = 'college_bus_wait';
        location = 'grounds';
        waypoint = 'path_node_3';
        landmark = 'Paved Walking Perimeter';
        label = 'Waiting for Bus at College Campus';
      } else if (hour >= 16.4 && hour < 17.4) {
        lifeState = 'bus_to_pg';
        location = 'travel';
        waypoint = 'transit';
        landmark = '1-Hour Chennai Bus Return Commute';
        label = '1-Hour Bus Commute Back to Room';
      } else if (hour >= 17.4 && hour < 17.7) {
        lifeState = 'walk_to_pg';
        location = 'travel';
        waypoint = 'transit';
        landmark = '1 km Return Walk to PG';
        label = '1km Walk from Bus Stop to Room';
      } else if (hour >= 17.7 && hour < 18.0) {
        lifeState = 'freshen_up';
        location = 'bedroom';
        waypoint = 'wardrobe';
        landmark = 'Near PG Wardrobe';
        label = 'Get Ready for Gym';
      } else if (hour >= 18.0 && hour < 19.5) {
        lifeState = 'gym_workout';
        location = 'gym';
        waypoint = 'bench_press';
        landmark = 'Bench Press Station';
        label = '1.5 Hours Gym Workout & Strength Training';
      } else if (hour >= 19.5 && hour < 20.2) {
        lifeState = 'dinner';
        location = 'dining';
        waypoint = 'dining_table_seat';
        landmark = 'Communal Dining Table';
        label = 'Eats Dinner';
      } else if (hour >= 20.2 && hour < 20.7) {
        lifeState = 'evening_walk_call';
        location = 'grounds';
        waypoint = 'path_node_2';
        landmark = 'Paved Walking Perimeter';
        label = 'Walking & Catching up with Family';
      } else {
        // 20:42 to 00:45: Deep Coding, LeetCode, Projects for Better Future!
        lifeState = 'coding_leetcode_grind';
        location = 'bedroom';
        waypoint = 'desk';
        landmark = 'Near Study Desk & Laptop';
        label = 'Deep Focus: Coding Projects, LeetCode & Building Future';
      }
    }

    return {
      simHour: hour,
      dayOfWeek,
      isSunday,
      isHometownTrip: this.isHometownWeekend,
      activeLifeState: lifeState,
      stateLabel: label,
      recommendedLocation: location,
      recommendedWaypoint: waypoint,
      targetLandmark: landmark,
      clockNeuronFiringRates: {
        slnv: slnvRate,
        llnv: llnvRate,
        dn1p: dn1pRate,
      },
      neuromodulators: {
        dopamineGrind: Math.min(1.0, pamDaRate / 40.0),
        octopamineArousal: Math.min(1.0, oaRate / 45.0),
        npfHungerDrive: Math.min(1.0, npfRate / 35.0),
        pdfArousalTiter: Math.min(1.0, (slnvRate + llnvRate) / 60.0),
      },
      snapshot,
    };
  }
}
