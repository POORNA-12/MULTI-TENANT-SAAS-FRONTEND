import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBilling } from '../context/BillingContext';

// Adjusting icons handling gracefully
const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const UpgradeModal = () => {
    const navigate = useNavigate();
    const { isUpgradeModalOpen, setIsUpgradeModalOpen, upgradeModalMessage } = useBilling();

    if (!isUpgradeModalOpen) return null;

    const handleUpgradeClick = () => {
        setIsUpgradeModalOpen(false);
        navigate('/dashboard/billing');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative">
                <button
                    onClick={() => setIsUpgradeModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label="Close modal"
                >
                    <CloseIcon />
                </button>

                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <AlertIcon />
                    </div>

                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                        Upgrade Required
                    </h3>

                    <p className="text-sm text-gray-500 mb-6">
                        {upgradeModalMessage || "You've reached the limits of your current subscription. Upgrade your plan to unlock more capacity."}
                    </p>

                    <div className="flex flex-col space-y-3">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                            onClick={handleUpgradeClick}
                        >
                            View Upgrade Options
                        </button>
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                            onClick={() => setIsUpgradeModalOpen(false)}
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
