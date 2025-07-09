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

const apiGroupService = {
    getAllActiveGroups: async (queryParams) => {
        try {
            const response = await apiClient.get("/communityGroup/all-active-group",{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch active groups." };
        }
    },

    getMyGroups: async (queryParams) => {
        try {
            const response = await apiClient.get("/communityGroup/creator/me",{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch my groups." };
        }
    },

    getMyJoinedGroups: async (groupId,queryParams) => {
        try {
            const response = await apiClient.get(`/communityGroup/my-joined-groups/${groupId}`,{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch my groups." };
        }
    },

    getGroupActiveById: async (id) => {
        try {
            const response = await apiClient.get(`/communityGroup/active/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch group." };
        }
    },

    getMyGroupActiveById: async (id) => {
        try {
            const response = await apiClient.get(`/communityGroup/mygroup/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch my group." };
        }
    },

    createGroup: async (groupDto) => {
        try {
            const response = await apiClient.post("/communityGroup",groupDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to create group." };
        }
    },

    updateGroup: async (id,groupDto) => {
        try {
            const response = await apiClient.put(`/communityGroup/me/${id}`,groupDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to update group." };
        }
    },

    softDeleteGroup: async (id) => {
        try {
            const response = await apiClient.delete(`/communityGroup/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to soft delete group." };
        }
    },
};

export default apiGroupService;