import axios from 'axios';

const API_URL = 'https://api.sexystyle.site';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data
      });
      throw new Error(error.response.data?.message || 'API Error');
    } else if (error.request) {
      console.error('Network Error:', error.message);
      throw new Error('Ошибка сети. Пожалуйста, проверьте подключение.');
    } else {
      console.error('Error:', error.message);
      throw error;
    }
  }
);

export interface Package {
  packageCode: string;
  slug: string;
  name: string;
  price: number;
  currencyCode: string;
  volume: number;
  smsStatus: number;
  unusedValidTime: number;
  duration: number;
  durationUnit: string;
  location: string;
  description: string;
  activeType: number;
  favorite: boolean;
  retailPrice: number;
  speed: string;
  locationNetworkList: {
    locationName: string;
    locationLogo: string;
    operatorList: Array<{
      operatorName: string;
      networkType: string;
    }>;
  }[];
}

export interface Order {
  orderNo: string;
  status: string;
  packages: Package[];
}

export interface OrderPackageInfo {
  packageCode: string;
  count: number;
  price?: number;
  periodNum?: number;
}

interface APIResponse<T> {
  status: string;
  timestamp: string;
  success: boolean;
  errorCode: string | null;
  errorMsg: string | null;
  data: T;
}

export const api = {
  async getPackages(location?: string): Promise<Package[]> {
    try {
      const response = await apiClient.get<APIResponse<Package[]>>('/api/packages', {
        params: { location }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to fetch packages');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      throw error;
    }
  },

  async createOrder(transactionId: string, packages: OrderPackageInfo[]): Promise<Order> {
    try {
      const response = await apiClient.post<APIResponse<Order>>('/api/orders', {
        transactionId,
        packages
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

  async getOrderStatus(orderNo: string): Promise<string> {
    try {
      const response = await apiClient.get<APIResponse<{ status: string }>>(`/api/orders/${orderNo}`);
      
      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Failed to get order status');
      }
      
      return response.data.data.status;
    } catch (error) {
      console.error('Failed to get order status:', error);
      throw error;
    }
  }
};