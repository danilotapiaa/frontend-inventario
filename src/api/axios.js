import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5051/api', // Endpoint de tu backend .NET 10
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