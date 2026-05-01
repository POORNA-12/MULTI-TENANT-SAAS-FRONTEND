import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Clock,
    CheckCircle2,
    XCircle,
    Archive,
    History,
    Loader2,
    Search,
    Filter,
    Calendar,
    ChevronLeft,
    ChevronRight,
    FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyRequests } from '../services/workflowService';

export default function MyRequests() {
    const { tenantSlug } = useAuth();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [filterStatus, setFilterStatus] = useState(null); // null means all
    const [stats, setStats] = useState({ total: 0 });

    const fetchData = async (status) => {
        if (!tenantSlug) return;
        try {
            setLoading(true);
            const data = await getMyRequests(tenantSlug, status);
            setRequests(Array.isArray(data) ? data : (data.results ?? data.workflows ?? []));
            if (!status) {
                setStats({ total: data.count || 0 });
            }
        } catch (err) {
            console.error("Failed to fetch my requests:", err);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(filterStatus);
    }, [tenantSlug, filterStatus]);

    const tabs = [
        { id: null, label: 'All Requests', icon: Archive },
        { id: 'pending', label: 'Pending', icon: Clock },
        { id: 'approved', label: 'Approved', icon: CheckCircle2 },
        { id: 'rejected', label: 'Rejected', icon: XCircle },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">Approved</span>;
            case 'rejected': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">Rejected</span>;
            case 'pending': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">Pending</span>;
            default: return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-portal-navy tracking-tight">My Requests</h1>
<p className="text-portal-textsecondary text-sm mt-1">
    Track and manage all workflow requests you've submitted.
</p>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex flex-wrap gap-2 border-b border-portal-border pb-1">
    {tabs.map((tab) => {
        const isActive = filterStatus === tab.id;
        const Icon = tab.icon;

        return (
            <button
                key={tab.id || 'all'}
                onClick={() => setFilterStatus(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${isActive
                    ? 'border-portal-primary text-portal-primary bg-portal-primary/5'
                    : 'border-transparent text-portal-textsecondary hover:text-portal-navy hover:bg-gray-50'
                    }`}
            >
                <Icon className="w-4 h-4" />
                {tab.label}
            </button>
        );
    })}
</div>

            {/* ── Main Content ── */}
            <div className="bg-white rounded-2xl border border-portal-border overflow-hidden shadow-sm">

    {/* Table Header */}
    <div className="grid grid-cols-[80px_1fr_150px_150px_120px_140px] gap-4 px-6 py-4 bg-portal-bg/50 border-b border-portal-border text-[11px] font-bold uppercase tracking-wider text-portal-textmuted hidden lg:grid">
        <span>ID</span>
        <span>Title</span>
        <span>Workflow Type</span>
        <span>Workflow Name</span>
        <span>Status</span>
        <span className="text-right">Created At</span>
    </div>

    {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-portal-primary mb-3" />
            <p className="text-sm font-medium text-portal-textsecondary">Loading your requests...</p>
        </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-portal-navy mb-1">No requests found</h3>
<p className="text-portal-textsecondary text-sm">
    {filterStatus
        ? `You don't have any requests with status "${filterStatus}".`
        : "You haven't submitted any workflow requests yet."}
</p>
                    </div>
                ) : (
                    <div className="divide-y divide-portal-border">
    {requests.map((req) => (
        <div
            key={req.request_id}
            className="p-5 lg:px-6 lg:py-4 hover:bg-portal-bg/30 transition-colors grid grid-cols-1 lg:grid-cols-[80px_1fr_150px_150px_120px_140px] gap-4 lg:items-center group"
        >
            {/* Mobile: Header Row */}
            <div className="flex items-center justify-between lg:hidden mb-2">
                <span className="text-sm font-bold text-portal-primary">#{req.request_id}</span>
                <span className="text-xs text-portal-textsecondary">
                    {new Date(req.created_at).toLocaleDateString()}
                </span>
            </div>

            {/* Desktop: ID */}
            <span className="text-sm font-bold text-portal-primary hidden lg:block">#{req.request_id}</span>

            {/* Title */}
            <div>
                <Link
                    to={`/portal/dashboard/workflows/${req.request_id}`}
                    className="font-bold text-portal-navy text-sm sm:text-base hover:text-portal-primary transition-colors block"
                >
                    {req.title}
                </Link>
                <div className="lg:hidden mt-2 space-y-1 text-xs text-portal-textsecondary">
                    <p>{req.workflow_type} • {req.workflow_name}</p>
                    <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(req.status)}
                    </div>
                </div>
            </div>

            {/* Workflow Type */}
            <div className="hidden lg:block text-sm text-portal-textprimary">
                {req.workflow_type || '-'}
            </div>

            {/* Workflow Name */}
            <div className="hidden lg:block text-sm text-portal-textprimary font-medium">
                {req.workflow_name || '-'}
            </div>

            {/* Status Badge */}
            <div className="hidden lg:block">
                {getStatusBadge(req.status)}
            </div>

            {/* Created At */}
            <div className="hidden lg:block text-sm text-portal-textsecondary text-right">
                {new Date(req.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
            </div>
        </div>
    ))}
</div>
                )}

                {/* Pagination Footer */}
                {requests.length > 0 && (
                    <div className="px-6 py-4 bg-portal-bg/30 border-t border-portal-border flex items-center justify-between">
    <p className="text-xs text-portal-textsecondary">
        Showing <span className="font-bold text-portal-navy">{requests.length}</span> requests
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
        </div>
    );
}
