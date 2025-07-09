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

const apiProfileService = {

    async registerProfile(profileData) {
        try {
            const response = await apiClient.post('/Profile/register',profileData);
            return response.data;
        } catch (error) {
            throw error?.response?.data;
        }
    }
};

export default apiProfileService;