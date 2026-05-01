import { apiClient } from './api';

/**
 * Fetch available workflow templates for a tenant
 */
export async function getTemplates(slug) {
    return apiClient(`/workflows/${slug}/templates/`, {
        method: 'GET',
        auth: true,
        slug,
    });
}

/**
 * Submit a workflow request for a specific template/definition
 */
export async function applyWorkflow(slug, definitionId, body) {
    return apiClient(`/workflows/${slug}/workflows/${definitionId}/apply/`, {
        method: 'POST',
        body,
        auth: true,
        slug,
    });
}

/**
 * Get the status of a specific workflow request
 */
export async function getRequestStatus(slug, requestId) {
    return apiClient(`/workflows/${slug}/workflows/${requestId}/status/`, {
        method: 'GET',
        auth: true,
        slug,
    });
}

/**
 * Get the current user's workflow requests (legacy)
 */
export async function getMyWorkflows(slug) {
    return apiClient(`/workflows/${slug}/workflows/my/`, {
        method: 'GET',
        auth: true,
        slug,
    });
}

/**
 * Get the current user's workflow requests (My Requests)
 */
export async function getMyRequests(slug, status = null) {
    let url = `/workflows/${slug}/workflows/my/`;
    if (status) {
        url += `?status=${status}`;
    }
    return apiClient(url, {
        method: 'GET',
        auth: true,
        slug,
    });
}

/**
 * Get unified workflow approvals dashboard data
 */
export async function getApprovalsDashboard(slug) {
    return apiClient(`/workflows/${slug}/approvals/dashboard/`, {
        method: 'GET',
        auth: true,
        slug,
    });
}
/**
 * Approve a workflow request
 */
export async function approveWorkflowRequest(slug, requestId) {
    return apiClient(`/workflows/${slug}/workflows/${requestId}/approve/`, {
        method: 'POST',
        auth: true,
        slug,
    });
}

/**
 * Reject a workflow request
 */
export async function rejectWorkflowRequest(slug, requestId, description) {
    return apiClient(`/workflows/${slug}/workflows/${requestId}/reject/`, {
        method: 'POST',
        body: { description },
        auth: true,
        slug,
    });
}
