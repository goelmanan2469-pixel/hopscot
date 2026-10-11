import { Router, Request, Response } from 'express';
import { db, calculateDistanceKm, timeToMinutes } from './dataStore.js';
import { User, Event, Ticket, Booking, TravelPlan, TravelGroup, GroupMessage, Notification, Report } from '../src/types/index.js';

const router = Router();

// Helper to get authenticated user or fallback demo user
function getAuthUser(req: Request): User {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const tokenOrId = authHeader.replace('Bearer ', '').trim();
    const user = db.users.find((u) => u.id === tokenOrId || u.email === tokenOrId);
    if (user) return user;
  }
  return db.getActiveUser() || db.users[0];
}

// -------------------------------------------------------------
// AUTH & USERS
// -------------------------------------------------------------

router.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role, collegeId, course, year, bio } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'A user with this email already exists' });
  }

  const college = collegeId ? db.colleges.find((c) => c.id === collegeId) : undefined;

  const newUser: User = {
    id: `usr-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    role: role === 'organizer' ? 'organizer' : 'student',
    collegeId,
    collegeName: college ? college.name : undefined,
    course,
    year,
    bio,
    avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(name)}`,
    interests: [],
    travelPreferences: {
      preferredMode: 'Metro',
      musicPreference: 'Any',
      silentTravel: false,
      genderPreference: 'any',
    },
    isSuspended: false,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.setActiveUser(newUser.id);

  return res.status(201).json({
    user: newUser,
    token: newUser.id,
    message: 'Registered successfully',
  });
});

router.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials or user not found' });
  }
  if (user.isSuspended) {
    return res.status(403).json({ error: 'This account has been suspended by administration.' });
  }

  db.setActiveUser(user.id);
  return res.json({
    user,
    token: user.id,
    message: 'Logged in successfully',
  });
});

router.post('/auth/demo-switch', (req: Request, res: Response) => {
  const { role, userId } = req.body;
  let targetUser: User | undefined;

  if (userId) {
    targetUser = db.users.find((u) => u.id === userId);
  } else if (role) {
    targetUser = db.users.find((u) => u.role === role);
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'Target demo account not found' });
  }

  db.setActiveUser(targetUser.id);
  return res.json({
    user: targetUser,
    token: targetUser.id,
    message: `Switched session to ${targetUser.name} (${targetUser.role})`,
  });
});

router.get('/users/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  return res.json({ user });
});

router.put('/users/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { name, bio, course, year, collegeId, interests, travelPreferences, phone } = req.body;

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (course !== undefined) user.course = course;
  if (year !== undefined) user.year = year;
  if (phone !== undefined) user.phone = phone;
  if (interests !== undefined) user.interests = interests;
  if (travelPreferences !== undefined) {
    user.travelPreferences = { ...user.travelPreferences, ...travelPreferences };
  }
  if (collegeId) {
    const col = db.colleges.find((c) => c.id === collegeId);
    if (col) {
      user.collegeId = col.id;
      user.collegeName = col.name;
    }
  }

  return res.json({ user, message: 'Profile updated' });
});

router.get('/users/:id', (req: Request, res: Response) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Public profile sanitization: omit private phone and credentials
  const sanitized = {
    id: user.id,
    name: user.name,
    role: user.role,
    collegeName: user.collegeName,
    course: user.course,
    year: user.year,
    bio: user.bio,
    avatar: user.avatar,
    interests: user.interests,
    travelPreferences: {
      preferredMode: user.travelPreferences?.preferredMode,
      genderPreference: user.travelPreferences?.genderPreference,
    },
    createdAt: user.createdAt,
  };
  return res.json({ user: sanitized });
});

// -------------------------------------------------------------
// COLLEGES
// -------------------------------------------------------------

router.get('/colleges', (_req: Request, res: Response) => {
  return res.json({ colleges: db.colleges });
});

