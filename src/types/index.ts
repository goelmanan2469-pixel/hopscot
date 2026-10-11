import { Request, Response } from 'express';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'organizer' | 'admin';
  collegeId?: string;
  collegeName?: string;
  course?: string;
  year?: string;
  bio?: string;
  avatar?: string;
  interests?: string[];
  travelPreferences?: {
    preferredMode: string;
    musicPreference?: string;
    silentTravel?: boolean;
    genderPreference?: 'any' | 'same_gender_only';
  };
  phone?: string;
  isSuspended?: boolean;
  createdAt: string;
}

export interface College {
  id: string;
  name: string;
  shortCode: string;
  location: string;
  metroStation: string;
  lat: number;
  lng: number;
  eventCount: number;
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description: string;
  price: number; // in INR, 0 for free
  totalQuantity: number;
  soldQuantity: number;
  perks: string[];
}

export interface Event {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: 'Hackathons' | 'Cultural fests' | 'Technical' | 'Workshops' | 'Sports' | 'Music' | 'Gaming' | 'Entrepreneurship';
  collegeId: string;
  collegeName: string;
  venue: string;
  lat: number;
  lng: number;
  bannerUrl: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  organizerId: string;
  organizerName: string;
  organizerContact: string;
  status: 'approved' | 'pending' | 'rejected';
  rejectionReason?: string;
  isFeatured?: boolean;
  ticketTypes: TicketType[];
  attendeeCount: number;
  tags: string[];
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  bookingId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  userId: string;
  userName: string;
  userEmail: string;
  userCollege?: string;
  qrPayload: string;
  status: 'valid' | 'used' | 'cancelled';
  checkedInAt?: string;
  checkedInBy?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: 'free' | 'pending' | 'paid' | 'failed';
  paymentId?: string;
  orderId?: string;
  createdAt: string;
}

export interface TravelPlan {
  id: string;
  userId: string;
  userName: string;
  userCollege: string;
  userAvatar?: string;
  eventId: string;
  eventTitle: string;
  originName: string;
  originLat: number;
  originLng: number;
  destinationName: string;
  destinationLat: number;
  destinationLng: number;
  eventDate: string;
  departureTime: string; // "09:00"
  transportMode: 'Metro' | 'Cab' | 'Bus' | 'Bike' | 'Car' | 'Walking';
  notes?: string;
  groupId?: string;
  createdAt: string;
}

export interface TravelGroup {
  id: string;
  eventId: string;
  eventTitle: string;
  name: string;
  description: string;
  originName: string;
  originLat: number;
  originLng: number;
  destinationName: string;
  destinationLat: number;
  destinationLng: number;
  departureTime: string;
  eventDate: string;
  transportMode: 'Metro' | 'Cab' | 'Bus' | 'Bike' | 'Car';
  creatorId: string;
  creatorName: string;
  maxMembers: number;
  status: 'open' | 'full' | 'closed';
  members: {
    userId: string;
    userName: string;
    userCollege: string;
    role: 'creator' | 'member';
    joinedAt: string;
  }[];
  joinRequests: {
    id: string;
    userId: string;
    userName: string;
    userCollege: string;
    message?: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
  }[];
  createdAt: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userCollege: string;
  content: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ticket' | 'travel_match' | 'group_request' | 'group_accepted' | 'event_update' | 'check_in';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'user' | 'group' | 'event';
  targetId: string;
  targetName: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}
