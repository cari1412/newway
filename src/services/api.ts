import axios from 'axios';

const API_URL = 'https://web.sexystyle.site';

// Types for Telegram WebApp
export interface TelegramWebApp {
  openInvoice(url: string): Promise<void>;
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

// Extend the global Window interface
declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

// Payment Types
export interface PaymentRequestParams {
  transactionId: string;
  packageId: string;
  amount: string;
  asset: string;
}

export interface PaymentResponseData {
  success: boolean;
  data?: {
    invoice_id: number;
    amount: string;
    asset: string;
    status: string;
    mini_app_url: string;
    hash: string;
  };
  errorCode?: string;
  errorMsg?: string;
}

// Package Types
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

// API Client Setup
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      message: error.message,
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

// API Methods
export const api = {
  async createPayment(params: PaymentRequestParams): Promise<PaymentResponseData> {
    try {
      // Validate required parameters
      if (!params.asset || !params.amount || !params.packageId || !params.transactionId) {
        throw new Error('Missing required payment parameters');
      }

      const requestData = {
        transactionId: params.transactionId,
        packageId: params.packageId,
        amount: params.amount.toString(),
        asset: params.asset.toUpperCase()
      };

      console.log('Creating payment with data:', requestData);

      const response = await apiClient.post<PaymentResponseData>('/api/crypto/invoice/create', requestData);

      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Payment creation failed');
      }

      console.log('Payment creation successful:', response.data);

      return response.data;
    } catch (error) {
      console.error('Payment creation failed:', error);
      throw error;
    }
  },

  async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{success: boolean; data: boolean}>('/api/crypto/verify', {
        transactionId
      });
      
      return response.data.success && response.data.data;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
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
      // Don't throw error for logging failures
    }
  }
};