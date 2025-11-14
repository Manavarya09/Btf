/**
 * Events Simulator
 * Generates Dubai events and their mobility impact
 */

import { Event, Location } from "@/types/mobility";

const MAJOR_VENUES = [
  {
    name: "Global Village",
    lat: 25.1153,
    lng: 55.1521,
    defaultCrowd: 50000,
  },
  {
    name: "Expo City Dubai",
    lat: 25.0969,
    lng: 55.1689,
    defaultCrowd: 30000,
  },
  {
    name: "Downtown Dubai",
    lat: 25.1965,
    lng: 55.2684,
    defaultCrowd: 100000,
  },
  {
    name: "Dubai Mall",
    lat: 25.1972,
    lng: 55.2744,
    defaultCrowd: 75000,
  },
  {
    name: "Emirates Stadium",
    lat: 25.1103,
    lng: 55.1377,
    defaultCrowd: 60000,
  },
  {
    name: "Hatta Dam Area",
    lat: 25.0697,
    lng: 55.5219,
    defaultCrowd: 5000,
  },
];

const EVENT_TYPES = [
  "Concert",
  "Sports Event",
  "Festival",
  "Conference",
  "Market",
  "Exhibition",
];

/**
 * Generate a single event
 */
function generateEvent(id: number): Event {
  const venue = MAJOR_VENUES[id % MAJOR_VENUES.length];
  const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + (Math.random() > 0.5 ? 3 : 6));

  const radiusKm = eventType === "Sports Event" ? 2 : 1.5;
  const affectedDistricts = getAffectedDistricts(venue.lat, venue.lng, radiusKm);
  const crowd = Math.floor(venue.defaultCrowd * (0.5 + Math.random() * 0.5));

  return {
    id: `event-${id}`,
    name: `${eventType} at ${venue.name}`,
    location: {
      id: `venue-${id}`,
      latitude: venue.lat,
      longitude: venue.lng,
      address: `${venue.name}, Dubai`,
      district: venue.name,
    },
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
    expectedCrowd: crowd,
    impactZone: {
      latitude: venue.lat,
      longitude: venue.lng,
      radiusKm,
    },
    affectedAreas: affectedDistricts,
    mobilityImpact: {
      parkedClosures: generateClosedParking(affectedDistricts),
      transitDelays: Math.floor(Math.random() * 30) + 5, // 5-35 min delays
      routeDiversions: generateDiversions(affectedDistricts),
    },
  };
}

/**
 * Get affected districts for an event
 */
function getAffectedDistricts(lat: number, lng: number, radiusKm: number): string[] {
  const districts = [
    "Downtown Dubai",
    "Business Bay",
    "Marina",
    "Deira",
    "Al Karama",
  ];
  return districts.slice(0, Math.floor(Math.random() * 3) + 1);
}

/**
 * Generate closed parking areas
 */
function generateClosedParking(districts: string[]): string[] {
  const closures: Record<string, string[]> = {
    "Downtown Dubai": ["P1-Downtown", "P2-Downtown"],
    "Business Bay": ["P1-Bay", "P3-Bay"],
    Marina: ["Marina-North", "Marina-South"],
    Deira: ["Deira-A", "Deira-B", "Deira-C"],
    "Al Karama": ["Karama-Main"],
  };

  return districts.flatMap((d) => closures[d] || []);
}

/**
 * Generate route diversions
 */
function generateDiversions(districts: string[]): string[] {
  const diversions: Record<string, string[]> = {
    "Downtown Dubai": ["E11 towards Marina", "Emaar Boulevard"],
    "Business Bay": ["Sheikh Zayed Road alternate"],
    Marina: ["JBR Corniche", "Marina Promenade"],
    Deira: ["Al Khaleej Road", "Port Saeed"],
    "Al Karama": ["Al Fahidi Street"],
  };

  return districts.flatMap((d) => diversions[d] || []);
}

/**
 * Get current and upcoming events
 */
export function getEventsUpcoming(daysAhead: number = 30): Event[] {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return Array.from({ length: 8 }, (_, i) => {
    const event = generateEvent(i);
    const eventDate = new Date(event.startTime);
    if (eventDate >= now && eventDate <= futureDate) {
      return event;
    }
    return null;
  }).filter((e): e is Event => e !== null);
}

/**
 * Get events affecting a specific location
 */
export function getEventsAffectingLocation(
  location: Location,
  radiusKm: number = 3
): Event[] {
  return getEventsUpcoming().filter((event) => {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      event.location.latitude,
      event.location.longitude
    );
    return distance <= radiusKm;
  });
}

/**
 * Get event impact summary
 */
export function getEventImpactSummary(): {
  totalEvents: number;
  highCrowdEvents: Event[];
  affectedAreas: Set<string>;
  estimatedDelays: number;
} {
  const events = getEventsUpcoming();
  const highCrowd = events.filter((e) => e.expectedCrowd > 50000);
  const affected = new Set<string>();
  let totalDelays = 0;

  events.forEach((event) => {
    event.affectedAreas.forEach((area) => affected.add(area));
    totalDelays += event.mobilityImpact.transitDelays;
  });

  return {
    totalEvents: events.length,
    highCrowdEvents: highCrowd,
    affectedAreas: affected,
    estimatedDelays: Math.floor(totalDelays / events.length),
  };
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
