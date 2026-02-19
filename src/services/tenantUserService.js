import api from "./api";

const tenantUserService = {
    getTenantUsers: async (slug) => {
        const response = await api.get(`/tenant_auth/${slug}/users/`);
        return response.data;
    },

    inviteTenantUser: async (slug, data) => {
        const response = await api.post(`/tenant_auth/${slug}/users/invite/`, data);
        return response.data;
    },

    removeTenantUser: async (slug, userId) => {
        const response = await api.delete(`/tenant_auth/tenant/${slug}/users/${userId}/remove/`);
        return response.data;
    }
};

export default tenantUserService;
