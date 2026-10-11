import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { TravelPlan, TravelGroup, Event } from '../types/index.js';
import { TravelMatchCard } from '../components/TravelMatchCard.js';
import { 
  Sparkles, 
  Users, 
  MapPin, 
  Clock, 
  Plus, 
  CheckCircle2, 
  X, 
  Loader2, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

interface TravelMatchesPageProps {
  events: Event[];
  eventId?: string;
  onNavigateToGroup: (groupId: string) => void;
  onPlanTrip: () => void;
}

export const TravelMatchesPage: React.FC<TravelMatchesPageProps> = ({
  events,
  eventId,
  onNavigateToGroup,
  onPlanTrip,
}) => {
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<TravelPlan | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState<TravelPlan | null>(null);

  // Form states for creating squad
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await api.getTravelMatches(eventId);
      setUserPlan(data.userPlan);
      setMatches(data.matches);
    } catch (err) {
      console.error('Failed to load matches', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [eventId]);

  const handleOpenCreateSquad = (companion?: TravelPlan) => {
    if (companion) {
      setSelectedCompanion(companion);
      setGroupName(`${companion.originName.split(',')[0]} ➡️ ${companion.destinationName.split(' ')[0]} Squad`);
      setGroupDescription(`Traveling with ${companion.userName} and fellow students to catch the fest vibes!`);
    } else {
      setSelectedCompanion(null);
      setGroupName('Campus Fest Travel Squad');
      setGroupDescription('Let’s commute together, split travel fares, and arrive as a crew.');
    }
    setCreateModalOpen(true);
  };

  const handleCreateSquadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setIsSubmitting(true);
    try {
      const targetEventId = userPlan?.eventId || (events[0] ? events[0].id : 'evt-invictus-2026');
      const origin = userPlan?.originName || selectedCompanion?.originName || 'Rohini Sector 14';

      const res = await api.createGroup({
        eventId: targetEventId,
        name: groupName,
        description: groupDescription,
        originName: origin,
        departureTime: userPlan?.departureTime || '08:45',
        maxMembers,
      });

      setCreateModalOpen(false);
      onNavigateToGroup(res.group.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-lime-400 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Travel Matchmaker</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
            Students Heading Your Way
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Matched based on shared destination fest, nearby departure area, and compatible timings.
          </p>
        </div>

        <button
          onClick={() => handleOpenCreateSquad()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-lime-500 hover:from-purple-500 hover:to-lime-400 text-neutral-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Travel Squad</span>
        </button>
      </div>

      {/* User's active travel plan banner */}
      {userPlan && (
        <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 flex items-center justify-center border border-purple-500/30">
              <MapPin className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <span className="text-[10px] text-purple-300 font-mono font-bold uppercase block">Your Active Route</span>
              <strong className="text-white text-sm">{userPlan.originName} ➔ {userPlan.destinationName}</strong>
              <span className="text-neutral-400 block mt-0.5">Departing at {userPlan.departureTime} • {userPlan.transportMode}</span>
            </div>
          </div>

          <button
            onClick={onPlanTrip}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 text-purple-300 border border-purple-800/50 hover:bg-neutral-800 font-bold transition-colors"
          >
            Edit Route
          </button>
        </div>
      )}

      {/* Matches Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-neutral-400">Scanning students heading to the same fest...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800 p-8">
          <Users className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No travel matches yet</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
            You might be the first student traveling on this corridor, or you haven't set a departure point yet.
          </p>
          <button
            onClick={onPlanTrip}
            className="mt-4 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
          >
            Set Your Travel Route
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((matchItem, idx) => (
            <TravelMatchCard
              key={idx}
              match={matchItem}
              onInviteOrJoin={(companion) => handleOpenCreateSquad(companion)}
            />
          ))}
        </div>
      )}

      {/* CREATE TRAVEL SQUAD MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-black text-white">Create Travel Squad</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSquadSubmit} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="text-neutral-300 font-bold block mb-1">Squad Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Rohini ➡️ DTU Hackathon Squad"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-semibold focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">Description / Meetup Plan</label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Rendezvous at Rithala Metro Exit 2 at 8:40 AM. Cab or shared auto to main gate."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 font-bold block mb-1">Max Squad Size</label>
                  <select
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value={3}>3 members</option>
                    <option value={4}>4 members (Cab size)</option>
                    <option value={6}>6 members</option>
                    <option value={8}>8 members</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-300 font-bold block mb-1">Privacy Level</label>
                  <div className="px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-lime-400 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Verified Students</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black transition-all shadow-md shadow-purple-900/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Squad...' : 'Publish Travel Squad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
