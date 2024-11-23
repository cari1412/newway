import axios from 'axios';
import { calculateRetailPrice } from '@/utils/price';

const API_URL = 'https://api.sexystyle.site';

// Интерфейсы
export interface Package {
  id: string;
  name: string;
  data: string;
  validity: string;
  price: number; // Оптовая цена
  retailPrice: number; // Наша розничная цена
  location: string[];
  description: string;
  features: string[];
  smsStatus: number;
}

interface OrderPackageInfo {
  packageCode: string;
  count: number;
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

      // Преобразуем пакеты, добавляя розничную цену
      return packages.map(pkg => {
        const retailPrice = calculateRetailPrice(pkg.price);
        return {
          ...pkg,
          retailPrice, // Сохраняем розничную цену в поле retailPrice
          price: retailPrice // Перезаписываем исходную цену розничной для отображения
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

  async getOrderStatus(orderNo: string): Promise<string> {
    try {
      const response = await apiClient.get<APIResponse<{ status: string }>>(`/api/orders/${orderNo}`);

      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to get order status');
      }

      return response.data.data?.status || '';
    } catch (error) {
      console.error('Failed to get order status:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get order status');
    }
  }
};