import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import organizationService from "../services/organizationService";
import { useOrganizations } from "../hooks/useOrganizations";

const ApiEndpoint = ({ method, url, title, description, body, headers, successResponse, errorResponses }) => {
    const [isOpen, setIsOpen] = useState(false);

    const methodColors = {
        POST: "bg-green-100 text-green-700 border-green-200",
        GET: "bg-orange-100 text-orange-700 border-orange-200",
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
                <div className="p-6 border-t border-[#d0dbe7] bg-white space-y-6">
                    {description && <p className="text-sm text-[#4e7397] leading-relaxed">{description}</p>}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Request Section */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-[#0e141b] uppercase tracking-wider border-b border-[#d0dbe7] pb-2">Request</h4>

                            {headers && (
                                <div>
                                    <h5 className="text-[10px] font-bold text-[#4e7397] uppercase mb-2">Headers</h5>
                                    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded p-3 font-mono text-xs text-[#334155]">
                                        {Object.entries(headers).map(([key, value]) => (
                                            <div key={key} className="flex gap-2">
                                                <span className="font-bold text-[#0f172a]">{key}:</span>
                                                <span className="break-all">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {body && (
                                <div>
                                    <h5 className="text-[10px] font-bold text-[#4e7397] uppercase mb-2">Body</h5>
                                    <pre className="bg-[#f8fafc] border border-[#e2e8f0] rounded p-3 overflow-x-auto text-xs font-mono text-[#334155] custom-scrollbar">
                                        {JSON.stringify(body, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>

                        {/* Response Section */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold text-[#0e141b] uppercase tracking-wider border-b border-[#d0dbe7] pb-2">Responses</h4>

                            {successResponse && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                                            {successResponse.code || 200}
                                        </span>
                                        <span className="text-[10px] font-bold text-green-700 uppercase">Success</span>
                                    </div>
                                    <pre className="bg-[#f0fdf4] border border-green-100 rounded p-3 overflow-x-auto text-xs font-mono text-[#166534] custom-scrollbar">
                                        {JSON.stringify(successResponse.data, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {errorResponses && errorResponses.length > 0 && (
                                <div className="space-y-3">
                                    {errorResponses.map((err, idx) => (
                                        <div key={idx}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                                    {err.code || 400}
                                                </span>
                                                <span className="text-[10px] font-bold text-red-700 uppercase">Error</span>
                                            </div>
                                            <pre className="bg-[#fef2f2] border border-red-100 rounded p-3 overflow-x-auto text-xs font-mono text-[#991b1b] custom-scrollbar">
                                                {JSON.stringify(err.data, null, 2)}
                                            </pre>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function AuthService() {
    const [activeSlug, setActiveSlug] = useState("{tenant_slug}");

    const { data: organizations } = useOrganizations();

    const checkActiveOrg = () => {
        if (organizations) {
            const active = organizations.find(org => org.current);
            if (active && active.slug !== activeSlug) {
                setActiveSlug(active.slug);
            }
        }
    };

    useEffect(() => {
        checkActiveOrg();
    }, [organizations]);

    useEffect(() => {
        const handleOrgChange = () => checkActiveOrg();
        window.addEventListener("activeOrgChanged", handleOrgChange);
        return () => window.removeEventListener("activeOrgChanged", handleOrgChange);
    }, [organizations]);

    return (
        <DashboardLayout>
            {/* Inject Custom Scrollbar Styles for code blocks */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8;
                }
            `}</style>

            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-[#0e141b] tracking-tight">
                            Auth Service API Reference
                        </h1>
                        <p className="text-sm text-[#4e7397] mt-1 max-w-3xl">
                            Detailed technical documentation for the authentication service. Manage user lifecycles, token issuance, and multi-tenant security sessions.
                        </p>
                    </div>
                    <div className="flex gap-3">
                    </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="size-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined">dns</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-orange-900 uppercase tracking-wide">Base URL Pattern</h3>
                            <div className="mt-2 flex items-center gap-2 bg-white px-3 py-2 rounded border border-orange-200 shadow-sm">
                                <code className="text-sm font-mono text-orange-800">/tenant_auth/{activeSlug}/</code>
                            </div>
                            <p className="text-xs text-orange-700/70 mt-2">
                                Replace <code>{activeSlug}</code> with your actual tenant slug (e.g. <code>acme-corp</code>)
                            </p>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                            <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            System Operational
                        </span>
                        <p className="text-xs text-orange-800/60 mt-2">v1.2.0 • TAS-Auth-Service</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#d0dbe7]">
                        <span className="material-symbols-outlined text-[#4e7397]">lock_person</span>
                        <h2 className="text-sm font-bold text-[#0e141b] uppercase tracking-wider">
                            Tenant Authentication Endpoints
                        </h2>
                    </div>

                    {/* 1. Tenant Signup */}
                    <ApiEndpoint
                        method="POST"
                        url={`/tenant_auth/${activeSlug}/signup`}
                        title="Tenant Signup"
                        description="Register a new user to a specific tenant. This initiates the process and sends an OTP to the provided email."
                        body={{
                            email: "user@example.com",
                            password: "StrongPassword@123",
                            reenter_password: "StrongPassword@123"
                        }}
                        successResponse={{
                            code: 200,
                            data: {
                                "message": "Verification code sent"
                            }
                        }}
                        errorResponses={[
                            {
                                code: 400,
                                data: { "message": "Missing signup details" }
                            },
                            {
                                code: 400,
                                data: { "message": "User already exists" }
                            }
                        ]}
                    />

                    {/* 2. Tenant Signup Verify */}
                    <ApiEndpoint
                        method="POST"
                        url={`/tenant_auth/${activeSlug}/signup`}
                        title="Complete Signup (Verify OTP)"
                        description="Complete the registration by verifying the OTP sent to the email. Returns JWT tokens upon success."
                        body={{
                            email: "user@example.com",
                            password: "StrongPassword@123",
                            reenter_password: "StrongPassword@123",
                            verification_key: "123456"
                        }}
                        successResponse={{
                            code: 201,
                            data: {
                                "message": "Tenant user created successfully",
                                "data": {
                                    "access": "jwt_access_token",
                                    "refresh": "jwt_refresh_token"
                                }
                            }
                        }}
                        errorResponses={[
                            {
                                code: 400,
                                data: { "message": "Invalid or expired verification code" }
                            },
                            {
                                code: 400,
                                data: { "message": "Passwords do not match" }
                            }
                        ]}
                    />

                    {/* 3. Send Verification Token */}
                    <ApiEndpoint
                        method="POST"
                        url={`/tenant_auth/${activeSlug}/send-verification`}
                        title="Send Verification Token"
                        description="Resend the email verification code to the user."
                        body={{
                            email: "user@example.com",
                            tenant_slug: activeSlug === "{tenant_slug}" ? "acme-corp" : activeSlug
                        }}
                        successResponse={{
                            code: 200,
                            data: { "message": "Verification code sent successfully" }
                        }}
                        errorResponses={[
                            {
                                code: 400,
                                data: { "message": "Invalid email or tenant" }
                            }
                        ]}
                    />

                    {/* 4. Tenant Signin */}
                    <ApiEndpoint
                        method="POST"
                        url={`/tenant_auth/${activeSlug}/signin`}
                        title="Tenant Signin"
                        description="Authenticate a user and retrieve access and refresh tokens."
                        body={{
                            email: "user@example.com",
                            password: "StrongPassword@123"
                        }}
                        successResponse={{
                            code: 200,
                            data: {
                                "message": "Tenant signin successful",
                                "data": {
                                    "access": "jwt_access_token",
                                    "refresh": "jwt_refresh_token"
                                },
                                "roles": ["manager"]
                            }
                        }}
                        errorResponses={[
                            {
                                code: 401,
                                data: { "message": "Invalid credentials" }
                            }
                        ]}
                    />

                    {/* 5. Signout */}
                    <ApiEndpoint
                        method="POST"
                        url={`/tenant_auth/${activeSlug}/signout`}
                        title="Signout"
                        description="Invalidate the current user session. Requires Refresh Token."
                        headers={{
                            Authorization: "Bearer <access_token>"
                        }}
                        body={{
                            refresh: "your_refresh_token_here"
                        }}
                        successResponse={{
                            code: 200,
                            data: { "message": "Successfully logged out" }
                        }}
                        errorResponses={[
                            {
                                code: 400,
                                data: { "message": "Refresh token is required" }
                            }
                        ]}
                    />

                    {/* 6. Token Refresh */}
                    <ApiEndpoint
                        method="POST"
                        url={`/tenant_auth/${activeSlug}/token-refresh`}
                        title="Refresh Access Token"
                        description="Obtain a brand new access token using a valid refresh token."
                        body={{
                            refresh: "your_refresh_token_here"
                        }}
                        successResponse={{
                            code: 200,
                            data: { "access": "new_access_token" }
                        }}
                        errorResponses={[
                            {
                                code: 401,
                                data: { "message": "Invalid or expired refresh token" }
                            }
                        ]}
                    />

                    {/* 7. Change Password */}
                    <ApiEndpoint
                        method="POST"
                        url={`/tenant_auth/${activeSlug}/change-password`}
                        title="Change Password"
                        description="Update the current user's password."
                        headers={{
                            Authorization: "Bearer <access_token>"
                        }}
                        body={{
                            old_password: "OldPassword@123",
                            new_password: "NewPassword@123",
                            confirm_password: "NewPassword@123"
                        }}
                        successResponse={{
                            code: 200,
                            data: { "message": "Password changed successfully" }
                        }}
                        errorResponses={[
                            {
                                code: 400,
                                data: { "message": "Old password is incorrect" }
                            },
                            {
                                code: 400,
                                data: { "message": "New passwords do not match" }
                            }
                        ]}
                    />

                    {/* 8. Forgot Password */}
                    <ApiEndpoint
                        method="POST"
                        url={`/tenant_auth/${activeSlug}/forgot-password`}
                        title="Forgot Password"
                        description="Initiate password reset process by sending an OTP."
                        body={{
                            tenant_slug: activeSlug === "{tenant_slug}" ? "acme-corp" : activeSlug,
                            email: "user@example.com"
                        }}
                        successResponse={{
                            code: 200,
                            data: { "message": "Password reset verification code sent" }
                        }}
                        errorResponses={[
                            {
                                code: 400,
                                data: { "message": "Tenant slug and valid email are required" }
                            }
                        ]}
                    />

                    {/* 9. Reset Password */}
                    <ApiEndpoint
                        method="POST"
                        url={`/tenant_auth/${activeSlug}/reset-password`}
                        title="Reset Password"
                        description="Set a new password using the OTP received via email."
                        body={{
                            tenant_slug: activeSlug === "{tenant_slug}" ? "acme-corp" : activeSlug,
                            email: "user@example.com",
                            otp: "123456",
                            new_password: "NewPassword@123",
                            confirm_password: "NewPassword@123"
                        }}
                        successResponse={{
                            code: 200,
                            data: { "message": "Password reset successful" }
                        }}
                        errorResponses={[
                            {
                                code: 400,
                                data: { "message": "Invalid or expired OTP" }
                            }
                        ]}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
