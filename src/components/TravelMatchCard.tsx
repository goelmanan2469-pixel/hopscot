import React from 'react';
import { TravelPlan } from '../types/index.js';
import { MapPin, Clock, Compass, Users, Sparkles, Send } from 'lucide-react';

interface MatchItem {
  plan: TravelPlan;
  matchScore: number;
  distanceKm: number;
  timeDiffMinutes: number;
  matchReasons: string[];
}

interface TravelMatchCardProps {
  match: MatchItem;
  onInviteOrJoin: (plan: TravelPlan) => void;
}

export const TravelMatchCard: React.FC<TravelMatchCardProps> = ({ match, onInviteOrJoin }) => {
  const { plan, matchScore, distanceKm, timeDiffMinutes, matchReasons } = match;

  return (
    <div className="relative group p-5 rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 hover:border-purple-500/50 transition-all duration-200 shadow-xl">
      
      {/* Top Header: Student profile + Match score */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={plan.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={plan.userName}
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-500/40"
          />
          <div>
            <h4 className="font-extrabold text-white text-base leading-tight group-hover:text-purple-300 transition-colors">
              {plan.userName}
            </h4>
            <p className="text-xs text-neutral-400 font-medium">
              {plan.userCollege}
            </p>
          </div>
        </div>

        {/* Compatibility Badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-lime-400/20 text-lime-400 border border-lime-400/30 text-xs font-black">
            <Sparkles className="w-3 h-3 text-lime-400" />
            <span>{matchScore}% MATCH</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono mt-0.5">
            ~{distanceKm} km apart
          </span>
        </div>
      </div>

      {/* Travel details summary */}
      <div className="mt-4 p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-neutral-300">
          <MapPin className="w-3.5 h-3.5 text-lime-400 shrink-0" />
          <span className="truncate">{plan.originName}</span>
        </div>

        <div className="flex items-center gap-1.5 text-neutral-300">
          <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>Departs {plan.departureTime} ({timeDiffMinutes}m diff)</span>
        </div>

        <div className="flex items-center gap-1.5 text-neutral-400 col-span-2">
          <Compass className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Prefers {plan.transportMode} • Heading to {plan.destinationName}</span>
        </div>
      </div>

      {/* Optional Student Note */}
      {plan.notes && (
        <p className="mt-2.5 text-[11px] text-neutral-400 italic line-clamp-2 bg-neutral-900/40 px-2 py-1 rounded-lg">
          "{plan.notes}"
        </p>
      )}

      {/* Match Reasons Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {matchReasons.map((reason, idx) => (
          <span
            key={idx}
            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-950/50 text-purple-300 border border-purple-800/40"
          >
            ✓ {reason}
          </span>
        ))}
      </div>

      {/* Action CTA */}
      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
        <span className="text-[11px] text-neutral-400 font-medium truncate">
          Event: <strong className="text-neutral-200">{plan.eventTitle.split('—')[0]}</strong>
        </span>

        <button
          onClick={() => onInviteOrJoin(plan)}
          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-900/20 shrink-0"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Form Squad</span>
        </button>
      </div>

    </div>
  );
};
