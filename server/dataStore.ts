import { User, College, Event, Ticket, Booking, TravelPlan, TravelGroup, GroupMessage, Notification, Report } from '../src/types/index.js';

// Haversine formula to calculate geographical distance between two lat/lng coordinates in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Helper to convert HH:MM to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length < 2) return 0;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

// Initial Colleges Data (Delhi NCR focus)
export const initialColleges: College[] = [
  {
    id: 'col-dtu',
    name: 'Delhi Technological University (DTU)',
    shortCode: 'DTU',
    location: 'Shahbad Daulatpur, Bawana Road, Rohini, Delhi',
    metroStation: 'Samaypur Badli (Yellow Line) / Rithala (Red Line)',
    lat: 28.7495,
    lng: 77.1180,
    eventCount: 4,
  },
  {
    id: 'col-nsut',
    name: 'Netaji Subhas University of Technology (NSUT)',
    shortCode: 'NSUT',
    location: 'Sector 3, Dwarka, New Delhi',
    metroStation: 'Dwarka Mor (Blue Line)',
    lat: 28.6091,
    lng: 77.0370,
    eventCount: 3,
  },
  {
    id: 'col-mait',
    name: 'Maharaja Agrasen Institute of Technology (MAIT)',
    shortCode: 'MAIT',
    location: 'PSP Area, Plot No. 1, Sector 22, Rohini, Delhi',
    metroStation: 'Rithala (Red Line) / Rohini Sector 18',
    lat: 28.7196,
    lng: 77.0664,
    eventCount: 3,
  },
  {
    id: 'col-iiitd',
    name: 'Indraprastha Institute of Information Technology (IIIT Delhi)',
    shortCode: 'IIITD',
    location: 'Okhla Industrial Estate, Phase III, Near Govind Puri, New Delhi',
    metroStation: 'Govind Puri (Violet Line) / Harkesh Nagar Okhla',
    lat: 28.5459,
    lng: 77.2732,
    eventCount: 2,
  },
  {
    id: 'col-igdtuw',
    name: 'Indira Gandhi Delhi Technical University for Women (IGDTUW)',
    shortCode: 'IGDTUW',
    location: 'James Church, New Church Rd, Kashmere Gate, Delhi',
    metroStation: 'Kashmere Gate Metro Interchange',
    lat: 28.6655,
    lng: 77.2324,
    eventCount: 2,
  },
  {
    id: 'col-usict',
    name: 'University School of Information, Comm. & Tech (USICT, GGSIPU)',
    shortCode: 'USICT',
    location: 'Sector 16C, Dwarka, New Delhi',
    metroStation: 'Dwarka Sector 14 (Blue Line)',
    lat: 28.5950,
    lng: 77.0195,
    eventCount: 2,
  },
  {
    id: 'col-adgips',
    name: 'Dr. Akhilesh Das Gupta Institute of Professional Studies (ADGIPS)',
    shortCode: 'ADGIPS',
    location: 'FC-26, Panduk Shila Marg, Zero Pusta, Shastri Park, Delhi',
    metroStation: 'Shastri Park (Red Line)',
    lat: 28.6738,
    lng: 77.2644,
    eventCount: 2,
  },
  {
    id: 'col-iitd',
    name: 'Indian Institute of Technology Delhi (IIT Delhi)',
    shortCode: 'IITD',
    location: 'Hauz Khas, New Delhi',
    metroStation: 'IIT Delhi (Magenta Line)',
    lat: 28.5450,
    lng: 77.1926,
    eventCount: 2,
  },
];

