import axios from 'axios';

const API_URL = 'http://localhost:5500/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    signUp: (data) => api.post('/auth/sign-up', data),
    signIn: (data) => api.post('/auth/sign-in', data),
    signOut: () => api.post('/auth/sign-out'),
};

// Subscriptions API
export const subscriptionsAPI = {
    create: (data) => api.post('/subscriptions', data),
    getUserSubscriptions: (userId) => api.get(`/subscriptions/user/${userId}`),
    delete: (id) => api.delete(`/subscriptions/${id}`),
    cancel: (id) => api.put(`/subscriptions/${id}/cancel`),
    getUpcomingRenewals: (userId) => api.get(`/subscriptions/${userId}/upcoming-renewals`),
};

// Users API
export const usersAPI = {
    getUser: (id) => api.get(`/users/${id}`),
    getUsers: () => api.get('/users'),
};

export default api;
