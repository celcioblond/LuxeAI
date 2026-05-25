import type { AxiosResponse } from 'axios';
import api from './api';

interface DashboardStats {
  userCount: number;
  productCount: number;
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

interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: string;
  address?: Address;
}

interface UsersResponse {
  users: User[];
}

interface UpdateUserResponse {
  user: User;
}
interface UpdateUserResponse {
  user: User;
}

interface DeleteResponse {
  message: string;
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
      `/api/admin/${id}`,
    );
    return response.data.message;
  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
  }
};

export const addProduct = () => {};

export const updateProduct = () => {};

export const deleteProduct = () => {};
