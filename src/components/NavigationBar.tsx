// components/NavigationBar.tsx
import { useLocation, useNavigate } from 'react-router-dom';

export const NavigationBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
      padding: '0 8px'
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
          opacity: location.pathname.includes('/cart') ? 1 : 0.5
        }}
      >
        <span style={{ fontSize: '20px', marginBottom: '2px' }}>🛒</span>
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
    </div>
  );
};