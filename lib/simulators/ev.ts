/**
 * EV Charger Simulator
 * Generates realistic EV charger data for Dubai
 */

import { EVCharger, Location } from "@/types/mobility";

const DUBAI_LOCATIONS = [
  { lat: 25.2048, lng: 55.2708, name: "Downtown Dubai" },
  { lat: 25.0761, lng: 55.1704, name: "Business Bay" },
  { lat: 25.0331, lng: 55.1716, name: "Dubai Marina" },
  { lat: 25.1972, lng: 55.2744, name: "Deira" },
  { lat: 25.276, lng: 55.3631, name: "Jumeirah" },
  { lat: 25.2003, lng: 55.1577, name: "JBR" },
  { lat: 25.148, lng: 55.2066, name: "Arabian Ranches" },
  { lat: 25.0754, lng: 55.3061, name: "Al Barsha" },
  { lat: 25.1811, lng: 55.2659, name: "Al Karama" },
  { lat: 25.1245, lng: 55.1959, name: "Dubai Hills Estate" },
];

const CHARGER_OPERATORS = [
  "DEWA",
  "Charge Spot UAE",
  "GreenPower",
  "EV Connect",
  "Smart Charge",
];

const CHARGER_TYPES: Array<{
  type: "fast" | "slow" | "ultra-fast";
  power: number;
  avgPrice: number;
}> = [
  { type: "slow", power: 7, avgPrice: 0.8 },
  { type: "fast", power: 22, avgPrice: 1.2 },
  { type: "ultra-fast", power: 150, avgPrice: 2.5 },
];

const AMENITIES = [
  "WiFi",
  "Coffee Shop",
  "Restroom",
  "Shaded Parking",
  "EV Display",
  "Fast Food",
  "Shopping",
];

/**
 * Generate a single EV charger with realistic data
 */
function generateCharger(id: number): EVCharger {
  const location = DUBAI_LOCATIONS[Math.floor(Math.random() * DUBAI_LOCATIONS.length)];
  const chargerType =
    CHARGER_TYPES[Math.floor(Math.random() * CHARGER_TYPES.length)];
  const totalSockets = Math.floor(Math.random() * 8) + 2; // 2-10 sockets
  const availableSockets = Math.floor(Math.random() * (totalSockets + 1));

  return {
    id: `charger-${id}`,
    latitude: location.lat + (Math.random() - 0.5) * 0.01,
    longitude: location.lng + (Math.random() - 0.5) * 0.01,
    address: `${location.name}, Dubai`,
    district: location.name,
    type: chargerType.type,
    totalSockets,
    availableSockets,
    powerOutput: chargerType.power,
    price: chargerType.avgPrice + (Math.random() - 0.5) * 0.4,
    operator: CHARGER_OPERATORS[Math.floor(Math.random() * CHARGER_OPERATORS.length)],
    amenities: AMENITIES.slice(0, Math.floor(Math.random() * 4) + 1),
    predictedFreeTime:
      availableSockets === 0
        ? `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(
            Math.floor(Math.random() * 60)
          ).padStart(2, "0")}`
        : undefined,
    reliability: Math.floor(Math.random() * 30) + 70, // 70-100%
  };
}

/**
 * Get all EV chargers (simulated)
 */
export function getEVChargers(count: number = 45): EVCharger[] {
  return Array.from({ length: count }, (_, i) => generateCharger(i));
}

/**
 * Get chargers near a location
 */
export function getChargersNearLocation(
  location: Location,
  radiusKm: number = 5
): EVCharger[] {
  const chargers = getEVChargers();
  return chargers.filter((charger) => {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      charger.latitude,
      charger.longitude
    );
    return distance <= radiusKm;
  });
}

/**
 * Get chargers filtered by type
 */
export function getChargersByType(
  type: "fast" | "slow" | "ultra-fast"
): EVCharger[] {
  return getEVChargers().filter((c) => c.type === type);
}

/**
 * Simulate charger availability changes over time
 */
export function getChargerWithPrediction(
  chargerId: string,
  currentTime: Date = new Date()
): EVCharger & { predictions: Array<{ time: string; availability: number }> } {
  const charger = getEVChargers().find((c) => c.id === chargerId)!;
  const predictions = Array.from({ length: 12 }, (_, i) => {
    const time = new Date(currentTime.getTime() + i * 60 * 60 * 1000);
    return {
      time: time.toISOString(),
      availability: Math.max(0, Math.min(charger.totalSockets, charger.availableSockets + Math.random() * 4 - 2)),
    };
  });

  return {
    ...charger,
    predictions,
  };
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
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
