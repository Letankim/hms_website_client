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

const apiUChatSupportService = {
    getRoomChatSupport: async (userId,trainerId) => {
        try {
            const response = await apiClient.post('/CallSupport/create-room',{
                userId: parseInt(userId),
                trainerId: parseInt(trainerId),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch trainers.' };
        }
    }

};

export default apiUChatSupportService;