import api from './api';

export const getProducts = async () => {
  try {
    const response = await api.get('/api/products');
    return response.data;
  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
  }
};

export const getProduct = async (id: string) => {
  try {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
  }
};
