"use client";

export default function MapPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Multi-Layer Map</h1>
      <div className="card-base h-96 flex items-center justify-center bg-surface-dark dark:bg-gray-700">
        <div className="text-center">
          <p className="text-text-secondary dark:text-gray-400 mb-4">
            Mapbox integration ready
          </p>
          <p className="text-sm text-text-secondary dark:text-gray-400">
            To enable the map, add your Mapbox token to.env
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {["EV Chargers", "Parking", "Transit", "Heat Index"].map((layer) => (
          <label key={layer} className="card-base flex items-center gap-2 cursor-pointer hover:bg-surface-dark">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className="font-medium text-sm">{layer}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
