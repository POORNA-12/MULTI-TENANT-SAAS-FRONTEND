import axios from "axios";

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
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration (optional but recommended)
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
                const refreshToken = localStorage.getItem("refreshToken");
                if (refreshToken) {
                    // Call the refresh endpoint
                    const response = await axios.post("http://127.0.0.1:8000/auth/refresh-access", {
                        refresh: refreshToken
                    });

                    const { access } = response.data;

                    // Update local storage with new access token
                    localStorage.setItem("accessToken", access);

                    // Update the header for the original request and retry it
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, we do NOT redirect to login automatically per user request.
                // We just reject the promise. The user will have to manually sign out or 
                // subsequent requests will fail.
                console.error("Token refresh failed:", refreshError);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
