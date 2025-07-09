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

// Report reason service API methods
const apiReportReasonService = {
    getAllActiveReportReasons: async (queryParams) => {
        try {
            const response = await apiClient.get('/ReportReason/active',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch report reasons.' };
        }
    },
};

export default apiReportReasonService;