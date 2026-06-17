'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  mfaRequired: boolean;
  mfaUserId: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; mfaRequired?: boolean; error?: string }>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash?: string;
    password?: string;
    role?: string;
    institutionId?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  verifyMfa: (token: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState<boolean>(false);
  const [mfaUserId, setMfaUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Attempt refresh
          await handleTokenRefresh();
        }
      } catch (err) {
        console.error('Auth verification failed', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleTokenRefresh = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      localStorage.removeItem('accessToken');
      setUser(null);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (res.ok) {
        const { accessToken } = await res.json();
        localStorage.setItem('accessToken', accessToken);
        
        // Fetch profile with new token
        const profileRes = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (profileRes.ok) {
          const userData = await profileRes.json();
          setUser(userData);
        }
      } else {
        // Refresh token failed/expired
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      }
    } catch (err) {
      console.error('Token refresh request failed', err);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return { success: false, error: data.error || 'Login failed' };
      }

      if (data.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(data.userId);
        return { success: true, mfaRequired: true };
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError('Connection refused');
      return { success: false, error: 'Connection refused' };
    }
  };

  const register = async (regData: any) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(regData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return { success: false, error: data.error || 'Registration failed' };
      }

      return { success: true };
    } catch (err) {
      setError('Connection refused');
      return { success: false, error: 'Connection refused' };
    }
  };

  const verifyMfa = async (token: string) => {
    setError(null);
    if (!mfaUserId) {
      return { success: false, error: 'No active MFA flow' };
    }

    try {
      const res = await fetch(`${API_URL}/auth/mfa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: mfaUserId, token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'MFA Verification failed');
        return { success: false, error: data.error || 'MFA Verification failed' };
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
      setMfaRequired(false);
      setMfaUserId(null);
      return { success: true };
    } catch (err) {
      setError('Connection refused');
      return { success: false, error: 'Connection refused' };
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (err) {
      console.error('Logout request error', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setMfaRequired(false);
      setMfaUserId(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        mfaRequired,
        mfaUserId,
        login,
        register,
        logout,
        verifyMfa,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
