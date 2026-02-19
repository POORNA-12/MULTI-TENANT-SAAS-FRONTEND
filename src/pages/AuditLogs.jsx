import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import dashboardService from "../services/dashboardService";
import { useSearch } from "../context/SearchContext";

export default function AuditLogs() {
    const { searchQuery } = useSearch();
    const [logs, setLogs] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch both logs and analytics in parallel
                const [logsData, analyticsData] = await Promise.all([
                    dashboardService.getAuditLogs(),
                    dashboardService.getAuditAnalytics()
                ]);
                // Handle logs data (support both array and paginated response)
                let rawLogs = [];
                if (Array.isArray(logsData)) {
                    rawLogs = logsData;
                } else if (logsData && Array.isArray(logsData.results)) {
                    rawLogs = logsData.results;
                } else if (logsData && Array.isArray(logsData.activity)) {
                    rawLogs = logsData.activity;
                } else {
                    console.warn("Unexpected logs data format:", logsData);
                }

                // Normalize logs
                const processedLogs = rawLogs.map((log, index) => ({
                    ...log,
                    id: log.id || `log-${index}-${Date.now()}`,
                    created_at: log.created_at || log.time,
                    status: log.status || (log.success ? "Success" : "Failure"),
                    details: log.details || `${log.method} ${log.endpoint}`
                }));
                setLogs(processedLogs);

                setAnalytics(analyticsData || null);
            } catch (err) {
                console.error("Error fetching audit data:", err);
                setError("Failed to load audit data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const [activeFilter, setActiveFilter] = useState("all");

    // Reset to first page when search query or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeFilter]);

    // Helper to categorize logs
    const getLogCategory = (log) => {
        const action = (log.action || "").toLowerCase();
        const resource = (log.resource || "").toLowerCase();

        if (action.includes("login") || action.includes("logout") || action.includes("auth") || resource.includes("auth")) return "auth";
        if (resource.includes("tenant") || resource.includes("user") || action.includes("profile") || action.includes("tenant") || action.includes("user")) return "tenants";
        if (resource.includes("role") || resource.includes("permission") || resource.includes("rbac") || action.includes("access") || action.includes("role") || action.includes("permission")) return "roles";
        if (resource.includes("workflow") || resource.includes("approval") || action.includes("request") || action.includes("workflow")) return "workflows";
        return "other";
    };

    // Filter logs based on search query AND active category filter
    const filteredLogs = logs.filter(log => {
        // 1. Category Filter
        if (activeFilter !== "all") {
            const category = getLogCategory(log);
            if (category !== activeFilter) return false;
        }

        // 2. Search Query
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            log.action?.toLowerCase().includes(query) ||
            log.user_email?.toLowerCase().includes(query) ||
            log.resource?.toLowerCase().includes(query) ||
            log.details?.toLowerCase().includes(query) ||
            log.ip_address?.includes(query) ||
            log.id?.toString().includes(query)
        );
    });

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "success": return "bg-green-100 text-green-800";
            case "failure": return "bg-red-100 text-red-800";
            case "warning": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                <div>
                    <h1 className="text-2xl font-bold text-[#0e141b]">Audit Overview</h1>
                    <p className="text-[#4e7397] mt-1">Real-time insights on system activity and security</p>
                </div>

                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-[#4e7397] bg-white border border-[#d0dbe7] rounded-lg shadow-sm h-64">
                        <span className="material-symbols-outlined animate-spin text-3xl mb-3">progress_activity</span>
                        <span className="font-medium">Loading analytics...</span>
                    </div>
                ) : analytics ? (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-lg border border-[#d0dbe7] shadow-sm flex flex-col justify-between h-32 hover:border-blue-300 transition-colors group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-1">Total Requests</p>
                                        <h3 className="text-2xl font-black text-[#0e141b] group-hover:text-blue-600 transition-colors">{analytics?.kpis?.total_requests || 0}</h3>
                                    </div>
                                    <div className="bg-blue-50 p-2 rounded-md text-blue-600 group-hover:bg-blue-100 transition-colors">
                                        <span className="material-symbols-outlined">dataset</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden mt-2">
                                    <div className="bg-blue-500 h-full w-3/4 rounded-full"></div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-lg border border-[#d0dbe7] shadow-sm flex flex-col justify-between h-32 hover:border-purple-300 transition-colors group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-1">Active Tenants</p>
                                        <h3 className="text-2xl font-black text-[#0e141b] group-hover:text-purple-600 transition-colors">{analytics?.kpis?.total_active_tenants || 0}</h3>
                                    </div>
                                    <div className="bg-purple-50 p-2 rounded-md text-purple-600 group-hover:bg-purple-100 transition-colors">
                                        <span className="material-symbols-outlined">domain</span>
                                    </div>
                                </div>
                                <div className="flex -space-x-2 mt-2">
                                    {[...Array(Math.min(3, analytics?.kpis?.total_active_tenants || 0))].map((_, i) => (
                                        <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600">
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                    ))}
                                    {(analytics?.kpis?.total_active_tenants || 0) > 3 && (
                                        <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-500">
                                            +{(analytics?.kpis?.total_active_tenants || 0) - 3}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-lg border border-[#d0dbe7] shadow-sm flex flex-col justify-between h-32 hover:border-green-300 transition-colors group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-1">Total Logins</p>
                                        <h3 className="text-2xl font-black text-[#0e141b] group-hover:text-green-600 transition-colors">{analytics?.kpis?.logins || 0}</h3>
                                    </div>
                                    <div className="bg-green-50 p-2 rounded-md text-green-600 group-hover:bg-green-100 transition-colors">
                                        <span className="material-symbols-outlined">login</span>
                                    </div>
                                </div>
                                <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                    Successful Access
                                </p>
                            </div>

                            <div className="bg-white p-5 rounded-lg border border-[#d0dbe7] shadow-sm flex flex-col justify-between h-32 hover:border-red-300 transition-colors group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-1">Failed Requests</p>
                                        <h3 className="text-2xl font-black text-[#0e141b] group-hover:text-red-600 transition-colors">{analytics?.kpis?.failed_requests || 0}</h3>
                                    </div>
                                    <div className="bg-red-50 p-2 rounded-md text-red-600 group-hover:bg-red-100 transition-colors">
                                        <span className="material-symbols-outlined">gpp_bad</span>
                                    </div>
                                </div>
                                <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                                    {(analytics?.kpis?.failed_requests || 0) > 0 ? (
                                        <>
                                            <span className="material-symbols-outlined text-sm">warning</span>
                                            Attention Needed
                                        </>
                                    ) : (
                                        <span className="text-green-600 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            All Good
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Activity Chart */}
                            <div className="bg-white p-6 rounded-lg border border-[#d0dbe7] shadow-sm lg:col-span-2">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-[#0e141b] flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-500">bar_chart</span>
                                        Activity (Last 7 Days)
                                    </h3>
                                </div>
                                <div className="h-48 flex items-end gap-2 sm:gap-4 justify-between px-2">
                                    {analytics?.daily_activity && analytics.daily_activity.length > 0 ? (
                                        analytics.daily_activity.map((day, i) => {
                                            // Safely calculate max
                                            const counts = analytics.daily_activity.map(d => d.count || 0);
                                            const max = Math.max(...counts, 1);
                                            const heightPercentage = Math.max(((day.count || 0) / max) * 100, 5); // Min 5% height
                                            return (
                                                <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                                    <div className="w-full relative h-[150px] flex items-end justify-center">
                                                        <div
                                                            className="w-full max-w-[40px] bg-blue-500 rounded-t-sm group-hover:bg-blue-600 transition-all relative"
                                                            style={{ height: `${heightPercentage}%` }}
                                                        >
                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0e141b] text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                                {day.count || 0} Events
                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0e141b]"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-[#4e7397] uppercase">{day.date ? new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' }) : '-'}</span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#4e7397] text-sm">
                                            No activity data available for the last 7 days.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Top Tenants & Resources */}
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-lg border border-[#d0dbe7] shadow-sm">
                                    <h3 className="font-bold text-[#0e141b] mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-purple-500">leaderboard</span>
                                        Top Tenants
                                    </h3>
                                    <div className="space-y-3">
                                        {analytics?.top_tenants && analytics.top_tenants.length > 0 ? (
                                            analytics.top_tenants.map((tenant, i) => (
                                                <div key={i} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 rounded bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold border border-purple-100">
                                                            {i + 1}
                                                        </span>
                                                        <span className="text-sm font-medium text-[#0e141b]">{tenant.tenant_name || "Unknown"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-purple-500 rounded-full"
                                                                style={{ width: `${Math.min((tenant.total / (analytics.top_tenants[0]?.total || 1)) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-[#4e7397] w-8 text-right">{tenant.total || 0}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-[#4e7397]">No tenant usage data.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-lg border border-[#d0dbe7] shadow-sm">
                                    <h3 className="font-bold text-[#0e141b] mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-orange-500">pie_chart</span>
                                        Resource Usage
                                    </h3>
                                    <div className="space-y-3">
                                        {analytics?.resource_distribution && analytics.resource_distribution.slice(0, 5).map((resource, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-sm text-[#4e7397] capitalize flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${['bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-orange-400', 'bg-red-400'][i % 5]}`}></span>
                                                    {resource.resource}
                                                </span>
                                                <span className="text-xs font-bold text-[#0e141b] bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                    {resource.total}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}

                {/* Audit Logs Table Section */}
                <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-8">
                        <div>
                            <h2 className="text-lg font-bold text-[#0e141b]">Detailed Logs</h2>
                            <p className="text-sm text-[#4e7397]">Comprehensive record of all system activities</p>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                            {[
                                { id: "all", label: "All Logs" },
                                { id: "tenants", label: "Tenants & Users" },
                                { id: "roles", label: "Roles & Permissions" },
                                { id: "workflows", label: "Workflows" }
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={`
                                        px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border
                                        ${activeFilter === filter.id
                                            ? "bg-[#0e141b] text-white border-[#0e141b]"
                                            : "bg-white text-[#4e7397] border-[#d0dbe7] hover:bg-slate-50 hover:text-[#0e141b]"}
                                    `}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-[#d0dbe7] rounded-lg shadow-sm overflow-hidden">
                        {error ? (
                            <div className="p-8 text-center text-red-500">{error}</div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#f6f7f8] border-b border-[#d0dbe7] text-[#4e7397] text-xs uppercase tracking-wider">
                                                <th className="p-4 font-semibold">Time</th>
                                                <th className="p-4 font-semibold">User</th>
                                                <th className="p-4 font-semibold">Action</th>
                                                <th className="p-4 font-semibold">Resource</th>
                                                <th className="p-4 font-semibold">Status</th>
                                                <th className="p-4 font-semibold">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#d0dbe7]">
                                            {currentLogs.length > 0 ? (
                                                currentLogs.map((log, index) => (
                                                    <tr
                                                        key={log.id}
                                                        className="hover:bg-slate-50 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards"
                                                        style={{ animationDelay: `${index * 50}ms` }}
                                                    >
                                                        <td className="p-4 whitespace-nowrap text-sm text-[#4e7397]">
                                                            {new Date(log.created_at).toLocaleString()}
                                                        </td>
                                                        <td className="p-4 whitespace-nowrap text-sm font-medium text-[#0e141b]">
                                                            {log.user_email}
                                                        </td>
                                                        <td className="p-4 whitespace-nowrap text-sm text-[#0e141b]">
                                                            {log.action}
                                                        </td>
                                                        <td className="p-4 whitespace-nowrap text-sm text-[#4e7397] font-mono">
                                                            {log.resource}
                                                        </td>
                                                        <td className="p-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(log.status)}`}>
                                                                {log.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-sm text-[#4e7397] max-w-xs truncate" title={log.details}>
                                                            {log.details || "-"}
                                                            {log.ip_address && <span className="block text-xs text-slate-400 mt-0.5">{log.ip_address}</span>}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="p-8 text-center text-[#4e7397]">
                                                        {searchQuery ? `No logs found matching "${searchQuery}"` : "No audit logs found."}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                {!loading && !error && filteredLogs.length > 0 && (
                                    <div className="border-t border-[#d0dbe7] p-4 flex items-center justify-between bg-gray-50">
                                        <span className="text-xs text-[#4e7397] font-medium">
                                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLogs.length)} of {filteredLogs.length} entries
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 border border-[#d0dbe7] rounded bg-white text-sm text-[#0e141b] hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Previous
                                            </button>
                                            <div className="flex gap-1">
                                                <span className="px-3 py-1 text-xs font-bold text-[#0e141b]">
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 border border-[#d0dbe7] rounded bg-white text-sm text-[#0e141b] hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
