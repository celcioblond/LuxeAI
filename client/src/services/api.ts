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

export default api;
