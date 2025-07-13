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
    (error) => Promise.reject(error),
);

const apiUserService = {
    getTrainers: async () => {
        try {
            const response = await apiClient.get('/User/trainers');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch trainers.' };
        }
    },

    getUserActiveById: async (id) => {
        try {
            const response = await apiClient.get(`/User/active/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch active user.' };
        }
    },

    updateUser: async (id,userData) => {
        try {
            const response = await apiClient.put(`/User/user/${id}`,userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update user.' };
        }
    },

    updateAvatar: async (id,avatarUrl) => {
        try {
            const response = await apiClient.put(`/User/${id}/avatar`,{ AvatarUrl: avatarUrl });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update avatar.' };
        }
    },
};

export default apiUserService;