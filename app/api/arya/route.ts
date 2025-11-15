/**
 * ARYA AI Assistant API Endpoint
 * Enhanced with Google Gemini AI for natural language understanding
 */

import { NextRequest, NextResponse } from "next/server";
import { ChatMessage, AssistantResponse, RouteOption } from "@/types/mobility";
import { getEVChargers, getChargersNearLocation } from "@/lib/simulators/ev";
import { getParkingNearLocation } from "@/lib/simulators/parking";
import { getHeatIndexForLocations, getCoolestWalkingTime } from "@/lib/simulators/heat";
import { getEventsUpcoming } from "@/lib/simulators/events";
import { getTransitStopsNearLocation } from "@/lib/simulators/transit";
import { fetchChargersFromOCM } from "@/lib/openchargemap";

// Check if Gemini is available
const GEMINI_AVAILABLE = process.env.NEXT_PUBLIC_GEMINI_API_KEY && process.env.NEXT_PUBLIC_GEMINI_API_KEY !== "your-gemini-api-key";

console.log("Gemini API Key status:", {
  hasKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  isNotPlaceholder: process.env.NEXT_PUBLIC_GEMINI_API_KEY !== "your-gemini-api-key",
  available: GEMINI_AVAILABLE
});

let genAI: any = null;
if (GEMINI_AVAILABLE) {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    console.log("Gemini AI initialized successfully");
  } catch (error) {
    console.error("Gemini AI initialization error:", error);
  }
}

// System prompt for ARYA
const SYSTEM_PROMPT = `You are ARYA, a professional AI-powered mobility assistant for Dubai. Your role is to provide expert navigation and transportation guidance with precision and clarity.

Key capabilities:
1. Plan multi-modal routes (bus, metro, EV, scooter, walking)
2. Predict EV charger availability and pricing
3. Find parking solutions with real-time availability
4. Provide heat safety recommendations based on current conditions
5. Advise on events and crowd impacts on mobility
6. Optimize for user preferences (fastest, cheapest, eco-friendly, coolest)

Response style:
- Be concise and professional - provide essential information efficiently
- Structure responses with clear bullet points or numbered lists
- Focus on actionable recommendations with specific data
- Include safety considerations when relevant
- Maintain a knowledgeable, expert tone

Always prioritize:
- User safety, especially in extreme heat
- Accurate, real-time information
- Personalized recommendations based on context
- Clear, step-by-step guidance

Remember:
- Dubai uses AED currency
- Temperatures can exceed 50°C in summer - mention heat safety when appropriate
- Metro Red and Green lines are the main transit backbone
- Multiple ride-sharing options available (Uber, Careem, Tier scooters, Lime)
- Weekend is Friday-Saturday, Sunday is a workday

When responding:
1. Provide direct, concise answers to the user's query
2. Include specific data points (times, costs, availability numbers)
3. Structure information clearly with bullet points when multiple options exist
4. Mention safety considerations briefly when relevant
5. Offer 2-3 alternatives maximum to avoid overwhelming the user`;

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

    console.log("Received request:", { message, hasLocation: !!userLocation, conversationLength: conversationHistory.length });
    console.log("Gemini status:", { available: GEMINI_AVAILABLE, initialized: !!genAI });

    let response: AssistantResponse;

    if (GEMINI_AVAILABLE && genAI) {
      console.log("Using Gemini AI for response");
      response = await handleWithGemini(message, userLocation, conversationHistory);
    } else {
      console.warn("Gemini AI unavailable, using fallback");
      const intent = identifyIntent(message);
      response = await handleWithKeywords(intent, message, userLocation);
    }

    console.log("Sending response:", response.message.substring(0, 100) + "...");
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

