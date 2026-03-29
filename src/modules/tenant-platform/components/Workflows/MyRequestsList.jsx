import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { getMyWorkflows } from '../../services/workflowService';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function MyRequestsList() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { tenantSlug } = useAuth();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setLoading(true);
                const data = await getMyWorkflows(tenantSlug);
                setRequests(data.workflows || []);
            } catch (err) {
                console.error("Failed to fetch my workflows:", err);
                setError("Failed to load your requests.");
            } finally {
                setLoading(false);
            }
        };

        if (tenantSlug) {
            fetchRequests();
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

    if (requests.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No active requests</h3>
                <p className="text-gray-500">You haven't submitted any workflow requests yet.</p>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'text-green-600 bg-green-50 border-green-200';
            case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
            case 'submitted': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-amber-600 bg-amber-50 border-amber-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return CheckCircle2;
            case 'rejected': return XCircle;
            default: return Clock;
        }
    };

    return (
        <div className="overflow-hidden bg-white border border-border rounded-xl shadow-sm">
            <ul className="divide-y divide-gray-100">
                {requests.map((req) => {
                    const StatusIcon = getStatusIcon(req.status);
                    const statusClass = getStatusColor(req.status);

                    return (
                        <li key={req.request_id} className="hover:bg-gray-50 transition-colors">
                            <Link
                                to={`/portal/dashboard/workflows/${req.request_id}`}
                                className="flex items-center gap-4 p-4 sm:px-6"
                            >
                                <div className={`p-2 rounded-full ${statusClass.split(' ')[1]} ${statusClass.split(' ')[0]}`}>
                                    <StatusIcon className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {req.title}
                                        </p>
                                        <span className="text-xs text-gray-500 hidden sm:inline-block">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusClass}`}>
                                            {req.status}
                                        </span>
                                        <span className="text-xs text-gray-400">ID: #{req.request_id}</span>
                                    </div>
                                </div>

                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
