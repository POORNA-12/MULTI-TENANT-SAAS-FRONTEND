import React from 'react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDangerous = false,
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden duration-200">
                <div className="p-6 text-center">
                    <div className={`mx-auto flex items-center justify-center size-12 rounded-full mb-4 ${isDangerous ? 'bg-red-100' : 'bg-blue-100'}`}>
                        <span className={`material-symbols-outlined text-2xl ${isDangerous ? 'text-red-600' : 'text-blue-600'}`}>
                            {isDangerous ? 'warning' : 'help'}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#0e141b] mb-2">{title}</h3>
                    <p className="text-sm text-[#4e7397] mb-6">{message}</p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="h-10 px-4 bg-white border border-[#d0dbe7] rounded text-sm font-bold text-[#0e141b] hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`h-10 px-4 rounded text-sm font-bold text-white transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 ${isDangerous
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                                }`}
                        >
                            {isLoading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