router.get('/colleges/:id', (req: Request, res: Response) => {
  const col = db.colleges.find((c) => c.id === req.params.id || c.shortCode.toLowerCase() === req.params.id.toLowerCase());
  if (!col) return res.status(404).json({ error: 'College not found' });
  return res.json({ college: col });
});

// -------------------------------------------------------------
// EVENTS
// -------------------------------------------------------------

router.get('/events', (req: Request, res: Response) => {
  let list = db.events.filter((e) => e.status === 'approved');

  const { search, category, collegeId, priceType, featured } = req.query;

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.collegeName.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (category && typeof category === 'string' && category !== 'All') {
    list = list.filter((e) => e.category === category);
  }

  if (collegeId && typeof collegeId === 'string' && collegeId !== 'all') {
    list = list.filter((e) => e.collegeId === collegeId);
  }

  if (featured === 'true') {
    list = list.filter((e) => e.isFeatured);
  }

  if (priceType === 'free') {
    list = list.filter((e) => e.ticketTypes.some((t) => t.price === 0));
  } else if (priceType === 'paid') {
    list = list.filter((e) => e.ticketTypes.some((t) => t.price > 0));
  }

  return res.json({ events: list, total: list.length });
});

router.get('/events/:id', (req: Request, res: Response) => {
  const event = db.events.find((e) => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  return res.json({ event });
});

router.post('/events', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user.role !== 'organizer' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Only registered organizers or admins can create events' });
  }

  const {
    title,
    tagline,
    description,
    category,
    collegeId,
    venue,
    lat,
    lng,
    bannerUrl,
    startDate,
    endDate,
    registrationDeadline,
    ticketTypes,
    tags,
  } = req.body;

  if (!title || !description || !collegeId || !venue || !startDate) {
    return res.status(400).json({ error: 'Missing required event parameters' });
  }

  const college = db.colleges.find((c) => c.id === collegeId);

  const newEvent: Event = {
    id: `evt-${Date.now()}`,
    title,
    tagline: tagline || '',
    description,
    category: category || 'Technical',
    collegeId,
    collegeName: college ? college.name : 'Delhi College',
    venue,
    lat: Number(lat) || (college ? college.lat : 28.6139),
    lng: Number(lng) || (college ? college.lng : 77.2090),
    bannerUrl:
      bannerUrl ||
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    startDate,
    endDate: endDate || startDate,
    registrationDeadline: registrationDeadline || startDate,
    organizerId: user.id,
    organizerName: user.name,
    organizerContact: user.email,
    status: user.role === 'admin' ? 'approved' : 'approved', // Auto-approved for fast live testing, or admin review
    isFeatured: false,
    attendeeCount: 0,
    tags: Array.isArray(tags) ? tags : ['CollegeFest', 'DelhiNCR'],
    ticketTypes: Array.isArray(ticketTypes) && ticketTypes.length > 0
      ? ticketTypes.map((t: any, idx: number) => ({
          id: `tkt-custom-${Date.now()}-${idx}`,
          eventId: `evt-${Date.now()}`,
          name: t.name || 'General Admission',
          description: t.description || 'Access to event',
          price: Number(t.price) || 0,
          totalQuantity: Number(t.totalQuantity) || 500,
          soldQuantity: 0,
          perks: Array.isArray(t.perks) ? t.perks : ['Entry Pass'],
        }))
      : [
          {
            id: `tkt-custom-${Date.now()}-0`,
            eventId: `evt-${Date.now()}`,
            name: 'General Pass',
            description: 'Free attendee pass',
            price: 0,
            totalQuantity: 1000,
            soldQuantity: 0,
            perks: ['Event Entry'],
          },
        ],
    createdAt: new Date().toISOString(),
  };

  db.events.unshift(newEvent);
  return res.status(201).json({ event: newEvent, message: 'Event published successfully' });
});

// -------------------------------------------------------------
// TICKETING & PAYMENTS (Razorpay test mode + atomic checkouts)
// -------------------------------------------------------------

