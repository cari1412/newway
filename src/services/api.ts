import axios from 'axios';
import { calculateRetailPrice } from '@/utils/price';

const API_URL = 'https://api.sexystyle.site';

// Логгер для отладки запросов
const logRequest = (method: string, url: string, data?: any) => {
  console.log(`🚀 ${method} Request to: ${url}`, data ? { data } : '');
};

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

// Добавляем перехватчик для логирования всех запросов
apiClient.interceptors.request.use(config => {
  logRequest(config.method?.toUpperCase() || 'unknown', config.url || '', config.data);
  return config;
});

export const api = {
  async getPackages(location?: string): Promise<Package[]> {
    try {
      const response = await apiClient.get<APIResponse<Package[]>>('/api/v1/open/package/list', {
        params: { locationCode: location }
      });

      const packages = response.data.obj?.packageList || [];
      return packages.map(pkg => {
        const calculatedPrice = calculateRetailPrice(pkg.price);
        return {
          ...pkg,
          retailPrice: calculatedPrice,
          price: calculatedPrice
        };
      });
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch packages');
    }
  },

  async createOrder(transactionId: string, selectedPackages: OrderPackage[]): Promise<any> {
    try {
      console.log('Creating order with data:', { transactionId, packages: selectedPackages });
      
      const response = await apiClient.post<APIResponse<any>>('/api/v1/open/orders/create', {
        transactionId,
        packages: selectedPackages.map(pkg => ({
          packageCode: pkg.packageCode,
          count: pkg.count,
          price: pkg.price
        }))
      });

      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to create order');
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error; // Прокидываем ошибку для обработки в компоненте
    }
  },

  async getOrderStatus(orderNo: string) {
    try {
      const response = await apiClient.get<APIResponse<any>>(`/api/v1/open/orders/${orderNo}/status`);
      
      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to get order status');
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to get order status:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get order status');
    }
  }
};