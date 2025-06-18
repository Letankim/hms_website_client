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

const apiTrainerPayoutService = {
    getAllPayouts: async (queryParams) => {
        try {
            const response = await apiClient.get('/TrainerPayout',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch payouts.' };
        }
    },

    getAllDeletedPayouts: async (queryParams) => {
        try {
            const response = await apiClient.get('/TrainerPayout/deleted',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch deleted payouts.' };
        }
    },

    getPayoutById: async (id) => {
        try {
            const response = await apiClient.get(`/TrainerPayout/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch payout.' };
        }
    },

    createPayout: async (payoutDto) => {
        try {
            const response = await apiClient.post('/TrainerPayout',payoutDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create payout.' };
        }
    },

    updatePayout: async (id,payoutDto) => {
        try {
            const response = await apiClient.put(`/TrainerPayout/${id}`,payoutDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update payout.' };
        }
    },

    softDeletePayout: async (id) => {
        try {
            const response = await apiClient.delete(`/TrainerPayout/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to soft delete payout.' };
        }
    },

    restorePayout: async (id) => {
        try {
            const response = await apiClient.post(`/TrainerPayout/restore/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to restore payout.' };
        }
    },

    restoreMultiplePayouts: async (payoutIds) => {
        try {
            const response = await apiClient.post('/TrainerPayout/restore-multiple',payoutIds);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to restore multiple payouts.' };
        }
    },

    restoreAllPayouts: async () => {
        try {
            const response = await apiClient.post('/TrainerPayout/restore-all');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to restore all payouts.' };
        }
    },

    getPayoutStatistics: async (queryParams) => {
        try {
            const response = await apiClient.get('/TrainerPayout/statistics',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch payout statistics.' };
        }
    },
};

export default apiTrainerPayoutService;