import axios from 'axios';
import { calculateRetailPrice } from '@/utils/price';

const API_URL = 'https://api.sexystyle.site';

export interface Package {
  id: string;
  name: string;
  data: string;
  validity: string;
  price: number;
  retailPrice?: number;
  location: string[];
  description: string;
  features: string[];
  smsStatus: number;
  operatorList: OperatorInfo[];
}

export interface OperatorInfo {
  operatorName: string;
  networkType: string;
}

export interface TonPayment {
  address: string;
  amount: string;
  payload: string;
}

interface APIResponse<T> {
  success: boolean;
  errorCode: string | null;
  errorMsg: string | null;
  data?: T;
  obj?: {
    packageList?: T;
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

      let packages: Package[] = [];
      if (response.data.obj?.packageList) {
        packages = response.data.obj.packageList;
      } else if (response.data.data) {
        packages = response.data.data;
      }

      return packages.map(pkg => ({
        ...pkg,
        retailPrice: Math.round(calculateRetailPrice(pkg.price / 100) * 100)
      }));
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      throw error;
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
  },

  async getOrderStatus(orderNo: string): Promise<{status: string; payment: boolean}> {
    try {
      const response = await apiClient.get<APIResponse<{status: string; payment: boolean}>>(`/api/v1/open/orders/${orderNo}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.errorMsg || 'Failed to get order status');
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to get order status:', error);
      throw error;
    }
  },

  async createPayment(transactionId: string, amount: number, packageId: string): Promise<TonPayment> {
    try {
      const response = await apiClient.post<APIResponse<TonPayment>>('/api/v1/open/payments/create', {
        transactionId,
        amount: Math.round(amount).toString(),
        packageId
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

  async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      const response = await apiClient.post<APIResponse<{verified: boolean}>>('/api/v1/open/payments/verify', {
        transactionId
      });

      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to verify payment');
      }

      return response.data.data?.verified || false;
    } catch (error) {
      console.error('Failed to verify payment:', error);
      throw error;
    }
  }
};