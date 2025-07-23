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

const apiAuthService = {

    login: async (email,password) => {
        try {
            const response = await apiClient.post("/auth/login/u",{ email,password });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },


    facebookLogin: async (token) => {
        try {
            const response = await apiClient.post("/auth/facebook-login",{ token });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },


    googleLogin: async (token) => {
        try {
            const response = await apiClient.post("/auth/google-login",{ token });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    refreshToken: async (refreshToken) => {
        try {
            const response = await apiClient.post("/auth/refresh-token",{ refreshToken });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },


    forgotPassword: async (email) => {
        try {
            const response = await apiClient.post("/auth/forgot-password",{ email });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },


    changePassword: async (email) => {
        try {
            const response = await apiClient.post("/auth/change-password",{ email });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },


    resetPassword: async (resetData) => {
        try {
            const response = await apiClient.post("/auth/reset-password",resetData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    activate: async (userId,token) => {
        try {
            const encodedToken = encodeURIComponent(token);

            const response = await apiClient.post("/auth/activate",{
                userId,
                token: encodedToken
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
    ,

    logout: async () => {
        try {
            const response = await apiClient.post("/auth/logout");
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },


    register: async (registerData) => {
        try {
            const response = await apiClient.post("/auth/register/m",registerData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default apiAuthService;