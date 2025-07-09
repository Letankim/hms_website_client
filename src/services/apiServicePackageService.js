import axios from 'axios';

// Initialize Axios client with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include Bearer token
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

// Service package API methods
const apiServicePackageService = {
  getAllActivePackages: async (queryParams) => {
    try {
      const response = await apiClient.get('/ServicePackage/all-active-package', { params: queryParams });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch active packages.' };
    }
  },

  getRelativePackageServiceByTrainer: async (trainerId, packageId, queryParams) => {
    try {
      const response = await apiClient.get(`/ServicePackage/trainer/${trainerId}/${packageId}/active`, {
        params: queryParams,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch active packages for trainer.' };
    }
  },

  getPackageById: async (id) => {
    try {
      const response = await apiClient.get(`/ServicePackage/active/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch package.' };
    }
  },

  getPackageByIdByTrainer: async (id) => {
    try {
      const response = await apiClient.get(`/ServicePackage/trainer/packageById/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch package.' };
    }
  },

  getMyPackageService: async (trainerId, queryParams) => {
    try {
      const response = await apiClient.get(`/ServicePackage/trainer/${trainerId}`, { params: queryParams });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch trainer packages.' };
    }
  },

  addPackageByTrainer: async (packageData) => {
    try {
      const response = await apiClient.post(`/ServicePackage/trainer`, packageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add package.' };
    }
  },

  updatePackageStatus: async (packageId, statusData) => {
    try {
      const response = await apiClient.put(`/ServicePackage/byTrainer/${packageId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: `Failed to update status for package ID ${packageId}.` };
    }
  },

  updatePackageByTrainer: async (packageId, packageData) => {
    try {
      const response = await apiClient.put(`/ServicePackage/byTrainer/${packageId}`, packageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: `Failed to update package ID ${packageId}.` };
    }
  },
};

export default apiServicePackageService;