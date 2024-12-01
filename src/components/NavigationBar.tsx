// components/NavigationBar.tsx
import { List, Section, Cell } from '@telegram-apps/telegram-ui';
import { useLocation, useNavigate } from 'react-router-dom';

export const NavigationBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 0, 
      width: '100%', 
      background: 'var(--tg-theme-bg-color)',
      borderTop: '1px solid var(--tg-theme-hint-color)',
      padding: '8px 0'
    }}>
      <List>
        <Section>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <Cell
              onClick={() => navigate('/')}
              style={{ 
                flex: 1, 
                textAlign: 'center',
                opacity: !location.pathname.includes('/cart') && !location.pathname.includes('/profile') ? 1 : 0.5,
                padding: '4px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '24px' }}>🌍</span>
                <span style={{ fontSize: '12px' }}>Планы</span>
              </div>
            </Cell>
            
            <Cell
              onClick={() => navigate('/cart')}
              style={{ 
                flex: 1, 
                textAlign: 'center',
                opacity: location.pathname.includes('/cart') ? 1 : 0.5,
                padding: '4px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '24px' }}>🛒</span>
                <span style={{ fontSize: '12px' }}>Корзина</span>
              </div>
            </Cell>
            
            <Cell
              onClick={() => navigate('/profile')}
              style={{ 
                flex: 1, 
                textAlign: 'center',
                opacity: location.pathname.includes('/profile') ? 1 : 0.5,
                padding: '4px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '24px' }}>👤</span>
                <span style={{ fontSize: '12px' }}>Профиль</span>
              </div>
            </Cell>
          </div>
        </Section>
      </List>
    </div>
  );
};