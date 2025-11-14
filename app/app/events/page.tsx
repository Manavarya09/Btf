"use client";

import { CalendarDays, MapPin, Users } from "lucide-react";
import { getEventsUpcoming } from "@/lib/simulators/events";

export default function EventsPage() {
  const events = getEventsUpcoming(30).slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dubai Events</h1>
        <p className="text-text-secondary">Mobility impact of upcoming events</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Active Events" value={events.length} icon={CalendarDays} />
        <StatCard label="Avg Transit Delay" value="18 min" icon={Users} />
        <StatCard label="Affected Areas" value="5" icon={MapPin} />
      </div>

      <div className="space-y-3">
        {events.map((event) => {
          const eventDate = new Date(event.startTime);
          const dateStr = eventDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <div key={event.id} className="card-base hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{event.name}</h4>
                  <p className="text-sm text-text-secondary mb-2">
                    {event.location.address}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs bg-surface-dark px-2 py-1 rounded dark:bg-gray-700">
                      {dateStr}
                    </span>
                    <span className="text-xs bg-surface-dark px-2 py-1 rounded dark:bg-gray-700">
                      Expected crowd: {(event.expectedCrowd / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border-color dark:border-gray-700 pt-3 mt-3">
                <p className="text-xs font-semibold text-text-secondary dark:text-gray-400 mb-2">
                  Mobility Impact
                </p>
                <div className="space-y-2 text-sm">
                  <p className="text-text-secondary dark:text-gray-400">
                    <span className="font-semibold">Transit Delay:</span>{" "}
                    {event.mobilityImpact.transitDelays} minutes
                  </p>
                  {event.mobilityImpact.parkedClosures.length > 0 && (
                    <p className="text-text-secondary dark:text-gray-400">
                      <span className="font-semibold">Closed Parking:</span>{" "}
                      {event.mobilityImpact.parkedClosures.slice(0, 2).join(", ")}
                    </p>
                  )}
                  {event.affectedAreas.length > 0 && (
                    <p className="text-text-secondary dark:text-gray-400">
                      <span className="font-semibold">Affected Areas:</span>{" "}
                      {event.affectedAreas.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
      <p className="text-sm text-text-secondary mb-1">{label}</p>
      <p className="text-2xl font-bold text-text-primary dark:text-white">{value}</p>
    </div>
  );
}
