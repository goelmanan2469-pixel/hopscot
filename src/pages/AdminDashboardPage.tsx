import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Event, User, Report, College } from '../types/index.js';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Ban, 
  Check, 
  TrendingUp,
  RefreshCw 
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'users' | 'reports'>('events');
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const res = await api.getAdminDashboard();
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveEvent = async (id: string) => {
    try {
      await api.approveEvent(id);
      setFeedback('Event approved and published on platform');
      fetchAdminData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleRejectEvent = async (id: string) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    try {
      await api.rejectEvent(id, reason);
      setFeedback('Event rejected');
      fetchAdminData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSuspendUser = async (id: string) => {
    try {
      const res = await api.suspendUser(id);
      setFeedback(res.message);
      fetchAdminData();
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading || !data) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center text-neutral-400 text-xs">
        Loading admin console...
      </div>
    );
  }

  const { metrics, users, events, reports } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Super Admin Console</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
          Platform Governance & Moderation
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Review submitted college fests, enforce safety policies, and audit payment volume across Delhi NCR.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-200 text-xs font-semibold flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-neutral-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">Total Users</span>
          <div className="mt-1 text-2xl font-black text-white">{metrics.totalUsers}</div>
          <span className="text-[11px] text-purple-400 font-semibold">{metrics.students} Students • {metrics.organizers} Organizers</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">Total Fests</span>
          <div className="mt-1 text-2xl font-black text-white">{metrics.totalEvents}</div>
          <span className="text-[11px] text-lime-400 font-semibold">{metrics.pendingEvents} Pending Review</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">Total Registrations</span>
          <div className="mt-1 text-2xl font-black text-lime-400">{metrics.totalRegistrations}</div>
          <span className="text-[11px] text-neutral-400 font-semibold">Passes Across NCR</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">Verified Payment Vol.</span>
          <div className="mt-1 text-2xl font-black text-white font-mono">₹{metrics.totalRevenueINR}</div>
          <span className="text-[11px] text-neutral-400 font-semibold">Test Mode Razorpay</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 transition-colors ${
            activeTab === 'events' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Event Moderation ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition-colors ${
            activeTab === 'users' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 transition-colors ${
            activeTab === 'reports' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Reported Safety Items ({reports.length})
        </button>
      </div>

      {/* Event Moderation List */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.map((evt: Event) => (
            <div
              key={evt.id}
              className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-purple-400">{evt.category}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    evt.status === 'approved' ? 'bg-lime-400/10 text-lime-400' : 'bg-rose-400/10 text-rose-400'
                  }`}>
                    {evt.status}
                  </span>
                </div>
                <h3 className="font-extrabold text-white text-base mt-1">{evt.title}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{evt.collegeName} • {evt.venue}</p>
              </div>

              <div className="flex items-center gap-2">
                {evt.status !== 'approved' && (
                  <button
                    onClick={() => handleApproveEvent(evt.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-neutral-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                )}
                {evt.status !== 'rejected' && (
                  <button
                    onClick={() => handleRejectEvent(evt.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-rose-300 font-bold text-xs flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Accounts Moderation */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {users.map((usr: User) => (
            <div
              key={usr.id}
              className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <img
                  src={usr.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={usr.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">{usr.name}</h4>
                  <p className="text-neutral-400 text-[11px]">{usr.email} • {usr.collegeName || usr.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase font-bold text-neutral-400">{usr.role}</span>
                <button
                  onClick={() => handleSuspendUser(usr.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    usr.isSuspended
                      ? 'bg-lime-400/20 text-lime-400 border border-lime-400/40'
                      : 'bg-rose-950/40 text-rose-400 border border-rose-800/40 hover:bg-rose-900/40'
                  }`}
                >
                  {usr.isSuspended ? 'Reactivate' : 'Suspend'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reports Review */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <p className="text-center py-8 text-neutral-500 text-xs">No active reports filed.</p>
          ) : (
            reports.map((rep: Report) => (
              <div
                key={rep.id}
                className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white">Report on {rep.targetType}: {rep.targetName}</span>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-500">
                    By {rep.reporterName}
                  </span>
                </div>
                <p className="text-neutral-300 bg-neutral-950 p-3 rounded-xl border border-neutral-800/80">
                  "{rep.reason}"
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <button className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs">
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
