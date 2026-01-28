import axios from 'axios';

const API_URL = ''; // Proxied via vite.config.js

const setToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    }
};

export const register = async (username, email, password) => {
    const response = await axios.post(`${API_URL}/auth/register`, { username, email, password });
    return response.data;
};

export const login = async (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const response = await axios.post(`${API_URL}/auth/login`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (response.data.access_token) {
        setToken(response.data.access_token);
    }
    return response.data;
};

export const logout = () => {
    setToken(null);
};

export const getCurrentUser = async () => {
    const response = await axios.get(`${API_URL}/users/me`);
    return response.data;
};

// Initialize token from localStorage
const token = localStorage.getItem('token');
if (token) setToken(token);
