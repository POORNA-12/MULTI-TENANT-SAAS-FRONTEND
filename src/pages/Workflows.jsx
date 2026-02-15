import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import workflowService from "../services/workflowService";
import roleService from "../services/roleService";
import organizationService from "../services/organizationService";
import tenantUserService from "../services/tenantUserService";
import AuthService from "../services/authService";
import WorkflowWizard, { WORKFLOW_TEMPLATES } from "../components/WorkflowWizard";
import ConfirmModal from "../components/ConfirmModal";
import AlertModal from "../components/AlertModal";
import { useSearch } from "../context/SearchContext";

export default function Workflows() {
    const { searchQuery } = useSearch();
    const [templates, setTemplates] = useState([]);
    const [roles, setRoles] = useState([]);
    const [activeOrg, setActiveOrg] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [currentTenantUserId, setCurrentTenantUserId] = useState(null);

    // Edit & Delete State
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, templateId: null, templateName: "" });
    const [isDeleting, setIsDeleting] = useState(false);

    // Alert Modal State
    const [alertData, setAlertData] = useState({ isOpen: false, title: "", message: "", type: "success" });
    const showAlert = (title, message, type = "error") => setAlertData({ isOpen: true, title, message, type });

    // Fetch active organization, roles, and current user permissions
    useEffect(() => {
        const fetchContext = async () => {
            try {
                const orgData = await organizationService.getOrganizations();
                const active = orgData.organizations?.find(org => org.is_active);

                if (active) {
                    setActiveOrg(active);

                    // Parallel fetch for roles and users
                    try {
                        const [roleData, userData] = await Promise.all([
                            roleService.getRoles(active.slug),
                            tenantUserService.getTenantUsers(active.slug)
                        ]);

                        setRoles(roleData?.roles || []);

                        // Identify current user role
                        const myEmail = AuthService.getUserEmail();
                        if (myEmail) {
                            const users = Array.isArray(userData) ? userData : (userData?.users || []);
                            const me = users.find(u => u.email === myEmail);

                            if (me) {
                                setCurrentTenantUserId(me.id);
                                if (me.role) {
                                    setCurrentUserRole(me.role);
                                }
                            }
                        }
                    } catch (innerErr) {
                        console.error("Failed to fetch roles/users:", innerErr);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch context (org):", error);
            }
        };
        fetchContext();
    }, []);

    // Fetch workflow templates
    const fetchTemplates = async () => {
        if (!activeOrg) return;
        setIsLoading(true);
        try {
            const data = await workflowService.getTemplates(activeOrg.slug);
            if (data.templates && data.templates.length > 0) {
                setTemplates(data.templates);
            } else {
                // FALLBACK: If API returns empty or fails, show default templates
                // Map them to match the API structure (definition_id, definition_name, etc)
                const fallbackTemplates = WORKFLOW_TEMPLATES.map((tmpl, idx) => ({
                    definition_id: `fallback-${tmpl.id}`,
                    definition_name: tmpl.title,
                    workflow_type: tmpl.type,
                    description: tmpl.description,
                    steps: tmpl.roles.map((role, rIdx) => ({
                        step: rIdx + 1,
                        role: role
                    }))
                }));
                setTemplates(fallbackTemplates);
            }
        } catch (error) {
            console.error("Failed to fetch templates, using fallback:", error);
            // FALLBACK on error
            const fallbackTemplates = WORKFLOW_TEMPLATES.map((tmpl, idx) => ({
                definition_id: `fallback-${tmpl.id}`,
                definition_name: tmpl.title,
                workflow_type: tmpl.type,
                description: tmpl.description,
                steps: tmpl.roles.map((role, rIdx) => ({
                    step: rIdx + 1,
                    role: role
                }))
            }));
            setTemplates(fallbackTemplates);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-fetch templates if user has permission
    useEffect(() => {
        if (activeOrg && currentUserRole) {
            // Check permissions (Panel Admin, SaaS User, Admin)
            if (hasMonitoringAccess()) {
                fetchTemplates();
            }
        }
    }, [activeOrg, currentUserRole]);

    const hasMonitoringAccess = () => {
        if (!currentUserRole) return false;
        const role = String(currentUserRole).toLowerCase();
        return role.includes("admin") || role.includes("saas") || role === "panel-admin";
    };

    // Helper to resolve role name from ID
    const getRoleName = (roleIdentifier) => {
        if (!roleIdentifier || roleIdentifier === "null") return "Unknown Role";
        // If it's already a name (non-numeric string that doesn't look like an ID), return it
        // but try to find it in roles array first to be safe
        const role = roles.find(r => String(r.id) === String(roleIdentifier) || r.name === roleIdentifier);
        return role ? role.name : `Role ${roleIdentifier}`;
    };

    // Filter templates based on search query
    const filteredTemplates = templates.filter(template => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            template.definition_name?.toLowerCase().includes(query) ||
            template.workflow_type?.toLowerCase().includes(query) ||
            template.description?.toLowerCase().includes(query)
        );
    });

    // Handlers
    const handleEdit = (template) => {
        setEditingTemplate(template);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDeleteClick = (template) => {
        setDeleteModal({
            isOpen: true,
            templateId: template.definition_id,
            templateName: template.definition_name
        });
    };

    const handleConfirmDelete = async () => {
        if (!activeOrg || !deleteModal.templateId) return;

        setIsDeleting(true);
        try {
            await workflowService.deleteTemplate(activeOrg.slug, deleteModal.templateId);
            setDeleteModal({ isOpen: false, templateId: null, templateName: "" });
            fetchTemplates(); // Refresh list
        } catch (error) {
            console.error("Failed to delete template:", error);
            showAlert("Error", "Failed to delete template. Please try again.", "error");
        } finally {
            setIsDeleting(false);
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
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleConfirmDelete}
                title="Delete Workflow Template"
                message={`Are you sure you want to delete the template "${deleteModal.templateName}"? This action cannot be undone.`}
                confirmText="Delete Template"
                type="danger"
                isLoading={isDeleting}
            />
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-[#0e141b] tracking-tight">
                        Workflows Management Hub
                    </h1>
                    <p className="text-sm text-[#4e7397] mt-1">
                        Design and manage automated business processes.
                    </p>
                </div>

                {/* Section 1: Workflow Creation Wizard (Always Visible) */}
                <div className="bg-white border border-[#d0dbe7] rounded-lg shadow-sm p-6">
                    <WorkflowWizard
                        roles={roles}
                        activeOrg={activeOrg}
                        onSuccess={() => {
                            fetchTemplates();
                            setEditingTemplate(null);
                        }}
                        initialData={editingTemplate}
                        onCancel={() => setEditingTemplate(null)}
                    />
                </div>

                {/* Section 2: Template List (Conditionally Visible) */}
                {hasMonitoringAccess() && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center gap-4 relative">
                            <div className="flex-1 h-px bg-[#d0dbe7]"></div>
                            <span className="text-xs font-bold text-[#4e7397] uppercase tracking-wider bg-[#f6f7f8] px-2">
                                Created Workflow Templates
                            </span>
                            <div className="flex-1 h-px bg-[#d0dbe7]"></div>
                        </div>

                        {/* Controls */}
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-[#0e141b] tracking-tight">Workflow Templates</h2>
                                <p className="text-sm text-[#4e7397]">
                                    Active definitions available for this organization.
                                </p>
                            </div>
                            <button onClick={fetchTemplates} className="p-2 text-[#4e7397] hover:text-blue-600 transition-colors bg-white border border-[#d0dbe7] rounded-lg shadow-sm">
                                <span className="material-symbols-outlined text-lg">refresh</span>
                            </button>
                        </div>

                        {/* Templates List */}
                        <div className="grid gap-4">
                            {filteredTemplates.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-[#d0dbe7] rounded-xl bg-slate-50/50">
                                    <div className="size-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                                        <span className="material-symbols-outlined text-2xl text-[#9ba5b1]">extension</span>
                                    </div>
                                    <h3 className="text-base font-bold text-[#0e141b] mb-1">
                                        {searchQuery ? `No templates matching "${searchQuery}"` : "No Templates Found"}
                                    </h3>
                                    <p className="text-xs text-[#4e7397]">
                                        {searchQuery ? "Try a different search term" : "Create your first workflow template above."}
                                    </p>
                                </div>
                            ) : (
                                filteredTemplates.map((template) => (
                                    <div key={template.definition_id} className="group bg-white border border-[#d0dbe7] rounded-xl p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        {/* Actions Overlay (Always Visible) */}
                                        <div className="absolute top-4 right-4 z-20 flex gap-2">
                                            <button
                                                onClick={() => handleEdit(template)}
                                                className="size-8 bg-white border border-blue-200 text-blue-600 rounded-full shadow-sm flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                                                title="Edit Template"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(template)}
                                                className="size-8 bg-white border border-red-200 text-red-600 rounded-full shadow-sm flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                                                title="Delete Template"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>

                                        {/* Header Info */}
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                                            <div className="flex items-start gap-4">
                                                <div className="size-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                                                    <span className="material-symbols-outlined text-2xl">
                                                        {template.workflow_type.toLowerCase().includes("leave") ? "calendar_month" :
                                                            template.workflow_type.toLowerCase().includes("fund") ? "attach_money" :
                                                                template.workflow_type.toLowerCase().includes("promo") ? "trending_up" : "schema"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-[#0e141b] group-hover:text-blue-600 transition-colors">
                                                        {template.definition_name}
                                                    </h3>
                                                    <p className="text-xs text-[#4e7397] font-medium mt-1">
                                                        Type: {template.workflow_type}
                                                    </p>
                                                    {template.description && (
                                                        <p className="text-xs text-[#64748b] mt-2 line-clamp-2 leading-relaxed" title={template.description}>
                                                            {template.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>


                                        </div>

                                        {/* Approval Steps Visualization */}
                                        <div className="bg-slate-50/50 rounded-lg p-4 border border-[#d0dbe7]/50">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-bold text-[#4e7397] uppercase tracking-wider flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm">hub</span> Approval Steps
                                                </span>
                                            </div>

                                            <div className="relative pt-2 pb-1">
                                                <div className="flex items-center w-full px-2">
                                                    {template.steps.map((step, idx) => {
                                                        const isLast = idx === template.steps.length - 1;

                                                        return (
                                                            <div key={idx} className={`flex-1 flex items-center ${isLast ? 'grow-0' : ''}`}>
                                                                {/* Step Circle */}
                                                                <div className="relative group z-10">
                                                                    <div className="size-8 rounded-full flex items-center justify-center border-2 border-slate-200 bg-white text-slate-500 shadow-sm transition-all group-hover:border-blue-400 group-hover:text-blue-600">
                                                                        <span className="text-xs font-bold">{step.step}</span>
                                                                    </div>

                                                                    {/* Role Label below circle */}
                                                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#4e7397] group-hover:text-[#0e141b] transition-colors">
                                                                            {getRoleName(step.role)}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Connector Line */}
                                                                {!isLast && (
                                                                    <div className="flex-1 h-0.5 mx-2 bg-slate-200 rounded-full"></div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
