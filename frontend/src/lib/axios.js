import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors, e.g., 401 Unauthorized
        if (error.response?.status === 401) {
            // Redirect to login or refresh token logic
            if (typeof window !== 'undefined') {
                // localStorage.removeItem('token'); // Optional: clear token on 401
                // window.location.href = '/login'; // Optional: force redirect
            }
        }
        return Promise.reject(error);
    }
);

export default api;
