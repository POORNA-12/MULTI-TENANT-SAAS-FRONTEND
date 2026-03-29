import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    FileEdit,
    Settings,
    HelpCircle,
    Search,
    Bell,
    LayoutGrid,
    Menu,
    X,
    Workflow,
    LogOut,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const mainNav = [
    { to: '/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/portal/my-requests', label: 'My Requests', icon: FileText },
    { to: '/portal/my-approvals', label: 'My Approvals', icon: CheckCircle2 },
    { to: '/portal/requests', label: 'All Requests', icon: FileText },
    { to: '/portal/drafts', label: 'Drafts', icon: FileEdit },
];

const accountNav = [
    { to: '/portal/settings', label: 'Settings', icon: Settings },
    { to: '/portal/support', label: 'Support', icon: HelpCircle },
];

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, tenantSlug, logout, getAccessToken, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // ── Bulletproof Session Management (Portal Isolation & Rotation) ──
    useEffect(() => {
        // 1. Cross-Tab Logout Sync
        const handleStorageChange = (e) => {
            if (e.key === 'portal_logout_signal') {
                console.log("Portal logout signal received from another tab. Syncing...");
                navigate("/portal/login");
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // 2. Smart Heartbeat (Check every 60s, refresh if < 5m remaining)
        const checkSession = async () => {
            if (!isAuthenticated) return;

            try {
                const token = getAccessToken();
                if (!token) return;

                // Decode token manually for expiry math
                const payload = JSON.parse(atob(token.split('.')[1]));
                const now = Math.floor(Date.now() / 1000);
                const exp = payload.exp;
                const timeLeft = exp - now;

                // If less than 5 mins (300s) left, trigger refresh through an API call
                if (timeLeft < 300) {
                    console.log(`[Pulse] Extending portal session... (${timeLeft}s remaining)`);
                    // We call a dummy endpoint through the apiClient which handles the refresh automatically
                    await import('../services/api').then(m => m.apiClient('/auth/me/', { auth: true }));
                }
            } catch (err) {
                console.warn("[Pulse] Portal session heartbeat skipped:", err);
            }
        };

        // Run immediately
        checkSession();

        // Heartbeat interval
        const interval = setInterval(checkSession, 60000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [isAuthenticated, getAccessToken, navigate]);

    const initials = user?.email
        ? user.email.substring(0, 2).toUpperCase()
        : 'U';

    const filteredNav = mainNav.filter(item => {
        if (item.label === 'My Approvals' && user?.role === 'member') {
            return false;
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-portal-bg flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-white border-r border-border flex flex-col transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo */}
<div className="h-16 flex items-center gap-2.5 px-5 border-b border-portal-border">
    <div className="size-8 bg-orange-600 rounded flex items-center justify-center text-white shrink-0 shadow-sm shadow-orange-500/20">
        <Workflow className="w-5 h-5 text-white" />
    </div>
    <span className="font-bold text-lg tracking-tight text-portal-navy">TenantX AI</span>
                    {/* Close button (mobile) */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="ml-auto lg:hidden text-textmuted hover:text-textprimary cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Menu */}
                <nav className="flex-1 px-3 pt-6 space-y-1">
                    <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-portal-textmuted">
                        Main Menu
                    </p>
                    {filteredNav.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
        ? 'bg-portal-primary/10 text-portal-primary font-semibold'
        : 'text-portal-textsecondary hover:bg-portal-bg hover:text-portal-textprimary'
    }`
}
                        >
                            <Icon className="w-[18px] h-[18px]" />
                            {label}
                        </NavLink>
                    ))}

                    {/* Account Section */}
                    <p className="px-3 mt-8 mb-2 text-[10px] font-bold uppercase tracking-widest text-textmuted">
                        Account
                    </p>
                    {accountNav.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
        ? 'bg-portal-primary/10 text-portal-primary font-semibold'
        : 'text-portal-textsecondary hover:bg-portal-bg hover:text-portal-textprimary'
    }`
}
                        >
                            <Icon className="w-[18px] h-[18px]" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User Info */}
<div className="px-4 py-4 border-t border-portal-border">
    <div className="flex items-center gap-2.5">
        <div className="size-9 rounded-full bg-gradient-to-tr from-orange-400 to-yellow-400 border-2 border-white shadow-sm shrink-0 flex items-center justify-center text-white text-xs font-bold">
            {initials}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-portal-textprimary leading-tight truncate">{user?.email || 'User'}</p>
            <p className="text-[10px] text-portal-textsecondary font-medium truncate">{tenantSlug || 'Tenant'}</p>
        </div>
        <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
        >
            <LogOut className="w-4 h-4" />
        </button>
    </div>
</div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-white border-b border-portal-border px-4 lg:px-6 py-3 flex items-center gap-4">
    {/* Mobile hamburger */}
    <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden text-portal-textprimary cursor-pointer"
    >
        <Menu className="w-5 h-5" />
    </button>

    {/* Search */}
    <div className="flex-1 max-w-lg relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-portal-textmuted" />
        <input
            type="text"
            placeholder="Search workflows or requests..."
            className="w-full pl-10 pr-4 py-2 bg-portal-bg border border-portal-border rounded-lg text-sm text-portal-textprimary placeholder:text-portal-textmuted focus:outline-none focus:border-portal-primary focus:ring-2 focus:ring-portal-primary/10 transition-all"
        />
    </div>

{/* Switcher & Right icons */}
<div className="flex items-center gap-3">
    {/* Shift to Main SaaS Admin Button */}
    <Link
        to="/dashboard"
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-portal-border rounded-full hover:bg-portal-primary-light hover:border-portal-primary transition-all group"
    >
        <ShieldCheck className="w-4 h-4 text-portal-primary" />
        <span className="text-xs font-bold text-portal-textprimary group-hover:text-portal-primary">Shift to Admin</span>
    </Link>

    <div className="h-6 w-px bg-portal-border mx-1 hidden md:block"></div>

    <button className="relative p-2 rounded-lg hover:bg-slate-50 text-portal-textsecondary transition-colors cursor-pointer">
        <Bell className="w-5 h-5" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-portal-primary rounded-full border-2 border-white" />
    </button>
    
    <div className="size-8 rounded-full bg-gradient-to-tr from-orange-400 to-yellow-400 border-2 border-white shadow-sm shrink-0 flex items-center justify-center text-white text-[10px] font-bold ml-1 cursor-pointer">
        {initials}
    </div>
</div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
