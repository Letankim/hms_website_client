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

const apiTrainerPayoutService = {
    getPayoutsByTrainerId: async (trainerId,queryParams) => {
        try {
            const response = await apiClient.get(`/trainer-payout/trainer/${trainerId}`,{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch payouts." };
        }
    },

    getPayoutById: async (payoutId) => {
        try {
            const response = await apiClient.get(`/trainer-payout/${payoutId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch payout." };
        }
    },

    getPayoutStatistics: async (trainerId,queryParams) => {
        try {
            const response = await apiClient.get(`/trainer-payout/statistics/trainer/${trainerId}`,{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch payout statistics." };
        }
    },
};

export default apiTrainerPayoutService;