import React, { useState, useEffect } from 'react';
import organizationService from '../services/organizationService';
import { useOrganizations } from '../hooks/useOrganizations';

const ApiEndpoint = ({ method, url, title, description, body, headers, successResponse, errorResponses, note }) => {
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
                <div className="p-6 border-t border-[#d0dbe7] bg-white space-y-6">
                    {description && <p className="text-sm text-[#4e7397] leading-relaxed">{description}</p>}

                    {note && (
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r text-sm text-amber-800">
                            <strong>Note:</strong> {note}
                        </div>
                    )}

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

                            {!headers && !body && (
                                <p className="text-xs text-slate-400 italic">No request body or headers required.</p>
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

const WorkflowApiReference = () => {
    const [activeSlug, setActiveSlug] = useState("{tenant_slug}");

    const { data: organizations } = useOrganizations();

    useEffect(() => {
        const checkActiveOrg = () => {
            if (organizations) {
                const active = organizations.find(org => org.current);
                if (active) {
                    setActiveSlug(active.slug);
                }
            }
        };
        checkActiveOrg();

        // Listen for changes
        window.addEventListener("activeOrgChanged", checkActiveOrg);
        return () => window.removeEventListener("activeOrgChanged", checkActiveOrg);
    }, [organizations]);

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
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

            {/* Intro / Service Info */}
            <div className="bg-white rounded-2xl p-8 border border-[#d0dbe7] shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                    <div className="size-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-2xl">api</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-[#0e141b]">Workflow Service API Reference</h2>
                        <p className="text-[#4e7397] mt-1">
                            Detailed technical documentation for managing workflow templates, requests, and approvals.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Base URL Pattern</h3>
                        <code className="block bg-white border border-slate-200 rounded p-2 text-sm font-mono text-slate-700 break-all">
                            /workflows/{activeSlug}/
                        </code>
                        <p className="text-xs text-slate-400 mt-2">Replace <code>{activeSlug}</code> with your actual tenant slug.</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Authentication</h3>
                        <code className="block bg-white border border-slate-200 rounded p-2 text-sm font-mono text-slate-700 break-all">
                            Authorization: Bearer &lt;access_token&gt;
                        </code>
                    </div>
                </div>
            </div>

            {/* Workflow Management APIs */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
                    <span className="material-symbols-outlined text-blue-600">folder_open</span>
                    <h3 className="text-lg font-bold text-[#0e141b]">Workflow Management APIs</h3>
                </div>

                <ApiEndpoint
                    method="GET"
                    url={`/workflows/${activeSlug}/templates/`}
                    title="Get Templates"
                    description="Fetches all available workflow templates for the tenant."
                    successResponse={{
                        code: 200,
                        data: {
                            "templates": [
                                {
                                    "id": 1,
                                    "name": "Leave Approval",
                                    "description": "Employee leave request workflow"
                                }
                            ]
                        }
                    }}
                    errorResponses={[
                        {
                            code: 403,
                            data: { "message": "Unauthorized tenant access" }
                        },
                        {
                            code: 404,
                            data: { "detail": "Not found." }
                        }
                    ]}
                />

                <ApiEndpoint
                    method="POST"
                    url={`/workflows/${activeSlug}/workflows/<definitionId>/apply/`}
                    title="Apply for Workflow"
                    description="Creates a new workflow request based on a template."
                    note="Some components use description instead of requester_description in the body. Please standardize to one field."
                    body={{
                        "title": "Leave Request - March",
                        "requester_description": "Need leave for medical reason"
                    }}
                    successResponse={{
                        code: 201,
                        data: {
                            "message": "Workflow request created successfully",
                            "request_id": 23
                        }
                    }}
                    errorResponses={[
                        {
                            code: 400,
                            data: { "message": "Title and description required" }
                        },
                        {
                            code: 400,
                            data: { "message": "Workflow template has no approval steps" }
                        },
                        {
                            code: 403,
                            data: { "message": "Unauthorized tenant access" }
                        },
                        {
                            code: 404,
                            data: { "detail": "Not found." }
                        }
                    ]}
                />

                <ApiEndpoint
                    method="GET"
                    url={`/workflows/${activeSlug}/my-requests/`}
                    title="My Requests (All)"
                    description="Returns all workflow requests created by the current user."
                    successResponse={{
                        code: 200,
                        data: {
                            "count": 5,
                            "results": [{ "request_id": 23, "title": "Leave Request", "status": "pending" }]
                        }
                    }}
                />

                <ApiEndpoint
                    method="GET"
                    url={`/workflows/${activeSlug}/my-requests/?status=pending`}
                    title="My Requests (Pending)"
                    description="Returns user's pending workflow requests."
                    successResponse={{
                        code: 200,
                        data: { "count": 2, "results": [{ "status": "pending" }] }
                    }}
                />

                <ApiEndpoint
                    method="GET"
                    url={`/workflows/${activeSlug}/my-requests/?status=approved`}
                    title="My Requests (Approved)"
                    description="Returns user's approved workflow requests."
                    successResponse={{
                        code: 200,
                        data: { "count": 1, "results": [{ "status": "approved" }] }
                    }}
                />

                <ApiEndpoint
                    method="GET"
                    url={`/workflows/${activeSlug}/my-requests/?status=rejected`}
                    title="My Requests (Rejected)"
                    description="Returns user's rejected workflow requests."
                    successResponse={{
                        code: 200,
                        data: { "count": 0, "results": [] }
                    }}
                />

                <ApiEndpoint
                    method="GET"
                    url={`/workflows/${activeSlug}/workflows/all/`}
                    title="All Tenant Workflows"
                    description="Fetches all workflow requests within the tenant (requires specific permissions)."
                    successResponse={{
                        code: 200,
                        data: {
                            "requests": [
                                {
                                    "id": 25,
                                    "title": "Project Budget Approval",
                                    "status": "pending",
                                    "created_by": "manager@acme.com"
                                }
                            ]
                        }
                    }}
                    errorResponses={[
                        {
                            code: 403,
                            data: { "message": "Permission denied" }
                        },
                        {
                            code: 404,
                            data: { "detail": "Not found." }
                        }
                    ]}
                />

                <ApiEndpoint
                    method="GET"
                    url={`/workflows/${activeSlug}/workflows/<requestId>/status/`}
                    title="Request Status"
                    description="Fetches detailed request status including approval steps and timeline."
                    successResponse={{
                        code: 200,
                        data: {
                            "id": 23,
                            "status": "pending",
                            "steps": [
                                {
                                    "step_order": 1,
                                    "approver_role": "manager",
                                    "status": "approved"
                                },
                                {
                                    "step_order": 2,
                                    "approver_role": "finance",
                                    "status": "pending"
                                }
                            ]
                        }
                    }}
                    errorResponses={[
                        {
                            code: 403,
                            data: { "message": "Unauthorized tenant access" }
                        },
                        {
                            code: 404,
                            data: { "detail": "Not found." }
                        }
                    ]}
                />
            </section>

            {/* Approval Management APIs */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
                    <span className="material-symbols-outlined text-purple-600">verified_user</span>
                    <h3 className="text-lg font-bold text-[#0e141b]">Approval Management APIs</h3>
                </div>

                <ApiEndpoint
                    method="GET"
                    url={`/workflows/${activeSlug}/my-approvals/?status=pending`}
                    title="My Approvals (Pending)"
                    description="Returns workflow requests waiting for approval."
                    successResponse={{
                        code: 200,
                        data: { "count": 3, "results": [{ "status": "pending" }] }
                    }}
                />

                <ApiEndpoint
                    method="GET"
                    url={`/workflows/${activeSlug}/my-approvals/?status=approved`}
                    title="My Approvals (Approved)"
                    description="Returns workflow requests already approved."
                    successResponse={{
                        code: 200,
                        data: { "count": 5, "results": [{ "status": "approved" }] }
                    }}
                />

                <ApiEndpoint
                    method="GET"
                    url={`/workflows/${activeSlug}/my-approvals/?status=rejected`}
                    title="My Approvals (Rejected)"
                    description="Returns workflow requests rejected."
                    successResponse={{
                        code: 200,
                        data: { "count": 2, "results": [{ "status": "rejected" }] }
                    }}
                />

                <ApiEndpoint
                    method="POST"
                    url={`/workflows/${activeSlug}/workflows/<requestId>/approve/`}
                    title="Approve Request"
                    description="Approves the workflow request at the current approval step."
                    successResponse={{
                        code: 200,
                        data: { "message": "Request approved successfully" }
                    }}
                    errorResponses={[
                        {
                            code: 400,
                            data: { "message": "No pending approval found" }
                        },
                        {
                            code: 403,
                            data: { "message": "Unauthorized tenant access" }
                        },
                        {
                            code: 403,
                            data: { "message": "You are not authorized for this step" }
                        },
                        {
                            code: 404,
                            data: { "detail": "Not found." }
                        }
                    ]}
                />

                <ApiEndpoint
                    method="POST"
                    url={`/workflows/${activeSlug}/workflows/<requestId>/reject/`}
                    title="Reject Request"
                    description="Rejects the workflow request with a reason."
                    body={{ "description": "Insufficient documentation" }}
                    successResponse={{
                        code: 200,
                        data: { "message": "Request rejected successfully" }
                    }}
                    errorResponses={[
                        {
                            code: 400,
                            data: { "message": "Rejection description is required" }
                        },
                        {
                            code: 400,
                            data: { "message": "No pending approval found" }
                        },
                        {
                            code: 403,
                            data: { "message": "Unauthorized tenant access" }
                        },
                        {
                            code: 403,
                            data: { "message": "You are not authorized for this step" }
                        },
                        {
                            code: 404,
                            data: { "detail": "Not found." }
                        }
                    ]}
                />
            </section>

            {/* Lifecycle */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mt-8">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Request Status Lifecycle</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Status</th>
                                <th className="px-4 py-3 rounded-r-lg">Meaning</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[
                                { status: "draft", desc: "Created but not submitted" },
                                { status: "submitted", desc: "Waiting for approval" },
                                { status: "pending", desc: "Currently active approval step" },
                                { status: "approved", desc: "Fully approved" },
                                { status: "rejected", desc: "Rejected by approver" }
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-mono font-medium text-slate-700">{row.status}</td>
                                    <td className="px-4 py-3 text-slate-600">{row.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WorkflowApiReference;
