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

// Trainer rating service API methods
const apiTrainerRatingService = {
    getRatingsByPackageId: async (packageId,queryParams = {}) => {
        try {
            const response = await apiClient.get(`/TrainerRating/package/active/${packageId}`,{
                params: {
                    pageNumber: queryParams.pageNumber || 1,
                    pageSize: queryParams.pageSize || 10,
                    searchTerm: queryParams.searchTerm || '',
                    status: queryParams.status || '',
                    startDate: queryParams.startDate || '',
                    endDate: queryParams.endDate || '',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch ratings by package ID.' };
        }
    },

    getAvarageRatingByTrainerId: async (trainerId) => {
        try {
            const response = await apiClient.get(`/TrainerRating/average/${trainerId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch average rating by trainer ID.' };
        }
    },
};

export default apiTrainerRatingService;