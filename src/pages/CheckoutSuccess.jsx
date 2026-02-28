import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBilling } from '../context/BillingContext';
import DashboardLayout from '../layouts/DashboardLayout';

const CheckoutSuccess = () => {
    const navigate = useNavigate();
    const { fetchBillingUsage } = useBilling();

    useEffect(() => {
        // Refresh billing info to reflect new limits immediately
        fetchBillingUsage();
    }, [fetchBillingUsage]);

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment Successful!</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Your subscription has been updated. You now have access to your new limits.
                    </p>

                    <div className="mt-8">
                        <button
                            onClick={() => navigate('/dashboard/billing')}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Go to Billing Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CheckoutSuccess;
