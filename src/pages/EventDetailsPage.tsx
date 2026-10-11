import React, { useState } from 'react';
import { Event, TicketType, Ticket } from '../types/index.js';
import { api } from '../services/api.js';
import { RouteMap } from '../components/RouteMap.js';
import { RazorpayModal } from '../components/RazorpayModal.js';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Share2, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft,
  Navigation,
  Loader2
} from 'lucide-react';

interface EventDetailsPageProps {
  event: Event;
  onBack: () => void;
  onPlanTravel: (event: Event) => void;
  onTicketSuccess: (ticket: Ticket) => void;
}

export const EventDetailsPage: React.FC<EventDetailsPageProps> = ({
  event,
  onBack,
  onPlanTravel,
  onTicketSuccess,
}) => {
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType>(event.ticketTypes[0]);
  const [isRegisteringFree, setIsRegisteringFree] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFreeRegistration = async () => {
    setIsRegisteringFree(true);
    setFeedbackMsg(null);
    try {
      const res = await api.registerFree(event.id, selectedTicketType.id);
      setFeedbackMsg({ type: 'success', text: res.message });
      onTicketSuccess(res.ticket);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Registration failed' });
    } finally {
      setIsRegisteringFree(false);
    }
  };

  const handleBookTicket = () => {
    if (selectedTicketType.price === 0) {
      handleFreeRegistration();
    } else {
      setIsRazorpayOpen(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events</span>
      </button>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl">
        <div className="h-64 sm:h-80 w-full relative">
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
          
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-xl bg-purple-600/90 backdrop-blur-md text-white font-bold text-xs">
              {event.category}
            </span>
            <span className="px-3 py-1 rounded-xl bg-neutral-950/90 backdrop-blur-md text-white font-mono text-xs font-bold border border-neutral-700">
              {event.collegeName.split('(')[1]?.replace(')', '') || 'DELHI'}
            </span>
          </div>
        </div>

        {/* Title and Key Details */}
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {event.title}
          </h1>
          {event.tagline && (
            <p className="text-sm sm:text-base text-purple-300 font-semibold mt-1">
              {event.tagline}
            </p>
          )}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-neutral-800 text-xs">
            <div className="flex items-center gap-2.5 text-neutral-300">
              <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Date & Time</span>
                <span className="font-semibold">{new Date(event.startDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-neutral-300">
              <MapPin className="w-4 h-4 text-lime-400 shrink-0" />
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Venue</span>
                <span className="font-semibold line-clamp-1">{event.venue}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-neutral-300">
              <Users className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Community</span>
                <span className="font-semibold">{event.attendeeCount}+ Students Attending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Description & Ticketing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Description + Campus Map */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800">
            <h3 className="text-lg font-black text-white mb-3">About the Event</h3>
            <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            <div className="mt-6 pt-6 border-t border-neutral-800">
              <h4 className="text-xs uppercase font-mono font-bold text-neutral-400 mb-2">Organizer Contact</h4>
              <p className="text-xs text-neutral-300 font-medium">
                Hosted by <strong>{event.organizerName}</strong> • {event.organizerContact}
              </p>
            </div>
          </div>

          {/* Social Travel Banner inside Event Details */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 to-neutral-900 border border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-lime-400 text-xs font-black mb-1">
                <Navigation className="w-3.5 h-3.5" />
                <span>Travel Companion Matching</span>
              </div>
              <h4 className="text-base font-bold text-white">Don’t commute to this fest alone!</h4>
              <p className="text-xs text-neutral-300 mt-0.5">
                Find other students traveling from your area and ride together.
              </p>
            </div>

            <button
              onClick={() => onPlanTravel(event)}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition-colors shrink-0 shadow-lg shadow-purple-900/30 flex items-center justify-center gap-1.5"
            >
              <span>Plan Travel & Match</span>
            </button>
          </div>

          {/* Campus Venue Map Preview */}
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Venue Location</h3>
              <span className="text-xs text-neutral-400 font-mono">{event.collegeName}</span>
            </div>

            <RouteMap
              originLat={28.7180}
              originLng={77.1250}
              originName="Rohini (Starting Area)"
              destLat={event.lat}
              destLng={event.lng}
              destName={event.venue}
              distanceKm={4.2}
              durationMins={20}
            />
          </div>
        </div>

        {/* Right Column: Ticket Category Selection & Registration Box */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 sticky top-24 space-y-5">
            <div>
              <span className="text-xs uppercase font-mono font-bold text-lime-400">Pass Selection</span>
              <h3 className="text-xl font-black text-white mt-0.5">Select Ticket Tier</h3>
            </div>

            {/* Ticket Tier Cards */}
            <div className="space-y-3">
              {event.ticketTypes.map((tier) => {
                const isSelected = selectedTicketType.id === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTicketType(tier)}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/50'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{tier.name}</h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{tier.description}</p>
                      </div>
                      <span className="font-mono text-base font-black text-lime-400">
                        {tier.price === 0 ? 'FREE' : `₹${tier.price}`}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {tier.perks.map((perk, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 font-medium"
                        >
                          ✓ {perk}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  feedbackMsg.type === 'success'
                    ? 'bg-lime-950/50 text-lime-300 border border-lime-800/50'
                    : 'bg-rose-950/50 text-rose-300 border border-rose-800/50'
                }`}
              >
                {feedbackMsg.text}
              </div>
            )}

            {/* Action CTA Button */}
            <button
              onClick={handleBookTicket}
              disabled={isRegisteringFree}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-lime-500 hover:from-purple-500 hover:to-lime-400 text-neutral-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-900/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isRegisteringFree ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                  <span>Issuing Pass...</span>
                </>
              ) : selectedTicketType.price === 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-neutral-950" />
                  <span>Confirm Free Registration</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-neutral-950" />
                  <span>Book VIP Pass (₹{selectedTicketType.price})</span>
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-neutral-500 font-mono">
              Generates instant tamper-proof QR barcode for gate check-in
            </p>
          </div>
        </div>

      </div>

      {/* Razorpay Test Modal */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        event={event}
        ticketType={selectedTicketType}
        onSuccess={(ticket) => {
          setIsRazorpayOpen(false);
          onTicketSuccess(ticket);
        }}
      />

    </div>
  );
};
