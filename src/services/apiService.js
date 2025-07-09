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

const apiService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "An error occurred during login." };
    }
  },

  getEarnings: async () => {
    try {
      const response = await apiClient.get("/dashboard/earnings");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch earnings data." };
    }
  },

  getPageViews: async () => {
    try {
      const response = await apiClient.get("/dashboard/page-views");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch page views data." };
    }
  },

  getTotalTasks: async () => {
    try {
      const response = await apiClient.get("/dashboard/total-tasks");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch total tasks data." };
    }
  },

  getDownloads: async () => {
    try {
      const response = await apiClient.get("/dashboard/downloads");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch downloads data." };
    }
  },

  getRepeatCustomerRate: async () => {
    try {
      const response = await apiClient.get("/dashboard/repeat-customer-rate");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch repeat customer rate data." };
    }
  },

  getProjectOverview: async () => {
    try {
      const response = await apiClient.get("/dashboard/project-overview");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch project overview data." };
    }
  },

  getProjectRelease: async () => {
    try {
      const response = await apiClient.get("/dashboard/project-release");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch project release data." };
    }
  },

  getAssignedUsers: async () => {
    try {
      const response = await apiClient.get("/dashboard/assigned-users");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch assigned users data." };
    }
  },

  getTransactions: async () => {
    try {
      const response = await apiClient.get("/dashboard/transactions");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch transactions data." };
    }
  },

  getTotalIncome: async () => {
    try {
      const response = await apiClient.get("/dashboard/total-income");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch total income data." };
    }
  },
};

export default apiService;