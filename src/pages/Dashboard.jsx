import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import dashboardService from "../services/dashboardService";
import { useSearch } from "../context/SearchContext";

export default function Dashboard() {
    const navigate = useNavigate();
    const { searchQuery } = useSearch();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await dashboardService.getDashboardData();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#0e141b] tracking-tight">
                        TenantX Admin Dashboard
                    </h1>
                    <p className="text-sm text-[#4e7397] mt-1">
                        Manage your multi-tenant infrastructure, security policies, and workflow automation.
                    </p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => navigate("/dashboard/metrics")}
                        className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 border border-[#d0dbe7] bg-white rounded text-sm font-bold text-[#0e141b] hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                        <span className="hidden sm:inline">View Metrics</span>
                        <span className="sm:hidden">Metrics</span>
                    </button>
<button
    onClick={() => navigate("/dashboard/tenants")}
    className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-orange-600 rounded text-sm font-bold text-white hover:bg-orange-700 transition-all duration-200 shadow-sm shadow-orange-500/20"
>
    <span className="material-symbols-outlined text-[18px]">add</span>
    <span className="hidden sm:inline">Create New Tenant</span>
    <span className="sm:hidden">New Tenant</span>
</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatusCard
                    title="Tenant Management"
                    status="Active"
                    statusColor="bg-green-100 text-green-700"
                    desc="Centralized control for provisioning, scaling, and managing multi-tenant lifecycle."
                    stats={[
                        { label: "TOTAL TENANTS", value: stats?.tenants?.total?.toLocaleString() || "0" },
                        { label: "ACTIVE", value: stats?.tenants?.active?.toLocaleString() || "0", valueColor: "text-blue-600" }
                    ]}
                    links={["View All Tenants", "Lifecycle Policies"]}
                    icon="corporate_fare"
                    iconBg="bg-blue-50 text-blue-600"
                />

                <StatusCard
                    title="User Metrics"
                    status="Active"
                    statusColor="bg-green-100 text-green-700"
                    desc="Overview of user adoption, active sessions, and system-wide user base."
                    stats={[
                        { label: "TOTAL USERS", value: stats?.users?.total?.toLocaleString() || "0" },
                        { label: "ACTIVE", value: stats?.users?.active?.toLocaleString() || "0" }
                    ]}
                    links={["User Directory", "Access Logs"]}
                    icon="group"
                    iconBg="bg-green-50 text-green-600"
                />

                <div >
                    <StatusCard
                        title="Role Management"
                        status="Secure"
                        statusColor="bg-blue-100 text-blue-700"
                        desc="Dynamic Role-Based Access Control. Define granular permissions and policies."
                        stats={[
                            { label: "DISTINCT ROLES", value: stats?.roles?.distinct_roles?.toString() || "0" },
                            { label: "ASSIGNMENTS", value: stats?.roles?.total_role_assignments?.toString() || "0" }
                        ]}
                        links={["Policy Editor", "Permission Audit"]}
                        icon="vpn_key"
                        iconBg="bg-purple-50 text-purple-600"
                    />
                </div>

<StatusCard
    title="Workflow Engine"
    status="Active"
    statusColor="bg-orange-100 text-orange-700"
    desc="Automate tenant operations and complex business logic using the TenantX engine."
    stats={[
        { label: "TOTAL REQUESTS", value: stats?.workflows?.total?.toLocaleString() || "0" },
        { label: "PENDING", value: stats?.workflows?.submitted?.toLocaleString() || "0", valueColor: "text-orange-600" }
    ]}
    links={["Visual Designer", "Execution History"]}
    icon="hub"
    iconBg="bg-yellow-50 text-yellow-600"
/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-[#d0dbe7] rounded-lg shadow-sm">
                    <div className="p-4 border-b border-[#d0dbe7] flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#4e7397]">history</span>
                            <h3 className="font-bold text-[#0e141b]">Recent Activity & Logs</h3>
                        </div>
                        <div className="flex gap-4 text-xs font-bold text-primary cursor-pointer">
                            <span className="hover:underline">View All</span>
                        </div>
                    </div>
                    <div className="divide-y divide-[#d0dbe7]">
                        {(() => {
                            const filteredActivity = (stats?.recent_activity || []).filter(log => {
                                if (!searchQuery) return true;
                                const query = searchQuery.toLowerCase();
                                return (
                                    log.action?.toLowerCase().includes(query) ||
                                    log.workflow?.toLowerCase().includes(query) ||
                                    log.performed_by?.toLowerCase().includes(query)
                                );
                            });

                            if (filteredActivity.length > 0) {
                                return filteredActivity.map((log, index) => (
                                    <LogItem
                                        key={index}
                                        time={new Date(log.performed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        type={log.action}
                                        desc={`${log.workflow} - ${log.performed_by}`}
                                        status="LOGGED"
                                        statusColor="text-gray-600"
                                    />
                                ));
                            }

                            return <div className="p-4 text-sm text-[#4e7397] text-center">{searchQuery ? `No activity matching "${searchQuery}"` : "No recent activity"}</div>;
                        })()}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white border border-[#d0dbe7] rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-[#0e141b] text-sm uppercase tracking-wider">System Health</h3>
                            <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                        </div>
                        <div className="space-y-3">
                            {stats?.system_health && Object.entries(stats.system_health).map(([key, value]) => (
                                <HealthItem
                                    key={key}
                                    label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    status={value}
                                    color={value === 'OPERATIONAL' ? 'text-green-600' : 'text-orange-500'}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-[#d0dbe7] rounded-lg shadow-sm p-4">
                        <h3 className="font-bold text-[#0e141b] text-sm uppercase tracking-wider mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <QuickAction icon="person_add" label="Invite Admin" />
                            <QuickAction icon="policy" label="Global Policy" />
                            <QuickAction icon="terminal" label="Cloud Shell" />
                            <QuickAction icon="description" label="API Docs" />
                        </div>
                    </div>

<div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
    <span className="material-symbols-outlined text-orange-500 shrink-0">info</span>
    <div>
        <h4 className="font-bold text-orange-800 text-sm">Upcoming Platform Sync</h4>
        <p className="text-xs text-orange-700 mt-1">
            TenantX Cloud update scheduled for Sunday. No downtime expected.
        </p>
        <span className="text-xs font-bold text-orange-800 mt-2 block hover:underline cursor-pointer">Platform Updates</span>
    </div>
</div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatusCard({ title, status, statusColor, desc, stats, links, icon, iconBg }) {
    return (
        <div className="bg-white border-t-4 border-t-primary border border-[#d0dbe7] rounded shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col h-full relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-full h-1 ${title === 'Role Management' ? 'bg-purple-500' : title === 'Workflow Engine' ? 'bg-orange-500' : title === 'Auth Services' ? 'bg-green-500' : 'bg-blue-500'}`}></div>

            <div className="flex justify-between items-start mb-4">
                <div className={`size-10 rounded-lg flex items-center justify-center ${iconBg}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                    {status}
                </span>
            </div>

            <h3 className="text-lg font-bold text-[#0e141b] mb-2">{title}</h3>
            <p className="text-xs text-[#4e7397] mb-6 leading-relaxed flex-1">
                {desc}
            </p>

            <div className="flex items-center gap-8 mb-6 pb-6 border-b border-[#d0dbe7] border-dashed">
                {stats.map((stat, i) => (
                    <div key={i}>
                        <p className="text-[10px] font-bold text-[#4e7397] uppercase">{stat.label}</p>
                        <p className={`text-xl font-black ${stat.valueColor || 'text-[#0e141b]'}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 text-xs font-bold text-primary">
                {links.map((link, i) => (
                    <span key={i} className="hover:underline cursor-pointer">{link}</span>
                ))}
            </div>
        </div>
    )
}

function LogItem({ time, type, desc, status, statusColor, typeColor }) {
    return (
        <div className="p-4 flex items-center gap-4 text-sm hover:bg-slate-50 transition-colors">
            <span className="font-mono text-[#4e7397] text-xs shrink-0">{time}</span>
            <span className={`font-bold text-xs uppercase w-20 shrink-0 ${typeColor || 'text-blue-600'}`}>{type}</span>
            <span className="text-[#0e141b] flex-1 truncate">{desc}</span>
            <span className={`font-bold text-xs ${statusColor}`}>{status}</span>
        </div>
    )
}

function HealthItem({ label, status, color }) {
    return (
        <div className="flex justify-between items-center text-xs">
            <span className="text-[#4e7397] font-medium">{label}</span>
            <span className={`font-bold ${color || 'text-green-600'}`}>{status}</span>
        </div>
    )
}

function QuickAction({ icon, label }) {
    return (
        <button className="flex flex-col items-center justify-center p-3 border border-[#d0dbe7] rounded hover:border-primary hover:bg-blue-50/50 transition-all text-[#4e7397] hover:text-primary group">
            <span className="material-symbols-outlined mb-1 group-hover:scale-110 transition-transform">{icon}</span>
            <span className="text-[10px] font-bold">{label}</span>
        </button>
    )
}
