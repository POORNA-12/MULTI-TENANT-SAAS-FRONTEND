import React, { useState, useEffect } from 'react';
import billingService from '../services/billingService';
import { useBilling } from '../context/BillingContext';
import DashboardLayout from '../layouts/DashboardLayout';

const PricingPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(null);
    const { billingUsage } = useBilling();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await billingService.getPlans();
                setPlans(data);
            } catch (error) {
                console.error("Failed to load plans", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleUpgrade = async (stripePriceId) => {
        if (!stripePriceId) return;
        setCheckoutLoading(stripePriceId);
        try {
            const data = await billingService.createCheckoutSession(stripePriceId);
            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            }
        } catch (error) {
            console.error("Failed to start checkout", error);
            alert(error.response?.data?.detail || "Checkout failed. Please try again.");
            setCheckoutLoading(null);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500 text-xl animate-pulse">Loading plans...</div>
            </div>
        </DashboardLayout>
    );

    const currentPlanId = billingUsage?.subscription_plan; // Assuming the API returns the plan name or ID similarly

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 font-sans">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-2 block">
                            Pricing
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                            Upgrade Your Plan
                        </h2>
                        <p className="max-w-2xl mx-auto text-xl text-slate-500 leading-relaxed">
                            Choose the right capability for your team's needs.
                        </p>
                    </div>

                    <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:max-w-5xl lg:mx-auto">
                        {plans.map((plan) => {
                            const isCurrentPlan = currentPlanId === plan?.name;
                            const isPopular = plan?.name?.toLowerCase() === 'pro';

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative flex flex-col p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 bg-white border ${isCurrentPlan
                                        ? 'border-green-500 ring-2 ring-green-500/20'
                                        : isPopular
                                            ? 'border-orange-500 ring-1 ring-orange-500'
                                            : 'border-slate-200'
                                        }`}
                                >
                                    {isCurrentPlan && (
                                        <div className="absolute top-0 right-6 transform -translate-y-1/2">
                                            <span className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide flex items-center space-x-1 border border-green-600 shadow-sm">
                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                                <span>Current Plan</span>
                                            </span>
                                        </div>
                                    )}
                                    {!isCurrentPlan && isPopular && (
                                        <div className="absolute top-0 right-6 transform -translate-y-1/2">
                                            <span className="bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-sm">
                                                Most Popular
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                                        <p className="mt-2 text-slate-500">{plan.description || "Everything you need."}</p>
                                    </div>
                                    <div className="mb-6 flex items-baseline text-slate-900">
                                        <span className="text-5xl font-extrabold tracking-tight">₹{plan.price_monthly}</span>
                                        <span className="ml-1 text-xl font-medium text-slate-500">/mo</span>
                                    </div>

                                    <button
                                        onClick={() => handleUpgrade(plan.stripe_price_id)}
                                        disabled={isCurrentPlan || checkoutLoading === plan.stripe_price_id || (!plan.stripe_price_id && !isCurrentPlan)}
                                        className={`mt-auto block w-full py-3 px-6 border border-transparent rounded-lg text-center text-sm font-bold transition-all duration-200 ${isCurrentPlan
                                            ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200'
                                            : checkoutLoading === plan.stripe_price_id
                                                ? 'bg-blue-600/50 text-white cursor-wait'
                                                : plan.stripe_price_id
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20'
                                                    : 'bg-slate-800 text-white hover:bg-slate-900 shadow-sm'
                                            }`}
                                    >
                                        {checkoutLoading === plan.stripe_price_id
                                            ? 'Processing...'
                                            : isCurrentPlan
                                                ? 'Active Plan'
                                                : plan.stripe_price_id
                                                    ? 'Upgrade to ' + plan.name
                                                    : 'Contact Sales'}
                                    </button>

                                    <div className="mt-8 pt-8 border-t border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-4">What's included</h4>
                                        <ul role="list" className="space-y-4">
                                            <li className="flex items-start text-sm text-slate-600">
                                                <span className="text-blue-500 font-bold mr-3">✓</span> <span>{plan.max_organizations} Organizations</span>
                                            </li>
                                            <li className="flex items-start text-sm text-slate-600">
                                                <span className="text-blue-500 font-bold mr-3">✓</span> <span>{plan.max_users_per_organization} Users per Org</span>
                                            </li>
                                            <li className="flex items-start text-sm text-slate-600">
                                                <span className="text-blue-500 font-bold mr-3">✓</span> <span>{plan.max_workflow_definitions} Workflows</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PricingPlans;
