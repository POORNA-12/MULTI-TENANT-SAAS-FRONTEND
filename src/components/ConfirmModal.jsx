import React, { useEffect } from 'react';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger", // danger, warning, info
    isLoading = false
}) => {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getColors = () => {
        switch (type) {
            case 'danger': return {
                iconBg: 'bg-red-100',
                iconColor: 'text-red-600',
                buttonBg: 'bg-red-600 hover:bg-red-700',
                icon: 'warning'
            };
            case 'warning': return {
                iconBg: 'bg-orange-100',
                iconColor: 'text-orange-600',
                buttonBg: 'bg-orange-600 hover:bg-orange-700',
                icon: 'priority_high'
            };
            default: return {
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600',
                buttonBg: 'bg-blue-600 hover:bg-blue-700',
                icon: 'info'
            };
        }
    };

    const colors = getColors();

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 min-h-screen">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={!isLoading ? onClose : undefined}
            ></div>

            {/* Modal */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100 relative z-10 border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex gap-4">
                        <div className={`size-12 rounded-full flex-shrink-0 flex items-center justify-center ${colors.iconBg}`}>
                            <span className={`material-symbols-outlined text-2xl ${colors.iconColor}`}>
                                {colors.icon}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#0e141b]">{title}</h3>
                            <p className="text-sm text-[#4e7397] mt-2 leading-relaxed">{message}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-bold text-[#4e7397] hover:text-[#0e141b] hover:bg-slate-200 rounded transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-sm font-bold text-white rounded shadow-sm transition-all focus:ring-2 focus:ring-offset-1 flex items-center gap-2 ${colors.buttonBg} disabled:opacity-70`}
                    >
                        {isLoading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
