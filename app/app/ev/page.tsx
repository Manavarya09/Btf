"use client";

import { useEffect, useState } from "react";
import { Zap, MapPin } from "lucide-react";
import { getEVChargers, getChargersByType } from "@/lib/simulators/ev";
import { EVCharger } from "@/types/mobility";

export default function EVPage() {
  const [chargers, setChargers] = useState<EVCharger[]>([]);
  const [filterType, setFilterType] = useState<"all" | "fast" | "slow" | "ultra-fast">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      if (filterType === "all") {
        setChargers(getEVChargers());
      } else {
        setChargers(getChargersByType(filterType));
      }
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  const available = chargers.filter((c) => c.availableSockets > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary dark:text-white mb-2">
          EV Charging Network
        </h1>
        <p className="text-text-secondary dark:text-gray-400">
          Find and plan EV charging across Dubai
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Chargers" value={chargers.length} icon={Zap} />
        <StatCard label="Available" value={available} icon={MapPin} />
        <StatCard label="Network Coverage" value="95%" icon={Zap} />
      </div>

      <div className="card-base">
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "fast", "slow", "ultra-fast"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === type
                  ? "bg-accent-warm text-white"
                  : "bg-surface-dark dark:bg-gray-700 text-text-secondary"
              }`}
            >
              {type === "all" ? "All Chargers" : `${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-surface-dark dark:bg-gray-700 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {chargers.slice(0, 20).map((charger) => (
              <div
                key={charger.id}
                className="p-4 border border-border-color dark:border-gray-700 rounded-lg hover:bg-surface-dark dark:hover:bg-gray-700 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-text-primary dark:text-white">
                      {charger.operator}
                    </h4>
                    <p className="text-xs text-text-secondary dark:text-gray-400">
                      {charger.address} • {charger.type}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      charger.availableSockets > 0
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {charger.availableSockets}/{charger.totalSockets} free
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary dark:text-gray-400">
                    {charger.powerOutput}kW • Reliability: {charger.reliability}%
                  </span>
                  <span className="font-semibold text-accent-warm">
                    AED {charger.price.toFixed(2)}/kWh
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card-base bg-blue-50 dark:bg-blue-900/20">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          EV Trip Planner
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Use ARYA to plan multi-leg EV trips with optimal charger suggestions
        </p>
        <button className="mt-4 button-primary">Open Trip Planner</button>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="card-base">
      <Icon className="w-5 h-5 text-accent-warm mb-2" />
      <p className="text-sm text-text-secondary dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-text-primary dark:text-white">{value}</p>
    </div>
  );
}
