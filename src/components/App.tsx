// App.tsx
import { useLaunchParams, miniApp, useSignal } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import components
import { CountryList } from '@/pages/CountryList/CountryList';
import { CountryDetails } from '@/pages/CountryDetails/CountryDetails';
import PlanDetails from '@/pages/PlanDetails/PlanDetails';
import { Cart } from '@/pages/Cart/Cart';
import { Profile } from '../pages/Profile/Profile';
import { NavigationBar } from '@/components/NavigationBar';
import ApiDebugger from './ApiDebugger';

// CartProvider для управления состоянием корзины
import { CartProvider } from '../contexts/CartContext';

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  return (
    <CartProvider>
      <AppRoot
        appearance={isDark ? 'dark' : 'light'}
        platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
      >
        <HashRouter>
          <div style={{ paddingBottom: '70px' }}> {/* Отступ для навигационной панели */}
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: isDark ? '#333' : '#fff',
                  color: isDark ? '#fff' : '#333',
                },
              }} 
            />
            <Routes>
              <Route path="/" element={<CountryList />} />
              <Route path="/country/:countryId" element={<CountryDetails />} />
              <Route path="/plan/:planId" element={<PlanDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <NavigationBar />
          </div>
        </HashRouter>
        {import.meta.env.DEV && <ApiDebugger />}
      </AppRoot>
    </CartProvider>
  );
}