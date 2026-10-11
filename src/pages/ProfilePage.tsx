import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { College } from '../types/index.js';
import { 
  User as UserIcon, 
  MapPin, 
  Compass, 
  Music, 
  ShieldCheck, 
  Check, 
  Loader2, 
  Save 
} from 'lucide-react';

interface ProfilePageProps {
  colleges: College[];
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ colleges }) => {
  const { user, refreshProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [course, setCourse] = useState(user?.course || '');
  const [year, setYear] = useState(user?.year || '3rd Year');
  const [collegeId, setCollegeId] = useState(user?.collegeId || 'col-dtu');
  const [phone, setPhone] = useState(user?.phone || '');
  const [preferredMode, setPreferredMode] = useState(user?.travelPreferences?.preferredMode || 'Metro');
  const [musicPref, setMusicPref] = useState(user?.travelPreferences?.musicPreference || 'Indie & Hip-hop');
  const [silentTravel, setSilentTravel] = useState(user?.travelPreferences?.silentTravel || false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(false);

    try {
      await api.updateMe({
        name,
        bio,
        course,
        year,
        collegeId,
        phone,
        travelPreferences: {
          preferredMode,
          musicPreference: musicPref,
          silentTravel,
          genderPreference: 'any',
        },
      });
      await refreshProfile();
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-lime-400 uppercase tracking-widest">
          <UserIcon className="w-3.5 h-3.5" />
          <span>Student Passport & Preferences</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
          Your Profile & Travel Habits
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Customize your student identity and travel preferences for better fest companion matches.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-lime-950/60 border border-lime-800 text-lime-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info Card */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
          <h3 className="text-base font-black text-white">Basic Information</h3>

          <div className="flex items-center gap-4 pb-3 border-b border-neutral-800">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-500/50"
            />
            <div>
              <span className="text-xs text-neutral-400 font-mono">Role: {user?.role.toUpperCase()}</span>
              <p className="text-white font-bold text-sm">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-neutral-300 font-bold block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-semibold focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="text-neutral-300 font-bold block mb-1">College</label>
              <select
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-semibold focus:outline-none focus:border-purple-500"
              >
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-neutral-300 font-bold block mb-1">Degree / Course</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-purple-500"
                placeholder="e.g. B.Tech Computer Engineering"
              />
            </div>

            <div>
              <label className="text-neutral-300 font-bold block mb-1">Academic Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year">4th Year (Senior)</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-neutral-300 font-bold block mb-1 text-xs">Bio / About Me</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-purple-500"
              placeholder="Tell others what fests, hackathons, or music genres you love..."
            />
          </div>
        </div>

        {/* Travel Preferences Card */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-lime-400" />
            <h3 className="text-base font-black text-white">Travel & Commute Preferences</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-neutral-300 font-bold block mb-1">Preferred Transit Mode</label>
              <select
                value={preferredMode}
                onChange={(e) => setPreferredMode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-semibold focus:outline-none focus:border-purple-500"
              >
                <option value="Metro">Delhi Metro (Reliable & fast)</option>
                <option value="Cab">Cab / Uber Pool (Comfort)</option>
                <option value="Bus">DTC Electric Bus (Budget)</option>
                <option value="Bike">Bike / Two-Wheeler (Quick)</option>
                <option value="Car">Personal Car (Self-drive)</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-300 font-bold block mb-1">Music / Vibe Preference</label>
              <input
                type="text"
                value={musicPref}
                onChange={(e) => setMusicPref(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-purple-500"
                placeholder="e.g. Indie, Hip-hop, Bollywood, Lo-fi"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={silentTravel}
                onChange={(e) => setSilentTravel(e.target.checked)}
                className="w-4 h-4 rounded bg-neutral-950 border-neutral-800 text-purple-600 focus:ring-0"
              />
              <span>Quiet Commute: I prefer headphones on and quiet travel.</span>
            </label>
          </div>
        </div>

        {/* Privacy & Safe Travel Notice */}
        <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex items-start gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-white block">Student Privacy by Design</strong>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              HOPSCOT never reveals your exact residential address or personal phone number publicly. Only general pickup hubs and college affiliations are visible to potential commute matches.
            </p>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-lime-500 hover:from-purple-500 hover:to-lime-400 text-neutral-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Settings</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
