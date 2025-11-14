/**
 * Parking Simulator
 * Generates realistic parking availability data for Dubai
 */

import { ParkingZone, Location } from "@/types/mobility";

const DUBAI_ZONES = [
  { name: "Downtown Dubai", lat: 25.2048, lng: 55.2708 },
  { name: "Dubai Marina", lat: 25.0761, lng: 55.1704 },
  { name: "Business Bay", lat: 25.0331, lng: 55.1716 },
  { name: "Deira", lat: 25.1972, lng: 55.2744 },
  { name: "Jumeirah", lat: 25.276, lng: 55.3631 },
  { name: "JBR", lat: 25.2003, lng: 55.1577 },
  { name: "Arabian Ranches", lat: 25.148, lng: 55.2066 },
  { name: "Al Barsha", lat: 25.0754, lng: 55.3061 },
];

const PARKING_TYPES: Array<"street" | "garage" | "lot"> = [
  "street",
  "garage",
  "lot",
];

const NEARBY_POIS = [
  "Shopping Mall",
  "Restaurant",
  "Hotel",
  "Office",
  "Residential",
  "Beach",
];

/**
 * Generate a single parking zone
 */
function generateParkingZone(id: number): ParkingZone {
  const zone = DUBAI_ZONES[Math.floor(Math.random() * DUBAI_ZONES.length)];
  const capacity = Math.floor(Math.random() * 200) + 50; // 50-250 spaces
  const occupied = Math.floor(capacity * (Math.random() * 0.9 + 0.1)); // 10-100% occupied
  const type = PARKING_TYPES[Math.floor(Math.random() * PARKING_TYPES.length)];
  const rate = type === "garage" ? 5 : type === "lot" ? 3 : 2; // AED per hour

  return {
    id: `parking-${id}`,
    latitude: zone.lat + (Math.random() - 0.5) * 0.02,
    longitude: zone.lng + (Math.random() - 0.5) * 0.02,
    address: `${zone.name}, Dubai`,
    district: zone.name,
    capacity,
    occupied,
    hourlyRate: rate,
    nearbyPOIs: NEARBY_POIS.slice(0, Math.floor(Math.random() * 3) + 1),
    walkingDistance: Math.floor(Math.random() * 800) + 50, // 50-850m
    type,
  };
}

/**
 * Get all parking zones
 */
export function getParkingZones(count: number = 30): ParkingZone[] {
  return Array.from({ length: count }, (_, i) => generateParkingZone(i));
}

/**
 * Get parking near location
 */
export function getParkingNearLocation(
  location: Location,
  radiusKm: number = 2
): ParkingZone[] {
  const parking = getParkingZones();
  return parking
    .filter((zone) => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        zone.latitude,
        zone.longitude
      );
      return distance <= radiusKm;
    })
    .sort(
      (a, b) =>
        calculateDistance(
          location.latitude,
          location.longitude,
          a.latitude,
          a.longitude
        ) -
        calculateDistance(
          location.latitude,
          location.longitude,
          b.latitude,
          b.longitude
        )
    );
}

/**
 * Get available parking spaces
 */
export function getAvailableParkingSpaces(): ParkingZone[] {
  return getParkingZones().filter((zone) => zone.occupied < zone.capacity);
}

/**
 * Get cheapest parking
 */
export function getCheapestParking(count: number = 10): ParkingZone[] {
  return getParkingZones()
    .sort((a, b) => a.hourlyRate - b.hourlyRate)
    .slice(0, count);
}

/**
 * Get parking stress level (occupancy percentage)
 */
export function getParkingStressLevel(): {
  zone: string;
  stressLevel: number;
  available: number;
  total: number;
}[] {
  return getParkingZones().map((zone) => ({
    zone: zone.district,
    stressLevel: (zone.occupied / zone.capacity) * 100,
    available: zone.capacity - zone.occupied,
    total: zone.capacity,
  }));
}

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
