"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, LoginPayload, RegisterPayload } from '../api/auth';
import { usersApi, UserProfile } from '../api/users';
import { walletApi, WalletDetails } from '../api/wallet';
import { vehiclesApi, Vehicle } from '../api/vehicles';
import { tokenStorage } from '@/src/lib/auth/token-storage';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  priority: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  read: boolean;
  createdAt: string;
}

interface SessionContextType {
  user: UserProfile | null;
  wallet: WalletDetails | null;
  vehicles: Vehicle[];
  notifications: NotificationItem[];
  loading: boolean;
  login: (payload: LoginPayload) => Promise<any>;
  register: (payload: RegisterPayload) => Promise<any>;
  logout: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  refreshVehicles: () => Promise<void>;
  reloadProfile: () => Promise<void>;
  addNotification: (title: string, body: string, priority?: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR') => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<WalletDetails | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'welcome',
      title: 'Welcome to Carpooling!',
      body: 'Get started by finding a ride or registering your vehicle.',
      priority: 'INFO',
      read: false,
      createdAt: new Date().toISOString(),
    }
  ]);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on load
  useEffect(() => {
    const initSession = async () => {
      if (typeof window !== 'undefined') {
        const token = tokenStorage.getAccessToken();
        if (token) {
          try {
            const profileRes = (await usersApi.getProfile()) as any;
            if (profileRes.success && profileRes.data) {
              setUser(profileRes.data);
              
              // Load wallet if employee
              if (profileRes.data.role === 'EMPLOYEE') {
                try {
                  const [walletRes, vehiclesRes] = (await Promise.all([
                    walletApi.myBalance(),
                    vehiclesApi.findAll(),
                  ])) as any[];
                  if (walletRes.success) setWallet(walletRes.data);
                  if (vehiclesRes.success) setVehicles(vehiclesRes.data);
                } catch (e) {
                  console.error('Error loading employee details:', e);
                }
              }
            }
          } catch (err) {
            console.error('Session restoration failed:', err);
            tokenStorage.clearTokens();
          }
        }
      }
      setLoading(false);
    };

    initSession();
  }, []);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const res = (await authApi.login(payload)) as any;
      if (res.success && res.data) {
        tokenStorage.setAccessToken(res.data.accessToken);
        tokenStorage.setRefreshToken(res.data.refreshToken);
        
        // Fetch full profile details
        const profileRes = (await usersApi.getProfile()) as any;
        if (profileRes.success && profileRes.data) {
          setUser(profileRes.data);
          
          if (profileRes.data.role === 'EMPLOYEE') {
            const [walletRes, vehiclesRes] = (await Promise.all([
              walletApi.myBalance(),
              vehiclesApi.findAll(),
            ])) as any[];
            if (walletRes.success) setWallet(walletRes.data);
            if (vehiclesRes.success) setVehicles(vehiclesRes.data);
          }
        }
        setLoading(false);
        return res.data;
      }
      throw new Error('Invalid login response');
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      const res = (await authApi.register(payload)) as any;
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await (authApi.logout() as any);
    } catch (err) {
      console.error('Backend logout failed:', err);
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
      setWallet(null);
      setVehicles([]);
      setLoading(false);
    }
  };

  const refreshWallet = async () => {
    try {
      const res = (await walletApi.myBalance()) as any;
      if (res.success) {
        setWallet(res.data);
      }
    } catch (e) {
      console.error('Error refreshing wallet:', e);
    }
  };

  const refreshVehicles = async () => {
    try {
      const res = (await vehiclesApi.findAll()) as any;
      if (res.success) {
        setVehicles(res.data);
      }
    } catch (e) {
      console.error('Error refreshing vehicles:', e);
    }
  };

  const reloadProfile = async () => {
    try {
      const res = (await usersApi.getProfile()) as any;
      if (res.success) {
        setUser(res.data);
      }
    } catch (e) {
      console.error('Error reloading profile:', e);
    }
  };

  const addNotification = (
    title: string,
    body: string,
    priority: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' = 'INFO'
  ) => {
    const newNotif: NotificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      body,
      priority,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        wallet,
        vehicles,
        notifications,
        loading,
        login,
        register,
        logout,
        refreshWallet,
        refreshVehicles,
        reloadProfile,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
