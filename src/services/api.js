import axios from "axios";
import Cookies from "js-cookie";

// Create an Axios instance with base configuration
const api = axios.create({
    baseURL: "/", // Use relative path for Vite proxy
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add the access token to headers
api.interceptors.request.use(
    (config) => {
        // Skip Authorization header for auth endpoints
        const authEndpoints = ["auth/signin", "auth/signup", "auth/refresh-access"];
        const isAuthEndpoint = authEndpoints.some(endpoint => config.url.includes(endpoint));

        if (!isAuthEndpoint) {
            const token = Cookies.get("accessToken");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't already tried to refresh the token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = Cookies.get("refreshToken");
                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }

                // Call the refresh endpoint using axios directly to avoid circular dependency
                // or infinite loops if the refresh endpoint itself returns 401
                const response = await axios.post("/auth/refresh-access", {
                    refresh: refreshToken
                });

                const { access } = response.data;

                // Update cookie with new access token
                Cookies.set("accessToken", access);

                // If backend returns a new refresh token (rotation), update it
                if (response.data.refresh) {
                    Cookies.set("refreshToken", response.data.refresh);
                }

                // Update the header for the original request and retry it
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, we force logout
                Cookies.remove("accessToken");
                Cookies.remove("refreshToken");
                Cookies.remove("userEmail");
                Cookies.remove("userType");
                window.location.href = "/signin";
                return Promise.reject(refreshError);
            }
        }

        // If the error is 402 (Payment Required) - Quota Exceeded or Subscription Inactive
        if (error.response?.status === 402) {
            // Dispatch a custom event so the UI can show the Upgrade Modal globally
            window.dispatchEvent(
                new CustomEvent("billing:quota_exceeded", {
                    detail: error.response?.data
                })
            );
        }

        return Promise.reject(error);
    }
);

export default api;
