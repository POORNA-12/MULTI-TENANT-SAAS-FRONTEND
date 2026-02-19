import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthService from "../services/authService";
import organizationService from "../services/organizationService";
import { useSearch } from "../context/SearchContext";

export default function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [activeOrg, setActiveOrg] = useState(null);
    const [user, setUser] = useState(null);
    const { searchQuery, setSearchQuery } = useSearch();

    useEffect(() => {
        // Reset search query on route change
        setSearchQuery("");
    }, [location.pathname]);

    useEffect(() => {
        // Load user from cookie for display
        const storedEmail = AuthService.getUserEmail();
        if (storedEmail) {
            setUser({ email: storedEmail });
        }
    }, []);

    // ... (rest of useEffects unchanged)

    useEffect(() => {
        const fetchActiveOrg = async () => {
            try {
                const data = await organizationService.getOrganizations();
                const active = data.organizations?.find(org => org.is_active);
                setActiveOrg(active || null);
            } catch (error) {
                console.error("Failed to fetch active organization:", error);
            }
        };
        fetchActiveOrg();

        // Listen for active org changes from other components
        window.addEventListener("activeOrgChanged", fetchActiveOrg);

        return () => {
            window.removeEventListener("activeOrgChanged", fetchActiveOrg);
        };
    }, [location.pathname]);

    // Token Refresh Logic
    useEffect(() => {
        // Check authentication on mount
        if (!AuthService.isAuthenticated()) {
            navigate("/signin");
            return;
        }

        // Setup interval to refresh token periodically
        const refreshInterval = setInterval(async () => {
            try {
                console.log("Refreshing access token...");
                await AuthService.refreshToken();
                console.log("Access token refreshed successfully.");
            } catch (error) {
                console.error("Failed to refresh token", error);
                // User requested to NOT auto-logout on error.
                // AuthService.signOut().then(() => navigate("/signin"));
            }
        }, 5 * 60 * 1000);

        return () => clearInterval(refreshInterval);
    }, [navigate]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname, setMobileMenuOpen]);

    const handleSignOut = async () => {
        try {
            await AuthService.signOut();
            navigate("/");
        } catch (error) {
            console.error("Sign out failed", error);
            navigate("/");
        }
    };

    const menuItems = [
        { icon: "dashboard", label: "Dashboard", path: "/dashboard" },
        { icon: "group", label: "Tenant & User", path: "/dashboard/tenants" },
        { icon: "security", label: "Auth Service", path: "/dashboard/auth" },
        { icon: "vpn_key", label: "Role Management Service", path: "/dashboard/roles" },
        { icon: "hub", label: "Workflows", path: "/dashboard/workflows" },
        { icon: "history", label: "Audit Logs", path: "/dashboard/audit" },
    ];

    return (
        <div className="min-h-screen bg-[#f6f7f8] font-sans flex text-[#0e141b]">
            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 bg-white border-r border-[#d0dbe7] flex flex-col transition-all duration-300
                    ${mobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
                    ${sidebarOpen ? "lg:w-64" : "lg:w-20"}
                `}
            >
                {/* ... (Sidebar Content Unchanged) ... */}
                <div className="h-16 flex items-center px-4 border-b border-[#d0dbe7] justify-between">
                    <div className="flex items-center gap-2">
                        <div className="size-8 bg-orange-600 rounded flex items-center justify-center text-white shrink-0">
                            <span className="material-symbols-outlined text-xl">hub</span>
                        </div>
                        {(sidebarOpen || mobileMenuOpen) && (
                            <span className="font-bold text-lg tracking-tight">TenantX</span>
                        )}
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        className="lg:hidden text-[#4e7397]"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 py-6 overflow-y-auto">
                    <p className={`px-4 text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-2 ${(sidebarOpen || mobileMenuOpen) ? "" : "lg:text-center"}`}>
                        {(sidebarOpen || mobileMenuOpen) ? "Main Menu" : "Menu"}
                    </p>
                    <nav className="space-y-1 px-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group overflow-hidden ${location.pathname === item.path
                                    ? "text-primary font-bold bg-blue-50"
                                    : "text-[#4e7397] hover:bg-slate-50 hover:text-[#0e141b] font-medium"
                                    }`}
                                title={(!sidebarOpen && !mobileMenuOpen) ? item.label : ""}
                            >
                                {location.pathname === item.path && (
                                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></span>
                                )}
                                <span className={`material-symbols-outlined relative z-10 transition-transform duration-200 ${location.pathname === item.path ? "scale-110" : "group-hover:scale-110"}`}>{item.icon}</span>
                                <span className={`relative z-10 whitespace-nowrap transition-all duration-300 ${(!sidebarOpen && !mobileMenuOpen) ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}`}>
                                    {item.label}
                                </span>
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-8">
                        <p className={`px-4 text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-2 ${(sidebarOpen || mobileMenuOpen) ? "" : "lg:text-center"}`}>
                            {(sidebarOpen || mobileMenuOpen) ? "Configuration" : "Config"}
                        </p>
                        <nav className="space-y-1 px-2">
                            <Link
                                to="/dashboard/settings"
                                className="flex items-center gap-3 px-3 py-2 rounded-md text-[#4e7397] hover:bg-slate-50 hover:text-[#0e141b] font-medium transition-colors overflow-hidden"
                            >
                                <span className="material-symbols-outlined shrink-0">settings</span>
                                <span className={`whitespace-nowrap transition-all duration-300 ${(!sidebarOpen && !mobileMenuOpen) ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>
                                    Global Settings
                                </span>
                            </Link>
                            <Link
                                to="/dashboard/support"
                                className="flex items-center gap-3 px-3 py-2 rounded-md text-[#4e7397] hover:bg-slate-50 hover:text-[#0e141b] font-medium transition-colors overflow-hidden"
                            >
                                <span className="material-symbols-outlined shrink-0">help</span>
                                <span className={`whitespace-nowrap transition-all duration-300 ${(!sidebarOpen && !mobileMenuOpen) ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>
                                    Support Center
                                </span>
                            </Link>
                        </nav>
                    </div>
                </div>

                <div className="p-4 border-t border-[#d0dbe7] hidden lg:block">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center justify-center p-2 rounded hover:bg-slate-100 text-[#4e7397]"
                    >
                        <span className="material-symbols-outlined">
                            {sidebarOpen ? "chevron_left" : "chevron_right"}
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col transition-all duration-300 w-full ml-0 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
                {/* Header */}
                <header className="h-16 bg-white border-b border-[#d0dbe7] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        {/* Mobile Hamburger */}
                        <button
                            className="lg:hidden text-[#4e7397]"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>

                        <div className="relative w-full max-w-sm hidden md:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4e7397]">search</span>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64 lg:w-96 h-10 pl-10 pr-4 bg-[#f6f7f8] border border-[#d0dbe7] rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                            <span className="material-symbols-outlined text-sm">public</span>
                            <span className="text-xs font-bold text-[#0e141b]">
                                {activeOrg ? `${activeOrg.name} (${activeOrg.slug})` : "Global Admin"}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 lg:gap-4 text-[#4e7397]">
                            <button className="hover:text-[#0e141b] relative">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full border border-white"></span>
                            </button>
                            <button className="hover:text-[#0e141b] hidden sm:block">
                                <span className="material-symbols-outlined">help</span>
                            </button>
                        </div>

                        <div className="h-8 w-px bg-[#d0dbe7] hidden sm:block"></div>

                        <div className="relative">
                            <div
                                className="flex items-center gap-3 cursor-pointer select-none"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-[#0e141b]">
                                        {user?.email || "User"}
                                    </p>
                                    <p className="text-[10px] text-[#4e7397]">{user?.first_name || "TenantX User"}</p>
                                </div>
                                <div className="size-9 rounded-full bg-gradient-to-tr from-orange-400 to-yellow-400 border-2 border-white shadow-sm shrink-0"></div>
                            </div>

                            {/* Dropdown */}
                            {userMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setUserMenuOpen(false)}
                                    ></div>
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-[#d0dbe7] z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                                        <div className="px-4 py-2 border-b border-[#d0dbe7] sm:hidden">
                                            <p className="text-xs font-bold text-[#0e141b]">
                                                {user?.email || "User"}
                                            </p>
                                            <p className="text-[10px] text-[#4e7397]">{user?.first_name || "TenantX User"}</p>
                                        </div>
                                        <Link
                                            to="/dashboard/profile"
                                            className="block px-4 py-2 text-sm text-[#0e141b] hover:bg-slate-50 hover:text-primary transition-colors"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            to="/dashboard/settings"
                                            className="block px-4 py-2 text-sm text-[#0e141b] hover:bg-slate-50 hover:text-primary transition-colors"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            Settings
                                        </Link>
                                        <div className="border-t border-[#d0dbe7] my-1"></div>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main
                    key={location.pathname}
                    className="p-4 lg:p-8 flex-1 overflow-x-hidden animate-in fade-in slide-in-from-top-2"
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
