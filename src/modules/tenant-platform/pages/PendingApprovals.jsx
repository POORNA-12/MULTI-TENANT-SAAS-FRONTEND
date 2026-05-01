import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Filter,
    ShieldAlert,
    Loader2,
    Archive,
    Check,
    History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApprovalsDashboard, getMyWorkflows, approveWorkflowRequest, rejectWorkflowRequest } from '../services/workflowService';
import WorkflowActionModal from '../components/Workflows/WorkflowActionModal';

export default function PendingApprovals() {
    const { tenantSlug, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [allRequests, setAllRequests] = useState([]);
    const [filterStatus, setFilterStatus] = useState('pending'); // pending, approved, rejected, all

    // Modal State
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, requestId: null });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        if (!tenantSlug) return;
        try {
            setLoading(true);
            let mergedRequests = [];

            if (user?.role === 'member') {
                // Members: Fetch "My Requests"
                const data = await getMyWorkflows(tenantSlug);
                mergedRequests = Array.isArray(data) ? data : (data.results ?? data.workflows ?? []);
            } else {
                // Approvers: Fetch "Pending Approvals" (Backend filtered)
                const data = await getApprovalsDashboard(tenantSlug);
                const pending = data.pending || [];
                const approved = data.approved || [];
                const rejected = data.rejected || [];
                mergedRequests = [...pending, ...approved, ...rejected];
            }

            setAllRequests(mergedRequests);
        } catch (err) {
            console.error("Failed to fetch approvals:", err);
            setAllRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tenantSlug]);

    const filteredRequests = allRequests.filter(req => {
        if (user?.role === 'member') {
            if (req.submitted_by !== user?.email) return false;
        }
        if (filterStatus === 'all') return true;
        return req.status === filterStatus;
    });

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
            await fetchData(); 

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
        { id: 'all', label: 'All History', icon: Archive },
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
                    <h1 className="text-2xl font-black text-portal-navy tracking-tight">Approvals</h1>
<p className="text-portal-textsecondary text-sm mt-1">
    Manage requests awaiting your action and view past decisions.