// Initial Users (Demo accounts for student, travel companion, organizer, and admin)
export const initialUsers: User[] = [
  {
    id: 'usr-student-1',
    name: 'Aman Sharma',
    email: 'student@hopscot.app',
    role: 'student',
    collegeId: 'col-dtu',
    collegeName: 'Delhi Technological University (DTU)',
    course: 'B.Tech Computer Engineering',
    year: '3rd Year',
    bio: 'Web3 builder, hackathon addict, and EDM fan. Always looking to team up and carpool from Rohini!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    interests: ['Hackathons', 'Coding', 'EDM', 'Gaming', 'AI'],
    travelPreferences: {
      preferredMode: 'Metro',
      musicPreference: 'Indie & Hip-hop',
      silentTravel: false,
      genderPreference: 'any',
    },
    phone: '+91 98765 43210',
    isSuspended: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-student-2',
    name: 'Riya Sen',
    email: 'riya@hopscot.app',
    role: 'student',
    collegeId: 'col-mait',
    collegeName: 'Maharaja Agrasen Institute of Technology (MAIT)',
    course: 'B.Tech IT',
    year: '2nd Year',
    bio: 'UI/UX enthusiast, design lead at IEEE, loves street plays and intercollege cultural fests. Starting from Rohini Sec-13!',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    interests: ['Cultural fests', 'Design', 'Music', 'Hackathons'],
    travelPreferences: {
      preferredMode: 'Metro',
      musicPreference: 'Bollywood & Lo-fi',
      silentTravel: false,
      genderPreference: 'any',
    },
    phone: '+91 98111 22334',
    isSuspended: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-student-3',
    name: 'Kabir Mehta',
    email: 'kabir@hopscot.app',
    role: 'student',
    collegeId: 'col-nsut',
    collegeName: 'Netaji Subhas University of Technology (NSUT)',
    course: 'B.Tech ECE',
    year: '3rd Year',
    bio: 'Guitarist at Moksha, tech tinkerer. Commuting via Yellow/Magenta Line from Pitampura.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    interests: ['Music', 'Technical', 'Sports'],
    travelPreferences: {
      preferredMode: 'Cab',
      silentTravel: false,
      genderPreference: 'any',
    },
    phone: '+91 98222 33445',
    isSuspended: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-organizer-1',
    name: 'DTU Student Council & Tech Team',
    email: 'organizer@hopscot.app',
    role: 'organizer',
    collegeId: 'col-dtu',
    collegeName: 'Delhi Technological University (DTU)',
    bio: 'Official student body of Delhi Technological University hosting Invictus & Yuvaan.',
    avatar: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=300&q=80',
    phone: '+91 98999 11223',
    isSuspended: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-admin-1',
    name: 'HOPSCOT Super Admin',
    email: 'admin@hopscot.app',
    role: 'admin',
    bio: 'HOPSCOT Platform Administration & Verification Console.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    isSuspended: false,
    createdAt: new Date().toISOString(),
  },
];

