import api from "./api";
import Cookies from "js-cookie";

const AuthService = {
    /**
     * Sign up a new user.
     * @param {Object} data - Contains email, password, reenter_password, verification_key (optional), user_type.
     * @returns {Promise<Object>} Response data
     */
    signUp: async (data) => {
        const response = await api.post("auth/signup", data);
        if (response.data.data?.access) {
            // Default to session cookies for signup
            Cookies.set("accessToken", response.data.data.access);
            Cookies.set("refreshToken", response.data.data.refresh);
        }
        return response.data;
    },

    /**
     * Sign in an existing user.
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} Response data
     */
    signIn: async (email, password, rememberMe = false) => {
        const response = await api.post("auth/signin", { email, password });
        if (response.data.data?.access) {
            const cookieOptions = rememberMe ? { expires: 7 } : {}; // 7 days if remember me, else session
            Cookies.set("accessToken", response.data.data.access, cookieOptions);
            Cookies.set("refreshToken", response.data.data.refresh, cookieOptions);
            // Store email for display purposes since full profile might not be available immediately
            Cookies.set("userEmail", email, cookieOptions);
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
        if (refreshToken) {
            // Optional: Call backend to blacklist/revoke token
            await api.post("auth/signout", { refresh: refreshToken });
        }
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        Cookies.remove("userEmail");
        return { message: "Signed out successfully" };
    },

    /**
     * Refresh the access token using the refresh token.
     * @returns {Promise<Object>} Response data containing new access token
     */
    refreshToken: async () => {
        const refreshToken = Cookies.get("refreshToken");
        const response = await api.post("auth/refresh-access", { refresh: refreshToken });
        if (response.data.access) {
            // Maintain original expiration behavior if possible, or default to session/short-lived
            // For simplicity here, we might just set it as session or match refresh token's existence
            // But usually access tokens are short lived. We just set it.
            Cookies.set("accessToken", response.data.access);
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
