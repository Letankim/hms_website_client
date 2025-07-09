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

const apiPostCommentService = {
    getCommentsByPostId: async (postId,query = {}) => {
        try {
            const params = { ...query };
            const response = await apiClient.get(`/PostComment/active/by-post/${postId}`,{ params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch comments.' };
        }
    },

    addCommentByUser: async (commentData) => {
        try {
            if (!commentData.postId || commentData.postId <= 0) {
                throw new Error('PostId must be a positive integer.');
            }
            if (!commentData.commentText || commentData.commentText.trim() === '') {
                throw new Error('CommentText is required.');
            }
            const response = await apiClient.post('/PostComment/user',commentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to add comment.' };
        }
    },

    editCommentByUser: async (commentId,commentData) => {
        try {
            if (!commentId || commentId <= 0) {
                throw new Error('CommentId must be a positive integer.');
            }
            if (!commentData.postId || commentData.postId <= 0) {
                throw new Error('PostId must be a positive integer.');
            }
            if (!commentData.commentText || commentData.commentText.trim() === '') {
                throw new Error('CommentText is required.');
            }
            const response = await apiClient.put(`/PostComment/user/${commentId}`,commentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to edit comment.' };
        }
    },

    deleteCommentByUser: async (commentId) => {
        try {
            if (!commentId || commentId <= 0) {
                throw new Error('CommentId must be a positive integer.');
            }
            const response = await apiClient.delete(`/PostComment/delete/user/${commentId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete comment.' };
        }
    },
};

export default apiPostCommentService;