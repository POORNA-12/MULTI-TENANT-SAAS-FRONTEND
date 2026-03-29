import { useState } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { applyWorkflow } from '../../services/workflowService';

export default function ApplyWorkflowModal({ template, onClose, onSuccess }) {
    const { tenantSlug } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            setError("Please fill in all required fields.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            await applyWorkflow(tenantSlug, template.definition_id, {
                title,
                requester_description: description
            });

            setSuccess(true);

            // Call onSuccess prop if provided, then close
            if (onSuccess) onSuccess();

            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (err) {
            console.error("Failed to apply for workflow:", err);
            setError(err.message || "Failed to submit request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">New Request</h3>
                        <p className="text-sm text-gray-500">{template.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h4>
                            <p className="text-gray-500">Your workflow request has been sent for approval.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Request Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                                    placeholder="e.g., Q4 Marketing Budget Approval"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all resize-none"
                                    placeholder="Provide details about your request..."
                                    required
                                />
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <h5 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Approval Chain</h5>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {template.steps.map((step, index) => (
                                        <div key={index} className="flex items-center text-sm text-blue-800">
                                            <span className="font-medium bg-white px-2 py-0.5 rounded shadow-sm border border-blue-100">
                                                {step.role}
                                            </span>
                                            {index < template.steps.length - 1 && (
                                                <ArrowRight className="w-3 h-3 mx-1 text-blue-300" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit Request
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper component since I used it above
function ArrowRight({ className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}
