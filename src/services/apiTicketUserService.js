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

const apiTicketUserService = {
    getMyTickets: async (queryParams) => {
        try {
            const response = await apiClient.get("/ticket/me",{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch your tickets." };
        }
    },

    getTicketById: async (id) => {
        try {
            const response = await apiClient.get(`/ticket/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: `Failed to fetch ticket with ID ${id}.` };
        }
    },

    createTicket: async (ticketData) => {
        try {
            const response = await apiClient.post("/ticket",ticketData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to create ticket." };
        }
    },

    updateTicket: async (id,ticketData) => {
        try {
            const response = await apiClient.put(`/ticket/${id}`,ticketData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: `Failed to update ticket with ID ${id}.` };
        }
    },

    deleteTicket: async (id) => {
        try {
            const response = await apiClient.delete(`/ticket/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: `Failed to delete ticket with ID ${id}.` };
        }
    },

    addResponse: async (ticketId,responseData) => {
        try {
            const response = await apiClient.post(`/ticket/${ticketId}/response`,responseData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: `Failed to add response to ticket with ID ${ticketId}.` };
        }
    },

    getMyHistory: async (queryParams) => {
        try {
            const response = await apiClient.get("/ticket/me/history",{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch your ticket history." };
        }
    },

    getResponsesForUser: async (ticketId,queryParams) => {
        try {
            const response = await apiClient.get(`/ticket/${ticketId}/responses/user`,{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: `Failed to fetch responses for ticket with ID ${ticketId}.` };
        }
    },
};

export default apiTicketUserService;