import api from "./api";

const dashboardService = {
    getDashboardData: async () => {
        const response = await api.get("workflows/saas/dashboard/");
        return response.data;
    },

    getAuditLogs: async () => {
        // path("audits/", include("audits.urls")) -> path("saas/audit/activity/", ...
        // Combined: audits/saas/audit/activity/
        const response = await api.get("audits/saas/audit/activity/");
        return response.data;
    },

    getAuditAnalytics: async () => {
        // path("saas/audit/analytics/", SaaSActivityAnalyticsAPIView.as_view())
        // Combined: audits/saas/audit/analytics/
        const response = await api.get("audits/saas/audit/analytics/");
        return response.data;
    }
};

export default dashboardService;
