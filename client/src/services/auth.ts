import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const login = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/api/auth/login`,
      credentials,
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError<any>;
    throw new Error(err.response?.data?.message || err.message, {
      cause: error,
    });
  }
};

export const register = async (
  credentials: RegisterCredentials,
): Promise<AuthResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/register`,
      credentials,
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError<any>;
    throw new Error(err.response?.data?.message || err.message, {
      cause: error,
    });
  }
};
