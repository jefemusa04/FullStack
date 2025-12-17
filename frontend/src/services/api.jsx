import axios from 'axios';
import { getToken, clearAuth } from '../utils/authUtils'; // Importamos las utilidades para ser consistentes



const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL, // Usará '/api' ya sea desde el .env o como fallback.
});

// Interceptor para agregar el token en cada petición
api.interceptors.request.use(
  (config) => {
    //Usamos la utilidad getToken() en vez de leer localStorage a mano
    const token = getToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      // Redirigir al login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
