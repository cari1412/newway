// components/NavigationBar.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import React from 'react';

export const NavigationBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items } = useCart();
  const [count, setCount] = React.useState(items.length);

  // Отслеживаем изменения количества товаров
  React.useEffect(() => {
    setCount(items.length);
  }, [items]);

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 0, 
      left: 0,
      right: 0,
      width: '100%', 
      background: 'var(--tg-theme-bg-color)',
      borderTop: '1px solid var(--tg-theme-hint-color)',
      height: '49px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 8px',
      zIndex: 1000
    }}>
      <div 
        onClick={() => navigate('/')}
        style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          cursor: 'pointer',
          opacity: location.pathname === '/' ? 1 : 0.5
        }}
      >
        <span style={{ fontSize: '20px', marginBottom: '2px' }}>🌍</span>
        <span style={{ fontSize: '12px' }}>Планы</span>
      </div>

      <div 
        onClick={() => navigate('/cart')}
        style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          cursor: 'pointer',
          opacity: location.pathname.includes('/cart') ? 1 : 0.5,
          position: 'relative'
        }}
      >
        <div style={{ position: 'relative' }}>
          <span style={{ fontSize: '20px', marginBottom: '2px' }}>🛒</span>
          {count > 0 && (
            <div 
              key={count} // Добавляем key для перезапуска анимации
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
                color: 'var(--tg-theme-button-text-color, #ffffff)',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 'bold',
                animation: 'scale-in 0.2s ease-out'
              }}
            >
              {count}
            </div>
          )}
        </div>
        <span style={{ fontSize: '12px' }}>Корзина</span>
      </div>

      <div 
        onClick={() => navigate('/profile')}
        style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          cursor: 'pointer',
          opacity: location.pathname.includes('/profile') ? 1 : 0.5
        }}
      >
        <span style={{ fontSize: '20px', marginBottom: '2px' }}>👤</span>
        <span style={{ fontSize: '12px' }}>Профиль</span>
      </div>

      <style>
        {`
          @keyframes scale-in {
            from {
              transform: scale(0);
            }
            to {
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};