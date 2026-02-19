import api from "./api";

const dashboardService = {
    getDashboardData: async () => {
        const response = await api.get("workflows/saas/dashboard/");
        return response.data;
    },

    getAuditLogs: async (params = {}) => {
        // Combined path: audits/ + saas/audit/activity/
        const response = await api.get("audits/saas/audit/activity/", { params });
        return response.data;
    },

    getAuditAnalytics: async () => {
        // Combined path: audits/ + saas/audit/analytics/
        const response = await api.get("audits/saas/audit/analytics/");
        return response.data;
    }
};

export default dashboardService;
