import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Notification } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  notifications: Notification[];
  unreadNotificationsCount: number;
  login: (email: string) => Promise<void>;
  register: (payload: Partial<User> & { password?: string }) => Promise<void>;
  logout: () => void;
  switchDemoAccount: (role?: string, userId?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchCurrentUser = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch (err) {
      console.warn('Could not load user, attempting fallback demo student:', err);
      try {
        const demoRes = await api.switchDemo('student', 'usr-student-1');
        setUser(demoRes.user);
      } catch (fallbackErr) {
        console.error('Failed to init user', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications);
    } catch (err) {
      console.warn('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 12000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email);
      setUser(data.user);
      await refreshNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: Partial<User> & { password?: string }) => {
    setIsLoading(true);
    try {
      const data = await api.register(payload);
      setUser(data.user);
      await refreshNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('hopscot_token');
    // Default back to guest or first student
    switchDemoAccount('student', 'usr-student-1');
  };

  const switchDemoAccount = async (role?: string, userId?: string) => {
    setIsLoading(true);
    try {
      const data = await api.switchDemo(role, userId);
      setUser(data.user);
      await refreshNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        notifications,
        unreadNotificationsCount,
        login,
        register,
        logout,
        switchDemoAccount,
        refreshProfile,
        refreshNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