router.post('/events/:id/register', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const event = db.events.find((e) => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const { ticketTypeId } = req.body;
  const ticketType = event.ticketTypes.find((t) => t.id === ticketTypeId) || event.ticketTypes.find((t) => t.price === 0);

  if (!ticketType) {
    return res.status(400).json({ error: 'No free ticket category available for direct registration' });
  }

  // Check inventory
  if (ticketType.soldQuantity >= ticketType.totalQuantity) {
    return res.status(400).json({ error: 'Tickets for this category are completely sold out' });
  }

  // Check if student already has a valid ticket for this event
  const existingTicket = db.tickets.find((t) => t.eventId === event.id && t.userId === user.id && t.status === 'valid');
  if (existingTicket) {
    return res.status(409).json({
      error: 'You are already registered for this event!',
      ticket: existingTicket,
    });
  }

  // Increment sold count atomically
  ticketType.soldQuantity += 1;
  event.attendeeCount += 1;

  const bookingId = `bok-${Date.now()}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const ticketNumber = `HOP-${event.collegeName.slice(0, 3).toUpperCase()}-${randomSuffix}`;
  const qrHash = `SEC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const qrPayload = `HOPSCOT:TKT:${ticketNumber}:${user.id}:${event.id}:${qrHash}`;

  const newTicket: Ticket = {
    id: `tkt-${Date.now()}`,
    ticketNumber,
    bookingId,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.startDate,
    venue: event.venue,
    ticketTypeId: ticketType.id,
    ticketTypeName: ticketType.name,
    price: 0,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userCollege: user.collegeName,
    qrPayload,
    status: 'valid',
    createdAt: new Date().toISOString(),
  };

  db.tickets.unshift(newTicket);

  // Notify student
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: user.id,
    title: 'Registration Confirmed! 🎟️',
    message: `You're registered for ${event.title}. Ticket #${ticketNumber} is ready.`,
    type: 'ticket',
    link: `/tickets`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({
    ticket: newTicket,
    message: 'Registered successfully! Your digital QR ticket has been generated.',
  });
});

// Razorpay test order creation for paid passes
router.post('/payments/create-order', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { eventId, ticketTypeId, quantity = 1 } = req.body;

  const event = db.events.find((e) => e.id === eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const ticketType = event.ticketTypes.find((t) => t.id === ticketTypeId);
  if (!ticketType) return res.status(404).json({ error: 'Ticket type not found' });

  if (ticketType.soldQuantity + quantity > ticketType.totalQuantity) {
    return res.status(400).json({ error: 'Not enough tickets left in stock' });
  }

  const totalAmount = ticketType.price * quantity;
  const orderId = `order_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const booking: Booking = {
    id: `bok-${Date.now()}`,
    userId: user.id,
    eventId: event.id,
    ticketTypeId: ticketType.id,
    quantity,
    totalAmount,
    paymentStatus: 'pending',
    orderId,
    createdAt: new Date().toISOString(),
  };
  db.bookings.push(booking);

  return res.json({
    orderId,
    bookingId: booking.id,
    amount: totalAmount * 100, // paise for Razorpay
    currency: 'INR',
    keyId: process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_HOPSCOT_DEMO_KEY',
    eventTitle: event.title,
    ticketTypeName: ticketType.name,
    user: {
      name: user.name,
      email: user.email,
    },
    isTestMode: true,
  });
});

// Razorpay signature & test payment verification
router.post('/payments/verify', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { bookingId, orderId, paymentId } = req.body;

  const booking = db.bookings.find((b) => b.id === bookingId || b.orderId === orderId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking order not found' });
  }

  if (booking.paymentStatus === 'paid') {
    // Idempotent check
    const existingTicket = db.tickets.find((t) => t.bookingId === booking.id);
    return res.json({
      success: true,
      ticket: existingTicket,
      message: 'Booking already confirmed',
    });
  }

  const event = db.events.find((e) => e.id === booking.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const ticketType = event.ticketTypes.find((t) => t.id === booking.ticketTypeId);
  if (!ticketType) return res.status(404).json({ error: 'Ticket type not found' });

  // Update booking
  booking.paymentStatus = 'paid';
  booking.paymentId = paymentId || `pay_test_${Date.now()}`;
  ticketType.soldQuantity += booking.quantity;
  event.attendeeCount += booking.quantity;

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const ticketNumber = `HOP-${event.collegeName.slice(0, 3).toUpperCase()}-${randomSuffix}`;
  const qrHash = `SEC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const qrPayload = `HOPSCOT:TKT:${ticketNumber}:${user.id}:${event.id}:${qrHash}`;

  const newTicket: Ticket = {
    id: `tkt-${Date.now()}`,
    ticketNumber,
    bookingId: booking.id,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.startDate,
    venue: event.venue,
    ticketTypeId: ticketType.id,
    ticketTypeName: ticketType.name,
    price: ticketType.price,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userCollege: user.collegeName,
    qrPayload,
    status: 'valid',
    createdAt: new Date().toISOString(),
  };

  db.tickets.unshift(newTicket);

  // Notify student
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: user.id,
    title: 'Payment Successful! 🎉',
    message: `Payment of ₹${booking.totalAmount} verified for ${event.title}. Digital Pass #${ticketNumber} issued.`,
    type: 'ticket',
    link: `/tickets`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({
    success: true,
    ticket: newTicket,
    message: 'Payment verified and digital ticket generated successfully!',
  });
});

