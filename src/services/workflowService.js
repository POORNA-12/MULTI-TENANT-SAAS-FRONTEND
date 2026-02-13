import api from "./api";

const workflowService = {
    // List workflow requests
    getWorkflows: async () => {
        const response = await api.get("/workflows/list/");
        return response.data;
    },

    // Create a new workflow request (Draft)
    createWorkflow: async (data) => {
        // Expected data: { title, description }
        const response = await api.post("/workflows/create/", data);
        return response.data;
    },

    // Submit a workflow request
    submitWorkflow: async (workflowId) => {
        const response = await api.post(`/workflows/${workflowId}/submit/`);
        return response.data;
    },

    // Approve or Reject a workflow request
    performAction: async (workflowId, action) => {
        // action: "approve" or "reject"
        const response = await api.post(`/workflows/${workflowId}/action/`, { action });
        return response.data;
    }
};

export default workflowService;
