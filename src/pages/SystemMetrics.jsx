import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { Link } from "react-router-dom";
import dashboardService from "../services/dashboardService";
import organizationService from "../services/organizationService"; // Import for name resolution
import { useOrganizations } from "../hooks/useOrganizations";

// Dynamic SVG Line Chart Component
const RequestVolumeChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2">bar_chart_off</span>
                <p className="text-sm font-medium">No activity data available for this range</p>
            </div>
        );
    }

    const width = 800;
    const height = 200;
    const padding = 20; // Padding from top

    const counts = data.map(d => d.count);
    const maxVal = Math.max(...counts, 5); // Ensure at least some scale

    // Calculate points
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1 || 1)) * width;
        const y = height - ((d.count / maxVal) * (height - padding));
        return `${x},${y}`;
    });

    // Create Path Commands
    const linePath = `M ${points.join(" L ")}`;
    const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

    return (
        <div className="relative h-64 w-full overflow-hidden">
            <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="#f1f5f9" strokeDasharray="4 4" />

                {/* Area Fill */}
                <path d={areaPath} fill="url(#chartGradient)" />

                {/* Line */}
                <path
                    d={linePath}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    className="drop-shadow-sm"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Points */}
                {points.map((point, i) => {
                    const [cx, cy] = point.split(",");
                    return (
                        <circle
                            key={i}
                            cx={cx}
                            cy={cy}
                            r="4"
                            fill="#3b82f6"
                            stroke="white"
                            strokeWidth="2"
                            className="hover:r-6 transition-all cursor-pointer"
                        >
                            <title>{`${data[i].date}: ${data[i].count} requests`}</title>
                        </circle>
                    );
                })}
            </svg>

            {/* X-Axis Labels */}
            <div className="flex justify-between text-[10px] text-gray-400 mt-2 px-1">
                {data.map((d, i) => (
                    <span key={i}>{new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                ))}
            </div>

            <div className="absolute top-0 right-0 flex gap-4 text-xs bg-white/80 p-1 rounded backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="text-gray-500 font-medium">Requests</span>
                </div>
            </div>
        </div>
    );
};

// Simple SVG Circular Gauge
const CircularGauge = ({ value, label, subLabel, color }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center group cursor-default">
            <div className="relative size-32 transition-transform group-hover:scale-105 duration-300">
                <svg className="size-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        className="stroke-gray-100"
                        strokeWidth="8"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-gray-800">{value}%</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{label}</span>
                </div>
            </div>
            <p className="text-xs font-medium text-gray-500 mt-2">{subLabel}</p>
        </div>
    );
};

// Simple Bar Item
const UsageBar = ({ label, valueStr, percentage, color = "bg-blue-600" }) => (
    <div className="mb-4 last:mb-0">
        <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
            <span>{label}</span>
            <span>{valueStr}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className={`h-2.5 rounded-full transition-all duration-1000 ${color}`} style={{ width: `${percentage}%` }}></div>
        </div>
    </div>
);

