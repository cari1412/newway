import axios from 'axios';

const API_URL = 'https://api.sexystyle.site';

export interface Package {
  id: string;
  name: string;
  data: string;
  validity: string;
  price: number;
  location: string[];
  description: string;
  features: string[];
  retailPrice: number;
  smsStatus: number;
  operatorList: Array<any>;
}

interface APIResponse<T> {
  success: boolean;
  errorCode: string | null;
  errorMsg: string | null;
  data?: T;
  obj?: { packageList: T };
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Добавляем логирование запросов
apiClient.interceptors.request.use(request => {
  console.log('🚀 Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    params: request.params
  });
  return request;
});

// Добавляем логирование ответов
apiClient.interceptors.response.use(
  response => {
    console.log('✅ Response:', response.data);
    return response;
  },
  error => {
    console.error('❌ Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
);

export const api = {
  async getPackages(location?: string): Promise<Package[]> {
    try {
      // Пробуем сначала основной эндпоинт
      const response = await apiClient.get<APIResponse<Package[]>>('/api/packages', {
        params: location ? { location } : undefined
      });

      if (response.data.data) {
        return response.data.data;
      }

      // Если нет data, проверяем obj.packageList
      if (response.data.obj?.packageList) {
        return response.data.obj.packageList;
      }

      throw new Error('No packages data in response');
    } catch (error) {
      // Пробуем альтернативный эндпоинт
      try {
        const alternativeResponse = await apiClient.post<APIResponse<Package[]>>('/api/v1/open/package/list', {
          locationCode: location || ''
        });

        if (alternativeResponse.data.obj?.packageList) {
          return alternativeResponse.data.obj.packageList;
        }

        throw new Error('No packages data in alternative response');
      } catch (secondError) {
        console.error('Both endpoints failed:', { error, secondError });
        throw new Error('Failed to fetch packages from all available endpoints');
      }
    }
  },

  async getOrderStatus(orderNo: string): Promise<string> {
    const response = await apiClient.get<APIResponse<{ status: string }>>(`/api/orders/${orderNo}`);
    
    if (!response.data.success) {
      throw new Error(response.data.errorMsg || 'Failed to get order status');
    }
    
    return response.data.data?.status || '';
  },

  async createOrder(transactionId: string, packages: { packageCode: string; count: number }[]): Promise<any> {
    const response = await apiClient.post<APIResponse<any>>('/api/orders', {
      transactionId,
      packages
    });
    
    if (!response.data.success) {
      throw new Error(response.data.errorMsg || 'Failed to create order');
    }
    
    return response.data.data;
  }
};