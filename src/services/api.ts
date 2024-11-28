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

export const api = {
  async getPackages(location?: string): Promise<Package[]> {
    try {
      const response = await apiClient.get<APIResponse<Package[]>>('/api/packages', {
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
      console.error('Failed to fetch packages:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch packages');
    }
  },

  async createOrder(transactionId: string, selectedPackages: OrderPackage[]): Promise<any> {
    try {
      const response = await apiClient.post<APIResponse<any>>('/api/orders', {
        transactionId,
        packages: selectedPackages
      });

      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to create order');
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  },

  async getOrderStatus(orderNo: string) {
    try {
      const response = await apiClient.get<APIResponse<any>>(`/api/orders/${orderNo}`);
      
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