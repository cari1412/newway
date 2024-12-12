import axios from 'axios';

const API_URL = 'https://web.sexystyle.site';

export interface PaymentRequestParams {
  transactionId: string;
  packageId: string;
  amount: string | number;
  asset: string;
  currency_type: 'crypto' | 'fiat';
  paymentMethod?: 'ton' | 'crypto';
}

export interface PaymentResponse {
  bot_invoice_url: string;
  mini_app_invoice_url?: string;
  web_app_invoice_url?: string;
  payment_url?: string;
}

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

export interface OperatorInfo {
  operatorName: string;
  networkType: string;
}

export interface LocationNetwork {
  locationName: string;
  locationLogo: string;
  operatorList: OperatorInfo[];
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 Request:', config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const api = {
  async createPayment(params: PaymentRequestParams) {
    try {
      // Убедимся, что все обязательные поля присутствуют
      if (!params.asset || !params.amount || !params.packageId || !params.transactionId) {
        throw new Error('Missing required parameters');
      }

      // Подготовим данные для запроса согласно документации API
      const requestData = {
        transactionId: params.transactionId,
        packageId: params.packageId,
        amount: params.amount.toString(),
        asset: params.asset.toUpperCase(), // Убедимся, что asset в верхнем регистре
        currency_type: 'crypto' as const,
        paymentMethod: params.asset === 'TON' ? 'ton' : 'crypto'
      };

      console.log('Debug - Payment request data:', requestData);

      const response = await apiClient.post('/api/v1/open/payments/create', requestData);

      console.log('Debug - Payment response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.errorMsg || 'Payment creation failed');
      }

      return response.data.data;
    } catch (error) {
      console.error('Payment creation error:', error);
      throw error;
    }
  },

  async getPackages(location?: string): Promise<Package[]> {
    const response = await apiClient.post('/api/v1/open/package/list', {
      locationCode: location || '',
      type: 'BASE'
    });

    if (!response.data.success) {
      throw new Error(response.data.errorMsg || 'Failed to fetch packages');
    }

    return response.data.obj?.packageList || [];
  },

  async logPackageSelection(packageId: string): Promise<void> {
    try {
      await apiClient.post('/api/v1/open/package/log-selection', {
        selectedId: packageId
      });
    } catch (error) {
      console.error('Failed to log package selection:', error);
    }
  }
};