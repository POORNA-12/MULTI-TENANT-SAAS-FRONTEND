import api from "./api";

const organizationService = {
    createOrganization: async (data) => {
        const response = await api.post("/tenant_auth/organization/create", data);
        return response.data;
    },

    getOrganizations: async () => {
        const response = await api.get("/tenant_auth/organization/list");
        return response.data;
    },

    setActiveOrganization: async (organizationId) => {
        const response = await api.post("/tenant_auth/organization/set-active", {
            organization_id: organizationId
        });
        return response.data;
    },

    updateOrganization: async (id, data) => {
        const response = await api.put(`/tenant_auth/organization/${id}/update/`, data);
        return response.data;
    },

    restoreOrganization: async (id) => {
        const response = await api.post(`/tenant_auth/organization/${id}/restore/`);
        return response.data;
    },

    softDeleteOrganization: async (id) => {
        const response = await api.delete(`/tenant_auth/organization/${id}/delete/`);
        return response.data;
    },

    hardDeleteOrganization: async (id) => {
        const response = await api.delete(`/tenant_auth/organization/${id}/hard-delete/`);
        return response.data;
    }
};

export default organizationService;
