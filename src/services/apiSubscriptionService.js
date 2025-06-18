import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.accessToken) {
            config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const apiSubscriptionService = {
    getMySubscriptions: async (userId,queryParams) => {
        try {
            const response = await apiClient.get(`/Subscription/user/${userId}`,{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch my subscriptions.' };
        }
    },

    getSubscriptionById: async (id) => {
        try {
            const response = await apiClient.get(`/Subscription/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch subscription.' };
        }
    },
    
    getSubscriptionStatistics: async (queryParams) => {
        try {
            const response = await apiClient.get('/Subscription/statistics',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch subscription statistics.' };
        }
    },
};

export default apiSubscriptionService;