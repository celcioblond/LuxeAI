import axios, { type AxiosInstance } from 'axios';
const BACK_URL = import.meta.env.VITE_API_URL;

//get token from localstorage

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

const api: AxiosInstance = axios.create({
  baseURL: BACK_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (getToken()) {
    config.headers.Authorization = `Bearer ${getToken()}`;
  }
  return config;
});

// When the server rejects the token (expired or invalid), clear the stale
// session and send the user to the login page instead of leaving them on a
// broken screen full of failed requests.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
