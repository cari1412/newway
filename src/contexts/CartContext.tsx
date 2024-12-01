// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Package } from '@/services/api';
import { toast } from 'react-hot-toast';

interface CartContextType {
  items: Package[];
  addToCart: (item: Package) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  isLoading: boolean;
  checkoutCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем корзину из localStorage при первом рендере
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Сохраняем корзину в localStorage при каждом изменении
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Package) => {
    setItems(prev => {
      // Проверяем, нет ли уже такого товара в корзине
      if (prev.some(i => i.id === item.id)) {
        toast.error('Этот план уже в корзине');
        return prev;
      }
      toast.success('План добавлен в корзину');
      return [...prev, item];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.id !== itemId);
      toast.success('План удален из корзины');
      return newItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total +  item.price, 0);
  };

  const checkoutCart = async () => {
    setIsLoading(true);
    try {
      // Здесь будет логика оформления заказа
      // Пока просто очищаем корзину
      clearCart();
      toast.success('Заказ успешно оформлен');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Ошибка при оформлении заказа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider 
      value={{ 
        items, 
        addToCart, 
        removeFromCart, 
        clearCart, 
        getTotalPrice,
        isLoading,
        checkoutCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Хук для использования корзины в компонентах
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};