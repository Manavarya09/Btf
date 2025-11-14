/**
 * ARYA Mobility OS - TypeScript Types
 * Defines all data models for the mobility platform
 */

// Location and Geography
export interface Location {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  district: string;
  zone?: string;
}

// EV Chargers
export interface EVCharger extends Location {
  type: "fast" | "slow" | "ultra-fast";
  totalSockets: number;
  availableSockets: number;
  powerOutput: number; // kW
  price: number; // per kWh
  operator: string;
  amenities: string[];
  predictedFreeTime?: string; // e.g., "14:30"
  reliability: number; // 0-100%
}

export interface EVTrip {
  origin: Location;
  destination: Location;
  batteryLevel: number; // 0-100%
  carRange: number; // km
  suggestedChargers: EVCharger[];
  estimatedTime: number; // minutes
  estimatedCost: number; // AED
}

// Public Transport
export interface TransitRoute {
  id: string;
  name: string;
  type: "bus" | "metro" | "tram";
  stops: Location[];
  schedule: {
    startTime: string;
    endTime: string;
    frequency: number; // minutes
  };
  currentLoad: number; // 0-100%
}

export interface TransitStop extends Location {
  routes: string[]; // route IDs
  nextArrivals: {
    routeId: string;
    arrivalTime: number; // minutes
    load: number; // 0-100%
  }[];
}

// Mobility Sharing (Scooters)
export interface MobilitySharing {
  id: string;
  type: "scooter" | "bike" | "car";
  operator: string;
  location: Location;
  available: number; // count
  totalSpaces: number;
  price: number; // per minute or per ride
  batteryLevel?: number; // for scooters/bikes
}

// Parking
export interface ParkingZone extends Location {
  capacity: number;
  occupied: number;
  hourlyRate: number; // AED
  nearbyPOIs: string[];
  walkingDistance: number; // meters to center
  type: "street" | "garage" | "lot";
}

// Heat and Health
export interface HeatIndex {
  location: Location;
  temperature: number; // Celsius
  feelsLike: number; // Celsius
  uvIndex: number;
  riskLevel: "low" | "moderate" | "high" | "extreme";
  safeWalkingWindow?: {
    startTime: string;
    endTime: string;
  };
}

export interface HealthRisk {
  id: string;
  type: "heat" | "air-quality" | "crowd-density";
  location: Location;
  severity: number; // 0-100
  recommendation: string;
}

// Events
export interface Event {
  id: string;
  name: string;
  location: Location;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  expectedCrowd: number;
  impactZone: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  affectedAreas: string[];
  mobilityImpact: {
    parkedClosures: string[];
    transitDelays: number; // minutes
    routeDiversions: string[];
  };
}

// Routes
export interface RouteOption {
  id: string;
  modes: ("walking" | "bus" | "metro" | "scooter" | "ev" | "car")[];
  duration: number; // minutes
  cost: number; // AED
  emissions: number; // grams CO2
  difficulty: "easy" | "moderate" | "hard";
  steps: RouteStep[];
  sunExposure: number; // 0-100 (percentage of sun exposure)
  highlights: string[];
}

export interface RouteStep {
  mode: string;
  from: Location;
  to: Location;
  duration: number;
  distance: number;
  instructions: string;
  waypoints?: Location[];
}

// User and Preferences
export interface UserPreferences {
  defaultMode: "bus" | "ev" | "walking" | "scooter" | "balanced";
  heatSensitivity: "low" | "moderate" | "high";
  theme: "light" | "dark";
  units: "metric" | "imperial";
  notifications: boolean;
  language: "en" | "ar";
  savedLocations: {
    home?: Location;
    work?: Location;
    favorites: Location[];
  };
}

// ARYA Assistant
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  context?: {
    userLocation?: Location;
    topic?: string;
    relatedData?: unknown;
  };
}

export interface AssistantResponse {
  message: string;
  actions?: AssistantAction[];
  data?: unknown;
  suggestedRoutes?: RouteOption[];
}

export interface AssistantAction {
  type: "navigate" | "show-route" | "open-page" | "search";
  payload: unknown;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
