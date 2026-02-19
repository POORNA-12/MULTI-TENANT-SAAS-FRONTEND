import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

export default function Solutions() {
    return (
        <>
            <Navbar />

            {/* ------------------- HERO SECTION ------------------- */}
            <section className="bg-slate-50 pt-24 pb-20 border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <div className="inline-block px-3 py-1 mb-6 rounded-full bg-blue-50 border border-blue-100">
                        <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
                            Enterprise Solutions
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
                        Solutions Tailored for <br />
                        <span className="text-blue-500">Every Enterprise Need</span>
                    </h1>

                    <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                        TenantX provides the flexible infrastructure needed to handle
                        complex multi-tenant requirements across industries, roles, and
                        technical scales.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-colors">
                            Talk to an Architect
                        </button>
                        <button className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-8 rounded-lg border border-slate-300 shadow-sm transition-colors">
                            View Use Cases
                        </button>
                    </div>
                </div>
            </section>

            {/* ------------------- USE CASES GRID ------------------- */}
            <section className="bg-white py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-2 block">
                            By Use Case
                        </span>
                        <h2 className="text-3xl font-black text-slate-900">
                            Purpose-built for your specific challenges
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <UseCaseCard
                            icon="🚀"
                            iconBg="bg-blue-600"
                            title="SaaS Onboarding"
                            desc="Automate the entire tenant lifecycle. From initial sign-up to resource provisioning and database sharding, eliminate manual bottlenecks in your growth."
                            linkText="Learn about provisioning"
                        />
                        <UseCaseCard
                            icon="🏛️"
                            iconBg="bg-green-600"
                            title="Financial Services"
                            desc="Strict data isolation and SOC2/ISO 27001 readiness. Deploy dedicated infrastructure for premium tiers while maintaining a unified control plane."
                            linkText="View compliance features"
                        />
                        <UseCaseCard
                            icon="💼"
                            iconBg="bg-red-500"
                            title="Healthcare"
                            desc="Secure, HIPAA-compliant data workflows. TenantX ensures PHI remains logically and physically separated with granular audit logs for every access request."
                            linkText="Explore health-tech data"
                        />
                        <UseCaseCard
                            icon="☁️"
                            iconBg="bg-orange-500"
                            title="Managed Service Providers"
                            desc="Multi-tenant management at scale. Manage thousands of clients from a single pane of glass, with delegated administration for client-level IT teams."
                            linkText="Scale your MSP fleet"
                        />
                    </div>
                </div>
            </section>

            {/* ------------------- BY ROLE (DARK MODE) ------------------- */}
            <section className="bg-slate-900 text-white py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold text-orange-500 tracking-wider uppercase mb-2 block">
                            By Role
                        </span>
                        <h2 className="text-3xl font-black">
                            Designed for your team's success
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        <RoleColumn
                            icon="👨‍💻"
                            title="CTOs"
                            desc="Focus on Security & Scalability. Deliver an architecture that supports millions of users without sacrificing security. Offload the complexity of tenant-aware identity and data sharding."
                            checks={["Global scale with zero downtime", "Hardened security isolation"]}
                        />
                        <RoleColumn
                            icon="⚡"
                            title="Product Managers"
                            desc="Minimize Speed to Market. Launch new features faster by utilizing our pre-built tenant management components. Turn complex enterprise requirements into standard platform features."
                            checks={["Faster feature deployment", "Built-in enterprise SSO/RBAC"]}
                        />
                        <RoleColumn
                            icon="📝"
                            title="Compliance Officers"
                            desc="Ensure Auditability. Maintain a comprehensive record of every action across your entire tenant ecosystem. Generate compliance reports for auditors with the click of a button."
                            checks={["Immutable audit logs", "Simplified compliance reporting"]}
                        />
                    </div>
                </div>
            </section>

            {/* ------------------- CTA SECTION ------------------- */}
            <section className="bg-white py-24">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="bg-blue-500 rounded-3xl p-10 md:p-16 text-white shadow-xl relative overflow-hidden">
                        {/* Background decorative circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full translate-y-1/3 -translate-x-1/3"></div>

                        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                            <div>
                                <h2 className="text-4xl font-black mb-6">
                                    Speak to an <br />Expert Today
                                </h2>
                                <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                                    Let our enterprise solutions team help you design the perfect
                                    multi-tenant strategy for your scale.
                                </p>
                                <div className="flex items-center gap-3 text-blue-100 font-semibold">
                                    <span>📞</span>
                                    <span>+1 (888) TENANT-X</span>
                                </div>
                            </div>

                            <div className="bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-sm">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-blue-100">Work Email</label>
                                        <input
                                            type="email"
                                            placeholder="name@company.com"
                                            className="w-full px-4 py-3 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-blue-100">Company Size</label>
                                        <select className="w-full px-4 py-3 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none cursor-pointer">
                                            <option>10-50 employees</option>
                                            <option>50-200 employees</option>
                                            <option>200-1000 employees</option>
                                            <option>1000+ employees</option>
                                        </select>
                                    </div>
                                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg shadow-md transition-colors mt-2">
                                        Request Consultation
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}

/* -------------------------------------------------------------------------- */
/*                                SUBCOMPONENTS                               */
/* -------------------------------------------------------------------------- */

function UseCaseCard({ icon, iconBg, title, desc, linkText }) {
    return (
        <div className="bg-slate-50 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-slate-100">
            <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center text-2xl mb-6 text-white shadow-sm`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
                {desc}
            </p>
            <a href="#" className="flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all text-sm">
                {linkText} <span className="text-lg">→</span>
            </a>
        </div>
    );
}

function RoleColumn({ icon, title, desc, checks }) {
    return (
        <div>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-xl border border-slate-700">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                {desc}
            </p>
            <ul className="space-y-3">
                {checks.map((check, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-300">
                        <span className="text-green-500 font-bold">✓</span>
                        {check}
                    </li>
                ))}
            </ul>
        </div>
    );
}
