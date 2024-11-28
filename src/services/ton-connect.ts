// ton-connect.ts
import { TonConnectUI } from '@tonconnect/ui';

const manifestUrl = 'https://api.sexystyle.site/tonconnect-manifest.json';

export const tonConnect = new TonConnectUI({
  manifestUrl,
  buttonRootId: 'ton-connect-button',
});

export interface TonPayment {
  address: string;
  amount: string;
  payload: string;
}

export const createTonTransfer = async (payment: TonPayment) => {
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