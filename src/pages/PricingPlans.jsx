import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import billingService from '../services/billingService';
import authService from '../services/authService';
import { useBilling } from '../context/BillingContext';
import DashboardLayout from '../layouts/DashboardLayout';

const PricingPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(null);
    const { billingUsage } = useBilling();
    const navigate = useNavigate();
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [confirmModal, setConfirmModal] = useState({ show: false, plan: null });

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
    };

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

    const handleUpgrade = async (plan) => {
        if (!plan?.id) return;

        // Find current plan to compare tiers
        const currentPlan = plans.find(p => p.name === billingUsage?.subscription_plan);
        const isFreePlan = parseFloat(plan.price_monthly) === 0;
        const isDowngrade = currentPlan && parseFloat(plan.price_monthly) < parseFloat(currentPlan.price_monthly);

        // ONLY show the blocking modal if downgrading to the FREE tier
        if (isFreePlan && isDowngrade && !confirmModal.show) {
            setConfirmModal({ show: true, plan });
            return;
        }

        // Close modal if it was open
        setConfirmModal({ show: false, plan: null });

        if (isFreePlan) {
            // Special handling for Free tier (don't use Razorpay)
            showToast("Transitioning to Free Tier...");
            try {
                setCheckoutLoading(plan.id);
                // Assuming backend handles free transition via the same verification endpoint or a specific one
                // For now, we'll try to use the verify endpoint with dummy data or just show a message
                // In a real app, you'd have billingService.downgradeToFree(plan.id)
                await billingService.verifyRazorpayPayment({
                    plan_id: plan.id,
                    is_free_tier: true
                });
                showToast("Downgrade successful!", "success");
                setTimeout(() => navigate('/billing/success'), 1000);
            } catch (error) {
                showToast(error.response?.data?.detail || "Downgrade failed. Please contact support.", "error");
            } finally {
                setCheckoutLoading(null);
            }
            return;
        }

        if (!window.Razorpay) {
            showToast("Razorpay SDK failed to load. Please check your connection or disable ad-blockers.", "error");
            return;
        }

        const userEmail = authService.getUserEmail() || "";

        setCheckoutLoading(plan.id);
        try {
            const orderData = await billingService.createRazorpayOrder(plan.id);
            console.log("🟢 Razorpay Order Data received from Backend:", orderData);

            // Fallback to orderData.id if the backend sends the raw Razorpay native format
            const safeOrderId = orderData.order_id || orderData.id;

            if (!safeOrderId) {
                showToast("Backend did not return a valid order ID. Check console.", "error");
                setCheckoutLoading(null);
                return;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_XXXX",
                amount: orderData.amount,
                currency: orderData.currency || "INR",
                name: "TenantX",
                description: `Upgrade to ${plan.name} Plan`,
                order_id: safeOrderId,
                handler: async function (response) {
                    try {
                        // 1. Show 'Verifying' state in the UI
                        setCheckoutLoading("verifying"); 
                        
                        await billingService.verifyRazorpayPayment({
                            plan_id: plan.id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        // 2. Clear loading and Navigate to the Success Page
                        showToast("Payment Verified! Synchronizing your account...", "success");
                        setTimeout(() => {
                            navigate('/billing/success'); 
                        }, 1000);
                    } catch (error) {
                        console.error("Verification failed", error);
                        showToast("Payment verification failed. Please contact support.", "error");
                    } finally {
                        setCheckoutLoading(null);
                    }
                },
                prefill: {
                    name: "",
                    email: userEmail,
                },
                theme: {
                    color: "#f97316"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                showToast("Payment Failed: " + response.error.description, "error");
            });
            rzp.open();

        } catch (error) {
            console.error("Failed to start checkout", error);
            showToast(error.response?.data?.detail || "Checkout failed. Please try again.", "error");
        } finally {
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

    const currentPlanId = billingUsage?.subscription_plan;

    return (
        <DashboardLayout>
            {/* Custom Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl border z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 ${toast.type === "success" ? "bg-white border-green-200" : "bg-white border-red-200"}`}>
                    <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                        <span className="material-symbols-outlined text-[20px]">
                            {toast.type === "success" ? "check_circle" : "error"}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">{toast.type === "success" ? "Success" : "Error"}</p>
                        <p className="text-xs text-slate-500">{toast.message}</p>
                    </div>
                    <button onClick={() => setToast({ show: false, message: "", type: "success" })} className="ml-4 text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
            )}

            {/* Downgrade Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setConfirmModal({ show: false, plan: null })}></div>
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="size-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-4xl">info</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Smart Tier Protection</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8">
                                You're currently on the <span className="font-bold text-orange-600">{billingUsage?.subscription_plan}</span> plan. 
                                To maintain your current performance and resource limits, downgrading is restricted. 
                                Keep your current plan for the best experience.
                            </p>
                            <div className="flex justify-center">
                                <button 
                                    onClick={() => setConfirmModal({ show: false, plan: null })}
                                    className="px-10 py-3 bg-orange-600 text-white rounded-2xl font-bold text-sm hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20 active:scale-95">
                                    Keep My Plan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
                            const isEnterprise = plan?.name?.toLowerCase() === 'enterprise';

                            const tagLabel = isPopular ? "MOST POPULAR" : isEnterprise ? "ENTERPRISE" : null;

                            const hasFeature = (key) => {
                                if (plan?.features && key in plan.features) {
                                    return Boolean(plan.features[key]);
                                }
                                if (isPopular) return key !== "custom_branding";
                                if (isEnterprise) return true;
                                return false;
                            };

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
                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                                </svg>
                                                <span>Current Plan</span>
                                            </span>
                                        </div>
                                    )}

                                    {!isCurrentPlan && tagLabel && (
                                        <div className="absolute top-0 right-6 transform -translate-y-1/2">
                                            <span className={`text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-sm ${isPopular ? 'bg-orange-500' : 'bg-slate-700'}`}>
                                                {tagLabel}
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
                                        onClick={() => handleUpgrade(plan)}
                                        disabled={isCurrentPlan || checkoutLoading !== null}
                                        className={`mt-auto block w-full py-3 px-6 rounded-lg text-center text-sm font-bold transition-all duration-200 ${isCurrentPlan
                                            ? 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200'
                                            : isPopular
                                                ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-md shadow-orange-500/30'
                                                : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:text-slate-900'
                                            } ${checkoutLoading !== null ? "opacity-50" : ""}`}
                                    >
                                        {checkoutLoading === "verifying" 
                                            ? 'Verifying...' 
                                            : checkoutLoading === plan.id 
                                                ? 'Processing...'
                                                : isCurrentPlan
                                                    ? 'Active Plan'
                                                    : 'Upgrade to ' + plan.name}
                                    </button>

                                    <div className="mt-8 pt-8 border-t border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-4">What's included</h4>
                                        <ul role="list" className="space-y-4">
                                            <li className="flex items-start text-sm text-slate-600">
                                                <span className="text-orange-600 font-bold mr-3">✓</span> <span>{plan.max_organizations} Organizations</span>
                                            </li>
                                            <li className="flex items-start text-sm text-slate-600">
                                                <span className="text-orange-600 font-bold mr-3">✓</span> <span>{plan.max_users_per_organization} Users per Org</span>
                                            </li>
                                            <li className="flex items-start text-sm text-slate-600">
                                                <span className="text-orange-600 font-bold mr-3">✓</span> <span>{plan.max_workflow_definitions} Workflows</span>
                                            </li>

                                            <li className={`flex items-start text-sm ${hasFeature("sso") ? "text-slate-600" : "text-slate-400"}`}>
                                                <span className={`font-bold mr-3 ${hasFeature("sso") ? "text-orange-600" : "text-slate-300"}`}>
                                                    {hasFeature("sso") ? "✓" : "×"}
                                                </span>
                                                <span>SSO</span>
                                            </li>
                                            <li className={`flex items-start text-sm ${hasFeature("api_access") ? "text-slate-600" : "text-slate-400"}`}>
                                                <span className={`font-bold mr-3 ${hasFeature("api_access") ? "text-orange-600" : "text-slate-300"}`}>
                                                    {hasFeature("api_access") ? "✓" : "×"}
                                                </span>
                                                <span>API Access</span>
                                            </li>
                                            <li className={`flex items-start text-sm ${hasFeature("custom_branding") ? "text-slate-600" : "text-slate-400"}`}>
                                                <span className={`font-bold mr-3 ${hasFeature("custom_branding") ? "text-orange-600" : "text-slate-300"}`}>
                                                    {hasFeature("custom_branding") ? "✓" : "×"}
                                                </span>
                                                <span>Custom Branding</span>
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

