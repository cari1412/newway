import axios from 'axios';

const API_URL = 'https://web.sexystyle.site';

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

export type PaymentMethod = 'ton' | 'crypto';

interface APIResponse<T> {
  success: boolean;
  errorCode: string | null;
  errorMsg: string | null;
  data?: T;
  obj?: {
    packageList?: T;
    countries?: T;
  };
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 Request:', {
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      url: error.config?.url,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const api = {
  async getPackages(location?: string): Promise<Package[]> {
    try {
      const response = await apiClient.post<APIResponse<Package[]>>('/api/v1/open/package/list', {
        locationCode: location || '',
        type: 'BASE'
      });

      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to fetch packages');
      }

      return response.data.obj?.packageList || response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      throw error;
    }
  },

  async getCountries(): Promise<CountryData[]> {
    try {
      const response = await apiClient.post<APIResponse<CountryData[]>>('/api/v1/open/package/countries');
      
      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to fetch countries');
      }

      return response.data.obj?.countries || [];
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      throw error;
    }
  },

  async createPayment(
    transactionId: string, 
    amount: number, 
    packageId: string,
    paymentMethod: PaymentMethod = 'ton',
    asset: string = 'TON'
  ): Promise<TonPayment | CryptoPayment> {
    try {
      const response = await apiClient.post<APIResponse<TonPayment | CryptoPayment>>('/api/v1/open/payments/create', {
        transactionId,
        amount: paymentMethod === 'ton' 
          ? Math.round(amount * 1000000000).toString() 
          : amount.toString(),
        packageId,
        paymentMethod,
        asset
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.errorMsg || 'Failed to create payment');
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to create payment:', error);
      throw error;
    }
  },

  async verifyPayment(
    transactionId: string,
    paymentMethod: PaymentMethod = 'ton'
  ): Promise<boolean> {
    try {
      const response = await apiClient.post<APIResponse<{verified: boolean}>>('/api/v1/open/payments/verify', {
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
      await apiClient.post<APIResponse<any>>('/api/v1/open/package/log-selection', {
        selectedId: packageId
      });
    } catch (error) {
      console.error('Failed to log package selection:', error);
      // Не выбрасываем ошибку, так как это некритичная операция
    }
  },

  async createOrder(transactionId: string, packageCode: string): Promise<{orderNo: string}> {
    try {
      const response = await apiClient.post<APIResponse<{orderNo: string}>>('/api/v1/open/esim/order', {
        transactionId,
        packageInfoList: [{
          packageCode,
          count: 1
        }]
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.errorMsg || 'Failed to create order');
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }
};