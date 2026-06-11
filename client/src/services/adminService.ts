import type { AxiosResponse } from 'axios';
import api from './api';

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
  stock: number;
  imageUrl: string;
}

interface UpdateProductPayload {
  name?: string;
  price?: number;
  description?: string;
  stock?: number;
  imageUrl?: string;
}

interface UsersResponse {
  users: User[];
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
  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response: AxiosResponse<UsersResponse> =
      await api.get('/api/admin/users');
    return response.data.users;
  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
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
  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
  }
};

export const deleteUser = async (id: string): Promise<string> => {
  try {
    const response: AxiosResponse<DeleteResponse> = await api.delete(
      `/api/admin/users/${id}`,
    );
    return response.data.message;
  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
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
  } catch (error: any) {
    const zodErrors = error.response?.data;
    if (Array.isArray(zodErrors)) {
      throw new Error(zodErrors.map((e: { message: string }) => e.message).join(', '));
    }
    throw new Error(error.response?.data?.message || error.message);
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
  } catch (error: any) {
    const zodErrors = error.response?.data;
    if (Array.isArray(zodErrors)) {
      throw new Error(zodErrors.map((e: { message: string }) => e.message).join(', '));
    }
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const deleteProduct = async (id: string): Promise<string> => {
  try {
    const response: AxiosResponse<DeleteResponse> = await api.delete(
      `/api/products/${id}`,
    );
    return response.data.message;
  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
  }
};
