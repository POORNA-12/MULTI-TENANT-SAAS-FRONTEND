import api from "./api";

const notificationService = {
    /**
     * Fetch notification history for the authenticated user.
     * @returns {Promise<Array>} List of notifications
     */
    getNotifications: async () => {
        try {
            const response = await api.get("/notifications/");
            return response.data;
        } catch (error) {
            console.error("Error fetching notifications", error);
            throw error;
        }
    },

    /**
     * Mark a specific notification as read.
     * @param {string|number} id - Notification ID
     */
    markAsRead: async (id) => {
        try {
            const response = await api.patch(`/notifications/${id}/mark_read/`);
            return response.data;
        } catch (error) {
            console.error(`Error marking notification ${id} as read`, error);
            throw error;
        }
    },

    /**
     * Mark all notifications as read for the current user.
     */
    markAllAsRead: async () => {
        try {
            const response = await api.patch("/notifications/mark_all_read/");
            return response.data;
        } catch (error) {
            console.error("Error marking all notifications as read", error);
            throw error;
        }
    },

    /**
     * Retrieve user's notification preferences.
     */
    getPreferences: async () => {
        try {
            const response = await api.get("/notifications/preferences/");
            return response.data;
        } catch (error) {
            console.error("Error fetching notification preferences", error);
            throw error;
        }
    },

    /**
     * Update user's notification preferences.
     * @param {Object} prefs - Map of preferences to update
     */
    updatePreferences: async (prefs) => {
        try {
            const response = await api.patch("/notifications/preferences/", prefs);
            return response.data;
        } catch (error) {
            console.error("Error updating notification preferences", error);
            throw error;
        }
    }
};

export default notificationService;
