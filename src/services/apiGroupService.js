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

const apiGroupService = {
    getAllActiveGroups: async (queryParams) => {
        try {
            const response = await apiClient.get('/CommunityGroup/all-active-group',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch active groups.' };
        }
    },

    getAllGroups: async (queryParams) => {
        try {
            const response = await apiClient.get('/CommunityGroup',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch groups.' };
        }
    },

    getDeletedGroups: async (queryParams) => {
        try {
            const response = await apiClient.get('/CommunityGroup/deleted',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch deleted groups.' };
        }
    },

    getGroupActiveById: async (id) => {
        try {
            const response = await apiClient.get(`/CommunityGroup/active/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch group.' };
        }
    },

    createGroup: async (groupDto) => {
        try {
            const response = await apiClient.post('/CommunityGroup',groupDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create group.' };
        }
    },

    updateGroup: async (id,groupDto) => {
        try {
            const response = await apiClient.put(`/CommunityGroup/${id}`,groupDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update group.' };
        }
    },

    softDeleteGroup: async (id) => {
        try {
            const response = await apiClient.delete(`/CommunityGroup/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to soft delete group.' };
        }
    },

    restoreGroup: async (id) => {
        try {
            const response = await apiClient.post(`/CommunityGroup/restore/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to restore group.' };
        }
    },

    restoreMultipleGroups: async (groupIds) => {
        try {
            const response = await apiClient.post('/CommunityGroup/restore-multiple',groupIds);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to restore multiple groups.' };
        }
    },

    restoreAllGroups: async () => {
        try {
            const response = await apiClient.post('/CommunityGroup/restore-all');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to restore all groups.' };
        }
    },

    getGroupStatistics: async (queryParams) => {
        try {
            const response = await apiClient.get('/CommunityGroup/statistics',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch group statistics.' };
        }
    },
};

export default apiGroupService;