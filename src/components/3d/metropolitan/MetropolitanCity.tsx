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

/**
 * MetropolitanCity:
 * Master 3D scene combining all urban metropolitan systems matching the reference image:
 * - Lakes & landscaped waterfront park with Chinese pavilion
 * - High-rise decorated luxury apartments & suburban residential homes
 * - Massive shopping mall with LED billboards ("MALL", etc.)
 * - Street-level shops, cafes, and outdoor dining
 * - Corporate office towers
 * - Hospital with medical red cross & trauma helipad
 * - Industrial zone with warehouses, tanks, containers, and trucks
 * - Massively expanded PowerFit Mega Gym with extensive equipment
 * - Elevated metro viaduct, modern metro station, and animated metro train
 * - Multi-lane roads with moving traffic (cars, taxis, buses, vans)
 * - Pedestrian agents walking and roaming through the city
 * - 3D pinned floating landmark badges
 */
export const MetropolitanCity: React.FC = () => {
  return (
    <group name="MetropolitanCityContainer">
      {/* 1. Global Environmental Lighting for the Metropolis */}
      <ambientLight intensity={1.1} color="#f8fafc" />
      <directionalLight
        position={[60, 90, 50]}
        intensity={2.2}
        color="#fffbeb"
        castShadow={false}
      />
      <directionalLight
        position={[-50, 40, -40]}
        intensity={0.9}
        color="#38bdf8"
        castShadow={false}
      />

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
