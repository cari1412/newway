import { useLaunchParams, miniApp, useSignal } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Toaster } from 'react-hot-toast';

// Import components
import { CountryList } from '../pages/CountryList/CountryList';
import { CountryDetails } from '../pages/CountryDetails/CountryDetails';
import PlanDetails from '../pages/PlanDetails/PlanDetails';

// Манифест для TON Connect
const manifestUrl = 'https://api.sexystyle.site/tonconnect-manifest.json';

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <AppRoot
        appearance={isDark ? 'dark' : 'light'}
        platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
      >
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
        <HashRouter>
          <Routes>
            <Route path="/" element={<CountryList />} />
            <Route path="/country/:countryId" element={<CountryDetails />} />
            <Route path="/plan/:planId" element={<PlanDetails />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </HashRouter>
      </AppRoot>
    </TonConnectUIProvider>
  );
}
