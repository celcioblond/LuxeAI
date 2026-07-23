import { createContext, useState, useEffect } from 'react';
import { loginService, registerService } from '../services/authService';

interface LoginCredentials{
  email: string;
  password: string;
}

interface RegisterCredentials{
  name: string;
  email: string;
  password: string
}

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
}

type AuthContextRes = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => void;
  isAdmin: () => boolean;
  getUserId: () => string;
  isAuthenticated: () =>  boolean;
};

// Decode the JWT payload (base64url) without a library so we can read `exp`.
const getTokenPayload = (token: string): { exp?: number } | null => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  const payload = getTokenPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now();
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextRes | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser && !isTokenExpired(storedToken)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    } else {
      // Drop an expired/invalid session so guarded routes don't render.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await loginService(credentials);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('token', response.token);
    return response.user;
  };

  const register = async (credentials: RegisterCredentials) => {
    const response = await registerService(credentials);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('token', response.token);
    return response.user;
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAdmin = (): boolean => {
    return user?.role === "admin" && !isTokenExpired(token);
  };

  const getUserId = (): string => {
    return user?.id ?? '';
  }

  const isAuthenticated = (): boolean => {
    return !!token && !isTokenExpired(token);
  }

  const data = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAdmin,
    getUserId,
    isAuthenticated,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

