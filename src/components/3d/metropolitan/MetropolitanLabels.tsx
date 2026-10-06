import React from 'react';
import { Html } from '@react-three/drei';
import {
  Building2,
  ShoppingBag,
  Building,
  Train,
  Store,
  Trees,
  Factory,
  Home,
  Plus,
  Dumbbell,
  Bus,
  GraduationCap
} from 'lucide-react';
import { useGameStore } from '../../../store/useGameStore';

interface LandmarkBadge {
  id: string;
  name: string;
  position: [number, number, number];
  icon: React.ComponentType<{ className?: string }>;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

/**
 * MetropolitanLabels:
 * 3D pinned floating landmark badges matching the reference image:
 * - Offices, Shopping Mall, Apartments, Metro Station, Shops & Restaurants,
 *   Lake & Park, Industrial Zone, Residential Area, Hospital, PowerFit Gym
 * - Toggled on/off via the "Show Labels" switch in the bottom toolbar
 */
export const MetropolitanLabels: React.FC = () => {
  const showLabels = useGameStore((state) => state.showLabels);

  if (!showLabels) return null;

  const badges: LandmarkBadge[] = [
    {
      id: 'offices',
      name: 'Offices',
      position: [-38, 28, -12],
      icon: Building2,
      bgClass: 'bg-[#0f172a]/90',
      borderClass: 'border-cyan-500/50',
      textClass: 'text-cyan-200',
    },
    {
      id: 'shopping_mall',
      name: 'Shopping Mall',
      position: [-16, 20, 2],
      icon: ShoppingBag,
      bgClass: 'bg-[#831843]/90',
      borderClass: 'border-pink-500/60',
      textClass: 'text-pink-200',
    },
    {
      id: 'apartments',
      name: 'Apartments',
      position: [18, 38, -24],
      icon: Building,
      bgClass: 'bg-[#0f172a]/90',
      borderClass: 'border-slate-600/80',
      textClass: 'text-slate-100',
    },
    {
      id: 'metro_station',
      name: 'Metro Station',
      position: [-18, 14, 26],
      icon: Train,
      bgClass: 'bg-[#1e293b]/90',
      borderClass: 'border-blue-500/50',
      textClass: 'text-blue-200',
    },
    {
      id: 'shops_restaurants',
      name: 'Shops & Restaurants',
      position: [22, 13, 16],
      icon: Store,
      bgClass: 'bg-[#701a75]/90',
      borderClass: 'border-fuchsia-500/50',
      textClass: 'text-fuchsia-200',
    },
    {
      id: 'lake_park',
      name: 'Pallavaram Lake',
      position: [48, 12, 22],
      icon: Trees,
      bgClass: 'bg-[#064e3b]/90',
      borderClass: 'border-emerald-500/60',
      textClass: 'text-emerald-200',
    },
    {
      id: 'residential_area',
      name: 'Residential Area',
      position: [42, 10, 48],
      icon: Home,
      bgClass: 'bg-[#451a03]/90',
      borderClass: 'border-amber-600/60',
      textClass: 'text-amber-200',
    },
    {
      id: 'hospital',
      name: 'Kamatchi Hospital',
      position: [36, 14, 72],
      icon: Plus,
      bgClass: 'bg-[#0f172a]/90',
      borderClass: 'border-rose-500/60',
      textClass: 'text-rose-200',
    },
    {
      id: 'industrial_zone',
      name: 'Factories',
      position: [-50, 13, 52],
      icon: Factory,
      bgClass: 'bg-[#1e293b]/90',
      borderClass: 'border-slate-500/60',
      textClass: 'text-slate-200',
    },
    {
      id: 'mega_gym',
      name: 'SLAM Fitness Studio',
      position: [20, 7.5, 42],
      icon: Dumbbell,
      bgClass: 'bg-[#0c4a6e]/90',
      borderClass: 'border-sky-500/60',
      textClass: 'text-sky-200',
    },
    {
      id: 'under_bridge_park',
      name: 'Sports Turf & Kids Park',
      position: [-18, 5.5, 52],
      icon: Trees,
      bgClass: 'bg-[#064e3b]/90',
      borderClass: 'border-emerald-500/60',
      textClass: 'text-emerald-200',
    },
    {
      id: 'bus_stop',
      name: 'Vels Bus Stop',
      position: [9.5, 5.0, -3],
      icon: Bus,
      bgClass: 'bg-[#064e3b]/90',
      borderClass: 'border-emerald-500/60',
      textClass: 'text-emerald-200',
    },
    {
      id: 'college_campus',
      name: 'Sairam Engineering College',
      position: [-28, 9.0, 95],
      icon: GraduationCap,
      bgClass: 'bg-[#1e1b4b]/90',
      borderClass: 'border-indigo-500/60',
      textClass: 'text-indigo-200',
    },
  ];

  return (
    <group name="Metropolitan3DLabels">
      {badges.map((b) => {
        const Icon = b.icon;
        return (
          <group key={b.id} position={b.position}>
            <Html center distanceFactor={70} style={{ pointerEvents: 'none' }}>
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl shadow-2xl backdrop-blur-md border ${b.bgClass} ${b.borderClass} ${b.textClass} text-xs font-bold whitespace-nowrap cursor-default transition-transform hover:scale-110`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{b.name}</span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
