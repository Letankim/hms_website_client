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

const apiReactionTypeService = {
    getAllReactionTypes: async (queryParams) => {
        try {
            const response = await apiClient.get('/ReactionType',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch reaction types.' };
        }
    },

    getAllDeletedReactionTypes: async (queryParams) => {
        try {
            const response = await apiClient.get('/ReactionType/deleted',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch deleted reaction types.' };
        }
    },

    getReactionTypeById: async (id) => {
        try {
            const response = await apiClient.get(`/ReactionType/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch reaction type.' };
        }
    },

    createReactionType: async (reactionTypeDto) => {
        try {
            const response = await apiClient.post('/ReactionType',reactionTypeDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create reaction type.' };
        }
    },

    updateReactionType: async (id,reactionTypeDto) => {
        try {
            const response = await apiClient.put(`/ReactionType/${id}`,reactionTypeDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update reaction type.' };
        }
    },

    deleteReactionType: async (id) => {
        try {
            const response = await apiClient.delete(`/ReactionType/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete reaction type.' };
        }
    },

    restoreReactionType: async (id) => {
        try {
            const response = await apiClient.post(`/ReactionType/restore/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to restore reaction type.' };
        }
    },

    restoreMultipleReactionTypes: async (reactionTypeIds) => {
        try {
            const response = await apiClient.post('/ReactionType/restore-multiple',reactionTypeIds);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to restore multiple reaction types.' };
        }
    },

    restoreAllReactionTypes: async () => {
        try {
            const response = await apiClient.post('/ReactionType/restore-all');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to restore all reaction types.' };
        }
    },

    getReactionTypeStatistics: async (queryParams) => {
        try {
            const response = await apiClient.get('/ReactionType/statistics',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch reaction type statistics.' };
        }
    },
};

export default apiReactionTypeService;