export default function SystemMetrics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState("1d");
    const [organizations, setOrganizations] = useState({}); // Map of slug -> name
    const [activeTenantCount, setActiveTenantCount] = useState(0);
    const { data: orgData, isLoading: orgLoading } = useOrganizations();

    useEffect(() => {
        if (orgData) {
            const orgMap = {};
            let count = orgData.length;
            orgData.forEach(org => {
                orgMap[org.slug] = org.name;
                orgMap[org.id] = org.name;
                if (org.slug) orgMap[org.slug.toLowerCase()] = org.name;
            });
            setOrganizations(orgMap);
            setActiveTenantCount(count);
        }
    }, [orgData]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Organizations fetch moved to custom hook useOrganizations above


                const data = await dashboardService.getAuditAnalytics();
                setAnalytics(data);
            } catch (err) {
                console.error("Failed to fetch system metrics:", err);
                setError("Failed to load system metrics.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);

    // Helper to resolve name
    const getTenantName = (metric) => {
        // Try to find a usable key: tenant_name, tenant, slug, or schema_name
        const key = metric.tenant_name || metric.tenant || metric.slug || metric.schema_name;

        if (!key) return "Unknown Tenant";

        // Check for static system names
        if (key === "public" || key === "schema" || key === "shared") return "SaaS Platform";

        // Try to lookup in the map
        if (organizations[key]) return organizations[key];
        if (organizations[key.toLowerCase()]) return organizations[key.toLowerCase()];

        // If it's already a nice name (has spaces/uppercase), return it, otherwise potentially it's a slug -> return as is if no map match
        return key;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="h-[80vh] flex flex-col items-center justify-center text-[#4e7397]">
                    <span className="material-symbols-outlined animate-spin text-4xl mb-4 text-blue-500">
                        progress_activity
                    </span>
                    <h2 className="text-xl font-bold text-[#0e141b]">Loading System Metrics...</h2>
                    <p className="text-sm">Gathering real-time performance data</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="h-[80vh] flex flex-col items-center justify-center text-red-500">
                    <span className="material-symbols-outlined text-4xl mb-4">error</span>
                    <h2 className="text-xl font-bold">Error Loading Dashboard</h2>
                    <p className="text-sm text-gray-600">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50"
                    >
                        Retry
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const { kpis, daily_activity, top_tenants, resource_distribution, top_users } = analytics || {};

    // --- Calculated Health Metrics ---
    // 1. Success Rate
    const totalReqs = kpis?.total_requests || 0;
    const failedReqs = kpis?.failed_requests || 0;
    const successRate = totalReqs > 0 ? Math.round(((totalReqs - failedReqs) / totalReqs) * 100) : 100;

    // 2. Active Tenant Ratio
    // Use the count fetched from organizationService if available, otherwise fallback to KPI
    const activeTenants = activeTenantCount > 0 ? activeTenantCount : (kpis?.active_tenants || 0);
    // Arbitrary scaling: 20 tenants = 100% capacity usage goal
    const tenantScore = Math.min(activeTenants * 5, 100);

    // 3. Load Factor (Ratio of requests today vs avg? Or just raw activity)
    // Let's use daily_activity to see if today is peak
    const todayCount = daily_activity?.length > 0 ? daily_activity[daily_activity.length - 1].count : 0;
    const avgCount = daily_activity?.length > 0 ? (daily_activity.reduce((a, b) => a + b.count, 0) / daily_activity.length) : 1;
    const loadFactor = Math.min(Math.round((todayCount / (avgCount || 1)) * 50), 100); // 100% means double the average load

    return (
        <DashboardLayout>
            {/* Breadcrumb & Header */}
            <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
                <Link 
                    to="/dashboard" 
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#d0dbe7] rounded-md text-xs font-bold text-[#4e7397] hover:bg-slate-50 hover:text-primary transition-all mb-4 shadow-sm group"
                >
                    <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                    Back to Dashboard
                </Link>
                <h1 className="text-2xl font-black text-[#0e141b] tracking-tight">
                    System Metrics Dashboard
                </h1>
                <p className="text-sm text-[#4e7397] mt-1">
                    Real-time performance monitoring and utilization analytics.
                </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-white border border-[#d0dbe7] rounded flex p-1">
                    {["1h", "3h", "1d", "1w"].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${timeRange === range ? "bg-blue-50 text-blue-600" : "text-[#4e7397] hover:bg-gray-50"}`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
                <div className="ml-auto text-xs font-bold text-gray-400">
                    Scope: <span className="text-[#0e141b]">{analytics?.scope || "Unknown"}</span>
                </div>
            </div>

            {/* Metric Cards - Dynamic */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-5 border border-[#d0dbe7] rounded shadow-sm border-t-4 border-t-blue-500">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">TOTAL REQUESTS</p>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-3xl font-black text-gray-900">{kpis?.total_requests || 0}</h3>
                        <span className="text-xs font-bold text-blue-600 flex items-center">
                            <span className="material-symbols-outlined text-[14px]">dataset</span>
                        </span>
                    </div>
                </div>
                <div className="bg-white p-5 border border-[#d0dbe7] rounded shadow-sm border-t-4 border-t-green-500">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">SUCCESSFUL LOGINS</p>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-3xl font-black text-gray-900">{kpis?.total_logins || 0}</h3>
                        <div className="flex flex-col items-end text-[10px] font-medium text-blue-600">
                            <span className="material-symbols-outlined">login</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 border border-[#d0dbe7] rounded shadow-sm border-t-4 border-t-purple-400">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">ACTIVE LOGOUTS</p>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-3xl font-black text-gray-900">{kpis?.logouts || 0}</h3>
                        <span className="text-xs font-bold text-purple-600 uppercase">Session End</span>
                    </div>
                </div>
                <div className="bg-white p-5 border border-[#d0dbe7] rounded shadow-sm border-t-4 border-t-red-400">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">FAILED REQUESTS</p>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-3xl font-black text-gray-900">{kpis?.failed_requests || 0}</h3>
                        <span className={`text-xs font-bold flex items-center gap-1 ${kpis?.failed_requests > 0 ? "text-red-600" : "text-green-600"}`}>
                            {kpis?.failed_requests > 0 ? "Attention" : "Optimal"}
                            <span className="material-symbols-outlined text-[14px]">{kpis?.failed_requests > 0 ? "warning" : "check_circle"}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Chart */}
            <div className="bg-white border border-[#d0dbe7] rounded-lg p-6 mb-8 shadow-sm">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Activity Trends</h3>
                        <p className="text-xs text-gray-500">Request volume over the last 7 days</p>
                    </div>
                </div>
                <RequestVolumeChart data={daily_activity} />
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Top Tenants */}
                <div className="bg-white border border-[#d0dbe7] rounded-lg p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">leaderboard</span>
                        Top Active Tenants
                    </h3>
                    <div className="space-y-4">
                        {top_tenants && top_tenants.length > 0 ? (
                            top_tenants.map((metrics, i) => (
                                <UsageBar
                                    key={i}
                                    // Pass the whole object so helper can try multiple keys
                                    label={getTenantName(metrics)}
                                    valueStr={`${metrics.total} Req`}
                                    percentage={Math.min((metrics.total / (top_tenants[0]?.total || 1)) * 100, 100)}
                                    color="bg-purple-600"
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">No tenant activity data available</div>
                        )}
                    </div>
                </div>

                {/* Resource Distribution (Pie Chart alternative usage) */}
                <div className="bg-white border border-[#d0dbe7] rounded-lg p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-500">pie_chart</span>
                        Resource Distribution
                    </h3>
                    <div className="space-y-4">
                        {resource_distribution && resource_distribution.length > 0 ? (
                            resource_distribution.slice(0, 5).map((r, i) => (
                                <UsageBar
                                    key={i}
                                    label={r.resource?.toUpperCase() || "UNKNOWN"}
                                    valueStr={`${r.total}`}
                                    percentage={Math.min((r.total / (resource_distribution[0]?.total || 1)) * 100, 100)}
                                    color={['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-gray-500'][i % 5]}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">No resource usage data available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Users Table */}
            <div className="bg-white border border-[#d0dbe7] rounded-lg p-6 shadow-sm mb-8">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-500">group</span>
                    Most Active Users
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase">
                                <th className="py-2">User Email</th>
                                <th className="py-2 text-right">Total Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {top_users && top_users.length > 0 ? (
                                top_users.map((u, i) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                        <td className="py-3 text-sm font-medium text-gray-700">{u.user_email}</td>
                                        <td className="py-3 text-sm font-bold text-gray-900 text-right">{u.total}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" className="py-4 text-center text-gray-400 text-sm">No user activity data</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Calculated Application Health */}
            <div className="bg-white border border-[#d0dbe7] rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-500">health_and_safety</span>
                        Application Health (Real-time)
                    </h3>
                    <div className="flex gap-2">
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold border border-blue-100">Live Metrics</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${successRate > 98 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                            {successRate > 98 ? "System Healthy" : "System Degraded"}
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <CircularGauge
                        value={successRate}
                        label="Success"
                        subLabel={`Failure Rate: ${(100 - successRate).toFixed(1)}%`}
                        color={successRate > 95 ? "#10b981" : "#ef4444"}
                    />
                    <CircularGauge
                        value={tenantScore}
                        label="Capacity"
                        subLabel={`${activeTenants} Active Tenants`}
                        color="#3b82f6"
                    />
                    <CircularGauge
                        value={loadFactor}
                        label="Traffic"
                        subLabel={`${todayCount} Reqs Today`}
                        color="#f97316"
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
