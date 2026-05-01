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

    getAuditAnalytics: async (params = {}) => {
        // Combined path: audits/ + saas/audit/analytics/
        const response = await api.get("audits/saas/audit/analytics/", { params });
        return response.data;
    },

    getTenantAuditLogs: async (tenantSlug, params = {}) => {
        const response = await api.get(`audits/saas_tenant_scope/${tenantSlug}/audit/activity/`, { params });
        return response.data;
    },

    getTenantAuditAnalytics: async (tenantSlug, params = {}) => {
        const response = await api.get(`audits/saas_tenant_scope/${tenantSlug}/audit/analytics/`, { params });
        return response.data;
    }
};

export default dashboardService;
