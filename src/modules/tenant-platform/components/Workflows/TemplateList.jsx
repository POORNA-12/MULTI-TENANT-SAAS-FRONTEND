import { useState, useEffect } from 'react';
import { FileText, ArrowRight, Loader2 } from 'lucide-react';
import { getTemplates } from '../../services/workflowService';
import { useAuth } from '../../context/AuthContext';
import ApplyWorkflowModal from './ApplyWorkflowModal';

export default function TemplateList() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const { tenantSlug } = useAuth();

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true);
                const data = await getTemplates(tenantSlug);
                setTemplates(data.templates || []);
            } catch (err) {
                console.error("Failed to fetch templates:", err);
                setError("Failed to load workflow templates.");
            } finally {
                setLoading(false);
            }
        };

        if (tenantSlug) {
            fetchTemplates();
        }
    }, [tenantSlug]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                {error}
            </div>
        );
    }

    if (templates.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No templates available</h3>
                <p className="text-gray-500">There are no workflow templates configured for this tenant.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <div
                        key={template.definition_id}
                        className="bg-white border border-border rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col h-full"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                                {template.workflow_type}
                            </span>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                            {template.description || "No description provided."}
                        </p>

                        <div className="mt-auto">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex -space-x-2 overflow-hidden">
                                    {template.steps.map((step, i) => (
                                        <div
                                            key={i}
                                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600"
                                            title={`Step ${step.step_order}: ${step.role}`}
                                        >
                                            {step.role.charAt(0)}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-xs text-gray-500">
                                    {template.steps.length} Step{template.steps.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <button
                                onClick={() => setSelectedTemplate(template)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 hover:border-primary text-gray-700 hover:text-primary rounded-lg text-sm font-medium transition-colors cursor-pointer"
                            >
                                Apply Now
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedTemplate && (
                <ApplyWorkflowModal
                    template={selectedTemplate}
                    onClose={() => setSelectedTemplate(null)}
                />
            )}
        </>
    );
}
