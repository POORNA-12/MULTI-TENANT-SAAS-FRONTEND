import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import roleService from "../services/roleService";
import organizationService from "../services/organizationService";
import tenantUserService from "../services/tenantUserService";
import ConfirmationModal from "../components/ConfirmationModal";
import PermissionsViewModal from "../components/PermissionsViewModal";
import AlertModal from "../components/AlertModal";
import { useSearch } from "../context/SearchContext";

/* ─── Inline JWT Guide helpers ──────────────────────────────────────────── */
const JwtCodeBlock = ({ code, lang = "python" }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    const bgMap = { python: "bg-[#1e293b] text-[#93c5fd]", javascript: "bg-[#1e1b4b] text-[#a5b4fc]", json: "bg-[#1a1a2e] text-[#86efac]" };
    const label = lang === "javascript" ? "Node.js" : lang === "json" ? "JSON" : "Python";
    return (
        <div className="relative rounded-lg overflow-hidden border border-[#d0dbe7] shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-[#0f172a] border-b border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
                <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">{copied ? "check" : "content_copy"}</span>
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>
            <pre className={`p-4 overflow-x-auto text-xs font-mono leading-relaxed ${bgMap[lang] || bgMap.python}`} style={{ maxHeight: '320px', overflowY: 'auto' }}>{code}</pre>
        </div>
    );
};

const JwtInfoBox = ({ type = "info", children }) => {
    const s = { info: "bg-blue-50 border-blue-200 text-blue-900", warning: "bg-amber-50 border-amber-200 text-amber-900", danger: "bg-red-50 border-red-200 text-red-800", success: "bg-green-50 border-green-200 text-green-900" };
    const ic = { info: "info", warning: "warning", danger: "gpp_bad", success: "verified" };
    return (<div className={`flex items-start gap-3 p-4 rounded-lg border ${s[type]}`}><span className="material-symbols-outlined mt-0.5 shrink-0 text-xl">{ic[type]}</span><p className="text-sm leading-relaxed">{children}</p></div>);
};

const JwtSection = ({ id, icon, badgeColor, badge, title, children }) => {
    const [open, setOpen] = useState(true);
    return (
        <div id={id} className="bg-white border border-[#d0dbe7] rounded-xl shadow-sm overflow-hidden">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                <div className="flex items-center gap-3">
                    <span className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${badgeColor}`}>
                        <span className="material-symbols-outlined text-lg">{icon}</span>
                    </span>
                    <div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${badgeColor} mr-2`}>{badge}</span>
                        <span className="text-sm font-bold text-[#0e141b]">{title}</span>
                    </div>
                </div>
                <span className={`material-symbols-outlined text-[#4e7397] transition-transform duration-300 ${open ? "rotate-180" : ""}`}>expand_more</span>
            </button>
            {open && <div className="p-6 border-t border-[#d0dbe7] space-y-5">{children}</div>}
        </div>
    );
};


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
        <div className="overflow-x-auto">
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
    </div>
);

