import axios from 'axios';

// Tạo một instance axios với base URL API
export const axiosInstance = axios.create({
    baseURL: 'https://coffeeshop.ngrok.app/api',
    headers: {
        'Content-Type': 'application/json',
        accept: '*/*'
    },
});

// Thêm interceptors để tự động thêm token vào headers
axiosInstance.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
