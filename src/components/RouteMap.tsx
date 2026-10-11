import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface RouteMapProps {
  originLat: number;
  originLng: number;
  originName: string;
  destLat: number;
  destLng: number;
  destName: string;
  distanceKm?: number;
  durationMins?: number;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  originLat,
  originLng,
  originName,
  destLat,
  destLng,
  destName,
  distanceKm,
  durationMins,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up previous instance if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
    });

    // Dark-mode styled OpenStreetMap CartoDB tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(map);

    // Custom Start Marker (Lime Accent)
    const startIcon = L.divIcon({
      className: 'custom-start-marker',
      html: `
        <div style="background-color: #84cc16; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(132, 204, 22, 0.5); border: 3px solid #ffffff;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f0f17" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Custom Destination Marker (Electric Purple Accent)
    const destIcon = L.divIcon({
      className: 'custom-dest-marker',
      html: `
        <div style="background-color: #a855f7; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(168, 85, 247, 0.6); border: 3px solid #ffffff;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    // Add markers
    const startMarker = L.marker([originLat, originLng], { icon: startIcon }).addTo(map);
    startMarker.bindPopup(`<b>Start Point:</b><br/>${originName}`);

    const destMarker = L.marker([destLat, destLng], { icon: destIcon }).addTo(map);
    destMarker.bindPopup(`<b>Destination Venue:</b><br/>${destName}`);

    // Create polyline route connecting the points
    const latlngs: [number, number][] = [
      [originLat, originLng],
      // slight realistic intermediate curve
      [(originLat + destLat) / 2 + 0.004, (originLng + destLng) / 2 - 0.003],
      [destLat, destLng],
    ];

    const polyline = L.polyline(latlngs, {
      color: '#8b5cf6',
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 8',
    }).addTo(map);

    // Fit map bounds to show both points with padding
    const bounds = L.latLngBounds([[originLat, originLng], [destLat, destLng]]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
    };
  }, [originLat, originLng, destLat, destLng, originName, destName]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-neutral-800 shadow-xl bg-neutral-900">
      
      {/* Route Info Badge Floating on Top */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-2 bg-neutral-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-neutral-800 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-400" />
          <span className="text-neutral-300 font-medium truncate max-w-[120px]">{originName}</span>
        </div>
        <span className="text-neutral-500">➔</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
          <span className="text-neutral-300 font-medium truncate max-w-[120px]">{destName}</span>
        </div>

        {distanceKm !== undefined && (
          <div className="ml-auto flex items-center gap-2 pl-2 border-l border-neutral-800">
            <span className="font-bold text-lime-400">~{distanceKm} km</span>
            {durationMins && (
              <span className="text-neutral-400">({durationMins} mins)</span>
            )}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-80 sm:h-96 z-0" />
    </div>
  );
};
