import React from 'react';
import { Html } from '@react-three/drei';
import {
  Building2,
  ShoppingBag,
  Building,
  Train,
  Trees,
  Factory,
  Home,
  Plus,
  Dumbbell,
  Bus,
  GraduationCap,
  Plane,
  Utensils,
  Navigation,
  Waves,
  Store,
  School,
  Landmark,
} from 'lucide-react';
import { useGameStore } from '../../../store/useGameStore';
import { LocationId } from '../../../types';

interface LandmarkBadge {
  id: string;
  name: string;
  position: [number, number, number];
  icon: React.ComponentType<{ className?: string }>;
  bgClass: string;
  borderClass: string;
  textClass: string;
  locationId?: LocationId;
}

/**
 * MetropolitanLabels:
 * 3D pinned floating landmark badges:
 * - Chennai Landmarks: Kathipara Junction, Chennai Central, CMBT, Marina Beach & Lighthouse,
 *   T. Nagar Commercial & Theatres, Tidel Park & OMR, Educational Campus, Airport
 * - Interactive: Clicking room badges instantly opens the Full Room Interface!
 */
export const MetropolitanLabels: React.FC = () => {
  const showLabels = useGameStore((state) => state.showLabels);
  const switchLocation = useGameStore((state) => state.switchLocation);

  if (!showLabels) return null;

  const badges: LandmarkBadge[] = [
    {
      id: 'kathipara_junction',
      name: 'Kathipara Cloverleaf Flyover (Guindy)',
      position: [0, 16, 50],
      icon: Navigation,
      bgClass: 'bg-[#15803d]/95',
      borderClass: 'border-emerald-400/80 ring-1 ring-emerald-400/50',
      textClass: 'text-emerald-100',
    },
    {
      id: 'chennai_central',
      name: 'Puratchi Thalaivar Dr. M.G.R Chennai Central',
      position: [-55, 24, -40],
      icon: Train,
      bgClass: 'bg-[#991b1b]/95',
      borderClass: 'border-rose-400/80 ring-1 ring-rose-400/50',
      textClass: 'text-rose-100',
    },
    {
      id: 'cmbt_bus',
      name: 'CMBT Koyambedu Bus Terminus',
      position: [-38, 16, 12],
      icon: Bus,
      bgClass: 'bg-[#065f46]/95',
      borderClass: 'border-teal-400/80',
      textClass: 'text-teal-100',
    },
    {
      id: 'marina_lighthouse',
      name: 'Marina Beach & Chennai Lighthouse',
      position: [78, 28, 18],
      icon: Waves,
      bgClass: 'bg-[#0369a1]/95',
      borderClass: 'border-cyan-400/80 ring-1 ring-cyan-400/50',
      textClass: 'text-cyan-100',
    },
    {
      id: 'tnagar_commercial',
      name: 'T. Nagar • Pondy Bazaar & Theatres',
      position: [-25, 20, -42],
      icon: Store,
      bgClass: 'bg-[#831843]/95',
      borderClass: 'border-pink-400/80 ring-1 ring-pink-400/50',
      textClass: 'text-pink-100',
    },
    {
      id: 'tidel_park',
      name: 'Tidel Park • OMR IT Expressway',
      position: [-65, 26, 48],
      icon: Landmark,
      bgClass: 'bg-[#0f172a]/95',
      borderClass: 'border-blue-400/80 ring-1 ring-blue-400/50',
      textClass: 'text-blue-200',
    },
    {
      id: 'township_residences',
      name: 'Planned Township Residences',
      position: [45, 22, -65],
      icon: Building,
      bgClass: 'bg-[#1e293b]/95',
      borderClass: 'border-amber-400/80 ring-1 ring-amber-400/50',
      textClass: 'text-amber-200',
    },
    {
      id: 'educational_campus',
      name: 'Chennai Engineering College & Public School',
      position: [-78, 24, 92],
      icon: School,
      bgClass: 'bg-[#991b1b]/95',
      borderClass: 'border-amber-400/80 ring-1 ring-amber-400/50',
      textClass: 'text-amber-100',
    },
    {
      id: 'airport',
      name: 'Chennai Meenambakkam Airport (MAA)',
      position: [125, 26, 135],
      icon: Plane,
      bgClass: 'bg-[#0369a1]/90',
      borderClass: 'border-sky-400/80',
      textClass: 'text-sky-100',
    },
    {
      id: 'apex_tower',
      name: 'The Apex Skyscraper (78m)',
      position: [-72, 45, -25],
      icon: Building2,
      bgClass: 'bg-[#0f172a]/95',
      borderClass: 'border-cyan-400/80',
      textClass: 'text-cyan-200',
    },
    {
      id: 'twin_towers',
      name: 'Twin Towers & Skybridge',
      position: [-52, 42, 95],
      icon: Building2,
      bgClass: 'bg-[#0f172a]/95',
      borderClass: 'border-indigo-400/80',
      textClass: 'text-indigo-200',
    },
    {
      id: 'shopping_mall_mega',
      name: 'Grand Metro Shopping Mall',
      position: [52, 22, -25],
      icon: ShoppingBag,
      bgClass: 'bg-[#831843]/95',
      borderClass: 'border-pink-500/80',
      textClass: 'text-pink-200',
    },
    {
      id: 'pg_bedroom',
      name: "Vishal's PG Bedroom (Room 204)",
      position: [16, 7.5, 27],
      icon: Home,
      bgClass: 'bg-[#0284c7]/95',
      borderClass: 'border-sky-300 ring-2 ring-sky-400/50',
      textClass: 'text-white',
      locationId: 'bedroom',
    },
    {
      id: 'pg_canteen',
      name: 'PG Mess & Canteen',
      position: [26, 7.5, 27],
      icon: Utensils,
      bgClass: 'bg-[#ea580c]/95',
      borderClass: 'border-amber-300 ring-2 ring-amber-400/50',
      textClass: 'text-white',
      locationId: 'dining',
    },
    {
      id: 'mega_gym',
      name: 'PowerFit Fitness Gym',
      position: [20, 8.5, 42],
      icon: Dumbbell,
      bgClass: 'bg-[#0284c7]/95',
      borderClass: 'border-sky-300 ring-2 ring-sky-400/50',
      textClass: 'text-white',
      locationId: 'gym',
    },
    {
      id: 'college_campus',
      name: 'Sairam College • Lecture Hall CS-301',
      position: [-28, 10.5, 95],
      icon: GraduationCap,
      bgClass: 'bg-[#4338ca]/95',
      borderClass: 'border-indigo-300 ring-2 ring-indigo-400/50',
      textClass: 'text-white',
      locationId: 'classroom',
    },
    {
      id: 'hospital',
      name: 'Kamatchi Multi-Specialty Hospital',
      position: [36, 16, 72],
      icon: Plus,
      bgClass: 'bg-[#0f172a]/90',
      borderClass: 'border-rose-500/60',
      textClass: 'text-rose-200',
    },
    {
      id: 'lake_park',
      name: 'Pallavaram Waterfront Lake & Pagoda',
      position: [48, 12, 22],
      icon: Trees,
      bgClass: 'bg-[#064e3b]/90',
      borderClass: 'border-emerald-500/60',
      textClass: 'text-emerald-200',
    },
    {
      id: 'industrial_zone',
      name: 'Logistics Warehouses & Cargo',
      position: [-50, 14, 52],
      icon: Factory,
      bgClass: 'bg-[#1e293b]/90',
      borderClass: 'border-slate-500/60',
      textClass: 'text-slate-200',
    },
    {
      id: 'under_bridge_park',
      name: 'Sports Turf & Kids Park',
      position: [-18, 6.5, 52],
      icon: Trees,
      bgClass: 'bg-[#064e3b]/90',
      borderClass: 'border-emerald-500/60',
      textClass: 'text-emerald-200',
    },
  ];

  return (
    <group name="Metropolitan3DLabels">
      {badges.map((b) => {
        const Icon = b.icon;
        const isClickable = Boolean(b.locationId);

        return (
          <group key={b.id} position={b.position}>
            <Html center distanceFactor={75} style={{ pointerEvents: 'auto' }}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (b.locationId) {
                    switchLocation(b.locationId);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl shadow-2xl backdrop-blur-md border ${b.bgClass} ${b.borderClass} ${b.textClass} text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  isClickable
                    ? 'cursor-pointer hover:scale-115 hover:shadow-cyan-500/50 hover:brightness-125 animate-pulse'
                    : 'cursor-default hover:scale-105'
                }`}
                title={isClickable ? `Click to enter ${b.name} Full Room Interface!` : b.name}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{b.name}</span>
                {isClickable && (
                  <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-white/20 rounded text-white ml-1">
                    Enter
                  </span>
                )}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
