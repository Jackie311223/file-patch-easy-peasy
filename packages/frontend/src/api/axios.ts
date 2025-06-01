import axios, { AxiosError } from 'axios';

// Sử dụng cổng 3001 cho Express hoặc 3002 cho NestJS tùy theo backend đang chạy
const apiClient = axios.create({
  baseURL: 'http://localhost:3001', // Hoặc 3002 nếu bạn đang chạy NestJS
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Interceptor để log các request
apiClient.interceptors.request.use(config => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

// Interceptor để log responses
apiClient.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error: AxiosError) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.message);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';  // Sửa lại thành route của frontend
    }
    return Promise.reject(error);
  }
);

export default apiClient;