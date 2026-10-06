import React from 'react';
import { Html } from '@react-three/drei';
import {
  Building2,
  Building,
  Train,
  Trees,
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
  Compass,
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
 * 3D pinned floating landmark badges directly matching the Chennai City Master Map:
 * - Chennai Central & Egmore Railway Stations
 * - Marina Beach & Chennai Lighthouse
 * - Kapaleeswarar Temple (Mylapore)
 * - T. Nagar (Shopping & Commercial)
 * - Anna Salai (Offices & Malls)
 * - OMR - IT Corridor (Tech Parks & Tidel Park)
 * - Kathipara Junction & Guindy IT Hub
 * - Guindy National Park
 * - Chennai International Airport (MAA)
 * - Planned Residential Township & Anna Nagar
 * - Adyar River & Bridges, Besant Nagar Beach
 * - Interactive Room Badges: Vishal's PG Bedroom, Canteen, Gym, Lecture Hall CS-301
 */
export const MetropolitanLabels: React.FC = () => {
  const showLabels = useGameStore((state) => state.showLabels);
  const switchLocation = useGameStore((state) => state.switchLocation);

  if (!showLabels) return null;

  const badges: LandmarkBadge[] = [
    // 1. Chennai International Airport
    {
      id: 'airport',
      name: 'Chennai International Airport (MAA)',
      position: [125, 26, 135],
      icon: Plane,
      bgClass: 'bg-[#0369a1]/95',
      borderClass: 'border-sky-400/80 ring-1 ring-sky-400/50',
      textClass: 'text-sky-100',
    },
    // 2. Kathipara Junction & Guindy
    {
      id: 'kathipara_junction',
      name: 'Kathipara Cloverleaf Flyover (Guindy)',
      position: [0, 16, 50],
      icon: Navigation,
      bgClass: 'bg-[#15803d]/95',
      borderClass: 'border-emerald-400/80 ring-1 ring-emerald-400/50',
      textClass: 'text-emerald-100',
    },
    // 3. Guindy National Park
    {
      id: 'guindy_park',
      name: 'Guindy National Park (Forest Reserve)',
      position: [-52, 14, 8],
      icon: Trees,
      bgClass: 'bg-[#14532d]/95',
      borderClass: 'border-emerald-500/80',
      textClass: 'text-emerald-200',
    },
    // 4. Chennai Central Railway Station
    {
      id: 'chennai_central',
      name: 'Puratchi Thalaivar Dr. M.G.R Chennai Central',
      position: [-55, 24, -40],
      icon: Train,
      bgClass: 'bg-[#991b1b]/95',
      borderClass: 'border-rose-400/80 ring-1 ring-rose-400/50',
      textClass: 'text-rose-100',
    },
    // 5. CMBT Koyambedu Bus Terminus
    {
      id: 'cmbt_bus',
      name: 'CMBT Koyambedu Bus Terminus',
      position: [-38, 16, 12],
      icon: Bus,
      bgClass: 'bg-[#065f46]/95',
      borderClass: 'border-teal-400/80',
      textClass: 'text-teal-100',
    },
    // 6. Marina Beach & Lighthouse
    {
      id: 'marina_lighthouse',
      name: 'Marina Beach & Chennai Lighthouse',
      position: [78, 28, 18],
      icon: Waves,
      bgClass: 'bg-[#0369a1]/95',
      borderClass: 'border-cyan-400/80 ring-1 ring-cyan-400/50',
      textClass: 'text-cyan-100',
    },
    // 7. Kapaleeswarar Temple (Mylapore)
    {
      id: 'kapaleeswarar_temple',
      name: 'Kapaleeswarar Temple (Mylapore)',
      position: [58, 22, 15],
      icon: Landmark,
      bgClass: 'bg-[#c2410c]/95',
      borderClass: 'border-amber-400/80 ring-1 ring-amber-400/50',
      textClass: 'text-amber-100',
    },
    // 8. T. Nagar (Shopping & Commercial)
    {
      id: 'tnagar_commercial',
      name: 'T. Nagar • Pondy Bazaar & Theatres',
      position: [-25, 20, -42],
      icon: Store,
      bgClass: 'bg-[#831843]/95',
      borderClass: 'border-pink-400/80 ring-1 ring-pink-400/50',
      textClass: 'text-pink-100',
    },
    // 9. Anna Salai (Offices & Malls)
    {
      id: 'anna_salai',
      name: 'Anna Salai (Commercial Expressway & Malls)',
      position: [-15, 26, -10],
      icon: Building2,
      bgClass: 'bg-[#0f172a]/95',
      borderClass: 'border-blue-400/80',
      textClass: 'text-blue-100',
    },
    // 10. OMR - IT Corridor (Offices & Tech Parks)
    {
      id: 'tidel_park',
      name: 'OMR - IT Corridor • Tidel Park',
      position: [-65, 26, 48],
      icon: Landmark,
      bgClass: 'bg-[#0f172a]/95',
      borderClass: 'border-cyan-400/80 ring-1 ring-cyan-400/50',
      textClass: 'text-cyan-200',
    },
    // 11. Residential Township (Apartments / Villas)
    {
      id: 'township_residences',
      name: 'Planned Residential Township',
      position: [45, 22, -65],
      icon: Building,
      bgClass: 'bg-[#1e293b]/95',
      borderClass: 'border-amber-400/80 ring-1 ring-amber-400/50',
      textClass: 'text-amber-200',
    },
    // 12. Anna Nagar (Residential + Shops)
    {
      id: 'anna_nagar',
      name: 'Anna Nagar (Tower Park & Residences)',
      position: [-12, 28, -85],
      icon: Compass,
      bgClass: 'bg-[#15803d]/95',
      borderClass: 'border-emerald-400/80 ring-1 ring-emerald-400/50',
      textClass: 'text-emerald-100',
    },
    // 13. Adyar River & Bridges
    {
      id: 'adyar_river',
      name: 'Adyar River & Road Bridges',
      position: [15, 10, 65],
      icon: Waves,
      bgClass: 'bg-[#0369a1]/95',
      borderClass: 'border-sky-400/80',
      textClass: 'text-sky-100',
    },
    // 14. Besant Nagar (Residential + Beach)
    {
      id: 'besant_nagar',
      name: "Besant Nagar & Elliot's Beach",
      position: [68, 16, 80],
      icon: Waves,
      bgClass: 'bg-[#0f172a]/95',
      borderClass: 'border-cyan-400/80',
      textClass: 'text-cyan-200',
    },
    // 15. Red Hills Lake
    {
      id: 'red_hills_lake',
      name: 'Red Hills Lake (Freshwater Reservoir)',
      position: [45, 14, -115],
      icon: Waves,
      bgClass: 'bg-[#0284c7]/95',
      borderClass: 'border-blue-400/80',
      textClass: 'text-blue-100',
    },
    // 16. Porur (Residential + Malls)
    {
      id: 'porur_district',
      name: 'Porur (Residential Township & Malls)',
      position: [-85, 22, -20],
      icon: Building,
      bgClass: 'bg-[#1e293b]/95',
      borderClass: 'border-indigo-400/80',
      textClass: 'text-indigo-200',
    },
    // 17. Chennai Engineering College & Campus
    {
      id: 'educational_campus',
      name: 'Chennai Engineering College & School',
      position: [-78, 24, 92],
      icon: School,
      bgClass: 'bg-[#991b1b]/95',
      borderClass: 'border-amber-400/80 ring-1 ring-amber-400/50',
      textClass: 'text-amber-100',
    },
    // 18. Hospital
    {
      id: 'hospital',
      name: 'Kamatchi Multi-Specialty Hospital',
      position: [36, 16, 72],
      icon: Plus,
      bgClass: 'bg-[#0f172a]/90',
      borderClass: 'border-rose-500/60',
      textClass: 'text-rose-200',
    },

    // -----------------------------------------------------------
    // INTERACTIVE FULL ROOM INTERFACE ENTRANCES
    // -----------------------------------------------------------
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
  ];

  return (
    <group name="Metropolitan3DLabels">
      {badges.map((b) => {
        const Icon = b.icon;
        const isClickable = Boolean(b.locationId);

        return (
          <group key={b.id} position={b.position}>
            <Html center distanceFactor={85} style={{ pointerEvents: 'auto' }}>
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
