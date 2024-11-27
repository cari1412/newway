import axios from 'axios';
import { calculateRetailPrice } from '@/utils/price';

const API_URL = 'https://api.sexystyle.site';

export interface Package {
  id: string;
  name: string;
  data: string;
  validity: string;
  price: number;
  retailPrice: number;
  location: string[];
  description: string;
  features: string[];
  smsStatus: number;
}

interface OrderPackageInfo {
  packageCode: string;
  count: number;
}

interface PaymentInfo {
  contractAddress: string;
  amount: string;
  transactionId: string;
}

interface APIResponse<T> {
  success: boolean;
  errorCode: string | null;
  errorMsg: string | null;
  data?: T;
  obj?: {
    packageList: T;
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
      params: config.params
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
      status: response.status
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      url: error.config?.url,
      message: error.message,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

export const api = {
  async getPackages(location?: string): Promise<Package[]> {
    try {
      const response = await apiClient.get<APIResponse<Package[]>>('/api/packages', {
        params: location ? { location } : undefined
      });

      let packages: Package[] = [];

      if (response.data.data) {
        packages = response.data.data;
      } else if (response.data.obj?.packageList) {
        packages = response.data.obj.packageList as Package[];
      }

      return packages.map(pkg => {
        const retailPrice = calculateRetailPrice(pkg.price);
        return {
          ...pkg,
          retailPrice,
          price: retailPrice
        };
      });

    } catch (error) {
      console.error('Failed to fetch packages:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch packages');
    }
  },

  async createOrder(transactionId: string, packages: OrderPackageInfo[]): Promise<any> {
    try {
      const response = await apiClient.post<APIResponse<any>>('/api/orders', {
        transactionId,
        packages
      });

      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to create order');
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create order');
    }
  },

  async getOrderStatus(orderNo: string): Promise<{ status: string; payment?: PaymentInfo }> {
    try {
      const response = await apiClient.get<APIResponse<{ status: string; payment?: PaymentInfo }>>(`/api/orders/${orderNo}`);

      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to get order status');
      }

      return response.data.data || { status: '' };
    } catch (error) {
      console.error('Failed to get order status:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get order status');
    }
  },

  async createPayment(orderId: string, amount: number): Promise<PaymentInfo> {
    try {
      const response = await apiClient.post<APIResponse<PaymentInfo>>('/api/payments/create', {
        orderId,
        amount
      });

      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to create payment');
      }

      return response.data.data!;
    } catch (error) {
      console.error('Failed to create payment:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create payment');
    }
  },

  async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      const response = await apiClient.post<APIResponse<{ verified: boolean }>>('/api/payments/verify', {
        transactionId
      });

      return response.data.data?.verified || false;
    } catch (error) {
      console.error('Failed to verify payment:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to verify payment');
    }
  }
};