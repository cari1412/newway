import axios from 'axios';

const API_URL = 'https://api.sexystyle.site'; // Replace with your VPS address

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
  success: boolean;
  errorCode: string | null;
  errorMsg: string | null;
  obj: T;
}

interface PackageListResponse {
  packageList: Package[];
}

export const api = {
  async getPackages(location?: string): Promise<Package[]> {
    const response = await axios.post<APIResponse<PackageListResponse>>(`${API_URL}/api/v1/open/package/list`, {
      locationCode: location || '',
      type: 'BASE',
      packageCode: '',
      iccid: ''
    });
    
    if (!response.data.success) {
      throw new Error(response.data.errorMsg || 'Failed to fetch packages');
    }
    
    return response.data.obj.packageList;
  },

  async createOrder(transactionId: string, packages: OrderPackageInfo[]): Promise<Order> {
    const response = await axios.post<APIResponse<Order>>(`${API_URL}/api/v1/open/esim/order`, {
      transactionId,
      packageInfoList: packages
    });
    
    if (!response.data.success) {
      throw new Error(response.data.errorMsg || 'Failed to create order');
    }
    
    return response.data.obj;
  },

  async getOrderStatus(orderNo: string): Promise<string> {
    const response = await axios.post<APIResponse<{ status: string }>>(`${API_URL}/api/v1/open/esim/query`, {
      orderNo
    });
    
    if (!response.data.success) {
      throw new Error(response.data.errorMsg || 'Failed to get order status');
    }
    
    return response.data.obj.status;
  }
};