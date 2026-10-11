import React from 'react';
import { Event, College } from '../types/index.js';
import { 
  Sparkles, 
  MapPin, 
  Users, 
  Ticket, 
  ArrowRight, 
  ShieldCheck, 
  Calendar, 
  Compass, 
  CheckCircle2, 
  Zap, 
  Navigation 
} from 'lucide-react';

interface LandingPageProps {
  events: Event[];
  colleges: College[];
  onExploreEvents: () => void;
  onOpenTravelPlanner: () => void;
  onOpenTravelMatches: () => void;
  onSelectEvent: (eventId: string) => void;
  onOpenOrganizer: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  events,
  colleges,
  onExploreEvents,
  onOpenTravelPlanner,
  onOpenTravelMatches,
  onSelectEvent,
  onOpenOrganizer,
}) => {
  const featuredEvents = events.slice(0, 3);

  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative pt-10 sm:pt-16 pb-12 overflow-hidden">
        {/* Background Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[200px] bg-lime-400/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-800/60 text-purple-300 text-xs font-bold mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
            <span>Delhi NCR Edition • 8+ Premier Universities Live</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Your Campus. <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-lime-400">Their Campus.</span><br />
            One Big Scene.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-neutral-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Discover college events, find your people, and travel together. Don’t commute alone to hackathons, concerts, and cultural fests — find buddies heading your way.
          </p>

          {/* Primary CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onExploreEvents}
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-lime-500 hover:from-purple-500 hover:to-lime-400 text-neutral-950 font-black text-sm sm:text-base flex items-center gap-2 shadow-xl shadow-purple-900/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Compass className="w-5 h-5 text-neutral-950" />
              <span>Explore All Events</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onOpenTravelMatches}
              className="px-6 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 font-bold text-sm sm:text-base flex items-center gap-2 transition-all hover:border-purple-500/50"
            >
              <Users className="w-5 h-5 text-lime-400" />
              <span>Match Travel Buddies</span>
            </button>
          </div>

          {/* Active Delhi NCR Colleges strip */}
          <div className="mt-12 pt-8 border-t border-neutral-800/60">
            <p className="text-xs uppercase tracking-widest font-mono text-neutral-500 mb-3">
              Fests & Tech Leagues across NCR
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {colleges.map((col) => (
                <span
                  key={col.id}
                  className="px-3 py-1 rounded-xl bg-neutral-900/90 border border-neutral-800 text-neutral-300 font-bold text-xs tracking-tight hover:border-purple-500/40 transition-colors"
                >
                  {col.shortCode}
                </span>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* HOW HOPSCOT WORKS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-bold text-lime-400 uppercase tracking-widest">
            The HOPSCOT Way
          </span>
          <h2 className="text-3xl font-black text-white mt-1">
            Never travel alone to a college fest again
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 relative overflow-hidden group hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-black text-lg mb-4 border border-purple-500/30">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Discover Fests & Hackathons</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Browse verified fests from DTU, NSUT, MAIT, IIITD, and more. Register for free passes or book VIP pro-nite tickets with instant Razorpay checkout.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 relative overflow-hidden group hover:border-lime-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-lime-400/20 text-lime-400 flex items-center justify-center font-black text-lg mb-4 border border-lime-400/30">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Commute Matching</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Enter your starting point (e.g. Rohini, Noida, Dwarka). Our geospatial engine matches students heading to the same venue at the same time to travel together.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 relative overflow-hidden group hover:border-indigo-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black text-lg mb-4 border border-indigo-500/30">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Passports & Gate QR Scanner</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Receive your tamper-proof digital QR festival pass. Organizers scan and authenticate your ticket at the campus gate in under 1 second.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS SHOWCASE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trending Now</span>
            </div>
            <h2 className="text-3xl font-black text-white mt-1">Hottest Upcoming Campus Events</h2>
          </div>

          <button
            onClick={onExploreEvents}
            className="text-sm font-bold text-lime-400 hover:text-lime-300 flex items-center gap-1.5 transition-colors"
          >
            <span>View All {events.length} Events</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => onSelectEvent(evt.id)}
              className="group cursor-pointer rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col"
            >
              {/* Event Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-neutral-950">
                <img
                  src={evt.bannerUrl}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
                
                {/* College Short Code Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-neutral-950/80 backdrop-blur-md text-white font-mono text-xs font-bold border border-neutral-700">
                  {evt.collegeName.split('(')[1]?.replace(')', '') || 'DELHI'}
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-purple-600/80 backdrop-blur-md text-white font-bold text-xs">
                  {evt.category}
                </div>

                {/* Price pill */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-lime-400 text-neutral-950 font-black text-xs shadow-lg">
                  {evt.ticketTypes[0]?.price === 0 ? 'FREE ENTRY' : `From ₹${evt.ticketTypes[0]?.price}`}
                </div>
              </div>

              {/* Event Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-lg text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                    {evt.title}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
                    {evt.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-800 text-xs text-neutral-400 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>{new Date(evt.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-lime-400" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRAVEL SQUADS HIGHLIGHT */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-purple-950/40 via-neutral-900 to-neutral-950 border border-purple-800/40 relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/20 text-lime-400 text-xs font-bold mb-4 border border-lime-400/30">
              <Sparkles className="w-3 h-3" />
              <span>Real Social Matching</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Going to DTU Invictus from Rohini or Pitampura?
            </h2>
            <p className="mt-3 text-neutral-300 text-sm sm:text-base leading-relaxed">
              Aman Sharma and Riya Sen are already planning to meet at Rithala Metro Gate 2. Form a squad, split a cab, or hop on the Red Line together!
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={onOpenTravelMatches}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-purple-900/30"
              >
                <Users className="w-4 h-4" />
                <span>See Commute Matches</span>
              </button>
              <button
                onClick={onOpenTravelPlanner}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all"
              >
                <Navigation className="w-4 h-4 text-lime-400" />
                <span>Plan Your Route</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ORGANIZER CALLOUT */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <div className="p-8 rounded-3xl bg-neutral-900/70 border border-neutral-800">
          <h3 className="text-xl sm:text-2xl font-black text-white">Hosting a College Fest or Hackathon?</h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl mx-auto">
            Manage registrations, issue tamper-proof digital passes, and scan QR codes at entry gates with 0ms delay.
          </p>
          <button
            onClick={onOpenOrganizer}
            className="mt-5 px-6 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs sm:text-sm border border-neutral-700 transition-colors inline-flex items-center gap-2"
          >
            <span>Open Organizer Dashboard</span>
            <ArrowRight className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </section>

    </div>
  );
};
