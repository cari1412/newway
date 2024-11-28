// src/providers/TonConnectProvider.tsx
import React, { useEffect, useState } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const manifestUrl = 'https://api.sexystyle.site/tonconnect-manifest.json';

interface TonConnectProviderProps {
  children: React.ReactNode;
}

export const TonConnectProvider: React.FC<TonConnectProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Проверяем, зарегистрирован ли уже tc-root
    const isTcRootRegistered = !!customElements.get('tc-root');
    if (!isTcRootRegistered) {
      setIsReady(true);
    } else {
      // Если элемент уже зарегистрирован, даем время на его очистку
      setTimeout(() => setIsReady(true), 100);
    }
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
};