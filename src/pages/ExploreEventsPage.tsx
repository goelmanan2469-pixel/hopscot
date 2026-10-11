import React, { useState } from 'react';
import { Event, College } from '../types/index.js';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Tag, 
  Ticket, 
  ArrowRight, 
  Sparkles 
} from 'lucide-react';

interface ExploreEventsPageProps {
  events: Event[];
  colleges: College[];
  onSelectEvent: (eventId: string) => void;
  onQuickRegister: (event: Event) => void;
}

export const ExploreEventsPage: React.FC<ExploreEventsPageProps> = ({
  events,
  colleges,
  onSelectEvent,
  onQuickRegister,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState<'all' | 'free' | 'paid'>('all');

  const categories = [
    'All',
    'Hackathons',
    'Cultural fests',
    'Technical',
    'Music',
    'Gaming',
    'Workshops',
  ];

  // Filtering
  const filteredEvents = events.filter((evt) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesSearch =
        evt.title.toLowerCase().includes(q) ||
        evt.collegeName.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        evt.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    if (selectedCategory !== 'All' && evt.category !== selectedCategory) {
      return false;
    }

    if (selectedCollege !== 'all' && evt.collegeId !== selectedCollege) {
      return false;
    }

    if (selectedPrice === 'free') {
      const hasFree = evt.ticketTypes.some((t) => t.price === 0);
      if (!hasFree) return false;
    } else if (selectedPrice === 'paid') {
      const hasPaid = evt.ticketTypes.some((t) => t.price > 0);
      if (!hasPaid) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-lime-400 uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Campus Scene Radar</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
          Explore College Events & Fests
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Discover hackathons, battles of bands, star nights, and pro workshops across Delhi NCR.
        </p>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="space-y-4 bg-neutral-900/60 p-5 rounded-3xl border border-neutral-800">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event title, college name, keywords (e.g. Invictus, CTF, Rock Band)..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Categories Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Row: College Selector & Price Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
          
          {/* College Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-medium">Campus:</span>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Colleges ({events.length})</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shortCode} — {c.name.split('(')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Price Selector */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setSelectedPrice('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                selectedPrice === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
              }`}
            >
              All Passes
            </button>
            <button
              onClick={() => setSelectedPrice('free')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                selectedPrice === 'free' ? 'bg-lime-400 text-neutral-950 font-black' : 'text-neutral-400'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setSelectedPrice('paid')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                selectedPrice === 'paid' ? 'bg-purple-600 text-white' : 'text-neutral-400'
              }`}
            >
              Paid
            </button>
          </div>

        </div>

      </div>

      {/* Events Results Grid */}
      {filteredEvents.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800">
          <p className="text-neutral-400 text-base font-semibold">No events matching your filters</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedCollege('all');
              setSelectedPrice('all');
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-neutral-800 text-purple-300 text-xs font-bold hover:bg-neutral-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const lowestPrice = Math.min(...evt.ticketTypes.map((t) => t.price));
            const hasFree = evt.ticketTypes.some((t) => t.price === 0);

            return (
              <div
                key={evt.id}
                className="group rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden hover:border-purple-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Banner */}
                  <div
                    onClick={() => onSelectEvent(evt.id)}
                    className="relative h-48 w-full overflow-hidden bg-neutral-950 cursor-pointer"
                  >
                    <img
                      src={evt.bannerUrl}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-neutral-950/85 backdrop-blur-md text-white font-mono text-xs font-bold border border-neutral-700">
                      {evt.collegeName.split('(')[1]?.replace(')', '') || 'DELHI'}
                    </div>

                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-purple-600/80 backdrop-blur-md text-white font-bold text-xs">
                      {evt.category}
                    </div>

                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-lime-400 text-neutral-950 font-black text-xs shadow-lg">
                      {hasFree ? 'FREE PASS' : `₹${lowestPrice}`}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <h3
                      onClick={() => onSelectEvent(evt.id)}
                      className="font-black text-lg text-white group-hover:text-purple-300 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {evt.title}
                    </h3>
                    <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
                      {evt.description}
                    </p>

                    <div className="mt-4 pt-4 border-t border-neutral-800/80 text-xs text-neutral-400 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{new Date(evt.startDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => onSelectEvent(evt.id)}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => onQuickRegister(evt)}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-colors shadow-md shadow-purple-900/20"
                  >
                    {hasFree ? 'Register Free' : 'Get Pass'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
