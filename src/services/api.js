import axios from "axios";
import Cookies from "js-cookie";

export const API_URL = import.meta.env.VITE_API_BASE_URL;
console.log("🚀 API Base URL initialized:", API_URL);

// Create an Axios instance with base configuration
const api = axios.create({
    baseURL: API_URL,
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

// Shared refresh promise to handle concurrent failed requests (Race condition safety)
let refreshPromise = null;

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

            // If a refresh is already in flight, wait for it
            if (refreshPromise) {
                try {
                    const access = await refreshPromise;
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                } catch (re) {
                    return Promise.reject(re);
                }
            }

            // Start a new refresh attempt
            refreshPromise = (async () => {
                try {
                    const refreshToken = Cookies.get("refreshToken");
                    if (!refreshToken) {
                        throw new Error("No refresh token available");
                    }

                    // BACKEND FIX: Added trailing slash to auth/refresh-access/
                    const refreshUrl = API_URL.endsWith('/') ? `${API_URL}auth/refresh-access/` : `${API_URL}/auth/refresh-access/`;
                    const response = await axios.post(refreshUrl, {
                        refresh: refreshToken
                    });

                    const { access } = response.data;

                    // Update cookie with new access token (1 day)
                    Cookies.set("accessToken", access, { expires: 1 });

                    // If backend returns a new refresh token (Rotation), update it
                    if (response.data.refresh) {
                        Cookies.set("refreshToken", response.data.refresh, { expires: 7 });
                    }

                    return access;
                } catch (refreshError) {
                    // If refresh fails, clear all and force login
                    Cookies.remove("accessToken");
                    Cookies.remove("refreshToken");
                    Cookies.remove("userEmail");
                    Cookies.remove("userType");
                    
                    // Signal logout to other tabs
                    localStorage.setItem('saas_logout_signal', Date.now());
                    
                    window.location.href = "/signin";
                    throw refreshError;
                } finally {
                    refreshPromise = null;
                }
            })();

            try {
                const access = await refreshPromise;
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (err) {
                return Promise.reject(err);
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
