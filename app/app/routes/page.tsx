"use client";

import { Navigation, MapPin, Locate } from "lucide-react";
import { useState, useEffect } from "react";

export default function RoutesPage() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [routes, setRoutes] = useState<Array<{ id: number; from: string; to: string; time: number; cost: number; emissions: number; modes: string[] }>>([]);
  

  const popularDestinations = [
    "Dubai Mall",
    "Burj Khalifa",
    "Dubai Marina",
    "Jumeirah Beach",
    "Dubai Airport (DXB)",
    "Mall of the Emirates",
    "Palm Jumeirah",
    "Dubai Opera",
    "Global Village",
    "Dubai Frame"
  ];

  useEffect(() => {
    // Get user location on component mount
    if (navigator.geolocation) {
      setIsDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setFromLocation("Current Location");
          setIsDetectingLocation(false);
        },
        (error) => {
          console.log("Location access denied, using Dubai center");
          setCurrentLocation({
            latitude: 25.2048,
            longitude: 55.2708,
          });
          setFromLocation("Downtown Dubai");
          setIsDetectingLocation(false);
        }
      );
    }
  }, []);

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      setFromLocation("Current Location");
    }
  };

  const geocode = async (query: string) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.features && data.features[0]) {
      const f = data.features[0];
      return { longitude: f.center[0], latitude: f.center[1], name: f.place_name };
    }
    return null;
  };

  const getRoute = async (profile: "driving-traffic" | "walking", origin: { longitude: number; latitude: number }, dest: { longitude: number; latitude: number }) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${origin.longitude},${origin.latitude};${dest.longitude},${dest.latitude}?alternatives=true&overview=false&access_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      const r = data.routes[0];
      const durationMin = Math.round(r.duration / 60);
      const distanceKm = r.distance / 1000;
      const cost = profile === "walking" ? 0 : Math.round(distanceKm * 0.5);
      const emissions = profile === "walking" ? 0 : +(distanceKm * 120).toFixed(1);
      return { time: durationMin, cost, emissions, distanceKm };
    }
    return null;
  };

  const handlePlanRoute = async () => {
    if (!fromLocation || !toLocation) {
      alert("Please enter both starting location and destination");
      return;
    }
    let origin: { longitude: number; latitude: number } | null = null;
    if (fromLocation === "Current Location" && currentLocation) {
      origin = { longitude: currentLocation.longitude, latitude: currentLocation.latitude };
    } else {
      const g = await geocode(fromLocation);
      if (!g) {
        alert("Could not find starting location");
        return;
      }
      origin = { longitude: g.longitude, latitude: g.latitude };
    }
    const dest = await geocode(toLocation);
    if (!dest) {
      alert("Could not find destination");
      return;
    }
    const driving = await getRoute("driving-traffic", origin, dest);
    const walking = await getRoute("walking", origin, dest);
    const results: Array<{ id: number; from: string; to: string; time: number; cost: number; emissions: number; modes: string[] }> = [];
    if (driving) results.push({ id: 1, from: fromLocation, to: toLocation, time: driving.time, cost: driving.cost, emissions: +(driving.emissions/1000).toFixed(2), modes: ["Uber"] });
    if (walking) results.push({ id: 2, from: fromLocation, to: toLocation, time: walking.time, cost: walking.cost, emissions: walking.emissions, modes: ["Walk"] });
    setRoutes(results);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Route Planner</h1>
        <p className="text-text-secondary">Multi-modal route optimization for Dubai</p>
      </div>

      <div className="card-base space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">From</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              placeholder="Enter starting location or use current location"
              className="w-full pl-10 pr-10 py-3 border border-border-color rounded-lg dark:bg-bg-dark dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-warm"
            />
            <button
              onClick={handleUseCurrentLocation}
              disabled={isDetectingLocation || !currentLocation}
              className="absolute right-3 top-3 p-1 text-text-secondary hover:text-accent-warm disabled:opacity-50"
              title="Use current location"
            >
              <Locate className="w-4 h-4" />
            </button>
          </div>
          {isDetectingLocation && (
            <p className="text-xs text-text-secondary mt-1">Detecting your location...</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">To</label>
          <div className="relative">
            <Navigation className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              placeholder="Enter destination"
              className="w-full pl-10 pr-3 py-3 border border-border-color rounded-lg dark:bg-bg-dark dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-warm"
            />
          </div>
        </div>

        {/* Popular Destinations Quick Select */}
        <div>
          <p className="text-sm font-medium mb-2">Popular destinations</p>
          <div className="flex flex-wrap gap-2">
            {popularDestinations.slice(0, 6).map((destination) => (
              <button
                key={destination}
                onClick={() => setToLocation(destination)}
                className="text-xs px-3 py-1 bg-surface-dark dark:bg-gray-700 hover:bg-accent-warm hover:text-white rounded-full transition-colors"
              >
                {destination}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {["Fastest", "Cheapest", "Eco-friendly", "Coolest"].map((mode) => (
            <button
              key={mode}
              className="flex-1 px-3 py-2 border border-border-color rounded-lg hover:bg-accent-warm hover:text-white hover:border-accent-warm transition-all text-sm"
            >
              {mode}
            </button>
          ))}
        </div>

        <button
          onClick={handlePlanRoute}
          className="w-full bg-accent-warm hover:bg-accent-warm/90 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          Plan Route
        </button>
      </div>

      <div className="space-y-3">
        {routes.map((route) => (
          <div key={route.id} className="card-base hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold">{route.from} to {route.to}</h4>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {route.modes.map((mode) => (
                    <span
                      key={mode}
                      className="text-xs bg-surface-dark px-2 py-1 rounded dark:bg-gray-700"
                    >
                      {mode}
                    </span>
                  ))}
                </div>
              </div>
              <button className="button-primary">Book</button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-text-secondary text-xs">Time</p>
                <p className="font-bold">{route.time} min</p>
              </div>
              <div>
                <p className="text-text-secondary text-xs">Cost</p>
                <p className="font-bold text-accent-warm">AED {route.cost}</p>
              </div>
              <div>
                <p className="text-text-secondary text-xs">Emissions</p>
                <p className="font-bold">{route.emissions} kg CO2</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
