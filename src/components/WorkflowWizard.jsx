import { useState, useEffect } from "react";
import AuthService from "../services/authService";
import tenantUserService from "../services/tenantUserService";
import workflowService from "../services/workflowService";
import AlertModal from "./AlertModal";

// Define Types matching the Templates
const WORKFLOW_TYPES = [
    {
        id: "start_leave",
        title: "Leave Approval",
        description: "Standard leave request workflow.",
        icon: "calendar_month",
        value: "Leave Approval"
    },
    {
        id: "start_fund",
        title: "Fund Request",
        description: "Request for budget or reimbursement.",
        icon: "attach_money",
        value: "Fund Request"
    },
    {
        id: "start_promo",
        title: "Promotion Request",
        description: "Employee promotion approval flow.",
        icon: "trending_up",
        value: "Promotion Request"
    },
    {
        id: "start_desig",
        title: "Designation Change",
        description: "Update employee job title.",
        icon: "badge",
        value: "Designation Change"
    },
    {
        id: "start_custom",
        title: "Custom Workflow",
        description: "Define a custom approval process.",
        icon: "settings",
        value: "Custom Workflow"
    }
];

// Update Templates to match these specific values
export const WORKFLOW_TEMPLATES = [
    {
        id: "leave",
        title: "Leave Approval",
        description: "Standard leave request workflow requiring Manager and HR approval.",
        type: "Leave Approval",
        tags: ["HR", "Time Off"],
        icon: "calendar_month",
        roles: ["Manager", "HR"]
    },
    {
        id: "fund",
        title: "Fund Request",
        description: "Request for budget or expense reimbursement.",
        type: "Fund Request",
        tags: ["Finance", "Budget"],
        icon: "attach_money",
        roles: ["Manager", "Finance"]
    },
    {
        id: "promotion",
        title: "Promotion Request",
        description: "Employee promotion approval flow.",
        type: "Promotion Request",
        tags: ["HR", "Career"],
        icon: "trending_up",
        roles: ["Manager", "HR", "Director"]
    },
    {
        id: "designation",
        title: "Designation Change",
        description: "Update employee job title or designation.",
        type: "Designation Change",
        tags: ["HR", "Admin"],
        icon: "badge",
        roles: ["HR", "Admin"]
    }
];

