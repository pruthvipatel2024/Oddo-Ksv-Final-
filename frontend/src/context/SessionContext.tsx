"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, LoginPayload, RegisterPayload } from '../services/api/auth.api';
import { usersApi, UserProfile } from '../services/api/users.api';
import { tokenStorage } from '@/src/lib/auth/token-storage';

interface SessionContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<any>;
  register: (payload: RegisterPayload) => Promise<any>;
  logout: () => Promise<void>;
  reloadProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from cookies/storage on load
  useEffect(() => {
    const initSession = async () => {
      if (typeof window !== 'undefined') {
        const token = tokenStorage.getAccessToken();
        if (token) {
          try {
            const profileRes = (await usersApi.getProfile()) as any;
            if (profileRes.success && profileRes.data) {
              setUser(profileRes.data);
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
      setLoading(false);
    }
  };

  const reloadProfile = async () => {
    try {
      const res = (await usersApi.getProfile()) as any;
      if (res.success && res.data) {
        setUser(profile => ({ ...profile, ...res.data }));
      }
    } catch (e) {
      console.error('Error reloading profile:', e);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        reloadProfile,
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
