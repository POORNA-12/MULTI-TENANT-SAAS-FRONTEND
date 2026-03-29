import api from "./api";
import Cookies from "js-cookie";

const AuthService = {
    /**
     * Sign up a new user (Step 1: Request OTP, Step 2: Verify & Create).
     * @param {Object} data - Contains email, password, reenter_password, user_type, [verification_key].
     * @returns {Promise<Object>} Response data
     */
    signUp: async (data) => {
        const response = await api.post("/auth/signup/", data);
        if (response.data.data?.access) {
            // Step 2 success: Store tokens
            Cookies.set("accessToken", response.data.data.access, { expires: 1 });
            Cookies.set("refreshToken", response.data.data.refresh, { expires: 7 });
            Cookies.set("userEmail", data.email, { expires: 7 });
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
        const response = await api.post("/auth/signin/", { email, password });
        if (response.data.data?.access) {
            Cookies.set("accessToken", response.data.data.access, { expires: 1 });
            Cookies.set("refreshToken", response.data.data.refresh, { expires: 7 });
            Cookies.set("userEmail", email, { expires: 7 });
            if (response.data.user_type) {
                Cookies.set("userType", response.data.user_type, { expires: 7 });
            }
        }
        return response.data;
    },

    /**
     * Get the stored user email.
     * @returns {string|null} User email or null
     */
    getUserEmail: () => {
        return Cookies.get("userEmail");
    },

    /**
     * Sign out the current user.
     * @returns {Promise<Object>} Response data
     */
    signOut: async () => {
        const refreshToken = Cookies.get("refreshToken");
        try {
            if (refreshToken) {
                await api.post("/auth/signout/", { refresh: refreshToken });
            }
        } catch (error) {
            console.error("Signout error:", error);
        } finally {
            Cookies.remove("accessToken");
            Cookies.remove("refreshToken");
            Cookies.remove("userEmail");
            Cookies.remove("userType");
            window.location.href = "/signin";
        }
    },

    /**
     * Refresh the access token using the refresh token.
     * @returns {Promise<Object>} Response data containing new access token
     */
    refreshToken: async () => {
        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        // BACKEND FIX: Added trailing slash to auth/refresh-access/
        const response = await api.post("/auth/refresh-access/", { refresh: refreshToken });

        if (response.data.access) {
            Cookies.set("accessToken", response.data.access, { expires: 1 });
        }
        // If backend rotates refresh token, it might return a new one. Update if present.
        if (response.data.refresh) {
            Cookies.set("refreshToken", response.data.refresh, { expires: 7 });
        }
        return response.data;
    },

    /**
     * Change the password for the authenticated user.
     * @param {Object} data - Contains old_password, new_password, confirm_password.
     * @returns {Promise<Object>} Response data
     */
    changePassword: async (data) => {
        const response = await api.post("/auth/change-password/", data);
        return response.data;
    },

    /**
     * Request a password reset OTP.
     * @param {string} email 
     * @returns {Promise<Object>} Response data
     */
    forgotPassword: async (email) => {
        const response = await api.post("/auth/forgot-password/", { email });
        return response.data;
    },

    /**
     * Reset the password using OTP.
     * @param {Object} data - Contains email, otp, new_password, confirm_password.
     * @returns {Promise<Object>} Response data
     */
    resetPassword: async (data) => {
        const response = await api.post("/auth/reset-password/", data);
        return response.data;
    },

    /**
     * Send verification token (Resend OTP).
     * @param {string} email 
     * @returns {Promise<Object>} Response data
     */
    sendVerificationToken: async (email) => {
        const response = await api.post("/auth/send-verification/", { email });
        return response.data;
    },

    /**
     * Check if the user is authenticated.
     * @returns {boolean} True if access token exists
     */
    isAuthenticated: () => {
        return !!Cookies.get("accessToken");
    },

    /**
     * Get the current access token.
     * @returns {string|null} Access token or null
     */
    getAccessToken: () => {
        return Cookies.get("accessToken");
    }
};

export default AuthService;
