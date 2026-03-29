import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    Home,
    ChevronRight,
    FileText,
    Send,
    Info,
    Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as workflowService from '../services/workflowService';

export default function ApplyWorkflow() {
    const { definitionId } = useParams();
    const { tenantSlug } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [templateName, setTemplateName] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    useEffect(() => {
        const fetchTemplateDetails = async () => {
            if (!tenantSlug || !definitionId) return;
            try {
                const templates = await workflowService.getTemplates(tenantSlug);
                const list = Array.isArray(templates) ? templates : templates?.results || templates?.templates || [];
                const found = list.find(t =>
                    String(t.id) === String(definitionId) ||
                    String(t.definition_id) === String(definitionId)
                );
                if (found) {
                    setTemplateName(found.name || found.title);
                }
            } catch (err) {
                console.error("Failed to fetch template details", err);
            }
        };
        fetchTemplateDetails();
    }, [tenantSlug, definitionId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.title.trim()) {
            setError('Request title is required.');
            return;
        }

        setLoading(true);
        try {
            await workflowService.applyWorkflow(tenantSlug, definitionId, {
                title: formData.title,
                description: formData.description,
            });
            setSuccess('Request submitted successfully! Redirecting...');
            setTimeout(() => navigate('/portal/dashboard'), 1500);
        } catch (err) {
            if (err.data && typeof err.data === 'object') {
                const messages = Object.values(err.data)
                    .flat()
                    .filter((v) => typeof v === 'string');
                setError(messages.join(' ') || err.message);
            } else {
                setError(err.message || 'Failed to submit request.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Breadcrumb */}
<nav className="flex items-center gap-1.5 text-sm mb-6">
    <Link to="/portal/dashboard" className="flex items-center gap-1 text-portal-textsecondary hover:text-portal-primary transition-colors">
        <Home className="w-3.5 h-3.5" />
        Templates
    </Link>
    <ChevronRight className="w-3.5 h-3.5 text-portal-textmuted" />
    <span className="text-portal-primary font-medium">Apply for Workflow</span>
</nav>

            {/* Page heading */}
            <div className="mb-8">
<h1 className="text-2xl font-bold text-portal-navy mb-2">
    {templateName ? `Apply for ${templateName}` : 'Apply for Workflow'}
</h1>
<div className="flex items-center gap-2 text-sm text-portal-textsecondary">
    <FileText className="w-4 h-4 text-portal-primary" />
    <span>Template ID: <strong className="text-portal-navy">#{definitionId}</strong></span>
</div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-danger font-medium">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-success font-medium">
                    {success}
                </div>
            )}

            {/* Form card */}
            <form onSubmit={handleSubmit}>
<div className="bg-white rounded-xl border border-portal-border p-6 sm:p-8 space-y-6 shadow-sm">
    {/* Request Title */}
    <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-portal-textprimary mb-2">
            Request Title
        </label>
        <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a brief title for your request..."
            className="w-full px-4 py-3 bg-portal-inputbg border border-portal-border rounded-xl text-sm text-portal-textprimary placeholder:text-portal-textmuted focus:outline-none focus:border-portal-primary focus:ring-2 focus:ring-portal-primary/10 transition-all"
        />
        <p className="text-xs text-portal-textmuted mt-1.5">
            Summarize the main goal of this deployment request.
        </p>
    </div>

    {/* Description */}
    <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-portal-textprimary mb-2">
            Detailed Description
        </label>
        <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide all necessary details here, including environment, version, and specific instructions..."
            rows={6}
            className="w-full px-4 py-3 bg-portal-inputbg border border-portal-border rounded-xl text-sm text-portal-textprimary placeholder:text-portal-textmuted focus:outline-none focus:border-portal-primary focus:ring-2 focus:ring-portal-primary/10 transition-all resize-none"
        />
    </div>

    {/* Submission Tip */}
    <div className="bg-portal-primary/5 border border-portal-primary/15 rounded-xl px-5 py-4 flex gap-3">
        <Info className="w-5 h-5 text-portal-primary shrink-0 mt-0.5" />
        <div>
            <p className="text-sm font-semibold text-portal-primary mb-0.5">Submission Tip</p>
            <p className="text-xs text-portal-textsecondary leading-relaxed">
                This template requires approval from competent authority before it can proceed to the next phase.
            </p>
        </div>
    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
<button
    type="submit"
    disabled={loading}
    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-portal-primary hover:bg-portal-primary-hover text-white font-semibold rounded-xl shadow-lg shadow-portal-primary/25 hover:shadow-portal-primary/40 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
>
    {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
    ) : (
        <>
            Submit Request
            <Send className="w-4 h-4" />
        </>
    )}
</button>
<Link
    to="/portal/dashboard"
    className="px-8 py-3.5 text-center font-semibold text-portal-textsecondary hover:text-portal-textprimary border border-portal-border rounded-xl hover:bg-portal-bg transition-all duration-200"
>
    Cancel
</Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
