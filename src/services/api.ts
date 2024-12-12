import axios from 'axios';

const API_URL = 'https://web.sexystyle.site';

export type PaymentMethod = 'ton' | 'crypto';

// Types
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

export interface CountryData {
  locationCode: string;
  minPrice: number;
  plansCount: number;
}

export interface LocationNetwork {
  locationName: string;
  locationLogo: string;
  operatorList: OperatorInfo[];
}

export interface OperatorInfo {
  operatorName: string;
  networkType: string;
}

export interface TonPayment {
  payment_url: string;
  deepLink?: string;
  tonUrl?: string;
  paymentDetails: {
    amount: string;
    amountUsd: string;
    amountTon: string;
    tonRate: string;
  }
}

export interface CryptoPayment {
  bot_invoice_url: string;
  mini_app_invoice_url: string;
  web_app_invoice_url: string;
  invoice_id: number;
  status: string;
  hash: string;
  asset: string;
  amount: string;
}

// API Client setup
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      url: config.url,
      method: config.method,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const api = {
  async createPayment(
    transactionId: string,
    amount: number,
    packageId: string,
    asset: string,
    paymentMethod: PaymentMethod
  ) {
    try {
      const payload = {
        transactionId,
        packageId,
        amount: amount.toString(),
        asset,
        paymentMethod,
        currency_type: 'crypto'
      };

      console.log('Creating payment with payload:', payload);

      const response = await apiClient.post('/api/v1/open/payments/create', payload);

      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to create payment');
      }

      return response.data.data;
    } catch (error) {
      console.error('Payment creation failed:', error);
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

  async verifyPayment(
    transactionId: string,
    paymentMethod: PaymentMethod = 'crypto'
  ): Promise<boolean> {
    try {
      const response = await apiClient.post('/api/v1/open/payments/verify', {
        transactionId,
        paymentMethod
      });

      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to verify payment');
      }

      return response.data.data?.verified || false;
    } catch (error) {
      console.error('Failed to verify payment:', error);
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