export default function RoleManagement() {
    console.log("RoleManagement component mounting...");
    const { searchQuery, setSearchQuery } = useSearch(); // Use global search
    const [activeTab, setActiveTab] = useState("roles");
    const [roles, setRoles] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [activeOrg, setActiveOrg] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null); // Track role being edited
    const [editingAssignment, setEditingAssignment] = useState(null); // Track assignment being edited
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    // Confirmation Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [assignmentToDelete, setAssignmentToDelete] = useState(null); // For removing user assignment

    // Permissions View Modal State
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [viewPermissionsRole, setViewPermissionsRole] = useState(null);
    const [isPermissionLoading, setIsPermissionLoading] = useState(false);

    // Alert Modal State
    const [alertData, setAlertData] = useState({ isOpen: false, title: "", message: "", type: "success" });
    const showAlert = (title, message, type = "error") => setAlertData({ isOpen: true, title, message, type });

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
    // Fetch assignments (users) from the active organization
    const fetchAssignments = async (orgSlug) => {
        try {
            // Use roleService to get assignments with support for search/pagination
            const data = await roleService.getRoleAssignments(orgSlug, {
                page: 1,
                page_size: 10,
                search: searchQuery
            });

            // Map the API results to our internal state structure
            const mappedAssignments = (data.results || []).map(item => ({
                // CRITICAL: user_id is fallback if assignment_id is missing from GET response.
                // Ideally backend should provide assignment_id (TenantUserRole.id) for Update/Delete.
                assignment_id: item.assignment_id, // CRITICAL: No fallback to user_id allowed
                user_id: item.user_id,
                user_email: item.email,
                role_name: item.role || "-",
                role_id: item.role_id,
                permissions_count: item.permissions_count,
                scope: item.scope,
                assigned_at: item.date_joined
            }));

            setAssignments(mappedAssignments);
        } catch (error) {
            console.error("Failed to fetch role assignments:", error);
            setAssignments([]);
        }
    };

    const fetchActiveOrg = async () => {
        try {
            const data = await organizationService.getOrganizations();
            const active = data.organizations?.find(org => org.current);
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
                roleId = newRole.role.id; // Backend returns {role: {id: ... } }
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
            showAlert("Error", error.response?.data?.message || "Failed to save role", "error");
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
            // Use roleService.deleteRoleAssignment with the correct ID
            // IMPORTANT: Uses assignment_id mapped during fetch
            await roleService.deleteRoleAssignment(activeOrg.slug, assignmentToDelete.assignment_id);
            if (activeOrg) fetchAssignments(activeOrg.slug);
            setIsDeleteModalOpen(false);
            setAssignmentToDelete(null);
            showAlert("Success", "Role assignment removed successfully", "success");
        } catch (error) {
            console.error("Failed to remove assignment:", error);
            showAlert("Error", "Failed to remove role assignment.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // ... handleAssignRole (no changes needed if it uses fetchAssignments which was already taking slug) ...

    const handleAssignRole = async (assignData) => {
        if (!activeOrg) return;
        setIsLoading(true);
        try {
            if (editingAssignment) {
                // UPDATE existing assignment (PATCH)
                // Need to find Role Name from ID selection (since API expects name)
                const selectedRole = roles.find(r => r.id == assignData.role);
                const roleName = selectedRole ? selectedRole.name : assignData.role;

                await roleService.updateRoleAssignment(activeOrg.slug, {
                    assignment_id: editingAssignment.assignment_id,
                    role: roleName
                });

                showAlert("Success", "Role assignment updated successfully", "success");
            } else {
                // CREATE new assignment (or assign to user without role)

                // If we clicked "Assign" on a user row (no role), we might have user object but no role
                // We need the user's ID.
                let targetUserId = null;

                // If editingAssignment is set (from row click), use its user_id
                if (editingAssignment && editingAssignment.user_id) {
                    targetUserId = editingAssignment.user_id;
                } else {
                    // Manual "Assign" button - lookup by email
                    try {
                        // We need to fetch users to find ID by email if not available locally
                        const usersData = await tenantUserService.getTenantUsers(activeOrg.slug);
                        const allUsers = usersData.users || (Array.isArray(usersData) ? usersData : []);
                        const user = allUsers.find(u => u.email === assignData.email);
                        if (user) targetUserId = user.id || user.user_id;
                    } catch (err) {
                        console.error("Error looking up user:", err);
                    }
                }

                if (!targetUserId) {
                    showAlert("User Not Found", "Could not find user details.", "error");
                    setIsLoading(false);
                    return;
                }

                await roleService.assignRole({
                    organization_id: activeOrg.id,
                    tenant_user_id: targetUserId,
                    role: assignData.role
                });
                showAlert("Success", "Role assigned successfully", "success");
            }

            setIsAssignModalOpen(false);
            setEditingAssignment(null);
            fetchAssignments(activeOrg.slug); // Reload data
        } catch (error) {
            console.error("Failed to assign role:", error);
            showAlert("Error", error.response?.data?.message || "Failed to assign role.", "error");
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
            showAlert("Error", "Failed to deactivate role.", "error");
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
            <AlertModal
                isOpen={alertData.isOpen}
                onClose={() => setAlertData(prev => ({ ...prev, isOpen: false }))}
                title={alertData.title}
                message={alertData.message}
                type={alertData.type}
            />
            <>
                {/* Header */}
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-black text-[#0e141b] tracking-tight">
                            {activeTab === "roles" ? "Role Management Service Hub" : activeTab === "assignment" ? "Role Assignment Management Hub" : "JWT Integration Guide"}
                        </h1>
                        <p className="text-sm text-[#4e7397] mt-1">
                            {activeTab === "jwt" ? "A complete backend integration reference for JWT authentication & permission enforcement." : "Manage granular Role-Based Access Control (RBAC) and assign permissions across your tenants."}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-[#d0dbe7] mb-6">
                        <button onClick={() => setActiveTab("roles")} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "roles" ? "border-blue-500 text-blue-600" : "border-transparent text-[#4e7397] hover:text-[#0e141b]"}`}>
                            Roles
                        </button>
                        <button onClick={() => setActiveTab("assignment")} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "assignment" ? "border-blue-500 text-blue-600" : "border-transparent text-[#4e7397] hover:text-[#0e141b]"}`}>
                            Role Assignment
                        </button>
                        <button onClick={() => setActiveTab("jwt")} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "jwt" ? "border-blue-500 text-blue-600" : "border-transparent text-[#4e7397] hover:text-[#0e141b]"}`}>
                            <span className="material-symbols-outlined text-base">key</span>
                            JWT Guide
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

                    {/* ── JWT Integration Guide Tab ── */}
                    {activeTab === "jwt" && (
                        <div className="flex flex-col lg:flex-row gap-8 relative">
                            <style>{`html { scroll-behavior: smooth; } pre.jwt-pre::-webkit-scrollbar{height:8px;width:8px} pre.jwt-pre::-webkit-scrollbar-track{background:transparent} pre.jwt-pre::-webkit-scrollbar-thumb{background-color:#334155;border-radius:4px}`}</style>

                            {/* Sticky Sidebar */}
                            <div className="hidden lg:block w-64 shrink-0">
                                <div className="sticky top-24 bg-white border border-[#d0dbe7] rounded-xl shadow-sm p-5 space-y-1">
                                    <h4 className="text-xs font-bold text-[#0e141b] uppercase tracking-wider mb-4 px-3">Documentation</h4>
                                    {[
                                        { id: "jwt-overview", title: "Overview" },
                                        { id: "jwt-algorithm", title: "Token Algorithm" },
                                        { id: "jwt-verify", title: "Verify JWT" },
                                        { id: "jwt-payload", title: "JWT Payload" },
                                        { id: "perm-enforce", title: "Permission Enforcement" },
                                        { id: "jwt-refresh", title: "Refresh Flow" },
                                        { id: "perm-version", title: "perm_version Behavior" },
                                        { id: "jwt-errors", title: "Error Handling" },
                                        { id: "jwt-security", title: "Security Best Practices" }
                                    ].map((item) => (
                                        <a
                                            key={item.id}
                                            href={`#${item.id}`}
                                            className="block px-3 py-2 text-sm text-[#4e7397] font-medium rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                        >
                                            {item.title}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 space-y-8 min-w-0">
                                {/* SECTION 1 — OVERVIEW */}
                                <div id="jwt-overview" className="scroll-mt-24 space-y-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-[#0e141b] tracking-tight">JWT Integration Guide</h2>
                                        <p className="text-sm text-[#4e7397] leading-relaxed mt-2 max-w-3xl">
                                            This guide provides everything you need to know about integrating our Role-Based Access Control (RBAC) securely into your backend services. Learn how tokens are structured, validated, and used to enforce permissions instantly.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 border border-[#d0dbe7] rounded-xl p-6 flex flex-col md:flex-row items-center justify-center gap-6 shadow-sm">
                                        <div className="flex flex-col items-center text-center gap-2">
                                            <div className="size-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><span className="material-symbols-outlined">login</span></div>
                                            <span className="text-xs font-bold text-[#4e7397]">1. User Authenticates</span>
                                        </div>
                                        <span className="material-symbols-outlined text-[#d0dbe7] hidden md:block">arrow_forward</span>
                                        <div className="flex flex-col items-center text-center gap-2">
                                            <div className="size-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><span className="material-symbols-outlined">token</span></div>
                                            <span className="text-xs font-bold text-[#4e7397]">2. Receives JWT</span>
                                        </div>
                                        <span className="material-symbols-outlined text-[#d0dbe7] hidden md:block">arrow_forward</span>
                                        <div className="flex flex-col items-center text-center gap-2">
                                            <div className="size-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><span className="material-symbols-outlined">api</span></div>
                                            <span className="text-xs font-bold text-[#4e7397]">3. Backend Verifies</span>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2 — ALGORITHM */}
                                <div id="jwt-algorithm" className="scroll-mt-24">
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                                        <div className="flex items-start gap-4">
                                            <div className="size-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined">lock</span>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Token Algorithm</h3>
                                                <div className="mt-2 flex items-center gap-2 bg-white px-3 py-2 rounded border border-indigo-200 shadow-sm">
                                                    <code className="text-sm font-mono text-indigo-800">RS256 (RSA Signature with SHA-256)</code>
                                                </div>
                                                <p className="text-xs text-indigo-700/70 mt-2">Always use your tenant's public key to verify signatures.</p>
                                            </div>
                                        </div>
                                        <div className="text-right hidden md:block shrink-0">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                                <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                Auth Service Active
                                            </span>
                                            <p className="text-xs text-indigo-800/60 mt-2">v1.2.0 · TAS-Auth-Service</p>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 1 — JWT VERIFY */}
                                <div id="jwt-verify" className="scroll-mt-24 space-y-4 pt-6">
                                    <h3 className="text-lg font-bold text-[#0e141b]">Verify JWT in Backend</h3>
                                    <JwtInfoBox type="danger">
                                        Your backend <strong>must verify the JWT signature</strong> using your tenant's public key before trusting payload data. Skipping this allows attackers to forge tokens.
                                    </JwtInfoBox>
                                    <p className="text-sm text-[#4e7397] leading-relaxed">
                                        After a user authenticates, your backend receives a Bearer token. Use the public key to verify the RS256 signature before processing any request.
                                    </p>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold text-[#4e7397] uppercase tracking-wider flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Python Example
                                            </h4>
                                            <JwtCodeBlock lang="python" code={`import jwt\n\nPUBLIC_KEY = "your-public-key"\n\ndef verify_token(token):\n    return jwt.decode(\n        token,\n        PUBLIC_KEY,\n        algorithms=["RS256"]\n    )`} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold text-[#4e7397] uppercase tracking-wider flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Node.js Example
                                            </h4>
                                            <JwtCodeBlock lang="javascript" code={`const jwt = require("jsonwebtoken");\n\nfunction verifyToken(token) {\n  return jwt.verify(token, PUBLIC_KEY);\n}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 4 — JWT PAYLOAD */}
                                <div id="jwt-payload" className="scroll-mt-24 space-y-4 pt-6">
                                    <h3 className="text-lg font-bold text-[#0e141b]">JWT Payload Structure</h3>
                                    <p className="text-sm text-[#4e7397] leading-relaxed">
                                        The decoded JWT payload contains essential user and tenant context. Ensure you only read this data <strong>after</strong> verifying the signature.
                                    </p>
                                    <div className="bg-slate-50 border border-[#d0dbe7] rounded-xl overflow-hidden shadow-sm">
                                        <div className="p-4 border-b border-[#d0dbe7] bg-white">
                                            <h4 className="text-xs font-bold text-[#0e141b] uppercase tracking-wider">Example Payload</h4>
                                        </div>
                                        <div className="p-4">
                                            <JwtCodeBlock lang="json" code={`{\n  "tenant_id": "uuid",\n  "tenant_user_id": "uuid",\n  "roles": ["manager"],\n  "permissions": ["workflow.create"],\n  "perm_version": 3,\n  "exp": 1734567890\n}`} />
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm bg-white">
                                                <thead>
                                                    <tr className="bg-slate-50 border-y border-[#d0dbe7] text-xs font-bold text-[#4e7397] uppercase tracking-wider">
                                                        <th className="p-4 w-1/3">Field</th>
                                                        <th className="p-4">Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#d0dbe7]">
                                                    {[
                                                        ["tenant_id", "Unique ID for the tenant organisation"],
                                                        ["tenant_user_id", "Internal ID of the authenticated user"],
                                                        ["roles", "List of assigned role identifiers"],
                                                        ["permissions", "Flat list of permission strings"],
                                                        ["perm_version", "Increments whenever roles/permissions change"],
                                                        ["exp", "UNIX timestamp of token expiry"]
                                                    ].map(([f, d]) => (
                                                        <tr key={f} className="hover:bg-slate-50 transition-colors">
                                                            <td className="p-4"><code className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{f}</code></td>
                                                            <td className="p-4 text-[#4e7397] text-xs">{d}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 5 — PERMISSION ENFORCEMENT */}
                                <div id="perm-enforce" className="scroll-mt-24 space-y-4 pt-6">
                                    <h3 className="text-lg font-bold text-[#0e141b]">Enforce Permissions in Your API</h3>
                                    <JwtInfoBox type="info">
                                        Before executing any protected action, check that the verified token contains the required permission. <strong>Never rely on frontend checks alone.</strong>
                                    </JwtInfoBox>
                                    <p className="text-sm text-[#4e7397] leading-relaxed">
                                        Create a middleware or decorator in your backend language of choice to streamline permission checks across all your secured API routes.
                                    </p>
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-[#4e7397] uppercase tracking-wider flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Python Decorator Example
                                        </h4>
                                        <JwtCodeBlock lang="python" code={`def require_permission(permission):\n    def decorator(func):\n        def wrapper(request):\n            token = request.headers["Authorization"].split(" ")[1]\n            decoded = verify_token(token)\n\n            if permission not in decoded.get("permissions", []):\n                return {"error": "Forbidden"}, 403\n\n            return func(request)\n        return wrapper\n    return decorator`} />
                                    </div>
                                </div>

                                {/* SECTION 6 — REFRESH FLOW */}
                                <div id="jwt-refresh" className="scroll-mt-24 space-y-4 pt-6">
                                    <h3 className="text-lg font-bold text-[#0e141b]">Refresh Flow</h3>
                                    <p className="text-sm text-[#4e7397] leading-relaxed">
                                        Access tokens expire quickly to minimize security risks. Use the refresh token endpoint to obtain a new access token without requiring the user to log in again.
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 border border-[#d0dbe7] rounded-lg">
                                        <span className="px-2.5 py-1 rounded text-xs font-bold ring-1 ring-inset bg-green-100 text-green-700 border-green-200 shadow-sm">POST</span>
                                        <code className="text-sm font-mono text-[#0e141b] font-bold">/tenant/refresh/</code>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                        <div className="space-y-2 col-span-1 lg:col-span-1">
                                            <h4 className="text-xs font-bold text-[#4e7397] uppercase tracking-wider">Request Body</h4>
                                            <JwtCodeBlock lang="json" code={`{\n  "refresh": "<refresh_token>"\n}`} />
                                        </div>
                                        <div className="space-y-2 col-span-1 lg:col-span-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">200</span>
                                                <span className="text-[10px] font-bold text-green-700 uppercase">Success Response</span>
                                            </div>
                                            <JwtCodeBlock lang="json" code={`{\n  "access": "<new_auth_token>"\n}`} />
                                        </div>
                                        <div className="space-y-2 col-span-1 lg:col-span-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">401</span>
                                                <span className="text-[10px] font-bold text-red-700 uppercase">Error Response</span>
                                            </div>
                                            <JwtCodeBlock lang="json" code={`{\n  "message": "Invalid token"\n}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 7 — PERM VERSION */}
                                <div id="perm-version" className="scroll-mt-24 space-y-4 pt-6">
                                    <h3 className="text-lg font-bold text-[#0e141b]">perm_version Behavior</h3>
                                    <JwtInfoBox type="warning">
                                        If a user's role or permissions change, <strong>previously issued tokens are invalidated automatically</strong>.
                                    </JwtInfoBox>
                                    <p className="text-sm text-[#4e7397] leading-relaxed">
                                        The <code className="mx-1 px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono text-[#0e141b]">perm_version</code> claim tracks the exact state of permissions when the token was issued. If an admin edits a role, the central version increments, instantly rendering older tokens invalid during the next backend verification.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                        <div className="bg-white border border-red-200 rounded-xl p-5 flex flex-col items-center text-center gap-3 shadow-sm relative overflow-hidden group hover:border-red-300 transition-colors">
                                            <div className="absolute inset-0 bg-red-50/50 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                                            <div className="relative z-10 flex flex-col items-center">
                                                <div className="size-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-2 border border-red-100">
                                                    <span className="material-symbols-outlined text-[24px]">manage_accounts</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">Role Assigned<br />or Updated</span>
                                                <span className="material-symbols-outlined text-red-300 my-2">arrow_downward</span>
                                                <span className="text-[10px] font-bold px-2.5 py-1 bg-red-100 text-red-700 rounded-full border border-red-200 shadow-sm">&rarr; perm_version++</span>
                                                <span className="text-xs font-bold text-red-600 mt-3">Old Tokens Invalidated</span>
                                            </div>
                                        </div>
                                        <div className="bg-white border border-red-200 rounded-xl p-5 flex flex-col items-center text-center gap-3 shadow-sm relative overflow-hidden group hover:border-red-300 transition-colors">
                                            <div className="absolute inset-0 bg-red-50/50 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                                            <div className="relative z-10 flex flex-col items-center">
                                                <div className="size-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-2 border border-red-100">
                                                    <span className="material-symbols-outlined text-[24px]">add_moderator</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">Permission Added<br />to Active Role</span>
                                                <span className="material-symbols-outlined text-red-300 my-2">arrow_downward</span>
                                                <span className="text-[10px] font-bold px-2.5 py-1 bg-red-100 text-red-700 rounded-full border border-red-200 shadow-sm">&rarr; perm_version++</span>
                                                <span className="text-xs font-bold text-red-600 mt-3">Old Tokens Invalidated</span>
                                            </div>
                                        </div>
                                        <div className="bg-white border border-green-200 rounded-xl p-5 flex flex-col items-center text-center gap-3 shadow-sm relative overflow-hidden group hover:border-green-300 transition-colors">
                                            <div className="absolute inset-0 bg-green-50/50 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                                            <div className="relative z-10 flex flex-col items-center">
                                                <div className="size-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-2 border border-green-100">
                                                    <span className="material-symbols-outlined text-[24px]">check_circle</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">No Changes<br />(Normal Use)</span>
                                                <span className="material-symbols-outlined text-green-300 my-2">arrow_downward</span>
                                                <span className="text-[10px] font-bold px-2.5 py-1 bg-green-100 text-green-700 rounded-full border border-green-200 shadow-sm">&rarr; Unchanged</span>
                                                <span className="text-xs font-bold text-green-600 mt-3">Tokens Remain Valid</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 8 — ERRORS */}
                                <div id="jwt-errors" className="scroll-mt-24 space-y-4 pt-6">
                                    <h3 className="text-lg font-bold text-[#0e141b]">Error Handling Guide</h3>
                                    <p className="text-sm text-[#4e7397] leading-relaxed">Ensure your frontend properly catches these status codes to handle session expiration or access denial flows gracefully.</p>
                                    <div className="bg-white border border-[#d0dbe7] rounded-xl overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-[#d0dbe7] text-xs font-bold text-[#4e7397] uppercase tracking-wider">
                                                        <th className="p-4 w-28">Status Code</th>
                                                        <th className="p-4 w-48">Meaning</th>
                                                        <th className="p-4 min-w-[200px]">Common Cause</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#d0dbe7]">
                                                    {[
                                                        ["401", "bg-red-100 text-red-700 border-red-200", "Invalid Token", "Token expired or signature mismatch with public key."],
                                                        ["403", "bg-orange-100 text-orange-700 border-orange-200", "Permission Denied", "Token verified securely but lacks the explicit permission needed."],
                                                        ["500", "bg-gray-100 text-gray-700 border-gray-200", "Server Error", "Unexpected backend exception during validation flow."]
                                                    ].map(([code, cls, meaning, cause]) => (
                                                        <tr key={code} className="hover:bg-slate-50 transition-colors">
                                                            <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold border shadow-sm ${cls}`}>{code}</span></td>
                                                            <td className="p-4 text-sm font-bold text-[#0e141b]">{meaning}</td>
                                                            <td className="p-4 text-sm text-[#4e7397]">{cause}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 9 — SECURITY */}
                                <div id="jwt-security" className="scroll-mt-24 space-y-4 pt-6">
                                    <h3 className="text-lg font-bold text-[#0e141b]">Security Best Practices</h3>
                                    <p className="text-sm text-[#4e7397] leading-relaxed">Adhere to these patterns to meet enterprise-grade compliance for Multi-Tenant architecture.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { ic: "verified_user", c: "text-blue-500", bg: "bg-blue-50 border-blue-100", t: "Always Verify Signature", d: "Use the RS256 public key on every protected request before reading claims." },
                                            { ic: "gpp_bad", c: "text-red-500", bg: "bg-red-50 border-red-100", t: "Never Trust Frontend", d: "All authorization decisions MUST be securely enforced server-side." },
                                            { ic: "policy", c: "text-purple-500", bg: "bg-purple-50 border-purple-100", t: "Validate Server-Side", d: "Extract permissions exclusively from the verified token payload." },
                                            { ic: "lock", c: "text-amber-500", bg: "bg-amber-50 border-amber-100", t: "Secure Refresh Token", d: "Use HttpOnly HTTP cookies. Never store via standard localStorage." },
                                            { ic: "hourglass_bottom", c: "text-teal-500", bg: "bg-teal-50 border-teal-100", t: "Graceful Expiry Handling", d: "Implement stealth background refresh logic to prevent user interrupts." },
                                            { ic: "key", c: "text-emerald-500", bg: "bg-emerald-50 border-emerald-100", t: "Periodic Key Rotation", d: "Subscribe to the JWKS endpoint to capture ongoing algorithmic key rotations." }
                                        ].map((item, idx) => (
                                            <div key={idx} className={`bg-white border rounded-xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-all ${item.bg}`}>
                                                <div className={`shrink-0 p-2 rounded-lg bg-white shadow-sm border ${item.bg}`}>
                                                    <span className={`material-symbols-outlined text-[28px] ${item.c}`}>{item.ic}</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-[#0e141b]">{item.t}</h4>
                                                    <p className="text-xs text-[#4e7397] mt-1.5 leading-relaxed">{item.d}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 mb-16 flex items-center justify-between text-xs text-[#4e7397] border-t border-[#d0dbe7] mr-4 lg:mr-0 mt-8">
                                    <span className="font-bold">Developer Portal</span>
                                    <span className="inline-flex items-center gap-1.5 font-mono"><span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>v1.0.0 Stable</span>
                                </div>
                            </div>
                        </div>
                    )}
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
                </div>
            </>
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
            <div className="overflow-x-auto">
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
                                            {assignment.assignment_id ? (
                                                <>
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
                                                </>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-not-allowed" title="No role assignment ID (User has no explicit role)">
                                                    No Actions
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
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
    const [selectedRoleId, setSelectedRoleId] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setEmail(initialData.user_email || "");
                const foundRole = roles.find(r => r.name === initialData.role_name);
                setSelectedRoleId(foundRole ? foundRole.id : "");
            } else {
                setEmail("");
                setSelectedRoleId("");
            }
        }
    }, [isOpen, initialData, roles]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ email, role: selectedRoleId });
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
                                    value={selectedRoleId}
                                    onChange={(e) => setSelectedRoleId(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="">Select a role...</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
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

