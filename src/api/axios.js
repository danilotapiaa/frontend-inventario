import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5000/api'; // Endpoint de tu backend .NET 10

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inyección automática del Token JWT en las cabeceras de cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;