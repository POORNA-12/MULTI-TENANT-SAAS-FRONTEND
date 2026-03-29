import { useState } from 'react';
import { X, AlertTriangle, CheckCircle, ShieldAlert, Loader2 } from 'lucide-react';

export default function WorkflowActionModal({
    isOpen,
    onClose,
    type, // 'approve' | 'reject'
    requestId,
    onConfirm,
    isLoading
}) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const isApprove = type === 'approve';
    const title = isApprove ? 'Approve Request' : 'Reject Request';
    const description = isApprove
        ? 'Are you sure you want to approve this request? This action will move the workflow to the next stage.'
        : 'Please provide a reason for rejecting this request here. This will be visible to the requester.';

    const handleSubmit = () => {
        if (!isApprove && !reason.trim()) {
            setError('Rejection reason is required');
            return;
        }
        onConfirm(requestId, reason);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`px-6 py-4 border-b flex items-center justify-between ${isApprove ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex items-center gap-3">
                        {isApprove ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                        )}
                        <h3 className={`font-bold ${isApprove ? 'text-emerald-900' : 'text-red-900'}`}>{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-1 rounded-lg transition-colors ${isApprove ? 'text-emerald-700 hover:bg-emerald-100' : 'text-red-700 hover:bg-red-100'}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {description}
                    </p>

                    {!isApprove && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Reason</label>
                            <textarea
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    setError('');
                                }}
                                className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none h-24 ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:border-red-500 focus:ring-red-100'}`}
                                placeholder="e.g., Budget limit exceeded..."
                            />
                            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
                        </div>
                    )}

                    <div className="flex gap-3 justify-end mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className={`px-6 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-all flex items-center gap-2 ${isApprove
                                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                                    : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                                }`}
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isApprove ? 'Confirm Approval' : 'Reject Request'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
