import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { TravelGroup, Event } from '../types/index.js';
import { 
  Users, 
  MapPin, 
  Clock, 
  Plus, 
  Compass, 
  Search, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2 
} from 'lucide-react';

interface TravelGroupsPageProps {
  events: Event[];
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: () => void;
}

export const TravelGroupsPage: React.FC<TravelGroupsPageProps> = ({
  events,
  onSelectGroup,
  onCreateGroup,
}) => {
  const [groups, setGroups] = useState<TravelGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('all');

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await api.getGroups({
        eventId: selectedEventId !== 'all' ? selectedEventId : undefined,
        search: search.trim() ? search : undefined,
      });
      setGroups(data.groups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [selectedEventId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGroups();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-lime-400 uppercase tracking-widest">
            <Users className="w-3.5 h-3.5" />
            <span>Community Travel</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
            Campus Travel Squads
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Join a squad travelling to the same fest, coordinate pickup points, and chat before leaving.
          </p>
        </div>

        <button
          onClick={onCreateGroup}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-lime-500 hover:from-purple-500 hover:to-lime-400 text-neutral-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Travel Squad</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search squads by route or keyword (e.g. Rohini, DTU, Rithala)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-purple-500"
          />
        </form>

        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
        >
          <option value="all">All Events ({groups.length} Squads)</option>
          {events.map((evt) => (
            <option key={evt.id} value={evt.id}>
              {evt.title.split('—')[0]}
            </option>
          ))}
        </select>
      </div>

      {/* Squads List Grid */}
      {loading ? (
        <p className="text-center py-12 text-neutral-500 text-xs">Loading squads...</p>
      ) : groups.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800 p-8">
          <Users className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">No squads found</h3>
          <p className="text-xs text-neutral-400 mt-1">Be the first to create a squad for this route!</p>
          <button
            onClick={onCreateGroup}
            className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
          >
            Create Squad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => {
            const openSpots = group.maxMembers - group.members.length;
            const isFull = openSpots <= 0;

            return (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className="group cursor-pointer p-6 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 transition-all duration-200 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-purple-400 tracking-wide">
                        {group.eventTitle.split('—')[0]}
                      </span>
                      <h3 className="font-extrabold text-white text-lg group-hover:text-purple-300 transition-colors mt-0.5">
                        {group.name}
                      </h3>
                    </div>

                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                      isFull 
                        ? 'bg-neutral-800 text-neutral-400 border-neutral-700' 
                        : 'bg-lime-400/10 text-lime-400 border-lime-400/30'
                    }`}>
                      {isFull ? 'SQUAD FULL' : `${openSpots} SPOTS LEFT`}
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-neutral-400 line-clamp-2">
                    {group.description}
                  </p>

                  <div className="mt-4 p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-neutral-300">
                      <MapPin className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                      <span className="truncate">{group.originName} ➔ {group.destinationName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Leaves at {group.departureTime} • {group.transportMode}</span>
                    </div>
                  </div>
                </div>

                {/* Footer: Members Avatars & Action */}
                <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 4).map((m, idx) => (
                        <div
                          key={idx}
                          className="w-7 h-7 rounded-full bg-purple-700 ring-2 ring-neutral-900 flex items-center justify-center text-[10px] font-bold text-white"
                          title={m.userName}
                        >
                          {m.userName.charAt(0)}
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] text-neutral-400 font-medium">
                      {group.members.length} / {group.maxMembers} joined
                    </span>
                  </div>

                  <span className="text-xs font-bold text-purple-400 group-hover:text-purple-300 flex items-center gap-1">
                    <span>View Squad</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
