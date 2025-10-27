import axios, { InternalAxiosRequestConfig } from 'axios';

// В development используем прямую ссылку на бэкенд для наглядности
// В production - используем переменную окружения VITE_API_URL
// Если VITE_API_URL не задан, используем относительный путь /api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor для добавления токена в каждый запрос
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (username?: string, password?: string) => api.post('/auth/login', { username, password });

export const getTracks = () => api.get('/tracks');

export const uploadTrack = (formData: FormData, onUploadProgress: (progressEvent: any) => void) => {
    return api.post('/tracks/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
    });
};

export const deleteTrack = (filename: string) => api.delete(`/tracks/${filename}`);

export default api;