async function handleWithGemini(
  message: string, 
  userLocation?: { latitude: number; longitude: number },
  conversationHistory?: ChatMessage[]
): Promise<AssistantResponse> {
  try {
    console.log("Attempting to get Gemini model...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("Gemini model obtained successfully");
    
    // Prepare context with mobility data
    const context = await prepareMobilityContext(userLocation);
    
    // Format conversation history naturally
    const conversationContext = conversationHistory && conversationHistory.length > 1 
      ? "Previous conversation:\n" + conversationHistory.slice(-4).map(msg => 
          `${msg.role === 'user' ? 'User' : 'ARYA'}: ${msg.content}`
        ).join('\n')
      : "This is the start of our conversation.";

    const locationContext = userLocation 
      ? `User is currently at approximately ${userLocation.latitude}, ${userLocation.longitude} in Dubai.`
      : "User location not provided.";

    const prompt = `${SYSTEM_PROMPT}

${locationContext}

${conversationContext}

Current Dubai mobility data:
${context}

User's latest message: "${message}"

Please respond naturally and conversationally as ARYA. Be helpful, specific, and provide actionable advice based on the current data. If you need more information to give the best recommendation, ask follow-up questions.`;

    console.log("Sending prompt to Gemini...");
    const result = await model.generateContent(prompt);
    console.log("Got response from Gemini");
    const response = await result.response;
    const text = response.text();

    console.log("Gemini response:", text.substring(0, 200) + "...");

    // Extract any actionable data from the response
    const data = await extractDataFromResponse(text, userLocation);

    return {
      message: text,
      data: data.data,
      actions: data.actions,
    };
  } catch (error) {
    console.error("Gemini error details:", error);
    
    // Try to get available models if the error is about model not found
    if (error.message?.includes('not found')) {
      try {
        console.log("Trying to list available models...");
        const models = await genAI.listModels();
        console.log("Available models:", models);
      } catch (listError) {
        console.error("Error listing models:", listError);
      }
    }
    
    // Fallback only if Gemini truly fails
    return {
      message: "I'm having trouble processing your request right now. Please try asking in a different way, or let me know if you need help with something specific like finding EV chargers, parking, or planning a route.",
      data: {},
      actions: [],
    };
  }
}

async function prepareMobilityContext(userLocation?: { latitude: number; longitude: number }) {
  const contextParts = [];
  
  // Get general conditions data
  const events = getEventsUpcoming(7);
  const coolestTime = getCoolestWalkingTime();
  
  if (userLocation) {
    const location = {
      id: "user-location",
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      address: "User location",
      district: "Dubai",
    };

    // Get nearby data - use real OCM data for chargers
    const nearbyChargers = await fetchChargersFromOCM(userLocation.latitude, userLocation.longitude, 5);
    const nearbyParking = getParkingNearLocation(location, 2).slice(0, 3);
    const nearbyTransit = getTransitStopsNearLocation(location, 1).slice(0, 2);

    contextParts.push("NEARBY DATA:");
    contextParts.push(`EV Chargers within 5km: ${nearbyChargers.length} available`);
    if (nearbyChargers.length > 0) {
      contextParts.push(`Closest charger: ${nearbyChargers[0].operator} (${nearbyChargers[0].availableSockets}/${nearbyChargers[0].totalSockets} available) at AED ${nearbyChargers[0].price}/kWh`);
    }
    
    contextParts.push(`Parking within 2km: ${nearbyParking.length} zones with availability`);
    if (nearbyParking.length > 0) {
      const available = nearbyParking[0].capacity - nearbyParking[0].occupied;
      contextParts.push(`Closest parking: ${nearbyParking[0].district} (${available}/${nearbyParking[0].capacity} available) at AED ${nearbyParking[0].hourlyRate}/hour`);
    }

    contextParts.push(`Transit stops within 1km: ${nearbyTransit.length}`);
    if (nearbyTransit.length > 0) {
      contextParts.push(`Nearest stop: ${nearbyTransit[0].district} with ${nearbyTransit[0].routes.length} routes`);
    }
  }

  contextParts.push("\nCURRENT CONDITIONS:");
  contextParts.push(`Safest outdoor time: ${coolestTime.timeWindow} (${coolestTime.temperature})`);
  contextParts.push(`Upcoming events this week: ${events.length}`);

  return contextParts.join('\n');
}

async function extractDataFromResponse(text: string, userLocation?: { latitude: number; longitude: number }) {
  const data: any = {};
  const actions: AssistantResponse["actions"] = [];

  // Extract relevant data based on response content
  if (text.toLowerCase().includes("charger") || text.toLowerCase().includes("ev")) {
    if (userLocation) {
      // Use real OCM data for chargers
      const chargers = await fetchChargersFromOCM(userLocation.latitude, userLocation.longitude, 5);
      data.chargers = chargers.slice(0, 5);
    }
  }

  if (text.toLowerCase().includes("parking")) {
    if (userLocation) {
      const location = {
        id: "user-location",
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        address: "User location",
        district: "Dubai",
      };
      data.parking = getParkingNearLocation(location, 2).slice(0, 5);
    }
  }

  if (text.toLowerCase().includes("route") || text.toLowerCase().includes("direction")) {
    actions.push({
      type: "navigate",
      payload: { page: "/app/routes" },
    });
  }

  return { data, actions };
}

function identifyIntent(message: string): string {
  const lowerMsg = message.toLowerCase();

  if (
    lowerMsg.includes("charger") ||
    lowerMsg.includes("ev") ||
    lowerMsg.includes("charge") ||
    lowerMsg.includes("electric")
  ) {
    return "find_chargers";
  }
  if (
    lowerMsg.includes("parking") ||
    lowerMsg.includes("park") ||
    lowerMsg.includes("spot") ||
    lowerMsg.includes("garage")
  ) {
    return "find_parking";
  }
  if (
    lowerMsg.includes("heat") ||
    lowerMsg.includes("hot") ||
    lowerMsg.includes("temperature") ||
    lowerMsg.includes("sun") ||
    lowerMsg.includes("walk safely") ||
    lowerMsg.includes("hydration") ||
    lowerMsg.includes("water")
  ) {
    return "heat_safety";
  }
  if (
    lowerMsg.includes("route") ||
    lowerMsg.includes("directions") ||
    lowerMsg.includes("way to") ||
    lowerMsg.includes("how do i get") ||
    lowerMsg.includes("go to")
  ) {
    return "plan_route";
  }
  if (
    lowerMsg.includes("bus") ||
    lowerMsg.includes("metro") ||
    lowerMsg.includes("transit") ||
    lowerMsg.includes("public transport") ||
    lowerMsg.includes("train")
  ) {
    return "find_transit";
  }
  if (
    lowerMsg.includes("event") ||
    lowerMsg.includes("concert") ||
    lowerMsg.includes("festival") ||
    lowerMsg.includes("game") ||
    lowerMsg.includes("show")
  ) {
    return "events";
  }

  return "general";
}

async function handleWithKeywords(
  intent: string,
  message: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<AssistantResponse> {
  switch (intent) {
    case "find_chargers":
      return handleChargerQuery(message, userLocation);
    case "find_parking":
      return handleParkingQuery(message, userLocation);
    case "heat_safety":
      return handleHeatQuery(message, userLocation);
    case "plan_route":
      return handleRouteQuery(message, userLocation);
    case "find_transit":
      return handleTransitQuery(message, userLocation);
    case "events":
      return handleEventsQuery(message, userLocation);
    default:
      return handleGeneralQuery(message);
  }
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

async function handleEventsQuery(
  message: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<AssistantResponse> {
  const events = getEventsUpcoming(7);
  
  return {
    message: `There are ${events.length} events happening in Dubai this week. ${events.length > 0 ? `The next major event is ${events[0].name} at ${events[0].location.district} with an expected crowd of ${(events[0].expectedCrowd / 1000).toFixed(0)}K people.` : ""}`,
    data: {
      events: events.slice(0, 5),
      totalEvents: events.length,
    },
  };
}

async function handleGeneralQuery(message: string): Promise<AssistantResponse> {
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
