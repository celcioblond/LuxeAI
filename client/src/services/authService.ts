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

type User= {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const loginService = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/api/auth/login`,
      credentials,
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    throw new Error(err.response?.data?.message || err.message, {
      cause: error,
    });
  }
};

export const registerService = async (
  credentials: RegisterCredentials,
): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/api/auth/register`,
      credentials,
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    throw new Error(err.response?.data?.message || err.message, {
      cause: error,
    });
  }
};

// Asks the server whether the stored token still belongs to a live session.
// It stops being valid when the stack restarts or the user is deleted.
export const checkSessionService = async (token: string): Promise<User> => {
  const response = await axios.get<{ user: User }>(
    `${API_BASE_URL}/api/auth/me`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data.user;
};
