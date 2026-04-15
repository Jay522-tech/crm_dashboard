import axios from 'axios';

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

export default api;
