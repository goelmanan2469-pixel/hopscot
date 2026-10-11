// Source: Google Maps Platform Code Assist
import React, { useEffect, useRef, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import L from 'leaflet';
import { Layers } from 'lucide-react';

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

// Sub-component to draw Google Maps route polyline and fit camera bounds
function GoogleMapsRouteLine({
  originLat,
  originLng,
  destLat,
  destLng,
}: {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Extend bounds for both points
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: originLat, lng: originLng });
    bounds.extend({ lat: destLat, lng: destLng });
    map.fitBounds(bounds, { top: 60, bottom: 40, left: 40, right: 40 });

    // Polyline connecting origin to destination with realistic transit curve
    const midLat = (originLat + destLat) / 2 + 0.003;
    const midLng = (originLng + destLng) / 2 - 0.002;

    const polyline = new google.maps.Polyline({
      path: [
        { lat: originLat, lng: originLng },
        { lat: midLat, lng: midLng },
        { lat: destLat, lng: destLng },
      ],
      geodesic: true,
      strokeColor: '#a855f7',
      strokeOpacity: 0.9,
      strokeWeight: 5,
    });

    polyline.setMap(map);

    return () => {
      polyline.setMap(null);
    };
  }, [map, originLat, originLng, destLat, destLng]);

  return null;
}

// Fallback Leaflet OpenStreetMap Renderer
function LeafletFallbackMap({
  originLat,
  originLng,
  originName,
  destLat,
  destLng,
  destName,
}: {
  originLat: number;
  originLng: number;
  originName: string;
  destLat: number;
  destLng: number;
  destName: string;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(map);

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

    const startMarker = L.marker([originLat, originLng], { icon: startIcon }).addTo(map);
    startMarker.bindPopup(`<b>Start Point:</b><br/>${originName}`);

    const destMarker = L.marker([destLat, destLng], { icon: destIcon }).addTo(map);
    destMarker.bindPopup(`<b>Destination Venue:</b><br/>${destName}`);

    const latlngs: [number, number][] = [
      [originLat, originLng],
      [(originLat + destLat) / 2 + 0.004, (originLng + destLng) / 2 - 0.003],
      [destLat, destLng],
    ];

    L.polyline(latlngs, {
      color: '#8b5cf6',
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 8',
    }).addTo(map);

    const bounds = L.latLngBounds([[originLat, originLng], [destLat, destLng]]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
    };
  }, [originLat, originLng, destLat, destLng, originName, destName]);

  return <div ref={mapContainerRef} className="w-full h-80 sm:h-96 z-0" />;
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
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyB-uxeuit041lgPiF9c4qU2wT8iPg-i7YI';
  const [useGoogleMaps, setUseGoogleMaps] = useState<boolean>(true);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-neutral-800 shadow-xl bg-neutral-900">
      
      {/* Route Info Badge Floating on Top */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-2 bg-neutral-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-neutral-800 text-xs shadow-lg">
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

      {/* Map Engine Toggle (Google Maps Platform vs Leaflet) */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-1 bg-neutral-950/85 backdrop-blur-md p-1 rounded-xl border border-neutral-800 text-[11px] shadow-lg">
        <button
          onClick={() => setUseGoogleMaps(true)}
          className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
            useGoogleMaps
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Google Maps Platform with Advanced Markers"
        >
          <Layers className="w-3 h-3" />
          <span>Google Maps</span>
        </button>
        <button
          onClick={() => setUseGoogleMaps(false)}
          className={`px-2 py-1 rounded-lg font-medium transition-all ${
            !useGoogleMaps
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="OpenStreetMap CartoDB Tiles"
        >
          OSM
        </button>
      </div>

      {/* Map Container */}
      <div className="w-full h-80 sm:h-96 relative">
        {useGoogleMaps ? (
          <APIProvider apiKey={apiKey}>
            <Map
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              defaultCenter={{
                lat: (originLat + destLat) / 2,
                lng: (originLng + destLng) / 2,
              }}
              defaultZoom={12}
              gestureHandling="greedy"
              disableDefaultUI={false}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            >
              {/* Origin Marker */}
              <AdvancedMarker position={{ lat: originLat, lng: originLng }} title={originName}>
                <div className="bg-lime-500 text-neutral-950 font-black text-xs px-2.5 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-neutral-950" />
                  <span>Start</span>
                </div>
              </AdvancedMarker>

              {/* Destination Marker */}
              <AdvancedMarker position={{ lat: destLat, lng: destLng }} title={destName}>
                <div className="bg-purple-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
                  <span>★</span>
                  <span>{destName.split(' ')[0]}</span>
                </div>
              </AdvancedMarker>

              {/* Route Line */}
              <GoogleMapsRouteLine
                originLat={originLat}
                originLng={originLng}
                destLat={destLat}
                destLng={destLng}
              />
            </Map>
          </APIProvider>
        ) : (
          <LeafletFallbackMap
            originLat={originLat}
            originLng={originLng}
            originName={originName}
            destLat={destLat}
            destLng={destLng}
            destName={destName}
          />
        )}
      </div>

    </div>
  );
};
