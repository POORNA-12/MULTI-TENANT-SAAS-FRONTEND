import axios from "axios";
import Cookies from "js-cookie";

// Create an Axios instance with base configuration
const api = axios.create({
    baseURL: "http://127.0.0.1:8000/", // Replace with env variable in production
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add the access token to headers
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
                const response = await axios.post("http://127.0.0.1:8000/auth/refresh-access", {
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

        return Promise.reject(error);
    }
);

export default api;
