import api from "./api";

const roleService = {
    // List available permissions grouped by module
    getAvailablePermissions: async () => {
        const response = await api.get("/rbac/permissions/available/");
        return response.data;
    },

    // Create a new role
    createRole: async (data) => {
        // Expected data: { name, description, slug }
        const response = await api.post("/rbac/roles/create/", data);
        return response.data;
    },

    /**
     * Get all roles for the specific tenant (identified by slug).
     * @param {string} slug - The tenant slug
     * @returns {Promise<Object>} Response data
     */
    getRoles: async (slug) => {
        const response = await api.get(`/rbac/roles/?slug=${slug}`);
        return response.data;
    },

    // Update a role
    updateRole: async (roleId, data) => {
        // Expected data: { name, description }
        const response = await api.put(`/rbac/roles/${roleId}/update/`, data);
        return response.data;
    },

    // Deactivate a role
    deactivateRole: async (roleId) => {
        const response = await api.delete(`/rbac/roles/${roleId}/deactivate/`);
        return response.data;
    },

    // Assign role to a user
    assignRole: async (data) => {
        // Expected data: { tenant_user_id, role } - org_id handled by JWT
        const response = await api.post("/rbac/roles/assign/", data);
        return response.data;
    },

    // Get permissions for a role (ListRolePermissionsAPIView)
    getRolePermissions: async (roleId, slug) => {
        // SaaS User: GET /rbac/roles/<id>/permissions/?slug=<slug>
        // Tenant Control: GET /rbac/roles/<id>/permissions/ (slug optional/ignored)
        const url = slug
            ? `/rbac/roles/${roleId}/permissions/?slug=${slug}`
            : `/rbac/roles/${roleId}/permissions/`;
        const response = await api.get(url);
        return response.data;
    },

    // Assign permissions to a role
    assignPermissions: async (data) => {
        // Expected data: { role_id, permissions: [], slug: "tenant-slug" } 
        const response = await api.post("/rbac/roles/assign-permissions/", data);
        return response.data;
    }
};

export default roleService;
