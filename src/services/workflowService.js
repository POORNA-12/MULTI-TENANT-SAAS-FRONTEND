import api from "./api";

const workflowService = {
    // List workflow requests
    getWorkflows: async (tenantSlug) => {
        const response = await api.get(`/workflows/${tenantSlug}/list/`);
        return response.data;
    },

    // Create Workflow Type
    createWorkflowType: async (tenantSlug, name) => {
        const response = await api.post(`/workflows/${tenantSlug}/types/create/`, { name });
        return response.data;
    },

    // Create Workflow Definition
    createWorkflowDefinition: async (tenantSlug, data) => {
        // Expected data: { workflow_type_id, name }
        const response = await api.post(`/workflows/${tenantSlug}/definitions/create/`, data);
        return response.data;
    },

    // Add Approval Step
    addApprovalStep: async (tenantSlug, definitionId, data) => {
        // Expected data: { step_order, approver_role }
        const response = await api.post(`/workflows/${tenantSlug}/definitions/${definitionId}/steps/add/`, data);
        return response.data;
    },

    // Submit a workflow request (Keep for now if needed for executing the workflow later)
    submitWorkflow: async (workflowId) => {
        const response = await api.post(`/workflows/${workflowId}/submit/`);
        return response.data;
    },

    // Approve or Reject a workflow request
    performAction: async (workflowId, action) => {
        // action: "approve" or "reject"
        const response = await api.post(`/workflows/${workflowId}/action/`, { action });
        return response.data;
    },

    // Get all templates (definitions with steps)
    getTemplates: async (tenantSlug) => {
        const response = await api.get(`/workflows/saas/${tenantSlug}/templates/`);
        return response.data;
    },

    // Create Full Workflow (Bootstrap)
    createFullWorkflow: async (tenantSlug, data) => {
        const response = await api.post(`/workflows/saas/${tenantSlug}/templates/`, data);
        return response.data;
    },

    // Update Template
    updateTemplate: async (tenantSlug, definitionId, data) => {
        const response = await api.put(`/workflows/saas/${tenantSlug}/templates/${definitionId}/manage/`, data);
        return response.data;
    },

    // Delete Template
    deleteTemplate: async (tenantSlug, definitionId) => {
        const response = await api.delete(`/workflows/saas/${tenantSlug}/templates/${definitionId}/manage/`);
        return response.data;
    }
};

export default workflowService;