</p>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex flex-wrap gap-2 border-b border-portal-border pb-1">
    {tabs.map((tab) => {
        const isActive = filterStatus === tab.id;
        const Icon = tab.icon;
        const count = tab.id === 'all'
            ? allRequests.length
            : allRequests.filter(r => r.status === tab.id).length;

        return (
            <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${isActive
                    ? 'border-portal-primary text-portal-primary bg-portal-primary/5'
                    : 'border-transparent text-portal-textsecondary hover:text-portal-navy hover:bg-gray-50'
                    }`}
            >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`text-xs ml-1 py-0.5 px-1.5 rounded-full ${isActive ? 'bg-portal-primary/20 text-portal-primary' : 'bg-gray-100 text-gray-500'}`}>
                    {count}
                </span>
            </button>
        );
    })}
</div>

            {/* ── Main Content ── */}
            <div className="bg-white rounded-2xl border border-portal-border overflow-hidden shadow-sm">

    {/* Table Header */}
    <div className={`grid gap-4 px-6 py-4 bg-portal-bg/50 border-b border-portal-border text-[11px] font-bold uppercase tracking-wider text-portal-textmuted hidden lg:grid grid-cols-[80px_1fr_180px_140px_120px_140px]`}>
        <span>ID</span>
        <span>Title</span>
        <span>Submitted By</span>
        <span>Submitted At</span>
        <span>{filterStatus === 'pending' ? 'Current Role' : 'Status'}</span>
        <span className="text-right">{filterStatus === 'pending' ? 'Actions' : 'Decision Time'}</span>
    </div>

    {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-portal-primary mb-3" />
            <p className="text-sm font-medium text-portal-textsecondary">Loading approvals table...</p>
        </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <History className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-portal-navy mb-1">No {filterStatus === 'all' ? '' : filterStatus} requests found</h3>
<p className="text-portal-textsecondary text-sm">
    {filterStatus === 'pending'
        ? "You're all caught up! No pending tasks."
        : `No requests found with status "${filterStatus}".`}
</p>
                    </div>
                ) : (
                    <div className="divide-y divide-portal-border">
    {filteredRequests.map((req) => (
        <div
            key={req.request_id}
            className={`p-5 lg:px-6 lg:py-4 hover:bg-portal-bg/30 transition-colors grid grid-cols-1 gap-4 lg:items-center group lg:grid-cols-[80px_1fr_180px_140px_120px_140px]`}
        >
            {/* Mobile: Header Row */}
            <div className="flex items-center justify-between lg:hidden mb-2">
                <span className="text-sm font-bold text-portal-primary">#{req.request_id}</span>
                <span className="text-xs text-portal-textsecondary">
                    {new Date(req.submitted_at).toLocaleDateString()}
                </span>
            </div>

            {/* Desktop: ID */}
            <span className="text-sm font-bold text-portal-primary hidden lg:block">#{req.request_id}</span>

            {/* Title & Reason */}
            <div>
                <Link
                    to={`/portal/dashboard/workflows/${req.request_id}`}
                    className="font-bold text-portal-navy text-sm sm:text-base hover:text-portal-primary transition-colors block"
                >
                    {req.title}
                </Link>
                {req.rejection_reason && (
                    <p className="text-xs text-red-600 mt-1 line-clamp-1" title={req.rejection_reason}>
                        Reason: {req.rejection_reason}
                    </p>
                )}
                <div className="lg:hidden mt-2 space-y-1 text-xs text-portal-textsecondary">
                    <p>By: {req.submitted_by || 'Me'}</p>
                    <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(req.status)}
                    </div>
                </div>
            </div>

            {/* Submitted By */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-portal-textprimary">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    {(req.submitted_by ? req.submitted_by.charAt(0) : 'M').toUpperCase()}
                </div>
                <span className="truncate max-w-[140px]" title={req.submitted_by || 'Me'}>
                    {req.submitted_by || 'Me'}
                </span>
            </div>

            {/* Submitted At */}
            <div className="hidden lg:block text-sm text-portal-textsecondary">
                {new Date(req.submitted_at || req.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
            </div>

            {/* Status / Role Badge */}
            <div className="hidden lg:block">
                {filterStatus === 'pending' ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded bg-gray-100 text-portal-navy text-[10px] font-bold uppercase tracking-wider border border-gray-200">
                        {req.role}
                    </span>
                ) : (
                    getStatusBadge(req.status)
                )}
            </div>

            {/* Actions / Timeline */}
            <div className="flex items-center gap-2 lg:justify-end mt-4 lg:mt-0 pt-4 lg:pt-0 border-t border-portal-border lg:border-0">
                                    {req.status === 'pending' ? (
                                        <>
                                            <button
                                                onClick={() => handleActionClick('approve', req.request_id)}
                                                className="flex-1 lg:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-emerald-200"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleActionClick('reject', req.request_id)}
                                                className="flex-1 lg:flex-none px-3 py-1.5 bg-white border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 text-xs font-bold rounded-lg transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-xs text-portal-textsecondary font-medium">
    {req.action_at ? new Date(req.action_at).toLocaleDateString() : '-'}
</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Footer */}
                {filteredRequests.length > 0 && (
                    <div className="px-6 py-4 bg-portal-bg/30 border-t border-portal-border flex items-center justify-between">
    <p className="text-xs text-portal-textsecondary">
        Showing <span className="font-bold text-portal-navy">{filteredRequests.length}</span> requests
    </p>
    <div className="flex gap-2">
        <button disabled className="p-1.5 rounded-lg border border-portal-border bg-white text-gray-300 cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
        </button>
        <button disabled className="p-1.5 rounded-lg border border-portal-border bg-white text-gray-300 cursor-not-allowed">
            <ChevronRight className="w-4 h-4" />
        </button>
    </div>
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
