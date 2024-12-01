// hooks/useCart.ts
import { useState, useEffect } from 'react';
import { Package } from '@/services/api';
import { toast } from 'react-hot-toast';

export const useCart = () => {
  const [items, setItems] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Загружаем корзину из localStorage при инициализации
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (item: Package) => {
    setItems(prev => {
      const newItems = [...prev, item];
      localStorage.setItem('cart', JSON.stringify(newItems));
      toast.success('План добавлен в корзину');
      return newItems;
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.id !== itemId);
      localStorage.setItem('cart', JSON.stringify(newItems));
      toast.success('План удален из корзины');
      return newItems;
    });
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const checkoutCart = async () => {
    setIsLoading(true);
    try {
      // Здесь будет логика оформления заказа
      toast.success('Заказ оформлен успешно');
      clearCart();
    } catch (error) {
      toast.error('Ошибка при оформлении заказа');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items,
    addToCart,
    removeFromCart,
    getTotalPrice,
    isLoading,
    checkoutCart
  };
};