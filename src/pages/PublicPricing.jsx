import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // We use direct axios just in case the api interceptor triggers a forced redirect on public page
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PublicPricing = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axios.get("/billing/plans/");
                if (Array.isArray(response.data)) {
                    setPlans(response.data);
                } else {
                    throw new Error("API did not return an array of plans");
                }
            } catch (error) {
                console.error("Failed to load plans", error);
                setPlans([
                    { id: 1, name: 'Free', price_monthly: 0, description: 'Perfect for getting started - 1 organization, 50 users', max_organizations: 1, max_users_per_organization: 50, max_workflow_definitions: 10, max_roles: 5 },
                    { id: 2, name: 'Pro', price_monthly: 299, description: 'For growing teams - 5 organizations, 500 users per org', max_organizations: 5, max_users_per_organization: 500, max_workflow_definitions: 50, max_roles: 20 },
                    { id: 3, name: 'Enterprise', price_monthly: 599, description: 'For enterprises - unlimited organizations & users', max_organizations: 999, max_users_per_organization: 9999, max_workflow_definitions: 999, max_roles: 100 }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    if (loading) return (
        <>
            <Navbar />
            <section className="py-24 bg-slate-50 flex items-center justify-center min-h-[60vh]">
                <div className="text-slate-500 text-xl animate-pulse">Loading plans...</div>
            </section>
            <Footer />
        </>
    );

    return (
        <>
            <Navbar />
            <section className="py-24 bg-slate-50 border-t border-slate-200 font-sans">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-2 block">
                            Pricing
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                            Simple, transparent pricing
                        </h2>
                        <p className="max-w-2xl mx-auto text-xl text-slate-500 leading-relaxed">
                            No hidden fees. No surprise charges. Choose the perfect plan for your project's scaling needs.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="space-y-8 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:max-w-6xl lg:mx-auto">
                        {plans.map((plan, index) => {
                            const isPopular = plan?.name?.toLowerCase() === 'pro';
                            return (
                                <div
                                    key={plan.id || index}
                                    className={`relative flex flex-col p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 bg-white border ${isPopular ? 'border-orange-500 ring-1 ring-orange-500' : 'border-slate-200'}`}
                                >
                                    {isPopular && (
                                        <div className="absolute top-0 right-6 transform -translate-y-1/2">
                                            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                                Most Popular
                                            </span>
                                        </div>
                                    )}
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                                        <p className="mt-2 text-slate-500">{plan.description}</p>
                                    </div>
                                    <div className="mb-6 flex items-baseline text-slate-900">
                                        <span className="text-5xl font-extrabold tracking-tight">₹{plan.price_monthly}</span>
                                        <span className="ml-1 text-xl font-medium text-slate-500">/mo</span>
                                    </div>

                                    <Link
                                        to="/signup"
                                        className={`mt-auto block w-full py-3 px-6 rounded-lg text-center text-lg font-bold transition-colors ${isPopular
                                            ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md'
                                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm'
                                            }`}
                                    >
                                        Get Started
                                    </Link>

                                    <div className="mt-8 pt-8 border-t border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-4">What's included</h4>
                                        <ul className="space-y-4">
                                            <li className="flex items-start">
                                                <span className="text-orange-500 font-bold mr-3">✓</span>
                                                <span className="text-slate-600">{plan.max_organizations} Organizations</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-orange-500 font-bold mr-3">✓</span>
                                                <span className="text-slate-600">{plan.max_users_per_organization} Users per Org</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-orange-500 font-bold mr-3">✓</span>
                                                <span className="text-slate-600">{plan.max_workflow_definitions} Workflows</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default PublicPricing;
