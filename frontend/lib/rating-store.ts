import { create } from 'zustand';
import { ratingsAPI } from './api';

interface RatingState {
  userRatings: Record<string, number>; // { productId: rating }
  isLoading: boolean;
  
  // Actions
  fetchUserRatings: () => Promise<void>;
  setRating: (productId: string, rating: number, review?: string) => Promise<void>;
  clearRatings: () => void;
}

export const useRatingStore = create<RatingState>((set, get) => ({
  userRatings: {},
  isLoading: false,

  fetchUserRatings: async () => {
    if (get().isLoading) return;
    try {
      set({ isLoading: true });
      const response = await ratingsAPI.getUserAllRatings();
      if (response.data?.success) {
        set({ userRatings: response.data.data });
      }
    } catch (error) {
      console.error('Failed to fetch user ratings:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setRating: async (productId: string, rating: number, review?: string) => {
    const previousRatings = get().userRatings;
    
    // Optimistic update
    set({
      userRatings: {
        ...previousRatings,
        [productId]: rating,
      },
    });

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        throw new Error('Authentication required');
      }
      await ratingsAPI.createRating({ productId, rating, review });
    } catch (error: any) {
      console.error('Failed to save rating:', error);
      // Revert on failure
      set({ userRatings: previousRatings });
      if (error.response?.status === 401 || error.message === 'Authentication required') {
        // Optionally clear ratings if session is definitely invalid
        get().clearRatings();
      }
      throw error;
    }
  },

  clearRatings: () => {
    set({ userRatings: {} });
  },
}));
