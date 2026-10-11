import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { api } from './services/api.js';
import { Event, College, Ticket } from './types/index.js';
import { Navbar } from './components/Navbar.js';
import { LandingPage } from './pages/LandingPage.js';
import { ExploreEventsPage } from './pages/ExploreEventsPage.js';
import { EventDetailsPage } from './pages/EventDetailsPage.js';
import { TravelPlannerPage } from './pages/TravelPlannerPage.js';
import { TravelMatchesPage } from './pages/TravelMatchesPage.js';
import { TravelGroupsPage } from './pages/TravelGroupsPage.js';
import { GroupDetailsPage } from './pages/GroupDetailsPage.js';
import { MyTicketsPage } from './pages/MyTicketsPage.js';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { Sparkles, Heart } from 'lucide-react';

function AppContent() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [ticketToScan, setTicketToScan] = useState<Ticket | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  const loadInitialData = async () => {
    try {
      const [eventsRes, collegesRes] = await Promise.all([
        api.getEvents(),
        api.getColleges(),
      ]);
      setEvents(eventsRes.events);
      setColleges(collegesRes.colleges);
    } catch (err) {
      console.error('Failed to load initial datasets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectTab = (tab: string, extraId?: string) => {
    setCurrentTab(tab);
    if (extraId) {
      if (tab === 'event-details') setSelectedEventId(extraId);
      if (tab === 'group-details') setSelectedGroupId(extraId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
    setCurrentTab('event-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlanTravelFromEvent = (evt: Event) => {
    setSelectedEventId(evt.id);
    setCurrentTab('travel-planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenScannerWithTicket = (ticket: Ticket) => {
    setTicketToScan(ticket);
    setCurrentTab('organizer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Google Maps Quota Warning Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-[60] shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar currentTab={currentTab} onSelectTab={handleSelectTab} />

      {/* Main View Area */}
      <main className="flex-1">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-lime-400 p-0.5 animate-spin mb-4">
              <div className="w-full h-full bg-neutral-950 rounded-[14px]" />
            </div>
            <p className="text-sm font-bold text-white tracking-wide">Connecting to HOPSCOT Campus Radar...</p>
            <p className="text-xs text-neutral-500 mt-1">Delhi NCR Colleges & Event Mesh</p>
          </div>
        ) : (
          <>
            {currentTab === 'landing' && (
              <LandingPage
                events={events}
                colleges={colleges}
                onExploreEvents={() => handleSelectTab('explore')}
                onOpenTravelPlanner={() => handleSelectTab('travel-planner')}
                onOpenTravelMatches={() => handleSelectTab('travel-matches')}
                onSelectEvent={handleSelectEvent}
                onOpenOrganizer={() => handleSelectTab('organizer')}
              />
            )}

            {currentTab === 'explore' && (
              <ExploreEventsPage
                events={events}
                colleges={colleges}
                onSelectEvent={handleSelectEvent}
                onQuickRegister={(evt) => handleSelectEvent(evt.id)}
              />
            )}

            {currentTab === 'event-details' && selectedEvent && (
              <EventDetailsPage
                event={selectedEvent}
                onBack={() => handleSelectTab('explore')}
                onPlanTravel={handlePlanTravelFromEvent}
                onTicketSuccess={() => handleSelectTab('my-tickets')}
              />
            )}

            {currentTab === 'travel-planner' && (
              <TravelPlannerPage
                events={events}
                selectedEventId={selectedEventId || undefined}
                onNavigateToMatches={(eventId) => {
                  setSelectedEventId(eventId || null);
                  handleSelectTab('travel-matches');
                }}
              />
            )}

            {currentTab === 'travel-matches' && (
              <TravelMatchesPage
                events={events}
                eventId={selectedEventId || undefined}
                onNavigateToGroup={(groupId) => {
                  setSelectedGroupId(groupId);
                  handleSelectTab('group-details');
                }}
                onPlanTrip={() => handleSelectTab('travel-planner')}
              />
            )}

            {currentTab === 'travel-groups' && (
              <TravelGroupsPage
                events={events}
                onSelectGroup={(groupId) => {
                  setSelectedGroupId(groupId);
                  handleSelectTab('group-details');
                }}
                onCreateGroup={() => handleSelectTab('travel-matches')}
              />
            )}

            {currentTab === 'group-details' && selectedGroupId && (
              <GroupDetailsPage
                groupId={selectedGroupId}
                onBack={() => handleSelectTab('travel-groups')}
              />
            )}

            {currentTab === 'my-tickets' && (
              <MyTicketsPage
                onExploreEvents={() => handleSelectTab('explore')}
                onOpenScannerWithTicket={handleOpenScannerWithTicket}
              />
            )}

            {currentTab === 'organizer' && (
              <OrganizerDashboardPage
                colleges={colleges}
                initialTicketToScan={ticketToScan}
                onSelectEvent={handleSelectEvent}
              />
            )}

            {currentTab === 'admin' && <AdminDashboardPage />}

            {currentTab === 'profile' && <ProfilePage colleges={colleges} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-lime-400 p-0.5">
                <div className="w-full h-full bg-neutral-950 rounded-[6px] flex items-center justify-center font-bold text-xs text-lime-400">
                  H
                </div>
              </div>
              <span className="font-extrabold text-white text-sm tracking-tight">HOPSCOT</span>
              <span className="text-neutral-500 text-xs">— Hop Colleges. Catch Vibes.</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-neutral-400 font-medium">
              <span>Delhi NCR Edition</span>
              <span>•</span>
              <button onClick={() => handleSelectTab('explore')} className="hover:text-white">Events</button>
              <span>•</span>
              <button onClick={() => handleSelectTab('travel-matches')} className="hover:text-white">Travel Matches</button>
              <span>•</span>
              <button onClick={() => handleSelectTab('organizer')} className="hover:text-white">Organizer QR</button>
            </div>
          </div>
          <div className="mt-6 text-center sm:text-left text-[11px] text-neutral-600">
            © 2026 HOPSCOT. Built for college students, societies, and fest goers across India.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
