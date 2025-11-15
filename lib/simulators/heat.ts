/**
 * Heat Index Simulator
 * Generates realistic heat and health risk data for Dubai
 */

import { HeatIndex, Location } from "@/types/mobility";

const DUBAI_LOCATIONS = [
  { lat: 25.2048, lng: 55.2708, name: "Downtown Dubai" },
  { lat: 25.276, lng: 55.3631, name: "Jumeirah" },
  { lat: 25.1245, lng: 55.1959, name: "Dubai Hills" },
  { lat: 25.0761, lng: 55.1704, name: "Marina" },
  { lat: 25.1972, lng: 55.2744, name: "Deira" },
];

/**
 * Generate heat index data for a location
 */
function generateHeatIndex(location: Location): HeatIndex {
  const hour = new Date().getHours();
  
  // Simulate temperature variation throughout the day
  let baseTemp = 25; // Morning baseline
  if (hour >= 11 && hour <= 15) {
    baseTemp = 42 + Math.random() * 6; // Hot afternoon (42-48°C)
  } else if (hour >= 9 && hour <= 17) {
    baseTemp = 35 + Math.random() * 8; // Warm (35-43°C)
  } else if (hour >= 17 && hour <= 20) {
    baseTemp = 32 + Math.random() * 8; // Cooling down (32-40°C)
  }

  const temperature = baseTemp + (Math.random() - 0.5) * 3;
  const humidity = 40 + Math.random() * 40; // 40-80% humidity
  
  // Calculate "feels like" temperature
  const feelsLike = calculateFeelsLike(temperature, humidity);
  
  const uvIndex = Math.max(
    0,
    Math.min(12, 
      hour >= 10 && hour <= 16 
        ? 9 + Math.random() * 3 
        : 3 + Math.random() * 4
    )
  );

  // Determine risk level
  let riskLevel: "low" | "moderate" | "high" | "extreme" = "low";
  if (feelsLike > 50) {
    riskLevel = "extreme";
  } else if (feelsLike > 45) {
    riskLevel = "high";
  } else if (feelsLike > 40) {
    riskLevel = "moderate";
  }

  return {
    location,
    temperature: Math.round(temperature * 10) / 10,
    feelsLike: Math.round(feelsLike * 10) / 10,
    uvIndex: Math.round(uvIndex * 10) / 10,
    riskLevel,
    safeWalkingWindow:
      riskLevel === "extreme" || riskLevel === "high"
        ? {
            startTime: "06:00",
            endTime: "09:00",
          }
        : undefined,
  };
}

/**
 * Calculate "feels like" temperature using heat index formula
 */
function calculateFeelsLike(temp: number, humidity: number): number {
  // Simplified heat index formula
  const c1 = -42.379;
  const c2 = 2.04901523;
  const c3 = 10.14333127;
  const c4 = -0.22475541;
  const c5 = -0.00683783;
  const c6 = -0.05481717;
  const c7 = 0.00122874;
  const c8 = 0.00085282;
  const c9 = -0.00000199;

  const T = (temp * 9) / 5 + 32; // Convert to Fahrenheit
  const RH = humidity;

  const A = c1 + c2 * T + c3 * RH;
  const B = c4 * T * RH + c5 * T * T + c6 * RH * RH;
  const C = c7 * T * T * RH + c8 * T * RH * RH + c9 * T * T * RH * RH;
  const HI_F = A + B + C;

  return ((HI_F - 32) * 5) / 9; // Convert back to Celsius
}

/**
 * Get heat index for multiple locations
 */
export function getHeatIndexForLocations(
  locations: Location[]
): HeatIndex[] {
  return locations.map((loc) => generateHeatIndex(loc));
}

/**
 * Get coolest walking routes timing
 */
export function getCoolestWalkingTime(): {
  timeWindow: string;
  temperature: string;
  recommendations: string[];
} {
  const hour = new Date().getHours();
  let timeWindow = "06:00 - 09:00"; // Default early morning
  let temperature = "25-32°C";
  const recommendations = [
    "Drink plenty of water",
    "Wear light-colored clothing",
    "Use SPF 50+ sunscreen",
    "Wear a hat and sunglasses",
    "Take breaks in shade",
  ];

  if (hour >= 17 && hour <= 20) {
    timeWindow = "17:00 - 20:00";
    temperature = "32-38°C";
    recommendations.splice(2, 0, "Peak UV hours have passed");
  } else if (hour >= 20) {
    timeWindow = "20:00 - 22:00";
    temperature = "28-32°C";
    recommendations.push("Evening walks are ideal");
  }

  return {
    timeWindow,
    temperature,
    recommendations,
  };
}

/**
 * Get high-risk heat areas
 */
export function getHighRiskAreas(): HeatIndex[] {
  return getHeatIndexForLocations(
    DUBAI_LOCATIONS.map((loc) => ({
      id: `loc-${Math.random()}`,
      latitude: loc.lat,
      longitude: loc.lng,
      address: loc.name,
      district: loc.name,
      zone: loc.name,
    }))
  ).filter((hi) => hi.riskLevel === "high" || hi.riskLevel === "extreme");
}

/**
 * Get hydration recommendations
 */
export function getHydrationRecommendation(temperature: number): {
  level: "low" | "moderate" | "high" | "critical";
  waterPerHour: number; // ml
  message: string;
} {
  if (temperature > 48) {
    return {
      level: "critical",
      waterPerHour: 500,
      message:
        "Extreme heat: Drink 500ml of water every hour. Seek air conditioning.",
    };
  } else if (temperature > 43) {
    return {
      level: "high",
      waterPerHour: 400,
      message:
        "Hot conditions: Drink 400ml of water every hour. Take frequent breaks.",
    };
  } else if (temperature > 38) {
    return {
      level: "moderate",
      waterPerHour: 300,
      message:
        "Warm conditions: Drink 300ml of water every hour. Stay in shade when possible.",
    };
  }
  return {
    level: "low",
    waterPerHour: 200,
    message: "Normal conditions: Drink water regularly throughout the day.",
  };
}
