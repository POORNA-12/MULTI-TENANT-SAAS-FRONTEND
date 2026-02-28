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

    // Create a Stripe checkout session for upgrading/downgrading
    createCheckoutSession: async (stripePriceId) => {
        try {
            const response = await api.post("/billing/checkout/session/", {
                stripe_price_id: stripePriceId
            });
            return response.data; // { checkout_url: '...' }
        } catch (error) {
            console.error("Error creating checkout session", error);
            throw error;
        }
    }
};

export default billingService;
