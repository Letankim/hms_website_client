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

const apiUserPaymentService = {
    getMyPayments: async (queryParams) => {
        try {
            const response = await apiClient.get('/UserPayment/my-payment',{ params: queryParams });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch payments.' };
        }
    },

    subscribeToPackage: async (purchaseDto) => {
        try {
            const response = await apiClient.post('/UserPayment/purchase',purchaseDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create payment.' };
        }
    },

    updatePayment: async (id,paymentDto) => {
        try {
            const response = await apiClient.put(`/UserPayment/${id}`,paymentDto);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update payment.' };
        }
    },

    checkPaymentStatus: async (paymentCode,subscriptionId,status) => {
        try {
            const response = await apiClient.get(`/UserPayment/${paymentCode}/payment-status?subscriptionId=${subscriptionId}&status=${status}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update payment.' };
        }
    }

};

export default apiUserPaymentService;