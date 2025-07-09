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

// User water log service API methods
const apiUserWaterLogService = {
    getMyWaterLogs: async (queryParams) => {
        try {
            const response = await apiClient.get('/UserWaterLog/me',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch water logs.' };
        }
    },

    createWaterLog: async (waterLogDto) => {
        try {
            const response = await apiClient.post('/UserWaterLog',waterLogDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create water log.' };
        }
    },

    updateWaterLog: async (id,waterLogDto) => {
        try {
            const response = await apiClient.put(`/UserWaterLog/${id}`,waterLogDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update water log.' };
        }
    },

    deleteWaterLog: async (id) => {
        try {
            const response = await apiClient.delete(`/UserWaterLog/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete water log.' };
        }
    },

    getMyStatistics: async (startDate = null,endDate = null) => {
        try {
            const params = { startDate,endDate };
            const response = await apiClient.get('/UserWaterLog/me/statistics',{ params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch water log statistics.' };
        }
    },

    getMyAverageByPeriod: async (period) => {
        try {
            const response = await apiClient.get('/UserWaterLog/me/average/period',{ params: { period } });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch average water intake by period.' };
        }
    },
};

export default apiUserWaterLogService;