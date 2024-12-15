// hooks/useCart.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Package } from '@/services/api';
import { toast } from 'react-hot-toast';

interface CartStore {
  items: Package[];
  isLoading: boolean;
  addToCart: (item: Package) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  setIsLoading: (loading: boolean) => void;
  checkoutCart: () => Promise<void>;
}

export const useCart = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        isLoading: false,

        addToCart: (item) =>
          set((state) => {
            if (state.items.some((i) => i.id === item.id)) {
              toast.error('Этот план уже в корзине');
              return state;
            }

            toast.success('План добавлен в корзину');
            return { items: [...state.items, item] };
          }),

        removeFromCart: (itemId) =>
          set((state) => {
            toast.success('План удален из корзины');
            return { 
              items: state.items.filter((item) => item.id !== itemId) 
            };
          }),

        clearCart: () => set({ items: [] }),

        getTotalPrice: () => {
          const state = get();
          return state.items.reduce((total, item) => total + item.price, 0);
        },

        setIsLoading: (loading) => set({ isLoading: loading }),

        checkoutCart: async () => {
          const state = get();
          state.setIsLoading(true);
          try {
            // Здесь будет логика оформления заказа
            toast.success('Заказ оформлен успешно');
            state.clearCart();
          } catch (error) {
            toast.error('Ошибка при оформлении заказа');
          } finally {
            state.setIsLoading(false);
          }
        },
      }),
      {
        name: 'cart-storage'
      }
    )
  )
);