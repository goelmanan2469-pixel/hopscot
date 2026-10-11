import { User, College, Event, Ticket, TravelPlan, TravelGroup, GroupMessage, Notification, Report } from '../types/index.js';

const API_BASE = '/api';

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('hopscot_token') || 'usr-student-1';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {}),
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
    }
    return data;
  }

  // Auth
  async login(email: string): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    localStorage.setItem('hopscot_token', data.token);
    return data;
  }

  async register(payload: Partial<User> & { password?: string }): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    localStorage.setItem('hopscot_token', data.token);
    return data;
  }

  async switchDemo(role?: string, userId?: string): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role, userId }),
    });
    localStorage.setItem('hopscot_token', data.token);
    return data;
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/users/me');
  }

  async updateMe(payload: Partial<User>): Promise<{ user: User; message: string }> {
    return this.request<{ user: User; message: string }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async getUserById(id: string): Promise<{ user: Partial<User> }> {
    return this.request<{ user: Partial<User> }>(`/users/${id}`);
  }

  // Colleges
  async getColleges(): Promise<{ colleges: College[] }> {
    return this.request<{ colleges: College[] }>('/colleges');
  }

  // Events
  async getEvents(params: { search?: string; category?: string; collegeId?: string; priceType?: string; featured?: boolean } = {}): Promise<{ events: Event[]; total: number }> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.collegeId && params.collegeId !== 'all') query.append('collegeId', params.collegeId);
    if (params.priceType) query.append('priceType', params.priceType);
    if (params.featured) query.append('featured', 'true');

    return this.request<{ events: Event[]; total: number }>(`/events?${query.toString()}`);
  }

  async getEventById(id: string): Promise<{ event: Event }> {
    return this.request<{ event: Event }>(`/events/${id}`);
  }

  async createEvent(payload: Partial<Event>): Promise<{ event: Event; message: string }> {
    return this.request<{ event: Event; message: string }>('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Registrations & Ticketing
  async registerFree(eventId: string, ticketTypeId?: string): Promise<{ ticket: Ticket; message: string }> {
    return this.request<{ ticket: Ticket; message: string }>(`/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify({ ticketTypeId }),
    });
  }

  async createPaymentOrder(eventId: string, ticketTypeId: string, quantity = 1): Promise<any> {
    return this.request<any>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ eventId, ticketTypeId, quantity }),
    });
  }

  async verifyPayment(orderId: string, bookingId: string, paymentId?: string): Promise<{ success: boolean; ticket: Ticket; message: string }> {
    return this.request<{ success: boolean; ticket: Ticket; message: string }>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ orderId, bookingId, paymentId }),
    });
  }

  async getMyTickets(): Promise<{ tickets: Ticket[] }> {
    return this.request<{ tickets: Ticket[] }>('/users/me/tickets');
  }

  async getTicketById(id: string): Promise<{ ticket: Ticket }> {
    return this.request<{ ticket: Ticket }>(`/tickets/${id}`);
  }

  // QR Scanner for Organizers
  async verifyQrTicket(payload: { qrPayload?: string; ticketNumber?: string }): Promise<any> {
    return this.request<any>('/tickets/verify-qr', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Travel & Matching
  async saveTravelPlan(plan: Partial<TravelPlan>): Promise<{ plan: TravelPlan; message: string }> {
    return this.request<{ plan: TravelPlan; message: string }>('/travel-plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  }

  async getMyTravelPlans(): Promise<{ plans: TravelPlan[] }> {
    return this.request<{ plans: TravelPlan[] }>('/travel-plans/my');
  }

  async getTravelMatches(eventId?: string, timeWindowMinutes = 45): Promise<{
    userPlan: TravelPlan | null;
    matches: {
      plan: TravelPlan;
      matchScore: number;
      distanceKm: number;
      timeDiffMinutes: number;
      matchReasons: string[];
    }[];
    count: number;
  }> {
    const query = new URLSearchParams();
    if (eventId) query.append('eventId', eventId);
    query.append('timeWindowMinutes', timeWindowMinutes.toString());
    return this.request<any>(`/travel-plans/matches?${query.toString()}`);
  }

  // Groups & Chat
  async getGroups(params: { eventId?: string; search?: string } = {}): Promise<{ groups: TravelGroup[]; count: number }> {
    const query = new URLSearchParams();
    if (params.eventId && params.eventId !== 'all') query.append('eventId', params.eventId);
    if (params.search) query.append('search', params.search);
    return this.request<{ groups: TravelGroup[]; count: number }>(`/groups?${query.toString()}`);
  }

  async getGroupById(id: string): Promise<{ group: TravelGroup }> {
    return this.request<{ group: TravelGroup }>(`/groups/${id}`);
  }

  async createGroup(payload: Partial<TravelGroup>): Promise<{ group: TravelGroup; message: string }> {
    return this.request<{ group: TravelGroup; message: string }>('/groups', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async joinGroup(groupId: string, message?: string): Promise<any> {
    return this.request<any>(`/groups/${groupId}/join`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async respondGroupRequest(groupId: string, requestId: string, action: 'accepted' | 'rejected'): Promise<any> {
    return this.request<any>(`/groups/${groupId}/requests/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  async leaveGroup(groupId: string): Promise<any> {
    return this.request<any>(`/groups/${groupId}/leave`, {
      method: 'POST',
    });
  }

  async getGroupMessages(groupId: string): Promise<{ messages: GroupMessage[] }> {
    return this.request<{ messages: GroupMessage[] }>(`/groups/${groupId}/messages`);
  }

  async sendGroupMessage(groupId: string, content: string): Promise<{ message: GroupMessage }> {
    return this.request<{ message: GroupMessage }>(`/groups/${groupId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Notifications
  async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    return this.request<{ notifications: Notification[]; unreadCount: number }>('/notifications');
  }

  async markNotificationRead(id: string): Promise<any> {
    return this.request<any>(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead(): Promise<any> {
    return this.request<any>('/notifications/read-all', { method: 'POST' });
  }

  // Dashboards
  async getOrganizerDashboard(): Promise<any> {
    return this.request<any>('/organizer/dashboard');
  }

  async getAdminDashboard(): Promise<any> {
    return this.request<any>('/admin/dashboard');
  }

  async approveEvent(id: string): Promise<any> {
    return this.request<any>(`/admin/events/${id}/approve`, { method: 'PUT' });
  }

  async rejectEvent(id: string, reason?: string): Promise<any> {
    return this.request<any>(`/admin/events/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async suspendUser(id: string): Promise<any> {
    return this.request<any>(`/admin/users/${id}/suspend`, { method: 'PUT' });
  }

  async submitReport(payload: { targetType: string; targetId: string; targetName: string; reason: string }): Promise<any> {
    return this.request<any>('/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiService();