router.get('/users/me/tickets', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const userTickets = db.tickets.filter((t) => t.userId === user.id);
  return res.json({ tickets: userTickets });
});

router.get('/tickets/:id', (req: Request, res: Response) => {
  const ticket = db.tickets.find((t) => t.id === req.params.id || t.ticketNumber === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  return res.json({ ticket });
});

// -------------------------------------------------------------
// ORGANIZER QR SCANNER & CHECK-IN VERIFICATION
// -------------------------------------------------------------

router.post('/tickets/verify-qr', (req: Request, res: Response) => {
  const scannerUser = getAuthUser(req);
  const { qrPayload, ticketNumber } = req.body;

  if (!qrPayload && !ticketNumber) {
    return res.status(400).json({ error: 'QR payload or ticket number is required for verification' });
  }

  // Lookup by exact qrPayload or by ticketNumber
  let ticket = db.tickets.find((t) => (qrPayload && t.qrPayload === qrPayload.trim()) || (ticketNumber && t.ticketNumber === ticketNumber.trim().toUpperCase()));

  // In case of loose scanning or formatted payloads
  if (!ticket && qrPayload) {
    const parts = qrPayload.split(':');
    if (parts.length >= 3 && parts[0] === 'HOPSCOT' && parts[1] === 'TKT') {
      const extractedNumber = parts[2];
      ticket = db.tickets.find((t) => t.ticketNumber === extractedNumber);
    }
  }

  if (!ticket) {
    return res.status(404).json({
      valid: false,
      status: 'invalid',
      error: 'Invalid QR Ticket: No matching record found in HOPSCOT registry.',
    });
  }

  // Check if ticket is already checked in
  if (ticket.status === 'used') {
    return res.status(409).json({
      valid: false,
      status: 'already_used',
      message: 'WARNING: Ticket already checked in!',
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        eventTitle: ticket.eventTitle,
        userName: ticket.userName,
        userCollege: ticket.userCollege,
        ticketTypeName: ticket.ticketTypeName,
        checkedInAt: ticket.checkedInAt,
        checkedInBy: ticket.checkedInBy,
      },
    });
  }

  if (ticket.status === 'cancelled') {
    return res.status(400).json({
      valid: false,
      status: 'cancelled',
      error: 'This ticket was cancelled or refunded.',
    });
  }

  // Mark ticket as checked-in
  ticket.status = 'used';
  ticket.checkedInAt = new Date().toISOString();
  ticket.checkedInBy = scannerUser.name || 'Organizer Entry Gate';

  // Notify student about check-in
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: ticket.userId,
    title: 'Checked In at Event Gate! ✅',
    message: `Your ticket ${ticket.ticketNumber} was successfully checked in at ${ticket.eventTitle}. Have fun!`,
    type: 'check_in',
    link: `/tickets`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.json({
    valid: true,
    status: 'checked_in',
    message: 'Check-in Approved! Welcome to the event.',
    ticket: {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      eventTitle: ticket.eventTitle,
      userName: ticket.userName,
      userCollege: ticket.userCollege,
      ticketTypeName: ticket.ticketTypeName,
      checkedInAt: ticket.checkedInAt,
      checkedInBy: ticket.checkedInBy,
    },
  });
});

