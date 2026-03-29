import api from "./api";

const billingService = {
    // Get all available subscription plans
    getPlans: async () => {
        try {
            const response = await api.get("/billing/plans/");
            return response.data;
        } catch (error) {
            console.error("Error fetching billing plans", error);
            throw error;
        }
    },

    // Get current user's active subscription
    getCurrentSubscription: async () => {
        try {
            const response = await api.get("/billing/subscription/");
            return response.data;
        } catch (error) {
            console.error("Error fetching current subscription", error);
            throw error;
        }
    },

    // Get usage statistics vs limits
    getUsageAndLimits: async () => {
        try {
            const response = await api.get("/billing/usage/");
            return response.data;
        } catch (error) {
            console.error("Error fetching billing usage", error);
            throw error;
        }
    },

    // Get user's invoice history
    getInvoices: async () => {
        try {
            const response = await api.get("/billing/invoices/");
            return response.data;
        } catch (error) {
            console.error("Error fetching invoices", error);
            throw error;
        }
    },

    // Create a Razorpay order
    createRazorpayOrder: async (planId) => {
        try {
            const response = await api.post("/billing/razorpay/create-order/", {
                plan_id: planId
            });
            return response.data; // { order_id: '...', amount: 12345, currency: 'INR', plan_id: '...' }
        } catch (error) {
            console.error("Error creating Razorpay order", error);
            throw error;
        }
    },

    // Verify Razorpay payment signature
    verifyRazorpayPayment: async (paymentData) => {
        try {
            const response = await api.post("/billing/razorpay/verify-signature/", paymentData);
            return response.data; // { status: '...' }
        } catch (error) {
            console.error("Error verifying Razorpay payment", error);
            throw error;
        }
    }
};

export default billingService;
