export const queryKeys = {
    // Global User/Org Data
    organizations: ['organizations'],

    // Roles & Assignments
    roles: (slug) => ['roles', slug],
    assignments: (slug) => ['assignments', slug],
    availablePermissions: ['availablePermissions'],

    // Other entities space
    workflows: (slug) => ['workflows', slug],
    templates: (slug) => ['templates', slug],
    auditLogs: (slug) => ['auditLogs', slug],
    users: (slug) => ['users', slug],
};
