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

const apiAuthService = {
    login: async (email,password) => {
        try {
            const response = await apiClient.post('/Auth/login',{
                email,
                password,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data;
        }
    },
    facebookLogin: async (token) => {
        try {
            const response = await apiClient.post('/Auth/google-login',{
                token
            });
            return response.data;
        } catch (error) {
            throw error.response?.data;
        }
    },
    googleLogin: async (token) => {
        try {
            const response = await apiClient.post('/Auth/facebook-login',{
                token
            });
            return response.data;
        } catch (error) {
            throw error.response?.data;
        }
    },

    refreshToken: async (refreshToken) => {
        try {
            const response = await apiClient.post('/Auth/refresh-token',{
                refreshToken,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data;
        }
    },
    forgotPassword: async (email) => {
        try {
            const response = await apiClient.post('/Auth/forgot-password',{ email });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    changePassword: async (email) => {
        try {
            const response = await apiClient.post('/Auth/change-password',{ email });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    resetPassword: async (resetData) => {
        try {
            const response = await apiClient.post('/Auth/reset-password',resetData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    activate: async (userId,token) => {
        try {
            const response = await apiClient.post('/Auth/activate',{ userId,token });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        try {
            const response = await apiClient.post('/Auth/logout');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    register: async (registerData) => {
        try {
            const response = await apiClient.post('/Auth/register',registerData);
            return response.data;
        } catch (error) {
            throw error.response?.data;
        }
    },
};

export default apiAuthService;