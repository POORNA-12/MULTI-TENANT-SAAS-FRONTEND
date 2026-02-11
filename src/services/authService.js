import api from "./api";

const AuthService = {
    /**
     * Sign up a new user.
     * @param {Object} data - Contains email, password, reenter_password, verification_key (optional), user_type.
     * @returns {Promise<Object>} Response data
     */
    signUp: async (data) => {
        const response = await api.post("auth/signup", data);
        if (response.data.data?.access) {
            localStorage.setItem("accessToken", response.data.data.access);
            localStorage.setItem("refreshToken", response.data.data.refresh);
        }
        return response.data;
    },

    /**
     * Sign in an existing user.
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} Response data
     */
    signIn: async (email, password) => {
        const response = await api.post("auth/signin", { email, password });
        if (response.data.data?.access) {
            localStorage.setItem("accessToken", response.data.data.access);
            localStorage.setItem("refreshToken", response.data.data.refresh);
        }
        return response.data;
    },

    /**
     * Sign out the current user.
     * @returns {Promise<Object>} Response data
     */
    signOut: async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await api.post("auth/signout", { refresh: refreshToken });
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return response.data;
    },

    /**
     * Refresh the access token using the refresh token.
     * @returns {Promise<Object>} Response data containing new access token
     */
    refreshToken: async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await api.post("auth/refresh-access", { refresh: refreshToken });
        if (response.data.access) {
            localStorage.setItem("accessToken", response.data.access);
        }
        return response.data;
    },

    /**
     * Change the password for the authenticated user.
     * @param {Object} data - Contains old_password, new_password, confirm_password.
     * @returns {Promise<Object>} Response data
     */
    changePassword: async (data) => {
        const response = await api.post("auth/change-password", data);
        return response.data;
    },

    /**
     * Request a password reset OTP.
     * @param {string} email 
     * @returns {Promise<Object>} Response data
     */
    forgotPassword: async (email) => {
        const response = await api.post("auth/forgot-password", { email });
        return response.data;
    },

    /**
     * Reset the password using OTP.
     * @param {Object} data - Contains email, otp, new_password, confirm_password.
     * @returns {Promise<Object>} Response data
     */
    resetPassword: async (data) => {
        const response = await api.post("auth/reset-password", data);
        return response.data;
    },

    /**
     * Send verification token (for signup resend or initial verify flow? Depends on backend usage).
     * @param {string} email 
     * @returns {Promise<Object>} Response data
     */
    sendVerificationToken: async (email) => {
        const response = await api.post("auth/send-verification-token", { email });
        return response.data;
    },

    /**
     * Check if the user is authenticated.
     * @returns {boolean} True if access token exists
     */
    isAuthenticated: () => {
        return !!localStorage.getItem("accessToken");
    },

    /**
     * Get the current access token.
     * @returns {string|null} Access token or null
     */
    getAccessToken: () => {
        return localStorage.getItem("accessToken");
    }
};

export default AuthService;
