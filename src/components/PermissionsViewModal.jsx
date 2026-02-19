import React from 'react';

// Helper to format permission codes into readable labels
const formatPermissionLabel = (code) => {
    const parts = code.split('.');
    if (parts.length > 1) {
        // e.g., "workflow.create_request" -> "Create Request"
        return parts[1]
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    return code;
};

const PermissionsViewModal = ({ isOpen, onClose, title, permissions = [], isLoading = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {title || "Permissions"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {permissions.length} permissions assigned
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-0 max-h-[60vh]">
                    {isLoading ? (
                        <div className="p-8 text-center flex flex-col items-center text-gray-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                            <p className="text-sm">Loading permissions...</p>
                        </div>
                    ) : permissions.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center text-gray-400">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-20">lock_open</span>
                            <p className="text-sm">No permissions assigned.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {permissions.map((perm, index) => (
                                <div key={index} className="px-6 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3">
                                    <span className="material-symbols-outlined text-blue-500 text-sm">check_circle</span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            {formatPermissionLabel(perm)}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-mono">
                                            {perm}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PermissionsViewModal;
