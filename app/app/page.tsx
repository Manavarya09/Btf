"use client";

import { useEffect, useState } from "react";
import { Zap, MapPin, Wind, Users, AlertTriangle, Waypoints } from "lucide-react";
import { getEVChargers } from "@/lib/simulators/ev";
import { fetchChargersFromOCM } from "@/lib/openchargemap";
import { getParkingZones } from "@/lib/simulators/parking";
import { getHeatIndexForLocations, getHydrationRecommendation } from "@/lib/simulators/heat";
import { getEventsUpcoming } from "@/lib/simulators/events";
import { EVCharger, ParkingZone } from "@/types/mobility";

export default function AppOverview() {
  const [chargers, setChargers] = useState<EVCharger[]>([]);
  const [parking, setParking] = useState<ParkingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [temp, setTemp] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const loc = { latitude: position.coords.latitude, longitude: position.coords.longitude };
            setUserLocation(loc);
            const data = await fetchChargersFromOCM(loc.latitude, loc.longitude, 10);
            setChargers(data.slice(0, 5) as EVCharger[]);
            setParking(getParkingZones().slice(0, 5));
          },
          async () => {
            const data = getEVChargers().slice(0, 5);
            setChargers(data);
            setParking(getParkingZones().slice(0, 5));
          }
        );
      } else {
        setChargers(getEVChargers().slice(0, 5));
        setParking(getParkingZones().slice(0, 5));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const lat = userLocation?.latitude ?? 25.2048;
        const lon = userLocation?.longitude ?? 55.2708;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.current?.temperature_2m != null) {
          setTemp(Math.round(data.current.temperature_2m));
        }
      } catch {}
    };
    fetchWeather();
  }, [userLocation]);

  const availableChargers = chargers.filter((c) => c.availableSockets > 0).length;
  const availableParking = parking.filter((p) => p.occupied < p.capacity).length;
  const events = getEventsUpcoming().length;
  const hydration = getHydrationRecommendation(temp ?? 38);

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary dark:text-white mb-2">
          Welcome to ARYA
        </h1>
        <p className="text-text-secondary dark:text-gray-400">
          Your AI-powered mobility assistant for smart Dubai navigation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Zap}
          label="EV Chargers Available"
          value={availableChargers}
          total={chargers.length}
          color="text-amber-500"
        />
        <MetricCard
          icon={MapPin}
          label="Parking Available"
          value={availableParking}
          total={parking.length}
          color="text-blue-500"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Heat Risk"
          value={temp!=null ? (temp >= 40 ? "High" : temp >= 35 ? "Moderate" : "Low") : "--"}
          subtext={temp!=null ? `${temp}°C` : "Fetching"}
          color="text-red-500"
        />
        <MetricCard
          icon={Users}
          label="Active Events"
          value={events}
          subtext="This month"
          color="text-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Quick Actions">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <QuickActionButton icon={Waypoints} label="Plan Route" href="/app/routes" />
              <QuickActionButton icon={Zap} label="Find Chargers" href="/app/ev" />
              <QuickActionButton icon={MapPin} label="View Map" href="/app/map" />
              <QuickActionButton icon={Wind} label="Health Check" href="/app/health" />
            </div>
          </Section>

          <Section title="Nearby EV Chargers">
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-surface-dark dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {chargers.slice(0, 3).map((charger) => (
                  <div
                    key={charger.id}
                    className="card-base flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-primary dark:text-white">
                        {charger.operator}
                      </h4>
                      <p className="text-sm text-text-secondary dark:text-gray-400">
                        {charger.type} charging · {charger.availableSockets}/{charger.totalSockets} sockets
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent-warm">
                        {charger.availableSockets > 0 ? "Available" : "Full"}
                      </p>
                      <p className="text-sm text-text-secondary dark:text-gray-400">
                        AED {charger.price.toFixed(2)}/kWh
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Safety Recommendations">
            <div className="card-base bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-400">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
                {hydration.message}
              </p>
              <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
                <span>Recommended water intake:</span>
                <span className="font-bold">{hydration.waterPerHour}ml/hour</span>
              </div>
            </div>
          </Section>
        </div>

        <div>
          <Section title="ARYA Assistant">
            <div className="card-base flex flex-col items-center justify-center p-8 bg-gradient-to-br from-accent-warm to-accent-teal text-white">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2">Need Help?</h3>
              <p className="text-sm text-center text-white/80 mb-4">
                Ask me anything about mobility, routes, or safety
              </p>
              <button
                className="w-full px-4 py-2 bg-white text-accent-warm font-semibold rounded-lg hover:bg-white/90 transition-all"
                onClick={() => {
                  const ev = new CustomEvent("arya:open", { detail: {} });
                  window.dispatchEvent(ev);
                }}
              >
                Open Chat
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs text-text-secondary dark:text-gray-400 font-semibold">
                Try asking:
              </p>
              <div className="space-y-2">
                {[
                  "Find EV chargers near me",
                  "Show parking options",
                  "Is it safe to walk now?",
                ].map((query, i) => (
                  <button
                    key={i}
                    className="w-full text-left p-2 rounded text-sm hover:bg-surface-dark dark:hover:bg-gray-700 transition-colors text-text-secondary dark:text-gray-400"
                    onClick={() => {
                      const ev = new CustomEvent("arya:open", { detail: { message: query } });
                      window.dispatchEvent(ev);
                    }}
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  total?: number;
  subtext?: string;
  color: string;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  total,
  subtext,
  color,
}: MetricCardProps) {
  return (
    <div className="card-base">
      <div className={`${color} mb-3`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-xs md:text-sm text-text-secondary dark:text-gray-400 mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl md:text-3xl font-bold text-text-primary dark:text-white">
          {value}
        </p>
        {total && (
          <p className="text-sm text-text-secondary dark:text-gray-400">
            of {total}
          </p>
        )}
      </div>
      {subtext && (
        <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">
          {subtext}
        </p>
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

function QuickActionButton({
  icon: Icon,
  label,
  href,
}: QuickActionButtonProps) {
  return (
    <a
      href={href}
      className="card-base flex flex-col items-center justify-center p-4 hover:bg-accent-warm hover:text-white transition-all duration-200 group"
    >
      <Icon className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform" />
      <span className="text-xs text-center font-medium">{label}</span>
    </a>
  );
}
