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

// Post reaction service API methods
const apiPostReactService = {
    getAllReactions: async (query = {}) => {
        try {
            const response = await apiClient.get('/PostReaction',{ params: query });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch reactions.' };
        }
    },

    getReactionsByPostId: async (postId,query = {}) => {
        try {
            const response = await apiClient.get(`/PostReaction/by-post/${postId}`,{ params: query });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch reactions for post.' };
        }
    },

    getReactionById: async (id) => {
        try {
            const response = await apiClient.get(`/PostReaction/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch reaction.' };
        }
    },

    createReaction: async (reactionData) => {
        try {
            const response = await apiClient.post('/PostReaction',reactionData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create reaction.' };
        }
    },

    updateReaction: async (id,reactionData) => {
        try {
            const response = await apiClient.put(`/PostReaction/${id}`,reactionData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update reaction.' };
        }
    },

    deleteReaction: async (id) => {
        try {
            const response = await apiClient.delete(`/PostReaction/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete reaction.' };
        }
    },

    getReactionStatistics: async (query = {}) => {
        try {
            const response = await apiClient.get('/PostReaction/statistics',{ params: query });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch reaction statistics.' };
        }
    },

    reactToPost: async (reactionData) => {
        try {
            const response = await apiClient.post('/PostReaction/react',reactionData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to react to post.' };
        }
    },

    unreactToPost: async (postId) => {
        try {
            const response = await apiClient.delete(`/PostReaction/unreact/${postId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to unreact to post.' };
        }
    },
};

export default apiPostReactService;