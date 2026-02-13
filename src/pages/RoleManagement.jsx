import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import roleService from "../services/roleService";
import organizationService from "../services/organizationService";
import tenantUserService from "../services/tenantUserService";
import ConfirmationModal from "../components/ConfirmationModal";
import PermissionsViewModal from "../components/PermissionsViewModal";


// Helper to format permission codes into readable labels
const formatPermissionLabel = (code) => {
    const parts = code.split('.');
    if (parts.length > 1) {
        // e.g., "workflow.create_request" -> "Create Request"
        return parts[1]
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    return code;
};

const CreateRoleModal = ({ isOpen, onClose, onSubmit, isLoading, initialData = null, activeOrg }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [availablePermissions, setAvailablePermissions] = useState({});
    const [isFetchingPermissions, setIsFetchingPermissions] = useState(false);

    // Fetch grouped permissions on mount or modal open
    const fetchAvailablePermissions = async () => {
        try {
            const data = await roleService.getAvailablePermissions();
            setAvailablePermissions(data.permissions || {});
        } catch (error) {
            console.error("Failed to fetch available permissions:", error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchAvailablePermissions();
            setName(initialData?.name || "");
            setDescription(initialData?.description || "");
            setSelectedPermissions([]);

            if (initialData) {
                // Fetch existing permissions for the role
                const fetchRolePermissions = async () => {
                    if (!activeOrg?.slug) return;
                    setIsFetchingPermissions(true);
                    try {
                        const data = await roleService.getRolePermissions(initialData.id, activeOrg.slug);
                        // Ensure permissions is an array of strings (codes)
                        setSelectedPermissions(data.permissions || []);
                    } catch (error) {
                        console.error("Failed to fetch role permissions:", error);
                    } finally {
                        setIsFetchingPermissions(false);
                    }
                };
                fetchRolePermissions();
            }
        }
    }, [isOpen, initialData, activeOrg]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, description, permissions: selectedPermissions });
    };

    const togglePermission = (code) => {
        setSelectedPermissions(prev =>
            prev.includes(code)
                ? prev.filter(p => p !== code)
                : [...prev, code]
        );
    };

    const toggleGroup = (moduleName, permissions) => {
        const allSelected = permissions.every(p => selectedPermissions.includes(p));
        if (allSelected) {
            // Unselect all
            setSelectedPermissions(prev => prev.filter(p => !permissions.includes(p)));
        } else {
            // Select all
            const newPerms = [...selectedPermissions];
            permissions.forEach(p => {
                if (!newPerms.includes(p)) newPerms.push(p);
            });
            setSelectedPermissions(newPerms);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {initialData ? "Edit Role" : "Create New Role"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">Define role details and assign permissions.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="roleForm" onSubmit={handleSubmit} className="space-y-8">
                        {/* Role Details Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Role Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 font-medium"
                                    placeholder="e.g. Content Manager"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                                    placeholder="Access level description..."
                                />
                            </div>
                        </div>

                        {/* Permissions Section */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-400 text-lg">lock</span>
                                    Access Permissions
                                </h4>
                                <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                                    {selectedPermissions.length} selected
                                </span>
                            </div>

                            <div className="p-6 bg-white min-h-[300px]">
                                {isFetchingPermissions ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                                        <p className="text-sm">Loading permissions...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(availablePermissions).map(([module, perms]) => {
                                            const allSelected = perms.every(p => selectedPermissions.includes(p));
                                            return (
                                                <div key={module} className="border border-gray-100 rounded-lg p-4 hover:border-blue-100 hover:shadow-sm transition-all bg-gray-50/30">
                                                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                                                        <h5 className="text-sm font-bold text-gray-800 capitalize flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                            {module}
                                                        </h5>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleGroup(module, perms)}
                                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            {allSelected ? "Unselect All" : "Select All"}
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {perms.map((permCode) => (
                                                            <label key={permCode} className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                                                                <div className="relative flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedPermissions.includes(permCode)}
                                                                        onChange={() => togglePermission(permCode)}
                                                                        className="peer appearance-none w-4 h-4 border border-gray-300 rounded bg-white checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                                                                    />
                                                                    <span className="material-symbols-outlined text-white text-[10px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
                                                                        check
                                                                    </span>
                                                                </div>
                                                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors select-none">
                                                                    {formatPermissionLabel(permCode)}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {Object.keys(availablePermissions).length === 0 && (
                                            <div className="col-span-2 text-center text-gray-400 py-8">
                                                No permissions available.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-white hover:border-gray-300 hover:text-gray-800 transition-all shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="roleForm"
                        disabled={isLoading}
                        className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black shadow-lg shadow-gray-900/10 disabled:opacity-70 disabled:shadow-none transition-all flex items-center gap-2"
                    >
                        {isLoading && <span className="animate-spin text-white">⟳</span>}
                        {initialData ? "Save Changes" : "Create Role"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RoleTable = ({ roles, onDelete, onEdit, onViewPermissions }) => (
    <div className="bg-white border border-[#d0dbe7] rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 border-b border-[#d0dbe7] text-xs font-bold text-[#4e7397] uppercase tracking-wider">
                    <th className="p-4">Role Name</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Permissions</th>
                    <th className="p-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[#d0dbe7]">
                {roles.length === 0 ? (
                    <tr>
                        <td colSpan="4" className="p-8 text-center text-sm text-[#4e7397]">
                            No roles found. Create a new role to get started.
                        </td>
                    </tr>
                ) : (
                    roles.map((role, index) => (
                        <tr
                            key={role.id}
                            className="hover:bg-slate-50 transition-colors group animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <td className="p-4">
                                <span className="font-bold text-[#0e141b] text-sm">{role.name}</span>
                            </td>
                            <td className="p-4">
                                <span className="text-sm text-[#4e7397]">{role.description}</span>
                            </td>
                            <td className="p-4">
                                {role.name === 'panel-admin' ? (
                                    <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded">
                                        All Permissions
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => onViewPermissions(role)}
                                        className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-800 transition-colors"
                                    >
                                        {(role.permissions || []).length} Permissions
                                    </button>
                                )}
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(role)}
                                        className="size-8 rounded flex items-center justify-center text-[#4e7397] hover:bg-slate-100 hover:text-blue-600 transition-colors"
                                        title="Edit Role"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                    <button
                                        onClick={() => onDelete(role.id)}
                                        className="size-8 rounded flex items-center justify-center text-[#4e7397] hover:bg-red-50 hover:text-red-600 transition-colors"
                                        title="Delete Role"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

export default function RoleManagement() {
    console.log("RoleManagement component mounting...");
    const [activeTab, setActiveTab] = useState("roles");
    const [roles, setRoles] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [activeOrg, setActiveOrg] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null); // Track role being edited
    const [editingAssignment, setEditingAssignment] = useState(null); // Track assignment being edited
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");


    // Confirmation Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [assignmentToDelete, setAssignmentToDelete] = useState(null); // For removing user assignment

    // Permissions View Modal State
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [viewPermissionsRole, setViewPermissionsRole] = useState(null);
    const [isPermissionLoading, setIsPermissionLoading] = useState(false);

    const fetchRoles = async (slug) => {
        if (!slug) return;
        setIsLoading(true);
        try {
            const data = await roleService.getRoles(slug);
            const initialRoles = data.roles || [];

            // Fetch permissions for each role in parallel
            const rolesWithPermissions = await Promise.all(
                initialRoles.map(async (role) => {
                    try {
                        const permData = await roleService.getRolePermissions(role.id, slug);
                        return { ...role, permissions: permData.permissions || [] };
                    } catch (err) {
                        console.error(`Failed to fetch permissions for role ${role.id}`, err);
                        return role;
                    }
                })
            );

            setRoles(rolesWithPermissions);
        } catch (error) {
            console.error("Failed to fetch roles:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch assignments (users) from the active organization
    const fetchAssignments = async (orgSlug) => {
        try {
            const data = await tenantUserService.getTenantUsers(orgSlug);
            const users = Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : []);

            const mappedAssignments = users.map(user => ({
                id: user.id || user.user_id, // Capture user ID
                user_email: user.email,
                role_name: user.role || "-",
                scope: "Tenant",
                assigned_at: user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"
            }));

            setAssignments(mappedAssignments);
        } catch (error) {
            console.error("Failed to fetch tenant users:", error);
            setAssignments([]);
        }
    };

    const fetchActiveOrg = async () => {
        try {
            const data = await organizationService.getOrganizations();
            const active = data.organizations?.find(org => org.is_active);
            if (active) {
                setActiveOrg(active);
                fetchRoles(active.slug);
                fetchAssignments(active.slug);
            }
        } catch (error) {
            console.error("Failed to fetch active organization:", error);
        }
    };

    useEffect(() => {
        fetchActiveOrg();
        const handleOrgChange = () => fetchActiveOrg();
        window.addEventListener("activeOrgChanged", handleOrgChange);
        return () => window.removeEventListener("activeOrgChanged", handleOrgChange);
    }, []);

    useEffect(() => {
        setSearchQuery("");
    }, [activeTab]);

    // Open model for editing
    const handleEditRole = (role) => {
        setEditingRole(role);
        setIsCreateModalOpen(true);
    };

    // Open modal for creating
    const openCreateModal = () => {
        setEditingRole(null);
        setIsCreateModalOpen(true);
    };

    const handleSaveRole = async (roleData) => {
        if (!activeOrg) return;
        setIsLoading(true);
        try {
            let roleId;
            if (editingRole) {
                // Update existing role
                await roleService.updateRole(editingRole.id, {
                    name: roleData.name,
                    description: roleData.description
                });
                roleId = editingRole.id;
            } else {
                // Create new role
                const newRole = await roleService.createRole({
                    name: roleData.name,
                    description: roleData.description,
                    slug: activeOrg.slug
                });
                roleId = newRole.role.id; // Backend returns { role: { id: ... } }
            }

            // Assign permissions
            if (roleData.permissions && roleId) {
                await roleService.assignPermissions({
                    role_id: roleId,
                    permissions: roleData.permissions,
                    slug: activeOrg.slug
                });
            }

            setIsCreateModalOpen(false);
            setEditingRole(null);
            if (activeOrg) fetchRoles(activeOrg.slug);
        } catch (error) {
            console.error("Failed to save role:", error);
            alert(error.response?.data?.message || "Failed to save role");
        } finally {
            setIsLoading(false);
        }
    };



    // Open logic for editing an assignment
    const handleEditAssignment = (assignment) => {
        setEditingAssignment(assignment);
        setIsAssignModalOpen(true);
    };

    const handleRemoveAssignment = (assignment) => {
        setAssignmentToDelete(assignment);
        setIsDeleteModalOpen(true);
    };

    const confirmRemoveAssignment = async () => {
        if (!assignmentToDelete) return;
        if (!activeOrg) return;
        setIsLoading(true);
        try {
            await tenantUserService.removeTenantUser(activeOrg.slug, assignmentToDelete.id);
            if (activeOrg) fetchAssignments(activeOrg.slug);
            setIsDeleteModalOpen(false);
            setAssignmentToDelete(null);
        } catch (error) {
            console.error("Failed to remove assignment:", error);
            alert("Failed to remove user from tenant");
        } finally {
            setIsLoading(false);
        }
    };

    // ... handleAssignRole (no changes needed if it uses fetchAssignments which was already taking slug) ...

    const handleAssignRole = async (assignData) => {
        if (!activeOrg) return;
        setIsLoading(true);
        try {
            // Find user ID from assignments list
            const targetUser = assignments.find(u => u.user_email === assignData.email);

            if (!targetUser || !targetUser.id) {
                // Fallback: If we can't find ID, we might need a dedicated lookup or API might accept email
                // For now, show alert if ID missing
                console.warn("User ID not found for assignment");
                // Proceeding with email if API supports it, or failing.
                // Assuming API needs tenant_user_id. 
                // If we can't find it, we can't proceed with standard API.
                // Let's try to pass email as tenant_user_id if backend handles it, or just alert.
                // Based on backend view, it expects "tenant_user_id". 
                alert("Could not find user details. Ensure user is already a member of this tenant.");
                setIsLoading(false);
                return;
            }

            await roleService.assignRole({
                tenant_user_id: targetUser.id,
                role: assignData.role
            });

            setIsAssignModalOpen(false);
            fetchAssignments(activeOrg.slug); // Reload data
        } catch (error) {
            console.error("Failed to assign role:", error);
            alert(error.response?.data?.message || "Failed to assign role");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteRole = (roleId) => {
        const role = roles.find(r => r.id === roleId);
        setRoleToDelete(role);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteRole = async () => {
        if (!roleToDelete) return;
        setIsLoading(true);
        try {
            await roleService.deactivateRole(roleToDelete.id);
            if (activeOrg) fetchRoles(activeOrg.slug);
            setIsDeleteModalOpen(false);
            setRoleToDelete(null);
        } catch (error) {
            console.error("Failed to delete role:", error);
            alert("Failed to deactivate role");
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewPermissions = (role) => {
        setViewPermissionsRole(role);
        setIsPermissionsModalOpen(true);
    };



    // ... filteredRoles and return ...

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredAssignments = assignments.filter(assignment =>
        assignment.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.role_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-[#0e141b] tracking-tight">
                        {activeTab === "roles" ? "Role Management Service Hub" : "Role Assignment Management Hub"}
                    </h1>
                    <p className="text-sm text-[#4e7397] mt-1">
                        Manage granular Role-Based Access Control (RBAC) and assign permissions across your tenants.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#d0dbe7] mb-6">
                    <button
                        onClick={() => setActiveTab("roles")}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "roles"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-[#4e7397] hover:text-[#0e141b]"
                            }`}
                    >
                        Roles
                    </button>
                    <button
                        onClick={() => setActiveTab("assignment")}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "assignment"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-[#4e7397] hover:text-[#0e141b]"
                            }`}
                    >
                        Role Assignment
                    </button>
                </div>

                {/* Content */}
                {activeTab === "roles" && (
                    <>
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                            <div className="relative w-full sm:w-96">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4e7397] text-lg">search</span>
                                <input
                                    type="text"
                                    placeholder="Filter by role name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-[#d0dbe7] rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <button
                                onClick={openCreateModal}
                                className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded shadow-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Create Role
                            </button>
                        </div>

                        {/* Table */}
                        <RoleTable
                            roles={filteredRoles}
                            onDelete={handleDeleteRole}
                            onEdit={handleEditRole}
                            onViewPermissions={handleViewPermissions}
                        />
                    </>
                )}

                {activeTab === "assignment" && (
                    <>
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                            <div className="relative w-full sm:w-96">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4e7397] text-lg">search</span>
                                <input
                                    type="text"
                                    placeholder="Filter by user email or role..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-[#d0dbe7] rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <button
                                onClick={() => setIsAssignModalOpen(true)}
                                className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded shadow-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">person_add</span>
                                Assign Role
                            </button>
                        </div>

                        {/* Assignment Table */}
                        <RoleAssignmentTable
                            assignments={filteredAssignments} // Pass filtered assignments here
                            roles={roles} // Pass roles to look up permission counts
                            onEdit={(assignment) => {
                                setEditingAssignment(assignment);
                                setIsAssignModalOpen(true);
                            }}
                            onRemove={handleRemoveAssignment}
                        />
                    </>
                )}
            </div>

            <CreateRoleModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingRole(null);
                }}
                onSubmit={handleSaveRole}
                isLoading={isLoading}
                initialData={editingRole}
                activeOrg={activeOrg}
            />

            <AssignRoleModal
                isOpen={isAssignModalOpen}
                onClose={() => {
                    setIsAssignModalOpen(false);
                    setEditingAssignment(null);
                }}
                onSubmit={handleAssignRole}
                isLoading={isLoading}
                roles={roles}
                initialData={editingAssignment}
            />


            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setRoleToDelete(null);
                    setAssignmentToDelete(null);
                }}
                onConfirm={roleToDelete ? confirmDeleteRole : confirmRemoveAssignment}
                title={roleToDelete ? "Deactivate Role" : "Remove User"}
                message={
                    roleToDelete
                        ? `Are you sure you want to deactivate the role "${roleToDelete?.name}"? Users assigned to this role might lose access.`
                        : `Are you sure you want to remove access for "${assignmentToDelete?.user_email}"? They will lose all permissions.`
                }
                confirmText={isLoading ? (roleToDelete ? "Deactivating..." : "Removing...") : (roleToDelete ? "Deactivate" : "Remove")}
                isDangerous={true}
                isLoading={isLoading}
            />

            <PermissionsViewModal
                isOpen={isPermissionsModalOpen}
                onClose={() => {
                    setIsPermissionsModalOpen(false);
                    setViewPermissionsRole(null);
                }}
                title={viewPermissionsRole ? `Permissions for ${viewPermissionsRole.name}` : "Role Permissions"}
                permissions={viewPermissionsRole?.permissions || []}
            />


        </DashboardLayout>
    );
}

const RoleAssignmentTable = ({ assignments, roles, onEdit, onRemove }) => {
    const getPermissionCount = (roleName) => {
        if (roleName === 'panel-admin') return 'All Permissions';
        const role = roles.find(r => r.name === roleName);
        return role ? `${(role.permissions || []).length} Permissions` : '-';
    };

    return (
        <div className="bg-white border border-[#d0dbe7] rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-[#d0dbe7] text-xs font-bold text-[#4e7397] uppercase tracking-wider">
                        <th className="p-4">User Email</th>
                        <th className="p-4">Assigned Role</th>
                        <th className="p-4">Permissions</th>
                        <th className="p-4">Scope</th>
                        <th className="p-4">Date Assigned</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#d0dbe7]">
                    {assignments.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="p-8 text-center text-sm text-[#4e7397]">
                                No role assignments found.
                            </td>
                        </tr>
                    ) : (

                        assignments.map((assignment, index) => (
                            <tr
                                key={index}
                                className="hover:bg-slate-50 transition-colors group animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <td className="p-4">
                                    <span className="font-bold text-[#0e141b] text-sm">{assignment.user_email}</span>
                                </td>
                                <td className="p-4">
                                    <button className="text-sm font-bold text-blue-600 hover:underline">
                                        {assignment.role_name}
                                    </button>
                                </td>
                                <td className="p-4">
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${assignment.role_name === 'panel-admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-600'}`}>
                                        {getPermissionCount(assignment.role_name)}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${assignment.scope === 'Global' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {assignment.scope || 'Tenant'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm text-[#4e7397]">{assignment.assigned_at || '-'}</span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(assignment)}
                                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onRemove(assignment)}
                                            className="text-[10px] font-bold text-red-600 hover:text-red-800 uppercase tracking-wider"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <div className="p-4 border-t border-[#d0dbe7] bg-gray-50 flex justify-end">
                {/* Pagination controls same as RoleTable */}
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-white border border-[#d0dbe7] rounded text-xs font-bold text-[#4e7397] disabled:opacity-50">Previous</button>
                    <div className="px-3 py-1 text-xs font-bold text-[#4e7397] flex items-center">Showing 1-4 of 42</div>
                    <button className="px-3 py-1 bg-white border border-[#d0dbe7] rounded text-xs font-bold text-[#4e7397] disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    );
};

const AssignRoleModal = ({ isOpen, onClose, onSubmit, isLoading, roles, initialData = null }) => {
    const [email, setEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setEmail(initialData.user_email || "");
                setSelectedRole(initialData.role_name || "");
            } else {
                setEmail("");
                setSelectedRole("");
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ email, role: selectedRole });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {initialData ? "Update Assignment" : "Assign Role"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {initialData ? "Change role for existing user." : "Grant access to a user."}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6">
                    <form id="assignForm" onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">User Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder="user@example.com"
                                required
                                disabled={!!initialData} // Disable email when editing
                            />
                            {initialData && <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Role</label>
                            <div className="relative">
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="">Select a role...</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.name}>{role.name}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl">expand_more</span>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-white hover:border-gray-300 hover:text-gray-800 transition-all shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="assignForm"
                        disabled={isLoading}
                        className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black shadow-lg shadow-gray-900/10 disabled:opacity-70 disabled:shadow-none transition-all flex items-center gap-2"
                    >
                        {isLoading && <span className="animate-spin text-white">⟳</span>}
                        {initialData ? "Update Assignment" : "Assign Role"}
                    </button>
                </div>
            </div>
        </div>
    );
};

