import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    Check,
    LayoutTemplate,
    FileText,
    Settings,
    Users,
    ArrowRight,
    ArrowLeft,
    CalendarOff,
    Wallet,
    KeyRound,
    Play,
    Edit3,
    HelpCircle,
    Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as workflowService from '../services/workflowService';

/* ── Icons Map ── */
const iconMap = {
    leave: { icon: CalendarOff, bg: 'bg-blue-50 text-blue-500' },
    expense: { icon: Wallet, bg: 'bg-emerald-50 text-emerald-500' },
    access: { icon: KeyRound, bg: 'bg-orange-50 text-orange-500' },
    default: { icon: LayoutTemplate, bg: 'bg-indigo-50 text-indigo-500' },
};

function getIconForTemplate(name) {
    const lower = (name || '').toLowerCase();
    for (const [key, val] of Object.entries(iconMap)) {
        if (key !== 'default' && lower.includes(key)) return val;
    }
    return iconMap.default;
}

export default function CreateWorkflow() {
    const { tenantSlug } = useAuth();
    const navigate = useNavigate();

    // Steps configuration
    const steps = [
        { id: 1, label: 'Request Details', icon: FileText },
        { id: 2, label: 'Workflow Type', icon: Settings },
        { id: 3, label: 'Approval Chain', icon: Users },
    ];

    const [currentStep, setCurrentStep] = useState(1);
    const [templates, setTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);

    // Form State
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Standard', // Standard, High, Critical
    });

    // Fetch Templates
    useEffect(() => {
        async function fetchTemplates() {
            if (!tenantSlug) return;
            try {
                setLoadingTemplates(true);
                const data = await workflowService.getTemplates(tenantSlug);
                setTemplates(Array.isArray(data) ? data : data?.templates || []);
            } catch (err) {
                console.error("Failed to fetch templates:", err);
            } finally {
                setLoadingTemplates(false);
            }
        }
        fetchTemplates();
    }, [tenantSlug]);

    const handleTemplateSelect = (tpl) => {
        setSelectedTemplate(tpl);
        if (!formData.title && tpl) {
            setFormData(prev => ({ ...prev, title: tpl.name }));
        }
    };

    const handleNext = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
        else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        if (!selectedTemplate) return;

        try {
            await workflowService.applyWorkflow(tenantSlug, selectedTemplate.definition_id, {
                title: formData.title,
                requester_description: formData.description
            });
            navigate('/portal/dashboard');
        } catch (error) {
            console.error("Submission failed", error);
            alert("Failed to create workflow: " + (error.message || "Unknown error"));
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto">
                <div className="flex items-center w-full relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10" />

                    {steps.map((step) => {
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;
                        const Icon = step.icon;

                        return (
                            <div key={step.id} className="flex-1 flex flex-col items-center">
<div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white ${isActive ? 'border-portal-primary text-portal-primary shadow-lg scale-110' :
        isCompleted ? 'border-portal-primary bg-portal-primary text-white' :
            'border-gray-200 text-gray-300'
    }`}>
    {isCompleted ? <Check className="w-5 h-5" /> : <span className="text-sm font-bold">{step.id}</span>}
</div>
<span className={`mt-2 text-xs font-bold uppercase tracking-wider ${isActive ? 'text-portal-primary' : isCompleted ? 'text-portal-navy' : 'text-portal-textmuted'
    }`}>
    {step.label}
</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_350px] gap-8">
<div className="bg-white rounded-2xl border border-portal-border p-6 sm:p-8 shadow-sm">
                    {currentStep === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div>
<h2 className="text-xl font-bold text-portal-navy mb-1">Step 1: Request Details</h2>
<p className="text-portal-textsecondary text-sm">Choose a template or start from blank to begin your workflow.</p>
                            </div>

                            <div className="space-y-3">
<label className="text-xs font-bold text-portal-textsecondary uppercase tracking-wider">Start with a Template</label>

                                {loadingTemplates ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[1, 2].map(i => (
                                            <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {templates.map(tpl => {
                                            const { icon: Icon, bg } = getIconForTemplate(tpl.name);
                                            const isSelected = selectedTemplate?.definition_id === tpl.definition_id;

                                            return (
                                                <div
    key={tpl.definition_id}
    onClick={() => handleTemplateSelect(tpl)}
    className={`relative p-4 rounded-xl border-2 text-left transition-all cursor-pointer group ${isSelected
            ? 'border-portal-primary bg-portal-primary/5 shadow-md ring-1 ring-portal-primary/20'
            : 'border-transparent bg-gray-50 hover:bg-white hover:border-gray-200 hover:shadow-sm'
        }`}
>
    <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bg} ${isSelected ? 'scale-110' : ''}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <h3 className={`font-bold text-sm ${isSelected ? 'text-portal-primary' : 'text-portal-navy'}`}>{tpl.name}</h3>
            <p className="text-xs text-portal-textsecondary mt-1 line-clamp-2">{tpl.description}</p>
        </div>
    </div>
    {isSelected && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-portal-primary text-white rounded-full flex items-center justify-center shadow-sm">
            <Check className="w-3 h-3" />
        </div>
    )}
</div>
                                            );
                                        })}

                                        <div
                                            className={`p-4 rounded-xl border-2 text-left transition-all cursor-not-allowed opacity-60 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center text-center gap-2`}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                <Edit3 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm text-gray-500">Custom / Blank</h3>
                                                <p className="text-[10px] text-gray-400">Coming soon</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

<hr className="border-portal-border" />

                            <div className="space-y-5">
<div>
    <label className="block text-xs font-bold text-portal-textsecondary uppercase tracking-wider mb-2">
        Workflow Title <span className="text-red-500">*</span>
    </label>
    <input
        type="text"
        value={formData.title}
        onChange={e => setFormData({ ...formData, title: e.target.value })}
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-portal-primary focus:ring-2 focus:ring-portal-primary/10 transition-all font-medium"
        placeholder="e.g., Production Infrastructure Access"
    />
    <p className="text-xs text-portal-textmuted mt-1.5">Provide a clear, descriptive name for this workflow request.</p>
</div>

<div>
    <label className="block text-xs font-bold text-portal-textsecondary uppercase tracking-wider mb-2">
        Description <span className="text-red-500">*</span>
    </label>
    <textarea
        rows={4}
        value={formData.description}
        onChange={e => setFormData({ ...formData, description: e.target.value })}
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-portal-primary focus:ring-2 focus:ring-portal-primary/10 transition-all resize-none"
        placeholder="Describe the purpose and scope of this workflow..."
    />
</div>

<div>
    <label className="block text-xs font-bold text-portal-textsecondary uppercase tracking-wider mb-2">Priority Level</label>
    <div className="flex items-center gap-4">
        {['Standard', 'High', 'Critical'].map(p => (
            <label key={p} className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.priority === p ? 'border-portal-primary' : 'border-gray-300'}`}>
                    {formData.priority === p && <div className="w-2 h-2 rounded-full bg-portal-primary" />}
                </div>
                <span className={`text-sm font-medium ${formData.priority === p ? 'text-portal-navy' : 'text-portal-textsecondary group-hover:text-portal-navy'}`}>{p}</span>
            </label>
        ))}
    </div>
</div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="py-12 text-center animate-in slide-in-from-right-4 duration-300">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Settings className="w-8 h-8" />
                            </div>
<h2 className="text-xl font-bold text-portal-navy mb-2">Workflow Configuration</h2>
<p className="text-portal-textsecondary text-sm max-w-sm mx-auto">
    Implementation of workflow specific settings (Sequential, Parallel, conditions) would go here in a future update.
</p>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="py-12 text-center animate-in slide-in-from-right-4 duration-300">
                            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8" />
                            </div>
<h2 className="text-xl font-bold text-portal-navy mb-2">Approval Chain Preview</h2>
<p className="text-portal-textsecondary text-sm max-w-sm mx-auto">
    Review the approvers required for this workflow.
</p>

                            <div className="mt-8 max-w-md mx-auto text-left space-y-3">
                                {selectedTemplate?.steps?.map((step, i) => (
<div key={i} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
        {i + 1}
    </div>
    <div className="font-medium text-portal-navy text-sm">{step.role}</div>
    <div className="ml-auto text-xs text-portal-textmuted">Approval Required</div>
</div>
                                )) || (
                                        <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-sm text-textmuted">
                                            No specific chain defined.
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}

<div className="flex items-center justify-between pt-8 mt-8 border-t border-portal-border">
    <button
        onClick={navigate.bind(null, -1)}
        className="px-6 py-2.5 text-sm font-semibold text-portal-textsecondary border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
    >
        Cancel
    </button>

    <div className="flex items-center gap-3">
        {currentStep > 1 ? (
            <button
                onClick={handleBack}
                className="px-6 py-2.5 text-sm font-semibold text-portal-textsecondary hover:text-portal-navy transition-colors"
            >
                Back
            </button>
        ) : (
            <button className="px-5 py-2.5 text-sm font-semibold text-portal-primary border border-portal-primary/20 bg-portal-primary/5 rounded-xl hover:bg-portal-primary/10 transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Draft
            </button>
        )}

        <button
            onClick={handleNext}
            disabled={currentStep === 1 && (!selectedTemplate || !formData.title)}
            className="px-8 py-2.5 bg-portal-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-portal-primary/25 hover:bg-portal-primary-hover hover:shadow-portal-primary/40 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {currentStep === 3 ? 'Submit Request' : 'Next Step'}
            {currentStep < 3 && <ArrowRight className="w-4 h-4 ml-0.5" />}
        </button>
    </div>
</div>
                </div>

                <div className="space-y-6">
<div className="bg-white rounded-2xl border border-portal-border p-6 shadow-sm sticky top-6">
    <h3 className="text-xs font-bold text-portal-textsecondary uppercase tracking-wider mb-4 pb-4 border-b border-portal-border">
        Workflow Summary
    </h3>

    <div className="space-y-5">
        <div>
            <p className="text-[10px] uppercase text-portal-textmuted font-bold mb-1">Title</p>
            <p className="text-sm font-bold text-portal-navy truncate">
                {formData.title || '--'}
            </p>
        </div>

        <div>
            <p className="text-[10px] uppercase text-portal-textmuted font-bold mb-1">Type</p>
            <p className="text-sm font-medium text-portal-textsecondary">
                {selectedTemplate?.workflow_type || '--'}
            </p>
        </div>

        <div className="flex items-center gap-2">
            <div>
                <p className="text-[10px] uppercase text-portal-textmuted font-bold mb-1">Steps</p>
                <p className="text-2xl font-black text-portal-primary">
                    {selectedTemplate?.steps?.length || 0}
                </p>
            </div>
            {selectedTemplate && (
                <div className="text-xs text-portal-textmuted self-end mb-1">stages configured</div>
            )}
        </div>
    </div>
</div>
                </div>
            </div>
        </div>
    );
}
