import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshTokenPromise = null;

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


const apiUserService = {

  getTrainers: async () => {
    try {
      const response = await apiClient.get('/User/trainers');
      return response.data;
    } catch (error) {
      throw error.response?.data;
    }
  },

  getUserActiveById: async (id) => {
    try {
      const response = await apiClient.get(`/User/active/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data;
    }
  },

  updateUser: async (id,userData) => {
    try {
      const response = await apiClient.put(`/User/${id}`,userData);
      return response.data;
    } catch (error) {
      throw error.response?.data;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/User/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data;
    }
  },

  getUserStatistics: async (startDate,endDate) => {
    try {
      const response = await apiClient.get('/User/statistics',{ params: { startDate,endDate } });
      return response.data;
    } catch (error) {
      throw error.response?.data;
    }
  },

  updateAvatar: async (id,avatarUrl) => {
    try {
      const response = await apiClient.put(`/User/${id}/avatar`,{ AvatarUrl: avatarUrl });
      return response.data;
    } catch (error) {
      throw error.response?.data;
    }
  },

  updateStatus: async (id,status) => {
    try {
      const response = await apiClient.put(`/User/${id}/status`,{ Status: status });
      return response.data;
    } catch (error) {
      throw error.response?.data;
    }
  },

  getDeletedUsers: async (queryParams) => {
    try {
      const response = await apiClient.get('/User/deleted',{ params: queryParams });
      return response.data;
    } catch (error) {
      throw error.response?.data;
    }
  },

  permanentlyDeleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/User/${id}/permanent`);
      return response.data;
    } catch (error) {
      throw error.response?.data;
    }
  },

  restoreUser: async (id,status) => {
    try {
      const response = await apiClient.post(`/User/${id}/restore`,{ Status: status });
      return response.data;
    } catch (error) {
      throw error.response?.data;
    }
  },

  restoreUsers: async (userIds,status) => {
    try {
      const response = await apiClient.post('/User/restore',{ UserIds: userIds,Status: status });
      return response.data;
    } catch (error) {
      throw error.response?.data;
    }
  },
};

export default apiUserService;