import { TonConnectUI, THEME } from '@tonconnect/ui';

const manifestUrl = 'https://api.sexystyle.site/tonconnect-manifest.json';

// Безопасное получение цветовой схемы
const getColorScheme = () => {
  try {
    return window.Telegram?.WebApp?.colorScheme === 'dark' ? THEME.DARK : THEME.LIGHT;
  } catch {
    return THEME.LIGHT;
  }
};

export const tonConnect = new TonConnectUI({
  manifestUrl,
  actionsConfiguration: {
    twaReturnUrl: 'https://t.me/esim4you_bot',
  },
  uiPreferences: {
    theme: getColorScheme(),
  },
});

export const createTonTransfer = async (payment: {
  address: string;
  amount: string;
  payload: string;
}) => {
  try {
    if (!tonConnect.connected) {
      throw new Error('TON Wallet not connected');
    }

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
      messages: [
        {
          address: payment.address,
          amount: payment.amount,
          payload: payment.payload,
        },
      ],
    };

    const result = await tonConnect.sendTransaction(transaction);
    return result;
  } catch (error) {
    console.error('TON transfer error:', error);
    throw error;
  }
};