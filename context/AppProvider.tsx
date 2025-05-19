"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AppContextType {
  authToken: string | null;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        });
        setAuthToken(token);
        setUser(response.data.user);
      } catch (error) {
        console.error('Failed to refresh auth:', error);
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setUser(null);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Get CSRF cookie first
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/sanctum/csrf-cookie`, {
        withCredentials: true
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`, 
        { email, password },
        {
          headers: { Accept: 'application/json' },
          withCredentials: true
        }
      );
      
      if (response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
        await refreshAuth();
        
        // Redirect based on role
        if (user?.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    setIsLoading(true);
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/sanctum/csrf-cookie`, {
        withCredentials: true
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`, 
        { name, email, password, password_confirmation },
        {
          headers: { Accept: 'application/json' },
          withCredentials: true
        }
      );
      
      toast.success('Registration successful! Please login.');
      setIsLoading(true);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, 
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json'
          },
          withCredentials: true
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      setAuthToken(null);
      setUser(null);
      router.push('/auth');
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{
      authToken,
      user,
      isLoading,
      login,
      register,
      logout,
      refreshAuth
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};