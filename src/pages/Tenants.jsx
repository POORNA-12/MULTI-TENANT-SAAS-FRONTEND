import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import organizationService from "../services/organizationService";
import tenantUserService from "../services/tenantUserService";
import ConfirmationModal from "../components/ConfirmationModal";
import AlertModal from "../components/AlertModal";
import { useSearch } from "../context/SearchContext";

export default function Tenants() {
    const { searchQuery, setSearchQuery } = useSearch(); // Use global search
    const [activeTab, setActiveTab] = useState("tenants");
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newOrgName, setNewOrgName] = useState("");
    const [newOrgSlug, setNewOrgSlug] = useState("");
    const [createLoading, setCreateLoading] = useState(false);

    // Edit Tenant State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [editTenantName, setEditTenantName] = useState("");
    const [editTenantSlug, setEditTenantSlug] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    // User Management State
    const [users, setUsers] = useState([]);

    const [usersLoading, setUsersLoading] = useState(false);
    const [totalUsers, setTotalUsers] = useState(0); // Added totalUsers state
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserRole, setNewUserRole] = useState("EMPLOYEE");
    const [addUserLoading, setAddUserLoading] = useState(false);

    // Modal & Alert State
    const [alertState, setAlertState] = useState({ isOpen: false, type: "info", title: "", message: "" });
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: "",
        message: "",
        isDangerous: false,
        isLoading: false,
        onConfirm: () => { }
    });

    const showAlert = (type, title, message) => {
        setAlertState({ isOpen: true, type, title, message });
    };

    const closeConfirm = () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
    };

    // Derived Active Organization
    const activeOrg = organizations.find(org => org.current);

    useEffect(() => {
        if (activeTab === "users" && activeOrg) {
            fetchUsers();
        }
    }, [activeTab, activeOrg]); // Re-fetch when tab or active org changes

    const fetchUsers = async () => {
        if (!activeOrg) return;
        setUsersLoading(true);
        try {
            const data = await tenantUserService.getTenantUsers(activeOrg.slug);

            setUsers(Array.isArray(data) ? data : data.users || []);
            setTotalUsers(data.total_users || (Array.isArray(data) ? data.length : 0));
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        setLoading(true);
        try {
            const data = await organizationService.getOrganizations();
            setOrganizations(data.organizations || []);
        } catch (error) {
            console.error("Failed to fetch organizations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTenant = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            await organizationService.createOrganization({
                name: newOrgName,
                slug: newOrgSlug
            });
            setIsCreateModalOpen(false);
            setNewOrgName("");
            setNewOrgSlug("");
            fetchOrganizations(); // Refresh list
            showAlert("success", "Tenant Created", "The new organization has been created successfully.");
        } catch (error) {
            console.error("Failed to create organization:", error);
            showAlert("error", "Creation Failed", error.response?.data?.message || "Failed to create organization");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleEditClick = (org) => {
        setEditingTenant(org);
        setEditTenantName(org.name);
        setEditTenantSlug(org.slug);
        setIsEditModalOpen(true);
    };

    const handleUpdateTenant = async (e) => {
        e.preventDefault();
        if (!editingTenant) return;
        setEditLoading(true);
        try {
            await organizationService.updateOrganization(editingTenant.id, {
                name: editTenantName,
                slug: editTenantSlug
            });
            setIsEditModalOpen(false);
            setEditingTenant(null);
            fetchOrganizations();
            showAlert("success", "Tenant Updated", "The organization details have been updated successfully.");
        } catch (error) {
            console.error("Failed to update organization:", error);
            showAlert("error", "Update Failed", error.response?.data?.message || "Failed to update organization");
        } finally {
            setEditLoading(false);
        }
    }


    const handleRestoreTenant = async (orgId) => {
        setConfirmState({
            isOpen: true,
            title: "Restore Organization",
            message: "Are you sure you want to restore this organization? This will re-enable access.",
            isDangerous: false, // Not dangerous since it's restoring
            isLoading: false,
            onConfirm: async () => {
                setConfirmState(prev => ({ ...prev, isLoading: true }));
                try {
                    await organizationService.restoreOrganization(orgId);
                    fetchOrganizations();
                    showAlert("success", "Organization Restored", "The organization has been restored successfully.");
                    closeConfirm();
                } catch (error) {
                    console.error("Failed to restore organization:", error);
                    showAlert("error", "Restore Failed", error.response?.data?.message || "Failed to restore organization");
                    setConfirmState(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    const handleSoftDeleteTenant = async (orgId) => {
        setConfirmState({
            isOpen: true,
            title: "Deactivate Organization",
            message: "Are you sure you want to deactivate this organization? This will disable access but keep the data.",
            isDangerous: true,
            isLoading: false,
            onConfirm: async () => {
                setConfirmState(prev => ({ ...prev, isLoading: true }));
                try {
                    await organizationService.softDeleteOrganization(orgId);
                    fetchOrganizations();
                    showAlert("success", "Organization Deactivated", "The organization has been deactivated successfully.");
                    closeConfirm();
                } catch (error) {
                    console.error("Failed to deactivate organization:", error);
                    showAlert("error", "Deactivation Failed", error.response?.data?.message || "Failed to deactivate organization");
                    setConfirmState(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    const handleHardDeleteTenant = async (orgId) => {
        setConfirmState({
            isOpen: true,
            title: "Permanently Delete Organization",
            message: "Are you sure you want to PERMANENTLY delete this organization? This action CANNOT be undone and ALL data will be lost.",
            isDangerous: true,
            isLoading: false,
            onConfirm: async () => {
                setConfirmState(prev => ({ ...prev, isLoading: true }));
                try {
                    await organizationService.hardDeleteOrganization(orgId);
                    fetchOrganizations();
                    showAlert("success", "Organization Deleted", "The organization has been permanently deleted.");
                    closeConfirm();
                } catch (error) {
                    console.error("Failed to delete organization:", error);
                    showAlert("error", "Delete Failed", error.response?.data?.message || "Failed to delete organization");
                    setConfirmState(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    const handleSetActive = async (orgId) => {
        try {
            await organizationService.setActiveOrganization(orgId);
            // Refresh organizations to reflect the change
            await fetchOrganizations();

            // Dispatch event to notify other components (like DashboardLayout)
            window.dispatchEvent(new Event("activeOrgChanged"));

            // Also show success message
            showAlert("success", "Context Switched", "Active organization changed successfully.");

        } catch (error) {
            console.error("Failed to set active organization:", error);
            showAlert("error", "Switch Failed", error.response?.data?.message || "Failed to switch organization");
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!activeOrg) return;
        setAddUserLoading(true);
        try {
            await tenantUserService.inviteTenantUser(activeOrg.slug, {
                email: newUserEmail,
                role: newUserRole
            });
            setIsAddUserModalOpen(false);
            setNewUserEmail("");
            setNewUserRole("EMPLOYEE");
            fetchUsers();
            showAlert("success", "User Invited", "The user has been invited to the organization successfully.");
        } catch (error) {
            console.error("Failed to invite user:", error);
            showAlert("error", "Invitation Failed", error.response?.data?.message || "Failed to invite user");
        } finally {
            setAddUserLoading(false);
        }
    };

    const handleRemoveUser = async (userId) => {
        if (!activeOrg) return;
        setConfirmState({
            isOpen: true,
            title: "Remove User",
            message: "Are you sure you want to remove this user from the organization?",
            isDangerous: true,
            isLoading: false,
            onConfirm: async () => {
                setConfirmState(prev => ({ ...prev, isLoading: true }));
                try {
                    await tenantUserService.removeTenantUser(activeOrg.slug, userId);
                    fetchUsers();
                    showAlert("success", "User Removed", "The user has been removed from the organization successfully.");
                    closeConfirm();
                } catch (error) {
                    console.error("Failed to remove user:", error);
                    showAlert("error", "Removal Failed", error.response?.data?.message || "Failed to remove user");
                    setConfirmState(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    // Filter organizations based on search query
    const filteredOrganizations = organizations.filter(org =>
        (org.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (org.slug?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (org.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );



    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-[#0e141b] tracking-tight">
                            Tenant & User Management Hub
                        </h1>
                        <p className="text-sm text-[#4e7397] mt-1">
                            Manage multi-tenant isolation, provisioning, and user access control across your infrastructure.
                        </p>
                    </div>
                    <div className="bg-white border border-[#d0dbe7] rounded px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-[#0e141b] shadow-sm">
                        <span className="text-[#4e7397] uppercase tracking-wider">ACTIVE CONTEXT:</span>
                        {activeOrg ? (
                            <>
                                <span className="size-2 rounded-full bg-green-500"></span>
                                <span>{activeOrg.name} ({activeOrg.slug})</span>
                            </>
                        ) : (
                            <span className="text-gray-400 italic">No active tenant selected</span>
                        )}
                        <span className="material-symbols-outlined text-base cursor-pointer hover:text-primary">swap_horiz</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-[#d0dbe7] mb-6 flex gap-8">
                <button
                    onClick={() => setActiveTab("tenants")}
                    className={`pb-3 text-sm font-bold relative transition-colors ${activeTab === "tenants" ? "text-blue-600" : "text-[#4e7397] hover:text-[#0e141b]"}`}
                >
                    Tenants
                    {activeTab === "tenants" && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("users")}
                    className={`pb-3 text-sm font-bold relative transition-colors ${activeTab === "users" ? "text-blue-600" : "text-[#4e7397] hover:text-[#0e141b]"}`}
                >
                    Users
                    {activeTab === "users" && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
                    )}
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4e7397]">search</span>
                    <input
                        type="text"
                        placeholder={activeTab === "tenants" ? "Find tenants by name, slug or owner..." : "Find users by email or name..."}
                        className="w-full h-10 pl-10 pr-4 bg-white border border-[#d0dbe7] rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="h-10 px-4 w-full sm:w-auto bg-white border border-[#d0dbe7] rounded text-sm font-bold text-[#0e141b] hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                    Filter
                </button>
                <div className="h-10 flex items-center px-2 text-xs font-bold text-[#4e7397] whitespace-nowrap">
                    {activeTab === "tenants" ? `${filteredOrganizations.length} tenants found` : `${totalUsers} users found in ${activeOrg?.name || 'Organization'}`}
                </div>
                {activeTab === "tenants" && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="h-10 px-4 w-full sm:w-auto bg-orange-500 rounded text-sm font-bold text-white hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Create Tenant
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white border border-[#d0dbe7] rounded-lg shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        {activeTab === "tenants" ? (
                            <>
                                <thead className="bg-[#f6f7f8] border-b border-[#d0dbe7]">
                                    <tr>
                                        <th className="px-6 py-3 font-bold text-[#4e7397] uppercase tracking-wider text-xs">Status</th>
                                        <th className="px-6 py-3 font-bold text-[#4e7397] uppercase tracking-wider text-xs">Tenant Name</th>
                                        <th className="px-6 py-3 font-bold text-[#4e7397] uppercase tracking-wider text-xs">Slug</th>
                                        <th className="px-6 py-3 font-bold text-[#4e7397] uppercase tracking-wider text-xs">Owner</th>
                                        <th className="px-6 py-3 font-bold text-[#4e7397] uppercase tracking-wider text-xs">Created At</th>
                                        <th className="px-6 py-3 font-bold text-[#4e7397] uppercase tracking-wider text-xs text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#d0dbe7]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-[#4e7397]">
                                                Loading tenants...
                                            </td>
                                        </tr>
                                    ) : filteredOrganizations.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-[#4e7397]">
                                                No tenants found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrganizations.map((org) => (
                                            <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${org.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                        <span className={`size-1.5 rounded-full ${org.is_active ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                                        {org.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-[#0e141b]">{org.name}</span>
                                                        {org.current && (
                                                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold uppercase rounded border border-blue-100">Current</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-[#4e7397]">
                                                    {org.slug}
                                                </td>
                                                <td className="px-6 py-4 text-[#0e141b]">
                                                    {org.email || org.created_by || "--"}
                                                </td>
                                                <td className="px-6 py-4 text-[#4e7397]">
                                                    {new Date(org.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {!org.current && org.is_active && (
                                                            <button
                                                                onClick={() => handleSetActive(org.id)}
                                                                className="p-1 hover:bg-green-50 rounded text-[#4e7397] hover:text-green-600 transition-colors"
                                                                title="Set as Active"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEditClick(org)}
                                                            className="p-1 hover:bg-blue-50 rounded text-[#4e7397] hover:text-blue-600 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                                        </button>
                                                        {org.is_deactivate ? (
                                                            <button
                                                                onClick={() => handleRestoreTenant(org.id)}
                                                                className="p-1 hover:bg-green-50 rounded text-green-600 hover:text-green-700 transition-colors"
                                                                title="Restore (Reactivate)"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">settings_backup_restore</span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleSoftDeleteTenant(org.id)}
                                                                className="p-1 hover:bg-slate-100 rounded text-[#4e7397] hover:text-[#0e141b] transition-colors"
                                                                title="Deactivate (Soft Delete)"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">block</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleHardDeleteTenant(org.id)}
                                                            className="p-1 hover:bg-red-50 rounded text-[#4e7397] hover:text-red-600 transition-colors"
                                                            title="Permanently Delete"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </>
                        ) : (
                            <>
                                <thead className="bg-[#f6f7f8] border-b border-[#d0dbe7]">
                                    <tr>
                                        <th className="px-6 py-3 font-bold text-[#4e7397] uppercase tracking-wider text-xs">User Status</th>
                                        <th className="px-6 py-3 font-bold text-[#4e7397] uppercase tracking-wider text-xs">User Email</th>
                                        <th className="px-6 py-3 font-bold text-[#4e7397] uppercase tracking-wider text-xs">Role</th>
                                        <th className="px-6 py-3 font-bold text-[#4e7397] uppercase tracking-wider text-xs">Date Added</th>
                                        <th className="px-6 py-3 font-bold text-[#4e7397] uppercase tracking-wider text-xs text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#d0dbe7]">
                                    {usersLoading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-[#4e7397]">
                                                Loading users...
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-[#4e7397]">
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${user.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                        <span className={`size-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                        {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-bold text-blue-600">{user.email}</p>
                                                        <p className="text-xs text-[#4e7397]">{user.first_name || user.username || user.email.split('@')[0]}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-white border border-[#d0dbe7] rounded text-[10px] font-bold text-[#0e141b] uppercase tracking-wide">
                                                        {user.role || "MEMBER"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-[#4e7397]">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "--"}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleRemoveUser(user.id)}
                                                            className="p-1 hover:bg-red-50 rounded text-[#4e7397] hover:text-red-600 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </>
                        )}
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-[#d0dbe7] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button className="size-8 flex items-center justify-center border border-[#d0dbe7] rounded hover:bg-slate-50 text-[#4e7397]">
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <span className="font-bold text-sm text-[#0e141b]">1</span>
                        <button className="size-8 flex items-center justify-center border border-[#d0dbe7] rounded hover:bg-slate-50 text-[#4e7397]">
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                    <span className="text-xs font-bold text-[#4e7397]">
                        {activeTab === "tenants" ? `Showing 1-${Math.min(10, filteredOrganizations.length)} of ${filteredOrganizations.length} tenants` : `Showing 1-${Math.min(10, users.length)} of ${totalUsers} users`}
                    </span>
                </div>
            </div>

            {/* Bottom Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeTab === "tenants" ? (
                    <>
                        <div className="bg-white border border-[#d0dbe7] rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-blue-500">bar_chart</span>
                                <h3 className="text-xs font-bold text-[#0e141b] uppercase tracking-wider">Storage Usage</h3>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-black text-[#0e141b]">4.2 TB</p>
                                    <p className="text-xs font-bold text-green-600 mt-1">+12% THIS MONTH</p>
                                </div>
                                <div className="flex gap-1 items-end h-8">
                                    <div className="w-1.5 bg-blue-100 h-3 rounded-t-sm"></div>
                                    <div className="w-1.5 bg-blue-200 h-5 rounded-t-sm"></div>
                                    <div className="w-1.5 bg-blue-300 h-4 rounded-t-sm"></div>
                                    <div className="w-1.5 bg-blue-400 h-6 rounded-t-sm"></div>
                                    <div className="w-1.5 bg-blue-500 h-8 rounded-t-sm"></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-[#d0dbe7] rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-purple-500">hub</span>
                                <h3 className="text-xs font-bold text-[#0e141b] uppercase tracking-wider">Active Instances</h3>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-black text-[#0e141b]">{organizations.length}</p>
                                    <p className="text-xs font-bold text-[#4e7397] mt-1">TOTAL TENANTS</p>
                                </div>
                                <span className="material-symbols-outlined text-[#d0dbe7] text-3xl">dns</span>
                            </div>

                        </div>

                        <div className="bg-white border border-[#d0dbe7] rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-orange-500">security</span>
                                <h3 className="text-xs font-bold text-[#0e141b] uppercase tracking-wider">Compliance Score</h3>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-black text-[#0e141b]">98.4%</p>
                                    <p className="text-xs font-bold text-green-600 mt-1">AUDIT PASSED</p>
                                </div>
                                <div className="relative size-10 flex items-center justify-center rounded-full border-4 border-orange-100 border-t-orange-500">
                                    <span className="text-[10px] font-bold text-orange-600">98%</span>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-white border border-[#d0dbe7] rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-blue-500">group</span>
                                <h3 className="text-xs font-bold text-[#0e141b] uppercase tracking-wider">User Retention</h3>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-black text-[#0e141b]">94.2%</p>
                                    <p className="text-xs font-bold text-green-600 mt-1">+2% THIS QUARTER</p>
                                </div>
                                <div className="flex gap-1 items-end h-8">
                                    <div className="w-1.5 bg-blue-100 h-2 rounded-t-sm"></div>
                                    <div className="w-1.5 bg-blue-200 h-3 rounded-t-sm"></div>
                                    <div className="w-1.5 bg-blue-300 h-5 rounded-t-sm"></div>
                                    <div className="w-1.5 bg-blue-400 h-4 rounded-t-sm"></div>
                                    <div className="w-1.5 bg-blue-500 h-7 rounded-t-sm"></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-[#d0dbe7] rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-purple-500">lock</span>
                                <h3 className="text-xs font-bold text-[#0e141b] uppercase tracking-wider">MFA Adoption</h3>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-black text-[#0e141b]">100%</p>
                                    <p className="text-xs font-bold text-[#4e7397] mt-1">ALL ACTIVE USERS</p>
                                </div>
                                <span className="material-symbols-outlined text-[#d0dbe7] text-3xl">verified_user</span>
                            </div>
                        </div>

                        <div className="bg-white border border-[#d0dbe7] rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-orange-500">security_update_warning</span>
                                <h3 className="text-xs font-bold text-[#0e141b] uppercase tracking-wider">Security Alerts</h3>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-black text-[#0e141b]">0</p>
                                    <p className="text-xs font-bold text-green-600 mt-1">NO THREATS DETECTED</p>
                                </div>
                                <div className="relative size-10 flex items-center justify-center rounded-full border-4 border-green-100 border-t-green-500">
                                    <span className="material-symbols-outlined text-green-600 text-lg">check</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Create Tenant Modal */}
            {
                isCreateModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#d0dbe7] flex items-center justify-between bg-[#f6f7f8]">
                                <h3 className="text-lg font-bold text-[#0e141b]">Create New Tenant</h3>
                                <button onClick={() => setIsCreateModalOpen(false)} className="text-[#4e7397] hover:text-[#0e141b]">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleCreateTenant} className="p-6">
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-2">Organization Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full h-10 px-3 bg-white border border-[#d0dbe7] rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="e.g. Acme Corp"
                                        value={newOrgName}
                                        onChange={(e) => setNewOrgName(e.target.value)}
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-2">Slug</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full h-10 px-3 bg-white border border-[#d0dbe7] rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="e.g. acme-corp"
                                        value={newOrgSlug}
                                        onChange={(e) => setNewOrgSlug(e.target.value)}
                                    />
                                    <p className="text-xs text-[#4e7397] mt-1">Used for URL: {newOrgSlug && `${newOrgSlug}.tenantx.com`}</p>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="h-10 px-4 bg-white border border-[#d0dbe7] rounded text-sm font-bold text-[#0e141b] hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="h-10 px-6 bg-orange-500 rounded text-sm font-bold text-white hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/20 disabled:opacity-70 flex items-center gap-2"
                                    >
                                        {createLoading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                        Create Tenant
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Add User Modal */}
            {
                isAddUserModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#d0dbe7] flex items-center justify-between bg-[#f6f7f8]">
                                <h3 className="text-lg font-bold text-[#0e141b]">{activeOrg ? `Add User to ${activeOrg.name}` : "Add User"}</h3>
                                <button onClick={() => setIsAddUserModalOpen(false)} className="text-[#4e7397] hover:text-[#0e141b]">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleAddUser} className="p-6">
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full h-10 px-3 bg-white border border-[#d0dbe7] rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="user@example.com"
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-2">Role</label>
                                    <select
                                        className="w-full h-10 px-3 bg-white border border-[#d0dbe7] rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        value={newUserRole}
                                        onChange={(e) => setNewUserRole(e.target.value)}
                                    >
                                        <option value="EMPLOYEE">Employee</option>
                                        <option value="MANAGER">Manager</option>
                                        <option value="CONTROL">Control (Admin)</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddUserModalOpen(false)}
                                        className="h-10 px-4 bg-white border border-[#d0dbe7] rounded text-sm font-bold text-[#0e141b] hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={addUserLoading}
                                        className="h-10 px-6 bg-orange-500 rounded text-sm font-bold text-white hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/20 disabled:opacity-70 flex items-center gap-2"
                                    >
                                        {addUserLoading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                        Invite User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Edit Tenant Modal */}
            {
                isEditModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#d0dbe7] flex items-center justify-between bg-[#f6f7f8]">
                                <h3 className="text-lg font-bold text-[#0e141b]">Edit Tenant</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-[#4e7397] hover:text-[#0e141b]">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleUpdateTenant} className="p-6">
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-2">Organization Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full h-10 px-3 bg-white border border-[#d0dbe7] rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="e.g. Acme Corp"
                                        value={editTenantName}
                                        onChange={(e) => setEditTenantName(e.target.value)}
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-2">Slug</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full h-10 px-3 bg-white border border-[#d0dbe7] rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="e.g. acme-corp"
                                        value={editTenantSlug}
                                        onChange={(e) => setEditTenantSlug(e.target.value)}
                                    />
                                    <p className="text-xs text-[#4e7397] mt-1">Used for URL: {editTenantSlug && `${editTenantSlug}.tenantx.com`}</p>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="h-10 px-4 bg-white border border-[#d0dbe7] rounded text-sm font-bold text-[#0e141b] hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editLoading}
                                        className="h-10 px-6 bg-orange-500 rounded text-sm font-bold text-white hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/20 disabled:opacity-70 flex items-center gap-2"
                                    >
                                        {editLoading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            <AlertModal
                isOpen={alertState.isOpen}
                onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
            />

            <ConfirmationModal
                isOpen={confirmState.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                isDangerous={confirmState.isDangerous}
                isLoading={confirmState.isLoading}
            />
        </DashboardLayout >
    );
}
