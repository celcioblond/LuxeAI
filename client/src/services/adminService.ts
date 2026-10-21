import { isAxiosError, type AxiosResponse } from 'axios';
import api from './api';
import { toMessage } from './errors';

interface DashboardStats {
  userCount: number;
  productCount: number;
  orderCount: number;
}

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  address: Address;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  imageUrl: string;
}

interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: string;
  address?: Address;
}

interface AddProductPayload {
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  imageUrl: string;
}

interface UpdateProductPayload {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  stock?: number;
  imageUrl?: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

interface UpdateUserResponse {
  user: User;
}

interface DeleteResponse {
  message: string;
}

interface AddProductResponse {
  product: Product;
}

interface UpdateProductResponse {
  product: Product;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response: AxiosResponse<DashboardStats> =
      await api.get('/api/admin/stats');
    return response.data;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};

export const getAllUsers = async (page = 1): Promise<UsersResponse> => {
  try {
    const response: AxiosResponse<UsersResponse> =
      await api.get('/api/admin/users', { params: { page } });
    return response.data;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};

export const updateUser = async (
  id: string,
  payload: UpdateUserPayload,
): Promise<User> => {
  try {
    const response: AxiosResponse<UpdateUserResponse> = await api.patch(
      `/api/admin/users/${id}`,
      payload,
    );
    return response.data.user;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};

export const deleteUser = async (id: string): Promise<string> => {
  try {
    const response: AxiosResponse<DeleteResponse> = await api.delete(
      `/api/admin/users/${id}`,
    );
    return response.data.message;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};

export const addProduct = async (
  productPayload: AddProductPayload,
): Promise<Product> => {
  try {
    const response: AxiosResponse<AddProductResponse> = await api.post(
      `/api/products`,
      productPayload,
    );
    return response.data.product;
  } catch (error) {
    // Product validation errors come back as an array of { message }
    const zodErrors = isAxiosError(error) ? error.response?.data : null;
    if (Array.isArray(zodErrors)) {
      throw new Error(zodErrors.map((e: { message: string }) => e.message).join(', '));
    }
    throw new Error(toMessage(error));
  }
};

export const updateProduct = async (
  id: string,
  productPayload: UpdateProductPayload,
): Promise<Product> => {
  try {
    const response: AxiosResponse<UpdateProductResponse> = await api.patch(
      `/api/products/${id}`,
      productPayload,
    );
    return response.data.product;
  } catch (error) {
    // Product validation errors come back as an array of { message }
    const zodErrors = isAxiosError(error) ? error.response?.data : null;
    if (Array.isArray(zodErrors)) {
      throw new Error(zodErrors.map((e: { message: string }) => e.message).join(', '));
    }
    throw new Error(toMessage(error));
  }
};

export const deleteProduct = async (id: string): Promise<string> => {
  try {
    const response: AxiosResponse<DeleteResponse> = await api.delete(
      `/api/products/${id}`,
    );
    return response.data.message;
  } catch (error) {
    throw new Error(toMessage(error));
  }
};
