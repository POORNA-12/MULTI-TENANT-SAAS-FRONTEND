import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import organizationService from "../services/organizationService";

export default function GlobalSettings() {
    const [activeOrg, setActiveOrg] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("general");

    useEffect(() => {
        const fetchOrgDetails = async () => {
            try {
                const data = await organizationService.getOrganizations();
                const active = data.organizations?.find(org => org.current) || data.organizations?.find(org => org.is_active);
                setActiveOrg(active || null);
            } catch (error) {
                console.error("Failed to fetch organization details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrgDetails();
    }, []);

    const SettingsCard = ({ title, children, icon }) => (
        <div className="bg-white border border-[#d0dbe7] rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-[#f1f5f9] flex items-center gap-3">
                <div className="size-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <h3 className="text-lg font-bold text-[#0e141b]">{title}</h3>
            </div>
            <div className="p-6 space-y-6">
                {children}
            </div>
        </div>
    );

    const FormRow = ({ label, value, description, type = "text" }) => (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-[#f1f5f9] last:border-0">
            <div className="max-w-md">
                <label className="text-sm font-bold text-[#0e141b]">{label}</label>
                {description && <p className="text-xs text-[#4e7397] mt-1">{description}</p>}
            </div>
            <div className="w-full md:w-80">
                <input
                    type={type}
                    value={value || ""}
                    readOnly
                    className="w-full px-4 py-2 bg-slate-50 border border-[#e2e8f0] rounded-lg text-sm text-slate-600 font-medium focus:outline-none"
                    placeholder={`No ${label.toLowerCase()} set`}
                />
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-[#0e141b] tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-4xl text-blue-600">settings</span>
                            Global System Settings
                        </h1>
                        <p className="text-[#4e7397] mt-2 font-medium">
                            Configure your organization profile, environment variables, and tenant-wide security policies.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 py-2.5 bg-white border border-[#d0dbe7] text-[#0e141b] text-sm font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                            Discard
                        </button>
                        <button className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Main Content Tabs */}
                <div className="flex gap-2 p-1 bg-white border border-[#d0dbe7] rounded-2xl w-fit shadow-sm">
                    {[
                        { id: "general", label: "General", icon: "tune" },
                        { id: "security", label: "Security", icon: "security" },
                        { id: "notifications", label: "Notifications", icon: "notifications" },
                        { id: "billing", label: "Billing", icon: "payments" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab.id
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                : "text-[#4e7397] hover:bg-slate-50 hover:text-[#0e141b]"
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {activeTab === "general" && (
                            <>
                                <SettingsCard title="Organization Profile" icon="corporate_fare">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="flex flex-col gap-4">
                                            <div className="size-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
                                                {activeOrg?.name?.[0] || "?"}
                                            </div>
                                            <div>
                                                <button className="text-sm font-bold text-blue-600 hover:text-blue-700">Change Logo</button>
                                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Max size 2MB, .png or .jpg</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4 pt-4">
                                            <FormRow
                                                label="Organization Name"
                                                value={activeOrg?.name}
                                                description="The official name for this tenant used in emails and invoices."
                                            />
                                            <FormRow
                                                label="Tenant Slug"
                                                value={activeOrg?.slug}
                                                description="Unique identifier used in URLs. This cannot be changed easily."
                                            />
                                            <FormRow
                                                label="Admin Email"
                                                value="poornaajay26@gmail.com"
                                                description="Primary point of contact for technical updates."
                                            />
                                        </div>
                                    </div>
                                </SettingsCard>

                                <SettingsCard title="System Environment" icon="terminal">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-50 rounded-xl border border-[#e2e8f0] flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="size-3 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm font-bold text-slate-700">Production Mode Active</span>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Version 2.4.0-stable</span>
                                        </div>
                                        <FormRow
                                            label="Node Environment"
                                            value="production"
                                            description="Current execution environment for the frontend bundle."
                                        />
                                        <FormRow
                                            label="Base API URL"
                                            value="/api/v1/"
                                            description="The upstream endpoint pattern for all service calls."
                                        />
                                    </div>
                                </SettingsCard>
                            </>
                        )}

                        {activeTab !== "general" && (
                            <div className="flex flex-col items-center justify-center py-20 px-8 border-2 border-dashed border-[#d0dbe7] rounded-3xl bg-white/50 text-center">
                                <div className="size-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-4xl">construction</span>
                                </div>
                                <h3 className="text-xl font-black text-[#0e141b] mb-2 uppercase tracking-tight">{activeTab} Settings Under Development</h3>
                                <p className="text-[#4e7397] max-w-sm">
                                    We're currently scaling our infrastructure to support granular {activeTab} policies. Check back soon for updates.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 size-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-4">Subscription Plan</h4>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-black">Enterprise</span>
                                <span className="text-xs text-slate-400">/ Monthly</span>
                            </div>
                            <p className="text-sm text-slate-300 mb-8 leading-relaxed">
                                Unrestricted access to all modules including Workflows and Audit Analytics.
                            </p>
                            <button className="w-full py-3 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all shadow-lg active:scale-95">
                                Upgrade Plan
                            </button>
                        </div>

                        <div className="bg-white border border-[#d0dbe7] rounded-3xl p-6 shadow-sm">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-[#f1f5f9] pb-4">Activity Log Summary</h4>
                            <div className="space-y-6">
                                {[
                                    { label: "Settings Updated", time: "2h ago", icon: "edit", color: "bg-blue-50 text-blue-600" },
                                    { label: "New Role Created", time: "1d ago", icon: "person_add", color: "bg-purple-50 text-purple-600" },
                                    { label: "MFA Policy Enabled", time: "3d ago", icon: "shield", color: "bg-emerald-50 text-emerald-600" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                                            <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#0e141b]">{item.label}</p>
                                            <p className="text-[10px] text-[#4e7397]">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