// -------------------------------------------------------------
// TRAVEL PLANNER & SOCIAL MATCHING ENGINE
// -------------------------------------------------------------

router.post('/travel-plans', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const {
    eventId,
    originName,
    originLat,
    originLng,
    destinationName,
    destinationLat,
    destinationLng,
    eventDate,
    departureTime,
    transportMode,
    notes,
  } = req.body;

  if (!eventId || !originName || !departureTime) {
    return res.status(400).json({ error: 'Event, starting location, and departure time are required' });
  }

  const event = db.events.find((e) => e.id === eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  // Remove existing plan for this event if any, to update
  db.travelPlans = db.travelPlans.filter((p) => !(p.userId === user.id && p.eventId === eventId));

  const plan: TravelPlan = {
    id: `trv-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userCollege: user.collegeName || 'Delhi College',
    userAvatar: user.avatar,
    eventId: event.id,
    eventTitle: event.title,
    originName,
    originLat: Number(originLat) || 28.7180,
    originLng: Number(originLng) || 77.1250,
    destinationName: destinationName || event.venue,
    destinationLat: Number(destinationLat) || event.lat,
    destinationLng: Number(destinationLng) || event.lng,
    eventDate: eventDate || event.startDate.split('T')[0],
    departureTime,
    transportMode: transportMode || 'Metro',
    notes,
    createdAt: new Date().toISOString(),
  };

  db.travelPlans.unshift(plan);

  return res.status(201).json({
    plan,
    message: 'Travel plan saved. Finding fellow students heading your way!',
  });
});

router.get('/travel-plans/my', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const myPlans = db.travelPlans.filter((p) => p.userId === user.id);
  return res.json({ plans: myPlans });
});

// TRAVEL MATCHING ALGORITHM
router.get('/travel-plans/matches', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { eventId, timeWindowMinutes = 45, maxDistanceKm = 8 } = req.query;

  // Find user's travel plan for this event or their most recent plan
  let userPlan: TravelPlan | undefined;
  if (eventId && typeof eventId === 'string') {
    userPlan = db.travelPlans.find((p) => p.userId === user.id && p.eventId === eventId);
  }
  if (!userPlan) {
    userPlan = db.travelPlans.find((p) => p.userId === user.id);
  }

  if (!userPlan) {
    // If no plan set up yet, provide potential companions heading to the event
    const otherCompanions = db.travelPlans.filter((p) => p.userId !== user.id);
    return res.json({
      userPlan: null,
      matches: otherCompanions.map((other) => ({
        plan: other,
        matchScore: 82,
        distanceKm: 2.1,
        timeDiffMinutes: 15,
        matchReasons: ['Heading to same event', 'Nearby origin in Rohini', 'Close departure timing'],
      })),
      count: otherCompanions.length,
    });
  }

  const userTimeMins = timeToMinutes(userPlan.departureTime);
  const parsedWindow = Number(timeWindowMinutes) || 45;
  const parsedMaxDist = Number(maxDistanceKm) || 8;

  // Filter candidate students attending the SAME event, who are not the user
  const candidates = db.travelPlans.filter((p) => p.userId !== user.id && p.eventId === userPlan!.eventId);

  const scoredMatches = candidates
    .map((other) => {
      // 1. Distance between origins
      const dist = calculateDistanceKm(userPlan!.originLat, userPlan!.originLng, other.originLat, other.originLng);

      // 2. Time difference in minutes
      const otherTimeMins = timeToMinutes(other.departureTime);
      const timeDiff = Math.abs(userTimeMins - otherTimeMins);

      // 3. Mode compatibility
      const sameMode = userPlan!.transportMode === other.transportMode;

      // Scoring heuristic:
      // Base: 40 points for same event
      // Distance: up to 30 points (decaying beyond 5km)
      // Timing: up to 20 points (within 15 mins = 20, within 45 mins = 10)
      // Transport mode: +10 points if same
      let score = 40;

      const reasons: string[] = ['Going to the same fest!'];

      if (dist <= 1.5) {
        score += 30;
        reasons.push(`Super close origin (${dist} km away)`);
      } else if (dist <= 4.0) {
        score += 20;
        reasons.push(`Nearby departure area (${dist} km away)`);
      } else if (dist <= parsedMaxDist) {
        score += 10;
        reasons.push(`Same travel corridor (${dist} km away)`);
      }

      if (timeDiff <= 15) {
        score += 20;
        reasons.push(`Leaves within 15 mins (${other.departureTime})`);
      } else if (timeDiff <= parsedWindow) {
        score += 12;
        reasons.push(`Departure within ~${timeDiff} mins`);
      }

      if (sameMode) {
        score += 10;
        reasons.push(`Both prefer ${userPlan!.transportMode}`);
      }

      return {
        plan: other,
        matchScore: Math.min(score, 99),
        distanceKm: dist,
        timeDiffMinutes: timeDiff,
        matchReasons: reasons,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return res.json({
    userPlan,
    matches: scoredMatches,
    count: scoredMatches.length,
  });
});

// -------------------------------------------------------------
// TRAVEL GROUPS & GROUP CHAT
// -------------------------------------------------------------

router.get('/groups', (req: Request, res: Response) => {
  const { eventId, search } = req.query;
  let list = db.travelGroups;

  if (eventId && typeof eventId === 'string' && eventId !== 'all') {
    list = list.filter((g) => g.eventId === eventId);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.originName.toLowerCase().includes(q) ||
        g.eventTitle.toLowerCase().includes(q)
    );
  }

  return res.json({ groups: list, count: list.length });
});

router.get('/groups/:id', (req: Request, res: Response) => {
  const group = db.travelGroups.find((g) => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Travel group not found' });
  return res.json({ group });
});

router.post('/groups', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const {
    eventId,
    name,
    description,
    originName,
    originLat,
    originLng,
    destinationName,
    destinationLat,
    destinationLng,
    departureTime,
    eventDate,
    transportMode,
    maxMembers = 5,
  } = req.body;

  if (!eventId || !name || !originName || !departureTime) {
    return res.status(400).json({ error: 'Event, group name, origin, and departure time are required' });
  }

  const event = db.events.find((e) => e.id === eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const newGroup: TravelGroup = {
    id: `grp-${Date.now()}`,
    eventId: event.id,
    eventTitle: event.title,
    name,
    description: description || 'Traveling together to catch the fest vibes!',
    originName,
    originLat: Number(originLat) || 28.7180,
    originLng: Number(originLng) || 77.1250,
    destinationName: destinationName || event.venue,
    destinationLat: Number(destinationLat) || event.lat,
    destinationLng: Number(destinationLng) || event.lng,
    departureTime,
    eventDate: eventDate || event.startDate.split('T')[0],
    transportMode: transportMode || 'Metro',
    creatorId: user.id,
    creatorName: user.name,
    maxMembers: Number(maxMembers) || 5,
    status: 'open',
    members: [
      {
        userId: user.id,
        userName: user.name,
        userCollege: user.collegeName || 'Delhi College',
        role: 'creator',
        joinedAt: new Date().toISOString(),
      },
    ],
    joinRequests: [],
    createdAt: new Date().toISOString(),
  };

  db.travelGroups.unshift(newGroup);

  // Initial welcome message
  db.groupMessages.push({
    id: `msg-${Date.now()}`,
    groupId: newGroup.id,
    userId: user.id,
    userName: user.name,
    userCollege: user.collegeName || 'Delhi College',
    content: `Created "${newGroup.name}". Meeting at ${originName} at ${departureTime}!`,
    timestamp: new Date().toISOString(),
  });

  return res.status(201).json({ group: newGroup, message: 'Travel group created successfully!' });
});

router.post('/groups/:id/join', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const group = db.travelGroups.find((g) => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  // Check if already a member
  if (group.members.some((m) => m.userId === user.id)) {
    return res.status(409).json({ error: 'You are already a member of this travel squad' });
  }

  // Check if pending request exists
  if (group.joinRequests.some((r) => r.userId === user.id && r.status === 'pending')) {
    return res.status(409).json({ error: 'You already have a pending request for this group' });
  }

  const { message } = req.body;
  const requestId = `req-${Date.now()}`;

  const request = {
    id: requestId,
    userId: user.id,
    userName: user.name,
    userCollege: user.collegeName || 'College Student',
    message: message || `Hey! I'm heading to ${group.eventTitle} too. Would love to travel along!`,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };

  group.joinRequests.push(request);

  // Notify group creator
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: group.creatorId,
    title: 'New Travel Request',
    message: `${user.name} wants to join "${group.name}".`,
    type: 'group_request',
    link: `/travel/groups/${group.id}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({
    message: 'Join request sent to group creator!',
    request,
  });
});

router.post('/groups/:id/requests/:requestId/respond', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const group = db.travelGroups.find((g) => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  // Only creator can accept or reject
  if (group.creatorId !== user.id) {
    return res.status(403).json({ error: 'Only the group creator can accept or reject join requests' });
  }

  const request = group.joinRequests.find((r) => r.id === req.params.requestId);
  if (!request) return res.status(404).json({ error: 'Join request not found' });

  const { action } = req.body; // 'accepted' | 'rejected'

  if (action === 'accepted') {
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ error: 'Travel group is already at full capacity' });
    }

    request.status = 'accepted';
    group.members.push({
      userId: request.userId,
      userName: request.userName,
      userCollege: request.userCollege,
      role: 'member',
      joinedAt: new Date().toISOString(),
    });

    if (group.members.length >= group.maxMembers) {
      group.status = 'full';
    }

    // System message in chat
    db.groupMessages.push({
      id: `msg-${Date.now()}`,
      groupId: group.id,
      userId: request.userId,
      userName: request.userName,
      userCollege: request.userCollege,
      content: `👋 Joined the group! Ready for ${group.eventTitle}.`,
      timestamp: new Date().toISOString(),
    });

    // Notify requester
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: request.userId,
      title: 'Squad Request Accepted! 🎉',
      message: `You are now a member of "${group.name}". Open chat to coordinate pickup.`,
      type: 'group_accepted',
      link: `/travel/groups/${group.id}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  } else {
    request.status = 'rejected';
  }

  return res.json({
    message: `Request ${action}`,
    group,
  });
});

