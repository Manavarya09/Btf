"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { EVCharger, ParkingZone, TransitStop } from "@/types/mobility";
import { getEVChargers } from "@/lib/simulators/ev";
import { getParkingZones } from "@/lib/simulators/parking";
import { getTransitStopsNearLocation } from "@/lib/simulators/transit";
import { getHeatIndexForLocations } from "@/lib/simulators/heat";

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [layers, setLayers] = useState({
    evChargers: true,
    parking: true,
    transit: true,
    heat: false,
  });
  const [evFilterType, setEvFilterType] = useState<"all" | "fast" | "slow" | "ultra-fast">("all");
  const [chargers, setChargers] = useState<EVCharger[]>([]);
  const [parking, setParking] = useState<ParkingZone[]>([]);
  const [transitStops, setTransitStops] = useState<TransitStop[]>([]);

  useEffect(() => {
    // Load data
    console.log("Loading map data...");
    const chargersData = getEVChargers();
    const parkingData = getParkingZones();
    
    console.log("EV Chargers loaded:", chargersData.length);
    console.log("Parking zones loaded:", parkingData.length);
    
    setChargers(chargersData);
    setParking(parkingData);
    
    // Get transit stops for Dubai area
    const dubaiCenter = {
      id: "dubai-center",
      latitude: 25.2048,
      longitude: 55.2708,
      address: "Downtown Dubai",
      district: "Downtown Dubai",
    };
    const transitData = getTransitStopsNearLocation(dubaiCenter, 10);
    console.log("Transit stops loaded:", transitData.length);
    setTransitStops(transitData);
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    console.log("Initializing Mapbox map...");
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [55.2708, 25.2048], // Dubai coordinates
      zoom: 11,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

    // Wait for map to load
    map.current.on("load", () => {
      console.log("Map loaded successfully");
      addMarkers();
    });

    // Handle map errors
    map.current.on("error", (e) => {
      console.error("Map error:", e);
    });

    return () => {
      console.log("Cleaning up map");
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (map.current) {
      updateLayers();
    }
  }, [layers, chargers, parking, transitStops]);

  const addMarkers = () => {
    if (!map.current) return;

    console.log("Adding markers for layers:", layers);
    console.log("Data counts - Chargers:", chargers.length, "Parking:", parking.length, "Transit:", transitStops.length);

    // Clear existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    // Add EV charger markers
    if (layers.evChargers && chargers.length > 0) {
      console.log("Adding EV charger markers");
      chargers.forEach((charger) => {
        const el = createMarkerElement('charger', charger.availableSockets > 0 ? '#10b981' : '#ef4444');
        new mapboxgl.Marker(el)
          .setLngLat([charger.longitude, charger.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <h3 class="font-bold text-sm">${charger.operator}</h3>
                <p class="text-xs text-gray-600">${charger.address}</p>
                <p class="text-xs mt-1">${charger.type} charging • ${charger.powerOutput}kW</p>
                <p class="text-xs font-semibold ${charger.availableSockets > 0 ? 'text-green-600' : 'text-red-600'}">
                  ${charger.availableSockets}/${charger.totalSockets} available
                </p>
                <p class="text-xs text-accent-warm font-bold">AED ${charger.price.toFixed(2)}/kWh</p>
              </div>
            `)
          )
          .addTo(map.current!);
      });
    }

    // Add parking markers
    if (layers.parking && parking.length > 0) {
      console.log("Adding parking markers");
      parking.forEach((zone) => {
        const available = zone.capacity - zone.occupied;
        const el = createMarkerElement('parking', available > 0 ? '#3b82f6' : '#ef4444');
        new mapboxgl.Marker(el)
          .setLngLat([zone.longitude, zone.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <h3 class="font-bold text-sm">${zone.district} Parking</h3>
                <p class="text-xs text-gray-600">${zone.address}</p>
                <p class="text-xs font-semibold ${available > 0 ? 'text-blue-600' : 'text-red-600'}">
                  ${available}/${zone.capacity} spaces available
                </p>
                <p class="text-xs text-accent-warm font-bold">AED ${zone.hourlyRate}/hour</p>
                <p class="text-xs text-gray-500">${zone.type} parking</p>
              </div>
            `)
          )
          .addTo(map.current!);
      });
    }

    // Add transit markers
    if (layers.transit && transitStops.length > 0) {
      console.log("Adding transit markers");
      transitStops.forEach((stop) => {
        const el = createMarkerElement('transit', '#8b5cf6');
        new mapboxgl.Marker(el)
          .setLngLat([stop.longitude, stop.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <h3 class="font-bold text-sm">${stop.district} Transit Stop</h3>
                <p class="text-xs text-gray-600">${stop.address}</p>
                <p class="text-xs font-semibold text-purple-600">
                  ${stop.routes.length} routes available
                </p>
                ${stop.nextArrivals.slice(0, 2).map(arrival => `
                  <p class="text-xs text-gray-500">
                    Route ${arrival.routeId}: ${arrival.arrivalTime} min
                  </p>
                `).join('')}
              </div>
            `)
          )
          .addTo(map.current!);
      });
    }

    // Add heat overlay
    if (layers.heat) {
      console.log("Adding heat overlay");
      addHeatOverlay();
    }
  };

  const createMarkerElement = (type: string, color: string) => {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = color;
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    
    // Add icon based on type
    const icon = document.createElement('div');
    icon.style.width = '12px';
    icon.style.height = '12px';
    icon.style.margin = '4px auto';
    icon.style.backgroundSize = 'contain';
    
    switch (type) {
      case 'charger':
        icon.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M7 2v11h3v9l7-12h-4l4-8z'/%3E%3C/svg%3E")`;
        break;
      case 'parking':
        icon.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M13 3h-2v5H8v2h3v2h-2v2h2v2h-3v2h3v5h2v-5h2v-2h-2v-2h2v-2h-2V8h2V6h-2V3m-3 7h2v2h-2v-2m0 4h2v2h-2v-2z'/%3E%3C/svg%3E")`;
        break;
      case 'transit':
        icon.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M18 11h-2V7h2m-4 0h-2v4h2m-4 0H8V7h2M6 7H4v4h2m12.5 6c.8 0 1.5-.7 1.5-1.5S19.3 10 18.5 10 17 10.7 17 11.5 17.7 13 18.5 13M6.5 13c.8 0 1.5-.7 1.5-1.5S7.8 10 7 10 5.5 10.7 5.5 11.5 6.2 13 6.5 13M21 5H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z'/%3E%3C/svg%3E")`;
        break;
    }
    
    el.appendChild(icon);
    return el;
  };

  const addHeatOverlay = () => {
    if (!map.current) return;

    // Create heat map source
    const heatData: GeoJSON.FeatureCollection<GeoJSON.Point> = {
      type: 'FeatureCollection',
      features: chargers.map(charger => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [charger.longitude, charger.latitude]
        },
        properties: {
          heat: Math.random() * 100 // Simulated heat data
        }
      }))
    };

    if (map.current.getSource('heat')) {
      map.current.removeSource('heat');
    }

    map.current.addSource('heat', {
      type: 'geojson',
      data: heatData
    });

    map.current.addLayer({
      id: 'heat-layer',
      type: 'heatmap',
      source: 'heat',
      paint: {
        'heatmap-weight': ['get', 'heat'],
        'heatmap-intensity': 0.5,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0, 0, 255, 0)',
          0.2, 'rgb(0, 255, 0)',
          0.4, 'rgb(255, 255, 0)',
          0.6, 'rgb(255, 165, 0)',
          0.8, 'rgb(255, 0, 0)',
          1, 'rgb(139, 0, 0)'
        ],
        'heatmap-radius': 30,
        'heatmap-opacity': 0.7
      }
    });
  };

  const updateLayers = () => {
    console.log("Updating layers:", layers);
    addMarkers();
    
    if (layers.heat && map.current) {
      addHeatOverlay();
    } else if (map.current && map.current.getLayer('heat-layer')) {
      console.log("Removing heat layer");
      map.current.removeLayer('heat-layer');
      map.current.removeSource('heat');
    }
  };

  const handleLayerToggle = (layer: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-white">Multi-Layer Map</h1>
        <p className="text-text-secondary dark:text-gray-400">
          Interactive Dubai mobility map with real-time data
        </p>
      </div>

      <div className="card-base">
        <div className="h-96 relative rounded-lg overflow-hidden">
          <div ref={mapContainer} className="h-full w-full" />
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 space-y-2">
            {Object.entries(layers).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleLayerToggle(key as keyof typeof layers)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
            <h4 className="text-sm font-semibold mb-2">Legend</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Available EV Chargers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Full/Unavailable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Parking Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>Transit Stops</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {layers.evChargers && (
        <div className="card-base">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">EV Chargers Nearby</h3>
            <div className="flex gap-2">
              {(["all","fast","slow","ultra-fast"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setEvFilterType(t)}
                  className={`px-3 py-1 rounded text-xs ${evFilterType===t?"bg-accent-warm text-white":"bg-surface-dark dark:bg-gray-700"}`}
                >
                  {t==='all'? 'All' : t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(evFilterType==="all"? chargers : chargers.filter(c=>c.type===evFilterType)).slice(0,20).map((c)=>(
              <div key={c.id} className="p-3 border border-border-color dark:border-gray-700 rounded hover:bg-surface-dark dark:hover:bg-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold">{c.operator}</p>
                    <p className="text-xs text-text-secondary dark:text-gray-400">{c.address} • {c.type} • {c.powerOutput}kW</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${c.availableSockets>0?"bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400":"bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>{c.availableSockets}/{c.totalSockets}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Reliability {c.reliability}%</span>
                  <span className="font-semibold text-accent-warm">AED {c.price.toFixed(2)}/kWh</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {["EV Chargers", "Parking", "Transit", "Heat Index"].map((layer, index) => {
          const key = Object.keys(layers)[index] as keyof typeof layers;
          return (
            <label key={layer} className="card-base flex items-center gap-2 cursor-pointer hover:bg-surface-dark">
              <input 
                type="checkbox" 
                checked={layers[key]}
                onChange={() => handleLayerToggle(key)}
                className="w-4 h-4 rounded" 
              />
              <span className="font-medium text-sm">{layer}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}