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

const apiTagService = {
    getAllActiveTags: async (queryParams) => {
        try {
            const response = await apiClient.get("/tag/active",{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch active tags." };
        }
    },

    getTagById: async (id) => {
        try {
            const response = await apiClient.get(`/tag/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch tag." };
        }
    },

    addTagsToPost: async (postId,tagIds) => {
        try {
            const response = await apiClient.post(`/tag/post/${postId}/add-tags`,tagIds);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to add tags to post." };
        }
    },

    removeTagsFromPost: async (postId,tagIds) => {
        try {
            const response = await apiClient.post(`/tag/post/${postId}/remove-tags`,tagIds);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to remove tags from post." };
        }
    },

    getTagStatistics: async (queryParams) => {
        try {
            const response = await apiClient.get("/tag/statistics",{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch tag statistics." };
        }
    },
};

export default apiTagService;