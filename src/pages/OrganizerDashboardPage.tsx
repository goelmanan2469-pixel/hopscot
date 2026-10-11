import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Event, College, Ticket } from '../types/index.js';
import { 
  QrCode, 
  Plus, 
  Calendar, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  X, 
  Sparkles, 
  Camera,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';

interface OrganizerDashboardPageProps {
  colleges: College[];
  initialTicketToScan?: Ticket | null;
  onSelectEvent: (eventId: string) => void;
}

export const OrganizerDashboardPage: React.FC<OrganizerDashboardPageProps> = ({
  colleges,
  initialTicketToScan,
  onSelectEvent,
}) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Scanner state
  const [scannerInput, setScannerInput] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // Create Event Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<any>('Hackathons');
  const [collegeId, setCollegeId] = useState(colleges[0]?.id || 'col-dtu');
  const [venue, setVenue] = useState('Campus Main Auditorium');
  const [startDate, setStartDate] = useState('2026-10-28T09:00');
  const [priceType, setPriceType] = useState<'free' | 'paid'>('free');
  const [ticketPrice, setTicketPrice] = useState(149);
  const [ticketQuantity, setTicketQuantity] = useState(1000);
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80');

  const fetchDashboard = async () => {
    try {
      const data = await api.getOrganizerDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (initialTicketToScan) {
      setScannerInput(initialTicketToScan.ticketNumber);
      handleVerify(initialTicketToScan.ticketNumber);
    }
  }, [initialTicketToScan]);

  const handleVerify = async (inputCode?: string) => {
    const code = inputCode || scannerInput;
    if (!code.trim()) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      const res = await api.verifyQrTicket({
        ticketNumber: code.trim(),
        qrPayload: code.trim(),
      });
      setScanResult(res);
      fetchDashboard();
    } catch (err: any) {
      // In case of 409 already used or 404 invalid
      setScanResult({
        valid: false,
        status: err.status || 'invalid',
        error: err.message || 'Ticket verification failed',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createEvent({
        title,
        tagline,
        description,
        category,
        collegeId,
        venue,
        startDate: new Date(startDate).toISOString(),
        bannerUrl,
        ticketTypes: [
          {
            id: `tkt-${Date.now()}`,
            eventId: '',
            name: priceType === 'free' ? 'Free General Admission' : 'Standard Fest Pass',
            description: 'Access to stage and sessions',
            price: priceType === 'free' ? 0 : ticketPrice,
            totalQuantity: ticketQuantity,
            soldQuantity: 0,
            perks: ['Entry Badge', 'Stage Access'],
          },
        ],
      });

      setCreateModalOpen(false);
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center text-neutral-400 text-xs">
        Loading organizer hub...
      </div>
    );
  }

  const { stats, events, recentRegistrations } = dashboardData;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-lime-400 uppercase tracking-widest">
            <QrCode className="w-3.5 h-3.5" />
            <span>Organizer Console</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
            Event Management & Entry Gate
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Logged in as <strong>{user?.name}</strong> • Verify attendee QR passes and track ticket sales.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-lime-500 hover:from-purple-500 hover:to-lime-400 text-neutral-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Host New Event</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">Total Events</span>
          <div className="mt-1 text-2xl font-black text-white">{stats.totalEvents}</div>
          <span className="text-[11px] text-purple-400 font-semibold">Active in Delhi NCR</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">Total Registrations</span>
          <div className="mt-1 text-2xl font-black text-white">{stats.totalAttendees}</div>
          <span className="text-[11px] text-lime-400 font-semibold">Passes Issued</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">Gate Check-Ins</span>
          <div className="mt-1 text-2xl font-black text-lime-400">{stats.checkedInAttendees}</div>
          <span className="text-[11px] text-neutral-400 font-semibold">Verified at Entrance</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">Verified Revenue</span>
          <div className="mt-1 text-2xl font-black text-white font-mono">₹{stats.totalRevenueINR}</div>
          <span className="text-[11px] text-neutral-400 font-semibold">Razorpay Verified</span>
        </div>
      </div>

      {/* ORGANIZER QR SCANNER STATION */}
      <section className="p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-purple-500/40 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-lime-400" />
              <h2 className="text-xl font-black text-white">Entry Gate QR Scanner Station</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Scan student pass barcode or enter Ticket Number to authenticate entry. Prevents duplicate entry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCameraActive(!cameraActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                cameraActive
                  ? 'bg-lime-400/20 text-lime-400 border-lime-400/40'
                  : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{cameraActive ? 'Camera Active' : 'Toggle Camera Feed'}</span>
            </button>
          </div>
        </div>

        {/* Camera simulation viewfinder if camera active */}
        {cameraActive && (
          <div className="relative h-56 rounded-2xl bg-black border border-neutral-800 overflow-hidden flex flex-col items-center justify-center">
            {/* Viewfinder crosshairs */}
            <div className="w-44 h-44 border-2 border-lime-400/80 rounded-2xl relative flex items-center justify-center animate-pulse">
              <span className="text-[10px] font-mono text-lime-400 bg-neutral-950/80 px-2 py-0.5 rounded">
                AIM AT TICKET QR
              </span>
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-lime-400" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-lime-400" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-lime-400" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-lime-400" />
            </div>
            <p className="text-[10px] text-neutral-400 mt-2 font-mono">
              Live Optical Barcode Sensor Ready
            </p>
          </div>
        )}

        {/* Scanner Input & Quick Test Buttons */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={scannerInput}
              onChange={(e) => setScannerInput(e.target.value)}
              placeholder="Paste QR payload or Ticket # (e.g. HOP-DTU-7489)..."
              className="flex-1 px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-purple-500 uppercase"
            />
            <button
              onClick={() => handleVerify()}
              disabled={isScanning}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isScanning ? 'Verifying...' : 'Authenticate'}</span>
            </button>
          </div>

          {/* Quick Demo Test Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-neutral-400 font-mono">Quick Test Passes:</span>
            <button
              onClick={() => {
                setScannerInput('HOP-DTU-7489');
                handleVerify('HOP-DTU-7489');
              }}
              className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-purple-300 border border-neutral-800 text-[11px] font-mono"
            >
              #HOP-DTU-7489 (Aman Sharma)
            </button>
            <button
              onClick={() => {
                setScannerInput('HOP-NSUT-2190');
                handleVerify('HOP-NSUT-2190');
              }}
              className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-purple-300 border border-neutral-800 text-[11px] font-mono"
            >
              #HOP-NSUT-2190 (Resonance Pass)
            </button>
            <button
              onClick={() => {
                setScannerInput('HOP-FAKE-9999');
                handleVerify('HOP-FAKE-9999');
              }}
              className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-rose-300 border border-neutral-800 text-[11px] font-mono"
            >
              #HOP-FAKE-9999 (Invalid Test)
            </button>
          </div>
        </div>

        {/* Scan Result Feedback Box */}
        {scanResult && (
          <div
            className={`p-5 rounded-2xl border transition-all ${
              scanResult.valid && scanResult.status === 'checked_in'
                ? 'bg-lime-950/40 border-lime-500/60 text-lime-200'
                : scanResult.status === 'already_used'
                ? 'bg-amber-950/50 border-amber-500/70 text-amber-200'
                : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {scanResult.valid && scanResult.status === 'checked_in' ? (
                <CheckCircle2 className="w-8 h-8 text-lime-400 shrink-0 mt-0.5" />
              ) : scanResult.status === 'already_used' ? (
                <ShieldAlert className="w-8 h-8 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0 mt-0.5" />
              )}

              <div className="flex-1 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black uppercase tracking-tight">
                    {scanResult.valid && scanResult.status === 'checked_in'
                      ? 'GATE PASS VALID — CHECK-IN APPROVED ✅'
                      : scanResult.status === 'already_used'
                      ? '⚠️ FRAUD ALERT: TICKET ALREADY CHECKED IN'
                      : '❌ INVALID TICKET BARCODE'}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>

                <p className="font-semibold text-xs opacity-90">
                  {scanResult.message || scanResult.error}
                </p>

                {scanResult.ticket && (
                  <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-neutral-400 block text-[9px] uppercase font-bold">Attendee</span>
                      <strong className="text-white">{scanResult.ticket.userName}</strong>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[9px] uppercase font-bold">College</span>
                      <strong className="text-white">{scanResult.ticket.userCollege || 'Student'}</strong>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[9px] uppercase font-bold">Ticket Tier</span>
                      <strong className="text-white">{scanResult.ticket.ticketTypeName}</strong>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[9px] uppercase font-bold">First Scanned</span>
                      <strong className="text-lime-300">
                        {scanResult.ticket.checkedInAt
                          ? new Date(scanResult.ticket.checkedInAt).toLocaleTimeString()
                          : 'Just Now'}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </section>

      {/* Managed Events List */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-white">Your Organized Campus Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((evt: Event) => (
            <div
              key={evt.id}
              onClick={() => onSelectEvent(evt.id)}
              className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-purple-500/40 cursor-pointer transition-all flex items-start justify-between gap-4"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">
                  {evt.category}
                </span>
                <h3 className="font-bold text-white text-base mt-0.5">{evt.title}</h3>
                <p className="text-xs text-neutral-400 mt-1">{evt.venue}</p>

                <div className="mt-3 flex items-center gap-4 text-xs font-medium text-neutral-300">
                  <span>🎟️ {evt.attendeeCount} Registered</span>
                  <span>📍 {new Date(evt.startDate).toLocaleDateString()}</span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-lime-400/10 text-lime-400 border border-lime-400/30">
                {evt.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CREATE EVENT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h3 className="text-lg font-black text-white">Create New College Fest</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-xl text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="text-neutral-300 font-bold block mb-1">Event Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Invictus '26 Hackathon"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-semibold focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. 36-Hour Hackathon & Tech Arena"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 font-bold block mb-1">Hosting College</label>
                  <select
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-semibold focus:outline-none focus:border-purple-500"
                  >
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.shortCode}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-neutral-300 font-bold block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="Hackathons">Hackathons</option>
                    <option value="Cultural fests">Cultural fests</option>
                    <option value="Technical">Technical</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Music">Music</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">Venue on Campus</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 font-bold block mb-1">Ticket Type</label>
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="free">Free Admission</option>
                    <option value="paid">Paid VIP Pass</option>
                  </select>
                </div>

                {priceType === 'paid' && (
                  <div>
                    <label className="text-neutral-300 font-bold block mb-1">Price in INR (₹)</label>
                    <input
                      type="number"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
