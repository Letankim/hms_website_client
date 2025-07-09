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

const apiPostReportService = {
    getMyReports: async (queryParams,postId = null) => {
        try {
            const params = { ...queryParams };
            if (postId) params.postId = postId;
            const response = await apiClient.get("/PostReport/my-reports",{ params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch user reports." };
        }
    },

    getReportById: async (id) => {
        try {
            const response = await apiClient.get(`/PostReport/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch report." };
        }
    },

    reportPost: async (reportDto) => {
        try {
            const response = await apiClient.post("/PostReport/user",reportDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to create report." };
        }
    },

    checkUserReport: async (postId) => {
        try {
            if (!postId || postId <= 0) {
                throw new Error("PostId must be a positive integer.");
            }
            const response = await apiClient.get(`/PostReport/check/${postId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to check report status." };
        }
    },
};

export default apiPostReportService;