import api from './api';
import { toMessage } from './errors';

export const getProducts = async () => {
  try {
    const response = await api.get('/api/products');
    return response.data;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};

export const getProduct = async (id: string) => {
  try {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};
