import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import organizationService from "../services/organizationService";

const ApiEndpoint = ({ method, url, title, description, body, headers }) => {
    const [isOpen, setIsOpen] = useState(false);

    const methodColors = {
        POST: "bg-green-100 text-green-700 border-green-200",
        GET: "bg-blue-100 text-blue-700 border-blue-200",
        PUT: "bg-orange-100 text-orange-700 border-orange-200",
        DELETE: "bg-red-100 text-red-700 border-red-200",
    };

    return (
        <div className="border border-[#d0dbe7] rounded-lg mb-4 overflow-hidden bg-white shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
                <div className="flex items-center gap-4 overflow-hidden">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ring-1 ring-inset ${methodColors[method] || "bg-gray-100 text-gray-700"}`}>
                        {method}
                    </span>
                    <code className="text-sm font-mono text-[#0e141b] truncate">{url}</code>
                    <span className="text-sm text-[#4e7397] hidden sm:inline-block">- {title}</span>
                </div>
                <span className={`material-symbols-outlined text-[#4e7397] transition-transform ${isOpen ? "rotate-180" : ""}`}>
                    expand_more
                </span>
            </button>
            {isOpen && (
                <div className="p-6 border-t border-[#d0dbe7] bg-white">
                    {description && <p className="text-sm text-[#4e7397] mb-4">{description}</p>}

                    {headers && (
                        <div className="mb-4">
                            <h4 className="text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-2">Headers Required</h4>
                            <div className="bg-[#f6f7f8] border border-[#d0dbe7] rounded p-3 font-mono text-xs text-[#0e141b]">
                                {Object.entries(headers).map(([key, value]) => (
                                    <div key={key} className="flex gap-2">
                                        <span className="font-bold">{key}:</span>
                                        <span>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {body && (
                        <div>
                            <h4 className="text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-2">Request Body</h4>
                            <pre className="bg-[#f6f7f8] border border-[#d0dbe7] rounded p-4 overflow-x-auto text-xs font-mono text-[#0e141b]">
                                {JSON.stringify(body, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function AuthService() {
    const [activeSlug, setActiveSlug] = useState("{tenant_slug}");

    useEffect(() => {
        const fetchActiveOrg = async () => {
            try {
                const data = await organizationService.getOrganizations();
                const active = data.organizations?.find(org => org.is_active);
                if (active) {
                    setActiveSlug(active.slug);
                }
            } catch (error) {
                console.error("Failed to fetch active organization:", error);
            }
        };
        fetchActiveOrg();

        // Listen for changes
        const handleOrgChange = () => fetchActiveOrg();
        window.addEventListener("activeOrgChanged", handleOrgChange);
        return () => window.removeEventListener("activeOrgChanged", handleOrgChange);
    }, []);

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-[#0e141b] tracking-tight">
                            Auth Service API Reference
                        </h1>
                        <p className="text-sm text-[#4e7397] mt-1">
                            Detailed technical documentation for the authentication service. Manage user lifecycles, token issuance, and multi-tenant security sessions.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded shadow-sm transition-colors">
                            Export OpenAPI
                        </button>
                        <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded shadow-sm transition-colors">
                            Authorize
                        </button>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-600 mt-0.5">info</span>
                    <div>
                        <h3 className="text-sm font-bold text-blue-900">Base URL Pattern</h3>
                        <p className="text-sm text-blue-800 mt-1">
                            <code>/api/{activeSlug}/auth/</code> - Replace <code>{activeSlug}</code> with actual tenant slug (example: <code>acme-corp</code>)
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-[#0e141b] flex items-center gap-2">
                        <span className="material-symbols-outlined">lock</span>
                        TENANT AUTH APIs
                    </h2>

                    <ApiEndpoint
                        method="POST"
                        url={`/api/${activeSlug}/auth/signup/`}
                        title="Tenant Signup"
                        description="Register a new user to a specific tenant. This is the initial request to send an OTP."
                        body={{
                            email: "user@example.com",
                            password: "StrongPassword@123",
                            reenter_password: "StrongPassword@123"
                        }}
                    />

                    <ApiEndpoint
                        method="POST"
                        url={`/api/${activeSlug}/auth/signup/ (Verify)`}
                        title="Tenant Signup (Create Account)"
                        description="Complete signed up by verifying the OTP."
                        body={{
                            email: "user@example.com",
                            password: "StrongPassword@123",
                            reenter_password: "StrongPassword@123",
                            verification_key: "123456"
                        }}
                    />

                    <ApiEndpoint
                        method="POST"
                        url={`/api/${activeSlug}/auth/send-verification/`}
                        title="Send Email Verification"
                        body={{
                            email: "user@example.com",
                            tenant_slug: activeSlug === "{tenant_slug}" ? "acme-corp" : activeSlug
                        }}
                    />

                    <ApiEndpoint
                        method="POST"
                        url={`/api/${activeSlug}/auth/signin/`}
                        title="Tenant Signin"
                        description="Authenticate a user and retrieve access tokens."
                        body={{
                            email: "user@example.com",
                            password: "StrongPassword@123"
                        }}
                    />

                    <ApiEndpoint
                        method="POST"
                        url={`/api/${activeSlug}/auth/signout/`}
                        title="Tenant Signout"
                        description="Invalidate current user session and tokens."
                        headers={{
                            Authorization: "Bearer <access_token>"
                        }}
                        body={{
                            refresh: "your_refresh_token_here"
                        }}
                    />

                    <ApiEndpoint
                        method="POST"
                        url={`/api/${activeSlug}/auth/token-refresh/`}
                        title="Refresh Access Token"
                        description="Obtain a new access token using a refresh token."
                        body={{
                            refresh: "your_refresh_token_here"
                        }}
                    />

                    <ApiEndpoint
                        method="POST"
                        url={`/api/${activeSlug}/auth/change-password/`}
                        title="Change Password"
                        headers={{
                            Authorization: "Bearer <access_token>"
                        }}
                        body={{
                            old_password: "OldPassword@123",
                            new_password: "NewPassword@123",
                            confirm_password: "NewPassword@123"
                        }}
                    />

                    <ApiEndpoint
                        method="POST"
                        url={`/api/${activeSlug}/auth/forgot-password/`}
                        title="Forgot Password (Send Reset OTP)"
                        body={{
                            tenant_slug: activeSlug === "{tenant_slug}" ? "acme-corp" : activeSlug,
                            email: "user@example.com"
                        }}
                    />

                    <ApiEndpoint
                        method="POST"
                        url={`/api/${activeSlug}/auth/reset-password/`}
                        title="Reset Password (Using OTP)"
                        body={{
                            tenant_slug: activeSlug === "{tenant_slug}" ? "acme-corp" : activeSlug,
                            email: "user@example.com",
                            otp: "123456",
                            new_password: "NewPassword@123",
                            confirm_password: "NewPassword@123"
                        }}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
