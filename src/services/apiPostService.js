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

const apiPostService = {
    getMyPosts: async (queryParams) => {
        try {
            const response = await apiClient.get('/CommunityPost',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch posts.' };
        }
    },

    getPostsByTags: async (groupId,tagIds,queryParams) => {
        try {
            const response = await apiClient.get(`/CommunityPost/tags/${groupId}`,{
                params: {
                    tagIds,
                    ...queryParams
                },
                paramsSerializer: (params) => {
                    const searchParams = new URLSearchParams();
                    for (const [key,value] of Object.entries(params)) {
                        if (Array.isArray(value)) {
                            value.forEach((val) => searchParams.append(key,val));
                        } else if (value !== undefined && value !== null) {
                            searchParams.append(key,value);
                        }
                    }
                    return searchParams.toString();
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch posts by tags.' };
        }
    },

    getPostsByGroup: async (groupId,queryParams) => {
        try {
            const response = await apiClient.get(`/CommunityPost/group/${groupId}`,{
                params: queryParams,
                paramsSerializer: (params) => {
                    const searchParams = new URLSearchParams();
                    for (const [key,value] of Object.entries(params)) {
                        if (Array.isArray(value)) {
                            value.forEach((val) => searchParams.append(key,val));
                        } else if (value !== undefined && value !== null) {
                            searchParams.append(key,value);
                        }
                    }
                    return searchParams.toString();
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch posts by group.' };
        }
    },

    searchPostsInGroup: async (groupId,queryParams) => {
        return await apiPostService.getPostsByGroup(groupId,queryParams);
    },

    getPostById: async (id) => {
        try {
            const response = await apiClient.get(`/CommunityPost/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch post.' };
        }
    },

    getActivePostByIdForUser: async (id) => {
        try {
            const response = await apiClient.get(`/CommunityPost/active/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch active post.' };
        }
    },

    createPost: async (postDto) => {
        try {
            const response = await apiClient.post('/CommunityPost',postDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create post.' };
        }
    },

    updatePost: async (id,postDto) => {
        try {
            const response = await apiClient.put(`/CommunityPost/${id}`,postDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update post.' };
        }
    },

    softDeletePost: async (id) => {
        try {
            const response = await apiClient.delete(`/CommunityPost/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to soft delete post.' };
        }
    },

    restorePost: async (id) => {
        try {
            const response = await apiClient.post(`/CommunityPost/restore/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to restore post.' };
        }
    },

    restoreMultiplePosts: async (postIds) => {
        try {
            const response = await apiClient.post('/CommunityPost/restore-multiple',postIds);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to restore multiple posts.' };
        }
    },

    restoreAllPosts: async () => {
        try {
            const response = await apiClient.post('/CommunityPost/restore-all');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to restore all posts.' };
        }
    },

    getPostStatistics: async (queryParams) => {
        try {
            const response = await apiClient.get('/CommunityPost/statistics',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch post statistics.' };
        }
    },
};

export default apiPostService;