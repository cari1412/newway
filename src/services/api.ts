import axios from 'axios';
import { calculateRetailPrice } from '@/utils/price';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.sexystyle.site';

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

export interface OrderPackage {
  packageCode: string;
  count: number;
  price: number;
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
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
});

apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 Request:', { url: config.url, method: config.method, data: config.data });
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Response Error:', { 
      url: error.config?.url,
      message: error.message,
      response: error.response?.data 
    });
    return Promise.reject(error);
  }
);

export const api = {
  async getPackages(location?: string): Promise<Package[]> {
    try {
      const response = await apiClient.get<APIResponse<Package[]>>('/api/v1/packages', {
        params: { location }
      });

      const packages = response.data.data || response.data.obj?.packageList || [];
      return packages.map(pkg => {
        const calculatedPrice = calculateRetailPrice(pkg.price);
        return {
          ...pkg,
          retailPrice: calculatedPrice,
          price: calculatedPrice
        };
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch packages');
    }
  },

  async createOrder(transactionId: string, selectedPackages: OrderPackage[]): Promise<any> {
    try {
      // Считаем общую сумму заказа
      const totalAmount = selectedPackages.reduce((sum, pkg) => sum + (pkg.count * pkg.price), 0);
      
      // Создаем платеж
      const payment = await this.createPayment(transactionId, totalAmount);
      
      // Создаем заказ
      const response = await apiClient.post<APIResponse<any>>('/api/v1/orders', {
        transactionId,
        packages: selectedPackages,
        paymentInfo: payment
      });

      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to create order');
      }

      return { ...response.data.data, payment };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create order');
    }
  },

  async getOrderStatus(orderNo: string): Promise<{ status: string; payment?: PaymentInfo }> {
    try {
      const response = await apiClient.get<APIResponse<{ status: string; payment?: PaymentInfo }>>(
        `/api/v1/orders/${orderNo}`
      );

      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to get order status');
      }

      return response.data.data || { status: '' };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get order status');
    }
  },

  async createPayment(orderId: string, amount: number): Promise<PaymentInfo> {
    try {
      const response = await apiClient.post<APIResponse<PaymentInfo>>('/api/v1/payments/create', {
        orderId,
        amount: amount.toString()
      });

      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to create payment');
      }

      return response.data.data!;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create payment');
    }
  },

  async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      const response = await apiClient.post<APIResponse<{ verified: boolean }>>('/api/v1/payments/verify', {
        transactionId
      });

      return response.data.data?.verified || false;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to verify payment');
    }
  }
};