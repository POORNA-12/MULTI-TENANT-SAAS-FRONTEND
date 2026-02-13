import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import workflowService from "../services/workflowService";

export default function Workflows() {
    const [activeTab, setActiveTab] = useState("creation");
    const [workflows, setWorkflows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch workflows
    const fetchWorkflows = async () => {
        setIsLoading(true);
        try {
            const data = await workflowService.getWorkflows();
            setWorkflows(data.workflows || []);
        } catch (error) {
            console.error("Failed to fetch workflows:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const handleAction = async (id, action) => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;
        try {
            await workflowService.performAction(id, action);
            fetchWorkflows(); // Refresh list
        } catch (error) {
            console.error(`Failed to ${action} workflow:`, error);
            alert(`Failed to ${action} workflow`);
        }
    };

    // Filter workflows
    const activeRequests = workflows.filter(w => ["submitted", "draft"].includes(w.status));
    const completedRequests = workflows.filter(w => ["approved", "rejected"].includes(w.status));


    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-[#0e141b] tracking-tight">
                        Workflows Management Hub
                    </h1>
                    <p className="text-sm text-[#4e7397] mt-1">
                        Design, manage, and monitor automated business processes.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#d0dbe7] mb-8">
                    <button
                        onClick={() => setActiveTab("creation")}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "creation"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-[#4e7397] hover:text-[#0e141b]"
                            }`}
                    >
                        Workflow Creation
                    </button>
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "requests"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-[#4e7397] hover:text-[#0e141b]"
                            }`}
                    >
                        Workflow Requests
                        <span className="bg-[#e7ebee] text-[#4e7397] text-[10px] px-1.5 py-0.5 rounded-full">12</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("completion")}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "completion"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-[#4e7397] hover:text-[#0e141b]"
                            }`}
                    >
                        Workflow Request Completion
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white border border-[#d0dbe7] rounded-lg shadow-sm min-h-[600px] p-6">
                    {activeTab === "creation" && (
                        <div className="max-w-4xl mx-auto">
                            <WorkflowWizard />
                        </div>
                    )}
                    {activeTab === "requests" && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-[#0e141b]">Active Requests</h2>
                                <button onClick={fetchWorkflows} className="text-xs text-blue-600 font-bold hover:underline">Refresh</button>
                            </div>

                            {activeRequests.length === 0 ? (
                                <div className="p-8 text-center text-[#4e7397] border border-dashed border-[#d0dbe7] rounded-lg">
                                    No active requests found.
                                </div>
                            ) : (
                                activeRequests.map((req) => (
                                    <div key={req.id} className="border border-[#d0dbe7] rounded-lg p-4 bg-white hover:shadow-sm transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded flex items-center justify-center bg-blue-100 text-blue-600">
                                                <span className="material-symbols-outlined">description</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-[#0e141b]">{req.title}</h4>
                                                <div className="flex items-center gap-2 text-xs text-[#4e7397] mt-0.5">
                                                    <span className="font-mono">{req.id}</span>
                                                    <span>•</span>
                                                    <span>{req.created_by}</span>
                                                    <span>•</span>
                                                    <span>{new Date(req.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 justify-end">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${req.status === 'submitted' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {req.status}
                                            </span>

                                            {req.status === 'submitted' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAction(req.id, "approve")}
                                                        className="size-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors"
                                                        title="Approve"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">check</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(req.id, "reject")}
                                                        className="size-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                                                        title="Reject"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">close</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    {activeTab === "completion" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#0e141b]">
                                <div className="bg-white border border-[#d0dbe7] rounded-lg p-6 flex items-start gap-4">
                                    <div className="size-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined">check_circle</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-1">Success Rate</p>
                                        <h3 className="text-3xl font-black tracking-tight">94.2%</h3>
                                        <p className="text-[10px] font-bold text-green-600 mt-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">trending_up</span>
                                            2.1% from previous month
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white border border-[#d0dbe7] rounded-lg p-6 flex items-start gap-4">
                                    <div className="size-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined">timer</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-1">Average Resolution Time</p>
                                        <h3 className="text-3xl font-black tracking-tight">1h 14m</h3>
                                        <p className="text-[10px] font-bold text-green-600 mt-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">arrow_downward</span>
                                            12m improvement
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <div className="relative w-full sm:w-96">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4e7397] text-lg">search</span>
                                    <input
                                        type="text"
                                        placeholder="Search by Request ID or Initiator..."
                                        className="w-full pl-10 pr-4 py-2 border border-[#d0dbe7] rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <select className="px-3 py-2 border border-[#d0dbe7] rounded text-sm text-[#0e141b] focus:outline-none focus:border-blue-500 bg-white">
                                        <option>All Types</option>
                                        <option>Provisioning</option>
                                        <option>Security</option>
                                    </select>
                                    <select className="px-3 py-2 border border-[#d0dbe7] rounded text-sm text-[#0e141b] focus:outline-none focus:border-blue-500 bg-white">
                                        <option>All Statuses</option>
                                        <option>Approved</option>
                                        <option>Rejected</option>
                                    </select>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="bg-white border border-[#d0dbe7] rounded-lg shadow-sm overflow-hidden">
                                <WorkflowTable
                                    headers={["Request ID", "Title", "Created By", "Status", "Date", "Actions"]}
                                    rows={completedRequests.map(req => ({
                                        id: req.id,
                                        initiator: req.created_by,
                                        type: req.title, // Mapping title to Type column for now or renaming column
                                        status: req.status.toUpperCase(),
                                        date: new Date(req.created_at).toLocaleDateString(),
                                        approver: "-" // API doesn't return approver yet
                                    }))}
                                />
                                <div className="p-4 bg-gray-50 border-t border-[#d0dbe7] flex items-center justify-between">
                                    <span className="text-xs text-[#4e7397] font-bold">Showing 5 of 142 completed workflows</span>
                                    <div className="flex gap-1">
                                        <button className="size-8 rounded bg-white border border-[#d0dbe7] flex items-center justify-center text-[#4e7397] hover:bg-slate-50 disabled:opacity-50" disabled><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                                        <button className="size-8 rounded bg-blue-600 border border-blue-600 flex items-center justify-center text-white text-xs font-bold">1</button>
                                        <button className="size-8 rounded bg-white border border-[#d0dbe7] flex items-center justify-center text-[#0e141b] hover:bg-slate-50 text-xs font-bold">2</button>
                                        <button className="size-8 rounded bg-white border border-[#d0dbe7] flex items-center justify-center text-[#0e141b] hover:bg-slate-50 text-xs font-bold">3</button>
                                        <button className="size-8 rounded bg-white border border-[#d0dbe7] flex items-center justify-center text-[#4e7397] hover:bg-slate-50"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

function WorkflowTable({ headers, rows }) {
    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 border-b border-[#d0dbe7] text-xs font-bold text-[#4e7397] uppercase tracking-wider">
                    {headers.map((header, idx) => (
                        <th key={idx} className={`p-4 ${idx === headers.length - 1 ? "text-right" : ""}`}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-[#d0dbe7]">
                {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors border-b border-[#d0dbe7] last:border-0">
                        <td className="p-4 text-sm font-bold text-blue-600">{row.id}</td>
                        <td className="p-4">
                            <div className="flex items-center gap-2">
                                <div className="size-6 rounded-full bg-slate-200 text-[#4e7397] flex items-center justify-center text-[10px] font-bold">
                                    {row.initiator.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="text-sm text-[#0e141b]">{row.initiator}</span>
                            </div>
                        </td>
                        <td className="p-4 text-sm text-[#0e141b]">{row.type}</td>
                        <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${row.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {row.status}
                            </span>
                        </td>
                        <td className="p-4 text-sm text-[#4e7397]">{row.date}</td>
                        <td className="p-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400 text-sm">verified_user</span>
                                <span className="text-sm text-[#0e141b]">{row.approver}</span>
                            </div>
                        </td>
                        <td className="p-4 text-right">
                            <button className="text-xs font-bold text-blue-600 hover:underline">View Summary</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function WorkflowWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "Standard",
        workflowType: "",
        approvers: []
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSaveDraft = async () => {
        if (!formData.title) {
            alert("Please enter a title");
            return;
        }
        setIsLoading(true);
        try {
            await workflowService.createWorkflow({
                title: formData.title,
                description: formData.description
            });
            alert("Draft saved successfully!");
            // Reset form logic could go here
        } catch (error) {
            console.error("Failed to save draft:", error);
            alert("Failed to save draft");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // 1. Create Workflow
            const newWorkflow = await workflowService.createWorkflow({
                title: formData.title,
                description: formData.description
            });

            // 2. Submit Workflow
            if (newWorkflow && newWorkflow.id) {
                await workflowService.submitWorkflow(newWorkflow.id);
                alert("Workflow submitted successfully!");
                setCurrentStep(1);
                setFormData({
                    title: "",
                    description: "",
                    priority: "Standard",
                    workflowType: "",
                    approvers: []
                });
            }
        } catch (error) {
            console.error("Failed to submit workflow:", error);
            alert("Failed to submit workflow");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {/* Step Indicator */}
            <div className="flex justify-between items-center mb-12 relative">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-[#e7ebee] -z-10 -translate-y-1/2 rounded-full"></div>
                {/* Active Progress Bar */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-blue-500 -z-0 -translate-y-1/2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                ></div>

                {[1, 2, 3].map((step) => (
                    <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
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
                    <h2 className="text-lg font-bold text-[#0e141b] uppercase tracking-wider mb-4">
                        Step {currentStep}: {currentStep === 1 ? "Request Details" : currentStep === 2 ? "Workflow Type" : "Approval Chain"}
                    </h2>

                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <label className="block text-xs font-bold text-[#4e7397] uppercase mb-1">
                                    Workflow Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-[#d0dbe7] rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                    placeholder="e.g., Production Infrastructure Access"
                                />
                                <p className="text-[10px] text-[#4e7397] mt-1">Provide a clear, descriptive name for this workflow template.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#4e7397] uppercase mb-1">
                                    Description
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
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-sm font-bold text-[#4e7397] uppercase mb-4">Select Workflow Type</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { id: "provisioning", icon: "inventory_2", title: "Provisioning", desc: "Resource allocation, instance spin-up, and environment setup." },
                                    { id: "security", icon: "security", title: "Security Policy", desc: "IAM changes, firewall rule updates, and encryption policies." },
                                    { id: "access", icon: "vpn_key", title: "Access Request", desc: "Temporary or permanent privilege elevation for users." },
                                    { id: "custom", icon: "settings_suggest", title: "Custom Logic", desc: "Define complex branching logic and external integrations." }
                                ].map((type) => (
                                    <div
                                        key={type.id}
                                        onClick={() => setFormData({ ...formData, workflowType: type.id })}
                                        className={`
                                            p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md flex items-start gap-4
                                            ${formData.workflowType === type.id ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-[#d0dbe7] bg-white hover:border-blue-300"}
                                        `}
                                    >
                                        <div className={`
                                            size-10 rounded flex items-center justify-center shrink-0
                                            ${formData.workflowType === type.id ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600"}
                                        `}>
                                            <span className="material-symbols-outlined">{type.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-bold mb-1 ${formData.workflowType === type.id ? "text-blue-900" : "text-[#0e141b]"}`}>
                                                {type.title}
                                            </h4>
                                            <p className="text-xs text-[#4e7397] leading-relaxed">
                                                {type.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-[#4e7397] uppercase mb-2">Approval Chain Configuration</h3>
                                <p className="text-xs text-[#4e7397]">Define the sequence of approvals required for this workflow.</p>
                            </div>

                            <div className="space-y-4">
                                {formData.approvers.map((approver, index) => (
                                    <div key={index} className="flex items-center">
                                        {/* Step Number */}
                                        <div className="size-8 rounded-full bg-slate-100 border border-[#d0dbe7] flex items-center justify-center text-xs font-bold text-[#4e7397] shrink-0 z-10">
                                            {index + 1}
                                        </div>

                                        {/* Connector Line */}
                                        <div className="w-8 h-px bg-[#d0dbe7]"></div>

                                        {/* Card */}
                                        <div className="flex-1 bg-white border border-[#d0dbe7] rounded p-3 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 bg-orange-100 text-orange-600 rounded flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-lg">
                                                        {approver.type === "role" ? "badge" : "person"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[#0e141b]">{approver.name}</p>
                                                    <p className="text-[10px] text-[#4e7397] uppercase">{approver.type}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newApprovers = [...formData.approvers];
                                                    newApprovers.splice(index, 1);
                                                    setFormData({ ...formData, approvers: newApprovers });
                                                }}
                                                className="text-[#4e7397] hover:text-red-500 transition-colors"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Step Button */}
                                <div className="flex items-center">
                                    <div className="size-8 rounded-full bg-slate-50 border border-dashed border-[#d0dbe7] flex items-center justify-center text-xs font-bold text-[#4e7397] shrink-0">
                                        {formData.approvers.length + 1}
                                    </div>
                                    <div className="w-8 h-px bg-[#d0dbe7] border-t border-dashed"></div>

                                    <button
                                        onClick={() => setFormData({
                                            ...formData,
                                            approvers: [...formData.approvers, { type: "role", name: "Select Approver" }] // Placeholder logic
                                        })}
                                        className="flex-1 border border-dashed border-[#d0dbe7] rounded p-3 flex items-center justify-center text-sm font-bold text-[#4e7397] hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all bg-slate-50 gap-2"
                                    >
                                        <span className="material-symbols-outlined">add_circle</span>
                                        Click to add approval step
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-[#d0dbe7] rounded p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-4 border-b border-[#d0dbe7] pb-2">
                            Workflow Summary
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-[#9ba5b1] uppercase">Estimated Duration</p>
                                <p className="text-sm font-bold text-[#0e141b]">--</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#9ba5b1] uppercase">Complexity Score</p>
                                <p className="text-sm font-bold text-green-600">Low</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#9ba5b1] uppercase">Auto-Escalation</p>
                                <p className="text-sm font-bold text-[#0e141b]">Enabled (48h)</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded p-6">
                        <div className="flex items-center gap-2 mb-2 text-blue-700">
                            <span className="material-symbols-outlined text-lg">info</span>
                            <h3 className="text-xs font-bold uppercase tracking-wider">Wizard Tips</h3>
                        </div>
                        <p className="text-xs text-blue-600 leading-relaxed">
                            Defined workflows can be triggered manually or via API endpoints. Ensure Step 1 title clearly identifies the purpose for end-users.
                        </p>
                        <button className="text-xs font-bold text-blue-700 mt-3 hover:underline">View documentation</button>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-12 pt-6 border-t border-[#d0dbe7] flex justify-between">
                <button
                    onClick={currentStep === 1 ? () => { } : handleBack}
                    className={`px-6 py-2 border border-[#d0dbe7] rounded text-sm font-bold text-[#0e141b] hover:bg-gray-50 transition-colors ${currentStep === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={currentStep === 1}
                >
                    Cancel
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handleSaveDraft}
                        disabled={isLoading}
                        className="px-6 py-2 border border-orange-500 text-orange-500 rounded text-sm font-bold hover:bg-orange-50 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Saving..." : "Save as Draft"}
                    </button>
                    <button
                        onClick={currentStep === 3 ? handleSubmit : handleNext}
                        disabled={isLoading}
                        className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded shadow-sm transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Submitting..." : (currentStep === 3 ? "Submit for Approval" : "Next Step")}
                    </button>
                </div>
            </div>
        </div>
    );
}

