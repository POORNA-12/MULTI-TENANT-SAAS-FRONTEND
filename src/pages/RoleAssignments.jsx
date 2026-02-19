import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import roleService from "../services/roleService";
import organizationService from "../services/organizationService";
import tenantUserService from "../services/tenantUserService";
import AlertModal from "../components/AlertModal";

const AssignRoleModal = ({ isOpen, onClose, onSubmit, isLoading, roles }) => {
    const [email, setEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ email, role: selectedRole });
        setEmail("");
        setSelectedRole("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
                <h3 className="text-lg font-bold text-[#0e141b] mb-4">Assign Role to User</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-[#4e7397] uppercase mb-1">User Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-[#d0dbe7] rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="user@example.com"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-[#4e7397] uppercase mb-1">Select Role</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full px-3 py-2 border border-[#d0dbe7] rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        >
                            <option value="">Select a role...</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.name}>{role.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-[#d0dbe7] rounded text-sm font-bold text-[#4e7397] hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-orange-500 rounded text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70"
                        >
                            {isLoading ? "Assigning..." : "Assign Role"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RoleAssignmentTable = ({ assignments, onEdit, onRemove }) => (
    <div className="bg-white border border-[#d0dbe7] rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 border-b border-[#d0dbe7] text-xs font-bold text-[#4e7397] uppercase tracking-wider">
                    <th className="p-4">User Email</th>
                    <th className="p-4">Assigned Role</th>
                    <th className="p-4">Scope</th>
                    <th className="p-4">Date Assigned</th>
                    <th className="p-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-[#d0dbe7]">
                {assignments.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="p-8 text-center text-sm text-[#4e7397]">
                            No role assignments found.
                        </td>
                    </tr>
                ) : (
                    assignments.map((assignment, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-4">
                                <span className="font-bold text-[#0e141b] text-sm">{assignment.user_email}</span>
                            </td>
                            <td className="p-4">
                                <button className="text-sm font-bold text-blue-600 hover:underline">
                                    {assignment.role_name}
                                </button>
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
            <div className="flex gap-2">
                <button className="px-3 py-1 bg-white border border-[#d0dbe7] rounded text-xs font-bold text-[#4e7397] disabled:opacity-50">Previous</button>
                <div className="px-3 py-1 text-xs font-bold text-[#4e7397] flex items-center">Showing 1-4 of 42</div>
                <button className="px-3 py-1 bg-white border border-[#d0dbe7] rounded text-xs font-bold text-[#4e7397] disabled:opacity-50">Next</button>
            </div>
        </div>
    </div>
);

export default function RoleAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [activeOrg, setActiveOrg] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Alert Modal State
    const [alertData, setAlertData] = useState({ isOpen: false, title: "", message: "", type: "success" });
    const showAlert = (title, message, type = "error") => setAlertData({ isOpen: true, title, message, type });

    const fetchRoles = async () => {
        try {
            const data = await roleService.getRoles();
            setRoles(data.roles || []);
        } catch (error) {
            console.error("Failed to fetch roles:", error);
        }
    };

    const fetchAssignments = async (orgSlug) => {
        try {
            const data = await tenantUserService.getTenantUsers(orgSlug);
            const users = Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : []);

            const mappedAssignments = users.map(user => ({
                id: user.id || user.user_id,
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
                fetchRoles();
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

    const handleAssignRole = async (assignData) => {
        if (!activeOrg) return;
        setIsLoading(true);
        try {
            const targetUser = assignments.find(u => u.user_email === assignData.email);

            if (!targetUser || !targetUser.id) {
                console.warn("User ID not found for assignment");
                showAlert("User Not Found", "Could not find user details. Ensure user is already a member of this tenant.", "error");
                setIsLoading(false);
                return;
            }

            await roleService.assignRole({
                organization_id: activeOrg.id,
                tenant_user_id: targetUser.id,
                role: assignData.role
            });

            setIsAssignModalOpen(false);
            fetchAssignments(activeOrg.slug);
        } catch (error) {
            console.error("Failed to assign role:", error);
            showAlert("Error", error.response?.data?.message || "Failed to assign role.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <AlertModal
                isOpen={alertData.isOpen}
                onClose={() => setAlertData(prev => ({ ...prev, isOpen: false }))}
                title={alertData.title}
                message={alertData.message}
                type={alertData.type}
            />
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-[#0e141b] tracking-tight">
                        Role Assignment Hub
                    </h1>
                    <p className="text-sm text-[#4e7397] mt-1">
                        Manage user role assignments and access scopes.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full sm:w-96">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4e7397] text-lg">search</span>
                        <input
                            type="text"
                            placeholder="Filter by user email or role..."
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

                <RoleAssignmentTable
                    assignments={assignments}
                    onEdit={(assignment) => showAlert("Info", `Edit assignment for ${assignment.user_email}`, "info")}
                    onRemove={(assignment) => showAlert("Info", `Remove assignment for ${assignment.user_email}`, "info")}
                />

                <AssignRoleModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    onSubmit={handleAssignRole}
                    isLoading={isLoading}
                    roles={roles}
                />
            </div>
        </DashboardLayout>
    );
}
