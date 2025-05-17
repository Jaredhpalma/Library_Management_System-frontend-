// context/AppProvider.tsx
"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AppContextType {
  authToken: string | null;
  user: any;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => void;
  borrowBook: (bookId: number) => Promise<void>;
  returnBook: (transactionId: number) => Promise<void>;
  fetchUserTransactions: () => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initialize auth token from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
      fetchUserProfile(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        email,
        password
      });
      
      localStorage.setItem('authToken', response.data.token);
      setAuthToken(response.data.token);
      setUser(response.data.user);
      router.push(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        name,
        email,
        password,
        password_confirmation,
        role: 'user' // Default role is user
      });
      
      toast.success('Registration successful! Please login.');
      setIsLoading(false); // Stop loading after registration
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setUser(null);
    router.push('/auth');
  };

  const borrowBook = async (bookId: number) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
        book_id: bookId,
        type: 'borrow'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      toast.success('Book borrowed successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to borrow book');
      throw error;
    }
  };

  const returnBook = async (transactionId: number) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
        transaction_id: transactionId,
        type: 'return'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      toast.success('Book returned successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to return book');
      throw error;
    }
  };

  const fetchUserTransactions = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      return response.data.transactions;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
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
      borrowBook,
      returnBook,
      fetchUserTransactions
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