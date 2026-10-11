import React, { useState } from 'react';
import { Event, TravelPlan } from '../types/index.js';
import { api } from '../services/api.js';
import { RouteMap } from '../components/RouteMap.js';
import { 
  MapPin, 
  Clock, 
  Compass, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Loader2 
} from 'lucide-react';

interface TravelPlannerPageProps {
  events: Event[];
  selectedEventId?: string;
  onNavigateToMatches: (eventId?: string) => void;
}

// Preset popular student hubs in Delhi NCR with coordinates
const DELHI_ORIGIN_PRESETS = [
  { name: 'Rohini Sector 14 / Rithala', lat: 28.7180, lng: 77.1250 },
  { name: 'Rohini Sector 13 (Near MAIT)', lat: 28.7220, lng: 77.1290 },
  { name: 'Netaji Subhash Place (Pitampura)', lat: 28.6980, lng: 77.1480 },
  { name: 'Dwarka Mor / Sector 3', lat: 28.6190, lng: 77.0320 },
  { name: 'Janakpuri West Metro Hub', lat: 28.6290, lng: 77.0780 },
  { name: 'Kashmere Gate Metro Interchange', lat: 28.6655, lng: 77.2324 },
  { name: 'Hauz Khas / Green Park', lat: 28.5490, lng: 77.2060 },
  { name: 'Botanical Garden / Noida Sec-18', lat: 28.5640, lng: 77.3340 },
];

export const TravelPlannerPage: React.FC<TravelPlannerPageProps> = ({
  events,
  selectedEventId,
  onNavigateToMatches,
}) => {
  const defaultEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const [selectedEvent, setSelectedEvent] = useState<Event>(defaultEvent);
  
  const [originIndex, setOriginIndex] = useState(0);
  const [customOrigin, setCustomOrigin] = useState('');
  const [departureTime, setDepartureTime] = useState('08:45');
  const [transportMode, setTransportMode] = useState<'Metro' | 'Cab' | 'Bus' | 'Bike' | 'Car'>('Metro');
  const [notes, setNotes] = useState('Meeting near the metro ticket counter. Open to pooling an auto or cab!');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentOrigin = customOrigin
    ? { name: customOrigin, lat: 28.7180, lng: 77.1250 }
    : DELHI_ORIGIN_PRESETS[originIndex];

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
      await api.saveTravelPlan({
        eventId: selectedEvent.id,
        originName: currentOrigin.name,
        originLat: currentOrigin.lat,
        originLng: currentOrigin.lng,
        destinationName: selectedEvent.venue,
        destinationLat: selectedEvent.lat,
        destinationLng: selectedEvent.lng,
        eventDate: selectedEvent.startDate.split('T')[0],
        departureTime,
        transportMode,
        notes,
      });

      setSavedSuccess(true);
      setTimeout(() => {
        onNavigateToMatches(selectedEvent.id);
      }, 800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-lime-400 uppercase tracking-widest">
          <MapPin className="w-3.5 h-3.5" />
          <span>Inter-Campus Transit</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
          Plan Your Travel to the Fest
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Set your departure point and time. We'll show you the route and find other students to commute with.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-5">
            
            {/* Event Dropdown */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                Target Fest / Event
              </label>
              <select
                value={selectedEvent.id}
                onChange={(e) => {
                  const ev = events.find((evt) => evt.id === e.target.value);
                  if (ev) setSelectedEvent(ev);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-bold focus:outline-none focus:border-purple-500"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({evt.collegeName.split('(')[1]?.replace(')', '') || 'Campus'})
                  </option>
                ))}
              </select>
            </div>

            {/* Starting Location Picker */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                Starting Location (Pickup Point)
              </label>
              <select
                value={originIndex}
                onChange={(e) => {
                  setOriginIndex(Number(e.target.value));
                  setCustomOrigin('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
              >
                {DELHI_ORIGIN_PRESETS.map((preset, idx) => (
                  <option key={idx} value={idx}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Departure Time */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                Preferred Departure Time
              </label>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono font-bold focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Preferred Transport Mode */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-2">
                Preferred Transport Mode
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['Metro', 'Cab', 'Bus', 'Bike', 'Car'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTransportMode(mode)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      transportMode === mode
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                Notes / Meetup Details (Visible to accepted squad)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-purple-500"
                placeholder="e.g. Can meet at Gate 2 token counter"
              />
            </div>

            {/* Submit & Match CTA */}
            <button
              onClick={handleSavePlan}
              disabled={isSaving}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-lime-500 hover:from-purple-500 hover:to-lime-400 text-neutral-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-900/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Computing Matches...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Plan Saved! Loading Matches...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Plan & Find Companions</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right Column: Route Map Visualization & Corridor Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white">Route Preview</h3>
                <p className="text-xs text-neutral-400">
                  Visualizing transit corridor from <strong>{currentOrigin.name}</strong> to <strong>{selectedEvent.venue}</strong>
                </p>
              </div>

              <div className="px-3 py-1 rounded-xl bg-purple-950/60 text-purple-300 text-xs font-bold border border-purple-800/40 font-mono">
                {transportMode} ROUTE
              </div>
            </div>

            <RouteMap
              originLat={currentOrigin.lat}
              originLng={currentOrigin.lng}
              originName={currentOrigin.name}
              destLat={selectedEvent.lat}
              destLng={selectedEvent.lng}
              destName={selectedEvent.venue}
              distanceKm={4.8}
              durationMins={22}
            />

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Est. Distance</span>
                <span className="text-white font-bold font-mono">~4.8 km</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Est. Transit Time</span>
                <span className="text-white font-bold font-mono">~20-25 mins</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Metro Recommendation</span>
                <span className="text-lime-400 font-bold">Red / Yellow Line</span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 leading-normal italic">
              * Note: Times and distances are calculated estimates based on standard Delhi NCR road and transit corridors. Always account for fest rush at college entrance gates.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