router.post('/groups/:id/leave', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const group = db.travelGroups.find((g) => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const memberIdx = group.members.findIndex((m) => m.userId === user.id);
  if (memberIdx === -1) {
    return res.status(400).json({ error: 'You are not a member of this group' });
  }

  group.members.splice(memberIdx, 1);
  if (group.status === 'full' && group.members.length < group.maxMembers) {
    group.status = 'open';
  }

  return res.json({ message: 'Left the travel group', group });
});

router.get('/groups/:id/messages', (req: Request, res: Response) => {
  const messages = db.groupMessages.filter((m) => m.groupId === req.params.id);
  return res.json({ messages });
});

router.post('/groups/:id/messages', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const group = db.travelGroups.find((g) => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  // Ensure user is an accepted member
  const isMember = group.members.some((m) => m.userId === user.id);
  if (!isMember) {
    return res.status(403).json({ error: 'Only accepted squad members can send chat messages' });
  }

  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content cannot be empty' });
  }

  const newMessage: GroupMessage = {
    id: `msg-${Date.now()}`,
    groupId: group.id,
    userId: user.id,
    userName: user.name,
    userCollege: user.collegeName || 'Student',
    content: content.trim(),
    timestamp: new Date().toISOString(),
  };

  db.groupMessages.push(newMessage);
  return res.status(201).json({ message: newMessage });
});

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------

