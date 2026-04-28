import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ComparisonItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface ComparisonState {
  items: ComparisonItem[];
  addItem: (item: ComparisonItem) => void;
  removeItem: (id: string) => void;
  clearComparison: () => void;
  hasItem: (id: string) => boolean;
  getItemCount: () => number;
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const exists = state.items.find((i) => i.id === item.id);
          if (!exists && state.items.length < 4) {
            return { items: [...state.items, item] };
          }
          return state;
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      clearComparison: () => set({ items: [] }),

      hasItem: (id) => get().items.some((i) => i.id === id),

      getItemCount: () => get().items.length,
    }),
    {
      name: 'comparison-storage',
    }
  )
);
