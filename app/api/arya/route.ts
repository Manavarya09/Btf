/**
 * ARYA AI Assistant API Endpoint
 * Handles natural language queries and returns mobility insights
 * 
 * To integrate with Gemini AI:
 * 1. Set NEXT_PUBLIC_GEMINI_API_KEY in environment
 * 2. Uncomment the Gemini integration code below
 * 3. Install @google/generative-ai: npm install @google/generative-ai
 */

import { NextRequest, NextResponse } from "next/server";
import { ChatMessage, AssistantResponse, RouteOption } from "@/types/mobility";
import { getEVChargers, getChargersNearLocation } from "@/lib/simulators/ev";
import { getParkingNearLocation } from "@/lib/simulators/parking";
import { getHeatIndexForLocations, getCoolestWalkingTime } from "@/lib/simulators/heat";
import { getEventsUpcoming } from "@/lib/simulators/events";
import { getTransitStopsNearLocation } from "@/lib/simulators/transit";

// System prompt for ARYA
const SYSTEM_PROMPT = `You are ARYA, an AI-powered mobility assistant for Dubai. Your role is to help users navigate the city smartly by:

1. Planning multi-modal routes (bus, metro, EV, scooter, walking)
2. Predicting EV charger availability
3. Finding parking solutions
4. Providing heat safety recommendations
5. Advising on events and crowd impacts
6. Optimizing for user preferences (fastest, cheapest, eco-friendly, coolest)

Always be helpful, accurate, and safety-conscious. For heat-related queries, prioritize user health.
Provide specific actionable advice, not generic recommendations.

Remember:
- Dubai uses AED currency
- Temperatures can exceed 50°C in summer
- Metro Red and Green lines are the main transit backbone
- Multiple ride-sharing options available (Uber, Careem, Tier scooters, Lime)`;

interface AryaRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AryaRequest = await request.json();
    const { message, conversationHistory = [], userLocation } = body;

    // Simple keyword-based routing for demo purposes
    // In production, use Gemini to understand intent
    const intent = identifyIntent(message);

    let response: AssistantResponse;

    switch (intent) {
      case "find_chargers":
        response = await handleChargerQuery(message, userLocation);
        break;
      case "find_parking":
        response = await handleParkingQuery(message, userLocation);
        break;
      case "heat_safety":
        response = await handleHeatQuery(message, userLocation);
        break;
      case "plan_route":
        response = await handleRouteQuery(message, userLocation);
        break;
      case "find_transit":
        response = await handleTransitQuery(message, userLocation);
        break;
      default:
        response = await handleGeneralQuery(message);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("ARYA API Error:", error);
    return NextResponse.json(
      {
        message:
          "Sorry, I encountered an error. Please try again.",
        actions: [],
      },
      { status: 500 }
    );
  }
}

function identifyIntent(message: string): string {
  const lowerMsg = message.toLowerCase();

  if (
    lowerMsg.includes("charger") ||
    lowerMsg.includes("ev") ||
    lowerMsg.includes("charge")
  ) {
    return "find_chargers";
  }
  if (
    lowerMsg.includes("parking") ||
    lowerMsg.includes("park") ||
    lowerMsg.includes("spot")
  ) {
    return "find_parking";
  }
  if (
    lowerMsg.includes("heat") ||
    lowerMsg.includes("hot") ||
    lowerMsg.includes("temperature") ||
    lowerMsg.includes("sun") ||
    lowerMsg.includes("walk safely")
  ) {
    return "heat_safety";
  }
  if (
    lowerMsg.includes("route") ||
    lowerMsg.includes("directions") ||
    lowerMsg.includes("way to") ||
    lowerMsg.includes("how do i get")
  ) {
    return "plan_route";
  }
  if (
    lowerMsg.includes("bus") ||
    lowerMsg.includes("metro") ||
    lowerMsg.includes("transit") ||
    lowerMsg.includes("public transport")
  ) {
    return "find_transit";
  }

  return "general";
}

async function handleChargerQuery(
  message: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<AssistantResponse> {
  if (!userLocation) {
    return {
      message:
        "To find EV chargers near you, please share your current location. How many kilometers away are you comfortable traveling?",
      actions: [],
    };
  }

  const chargers = getChargersNearLocation(
    {
      id: "user-location",
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      address: "Your location",
      district: "Dubai",
    },
    5
  );

  const availableChargers = chargers.filter((c) => c.availableSockets > 0);

  return {
    message: `I found ${availableChargers.length} available EV chargers within 5km. The closest one is the ${availableChargers[0]?.operator || "unnamed"} charger with ${availableChargers[0]?.availableSockets || 0} available sockets at AED ${availableChargers[0]?.price || 0}/kWh.`,
    data: {
      chargers: availableChargers.slice(0, 5),
      count: availableChargers.length,
    },
  };
}

async function handleParkingQuery(
  message: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<AssistantResponse> {
  if (!userLocation) {
    return {
      message:
        "To find parking, please share your location. Would you prefer cheap rates or close proximity?",
      actions: [],
    };
  }

  const parking = getParkingNearLocation(
    {
      id: "user-location",
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      address: "Your location",
      district: "Dubai",
    },
    2
  );

  const available = parking.filter((p) => p.occupied < p.capacity);

  return {
    message: `Found ${available.length} available parking zones nearby. The closest is ${available[0]?.type} parking in ${available[0]?.district} at AED ${available[0]?.hourlyRate}/hour.`,
    data: {
      parking: available.slice(0, 5),
      count: available.length,
    },
  };
}

async function handleHeatQuery(
  message: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<AssistantResponse> {
  const coolestTime = getCoolestWalkingTime();

  return {
    message: `For outdoor activities in Dubai, the safest time to go out is between ${coolestTime.timeWindow} when temperatures are around ${coolestTime.temperature}. ${coolestTime.recommendations.join(
      " "
    )}`,
    data: {
      coolestTime,
      recommendations: coolestTime.recommendations,
    },
  };
}

async function handleRouteQuery(
  message: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<AssistantResponse> {
  return {
    message:
      "Route planning requires your destination. Where would you like to go? Also, what's your priority: speed, cost, eco-friendliness, or comfort?",
    actions: [
      {
        type: "navigate",
        payload: { page: "/app/routes" },
      },
    ],
  };
}

async function handleTransitQuery(
  message: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<AssistantResponse> {
  if (!userLocation) {
    return {
      message:
        "To show you transit options, please share your current location.",
      actions: [],
    };
  }

  const stops = getTransitStopsNearLocation(
    {
      id: "user-location",
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      address: "Your location",
      district: "Dubai",
    },
    1
  );

  return {
    message: `There are ${stops.length} transit stops within 1km. The nearest has ${stops[0]?.routes.length || 0} routes, with next arrival in ${stops[0]?.nextArrivals[0]?.arrivalTime || 0} minutes.`,
    data: {
      stops: stops.slice(0, 3),
    },
  };
}

async function handleGeneralQuery(message: string): Promise<AssistantResponse> {
  // For general queries, provide helpful context
  const suggestions = [
    "Find EV chargers near me",
    "Where can I park?",
    "How do I stay cool?",
    "Show me events today",
    "Best transit route to...",
  ];

  return {
    message: `I'm ARYA, your Dubai mobility assistant. I can help you with ${suggestions
      .slice(0, 3)
      .join(
        ", "
      )}. What would you like to know?`,
    actions: [],
  };
}
