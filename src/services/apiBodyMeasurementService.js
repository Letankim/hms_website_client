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

const apiBodyMeasurementService = {
    getMyBodyMeasurements: async (queryParams) => {
        try {
            const response = await apiClient.get('/BodyMeasurement',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch body measurements.' };
        }
    },

    

    createMeasurement: async (measurementDto) => {
        try {
            const response = await apiClient.post('/BodyMeasurement',measurementDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create body measurement.' };
        }
    },

    updateMeasurement: async (id,measurementDto) => {
        try {
            const response = await apiClient.put(`/BodyMeasurement/${id}`,measurementDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update body measurement.' };
        }
    },

    deleteMeasurement: async (id) => {
        try {
            const response = await apiClient.delete(`/BodyMeasurement/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete body measurement.' };
        }
    },

    getMyStatistics: async (startDate = null,endDate = null) => {
        try {
            const params = { startDate,endDate };
            const response = await apiClient.get('/BodyMeasurement/me/statistics',{ params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch your body measurement statistics.' };
        }
    },

    getUserAverageByPeriod: async (userId,period) => {
        try {
            const response = await apiClient.get(`/BodyMeasurement/user/${userId}/average/period`,{ params: { period } });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch average measurements by period.' };
        }
    },

    getMyAverageByPeriod: async (period) => {
        try {
            const response = await apiClient.get('/BodyMeasurement/me/average/period',{ params: { period } });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch your average measurements by period.' };
        }
    },
};

export default apiBodyMeasurementService;