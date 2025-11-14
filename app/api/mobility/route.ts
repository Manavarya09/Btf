/**
 * Mobility Data API
 * Provides access to all mobility information
 */

import { NextRequest, NextResponse } from "next/server";
import { getEVChargers } from "@/lib/simulators/ev";
import { getParkingZones } from "@/lib/simulators/parking";
import { getTransitRoutes } from "@/lib/simulators/transit";
import { getEventsUpcoming } from "@/lib/simulators/events";
import { APIResponse } from "@/types/mobility";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dataType = searchParams.get("type");

  try {
    let data;

    switch (dataType) {
      case "chargers":
        data = getEVChargers();
        break;
      case "parking":
        data = getParkingZones();
        break;
      case "transit":
        data = getTransitRoutes();
        break;
      case "events":
        data = getEventsUpcoming();
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid data type. Use: chargers, parking, transit, or events",
            timestamp: new Date().toISOString(),
          } as APIResponse<null>,
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    } as APIResponse<typeof data>);
  } catch (error) {
    console.error("Mobility API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch mobility data",
        timestamp: new Date().toISOString(),
      } as APIResponse<null>,
      { status: 500 }
    );
  }
}
