import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { Link } from "react-router-dom";

// Simple SVG Line Chart Component
const RequestVolumeChart = () => (
    <div className="relative h-64 w-full">
        <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
            {/* Grid Lines */}
            <line x1="0" y1="150" x2="800" y2="150" stroke="#f1f5f9" strokeDasharray="4 4" />
            <line x1="0" y1="100" x2="800" y2="100" stroke="#f1f5f9" strokeDasharray="4 4" />
            <line x1="0" y1="50" x2="800" y2="50" stroke="#f1f5f9" strokeDasharray="4 4" />

            {/* Requests Line (Blue) */}
            <path
                d="M0,150 C100,120 200,140 300,120 S400,20 500,60 S600,140 700,50 S800,100 800,120"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                className="drop-shadow-sm"
            />
            {/* Latency Line (Orange Dotted) */}
            <path
                d="M0,180 C150,170 300,160 400,160 S500,170 600,140 S700,160 800,130"
                fill="none"
                stroke="#f97316"
                strokeWidth="3"
                strokeDasharray="6 4"
            />

            {/* Tooltip Dot Placeholder */}
            <circle cx="500" cy="60" r="6" fill="#3b82f6" stroke="white" strokeWidth="2" />
        </svg>
        <div className="flex justify-between text-[10px] text-gray-400 mt-2 px-2">
            <span>00:00</span>
            <span>04:00</span>
            <span>08:00</span>
            <span>12:00</span>
            <span>16:00</span>
            <span>20:00</span>
            <span>23:59</span>
        </div>
        <div className="absolute top-0 right-0 flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-gray-500 font-medium">Requests/s</span>
            </div>
            <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span className="text-gray-500 font-medium">Latency (ms)</span>
            </div>
        </div>
        {/* Simple Tooltip */}
        <div className="absolute top-[20%] left-[62%] bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg pointer-events-none transform -translate-x-1/2">
            <p className="font-bold">12:30 PM</p>
            <p>Req: 4,520/s</p>
        </div>
    </div>
);

// Simple SVG Circular Gauge
const CircularGauge = ({ value, label, subLabel, color }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative size-32">
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
const UsageBar = ({ label, valueStr, percentage }) => (
    <div className="mb-4">
        <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
            <span>{label}</span>
            <span>{valueStr}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
    </div>
);

export default function SystemMetrics() {
    const [timeRange, setTimeRange] = useState("1d");

    return (
        <DashboardLayout>
            {/* Breadcrumb & Header */}
            <div className="mb-6">
                <div className="flex gap-2 text-xs font-bold text-[#4e7397] mb-2">
                    <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
                    <span>/</span>
                    <span className="text-primary">System Metrics</span>
                </div>
                <h1 className="text-2xl font-black text-[#0e141b] tracking-tight">
                    System Metrics Dashboard
                </h1>
                <p className="text-sm text-[#4e7397] mt-1">
                    Real-time performance monitoring and utilization analytics for TenantX platform.
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
                <button className="flex items-center gap-2 px-3 py-1.5 border border-[#d0dbe7] bg-white rounded text-xs font-bold text-[#0e141b] hover:bg-slate-50 transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Download Report
                </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-5 border border-[#d0dbe7] rounded shadow-sm border-t-4 border-t-blue-500">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">TOTAL REVENUE (ARR)</p>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-3xl font-black text-gray-900">$4.2M</h3>
                        <span className="text-xs font-bold text-green-600 flex items-center">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span> 12.5%
                        </span>
                    </div>
                </div>
                <div className="bg-white p-5 border border-[#d0dbe7] rounded shadow-sm border-t-4 border-t-green-500">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">ACTIVE USERS</p>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-3xl font-black text-gray-900">248,902</h3>
                        <span className="text-xs font-bold text-green-600 flex items-center">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span> 4.2%
                        </span>
                    </div>
                </div>
                <div className="bg-white p-5 border border-[#d0dbe7] rounded shadow-sm border-t-4 border-t-blue-400">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">SYSTEM UPTIME (%)</p>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-3xl font-black text-gray-900">99.98%</h3>
                        <span className="text-xs font-bold text-blue-600 uppercase">Optimal</span>
                    </div>
                </div>
                <div className="bg-white p-5 border border-[#d0dbe7] rounded shadow-sm border-t-4 border-t-orange-400">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">GLOBAL LATENCY</p>
                    <div className="flex items-baseline justify-between">
                        <h3 className="text-3xl font-black text-gray-900">42ms</h3>
                        <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                            Stable
                            <span className="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Chart */}
            <div className="bg-white border border-[#d0dbe7] rounded-lg p-6 mb-8 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Request Volume vs. Response Time</h3>
                    <p className="text-xs text-gray-500">Aggregated metrics across all clusters for the last 24 hours</p>
                </div>
                <RequestVolumeChart />
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Top Tenants */}
                <div className="bg-white border border-[#d0dbe7] rounded-lg p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Top 5 Tenants By Usage</h3>
                    <UsageBar label="Acme Corp" valueStr="2.4 TB" percentage={100} />
                    <UsageBar label="Globex Global" valueStr="1.8 TB" percentage={75} />
                    <UsageBar label="Initech Systems" valueStr="1.2 TB" percentage={50} />
                    <UsageBar label="Umbrella Corp" valueStr="0.9 TB" percentage={35} />
                    <UsageBar label="Soylent Green" valueStr="0.6 TB" percentage={25} />
                </div>

                {/* Workflow Executions */}
                <div className="bg-white border border-[#d0dbe7] rounded-lg p-6 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Workflow Executions By Type</h3>

                    <div className="flex-1 flex items-end justify-between px-4 pb-2 border-b border-gray-100">
                        {/* Fake Bar Chart */}
                        <div className="w-12 bg-purple-100 rounded-t h-[30%] relative group">
                            <div className="absolute inset-x-0 bottom-0 bg-purple-500 h-1"></div>
                        </div>
                        <div className="w-12 bg-blue-100 rounded-t h-[45%] relative">
                            <div className="absolute inset-x-0 bottom-0 bg-blue-500 h-1"></div>
                        </div>
                        <div className="w-12 bg-green-100 rounded-t h-[60%] relative">
                            <div className="absolute inset-x-0 bottom-0 bg-green-500 h-1"></div>
                        </div>
                        <div className="w-12 bg-orange-100 rounded-t h-[80%] relative">
                            <div className="absolute inset-x-0 bottom-0 bg-orange-500 h-1"></div>
                        </div>
                        <div className="w-12 bg-gray-100 rounded-t h-[20%] relative">
                            <div className="absolute inset-x-0 bottom-0 bg-gray-500 h-1"></div>
                        </div>
                    </div>
                    <div className="flex justify-between px-2 pt-3 text-[10px] font-bold text-gray-500">
                        <span className="text-purple-600">Provisioning</span>
                        <span className="text-blue-600">Backup</span>
                        <span className="text-green-600">Security</span>
                        <span className="text-orange-600">Scaling</span>
                        <span className="text-gray-600">Other</span>
                    </div>
                </div>
            </div>

            {/* Resource Utilization */}
            <div className="bg-white border border-[#d0dbe7] rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-8">Resource Utilization</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <CircularGauge value={64} label="CPU" subLabel="Load Average: 2.15" color="#3b82f6" />
                    <CircularGauge value={82} label="RAM" subLabel="Total: 512GB Reserved" color="#10b981" />
                    <CircularGauge value={45} label="DB CONN" subLabel="Connections: 4.5k Active" color="#f97316" />
                </div>
            </div>
        </DashboardLayout>
    );
}
