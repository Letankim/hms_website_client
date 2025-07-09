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

const apiFoodCategoryService = {
    getAllActiveCategories: async (queryParams) => {
        try {
            const response = await apiClient.get("/FoodCategory/all-active-category",{ params: queryParams });
            return response.data.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch active food categories." };
        }
    },

    getAllCategories: async (queryParams) => {
        try {
            const response = await apiClient.get("/FoodCategory",{ params: queryParams });
            return response.data.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch food categories." };
        }
    },

    getCategoryById: async (id) => {
        try {
            const response = await apiClient.get(`/FoodCategory/${id}`);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch food category." };
        }
    },

    createCategory: async (categoryDto) => {
        try {
            const response = await apiClient.post("/FoodCategory",categoryDto);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to create food category." };
        }
    },

    updateCategory: async (id,categoryDto) => {
        try {
            const response = await apiClient.put(`/FoodCategory/${id}`,categoryDto);
            return response.data.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to update food category." };
        }
    },

    softDeleteCategory: async (id) => {
        try {
            const response = await apiClient.delete(`/FoodCategory/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to delete food category." };
        }
    },

    getCategoryStatistics: async (queryParams) => {
        try {
            const response = await apiClient.get("/FoodCategory/statistics",{ params: queryParams });
            return response.data.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch food category statistics." };
        }
    },
};

export default apiFoodCategoryService;