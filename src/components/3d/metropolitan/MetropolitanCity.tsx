import React from 'react';
import { MetropolitanRoadsAndInfrastructure } from './MetropolitanRoadsAndInfrastructure';
import { MetropolitanLakeAndPark } from './MetropolitanLakeAndPark';
import { MetropolitanApartments } from './MetropolitanApartments';
import { MetropolitanApartmentComplex } from './MetropolitanApartmentComplex';
import { MetropolitanShoppingMall } from './MetropolitanShoppingMall';
import { MetropolitanOffices } from './MetropolitanOffices';
import { MetropolitanShopsRestaurants } from './MetropolitanShopsRestaurants';
import { MetropolitanHospital } from './MetropolitanHospital';
import { MetropolitanIndustrialZone } from './MetropolitanIndustrialZone';
import { MetropolitanUnderBridgePark } from './MetropolitanUnderBridgePark';
import { MetropolitanTransit } from './MetropolitanTransit';
import { MetropolitanTraffic } from './MetropolitanTraffic';
import { MetropolitanPedestrians } from './MetropolitanPedestrians';
import { MetropolitanLabels } from './MetropolitanLabels';
import { MetropolitanSkyAndAtmosphere } from './MetropolitanSkyAndAtmosphere';
import { MetropolitanWeatherSystem } from './MetropolitanWeatherSystem';
import { MetropolitanInfiniteHorizon } from './MetropolitanInfiniteHorizon';
import { MetropolitanAirport } from './MetropolitanAirport';
import { MetropolitanRailwayStation } from './MetropolitanRailwayStation';
import { MetropolitanBusStand } from './MetropolitanBusStand';
import { MetropolitanTowersDistrict } from './MetropolitanTowersDistrict';
import { useGameStore } from '../../../store/useGameStore';

export const MetropolitanCity: React.FC = () => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const weather = useGameStore((state) => state.weather);

  const ambientColor = React.useMemo(() => {
    if (weather === 'stormy') return '#334155';
    if (weather === 'rainy') return '#475569';
    if (timeOfDay === 'morning') return '#fed7aa';
    if (timeOfDay === 'afternoon') return '#f8fafc';
    if (timeOfDay === 'evening') return '#fdba74';
    return '#1e293b'; // night
  }, [weather, timeOfDay]);

  const ambientIntensity = React.useMemo(() => {
    if (weather === 'stormy') return 0.55;
    if (weather === 'rainy') return 0.75;
    if (timeOfDay === 'night') return 0.4;
    if (timeOfDay === 'evening') return 0.95;
    return 1.2; // morning / afternoon
  }, [weather, timeOfDay]);

  return (
    <group name="MetropolitanCityContainer">
      {/* 1. Dynamic Natural Sky, Celestial Sun, Moon, Clouds, Starfield & Birds */}
      <MetropolitanSkyAndAtmosphere />

      {/* 2. Hollywood Weather Effects: Rain Streaks, Ground Splashes, Lightning Thunder */}
      <MetropolitanWeatherSystem />

      {/* 3. Infinite Horizon Expanse: 3.2km Terrain, Suburban Houses, Outer Towers & Mountains */}
      <MetropolitanInfiniteHorizon />

      {/* 4. Dynamic Atmospheric Ambient Lighting */}
      <ambientLight intensity={ambientIntensity} color={ambientColor} />

      {/* 2. Infrastructure & Road Network */}
      <MetropolitanRoadsAndInfrastructure />

      {/* 3. Water Bodies, Lake & Waterfront Promenade */}
      <MetropolitanLakeAndPark />

      {/* 4. Luxury Apartments & Suburban Residential Homes */}
      <MetropolitanApartments />

      {/* 4.1 Gated Apartment Complex, Walking Courtyard, Roadside Shops & Bus Stop */}
      <MetropolitanApartmentComplex />

      {/* 5. Shopping Mall Complex */}
      <MetropolitanShoppingMall />

      {/* 6. Corporate Office Towers */}
      <MetropolitanOffices />

      {/* 7. Commercial High Street Shops & Restaurants */}
      <MetropolitanShopsRestaurants />

      {/* 8. Hospital Complex */}
      <MetropolitanHospital />

      {/* 9. Industrial Warehousing Zone */}
      <MetropolitanIndustrialZone />

      {/* 9.1 International Airport Complex (Runway, Terminal, ATC Tower, Airplanes) */}
      <MetropolitanAirport />

      {/* 9.2 Grand Central Railway Station (Tracks, Platforms, Express & Bullet Trains) */}
      <MetropolitanRailwayStation />

      {/* 9.3 Central Bus Stand (Depot Canopy, Bus Bays, Volvo & City Buses) */}
      <MetropolitanBusStand />

      {/* 9.4 Metropolitan Towers & Skyscraper District (Twin Towers, Helipads, Mega Mall II, High-Rise Apts) */}
      <MetropolitanTowersDistrict />

      {/* 10. Under-Bridge Linear Park, Sports Turfs (Cricket, Football) & Flower Gardens */}
      <MetropolitanUnderBridgePark />

      {/* 11. Elevated Metro Viaduct & Moving Train */}
      <MetropolitanTransit />

      {/* 12. Animated Moving Traffic */}
      <MetropolitanTraffic />

      {/* 13. Roaming Pedestrian Agents */}
      <MetropolitanPedestrians />

      {/* 14. 3D Floating Landmark Labels */}
      <MetropolitanLabels />
    </group>
  );
};
