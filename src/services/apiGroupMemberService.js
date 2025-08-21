import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user?.accessToken) {
            config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const apiGroupMemberService = {
    getAllActiveMembers: async (queryParams) => {
        try {
            const response = await apiClient.get("/groupMember/all-active-members",{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch active members." };
        }
    },

    getAllMembers: async (queryParams) => {
        try {
            const response = await apiClient.get("/groupMember",{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch members." };
        }
    },

    getAllInactiveMembers: async (queryParams) => {
        try {
            const response = await apiClient.get("/groupMember/inactive",{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch inactive members." };
        }
    },

    getMemberById: async (id) => {
        try {
            const response = await apiClient.get(`/groupMember/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch group member." };
        }
    },

    leaveGroup: async (leaveGroupDto) => {
        try {
            const response = await apiClient.post("/groupMember/leave",{ groupId: leaveGroupDto });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to leave group." };
        }
    },

    isUserInGroup: async (groupId) => {
        try {
            if (groupId <= 0) {
                throw new Error('Invalid group ID. Please provide a valid group ID.');
            }
            const response = await apiClient.get('/groupMember/is-user-in-group',{
                params: { groupId },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "An unexpected error occurred while checking group membership." };
        }
    },

    joinGroup: async (groupId) => {
        try {
            const response = await apiClient.post("/groupMember/join",{ groupId });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to join group." };
        }
    },

    updateMemberStatus: async (id,statusDto) => {
        try {
            const response = await apiClient.put(`/groupMember/${id}/status`,statusDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to update member status." };
        }
    },

    addOrUpdateMember: async (memberDto) => {
        try {
            const response = await apiClient.post("/groupMember/add-or-update",memberDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to add or update member." };
        }
    },

    softDeleteMember: async (id) => {
        try {
            const response = await apiClient.delete(`/groupMember/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to soft delete member." };
        }
    },

    getMemberStatistics: async (queryParams) => {
        try {
            const response = await apiClient.get("/groupMember/statistics",{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch member statistics." };
        }
    },

    getJoinRequestsByGroup: async (groupId,status,queryParams) => {
        try {
            const response = await apiClient.get(`/groupMember/join-requests/${groupId}/${status}`,{
                params: queryParams,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: `Failed to fetch join requests for group ID ${groupId}.` };
        }
    },

    getJoinedRequestsActiveByGroup: async (groupId,queryParams) => {
        try {
            const response = await apiClient.get(`/groupMember/join-requests-active/${groupId}`,{
                params: queryParams,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: `Failed to fetch active join requests for group ID ${groupId}.` };
        }
    },
};

export default apiGroupMemberService;