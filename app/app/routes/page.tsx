"use client";

import { Navigation } from "lucide-react";

export default function RoutesPage() {
  const routes = [
    {
      id: 1,
      from: "Downtown Dubai",
      to: "Dubai Marina",
      time: 25,
      cost: 12,
      emissions: 4.2,
      modes: ["Metro", "Walk"],
    },
    {
      id: 2,
      from: "Downtown Dubai",
      to: "Dubai Marina",
      time: 18,
      cost: 35,
      emissions: 8.1,
      modes: ["Uber"],
    },
    {
      id: 3,
      from: "Downtown Dubai",
      to: "Dubai Marina",
      time: 32,
      cost: 5,
      emissions: 0,
      modes: ["Walk", "Scooter"],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Route Planner</h1>
        <p className="text-text-secondary">Multi-modal route optimization</p>
      </div>

      <div className="card-base space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">From</label>
          <input
            type="text"
            placeholder="Starting location"
            className="w-full px-3 py-2 border border-border-color rounded-lg dark:bg-bg-dark dark:border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">To</label>
          <input
            type="text"
            placeholder="Destination"
            className="w-full px-3 py-2 border border-border-color rounded-lg dark:bg-bg-dark dark:border-gray-700"
          />
        </div>
        <div className="flex gap-2">
          {["Fastest", "Cheapest", "Eco-friendly", "Coolest"].map((mode) => (
            <button
              key={mode}
              className="flex-1 px-3 py-2 border border-border-color rounded-lg hover:bg-accent-warm hover:text-white hover:border-accent-warm transition-all"
            >
              {mode}
            </button>
          ))}
        </div>
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
