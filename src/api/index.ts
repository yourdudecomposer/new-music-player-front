import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';

// В development используем прямую ссылку на бэкенд для наглядности
// В production - используем переменную окружения VITE_API_URL
// Если VITE_API_URL не задан, используем относительный путь /api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor для добавления токена в каждый запрос
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor для автоматического обновления токена
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Если ошибка 401 и это не запрос на refresh или login
    if (error.response?.status === 401 && 
        !originalRequest._retry &&
        originalRequest.url &&
        !originalRequest.url.includes('/auth/login') &&
        !originalRequest.url.includes('/auth/refresh')) {
      
      if (isRefreshing) {
        // Если уже идет процесс обновления, добавляем запрос в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        // Нет refresh token - разлогиниваем
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { token: accessToken, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        isRefreshing = false;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh токен тоже истек - разлогиниваем
        processQueue(refreshError as AxiosError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

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

export const downloadFromYoutube = (url: string) => api.post('/tracks/youtube', { url });

export const renameTrack = (oldFilename: string, newName: string) =>
  api.patch(`/tracks/${encodeURIComponent(oldFilename)}/rename`, { newName });

export default api;
