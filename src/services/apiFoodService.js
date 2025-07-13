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


const apiFoodService = {

  getAllActiveFoods: async (queryParams) => {
    try {
      console.error(queryParams)
      const response = await apiClient.get('/Food/all-active-food',{ params: queryParams });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch active foods.' };
    }
  },


  getAllFoods: async (queryParams) => {
    try {
      const response = await apiClient.get('/Food',{ params: queryParams });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch foods.' };
    }
  },


  getFoodById: async (id) => {
    try {
      const response = await apiClient.get(`/Food/${id}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch food.' };
    }
  },

  createFood: async (foodDto) => {
    try {
      const response = await apiClient.post('/Food',foodDto);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create food.' };
    }
  },


  updateFood: async (id,foodDto) => {
    try {
      const response = await apiClient.put(`/Food/${id}`,foodDto);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update food.' };
    }
  },


  softDeleteFood: async (id) => {
    try {
      const response = await apiClient.delete(`/Food/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete food.' };
    }
  },


  getFoodStatistics: async (queryParams) => {
    try {
      const response = await apiClient.get('/Food/statistics',{ params: queryParams });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch food statistics.' };
    }
  },
};

export default apiFoodService;