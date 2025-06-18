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

const apiGroupMemberService = {
    getAllActiveMembers: async (queryParams) => {
        try {
            const response = await apiClient.get('/GroupMember/all-active-members',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch active members.' };
        }
    },

    getAllMembers: async (queryParams) => {
        try {
            const response = await apiClient.get('/GroupMember',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch members.' };
        }
    },

    getAllInactiveMembers: async (queryParams) => {
        try {
            const response = await apiClient.get('/GroupMember/inactive',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch inactive members.' };
        }
    },

    getMemberById: async (id) => {
        try {
            const response = await apiClient.get(`/GroupMember/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch group member.' };
        }
    },

    leaveGroup: async (leaveGroupDto) => {
        try {
            const response = await apiClient.post('/GroupMember/leave',leaveGroupDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to leave group.' };
        }
    },

    joinGroup: async (joinGroupDto) => {
        try {
            const response = await apiClient.post('/GroupMember/join',joinGroupDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to join group.' };
        }
    },

    updateMemberStatus: async (id,statusDto) => {
        try {
            const response = await apiClient.put(`/GroupMember/${id}/status`,statusDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update member status.' };
        }
    },

    addOrUpdateMember: async (memberDto) => {
        try {
            const response = await apiClient.post('/GroupMember/add-or-update',memberDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to add or update member.' };
        }
    },

    softDeleteMember: async (id) => {
        try {
            const response = await apiClient.delete(`/GroupMember/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to soft delete member.' };
        }
    },

    restoreMember: async (id) => {
        try {
            const response = await apiClient.post(`/GroupMember/restore/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to restore member.' };
        }
    },

    restoreMultipleMembers: async (memberIds) => {
        try {
            const response = await apiClient.post('/GroupMember/restore-multiple',memberIds);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to restore multiple members.' };
        }
    },

    restoreAllMembers: async () => {
        try {
            const response = await apiClient.post('/GroupMember/restore-all');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to restore all members.' };
        }
    },

    getMemberStatistics: async (queryParams) => {
        try {
            const response = await apiClient.get('/GroupMember/statistics',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch member statistics.' };
        }
    },
};

export default apiGroupMemberService;