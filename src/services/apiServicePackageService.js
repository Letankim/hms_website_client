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

const apiServicePackageService = {
    getAllActivePackages: async (queryParams) => {
        try {
            const response = await apiClient.get('/ServicePackage/all-active-package',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch active packages.' };
        }
    },

    getRelativePackageServiceByTrainer: async (trainerId,packageId,queryParams) => {
        try {
            const response = await apiClient.get(`/ServicePackage/trainer/${trainerId}/${packageId}/active`,{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch active packages.' };
        }
    },

    getPackageById: async (id) => {
        try {
            const response = await apiClient.get(`/ServicePackage/active/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch package.' };
        }
    }
};

export default apiServicePackageService;