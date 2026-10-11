import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { TravelGroup, GroupMessage } from '../types/index.js';
import { 
  Users, 
  MapPin, 
  Clock, 
  Send, 
  Check, 
  X, 
  ShieldCheck, 
  ArrowLeft, 
  UserPlus, 
  LogOut, 
  MessageSquare,
  AlertCircle 
} from 'lucide-react';

interface GroupDetailsPageProps {
  groupId: string;
  onBack: () => void;
}

export const GroupDetailsPage: React.FC<GroupDetailsPageProps> = ({ groupId, onBack }) => {
  const { user } = useAuth();
  const [group, setGroup] = useState<TravelGroup | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchGroupData = async () => {
    try {
      const gRes = await api.getGroupById(groupId);
      setGroup(gRes.group);

      const mRes = await api.getGroupMessages(groupId);
      setMessages(mRes.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
    const interval = setInterval(fetchGroupData, 8000);
    return () => clearInterval(interval);
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    try {
      const res = await api.sendGroupMessage(groupId, newMessageText.trim());
      setMessages((prev) => [...prev, res.message]);
      setNewMessageText('');
    } catch (err: any) {
      setActionFeedback(err.message || 'Failed to send');
    }
  };

  const handleJoinRequest = async () => {
    try {
      await api.joinGroup(groupId, joinMessage || 'Hey! Would love to travel with you guys.');
      setActionFeedback('Join request submitted to group creator!');
      fetchGroupData();
    } catch (err: any) {
      setActionFeedback(err.message || 'Error joining');
    }
  };

  const handleRespondRequest = async (requestId: string, action: 'accepted' | 'rejected') => {
    try {
      await api.respondGroupRequest(groupId, requestId, action);
      fetchGroupData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await api.leaveGroup(groupId);
      fetchGroupData();
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading || !group) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-neutral-400 text-xs">
        Loading squad details...
      </div>
    );
  }

  const isCreator = group.creatorId === user?.id;
  const isMember = group.members.some((m) => m.userId === user?.id);
  const hasPendingRequest = group.joinRequests.some((r) => r.userId === user?.id && r.status === 'pending');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Squads</span>
      </button>

      {/* Header Info Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-mono font-bold text-purple-400 tracking-wider">
              {group.eventTitle}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {group.name}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              {group.description}
            </p>
          </div>

          <div className="flex sm:flex-col items-end gap-2 shrink-0">
            <span className="px-3 py-1 rounded-full bg-purple-950 text-purple-300 text-xs font-bold border border-purple-800">
              {group.members.length} / {group.maxMembers} Members
            </span>
            {isMember && (
              <span className="px-2.5 py-0.5 rounded-full bg-lime-400/20 text-lime-400 text-[10px] font-black border border-lime-400/30">
                YOU ARE A MEMBER
              </span>
            )}
          </div>
        </div>

        {/* Route Bar */}
        <div className="mt-6 pt-5 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <MapPin className="w-4 h-4 text-lime-400 shrink-0" />
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block font-bold">Rendezvous Area</span>
              <strong className="text-white truncate block">{group.originName}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 text-neutral-300">
            <Clock className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block font-bold">Departure Time</span>
              <strong className="text-white block">{group.departureTime} ({group.transportMode})</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block font-bold">Leader</span>
              <strong className="text-white block">{group.creatorName}</strong>
            </div>
          </div>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-200 text-xs font-semibold flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-neutral-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Grid: Chat & Members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Group Chat Stream */}
        <div className="lg:col-span-2 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col h-[520px] overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-xs sm:text-sm">Squad Chat & Coordination</h3>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">Members Only</span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 text-xs">
                No messages yet. Break the ice and coordinate meetup!
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.userId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-1 px-1">
                      <span className="font-bold text-neutral-300">{msg.userName}</span>
                      <span>({msg.userCollege})</span>
                      <span>•</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs ${
                        isMe
                          ? 'bg-purple-600 text-white rounded-br-none shadow-md'
                          : 'bg-neutral-950 text-neutral-200 border border-neutral-800 rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input or Non-Member Join Prompt */}
          <div className="p-3 bg-neutral-950 border-t border-neutral-800">
            {isMember ? (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type a message to the squad..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-neutral-400 mb-2">
                  You must be an accepted squad member to participate in chat.
                </p>
                {hasPendingRequest ? (
                  <span className="text-xs font-bold text-yellow-400">
                    ⏳ Join request submitted — waiting for creator approval
                  </span>
                ) : (
                  <button
                    onClick={handleJoinRequest}
                    className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-neutral-950 font-black text-xs transition-colors"
                  >
                    Request to Join Squad
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Squad Roster & Creator Requests Panel */}
        <div className="space-y-6">
          
          {/* Creator Requests Panel (if creator) */}
          {isCreator && group.joinRequests.length > 0 && (
            <div className="p-5 rounded-3xl bg-neutral-900 border border-purple-500/50 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-white text-xs uppercase tracking-wider text-purple-300">
                  Pending Join Requests ({group.joinRequests.filter((r) => r.status === 'pending').length})
                </h3>
              </div>

              <div className="space-y-2">
                {group.joinRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-white">{req.userName}</strong>
                      <span className="text-[10px] text-neutral-400">{req.userCollege}</span>
                    </div>

                    {req.message && (
                      <p className="text-[11px] text-neutral-400 italic">
                        "{req.message}"
                      </p>
                    )}

                    {req.status === 'pending' ? (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleRespondRequest(req.id, 'accepted')}
                          className="flex-1 py-1 px-2 rounded-lg bg-lime-400 hover:bg-lime-300 text-neutral-950 font-bold text-[11px] flex items-center justify-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRespondRequest(req.id, 'rejected')}
                          className="flex-1 py-1 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-[11px] flex items-center justify-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Decline</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-neutral-500 capitalize">
                        {req.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members Roster */}
          <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-neutral-400">
              Squad Members ({group.members.length})
            </h3>

            <div className="space-y-2.5">
              {group.members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold text-xs">
                      {member.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white leading-tight">{member.userName}</div>
                      <div className="text-[10px] text-neutral-400">{member.userCollege}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    member.role === 'creator'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {member.role === 'creator' ? 'CREATOR' : 'MEMBER'}
                  </span>
                </div>
              ))}
            </div>

            {isMember && !isCreator && (
              <div className="pt-2">
                <button
                  onClick={handleLeaveGroup}
                  className="w-full py-2 rounded-xl text-neutral-400 hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Leave Squad</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
