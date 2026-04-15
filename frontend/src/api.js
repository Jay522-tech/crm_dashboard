import axios from 'axios';

const AUTH_TOKEN_KEY = 'crm_auth_token';

const normalizeApiBaseUrl = () => {
    const rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
    const withoutTrailingSlash = rawUrl.replace(/\/+$/, '');
    return withoutTrailingSlash.endsWith('/api')
        ? withoutTrailingSlash
        : `${withoutTrailingSlash}/api`;
};

const api = axios.create({
    baseURL: normalizeApiBaseUrl(),
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const setAuthToken = (token) => {
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearAuthToken = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
};

export default api;
