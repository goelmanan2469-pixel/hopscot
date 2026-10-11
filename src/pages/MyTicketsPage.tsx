import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Ticket } from '../types/index.js';
import { TicketCard } from '../components/TicketCard.js';
import { Ticket as TicketIcon, Sparkles, QrCode, ArrowRight } from 'lucide-react';

interface MyTicketsPageProps {
  onExploreEvents: () => void;
  onOpenScannerWithTicket: (ticket: Ticket) => void;
}

export const MyTicketsPage: React.FC<MyTicketsPageProps> = ({
  onExploreEvents,
  onOpenScannerWithTicket,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await api.getMyTickets();
      setTickets(data.tickets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-lime-400 uppercase tracking-widest">
            <TicketIcon className="w-3.5 h-3.5" />
            <span>Digital Passports</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
            My Registered Passes ({tickets.length})
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Valid digital QR tickets issued by HOPSCOT. Present at college entry gate.
          </p>
        </div>

        <button
          onClick={onExploreEvents}
          className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shrink-0"
        >
          <span>Find More Events</span>
          <ArrowRight className="w-4 h-4 text-purple-400" />
        </button>
      </div>

      {/* Tickets Grid */}
      {loading ? (
        <p className="text-center py-16 text-neutral-500 text-xs">Loading passes...</p>
      ) : tickets.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800 p-8">
          <TicketIcon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No tickets booked yet</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Explore upcoming fests across Delhi NCR and grab your free or VIP passes.
          </p>
          <button
            onClick={onExploreEvents}
            className="mt-5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition-colors"
          >
            Explore Events Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((tkt) => (
            <TicketCard
              key={tkt.id}
              ticket={tkt}
              onOpenScannerWithTicket={onOpenScannerWithTicket}
            />
          ))}
        </div>
      )}

    </div>
  );
};
