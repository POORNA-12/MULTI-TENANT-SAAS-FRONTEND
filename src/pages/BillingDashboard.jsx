import React from 'react';
import { useBilling } from '../context/BillingContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

const BillingDashboard = () => {
    const { billingUsage, loading } = useBilling();
    const navigate = useNavigate();

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8">Loading billing info...</div>
            </DashboardLayout>
        );
    }

    if (!billingUsage) {
        return (
            <DashboardLayout>
                <div className="p-8 text-red-500">Failed to load billing information.</div>
            </DashboardLayout>
        );
    }

    const {
        subscription_plan = 'Free',
        subscription_status = 'inactive',
        days_until_expiry = 0,
        limits = {},
        usage = {},
        percentage_used = {}
    } = billingUsage || {};

    const renderProgressBar = (percentage) => {
        const safePercentage = typeof percentage === 'number' ? percentage : 0;
        let color = 'bg-green-500';
        if (safePercentage >= 80) color = 'bg-yellow-500';
        if (safePercentage >= 100) color = 'bg-red-500';

        return (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
                <div
                    className={`${color} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(safePercentage, 100)}%` }}
                ></div>
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="p-8 max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Billing & Usage</h1>

                <div className="bg-white shadow rounded-lg p-6 mb-8 border-l-4 border-indigo-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">Current Plan: {subscription_plan}</h2>
                            <p className="text-sm text-gray-500 mt-1">Status: <span className="font-semibold">{subscription_status}</span></p>
                            {subscription_status !== 'cancelled' && (
                                <p className="text-sm text-gray-500">Expires in {days_until_expiry} days</p>
                            )}
                        </div>
                        <div>
                            <button
                                onClick={() => navigate('/dashboard/billing/plans')}
                                className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition"
                            >
                                Upgrade Plan
                            </button>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold mb-4">Resource Usage</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Organizations */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="font-medium text-gray-900">Organizations</h3>
                        <p className="text-2xl font-bold mt-2">{usage.organizations} / {limits.max_organizations}</p>
                        {renderProgressBar(percentage_used.organizations)}
                    </div>

                    {/* Total Users */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="font-medium text-gray-900">Total Users Used (Max allowed per org: {limits.max_users_per_organization})</h3>
                        <p className="text-2xl font-bold mt-2">{usage.total_users}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
                            <div className="bg-blue-400 h-2.5 rounded-full" style={{ width: `${Math.min(usage.total_users / (limits.max_users_per_organization * Math.max(usage.organizations, 1)) * 100, 100)}%` }}></div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default BillingDashboard;
