import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Clock,
    CheckCircle2,
    XCircle,
    Archive,
    History,
    Loader2,
    Check,
    X,
    ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyApprovals, approveWorkflowRequest, rejectWorkflowRequest } from '../services/workflowService';
import WorkflowActionModal from '../components/Workflows/WorkflowActionModal';

export default function MyApprovals() {
    const { tenantSlug } = useAuth();
    const [loading, setLoading] = useState(true);
    const [approvals, setApprovals] = useState([]);
    const [filterStatus, setFilterStatus] = useState('pending'); // pending, approved, rejected

    // Modal State
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, requestId: null });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async (status) => {
        if (!tenantSlug) return;
        try {
            setLoading(true);
            const data = await getMyApprovals(tenantSlug, status);
            setApprovals(data.results || []);
        } catch (err) {
            console.error("Failed to fetch my approvals:", err);
            setApprovals([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(filterStatus);
    }, [tenantSlug, filterStatus]);

    const handleActionClick = (type, requestId) => {
        setModalConfig({ isOpen: true, type, requestId });
    };

    const handleConfirmAction = async (requestId, reason) => {
        if (!tenantSlug || !requestId) return;

        try {
            setActionLoading(true);
            if (modalConfig.type === 'approve') {
                await approveWorkflowRequest(tenantSlug, requestId);
            } else {
                await rejectWorkflowRequest(tenantSlug, requestId, reason);
            }

            setModalConfig({ isOpen: false, type: null, requestId: null });
            await fetchData(filterStatus);

        } catch (error) {
            console.error(`Failed to ${modalConfig.type} request:`, error);
            alert(`Failed to ${modalConfig.type} request. Please try again.`);
        } finally {
            setActionLoading(false);
        }
    };

    const tabs = [
        { id: 'pending', label: 'Pending', icon: Clock },
        { id: 'approved', label: 'Approved', icon: CheckCircle2 },
        { id: 'rejected', label: 'Rejected', icon: XCircle },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">Approved</span>;
            case 'rejected': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">Rejected</span>;
            default: return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">Pending</span>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-navy tracking-tight">My Approvals</h1>
                    <p className="text-textsecondary text-sm mt-1">
                        Review and act on workflow requests assigned to you.
                    </p>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex flex-wrap gap-2 border-b border-border pb-1">
                {tabs.map((tab) => {
                    const isActive = filterStatus === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setFilterStatus(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${isActive
                                ? 'border-primary text-primary bg-primary/5'
                                : 'border-transparent text-textsecondary hover:text-navy hover:bg-gray-50'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Main Content ── */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">

                {/* Table Header */}
                <div className={`grid gap-4 px-6 py-4 bg-bg/50 border-b border-border text-[11px] font-bold uppercase tracking-wider text-textmuted hidden lg:grid ${filterStatus === 'pending' ? 'grid-cols-[80px_1fr_120px_140px]' : 'grid-cols-[80px_1fr_150px_140px]'}`}>
                    <span>ID</span>
                    <span>Title</span>
                    <span>{filterStatus === 'pending' ? 'Step Order' : 'Acted By'}</span>
                    <span className="text-right">{filterStatus === 'pending' ? 'Actions' : 'Action At'}</span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                        <p className="text-sm font-medium text-textsecondary">Loading approvals table...</p>
                    </div>
                ) : approvals.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <History className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-navy mb-1">No {filterStatus} approvals found</h3>
                        <p className="text-textsecondary text-sm">
                            {filterStatus === 'pending'
                                ? "You're all caught up! No pending tasks."
                                : `No requests found with status "${filterStatus}".`}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {approvals.map((appr) => (
                            <div
                                key={appr.request_id}
                                className={`p-5 lg:px-6 lg:py-4 hover:bg-bg/30 transition-colors grid grid-cols-1 gap-4 lg:items-center group ${filterStatus === 'pending' ? 'lg:grid-cols-[80px_1fr_120px_140px]' : 'lg:grid-cols-[80px_1fr_150px_140px]'}`}
                            >
                                {/* Mobile Header */}
                                <div className="flex items-center justify-between lg:hidden mb-2">
                                    <span className="text-sm font-bold text-primary">#{appr.request_id}</span>
                                    {appr.action_at && (
                                        <span className="text-xs text-textsecondary">
                                            {new Date(appr.action_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                {/* Desktop: ID */}
                                <span className="text-sm font-bold text-primary hidden lg:block">#{appr.request_id}</span>

                                {/* Title */}
                                <div>
                                    <Link
                                        to={`/portal/dashboard/workflows/${appr.request_id}`}
                                        className="font-bold text-navy text-sm sm:text-base hover:text-primary transition-colors block"
                                    >
                                        {appr.title}
                                    </Link>
                                    <div className="lg:hidden mt-2 space-y-1 text-xs text-textsecondary">
                                        {filterStatus === 'pending' ? (
                                            <p>Step: {appr.step_order}</p>
                                        ) : (
                                            <p>By: {appr.approved_by || 'Unknown'}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            {getStatusBadge(appr.status)}
                                        </div>
                                    </div>
                                </div>

                                {/* Step Order / Approved By */}
                                <div className="hidden lg:block text-sm text-textprimary">
                                    {filterStatus === 'pending' ? (
                                        <span className="px-2 py-1 rounded bg-gray-100 text-xs font-bold">Step {appr.step_order}</span>
                                    ) : (
                                        <span className="truncate max-w-[140px]" title={appr.approved_by}>
                                            {appr.approved_by || '-'}
                                        </span>
                                    )}
                                </div>

                                {/* Actions / Action At */}
                                <div className="flex items-center gap-2 lg:justify-end mt-4 lg:mt-0 pt-4 lg:pt-0 border-t border-border lg:border-0">
                                    {filterStatus === 'pending' ? (
                                        <>
                                            <button
                                                onClick={() => handleActionClick('approve', appr.request_id)}
                                                className="flex-1 lg:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-emerald-200"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleActionClick('reject', appr.request_id)}
                                                className="flex-1 lg:flex-none px-3 py-1.5 bg-white border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 text-xs font-bold rounded-lg transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-sm text-textsecondary text-right">
                                            {appr.action_at ? new Date(appr.action_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <WorkflowActionModal
                isOpen={modalConfig.isOpen}
                type={modalConfig.type}
                requestId={modalConfig.requestId}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={handleConfirmAction}
                isLoading={actionLoading}
            />
        </div>
    );
}