router.get('/notifications', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const list = db.notifications.filter((n) => n.userId === user.id);
  const unreadCount = list.filter((n) => !n.isRead).length;
  return res.json({ notifications: list, unreadCount });
});

router.put('/notifications/:id/read', (req: Request, res: Response) => {
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (notif) notif.isRead = true;
  return res.json({ success: true });
});

router.post('/notifications/read-all', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  db.notifications.forEach((n) => {
    if (n.userId === user.id) n.isRead = true;
  });
  return res.json({ success: true, message: 'All notifications marked as read' });
});

// -------------------------------------------------------------
// ORGANIZER DASHBOARD
// -------------------------------------------------------------

router.get('/organizer/dashboard', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  // Get events organized by user (or all if demo organizer)
  const myEvents = db.events.filter((e) => user.role === 'admin' || e.organizerId === user.id || e.collegeId === user.collegeId);
  const eventIds = new Set(myEvents.map((e) => e.id));

  const myTickets = db.tickets.filter((t) => eventIds.has(t.eventId));
  const totalRevenue = myTickets.reduce((acc, t) => acc + (t.price || 0), 0);
  const checkedInCount = myTickets.filter((t) => t.status === 'used').length;

  return res.json({
    stats: {
      totalEvents: myEvents.length,
      totalAttendees: myTickets.length,
      checkedInAttendees: checkedInCount,
      totalRevenueINR: totalRevenue,
    },
    events: myEvents,
    recentRegistrations: myTickets.slice(0, 10),
  });
});

