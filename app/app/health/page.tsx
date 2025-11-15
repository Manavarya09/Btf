"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Droplets, Sun, MapPin } from "lucide-react";
import { getCoolestWalkingTime, getHydrationRecommendation } from "@/lib/simulators/heat";

export default function HealthPage() {
  const coolestTime = getCoolestWalkingTime();
  const [temp, setTemp] = useState<number | null>(null);
  const hydration = getHydrationRecommendation(temp ?? 38);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const lat = 25.2048;
        const lon = 55.2708;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.current?.temperature_2m != null) {
          setTemp(Math.round(data.current.temperature_2m));
        }
      } catch {}
    };
    fetchWeather();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Health & Safety</h1>
        <p className="text-text-secondary">Dubai climate and mobility safety</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-base bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                Heat Risk
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                Current temperature: {temp!=null ? `${temp}°C` : "--"}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Risk Level: <span className="font-bold">{temp!=null ? (temp >= 40 ? "High" : temp >= 35 ? "Moderate" : "Low") : "--"}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="card-base bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400">
          <div className="flex items-start gap-3">
            <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Hydration
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                {hydration.message}
              </p>
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300">
                {hydration.waterPerHour}ml/hour recommended
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-base">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5 text-yellow-500" />
          Safest Time to Go Outdoors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-surface-dark dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-text-secondary dark:text-gray-400 mb-1">Time Window</p>
            <p className="text-lg font-bold text-text-primary dark:text-white">
              {coolestTime.timeWindow}
            </p>
          </div>
          <div className="p-4 bg-surface-dark dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-text-secondary dark:text-gray-400 mb-1">Temperature</p>
            <p className="text-lg font-bold text-text-primary dark:text-white">
              {coolestTime.temperature}
            </p>
          </div>
          <div className="p-4 bg-surface-dark dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-text-secondary dark:text-gray-400 mb-1">UV Index</p>
            <p className="text-lg font-bold text-text-primary dark:text-white">Moderate</p>
          </div>
        </div>
      </div>

      <div className="card-base">
        <h3 className="font-semibold mb-4">Safety Recommendations</h3>
        <div className="space-y-3">
          {coolestTime.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center justify-center text-xs flex-shrink-0">
                ✓
              </div>
              <p className="text-sm text-text-primary dark:text-white">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card-base bg-red-50 dark:bg-red-900/20">
        <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Emergency Resources</h3>
        <div className="space-y-2 text-sm">
          <p className="text-red-800 dark:text-red-200">
            Nearest Hospital: Al Wasl Hospital (2.5 km away)
          </p>
          <button
            className="w-full mt-2 button-primary bg-red-600 hover:bg-red-700"
            onClick={() => {
              window.location.href = "tel:998";
            }}
          >
            Call Ambulance
          </button>
        </div>
      </div>
    </div>
  );
}
