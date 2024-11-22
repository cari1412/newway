// api.ts
import axios from 'axios';

const API_URL = 'https://api.sexystyle.site'; // Замените на адрес вашего VPS

export interface Package {
  id: string;
  countryId: string;
  name: string;
  data: string;
  validity: string;
  price: number;
  description: string;
}

export interface Order {
  orderNo: string;
  status: string;
  packages: Package[];
}

export interface Country {
  id: string;
  name: string;
  flag: string;
  plansCount: number;
  startingPrice: number;
}

export const api = {
  async getPackages(location?: string): Promise<Package[]> {
    const url = location ? 
      `${API_URL}/api/packages?location=${location}` : 
      `${API_URL}/api/packages`;
    const response = await axios.get(url);
    return response.data.data;
  },

  async createOrder(transactionId: string, packages: string[]): Promise<Order> {
    const response = await axios.post(`${API_URL}/api/orders`, {
      transactionId,
      packages
    });
    return response.data.data;
  },

  async getOrderStatus(orderNo: string): Promise<string> {
    const response = await axios.get(`${API_URL}/api/orders/${orderNo}`);
    return response.data.data;
  }
};