export default function WorkflowWizard({ roles = [], activeOrg, onSuccess, initialData, onCancel }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "Standard",
        workflowType: "",
        approvers: []
    });

    const [isLoading, setIsLoading] = useState(false);
    const [alertData, setAlertData] = useState({ isOpen: false, title: "", message: "", type: "success" });
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [tenantSlug, setTenantSlug] = useState(null);


    // Sync Tenant Slug from prop
    useEffect(() => {
        if (activeOrg) {
            setTenantSlug(activeOrg.slug);
        }
    }, [activeOrg]);

    // Populate form if editing (initialData present)
    useEffect(() => {
        if (initialData && roles.length > 0) {
            // Map initialData steps to approvers format
            const mappedApprovers = (initialData.steps || []).map(step => {
                // Find role by ID or Name
                // step.role might be an ID or a name string depending on backend
                // The backend response for getTemplates usually returns role object or id? 
                // Based on previous logs, step.role is likely the ID or Name.
                // We need to find the role object to get both ID and Name.
                const roleObj = roles.find(r => r.id == step.role || r.name === step.role);
                return {
                    type: "role",
                    name: roleObj ? roleObj.name : (step.role_name || "Unknown Role"), // Fallback
                    role_id: roleObj ? roleObj.id : step.role
                };
            });

            setFormData({
                title: initialData.template_name || initialData.definition_name || "",
                description: initialData.description || "",
                priority: "Standard", // Not in template response yet using default
                workflowType: initialData.workflow_type || "",
                approvers: mappedApprovers
            });
            setCurrentStep(1); // Start at step 1
        }
    }, [initialData, roles]);




    // Load draft from cookie on mount (only if NOT editing)
    useEffect(() => {
        if (initialData) return; // Don't load draft if editing

        const savedDraft = document.cookie.split('; ').find(row => row.startsWith('workflowDraft='));
        if (savedDraft) {
            try {
                const parsed = JSON.parse(decodeURIComponent(savedDraft.split('=')[1]));
                setFormData(prev => ({ ...prev, ...parsed }));
                if (parsed.step) setCurrentStep(parsed.step);
                // Try to infer template from title match if needed, or just leave as custom
            } catch (e) {
                console.error("Failed to parse draft cookie", e);
            }
        }
    }, [initialData]);

    // Save draft to cookie on change (skip if editing)
    useEffect(() => {
        if (initialData) return;

        const dataToSave = JSON.stringify({ ...formData, step: currentStep });
        document.cookie = `workflowDraft=${encodeURIComponent(dataToSave)}; path=/; max-age=86400`; // 1 day
    }, [formData, currentStep, initialData]);

    const showAlert = (title, message, type = "success") => {
        setAlertData({ isOpen: true, title, message, type });
    };

    const applyTemplate = (template) => {
        if (initialData) {
            showAlert("Action Not Allowed", "Cannot apply different templates while editing an existing one.", "info");
            return;
        }

        if (!template) {
            // Custom / Reset
            setSelectedTemplateId(null);
            setFormData({
                title: "",
                description: "",
                priority: "Standard",
                workflowType: "",
                approvers: []
            });
            return;
        }

        setSelectedTemplateId(template.id);

        // Try to match roles
        const matchedApprovers = template.roles.map(roleName => {
            // Case-insensitive partial match
            const foundRole = roles.find(r => r.name.toLowerCase().includes(roleName.toLowerCase()));
            if (foundRole) {
                return {
                    type: "role",
                    name: foundRole.name,
                    role_id: foundRole.id
                };
            }
            return null;
        }).filter(Boolean); // Remove nulls if role not found

        setFormData(prev => ({
            ...prev,
            title: template.title,
            description: template.description,
            workflowType: template.type,
            approvers: matchedApprovers
        }));

        if (matchedApprovers.length < template.roles.length) {
            showAlert("Role Matching Info", `Some roles from the template (${template.roles.join(", ")}) could not be auto-found in your system. Please add them manually in Step 3.`, "info");
        }
    };

    const handleNext = () => {
        // Validation for Step 1
        if (currentStep === 1) {
            if (!formData.title.trim()) {
                showAlert("Validation Error", "Please provide a Workflow Title.", "error");
                return;
            }
            if (!formData.description.trim()) {
                showAlert("Validation Error", "Please provide a Description.", "error");
                return;
            }
        }

        // Validation for Step 2
        if (currentStep === 2) {
            if (!formData.workflowType) {
                showAlert("Validation Error", "Please select a Workflow Type.", "error");
                return;
            }
        }

        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSaveDraft = () => {
        if (initialData) return;
        // Cookie is auto-saved via useEffect, just notify user
        showAlert("Draft Saved", "Your progress has been saved locally.", "success");
    };

    const handleSubmit = async () => {
        if (!tenantSlug) {
            showAlert("Configuration Error", "Tenant Slug not found. Please refresh.", "error");
            return;
        }



        // Validation for Step 3
        if (formData.approvers.length === 0) {
            showAlert("Validation Error", "Please add at least one approval step.", "error");
            return;
        }

        setIsLoading(true);
        try {
            // Prepare Payload via Bootstrap API structure
            const payload = {
                workflow_type_name: formData.workflowType,
                workflow_definition_name: formData.title,
                description: formData.description,
                steps: formData.approvers.map((approver, index) => ({
                    step_order: index + 1,
                    approver_role: approver.name
                }))
            };

            if (initialData) {
                // UPDATE Existing
                await workflowService.updateTemplate(tenantSlug, initialData.definition_id, payload);
                showAlert("Success", "Workflow Template updated successfully!", "success");
            } else {
                // CREATE New
                await workflowService.createFullWorkflow(tenantSlug, payload);
                showAlert("Success", "Workflow Template created successfully!", "success");
            }

            // Clear draft if not editing (edit mode doesn't use draft)
            if (!initialData) {
                document.cookie = "workflowDraft=; path=/; max-age=0";
            }

            // Reset form (Always)
            setCurrentStep(1);
            setSelectedTemplateId(null);
            setFormData({
                title: "",
                description: "",
                priority: "Standard",
                workflowType: "",
                approvers: []
            });

            // Notify parent to refresh list
            if (onSuccess) onSuccess();

            // Exit edit mode if applicable
            if (onCancel) onCancel();

        } catch (error) {
            console.error("Failed to submit workflow:", error);
            const msg = error.response?.data?.message || "Failed to save workflow.";
            showAlert("Submission Failed", msg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const addApproverStep = (roleId) => {
        const role = roles.find(r => r.id === parseInt(roleId) || r.name === roleId || r.id === roleId);
        if (!role) return;

        setFormData(prev => ({
            ...prev,
            approvers: [...prev.approvers, {
                type: "role",
                name: role.name,
                role_id: role.id
            }]
        }));
    };

    return (
        <div className="relative">
            <AlertModal
                isOpen={alertData.isOpen}
                onClose={() => setAlertData({ ...alertData, isOpen: false })}
                title={alertData.title}
                message={alertData.message}
                type={alertData.type}
            />

            {/* Header / Mode Indicator */}
            {initialData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-8 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="size-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-lg">edit</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Editing Template</p>
                            <p className="text-sm font-bold text-blue-900">{initialData.definition_name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline px-3 py-1"
                    >
                        Cancel Edit
                    </button>
                </div>
            )}

            {/* Step Indicator */}
            <div className="flex justify-between items-center mb-12 relative px-4">
                <div className="absolute top-1/2 left-4 right-4 h-1 bg-[#e7ebee] -z-10 -translate-y-1/2 rounded-full"></div>
                <div
                    className="absolute top-1/2 left-4 h-1 bg-blue-500 -z-0 -translate-y-1/2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep - 1) / 2) * 96}%` }}
                ></div>

                {[1, 2, 3].map((step) => (
                    <div key={step} className="flex flex-col items-center gap-2 bg-white px-2 z-10">
                        <div className={`
                            size-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors
                            ${currentStep >= step ? "bg-white border-blue-500 text-blue-600" : "bg-white border-[#d0dbe7] text-[#9ba5b1]"}
                            ${currentStep > step ? "!bg-blue-500 !text-white !border-blue-500" : ""}
                        `}>
                            {currentStep > step ? <span className="material-symbols-outlined text-lg">check</span> : step}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${currentStep >= step ? "text-blue-600" : "text-[#9ba5b1]"}`}>
                            {step === 1 && "Request Details"}
                            {step === 2 && "Workflow Type"}
                            {step === 3 && "Approval Chain"}
                        </span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form Area */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-bold text-[#0e141b] uppercase tracking-wider mb-4 border-b border-[#d0dbe7] pb-2">
                        Step {currentStep}: {currentStep === 1 ? "Request Details" : currentStep === 2 ? "Workflow Type" : "Approval Chain Configuration"}
                    </h2>

                    {currentStep === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Template Selection Section - Disabled in Edit Mode */}
                            {!initialData && (
                                <div>
                                    <div className="flex justify-between items-end mb-4">
                                        <label className="block text-xs font-bold text-[#4e7397] uppercase">
                                            Start with a Template
                                        </label>
                                        <button
                                            onClick={() => applyTemplate(null)}
                                            className="text-xs font-bold text-blue-600 hover:underline"
                                        >
                                            Running from scratch? Reset Form
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {WORKFLOW_TEMPLATES.map(template => (
                                            <div
                                                key={template.id}
                                                onClick={() => applyTemplate(template)}
                                                className={`
                                                    cursor-pointer border rounded-lg p-3 hover:shadow-md transition-all flex flex-col gap-2 relative overflow-hidden group
                                                    ${selectedTemplateId === template.id ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-[#d0dbe7] bg-white hover:border-blue-300"}
                                                `}
                                            >
                                                <div className={`
                                                    size-8 rounded flex items-center justify-center
                                                    ${selectedTemplateId === template.id ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600"}
                                                `}>
                                                    <span className="material-symbols-outlined text-lg">{template.icon}</span>
                                                </div>
                                                <div>
                                                    <h4 className={`text-xs font-bold ${selectedTemplateId === template.id ? "text-blue-900" : "text-[#0e141b]"}`}>
                                                        {template.title}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {template.tags.map(tag => (
                                                            <span key={tag} className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded">{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                {selectedTemplateId === template.id && (
                                                    <div className="absolute top-2 right-2 text-blue-500">
                                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {/* Custom Card */}
                                        <div
                                            onClick={() => applyTemplate(null)}
                                            className={`
                                                cursor-pointer border border-dashed rounded-lg p-3 hover:shadow-md transition-all flex flex-col gap-2 items-center justify-center text-center
                                                ${!selectedTemplateId ? "border-slate-400 bg-slate-50" : "border-[#d0dbe7] hover:border-blue-300"}
                                            `}
                                        >
                                            <div className="size-8 rounded bg-slate-200 text-slate-500 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-lg">edit_square</span>
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-600">Custom / Blank</h4>
                                        </div>
                                    </div>
                                    <hr className="border-[#d0dbe7]" />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-[#4e7397] uppercase mb-1">
                                    Workflow Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => {
                                        setFormData({ ...formData, title: e.target.value });
                                        if (selectedTemplateId) setSelectedTemplateId(null); // Clear selection if user edits manually
                                    }}
                                    className="w-full px-4 py-3 border border-[#d0dbe7] rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                    placeholder="e.g., Production Infrastructure Access"
                                />
                                <p className="text-[10px] text-[#4e7397] mt-1">Provide a clear, descriptive name for this workflow template.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#4e7397] uppercase mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-[#d0dbe7] rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary h-32 resize-none transition-all shadow-sm"
                                    placeholder="Describe the purpose and scope of this workflow..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#4e7397] uppercase mb-2">
                                    Priority Level
                                </label>
                                <div className="flex gap-6">
                                    {["Standard", "High", "Critical"].map((level) => (
                                        <label key={level} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="priority"
                                                value={level}
                                                checked={formData.priority === level}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                className="hidden"
                                            />
                                            <div className={`
                                                size-5 rounded-full border flex items-center justify-center transition-colors
                                                ${formData.priority === level ? "border-blue-500 bg-blue-500" : "border-[#d0dbe7] group-hover:border-blue-400"}
                                            `}>
                                                {formData.priority === level && <div className="size-2 bg-white rounded-full"></div>}
                                            </div>
                                            <span className={`text-sm font-medium ${formData.priority === level ? "text-[#0e141b]" : "text-[#4e7397]"}`}>
                                                {level}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <label className="block text-xs font-bold text-[#4e7397] uppercase mb-3">
                                    Select Workflow Type <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {WORKFLOW_TYPES.map((type) => (
                                        <div
                                            key={type.id}
                                            onClick={() => setFormData({ ...formData, workflowType: type.value })}
                                            className={`
                                                p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md flex items-start gap-4
                                                ${formData.workflowType === type.value ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-[#d0dbe7] bg-white hover:border-blue-300"}
                                            `}
                                        >
                                            <div className={`
                                                size-10 rounded-lg flex items-center justify-center shrink-0
                                                ${formData.workflowType === type.value ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600"}
                                            `}>
                                                <span className="material-symbols-outlined text-xl">{type.icon}</span>
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-bold ${formData.workflowType === type.value ? "text-blue-900" : "text-[#0e141b]"}`}>
                                                    {type.title}
                                                </h4>
                                                <p className="text-xs text-[#4e7397] mt-1 leading-relaxed">
                                                    {type.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-[#4e7397] uppercase mb-2">Approval Chain Configuration</h3>
                                <p className="text-xs text-[#4e7397]">Define the sequence of roles required to approve this workflow.</p>
                            </div>

                            <div className="space-y-4">
                                {formData.approvers.map((approver, index) => (
                                    <div key={index} className="flex items-center">
                                        {/* Step Number */}
                                        <div className="size-8 rounded-full bg-slate-100 border border-[#d0dbe7] flex items-center justify-center text-xs font-bold text-[#4e7397] shrink-0 z-10 transition-transform hover:scale-110">
                                            {index + 1}
                                        </div>

                                        {/* Connector Line */}
                                        <div className="w-8 h-px bg-[#d0dbe7]"></div>

                                        {/* Card */}
                                        <div className="flex-1 bg-white border border-[#d0dbe7] rounded p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 bg-orange-100 text-orange-600 rounded flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-lg">badge</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[#0e141b]">{approver.name}</p>
                                                    <p className="text-[10px] text-[#4e7397] uppercase">Role</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newApprovers = [...formData.approvers];
                                                    newApprovers.splice(index, 1);
                                                    setFormData({ ...formData, approvers: newApprovers });
                                                }}
                                                className="text-[#4e7397] hover:text-red-500 transition-colors"
                                                title="Remove Step"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Step */}
                                <div className="flex items-center gap-4">
                                    <div className="size-8 rounded-full bg-slate-50 border border-dashed border-[#d0dbe7] flex items-center justify-center text-xs font-bold text-[#4e7397] shrink-0">
                                        {formData.approvers.length + 1}
                                    </div>

                                    <select
                                        className="flex-1 border border-dashed border-[#d0dbe7] rounded p-3 text-sm font-bold text-[#4e7397] hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all bg-slate-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                addApproverStep(e.target.value);
                                                e.target.value = ""; // Reset
                                            }
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>+ Add Approval Step (Select Role)</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-[#d0dbe7] rounded p-6 shadow-sm sticky top-6">
                        <h3 className="text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-4 border-b border-[#d0dbe7] pb-2">
                            Workflow Summary
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-[#9ba5b1] uppercase">Title</p>
                                <p className="text-sm font-bold text-[#0e141b] truncate">{formData.title || "--"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#9ba5b1] uppercase">Type</p>
                                <p className="text-sm font-bold text-[#0e141b] capitalize">{formData.workflowType || "--"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#9ba5b1] uppercase">Steps</p>
                                <p className="text-sm font-bold text-blue-600">{formData.approvers.length}</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-[#d0dbe7]">
                            <button className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">help</span>
                                Need Help?
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-12 pt-6 border-t border-[#d0dbe7] flex justify-between bg-white/50 backdrop-blur-sm sticky bottom-0 p-4 rounded-b-lg">
                <button
                    onClick={currentStep === 1 ? () => { } : handleBack}
                    className={`px-6 py-2 border border-[#d0dbe7] rounded text-sm font-bold text-[#0e141b] hover:bg-gray-50 transition-colors ${currentStep === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={currentStep === 1}
                >
                    Back
                </button>
                <div className="flex gap-3">
                    {!initialData && (
                        <button
                            onClick={handleSaveDraft}
                            disabled={isLoading}
                            className="px-6 py-2 border border-orange-500 text-orange-500 rounded text-sm font-bold hover:bg-orange-50 transition-colors disabled:opacity-50"
                        >
                            Save as Draft
                        </button>
                    )}
                    <button
                        onClick={currentStep === 3 ? handleSubmit : handleNext}
                        disabled={isLoading}
                        className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                        {currentStep === 3 ? (initialData ? "Update Template" : "Create Template") : "Next Step"}
                    </button>
                </div>
            </div>
        </div>
    );
}
