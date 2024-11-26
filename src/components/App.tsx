import { useLaunchParams, miniApp, useSignal } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';

// Import new components
import { CountryList } from '../pages/CountryList/CountryList';
import { CountryDetails } from '../pages/CountryDetails/CountryDetails';
import { PlanDetails } from '../pages/PlanDetails/PlanDetails';

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
    >
      <HashRouter>
        <Routes>
          <Route path="/" element={<CountryList />} />
          <Route path="/country/:countryId" element={<CountryDetails />} />
          <Route path="/plan/:planId" element={<PlanDetails />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AppRoot>
  );
}
