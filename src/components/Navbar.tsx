import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { 
  Compass, 
  MapPin, 
  Users, 
  Ticket as TicketIcon, 
  Bell, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  QrCode,
  Menu, 
  X, 
  ChevronDown,
  LogOut,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string, extraId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, notifications, unreadNotificationsCount, switchDemoAccount, refreshNotifications } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const navItems = [
    { id: 'explore', label: 'Explore Events', icon: Compass },
    { id: 'travel-planner', label: 'Travel Planner', icon: MapPin },
    { id: 'travel-matches', label: 'Travel Matches', icon: Sparkles, badge: 'Smart' },
    { id: 'travel-groups', label: 'Travel Squads', icon: Users },
    { id: 'my-tickets', label: 'My Tickets', icon: TicketIcon },
  ];

  if (user?.role === 'organizer' || user?.role === 'admin') {
    navItems.push({ id: 'organizer', label: 'Organizer Hub', icon: QrCode });
  }

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Console', icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-50 bg-neutral-950/85 backdrop-blur-xl border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div 
            onClick={() => onSelectTab('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-purple-500 to-lime-400 p-0.5 shadow-lg shadow-purple-900/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-lime-400 font-mono tracking-tighter">
                  H
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-2xl tracking-tight text-white group-hover:text-purple-300 transition-colors">
                  HOPSCOT
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-lime-400/10 text-lime-400 border border-lime-400/30">
                  NCR
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-medium tracking-tight -mt-0.5 hidden sm:block">
                Hop Colleges. Catch Vibes.
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30 shadow-inner'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-900/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Demo Switcher + Notifications + Profile */}
          <div className="flex items-center gap-2.5">
            
            {/* Demo Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 border border-neutral-700/80 text-neutral-200 hover:border-purple-500/50 hover:bg-neutral-800 transition-all shadow-sm"
                title="Switch demo role to test different flows"
              >
                <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                <span className="hidden md:inline font-mono text-[11px] text-neutral-400">Demo Role:</span>
                <span className="font-semibold text-purple-300 capitalize">{user?.role || 'Guest'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-0.5" />
              </button>

              {demoDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl p-2 z-50 text-xs"
                  onClick={() => setDemoDropdownOpen(false)}
                >
                  <div className="px-2.5 py-2 border-b border-neutral-800 text-neutral-400 font-medium">
                    ⚡ Quick Switch Demo Account
                  </div>
                  
                  <button
                    onClick={() => switchDemoAccount('student', 'usr-student-1')}
                    className={`w-full text-left p-2.5 rounded-lg flex items-start gap-2.5 transition-colors ${
                      user?.id === 'usr-student-1' ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30' : 'hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-purple-700 flex items-center justify-center font-bold text-xs text-white">
                      AS
                    </div>
                    <div>
                      <div className="font-semibold text-white">Aman Sharma (Student)</div>
                      <div className="text-[11px] text-neutral-400">DTU • Rohini • Has registered tickets</div>
                    </div>
                  </button>

                  <button
                    onClick={() => switchDemoAccount('student', 'usr-student-2')}
                    className={`w-full text-left p-2.5 rounded-lg flex items-start gap-2.5 transition-colors mt-1 ${
                      user?.id === 'usr-student-2' ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30' : 'hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-lime-700 flex items-center justify-center font-bold text-xs text-white">
                      RS
                    </div>
                    <div>
                      <div className="font-semibold text-white">Riya Sen (Student Companion)</div>
                      <div className="text-[11px] text-neutral-400">MAIT • Rohini Sec-13 • Matching match!</div>
                    </div>
                  </button>

                  <button
                    onClick={() => switchDemoAccount('organizer', 'usr-organizer-1')}
                    className={`w-full text-left p-2.5 rounded-lg flex items-start gap-2.5 transition-colors mt-1 ${
                      user?.role === 'organizer' ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30' : 'hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center font-bold text-xs text-white">
                      DTU
                    </div>
                    <div>
                      <div className="font-semibold text-white">DTU Tech Council (Organizer)</div>
                      <div className="text-[11px] text-neutral-400">Event Admin • QR Gate Scanner</div>
                    </div>
                  </button>

                  <button
                    onClick={() => switchDemoAccount('admin', 'usr-admin-1')}
                    className={`w-full text-left p-2.5 rounded-lg flex items-start gap-2.5 transition-colors mt-1 ${
                      user?.role === 'admin' ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30' : 'hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-rose-700 flex items-center justify-center font-bold text-xs text-white">
                      ADM
                    </div>
                    <div>
                      <div className="font-semibold text-white">HOPSCOT Super Admin</div>
                      <div className="text-[11px] text-neutral-400">Platform overview • Approvals • Reports</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-lime-400 text-neutral-950 font-black text-[10px] flex items-center justify-center shadow-lg shadow-lime-400/40">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-3 z-50 text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <span className="font-bold text-white text-sm">Notifications</span>
                    <span className="text-[10px] text-neutral-400">{unreadNotificationsCount} unread</span>
                  </div>

                  <div className="mt-2 space-y-1.5 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-neutral-500 text-center py-4">No notifications yet</p>
                    ) : (
                      notifications.slice(0, 6).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            setNotifDropdownOpen(false);
                            if (notif.link?.includes('tickets')) onSelectTab('my-tickets');
                            else if (notif.link?.includes('matches')) onSelectTab('travel-matches');
                            else if (notif.link?.includes('groups')) onSelectTab('travel-groups');
                          }}
                          className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                            notif.isRead ? 'bg-neutral-950/60 text-neutral-400' : 'bg-purple-950/30 text-purple-200 border border-purple-800/40'
                          }`}
                        >
                          <div className="font-semibold text-white flex items-center justify-between">
                            <span>{notif.title}</span>
                            <span className="text-[9px] text-neutral-500">Just now</span>
                          </div>
                          <p className="mt-0.5 text-[11px] leading-tight text-neutral-300">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <button
              onClick={() => onSelectTab('profile')}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-all"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-purple-500/50"
              />
              <span className="hidden sm:inline font-semibold text-xs text-neutral-200 max-w-[90px] truncate">
                {user?.name?.split(' ')[0]}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-800/80 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300'
                      : 'text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-purple-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-lime-400/20 text-lime-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
