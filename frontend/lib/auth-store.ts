import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';
import { useRatingStore } from './rating-store';

interface User {
  _id: string;
  email: string;
  role: 'user' | 'admin';
  name?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<void>;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: true,

      setAuth: (user, token, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', token);
          localStorage.setItem('refreshToken', refreshToken);
        }
        set({ isAuthenticated: true, user, token, isLoading: false });
        // Sync ratings - wrap in setTimeout to avoid "Should not already be working" error
        setTimeout(() => {
          useRatingStore.getState().fetchUserRatings();
        }, 0);
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
        }
        set({ isAuthenticated: false, user: null, token: null, isLoading: false });
        // Clear ratings
        useRatingStore.getState().clearRatings();
      },

      checkAuth: async () => {
        set({ isLoading: true });
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken');
          if (token) {
            try {
              // Fetch latest profile to ensure role is accurate
              const response = await api.get('/customers/profile');
              if (response.data.success) {
                const userData = response.data.data;
                // Combine customer data with user ID and email
                set({ 
                  isAuthenticated: true, 
                  user: {
                    _id: userData.userId._id,
                    email: userData.userId.email,
                    role: userData.userId.role,
                    name: userData.name
                  }, 
                  token,
                  isLoading: false 
                });
                // Sync ratings - wrap in setTimeout
                setTimeout(() => {
                  useRatingStore.getState().fetchUserRatings();
                }, 0);
              } else {
                get().clearAuth();
              }
            } catch (error) {
              get().clearAuth();
            }
          } else {
            set({ isAuthenticated: false, isLoading: false });
          }
        }
      },

      isAdmin: () => {
        const { user, isAuthenticated } = get();
        return isAuthenticated && user?.role === 'admin';
      },
    }),
    {
      name: 'auth-storage',
      // Only persist basic info, checkAuth will refresh it
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        user: state.user, 
        token: state.token 
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.token) {
          try {
            const payload = JSON.parse(atob(state.token.split('.')[1]));
            if (payload.exp * 1000 < Date.now()) {
              // Token expired, clear auth asynchronously to avoid state update warning
              setTimeout(() => state.clearAuth(), 0);
            }
          } catch (e) {
            setTimeout(() => state.clearAuth(), 0);
          }
        }
      },
    }
  )
);
