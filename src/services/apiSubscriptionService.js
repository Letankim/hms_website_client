import axios from 'axios';

// Initialize Axios client with base configuration
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include Bearer token
apiClient.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.accessToken) {
            config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Subscription service API methods
const apiSubscriptionService = {
    getMySubscriptions: async (userId,queryParams) => {
        try {
            const response = await apiClient.get(`/Subscription/user/${userId}`,{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch user subscriptions.' };
        }
    },

    getSubscriptionsByPackageId: async (packageId,queryParams) => {
        try {
            const response = await apiClient.get(`/Subscription/byMyPackageId/${packageId}`,{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch subscriptions by package ID.' };
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

    getSubscriptionStatisticsByTrainer: async (queryParams) => {
        try {
            const response = await apiClient.get('/Subscription/trainer/me/statistics',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch subscription statistics for trainer.' };
        }
    },
};

export default apiSubscriptionService;