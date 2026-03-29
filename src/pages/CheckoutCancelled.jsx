import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

const CheckoutCancelled = () => {
    const navigate = useNavigate();

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment Cancelled</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Your checkout process was cancelled. No charges were made.
                    </p>

                    <div className="mt-8">
                        <button
                            onClick={() => navigate('/dashboard/billing/plans')}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Return to Pricing Plans
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/billing')}
                            className="mt-3 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 bg-"
                        >
                            Back to Billing Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CheckoutCancelled;
