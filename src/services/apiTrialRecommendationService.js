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

const apiTrialRecommendationService = {
    createRecommendation: async (formData) => {
        const res = await apiClient.post("/TrialRecommendation/recommendations",formData);
        return res;
    },

    validateSession: async (sessionId) => {
        const res = await apiClient.get(`/TrialRecommendation/validate-session/${sessionId}`);
        return res;
    },

    getChatHistory: async (sessionId) => {
        const res = await apiClient.get(`/TrialRecommendation/chat-history/${sessionId}`);
        return res;
    },

    sendMessage: async (sessionId,message) => {
        const res = await apiClient.post(`/TrialRecommendation/chat/${sessionId}`,{ message });
        return res;
    },

    deleteSession: async (sessionId) => {
        const res = await apiClient.delete(`/TrialRecommendation/session/${sessionId}`);
        return res;
    },

    deleteMessage: async (sessionId,messageId) => {
        const res = await apiClient.delete(`/TrialRecommendation/chat/${sessionId}/message/${messageId}`);
        return res;
    }
};

export default apiTrialRecommendationService;
