import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Ticket } from '../types/index.js';
import { CheckCircle2, QrCode, Calendar, MapPin, Sparkles, AlertTriangle, Download, Share2 } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  onOpenScannerWithTicket?: (ticket: Ticket) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onOpenScannerWithTicket }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(ticket.qrPayload, {
      width: 280,
      margin: 1,
      color: {
        dark: '#0f0f17',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error', err));
  }, [ticket.qrPayload]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ticket.ticketNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUsed = ticket.status === 'used';

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 shadow-2xl transition-all duration-300 hover:border-purple-500/40">
      
      {/* Decorative Top Accent Glow */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-lime-400 to-indigo-500" />
      
      {/* Ticket Header */}
      <div className="p-6 sm:p-7 border-b border-dashed border-neutral-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30">
              HOPSCOT PASS
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              #{ticket.ticketNumber}
            </span>
          </div>

          {/* Status Badge */}
          {isUsed ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-bold border border-neutral-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
              <span>CHECKED IN</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lime-400/10 text-lime-400 text-xs font-black border border-lime-400/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-lime-400" />
              <span>VALID TICKET</span>
            </div>
          )}
        </div>

        <h3 className="mt-3.5 text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
          {ticket.eventTitle}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-neutral-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>{new Date(ticket.eventDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-lime-400" />
            <span className="max-w-[220px] truncate">{ticket.venue}</span>
          </div>
        </div>
      </div>

      {/* Ticket Body: Pass Tier & Attendee Info */}
      <div className="px-6 sm:px-7 py-5 grid grid-cols-2 gap-4 bg-neutral-950/40 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Pass Category</span>
          <p className="mt-0.5 font-bold text-white text-sm">{ticket.ticketTypeName}</p>
          <p className="text-[11px] text-lime-400 font-semibold">{ticket.price === 0 ? 'FREE ADMISSION' : `₹${ticket.price} PAID`}</p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Attendee</span>
          <p className="mt-0.5 font-bold text-white text-sm truncate">{ticket.userName}</p>
          <p className="text-[11px] text-neutral-400 truncate">{ticket.userCollege || 'Student'}</p>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="p-6 sm:p-7 flex flex-col items-center justify-center bg-neutral-900/60 border-t border-neutral-800">
        <div className="relative p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt={`QR Code for Ticket ${ticket.ticketNumber}`} 
              className="w-48 h-48 rounded-lg"
            />
          ) : (
            <div className="w-48 h-48 bg-neutral-200 animate-pulse rounded-lg flex items-center justify-center text-neutral-500 text-xs">
              Generating secure QR...
            </div>
          )}

          {isUsed && (
            <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center text-center p-3">
              <CheckCircle2 className="w-10 h-10 text-lime-400 mb-1" />
              <span className="text-white font-black text-sm tracking-wide">VERIFIED & CHECKED IN</span>
              <span className="text-neutral-400 text-[10px] mt-1 font-mono">
                {ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleTimeString() : 'At Gate'}
              </span>
            </div>
          )}
        </div>

        <p className="mt-3 text-[11px] text-neutral-400 font-mono tracking-wider">
          Present at college gate for automated barcode entry
        </p>

        {/* Action Buttons */}
        <div className="mt-5 w-full flex items-center justify-center gap-3">
          <button
            onClick={handleCopyCode}
            className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-neutral-700"
          >
            <span>{copied ? 'Copied #' : 'Copy Code'}</span>
          </button>

          {onOpenScannerWithTicket && (
            <button
              onClick={() => onOpenScannerWithTicket(ticket)}
              className="flex-1 py-2 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-purple-500/40"
              title="Test this ticket in the organizer scanner"
            >
              <QrCode className="w-3.5 h-3.5 text-purple-300" />
              <span>Simulate Scan</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
