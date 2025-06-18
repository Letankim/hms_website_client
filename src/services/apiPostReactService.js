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

const apiPostReactService = {
    getAllReactions: async (query = {}) => {
        try {
            const response = await apiClient.get('/PostReaction',{ params: query });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getReactionsByPostId: async (postId,query = {}) => {
        try {
            const response = await apiClient.get(`/PostReaction/by-post/${postId}`,{ params: query });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getReactionById: async (id) => {
        try {
            const response = await apiClient.get(`/PostReaction/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createReaction: async (reactionData) => {
        try {
            const response = await apiClient.post('/PostReaction',reactionData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateReaction: async (id,reactionData) => {
        try {
            const response = await apiClient.put(`/PostReaction/${id}`,reactionData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteReaction: async (id) => {
        try {
            const response = await apiClient.delete(`/PostReaction/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getReactionStatistics: async (query = {}) => {
        try {
            const response = await apiClient.get('/PostReaction/statistics',{ params: query });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    reactToPost: async (reactionData) => {
        try {
            const response = await apiClient.post('/PostReaction/react',reactionData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    unreactToPost: async (postId) => {
        try {
            const response = await apiClient.delete(`/PostReaction/unreact/${postId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default apiPostReactService;