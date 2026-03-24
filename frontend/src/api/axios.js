import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Usa la variable de entorno si existe, sino usa localhost
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: baseURL,
});

api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle license expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        // Manejar Licencia Expirada
        if (message === 'LICENSE_EXPIRED') {
            useAuthStore.getState().logout();
            window.location.href = '/license-expired'; // Redirigir a página específica si existe, o login
            return Promise.reject(error);
        }

        // Manejar Token Inválido o Expirado (401)
        if (status === 401) {
            // Evitar loop infinito si ya estamos en login
            if (!window.location.pathname.includes('/login')) {
                useAuthStore.getState().logout();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
