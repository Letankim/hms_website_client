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

// Trainer application service API methods
const apiTrainerApplicationService = {
    getApplicationApprovedByTrainerId: async (trainerId) => {
        try {
            const response = await apiClient.get(`/TrainerApplication/user/approved/${trainerId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch approved application.' };
        }
    },

    getMyApplication: async (queryParams) => {
        try {
            const response = await apiClient.get('/TrainerApplication/me',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch my application.' };
        }
    },
    canApplyNewApplication: async () => {
        try {
            const response = await apiClient.get('/can-apply');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch my application.' };
        }
    },

    createApplication: async (applicationData) => {
        try {
            const response = await apiClient.post('/TrainerApplication',applicationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create application.' };
        }
    },
};

export default apiTrainerApplicationService;