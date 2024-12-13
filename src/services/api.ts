// api.ts
import axios from 'axios';

const API_URL = 'https://web.sexystyle.site';

interface TelegramWebApp {
  openInvoice(url: string): void;
  close(): void;
  ready(): void;
  expand(): void;
  MainButton: {
    text: string;
    onClick(callback: () => void): void;
    show(): void;
    hide(): void;
  };
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

// Остальные интерфейсы
export interface PaymentRequestParams {
  transactionId: string;
  packageId: string;
  amount: string | number;
  asset: string;
  currency_type: 'crypto' | 'fiat';
  paymentMethod: 'ton' | 'crypto';
}

export interface PaymentResponse {
  success: boolean;
  invoice_id: number;
  amount: string;
  asset: string;
  status: string;
  bot_invoice_url: string;
  mini_app_invoice_url: string;
  web_app_invoice_url: string;
  hash: string;
}

export interface Package {
  id: string;
  name: string;
  data: string;
  validity: string;
  price: number;
  location: string[];
  description: string;
  features: string[];
  smsStatus: number;
  operatorList: OperatorInfo[];
  transactionId?: string;
  paymentAddress?: string;
  packageCode: string;
  slug: string;
  currencyCode: string;
  volume: number;
  unusedValidTime: number;
  duration: number;
  durationUnit: string;
  activeType: number;
  favorite: boolean;
  retailPrice: number;
  speed: string;
  locationNetworkList: LocationNetwork[];
}

export interface OperatorInfo {
  operatorName: string;
  networkType: string;
}

export interface LocationNetwork {
  locationName: string;
  locationLogo: string;
  operatorList: OperatorInfo[];
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 Request:', config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const api = {
  async createPayment(params: PaymentRequestParams): Promise<PaymentResponse> {
    try {
      if (!params.asset || !params.amount || !params.packageId || !params.transactionId) {
        throw new Error('Missing required parameters');
      }

      const requestData: PaymentRequestParams = {
        transactionId: params.transactionId,
        packageId: params.packageId,
        amount: params.amount.toString(),
        asset: params.asset.toUpperCase(),
        currency_type: 'crypto',
        paymentMethod: params.asset.toUpperCase() === 'TON' ? 'ton' : 'crypto'
      };

      const response = await apiClient.post<{
        success: boolean;
        data: PaymentResponse;
      }>('/api/v1/open/payments/create', requestData);

      if (!response.data.success || !response.data.data) {
        throw new Error('Payment creation failed');
      }

      return response.data.data;
    } catch (error) {
      console.error('Payment creation error:', error);
      throw error;
    }
  },

  async getPackages(location?: string): Promise<Package[]> {
    try {
      const response = await apiClient.post('/api/v1/open/package/list', {
        locationCode: location || '',
        type: 'BASE'
      });

      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to fetch packages');
      }

      return response.data.obj?.packageList || [];
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      throw error;
    }
  },

  async logPackageSelection(packageId: string): Promise<void> {
    try {
      await apiClient.post('/api/v1/open/package/log-selection', {
        selectedId: packageId
      });
    } catch (error) {
      console.error('Failed to log package selection:', error);
    }
  }
};