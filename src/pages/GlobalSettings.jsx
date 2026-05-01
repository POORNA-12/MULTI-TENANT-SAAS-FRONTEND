import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import organizationService from "../services/organizationService";
import { useBilling } from "../context/BillingContext";
import { useNavigate } from "react-router-dom";
import { useOrganizations } from "../hooks/useOrganizations";
import notificationService from "../services/notificationService";
import dashboardService from "../services/dashboardService";

const Toggle = ({ label, description, checked, onChange, disabled }) => (
    <div className="flex items-center justify-between py-4 border-b border-[#f1f5f9] last:border-0">
        <div className="max-w-md">
            <p className="text-sm font-bold text-[#0e141b]">{label}</p>
            <p className="text-xs text-[#4e7397] mt-1">{description}</p>
        </div>
        <button
            type="button"
            onClick={onChange}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-orange-600' : 'bg-slate-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
    </div>
);

const SettingsCard = ({ title, children, icon }) => (
    <div className="bg-white border border-[#d0dbe7] rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-6 border-b border-[#f1f5f9] flex items-center gap-3">
            <div className="size-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <h3 className="text-lg font-bold text-[#0e141b]">{title}</h3>
        </div>
        <div className="p-6 space-y-6">
            {children}
        </div>
    </div>
);

const FormRow = ({ label, value, description, type = "text", readOnly = true, onChange }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-[#f1f5f9] last:border-0">
        <div className="max-w-md">
            <label className="text-sm font-bold text-[#0e141b]">{label}</label>
            {description && <p className="text-xs text-[#4e7397] mt-1">{description}</p>}
        </div>
        <div className="w-full md:w-80">
            <input
                type={type}
                value={value || ""}
                readOnly={readOnly}
                onChange={onChange}
                className={`w-full px-4 py-2 ${readOnly ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white text-[#0e141b] focus:ring-2 focus:ring-orange-500 focus:border-transparent'} border border-[#e2e8f0] rounded-lg text-sm font-medium focus:outline-none transition-all`}
                placeholder={`No ${label.toLowerCase()} set`}
            />
        </div>
    </div>
);

export default function GlobalSettings() {
    const { data: organizations, isLoading } = useOrganizations();
    const activeOrg = organizations?.find(org => org.current) || organizations?.find(org => org.is_active) || null;
    const [activeTab, setActiveTab] = useState("general");
    const [preferences, setPreferences] = useState({
        email_billing_enabled: true,
        email_security_enabled: true,
        email_workflow_enabled: true,
        in_app_billing_enabled: true,
        in_app_security_enabled: true,
        in_app_workflow_enabled: true
    });
    const [prefsLoading, setPrefsLoading] = useState(false);
    const { billingUsage, fetchBillingUsage } = useBilling();
    const navigate = useNavigate();
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [orgForm, setOrgForm] = useState({ name: "", slug: "" });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (activeOrg) {
            setOrgForm({ name: activeOrg.name || "", slug: activeOrg.slug || "" });
        }
    }, [activeOrg]);

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
    };

    useEffect(() => {
        const fetchPrefs = async () => {
            if (activeTab === "notifications") {
                setPrefsLoading(true);
                try {
                    const data = await notificationService.getPreferences();
                    setPreferences(data);
                } catch (error) {
                    console.error("Failed to fetch preferences", error);
                } finally {
                    setPrefsLoading(false);
                }
            }
        };
        fetchPrefs();
    }, [activeTab]);

    // Always fetch billing info on mount because the plan card is shown on all tabs
    useEffect(() => {
        fetchBillingUsage();
    }, [fetchBillingUsage]);

    const [recentLogs, setRecentLogs] = useState([]);
    
    useEffect(() => {
        if (activeOrg?.slug) {
            const fetchLogs = async () => {
                try {
                    const logsData = await dashboardService.getTenantAuditLogs(activeOrg.slug);
                    let rawLogs = [];
                    if (Array.isArray(logsData)) rawLogs = logsData;
                    else if (logsData && Array.isArray(logsData.results)) rawLogs = logsData.results;
                    else if (logsData && Array.isArray(logsData.activity)) rawLogs = logsData.activity;

                    // take top 3
                    const recent = rawLogs.slice(0, 3).map((log, index) => {
                        const rawAction = log.action || log.resource || "System Event";
                        let readableName = rawAction;
                        let rawLower = rawAction.toLowerCase();
                        
                        // Parse URLs and generic Methods into beautiful names
                        if (rawLower.includes('/audit/activity')) readableName = "Audit Logs Evaluated";
                        else if (rawLower.includes('/audit/analytics')) readableName = "Security Analytics Generated";
                        else if (rawLower.includes('/workflows') && rawLower.includes('/templates')) readableName = "Workflow Blueprint Updated";
                        else if (rawLower.includes('/preferences')) readableName = "System Preferences Saved";
                        else if (rawLower.includes('/login') || rawLower.includes('/auth') || rawLower.includes('/token')) readableName = "Authentication Event";
                        else if (rawLower.includes('/roles') || rawLower.includes('/permissions')) readableName = "Role Assignment Modified";
                        else if (rawLower.includes('/users') || rawLower.includes('/tenants')) readableName = "Tenant Access Updated";
                        else if (rawAction.startsWith('/')) {
                            const segments = rawAction.split('/').filter(Boolean);
                            if (segments.length > 0) {
                                const lastWord = segments[segments.length - 1].replace(/[_-]/g, ' ');
                                readableName = lastWord.charAt(0).toUpperCase() + lastWord.slice(1) + " Accessed";
                            }
                        } else if (["GET", "POST", "PATCH", "PUT", "DELETE"].includes(rawAction.toUpperCase())) {
                            const methodMap = { GET: "Viewed", POST: "Created", PATCH: "Updated", PUT: "Modified", DELETE: "Deleted" };
                            let resourceName = log.resource ? log.resource.split('/').filter(Boolean).pop() : "Data";
                            if (resourceName) resourceName = resourceName.replace(/[_-]/g, ' ');
                            readableName = `${methodMap[rawAction.toUpperCase()]} ${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}`;
                        }

                        let icon = "info";
                        let color = "bg-slate-50 text-slate-600";
                        const checkLower = readableName.toLowerCase();
                        
                        if (checkLower.includes("login") || checkLower.includes("auth")) { icon = "login"; color = "bg-green-50 text-green-600"; }
                        else if (checkLower.includes("role") || checkLower.includes("permission") || checkLower.includes("user") || checkLower.includes("tenant")) { icon = "person_add"; color = "bg-purple-50 text-purple-600"; }
                        else if (checkLower.includes("security") || checkLower.includes("audit") || checkLower.includes("policy") || checkLower.includes("evaluated")) { icon = "shield"; color = "bg-emerald-50 text-emerald-600"; }
                        else if (checkLower.includes("update") || checkLower.includes("edit") || checkLower.includes("saved") || checkLower.includes("modified")) { icon = "edit"; color = "bg-orange-50 text-orange-600"; }
                        else if (checkLower.includes("delete") || checkLower.includes("remove")) { icon = "delete"; color = "bg-red-50 text-red-600"; }
                        else if (checkLower.includes("create") || checkLower.includes("add") || checkLower.includes("generated") || checkLower.includes("blueprint")) { icon = "add_circle"; color = "bg-orange-50 text-orange-600"; }

                        // Format relative time (e.g. "2h ago")
                        const date = new Date(log.time || log.created_at);
                        const diffSecs = Math.floor((new Date() - date) / 1000);
                        let timeStr = "just now";
                        if (diffSecs > 86400) timeStr = `${Math.floor(diffSecs / 86400)}d ago`;
                        else if (diffSecs > 3600) timeStr = `${Math.floor(diffSecs / 3600)}h ago`;
                        else if (diffSecs > 60) timeStr = `${Math.floor(diffSecs / 60)}m ago`;

                        return {
                            id: log.id || index,
                            label: readableName,
                            time: timeStr,
                            icon,
                            color
                        };
                    });
                    setRecentLogs(recent);
                } catch (e) {
                    console.error("Failed to fetch recent audit logs", e);
                }
            };
            fetchLogs();
        }
    }, [activeOrg?.slug]);

    const handleSaveChanges = async () => {
        if (activeTab === "general") {
            setIsSaving(true);
            try {
                // Determine ID (commonly backend uses activeOrg.id or activeOrg.tenant_id or activeOrg.slug)
                const orgId = activeOrg.id || activeOrg.slug || activeOrg.tenant_id;
                await organizationService.updateOrganization(orgId, orgForm);
                showToast("Organization profile updated successfully! Reloading...");
                
                // Allow the toast to be seen for a moment, then force reload to hydrate changes globally
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } catch (error) {
                console.error("Failed to update organization", error);
                showToast(error?.response?.data?.error || error?.response?.data?.message || "Failed to save changes", "error");
            } finally {
                setIsSaving(false);
            }
        } else {
            showToast("Preferences in this tab are auto-saved.");
        }
    };

    const handlePreferenceToggle = async (key) => {
        const oldValue = preferences[key];
        const newValue = !oldValue;

        // Optimistic Update
        setPreferences(prev => ({ ...prev, [key]: newValue }));

        try {
            await notificationService.updatePreferences({ [key]: newValue });
            showToast("Preference updated successfully!");
        } catch (error) {
            // Rollback on failure
            setPreferences(prev => ({ ...prev, [key]: oldValue }));
            showToast("Failed to update preference. Please try again.", "error");
        }
    };


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
                        <p className="text-sm font-bold text-[#0e141b]">{toast.type === "success" ? "Success" : "Error"}</p>
                        <p className="text-xs text-[#4e7397]">{toast.message}</p>
                    </div>
                    <button onClick={() => setToast({ show: false, message: "", type: "success" })} className="ml-4 text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
            )}
            
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-[#0e141b] tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-4xl text-orange-600">settings</span>
Global System Settings
</h1>
<p className="text-[#4e7397] mt-2 font-medium">
    Configure your organization profile, environment variables, and tenant-wide security policies.
</p>
</div>
<div className="flex gap-3">
<button 
    onClick={() => setOrgForm({ name: activeOrg?.name || "", slug: activeOrg?.slug || "" })}
    className="px-6 py-2.5 bg-white border border-[#d0dbe7] text-[#0e141b] text-sm font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
    Discard
</button>
<button 
    onClick={handleSaveChanges}
    disabled={isSaving}
    className="px-6 py-2.5 bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
    {isSaving ? "Saving..." : "Save Changes"}
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
                            onClick={() => {
                                setActiveTab(tab.id);
                            }}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab.id
    ? "bg-orange-600 text-white shadow-md shadow-orange-500/20"
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
    <div className="size-24 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
        {activeOrg?.name?.[0] || "?"}
    </div>
    <div>
        <button className="text-sm font-bold text-orange-600 hover:text-orange-700">Change Logo</button>
                                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Max size 2MB, .png or .jpg</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4 pt-4">
                                            <FormRow
                                                label="Organization Name"
                                                value={orgForm.name}
                                                readOnly={false}
                                                onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                                                description="The official name for this tenant used in emails and invoices."
                                            />
                                            <FormRow
                                                label="Tenant Slug"
                                                value={orgForm.slug}
                                                readOnly={false}
                                                onChange={(e) => setOrgForm({ ...orgForm, slug: e.target.value })}
                                                description="Unique identifier used in URLs. This cannot be changed easily."
                                            />
                                            <FormRow
                                                label="Admin Email"
                                                value={activeOrg?.owner_email || "poornaajay26@gmail.com"}
                                                readOnly={true}
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

                        {activeTab === "billing" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <SettingsCard title="Subscription Overview" icon="payments">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-[#e2e8f0]">
                                                <p className="text-xs font-black text-[#4e7397] uppercase tracking-widest mb-1">Current Plan</p>
                                                <p className="text-2xl font-black text-[#0e141b]">{billingUsage?.subscription_plan || 'Free'}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-[#e2e8f0]">
                                                <p className="text-xs font-black text-[#4e7397] uppercase tracking-widest mb-1">Status</p>
                                                <p className={`text-lg font-bold flex items-center gap-2 ${billingUsage?.subscription_status === 'Expired' ? 'text-red-600' : 'text-green-600'}`}>
                                                    <span className={`size-2 rounded-full animate-pulse ${billingUsage?.subscription_status === 'Expired' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                                    {billingUsage?.subscription_status || 'Active'}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-[#e2e8f0]">
                                                <p className="text-xs font-black text-[#4e7397] uppercase tracking-widest mb-1">Plan Expiry</p>
                                                <p className="text-lg font-bold text-[#0e141b]">
                                                    {billingUsage?.days_until_expiry ? `Expires in ${billingUsage.days_until_expiry} days` : 'Permanent access'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center items-center p-8 bg-orange-50/50 rounded-3xl border border-orange-100 text-center">
                                            <div className="size-16 bg-orange-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                                                <span className="material-symbols-outlined text-3xl">upgrade</span>
                                            </div>
                                            <h4 className="text-lg font-black text-[#0e141b] mb-2">Need more power?</h4>
                                            <p className="text-sm text-[#4e7397] mb-6">Scale your infrastructure instantly with our professional plans.</p>
                                            <button
                                                onClick={() => navigate('/dashboard/billing/plans')}
                                                className="px-8 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 transition-all shadow-md shadow-orange-500/20"
                                            >
                                                View All Plans
                                            </button>
                                        </div>
                                    </div>
                                </SettingsCard>

                                <SettingsCard title="Resource Usage" icon="analytics">
                                    <div className="space-y-8">
                                        {[
                                            {
                                                label: "Organizations",
                                                usage: billingUsage?.usage?.organizations || 0,
                                                limit: billingUsage?.limits?.max_organizations || 1,
                                                icon: "corporate_fare"
                                            },
                                            {
                                                label: "Total Users",
                                                usage: billingUsage?.usage?.total_users || 0,
                                                limit: (billingUsage?.limits?.max_users_per_organization * (billingUsage?.limits?.max_organizations || 1)) || 50,
                                                icon: "groups"
                                            },
                                            {
                                                label: "Workflow Definitions",
                                                usage: billingUsage?.usage?.total_workflows || 0,
                                                limit: billingUsage?.limits?.max_workflow_definitions || 10,
                                                icon: "hub"
                                            },
                                            {
                                                label: "Roles",
                                                usage: billingUsage?.usage?.total_roles || 0,
                                                limit: billingUsage?.limits?.max_roles || 5,
                                                icon: "verified_user"
                                            }
                                        ].map((resource, i) => {
                                            const percentage = Math.min((resource.usage / resource.limit) * 100, 100);
                                            let barColor = "bg-green-500";
                                            let textColor = "text-green-600";
                                            if (percentage >= 90) {
                                                barColor = "bg-red-500";
                                                textColor = "text-red-600";
                                            } else if (percentage >= 70) {
                                                barColor = "bg-yellow-500";
                                                textColor = "text-yellow-600";
                                            }

                                            return (
                                                <div key={i} className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-sm text-[#4e7397]">{resource.icon}</span>
                                                            <span className="text-sm font-bold text-[#0e141b]">{resource.label}</span>
                                                        </div>
                                                        <span className={`text-xs font-black ${textColor}`}>
                                                            {resource.usage} / {resource.limit} ({Math.round(percentage)}%)
                                                        </span>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                                        <div
                                                            className={`${barColor} h-full rounded-full transition-all duration-1000 ease-out`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </SettingsCard>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <SettingsCard title="Email Notifications" icon="mail">
                                    <div className="space-y-2">
                                        <Toggle 
                                            label="Billing Alerts" 
                                            description="Receive emails for quotas reaching 80%, subscription renewals, and invoice issues."
                                            checked={preferences.email_billing_enabled}
                                            onChange={() => handlePreferenceToggle('email_billing_enabled')}
                                            disabled={prefsLoading}
                                        />
                                        <Toggle 
                                            label="Security Alerts" 
                                            description="Get notified about new logins from unrecognized devices and sensitive role changes."
                                            checked={preferences.email_security_enabled}
                                            onChange={() => handlePreferenceToggle('email_security_enabled')}
                                            disabled={prefsLoading}
                                        />
                                        <Toggle 
                                            label="Workflow Approvals" 
                                            description="Receive emails when a workflow requires your manual intervention or approval."
                                            checked={preferences.email_workflow_enabled}
                                            onChange={() => handlePreferenceToggle('email_workflow_enabled')}
                                            disabled={prefsLoading}
                                        />
                                    </div>
                                </SettingsCard>

                                <SettingsCard title="In-App Notifications" icon="notifications_active">
                                    <div className="space-y-2">
                                        <Toggle 
                                            label="Billing & Quotas" 
                                            description="Show high-priority badges when resources are running low."
                                            checked={preferences.in_app_billing_enabled}
                                            onChange={() => handlePreferenceToggle('in_app_billing_enabled')}
                                            disabled={prefsLoading}
                                        />
                                        <Toggle 
                                            label="System Security" 
                                            description="Real-time alerts for policy violations or configuration changes."
                                            checked={preferences.in_app_security_enabled}
                                            onChange={() => handlePreferenceToggle('in_app_security_enabled')}
                                            disabled={prefsLoading}
                                        />
                                        <Toggle 
                                            label="Workflow Updates" 
                                            description="Visual indicators when a business process progresses or completes."
                                            checked={preferences.in_app_workflow_enabled}
                                            onChange={() => handlePreferenceToggle('in_app_workflow_enabled')}
                                            disabled={prefsLoading}
                                        />
                                    </div>
                                </SettingsCard>
                            </div>
                        )}

                        {activeTab !== "general" && activeTab !== "billing" && activeTab !== "notifications" && (
                            <div className="flex flex-col items-center justify-center py-20 px-8 border-2 border-dashed border-[#d0dbe7] rounded-3xl bg-white/50 text-center">
                                <div className="size-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-6">
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
    <h4 className="text-sm font-black text-orange-400 uppercase tracking-widest mb-4 flex items-center justify-between">
    Subscription Plan
    {billingUsage?.subscription_status === 'Expired' && (
        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full">EXPIRED</span>
    )}
</h4>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className={`text-4xl font-black ${billingUsage?.subscription_status === 'Expired' ? 'text-red-400 line-through opacity-50' : 'text-white'}`}>
                                    {billingUsage?.subscription_plan || 'Free'}
                                </span>
                                <span className="text-xs text-slate-400">/ Monthly</span>
                            </div>
                            <p className="text-sm text-slate-300 mb-8 leading-relaxed">
                                {billingUsage?.subscription_plan === 'Enterprise'
                                    ? 'Unrestricted access to all modules including Workflows and Audit Analytics.'
                                    : 'Upgrade to access more organizations, users, and advanced workflows.'}
                            </p>
                            {billingUsage?.subscription_plan !== 'Enterprise' && (
                                <button
                                    onClick={() => navigate('/dashboard/billing/plans')}
                                    className="w-full py-3 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-orange-50 transition-all shadow-lg active:scale-95"
                                >
                                    Upgrade Plan
                                </button>
                            )}
                        </div>

                        <div className="bg-white border border-[#d0dbe7] rounded-3xl p-6 shadow-sm">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-[#f1f5f9] pb-4">Activity Log Summary</h4>
                            <div className="space-y-6">
                                {recentLogs.length > 0 ? (
                                    recentLogs.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                                                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#0e141b]">{item.label}</p>
                                                <p className="text-[10px] text-[#4e7397]">{item.time}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-sm text-[#4e7397]">
                                        No recent activity.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
