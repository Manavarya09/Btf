/**
 * Transit Simulator
 * Generates realistic bus and metro route data for Dubai
 */

import { TransitRoute, TransitStop, Location } from "@/types/mobility";

const MAJOR_STOPS: Record<string, Location> = {
  "Downtown-Station": {
    id: "stop-downtown",
    latitude: 25.2048,
    longitude: 55.2708,
    address: "Downtown Dubai",
    district: "Downtown",
  },
  "Marina-Station": {
    id: "stop-marina",
    latitude: 25.0761,
    longitude: 55.1704,
    address: "Dubai Marina",
    district: "Marina",
  },
  "Deira-Station": {
    id: "stop-deira",
    latitude: 25.276,
    longitude: 55.3631,
    address: "Deira",
    district: "Deira",
  },
  "JBR-Station": {
    id: "stop-jbr",
    latitude: 25.2003,
    longitude: 55.1577,
    address: "Jumeirah Beach Residence",
    district: "JBR",
  },
  "Emirates-Metro": {
    id: "stop-emirates",
    latitude: 25.1811,
    longitude: 55.2659,
    address: "Emirates",
    district: "Emirates",
  },
};

const METRO_ROUTES: TransitRoute[] = [
  {
    id: "metro-red",
    name: "Red Line",
    type: "metro",
    stops: [
      MAJOR_STOPS["Downtown-Station"],
      MAJOR_STOPS["Deira-Station"],
      MAJOR_STOPS["Emirates-Metro"],
    ],
    schedule: {
      startTime: "06:00",
      endTime: "00:00",
      frequency: 4, // Every 4 minutes
    },
    currentLoad: 65,
  },
  {
    id: "metro-green",
    name: "Green Line",
    type: "metro",
    stops: [
      MAJOR_STOPS["Marina-Station"],
      MAJOR_STOPS["Downtown-Station"],
      MAJOR_STOPS["Emirates-Metro"],
    ],
    schedule: {
      startTime: "06:00",
      endTime: "00:00",
      frequency: 5,
    },
    currentLoad: 55,
  },
];

const BUS_ROUTES: TransitRoute[] = [
  {
    id: "bus-f1",
    name: "F1 - Downtown to Marina",
    type: "bus",
    stops: [
      MAJOR_STOPS["Downtown-Station"],
      MAJOR_STOPS["Marina-Station"],
    ],
    schedule: {
      startTime: "05:30",
      endTime: "23:30",
      frequency: 10,
    },
    currentLoad: 72,
  },
  {
    id: "bus-x91",
    name: "X91 - Deira Express",
    type: "bus",
    stops: [
      MAJOR_STOPS["Deira-Station"],
      MAJOR_STOPS["Emirates-Metro"],
    ],
    schedule: {
      startTime: "06:00",
      endTime: "23:00",
      frequency: 15,
    },
    currentLoad: 48,
  },
  {
    id: "bus-8",
    name: "8 - JBR Loop",
    type: "bus",
    stops: [
      MAJOR_STOPS["JBR-Station"],
      MAJOR_STOPS["Marina-Station"],
    ],
    schedule: {
      startTime: "05:00",
      endTime: "00:30",
      frequency: 8,
    },
    currentLoad: 85,
  },
];

/**
 * Get all transit routes
 */
export function getTransitRoutes(): TransitRoute[] {
  return [...METRO_ROUTES, ...BUS_ROUTES];
}

/**
 * Get metro routes
 */
export function getMetroRoutes(): TransitRoute[] {
  return METRO_ROUTES;
}

/**
 * Get bus routes
 */
export function getBusRoutes(): TransitRoute[] {
  return BUS_ROUTES;
}

/**
 * Get transit stops near a location
 */
export function getTransitStopsNearLocation(
  location: Location,
  radiusKm: number = 1
): TransitStop[] {
  const stops: TransitStop[] = [];

  getTransitRoutes().forEach((route) => {
    route.stops.forEach((stop) => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        stop.latitude,
        stop.longitude
      );

      if (distance <= radiusKm) {
        const existingStop = stops.find((s) => s.id === stop.id);
        const routeData = {
          routeId: route.id,
          arrivalTime: Math.floor(Math.random() * 15) + 2, // 2-17 minutes
          load: route.currentLoad + (Math.random() - 0.5) * 20,
        };

        if (existingStop) {
          existingStop.routes.push(route.id);
          existingStop.nextArrivals.push(routeData);
        } else {
          stops.push({
            ...stop,
            routes: [route.id],
            nextArrivals: [routeData],
          });
        }
      }
    });
  });

  return stops.sort(
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
 * Get next arrival for a specific route at a location
 */
export function getNextArrival(routeId: string, stopId: string): number {
  const route = getTransitRoutes().find((r) => r.id === routeId);
  if (!route) return -1;

  // Simulate realistic arrival times
  return Math.floor(Math.random() * route.schedule.frequency) + 1;
}

/**
 * Get transit status summary
 */
export function getTransitStatus(): {
  activeMetroLines: number;
  activeBusRoutes: number;
  averageMetroLoad: number;
  averageBusLoad: number;
  delayedRoutes: string[];
} {
  const allRoutes = getTransitRoutes();
  const metro = allRoutes.filter((r) => r.type === "metro");
  const buses = allRoutes.filter((r) => r.type === "bus");

  const avgMetroLoad =
    metro.reduce((sum, r) => sum + r.currentLoad, 0) / metro.length;
  const avgBusLoad =
    buses.reduce((sum, r) => sum + r.currentLoad, 0) / buses.length;

  const delayedRoutes = allRoutes
    .filter((r) => Math.random() < 0.2) // 20% of routes might be delayed
    .map((r) => r.id);

  return {
    activeMetroLines: metro.length,
    activeBusRoutes: buses.length,
    averageMetroLoad: Math.round(avgMetroLoad),
    averageBusLoad: Math.round(avgBusLoad),
    delayedRoutes,
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
