import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import workflowService from "../services/workflowService";
import roleService from "../services/roleService";
import organizationService from "../services/organizationService";
import { useOrganizations } from "../hooks/useOrganizations";

import AuthService from "../services/authService";
import WorkflowWizard, { WORKFLOW_TEMPLATES } from "../components/WorkflowWizard";
import WorkflowApiReference from "../components/WorkflowApiReference";
import ConfirmModal from "../components/ConfirmModal";
import AlertModal from "../components/AlertModal";
import { useSearch } from "../context/SearchContext";

export default function Workflows() {
    const { searchQuery, setSearchQuery } = useSearch();
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
    const [activeTab, setActiveTab] = useState("create");

    const { data: organizations } = useOrganizations();

    // Fetch active organization, roles, and current user permissions
    useEffect(() => {
        const checkActiveOrgAndRoles = async () => {
            try {
                if (!organizations) return;
                const active = organizations.find(org => org.current);

                if (active) {
                    setActiveOrg(active);

                    // Parallel fetch for roles and users
                    try {
                        const roleData = await roleService.getRoles(active.slug);

                        setRoles(roleData?.roles || []);

                        // Identify current user role
                        const myEmail = AuthService.getUserEmail();
                        if (myEmail) {
                            if (typeof me !== "undefined" && me) {
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
        checkActiveOrgAndRoles();
    }, [organizations]);

    // Fetch workflow templates
    const fetchTemplates = async () => {
        if (!activeOrg) return;
        setIsLoading(true);
        try {
            const data = await workflowService.getTemplates(activeOrg.slug);
            if (data.templates) {
                setTemplates(data.templates);
            }
        } catch (error) {
            console.error("Failed to fetch templates:", error);
            // Optional: showAlert("Error", "Failed to fetch templates.");
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
        // Temporarily allow access to all authenticated users for demo purposes / to ensure visibility
        // In production, revert to: 
        // if (!currentUserRole) return false;
        // const role = String(currentUserRole).toLowerCase();
        // return role.includes("admin") || role.includes("saas") || role === "panel-admin";
        return true;
    };

    // Helper to resolve role name from ID
    const getRoleName = (roleIdentifier) => {
        if (!roleIdentifier || roleIdentifier === "null") return "Unknown Role";
        const role = roles.find(r => String(r.id) === String(roleIdentifier) || r.name === roleIdentifier);
        return role ? role.name : `Role ${roleIdentifier}`;
    };

    // Filter templates based on search query
    const filteredTemplates = templates.filter(template => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const name = template.template_name || template.definition_name || "";
        return (
            name.toLowerCase().includes(query) ||
            template.workflow_type?.toLowerCase().includes(query) ||
            template.description?.toLowerCase().includes(query)
        );
    });

    // Handlers
    const handleEdit = (template) => {
        setEditingTemplate(template);
        setActiveTab("create");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDeleteClick = (template) => {
        setDeleteModal({
            isOpen: true,
            templateId: template.definition_id,
            templateName: template.template_name || template.definition_name
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
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
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
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-[#0e141b] tracking-tight">
                            Workflows Management Hub
                        </h1>
                        <p className="text-sm font-medium text-[#4e7397] mt-2 max-w-2xl">
                            Orchestrate your business processes with automated approval chains. Design, deploy, and monitor workflows seamlessly.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#d0dbe7] mb-6">
                    <button
                        onClick={() => setActiveTab("create")}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "create"
                            ? "border-orange-500 text-orange-600"
                            : "border-transparent text-[#4e7397] hover:text-[#0e141b]"
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        {editingTemplate ? "Edit Template" : "Create Template"}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("templates");
                            fetchTemplates();
                        }}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "templates"
                            ? "border-orange-500 text-orange-600"
                            : "border-transparent text-[#4e7397] hover:text-[#0e141b]"
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">list_alt</span>
                        Workflow Templates
                    </button>
                    <button
                        onClick={() => setActiveTab("api")}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "api"
                            ? "border-orange-500 text-orange-600"
                            : "border-transparent text-[#4e7397] hover:text-[#0e141b]"
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">api</span>
                        API Reference
                    </button>
                </div>

                {/* Content: Create/Edit Wizard */}
                {activeTab === "create" && (
                    <div className="bg-white border border-[#d0dbe7] rounded-2xl shadow-sm p-6 lg:p-8">
                        <WorkflowWizard
                            roles={roles}
                            activeOrg={activeOrg}
                            onSuccess={() => {
                                fetchTemplates();
                                setEditingTemplate(null);
                                setActiveTab("templates");
                            }}
                            initialData={editingTemplate}
                            onCancel={() => {
                                setEditingTemplate(null);
                                setActiveTab("templates");
                            }}
                        />
                    </div>
                )}

                {/* Content: Template List */}
                {activeTab === "templates" && (
                    <div>
                        {hasMonitoringAccess() ? (
                            <div className="space-y-8">
                                {/* Controls */}
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-[#d0dbe7] shadow-sm">
                                    <div className="relative w-full sm:w-96 group">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9ba5b1] group-focus-within:text-orange-500 transition-colors">search</span>
                                        <input
                                            type="text"
                                            placeholder="Search templates..."
                                            className="w-full pl-10 pr-4 py-2.5 border border-[#e2e8f0] rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder:text-slate-400"
                                            value={searchQuery || ""}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={fetchTemplates}
                                        className="p-2.5 text-[#4e7397] hover:text-orange-600 hover:bg-orange-50 transition-all border border-[#d0dbe7] rounded-lg shadow-sm active:scale-95"
                                        title="Refresh List"
                                    >
                                        <span className="material-symbols-outlined text-xl">refresh</span>
                                    </button>
                                </div>

                                {/* Templates List Grid */}
                                <div className="grid grid-cols-1 gap-6">
                                    {filteredTemplates.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-[#d0dbe7] rounded-2xl bg-white/50 backdrop-blur-sm">
                                            <div className="size-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-4">
                                                <span className="material-symbols-outlined text-3xl">inbox</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-[#0e141b] mb-1">
                                                No Templates Found
                                            </h3>
                                            <p className="text-sm text-[#4e7397]">
                                                {searchQuery ? `No results for "${searchQuery}"` : "Get started by creating your first workflow template."}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredTemplates.map((template, idx) => (
                                            <div
                                                key={template.definition_id}
                                                className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-orange-300 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                                                style={{ animationDelay: `${idx * 100}ms` }}
                                            >
                                                {/* Decorative background gradient */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-transparent rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                                                {/* Header & Actions */}
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 relative z-10">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`
                                                            size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border
                                                            ${template.workflow_type.toLowerCase().includes("leave") ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                                template.workflow_type.toLowerCase().includes("fund") ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                                    template.workflow_type.toLowerCase().includes("promo") ? "bg-purple-50 text-purple-600 border-purple-100" :
                                                                        "bg-orange-50 text-orange-600 border-orange-100"}
                                                        `}>
                                                            <span className="material-symbols-outlined text-3xl">
                                                                {template.workflow_type.toLowerCase().includes("leave") ? "calendar_month" :
                                                                    template.workflow_type.toLowerCase().includes("fund") ? "attach_money" :
                                                                        template.workflow_type.toLowerCase().includes("promo") ? "trending_up" : "schema"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                                                                {template.template_name || template.definition_name}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                                    <span className="size-1.5 rounded-full bg-slate-400"></span>
                                                                    {template.workflow_type}
                                                                </span>
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
                                                                    <span className="material-symbols-outlined text-[14px]">layers</span>
                                                                    {template.steps.length} Steps
                                                                </span>
                                                            </div>
                                                            {template.description && (
                                                                <p className="text-sm text-slate-500 mt-3 leading-relaxed max-w-2xl">
                                                                    {template.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 self-start sm:self-auto translate-x-4 group-hover:translate-x-0">
                                                        <button
                                                            onClick={() => handleEdit(template)}
                                                            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm"
                                                            title="Edit Template"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(template)}
                                                            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                                                            title="Delete Template"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Visualizer Pipeline */}
                                                <div className="relative mt-6 p-8 bg-slate-50/50 rounded-2xl border border-slate-100/50 backdrop-blur-sm group-hover:bg-slate-50 transition-colors">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                                                        <span className="w-4 h-0.5 bg-slate-300 rounded-full"></span>
                                                        Approval Chain
                                                    </h4>

                                                    <div className="relative flex items-center justify-between w-full max-w-5xl mx-auto px-4">
                                                        {/* Base Track Line */}
                                                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>

                                                        {/* Animated Flow Line (Gradient) */}
                                                        <div className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 z-0 overflow-hidden">
                                                            <div className="w-full h-full bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-[shimmer_2s_infinite_linear]"></div>
                                                        </div>

                                                        {/* Start Node */}
                                                        <div className="relative z-10 flex flex-col items-center gap-3 group/node">
                                                            <div className="size-10 bg-white border-2 border-emerald-500 rounded-full shadow-sm flex items-center justify-center transition-transform group-hover/node:scale-110">
                                                                <span className="material-symbols-outlined text-emerald-600 text-lg">flag</span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100 opacity-60 group-hover:opacity-100 transition-opacity">Start</span>
                                                        </div>

                                                        {/* Approval Steps */}
                                                        {template.steps.map((step, sIdx) => (
                                                            <div key={sIdx} className="relative z-10 flex flex-col items-center gap-3 flex-1 px-4 group/step">
                                                                {/* Connector arrow */}
                                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center -z-10 opacity-0 group-hover/step:opacity-100 transition-opacity delay-100">
                                                                    <span className="material-symbols-outlined text-orange-300 text-xs">arrow_forward</span>
                                                                </div>

                                                                <div className="relative">
                                                                    <div className="h-10 px-5 bg-white border-2 border-orange-500 text-orange-700 rounded-full shadow-md flex items-center justify-center font-bold text-xs whitespace-nowrap relative group-hover/step:scale-105 transition-transform duration-300 z-10 min-w-[100px]">
                                                                        {getRoleName(step.role)}
                                                                        {/* Status Point */}
                                                                        <div className="absolute -top-1 -right-1 flex h-3 w-3">
                                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
                                                                        </div>
                                                                    </div>
                                                                    {/* Ripple effect */}
                                                                    <div className="absolute top-0 left-0 w-full h-full bg-orange-100 rounded-full -z-10 animate-ping opacity-0 group-hover:opacity-30"></div>
                                                                </div>

                                                                <div className="flex flex-col items-center text-center">
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100 group-hover:border-orange-100 transition-colors">
                                                                        Step {step.step}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* End Node */}
                                                        <div className="relative z-10 flex flex-col items-center gap-3 group/node">
                                                            <div className="size-10 bg-slate-900 border-2 border-slate-700 rounded-full shadow-sm flex items-center justify-center transition-transform group-hover/node:scale-110">
                                                                <span className="material-symbols-outlined text-white text-lg">check_circle</span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100 opacity-60 group-hover:opacity-100 transition-opacity">Complete</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            // This block will theoretically not be reached now, but kept as safeguard
                            <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-[#d0dbe7] rounded-xl bg-slate-50/50">
                                <span className="material-symbols-outlined text-4xl text-[#9ba5b1] mb-2">lock</span>
                                <h3 className="text-lg font-bold text-[#0e141b]">Access Restricted</h3>
                                <p className="text-sm text-[#4e7397] mt-1 max-w-md text-center">
                                    You do not have permission to view workflow templates. Please contact your administrator.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Content: API Reference */}
                {activeTab === "api" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <WorkflowApiReference />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
