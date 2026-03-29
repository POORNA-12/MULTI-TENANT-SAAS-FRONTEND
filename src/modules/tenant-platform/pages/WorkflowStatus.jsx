import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    ShieldAlert,
    Printer,
    MoreHorizontal,
    FileText,
    Download,
    Lock,
    Bell,
    X,
    UserCircle
} from 'lucide-react';
import { getRequestStatus } from '../services/workflowService';
import { useAuth } from '../context/AuthContext';

export default function WorkflowStatus() {
    const { requestId } = useParams();
    const { tenantSlug } = useAuth();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                setLoading(true);
                const response = await getRequestStatus(tenantSlug, requestId);
                setData(response);
            } catch (err) {
                console.error("Failed to fetch request status:", err);
                setError("Failed to load request details.");
            } finally {
                setLoading(false);
            }
        };

        if (tenantSlug && requestId) {
            fetchStatus();
        }
    }, [tenantSlug, requestId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center pin-center h-[calc(100vh-200px)]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-portal-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-gray-500 animate-pulse">Loading request details...</p>
                </div>
            </div>
        );
    }

    if (error || !data || !data.request_info) {
        return (
            <div className="max-w-2xl mx-auto mt-12 p-6">
                <Link to="/portal/dashboard" className="inline-flex items-center text-portal-textmuted hover:text-portal-navy mb-8 transition-colors text-sm font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>
                <div className="p-8 bg-red-50 text-red-900 rounded-2xl border border-red-100 flex flex-col items-center text-center">
                    <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-bold mb-2">Unable to Load Request</h3>
                    <p className="text-red-700/80 mb-6">{error || "Request not found."}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold shadow-sm"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // --- Derived Data ---
    const { request_info, progress, approval_workflow, recent_activity } = data;

    const createdDate = request_info.date_submitted ? new Date(request_info.date_submitted) : new Date();
    const expectedFinishDate = new Date(createdDate);
    expectedFinishDate.setDate(createdDate.getDate() + 10);

    const getStatusBadgeStyles = (status) => {
        const s = status?.toLowerCase() || 'pending';
        if (s === 'approved' || s === 'completed') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (s === 'rejected') return 'bg-red-100 text-red-800 border-red-200';
        if (s === 'in progress' || s === 'pending') return 'bg-amber-100 text-amber-800 border-amber-200';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            {/* ── Breadcrumb & Actions ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <nav className="flex items-center text-sm font-medium text-portal-textmuted">
    <Link to="/portal/dashboard" className="hover:text-portal-primary transition-colors">Dashboard</Link>
    <span className="mx-2 text-gray-300">/</span>
    <span className="text-portal-textprimary">Requests</span>
    <span className="mx-2 text-gray-300">/</span>
    <span className="text-portal-primary truncate max-w-[200px]">#{request_info.request_id}</span>
</nav>
            </div>

            {/* ── Header Section ── */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadgeStyles(request_info.status)}`}>
                                {request_info.status}
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-portal-navy tracking-tight">{request_info.title}</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-portal-border rounded-xl text-sm font-bold text-portal-navy hover:bg-portal-bg hover:border-gray-300 transition-all shadow-sm hover:shadow-md">
    <Printer className="w-4 h-4 text-portal-textmuted" />
    Print
</button>
                        {request_info.status === 'pending' && (
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-red-100 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-200 transition-all shadow-sm hover:shadow-md">
                                <XCircle className="w-4 h-4" />
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                    {/* Requested By */}
                    <div className="bg-white p-5 rounded-2xl border border-portal-border shadow-sm">
    <p className="text-[10px] font-bold text-portal-textsecondary uppercase tracking-wider mb-1">Requested By</p>
    <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-portal-primary/10 text-portal-primary flex items-center justify-center text-xs font-bold">
            {(request_info.requested_by || 'U').charAt(0).toUpperCase()}
        </div>
        <p className="font-bold text-portal-navy text-sm md:text-base truncate" title={request_info.requested_by}>
            {request_info.requested_by}
        </p>
    </div>
</div>

                    {/* Date Submitted */}
                    <div className="bg-white p-5 rounded-2xl border border-portal-border shadow-sm">
    <p className="text-[10px] font-bold text-portal-textsecondary uppercase tracking-wider mb-2">Date Submitted</p>
    <p className="font-bold text-portal-navy text-base md:text-lg">
        {createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    </p>
</div>

                    {/* Expected Finish */}
                    <div className="bg-white p-5 rounded-2xl border border-portal-border shadow-sm">
    <p className="text-[10px] font-bold text-portal-textsecondary uppercase tracking-wider mb-2">Expected Finish</p>
    <p className="font-bold text-portal-navy text-base md:text-lg">
        {expectedFinishDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    </p>
</div>
                </div>
            </div>

            {/* ── Main Content Grid ── */}
            <div className="grid lg:grid-cols-[1fr_320px] gap-8">

                {/* Left Column: Workflow Timeline */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
    <div className="bg-portal-primary/10 p-2 rounded-lg">
        <MoreHorizontal className="w-5 h-5 text-portal-primary rotate-90" />
    </div>
    <h2 className="text-xl font-bold text-portal-navy">Approval Workflow</h2>
</div>

                    <div className="space-y-4">
                        {approval_workflow.map((step, index) => {
                            const isCompleted = step.status === 'approved' || step.status === 'completed';
                            const isRejected = step.status === 'rejected';
                            const isCurrent = step.status === 'pending';
                            const isFuture = step.status === 'waiting' || (!isCompleted && !isRejected && !isCurrent);

                            return (
                                <div key={index} className="relative group">
                                    {index !== approval_workflow.length - 1 && (
                                        <div className={`absolute top-10 left-[22px] bottom-[-24px] w-0.5 ${isCompleted ? 'bg-emerald-200' : 'bg-gray-100'}`} />
                                    )}

                                    <div className="flex gap-4">
                                        <div className="relative z-10 shrink-0">
                                            {isCompleted && (
                                                <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-white shadow-sm">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                                </div>
                                            )}
                                            {isRejected && (
                                                <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center border-4 border-white shadow-sm">
                                                    <XCircle className="w-5 h-5 text-red-600" />
                                                </div>
                                            )}
                                            {isCurrent && (
                                                <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center border-4 border-white shadow-sm animate-pulse">
                                                    <Clock className="w-5 h-5 text-amber-600" />
                                                </div>
                                            )}
                                            {isFuture && (
                                                <div className="w-11 h-11 rounded-full bg-gray-50 flex items-center justify-center border-4 border-white shadow-sm">
                                                    <Lock className="w-4 h-4 text-gray-300" />
                                                </div>
                                            )}
                                        </div>

                                        <div className={`flex-1 rounded-2xl border p-5 transition-all duration-200 ${isCurrent
                                            ? 'bg-white border-amber-200 shadow-lg shadow-amber-500/5 ring-1 ring-amber-100'
                                            : isRejected
                                                ? 'bg-red-50/30 border-red-200'
                                                : 'bg-white border-border hover:shadow-md'
                                            }`}>
                                            <div className="flex items-start justify-between mb-1">
                                                <h3 className={`font-bold text-lg ${isCompleted ? 'text-portal-textprimary' : isCurrent ? 'text-portal-navy' : 'text-portal-textmuted'}`}>
    {step.role}
</h3>
                                                {isCompleted ? (
                                                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-100">
                                                        Approved
                                                    </span>
                                                ) : isRejected ? (
                                                    <span className="px-2.5 py-1 bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded border border-red-100">
                                                        Rejected
                                                    </span>
                                                ) : isCurrent ? (
                                                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded border border-amber-100">
                                                        Pending
                                                    </span>
                                                ) : isFuture ? (
                                                    <span className="px-2.5 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded border border-gray-100">
                                                        Waiting
                                                    </span>
                                                ) : null}
                                            </div>

                                            <p className="text-sm text-portal-textsecondary mb-3">
                                                Verification and approval step.
                                            </p>

                                            <div className="flex items-center gap-4 text-xs font-medium text-portal-textmuted border-t border-portal-border/50 pt-3 mt-1">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-[10px]">
                                                        {step.role.charAt(0)}
                                                    </div>
                                                    <span>Assignee Group</span>
                                                </div>
                                                {isCompleted && step.approved_by && (
                                                    <div className="flex items-center gap-1.5">
                                                        <UserCircle className="w-3.5 h-3.5" />
                                                        <span title={step.approved_by}>Approved by {step.approved_by.split('@')[0]}</span>
                                                    </div>
                                                )}
                                                {step.action_at && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{new Date(step.action_at).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {isRejected && step.rejection_reason && (
                                                <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3 flex gap-3 text-sm text-red-800">
                                                    <ShieldAlert className="w-5 h-5 shrink-0" />
                                                    <div>
                                                        <p className="font-bold mb-0.5">Application Returned</p>
                                                        <p className="text-red-700">"{step.rejection_reason}"</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-portal-border p-6 shadow-sm">
    <h3 className="font-bold text-portal-navy text-lg mb-6">Current Progress</h3>

    <div className="flex items-end justify-between mb-2">
        <span className="text-sm font-medium text-portal-textsecondary">Steps Completed</span>
        <span className="text-sm font-bold text-portal-navy">{progress.steps_completed} of {progress.total_steps}</span>
    </div>

    <div className="h-3 w-full bg-portal-bg rounded-full overflow-hidden mb-4">
        <div
            className="h-full bg-gradient-to-r from-portal-primary to-portal-primary-hover rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress.percentage}%` }}
        />
    </div>

    <p className="text-xs text-portal-textmuted leading-relaxed">
        This request is <strong className="text-portal-navy">{progress.percentage}%</strong> through the approval lifecycle.
    </p>
</div>

                    <div className="bg-white rounded-2xl border border-portal-border p-6 shadow-sm">
    <h3 className="font-bold text-portal-navy text-lg mb-6">Recent Activity</h3>
    <div className="space-y-6 pl-2 border-l border-portal-border relative">
        {recent_activity && recent_activity.length > 0 ? (
            recent_activity.map((log, i) => (
                <div key={i} className="relative pl-4">
                    <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${i === 0 ? 'bg-portal-primary' : 'bg-gray-300'}`} />
                    <p className="text-sm font-bold text-portal-navy capitalize">{log.action.replace('_', ' ')}</p>
                    <p className="text-xs text-portal-textmuted mt-0.5">
                        {new Date(log.performed_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                    <p className="text-[10px] text-portal-textmuted mt-0.5">by {log.performed_by}</p>
                </div>
            ))
        ) : (
            <p className="text-sm text-portal-textmuted italic pl-4">No activity recorded yet.</p>
        )}
    </div>
</div>
                </div>
            </div>
        </div>
    );
}
