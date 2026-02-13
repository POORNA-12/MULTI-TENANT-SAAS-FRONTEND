import React, { useEffect } from 'react';

const AlertModal = ({
    isOpen,
    onClose,
    title,
    message,
    type = "success", // success, error, info
    autoClose = true,
    duration = 3000
}) => {
    useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, duration, onClose]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'info': return 'info';
            default: return 'info';
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success': return { bg: 'bg-green-100', text: 'text-green-600', button: 'bg-green-600 hover:bg-green-700' };
            case 'error': return { bg: 'bg-red-100', text: 'text-red-600', button: 'bg-red-600 hover:bg-red-700' };
            default: return { bg: 'bg-blue-100', text: 'text-blue-600', button: 'bg-blue-600 hover:bg-blue-700' };
        }
    };

    const colors = getColors();

    return (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-start sm:justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden pointer-events-auto border border-[#d0dbe7] flex p-4 gap-3 mb-4 sm:mb-0 sm:mt-20">
                <div className={`size-10 rounded-full flex-shrink-0 flex items-center justify-center ${colors.bg}`}>
                    <span className={`material-symbols-outlined ${colors.text}`}>
                        {getIcon()}
                    </span>
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-[#0e141b]">{title}</h3>
                    <p className="text-xs text-[#4e7397] mt-1">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-[#4e7397] hover:text-[#0e141b] self-start"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>
        </div>
    );
};

export default AlertModal;
