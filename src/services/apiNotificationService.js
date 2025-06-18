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

const apiNotificationService = {
    getNotificationsByUserId: async (userId,queryParams = {},includeRead = false) => {
        try {
            const params = { includeRead,...queryParams };
            const response = await apiClient.get(`/Notification/user/${userId}`,{ params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch notifications for user.' };
        }
    },

    getNotificationById: async (id) => {
        try {
            const response = await apiClient.get(`/Notification/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch notification.' };
        }
    },


    updateNotificationReadStatus: async (updateDto) => {
        try {
            const response = await apiClient.post('/Notification/read',updateDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update read status.' };
        }
    },

    markAllNotificationsRead: async (userId) => {
        try {
            const response = await apiClient.post(`/Notification/mark-all-read`,null,{ params: { userId } });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to mark all notifications as read.' };
        }
    },


    deleteNotification: async (id) => {
        try {
            const response = await apiClient.delete(`/Notification/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete notification.' };
        }
    },

    markNotificationsUnread: async (updateDto) => {
        try {
            const response = await apiClient.post('/Notification/unread',updateDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to mark notifications as unread.' };
        }
    },

    markAllNotificationsUnread: async (userId) => {
        try {
            const response = await apiClient.post(`/Notification/unread-mark-all`,null,{ params: { userId } });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to mark all notifications as unread.' };
        }
    },

    deleteExpiredNotifications: async (userId) => {
        try {
            const response = await apiClient.delete(`/Notification/expired`,{ params: { userId } });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete expired notifications.' };
        }
    },

    markNotificationsRead: async (updateDto) => {
        try {
            const response = await apiClient.post('/Notification/read',updateDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to mark notifications as read.' };
        }
    },
};

export default apiNotificationService;