// Initial Events with realistic Delhi NCR venues and tickets
export const initialEvents: Event[] = [
  {
    id: 'evt-invictus-2026',
    title: 'Invictus 2026 — Annual Tech & Innovation Fest',
    tagline: 'North India’s Biggest Collegiate Hack & Tech Extravaganza',
    description: 'Invictus is DTU’s flagship technical festival bringing together 15,000+ engineers, creators, and innovators. Features a 36-hour flagship hackathon, autonomous robotics wars, drone Grand Prix, web3 arena, and keynote talks from global startup founders. Get your passes, connect with hackers, and ride together!',
    category: 'Hackathons',
    collegeId: 'col-dtu',
    collegeName: 'Delhi Technological University (DTU)',
    venue: 'BR Ambedkar Auditorium & OAT, DTU Campus, Rohini, Delhi',
    lat: 28.7495,
    lng: 77.1180,
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    startDate: '2026-10-18T09:00:00.000Z',
    endDate: '2026-10-20T21:00:00.000Z',
    registrationDeadline: '2026-10-17T23:59:59.000Z',
    organizerId: 'usr-organizer-1',
    organizerName: 'DTU Student Council & Tech Team',
    organizerContact: 'techfest@dtu.ac.in | +91 98999 11223',
    status: 'approved',
    isFeatured: true,
    attendeeCount: 1420,
    tags: ['Hackathon', 'Robotics', 'Web3', 'AI', 'DTU'],
    ticketTypes: [
      {
        id: 'tkt-inv-free',
        eventId: 'evt-invictus-2026',
        name: 'General Hackathon & Expo Pass',
        description: 'Free entry to all 3 days of Invictus, tech exhibits, developer pavilions, and networking lounges.',
        price: 0,
        totalQuantity: 2500,
        soldQuantity: 1240,
        perks: ['Expo Entry', 'Hackathon Participation', 'Digital Certificate', 'Campus Wi-Fi Access'],
      },
      {
        id: 'tkt-inv-vip',
        eventId: 'evt-invictus-2026',
        name: 'VIP Hacker & Pro Pass',
        description: 'Includes priority access to AI workshops, official swag kit (hoodie + badges), and reserved seating at keynote speeches.',
        price: 199,
        totalQuantity: 500,
        soldQuantity: 180,
        perks: ['All Free Perks', 'Official Swag Kit', 'Front Row Keynotes', 'Mentor Lounge Access'],
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-resonance-2026',
    title: 'Resonance ’26 — Grand Cultural Odyssey',
    tagline: '3 Days of Music, Energy, and Electrifying Star Nights',
    description: 'The monumental annual cultural festival of Netaji Subhas University of Technology (NSUT). Featuring premier national rock band face-offs, Delhi-wide street play showdowns, choreography competitions, and star-studded Bollywood & EDM pro-nites.',
    category: 'Cultural fests',
    collegeId: 'col-nsut',
    collegeName: 'Netaji Subhas University of Technology (NSUT)',
    venue: 'Main Ground & Moksha Stage, NSUT Campus, Sector 3, Dwarka',
    lat: 28.6091,
    lng: 77.0370,
    bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    startDate: '2026-10-24T10:00:00.000Z',
    endDate: '2026-10-26T23:00:00.000Z',
    registrationDeadline: '2026-10-23T23:59:59.000Z',
    organizerId: 'usr-organizer-1',
    organizerName: 'NSUT Cultural Committee',
    organizerContact: 'cultural@nsut.ac.in',
    status: 'approved',
    isFeatured: true,
    attendeeCount: 3100,
    tags: ['Music', 'Pro Nite', 'Dance', 'Drama', 'NSUT'],
    ticketTypes: [
      {
        id: 'tkt-res-free',
        eventId: 'evt-resonance-2026',
        name: 'Day Stage Student Pass',
        description: 'Access to daytime events, drama competitions, acoustic stage, and food street.',
        price: 0,
        totalQuantity: 4000,
        soldQuantity: 2800,
        perks: ['Day Events Entry', 'Food Village Access', 'Competition Audience Pass'],
      },
      {
        id: 'tkt-res-star',
        eventId: 'evt-resonance-2026',
        name: 'Star Night All-Access Pass',
        description: 'Exclusive pass for Day 3 Mega Star Night featuring headline Bollywood singer & DJ combo.',
        price: 299,
        totalQuantity: 800,
        soldQuantity: 300,
        perks: ['Access to All 3 Days', 'Star Night Arena Entry', 'Express Entry Lane'],
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-techsurge-2026',
    title: 'TechSurge & Mrida ’26 — Annual Techno-Cultural Fest',
    tagline: 'Code in the Morning, Groove at Night @ MAIT Rohini',
    description: 'Maharaja Agrasen Institute of Technology presents its biggest annual bash combining competitive programming, Valorant & BGMI esports arena, battle of the bands, and art exhibitions.',
    category: 'Gaming',
    collegeId: 'col-mait',
    collegeName: 'Maharaja Agrasen Institute of Technology (MAIT)',
    venue: 'MAIT Auditorium & Sports Complex, Sector 22, Rohini',
    lat: 28.7196,
    lng: 77.0664,
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    startDate: '2026-10-21T09:30:00.000Z',
    endDate: '2026-10-22T20:00:00.000Z',
    registrationDeadline: '2026-10-20T23:59:59.000Z',
    organizerId: 'usr-organizer-1',
    organizerName: 'MAIT Technical Society',
    organizerContact: 'techsurge@mait.ac.in',
    status: 'approved',
    isFeatured: true,
    attendeeCount: 890,
    tags: ['Esports', 'Gaming', 'Coding', 'MAIT'],
    ticketTypes: [
      {
        id: 'tkt-techsurge-free',
        eventId: 'evt-techsurge-2026',
        name: 'All-Fest General Pass',
        description: 'Valid for all gaming stages, coding sprints, and campus stalls.',
        price: 0,
        totalQuantity: 2000,
        soldQuantity: 890,
        perks: ['Gaming Arena Entry', 'Coding Sprint', 'Participation Cert'],
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-esya-2026',
    title: 'Esya ’26 — Research & Algorithmic Hackathon',
    tagline: 'AI Models, Cryptography, and Deep Tech Challenges',
    description: 'IIIT Delhi’s flagship computing festival. Focused on bleeding-edge artificial intelligence, competitive cryptography, robotics navigation, and design hackathons.',
    category: 'Technical',
    collegeId: 'col-iiitd',
    collegeName: 'Indraprastha Institute of Information Technology (IIIT Delhi)',
    venue: 'R&D Block & Old Academic Building, Okhla Phase III',
    lat: 28.5459,
    lng: 77.2732,
    bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    startDate: '2026-11-02T10:00:00.000Z',
    endDate: '2026-11-03T20:00:00.000Z',
    registrationDeadline: '2026-11-01T23:59:59.000Z',
    organizerId: 'usr-organizer-1',
    organizerName: 'IIITD Byld & ACM Student Chapter',
    organizerContact: 'esya@iiitd.ac.in',
    status: 'approved',
    isFeatured: false,
    attendeeCount: 650,
    tags: ['AI', 'Research', 'CTF', 'IIITD'],
    ticketTypes: [
      {
        id: 'tkt-esya-free',
        eventId: 'evt-esya-2026',
        name: 'Hacker Registration',
        description: 'Participate in AI Hackathon & CTF contest.',
        price: 0,
        totalQuantity: 1000,
        soldQuantity: 650,
        perks: ['Hackathon Entry', 'Free Cloud Credits', 'Certificate'],
      },
      {
        id: 'tkt-esya-workshops',
        eventId: 'evt-esya-2026',
        name: 'Deep Tech Workshop Masterclass',
        description: 'Hands-on LLM fine-tuning and agent architecture workshop by Google & Microsoft researchers.',
        price: 149,
        totalQuantity: 200,
        soldQuantity: 95,
        perks: ['Hands-on GPU Labs', 'Exclusive Courseware', 'Direct Mentorship'],
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-taarangana-2026',
    title: 'Taarangana ’26 — All-Women Tech & Cultural Fest',
    tagline: 'Empowering Voices, Illuminating Talent',
    description: 'The monumental annual fest of IGDTUW Kashmere Gate. Featuring fashion parades, street dance battles, acoustic bands, and inspirational panels.',
    category: 'Cultural fests',
    collegeId: 'col-igdtuw',
    collegeName: 'Indraprastha Institute of Information Technology for Women (IGDTUW)',
    venue: 'IGDTUW Campus, Kashmere Gate, Delhi',
    lat: 28.6655,
    lng: 77.2324,
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    startDate: '2026-11-08T11:00:00.000Z',
    endDate: '2026-11-09T22:00:00.000Z',
    registrationDeadline: '2026-11-07T23:59:59.000Z',
    organizerId: 'usr-organizer-1',
    organizerName: 'Taarangana Organizing Committee',
    organizerContact: 'taarangana@igdtuw.ac.in',
    status: 'approved',
    isFeatured: false,
    attendeeCount: 1100,
    tags: ['WomenInTech', 'Fashion', 'Music', 'IGDTUW'],
    ticketTypes: [
      {
        id: 'tkt-taar-free',
        eventId: 'evt-taarangana-2026',
        name: 'Student General Entry',
        description: 'Free entry for all college students with valid student ID.',
        price: 0,
        totalQuantity: 3000,
        soldQuantity: 1100,
        perks: ['All Stage Events', 'Fashion Night', 'Art Installation Walkway'],
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-anugoonj-2026',
    title: 'Anugoonj ’26 — 25th Silver Jubilee Prelims & Stage',
    tagline: 'The Pinnacle Intercollege Battle of IP University',
    description: 'Celebrating 25 years of GGSIPU with the biggest university congregation. 120+ affiliated colleges competing in Battle of the Bands, Western Dance, Mono Acting, and Ghazal nights.',
    category: 'Cultural fests',
    collegeId: 'col-usict',
    collegeName: 'University School of Information, Comm. & Tech (USICT, GGSIPU)',
    venue: 'Main Sports Arena, GGSIPU Sector 16C, Dwarka, New Delhi',
    lat: 28.5950,
    lng: 77.0195,
    bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    startDate: '2026-11-14T10:00:00.000Z',
    endDate: '2026-11-16T22:00:00.000Z',
    registrationDeadline: '2026-11-13T23:59:59.000Z',
    organizerId: 'usr-organizer-1',
    organizerName: 'GGSIPU Directorate of Students Welfare',
    organizerContact: 'dsw@ipu.ac.in',
    status: 'approved',
    isFeatured: false,
    attendeeCount: 2200,
    tags: ['IPU', 'Anugoonj', 'Dance', 'RockBand'],
    ticketTypes: [
      {
        id: 'tkt-anu-free',
        eventId: 'evt-anugoonj-2026',
        name: 'Delegate Registration',
        description: 'Free inter-college delegate pass.',
        price: 0,
        totalQuantity: 5000,
        soldQuantity: 2200,
        perks: ['All Day Pass', 'Competitor Badge', 'Souvenir Book'],
      },
      {
        id: 'tkt-anu-vip',
        eventId: 'evt-anugoonj-2026',
        name: 'Silver Jubilee Celebrity Nite Pass',
        description: 'Reserved amphitheater pass for the finale star performance.',
        price: 99,
        totalQuantity: 1000,
        soldQuantity: 410,
        perks: ['VIP Section Seating', 'Direct Gate-3 Entry', 'Official Commemorative Badge'],
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

// Initial pre-registered Ticket for demo student (Aman Sharma for Invictus at DTU)
export const initialTickets: Ticket[] = [
  {
    id: 'tkt-demo-1001',
    ticketNumber: 'HOP-DTU-7489',
    bookingId: 'bok-demo-101',
    eventId: 'evt-invictus-2026',
    eventTitle: 'Invictus 2026 — Annual Tech & Innovation Fest',
    eventDate: '2026-10-18T09:00:00.000Z',
    venue: 'BR Ambedkar Auditorium & OAT, DTU Campus, Rohini, Delhi',
    ticketTypeId: 'tkt-inv-vip',
    ticketTypeName: 'VIP Hacker & Pro Pass',
    price: 199,
    userId: 'usr-student-1',
    userName: 'Aman Sharma',
    userEmail: 'student@hopscot.app',
    userCollege: 'DTU',
    qrPayload: 'HOPSCOT:TKT:HOP-DTU-7489:usr-student-1:evt-invictus-2026:SECRET-HASH-8832',
    status: 'valid',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'tkt-demo-1002',
    ticketNumber: 'HOP-NSUT-2190',
    bookingId: 'bok-demo-102',
    eventId: 'evt-resonance-2026',
    eventTitle: 'Resonance ’26 — Grand Cultural Odyssey',
    eventDate: '2026-10-24T10:00:00.000Z',
    venue: 'Main Ground & Moksha Stage, NSUT Campus, Sector 3, Dwarka',
    ticketTypeId: 'tkt-res-free',
    ticketTypeName: 'Day Stage Student Pass',
    price: 0,
    userId: 'usr-student-1',
    userName: 'Aman Sharma',
    userEmail: 'student@hopscot.app',
    userCollege: 'DTU',
    qrPayload: 'HOPSCOT:TKT:HOP-NSUT-2190:usr-student-1:evt-resonance-2026:SECRET-HASH-1194',
    status: 'valid',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Initial Travel Plans (demonstrating exact and nearby matching from Rohini to DTU)
export const initialTravelPlans: TravelPlan[] = [
  {
    id: 'trv-plan-aman',
    userId: 'usr-student-1',
    userName: 'Aman Sharma',
    userCollege: 'Delhi Technological University (DTU)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    eventId: 'evt-invictus-2026',
    eventTitle: 'Invictus 2026 — Annual Tech & Innovation Fest',
    originName: 'Rohini Sector 14, Delhi',
    originLat: 28.7180,
    originLng: 77.1250,
    destinationName: 'DTU Campus, Rohini',
    destinationLat: 28.7495,
    destinationLng: 77.1180,
    eventDate: '2026-10-18',
    departureTime: '08:45',
    transportMode: 'Metro',
    notes: 'Planning to take Red Line to Rithala, then e-rickshaw or shared cab to DTU gate 1. Let’s tag along!',
    groupId: 'grp-dtu-commuters',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'trv-plan-riya',
    userId: 'usr-student-2',
    userName: 'Riya Sen',
    userCollege: 'Maharaja Agrasen Institute of Technology (MAIT)',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    eventId: 'evt-invictus-2026',
    eventTitle: 'Invictus 2026 — Annual Tech & Innovation Fest',
    originName: 'Rohini Sector 13, Delhi', // ~1.1 km away from Aman!
    originLat: 28.7220,
    originLng: 77.1290,
    destinationName: 'DTU Campus, Rohini',
    destinationLat: 28.7495,
    destinationLng: 77.1180,
    eventDate: '2026-10-18',
    departureTime: '09:00', // within 15 minutes!
    transportMode: 'Metro',
    notes: 'Heading to the UI/UX design battle at Invictus! Can meet at Rohini West or Rithala station.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'trv-plan-kabir',
    userId: 'usr-student-3',
    userName: 'Kabir Mehta',
    userCollege: 'Netaji Subhas University of Technology (NSUT)',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    eventId: 'evt-invictus-2026',
    eventTitle: 'Invictus 2026 — Annual Tech & Innovation Fest',
    originName: 'Pitampura / Netaji Subhash Place',
    originLat: 28.6980,
    originLng: 77.1480,
    destinationName: 'DTU Campus, Rohini',
    destinationLat: 28.7495,
    destinationLng: 77.1180,
    eventDate: '2026-10-18',
    departureTime: '08:30',
    transportMode: 'Cab',
    notes: 'Splitting an Uber from NSP metro! 2 spots open.',
    createdAt: new Date().toISOString(),
  },
];

// Initial Travel Groups
export const initialTravelGroups: TravelGroup[] = [
  {
    id: 'grp-dtu-commuters',
    eventId: 'evt-invictus-2026',
    eventTitle: 'Invictus 2026 — Annual Tech & Innovation Fest',
    name: 'Rohini ➡️ DTU Hackathon Squad',
    description: 'Students traveling together from Rohini (Red Line / Sector 14) directly to DTU BR Ambedkar Auditorium on Day 1.',
    originName: 'Rohini Metro Interchange (Rithala)',
    originLat: 28.7208,
    originLng: 77.1070,
    destinationName: 'DTU Campus Main Gate',
    destinationLat: 28.7495,
    destinationLng: 77.1180,
    departureTime: '08:45',
    eventDate: '2026-10-18',
    transportMode: 'Metro',
    creatorId: 'usr-student-1',
    creatorName: 'Aman Sharma',
    maxMembers: 6,
    status: 'open',
    members: [
      {
        userId: 'usr-student-1',
        userName: 'Aman Sharma',
        userCollege: 'DTU',
        role: 'creator',
        joinedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        userId: 'usr-student-3',
        userName: 'Kabir Mehta',
        userCollege: 'NSUT',
        role: 'member',
        joinedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ],
    joinRequests: [
      {
        id: 'req-riya-1',
        userId: 'usr-student-2',
        userName: 'Riya Sen',
        userCollege: 'MAIT',
        message: 'Hey Aman! I am also from Rohini Sec-13 going to Invictus for the design sprint. Would love to travel together!',
        status: 'pending',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Initial Group Messages
export const initialGroupMessages: GroupMessage[] = [
  {
    id: 'msg-1',
    groupId: 'grp-dtu-commuters',
    userId: 'usr-student-1',
    userName: 'Aman Sharma',
    userCollege: 'DTU',
    content: 'Hey everyone! Welcome to the group. Let’s rendezvous near Gate 2 of Rithala Metro station at 8:40 AM sharp.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'msg-2',
    groupId: 'grp-dtu-commuters',
    userId: 'usr-student-3',
    userName: 'Kabir Mehta',
    userCollege: 'NSUT',
    content: 'Awesome! I will have my laptop backpack and hardware kit with me. See you near the exit token gate.',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

// Initial Notifications
export const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'usr-student-1',
    title: 'New Travel Join Request',
    message: 'Riya Sen requested to join "Rohini ➡️ DTU Hackathon Squad".',
    type: 'group_request',
    link: '/travel/groups/grp-dtu-commuters',
    isRead: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'usr-student-1',
    title: 'Travel Match Discovered!',
    message: '2 students found leaving from near Rohini for Invictus 2026 within your departure window.',
    type: 'travel_match',
    link: '/travel/matches',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'usr-student-1',
    title: 'Ticket Confirmed: Invictus 2026',
    message: 'Your VIP Hacker & Pro Pass (HOP-DTU-7489) is generated and ready for QR check-in.',
    type: 'ticket',
    link: '/tickets',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

// Initial Reports
export const initialReports: Report[] = [
  {
    id: 'rep-1',
    reporterId: 'usr-student-2',
    reporterName: 'Riya Sen',
    targetType: 'group',
    targetId: 'grp-spam-demo',
    targetName: 'Non-college unauthorized promotional link',
    reason: 'Contains off-topic promotional spam links instead of college travel details.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

// In-Memory Database Store Class
class DataStore {
  colleges: College[] = [...initialColleges];
  users: User[] = [...initialUsers];
  events: Event[] = [...initialEvents];
  tickets: Ticket[] = [...initialTickets];
  bookings: Booking[] = [];
  travelPlans: TravelPlan[] = [...initialTravelPlans];
  travelGroups: TravelGroup[] = [...initialTravelGroups];
  groupMessages: GroupMessage[] = [...initialGroupMessages];
  notifications: Notification[] = [...initialNotifications];
  reports: Report[] = [...initialReports];

  // Current session mock storage for demo simplicity
  activeUserId: string = 'usr-student-1';

  getActiveUser(): User | undefined {
    return this.users.find((u) => u.id === this.activeUserId);
  }

  setActiveUser(userId: string): User | undefined {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      this.activeUserId = userId;
    }
    return user;
  }
}

export const db = new DataStore();