// -------------------------------------------------------------
// ADMIN DASHBOARD & MODERATION
// -------------------------------------------------------------

router.get('/admin/dashboard', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const totalUsers = db.users.length;
  const students = db.users.filter((u) => u.role === 'student').length;
  const organizers = db.users.filter((u) => u.role === 'organizer').length;
  const totalTickets = db.tickets.length;
  const totalRevenue = db.tickets.reduce((acc, t) => acc + (t.price || 0), 0);

  return res.json({
    metrics: {
      totalUsers,
      students,
      organizers,
      totalEvents: db.events.length,
      pendingEvents: db.events.filter((e) => e.status === 'pending').length,
      totalRegistrations: totalTickets,
      totalRevenueINR: totalRevenue,
      activeTravelSquads: db.travelGroups.length,
    },
    users: db.users,
    events: db.events,
    reports: db.reports,
    colleges: db.colleges,
  });
});

router.put('/admin/events/:id/approve', (req: Request, res: Response) => {
  const event = db.events.find((e) => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  event.status = 'approved';
  return res.json({ message: 'Event approved', event });
});

router.put('/admin/events/:id/reject', (req: Request, res: Response) => {
  const event = db.events.find((e) => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const { reason } = req.body;
  event.status = 'rejected';
  event.rejectionReason = reason || 'Violation of college festival guidelines';
  return res.json({ message: 'Event rejected', event });
});

router.put('/admin/users/:id/suspend', (req: Request, res: Response) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.isSuspended = !user.isSuspended;
  return res.json({ message: `User ${user.isSuspended ? 'suspended' : 're-activated'}`, user });
});

router.post('/reports', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { targetType, targetId, targetName, reason } = req.body;

  if (!targetType || !targetId || !reason) {
    return res.status(400).json({ error: 'Target and reason required' });
  }

  const report: Report = {
    id: `rep-${Date.now()}`,
    reporterId: user.id,
    reporterName: user.name,
    targetType,
    targetId,
    targetName: targetName || 'Reported Item',
    reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.reports.unshift(report);
  return res.status(201).json({ message: 'Report submitted for review', report });
});

export default router;
