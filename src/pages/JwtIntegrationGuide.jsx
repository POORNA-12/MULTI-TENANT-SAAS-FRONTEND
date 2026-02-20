import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

/* ─────────────────────────────────── helpers ─────────────────────────────── */

const CodeBlock = ({ code, lang = "python" }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Very simple keyword highlight mapping
    const langColors = {
        python: "bg-[#1e293b] text-[#93c5fd]",
        javascript: "bg-[#1e1b4b] text-[#a5b4fc]",
        json: "bg-[#1a1a2e] text-[#86efac]",
    };

    return (
        <div className="relative group rounded-lg overflow-hidden border border-[#d0dbe7] shadow-sm">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#0f172a] border-b border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {lang === "javascript" ? "Node.js" : lang === "json" ? "JSON" : "Python"}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">
                        {copied ? "check" : "content_copy"}
                    </span>
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>
            <pre className={`p-4 overflow-x-auto text-xs font-mono leading-relaxed custom-scrollbar ${langColors[lang] || langColors.python}`}>
                {code}
            </pre>
        </div>
    );
};

const Section = ({ id, icon, badgeColor, badge, title, children }) => {
    const [open, setOpen] = useState(true);

    return (
        <div
            id={id}
            className="bg-white border border-[#d0dbe7] rounded-xl shadow-sm overflow-hidden transition-all duration-300"
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <span
                        className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${badgeColor}`}
                    >
                        <span className="material-symbols-outlined text-lg">{icon}</span>
                    </span>
                    <div>
                        <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${badgeColor} mr-2`}
                        >
                            {badge}
                        </span>
                        <span className="text-sm font-bold text-[#0e141b]">{title}</span>
                    </div>
                </div>
                <span
                    className={`material-symbols-outlined text-[#4e7397] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                >
                    expand_more
                </span>
            </button>

            <div
                className={`transition-all duration-300 ${open ? "block" : "hidden"}`}
            >
                <div className="p-6 border-t border-[#d0dbe7] space-y-5">
                    {children}
                </div>
            </div>
        </div>
    );
};

const InfoBox = ({ type = "info", children }) => {
    const styles = {
        info: "bg-blue-50 border-blue-200 text-blue-900",
        warning: "bg-amber-50 border-amber-200 text-amber-900",
        danger: "bg-red-50 border-red-200 text-red-800",
        success: "bg-green-50 border-green-200 text-green-900",
    };
    const icons = {
        info: "info",
        warning: "warning",
        danger: "gpp_bad",
        success: "verified",
    };
    return (
        <div className={`flex items-start gap-3 p-4 rounded-lg border ${styles[type]}`}>
            <span className="material-symbols-outlined mt-0.5 shrink-0 text-xl">
                {icons[type]}
            </span>
            <p className="text-sm leading-relaxed">{children}</p>
        </div>
    );
};

/* ─────────────────────────────────── page ───────────────────────────────── */

export default function JwtIntegrationGuide() {
    const sections = [
        { id: "jwt-verify", label: "JWT Verification" },
        { id: "permission-enforce", label: "Permission Enforcement" },
        { id: "refresh-flow", label: "Refresh Flow" },
        { id: "perm-version", label: "Permission Version" },
        { id: "error-handling", label: "Error Handling" },
        { id: "security-best", label: "Security Best Practices" },
    ];

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <DashboardLayout>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #475569; }
            `}</style>

            <div className="max-w-5xl mx-auto space-y-8">

                {/* ── Page Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-orange-100 text-orange-700 border border-orange-200 rounded tracking-wider">
                                Developer Guide
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-[#0e141b] tracking-tight">
                            JWT Integration Guide
                        </h1>
                        <p className="text-sm text-[#4e7397] mt-1 max-w-2xl">
                            A complete reference for integrating JWT-based authentication and permission
                            enforcement into your backend services on the TenantX platform.
                        </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <button className="px-4 py-2 bg-white border border-[#d0dbe7] hover:bg-slate-50 text-[#0e141b] text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors">
                            Export PDF
                        </button>
                        <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors shadow-orange-500/20">
                            API Reference
                        </button>
                    </div>
                </div>

                {/* ── Status Bar ── */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-start gap-4 w-full">
                        <div className="size-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined">lock</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">
                                Token Algorithm
                            </h3>
                            <div className="mt-2 flex items-center gap-2 bg-white px-3 py-2 rounded border border-indigo-200 shadow-sm">
                                <code className="text-sm font-mono text-indigo-800">RS256 (RSA Signature with SHA-256)</code>
                            </div>
                            <p className="text-xs text-indigo-700/70 mt-2">
                                Always use your tenant's public key to verify signatures.
                            </p>
                        </div>
                    </div>
                    <div className="text-right hidden md:block shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                            <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Auth Service Active
                        </span>
                        <p className="text-xs text-indigo-800/60 mt-2">v1.2.0 • TAS-Auth-Service</p>
                    </div>
                </div>

                {/* ── Quick TOC ── */}
                <div className="bg-white border border-[#d0dbe7] rounded-xl p-5 shadow-sm">
                    <h2 className="text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">list</span>
                        Table of Contents
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {sections.map((s, i) => (
                            <button
                                key={s.id}
                                onClick={() => scrollTo(s.id)}
                                className="flex items-center gap-2 text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-[#4e7397] hover:text-[#0e141b] text-sm font-medium transition-colors group"
                            >
                                <span className="size-5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                    {i + 1}
                                </span>
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════ */}
                {/* SECTION 1 — JWT VERIFICATION                                */}
                {/* ════════════════════════════════════════════════════════════ */}
                <Section
                    id="jwt-verify"
                    icon="key"
                    badgeColor="bg-yellow-100 text-yellow-700"
                    badge="Step 2"
                    title="Verify JWT in Your Backend"
                >
                    <InfoBox type="danger">
                        Your backend <strong>must verify the JWT signature</strong> before trusting any
                        payload data. Skipping this step lets attackers forge tokens and impersonate any user.
                    </InfoBox>

                    <p className="text-sm text-[#4e7397] leading-relaxed">
                        After a tenant user authenticates, your backend will receive a Bearer token in the
                        <code className="mx-1 px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono text-[#0e141b]">Authorization</code>
                        header. Use your tenant's <strong>public key</strong> to verify the RS256 signature
                        before processing any request.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <CodeBlock
                            lang="python"
                            code={`import jwt

PUBLIC_KEY = "your-public-key"

def verify_token(token):
    return jwt.decode(
        token,
        PUBLIC_KEY,
        algorithms=["RS256"]
    )`}
                        />
                        <CodeBlock
                            lang="javascript"
                            code={`const jwt = require("jsonwebtoken");

function verifyToken(token) {
  return jwt.verify(token, PUBLIC_KEY);
}`}
                        />
                    </div>

                    <div className="bg-slate-50 border border-[#d0dbe7] rounded-lg p-4">
                        <h4 className="text-xs font-bold text-[#0e141b] uppercase tracking-wider mb-3">
                            JWT Payload Fields
                        </h4>
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-[#d0dbe7] text-[10px] font-bold text-[#4e7397] uppercase tracking-wider">
                                    <th className="pb-2 pr-4">Field</th>
                                    <th className="pb-2">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#d0dbe7]">
                                {[
                                    ["tenant_id", "Unique identifier for the tenant organisation"],
                                    ["tenant_user_id", "Internal ID of the authenticated user"],
                                    ["roles", "List of assigned role identifiers"],
                                    ["permissions", "Flat list of permission strings"],
                                    ["perm_version", "Increments whenever roles/permissions change"],
                                    ["exp", "UNIX timestamp of token expiry"],
                                ].map(([field, desc]) => (
                                    <tr key={field} className="group hover:bg-white transition-colors">
                                        <td className="py-2 pr-4">
                                            <code className="text-xs font-mono font-bold text-blue-600">{field}</code>
                                        </td>
                                        <td className="py-2 text-[#4e7397] text-xs">{desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>

                {/* ════════════════════════════════════════════════════════════ */}
                {/* SECTION 2 — PERMISSION ENFORCEMENT                          */}
                {/* ════════════════════════════════════════════════════════════ */}
                <Section
                    id="permission-enforce"
                    icon="shield"
                    badgeColor="bg-green-100 text-green-700"
                    badge="Step 3"
                    title="Enforce Permissions in Your API"
                >
                    <InfoBox type="info">
                        Before executing any protected action, check that the verified token contains the
                        required permission. <strong>Never rely on frontend checks alone.</strong>
                    </InfoBox>

                    <p className="text-sm text-[#4e7397] leading-relaxed">
                        Wrap your route handlers with a middleware/decorator that extracts the Bearer token,
                        verifies it, and then checks whether the required permission exists in the decoded payload.
                    </p>

                    <CodeBlock
                        lang="python"
                        code={`def require_permission(permission):
    def decorator(func):
        def wrapper(request):
            token = request.headers["Authorization"].split(" ")[1]
            decoded = verify_token(token)

            if permission not in decoded.get("permissions", []):
                return {"error": "Forbidden"}, 403

            return func(request)
        return wrapper
    return decorator


# Usage
@require_permission("workflow.create")
def create_workflow(request):
    # ... safe to proceed
    pass`}
                    />

                    <InfoBox type="warning">
                        Always validate the <code className="mx-1 px-1.5 py-0.5 bg-amber-100 rounded text-xs font-mono">permissions</code> field
                        from the <em>decoded & verified</em> token — not from a request body or query parameter.
                    </InfoBox>
                </Section>

                {/* ════════════════════════════════════════════════════════════ */}
                {/* SECTION 3 — REFRESH FLOW                                    */}
                {/* ════════════════════════════════════════════════════════════ */}
                <Section
                    id="refresh-flow"
                    icon="refresh"
                    badgeColor="bg-cyan-100 text-cyan-700"
                    badge="Step 4"
                    title="Refresh Access Token"
                >
                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-[#d0dbe7] rounded-lg">
                        <span className="px-2.5 py-1 rounded text-xs font-bold ring-1 ring-inset bg-green-100 text-green-700 border-green-200">POST</span>
                        <code className="text-sm font-mono text-[#0e141b]">/tenant/refresh/</code>
                    </div>

                    <ul className="space-y-2">
                        {[
                            ["timer", "Access token expires in <strong>7 minutes</strong> — plan your refresh strategy accordingly."],
                            ["vpn_key", "Use the refresh token to obtain a new access token without re-authenticating."],
                            ["block", "If a user's <strong>permissions changed</strong> since the refresh token was issued, the refresh may be rejected (see perm_version below)."],
                        ].map(([icon, text]) => (
                            <li key={icon} className="flex items-start gap-3 text-sm text-[#4e7397]">
                                <span className="material-symbols-outlined text-base text-orange-500 shrink-0 mt-0.5">{icon}</span>
                                <span dangerouslySetInnerHTML={{ __html: text }} />
                            </li>
                        ))}
                    </ul>

                    <div>
                        <h4 className="text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-2">Request Body</h4>
                        <CodeBlock
                            lang="json"
                            code={`{
  "refresh": "<refresh_token>"
}`}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">200</span>
                                <span className="text-[10px] font-bold text-green-700 uppercase">Success</span>
                            </div>
                            <CodeBlock
                                lang="json"
                                code={`{
  "access": "<new_access_token>"
}`}
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">401</span>
                                <span className="text-[10px] font-bold text-red-700 uppercase">Error</span>
                            </div>
                            <CodeBlock
                                lang="json"
                                code={`{
  "message": "Invalid or expired refresh token"
}`}
                            />
                        </div>
                    </div>
                </Section>

                {/* ════════════════════════════════════════════════════════════ */}
                {/* SECTION 4 — PERMISSION VERSION BEHAVIOR                     */}
                {/* ════════════════════════════════════════════════════════════ */}
                <Section
                    id="perm-version"
                    icon="published_with_changes"
                    badgeColor="bg-purple-100 text-purple-700"
                    badge="perm_version"
                    title="Permission Version Behavior"
                >
                    <InfoBox type="warning">
                        If a user's role or permissions change, <strong>previously issued tokens may be invalidated automatically</strong>.
                        Clients must handle <code className="mx-1 px-1.5 py-0.5 bg-amber-100 rounded text-xs font-mono">401</code> responses gracefully and prompt re-authentication if refresh also fails.
                    </InfoBox>

                    <p className="text-sm text-[#4e7397] leading-relaxed">
                        Each JWT contains a <code className="mx-1 px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono text-[#0e141b]">perm_version</code> field.
                        The backend tracks the current version per user. When a token is presented, the backend compares
                        the token's <code className="mx-1 px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono text-[#0e141b]">perm_version</code> against
                        the stored value. A mismatch means the token is stale and the user must re-authenticate.
                    </p>

                    <div className="bg-slate-50 border border-[#d0dbe7] rounded-lg p-4 space-y-2">
                        {[
                            { event: "Role assigned to user", result: "perm_version increments → old tokens rejected" },
                            { event: "Role removed from user", result: "perm_version increments → old tokens rejected" },
                            { event: "Permission added to a role", result: "perm_version increments for all users of that role" },
                            { event: "No permission change", result: "perm_version unchanged → tokens remain valid" },
                        ].map((row) => (
                            <div key={row.event} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-[#d0dbe7] last:border-0">
                                <span className="text-xs font-bold text-[#0e141b]">{row.event}</span>
                                <span className="text-xs text-[#4e7397]">{row.result}</span>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* ════════════════════════════════════════════════════════════ */}
                {/* SECTION 5 — ERROR HANDLING                                  */}
                {/* ════════════════════════════════════════════════════════════ */}
                <Section
                    id="error-handling"
                    icon="error"
                    badgeColor="bg-red-100 text-red-700"
                    badge="Errors"
                    title="Error Handling Guide"
                >
                    <p className="text-sm text-[#4e7397] leading-relaxed">
                        All API errors follow a consistent JSON format. Handle these codes in your client or
                        middleware to provide users with meaningful feedback.
                    </p>

                    <div className="bg-white border border-[#d0dbe7] rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-[#d0dbe7]">
                                    <th className="p-4 text-xs font-bold text-[#4e7397] uppercase tracking-wider w-24">Status</th>
                                    <th className="p-4 text-xs font-bold text-[#4e7397] uppercase tracking-wider">Meaning</th>
                                    <th className="p-4 text-xs font-bold text-[#4e7397] uppercase tracking-wider hidden md:table-cell">Common Cause</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#d0dbe7]">
                                {[
                                    { code: "200", color: "bg-green-100 text-green-700", meaning: "Success", cause: "Request completed successfully" },
                                    { code: "400", color: "bg-orange-100 text-orange-700", meaning: "Bad Request", cause: "Missing or malformed request body / parameters" },
                                    { code: "401", color: "bg-red-100 text-red-700", meaning: "Invalid Token", cause: "Token missing, expired, or signature mismatch" },
                                    { code: "403", color: "bg-red-100 text-red-700", meaning: "Permission Denied", cause: "Verified token lacks required permission" },
                                    { code: "404", color: "bg-slate-100 text-slate-700", meaning: "Not Found", cause: "Resource does not exist or belongs to a different tenant" },
                                    { code: "500", color: "bg-gray-100 text-gray-700", meaning: "Server Error", cause: "Unexpected backend failure — contact support" },
                                ].map((row) => (
                                    <tr key={row.code} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.color}`}>{row.code}</span>
                                        </td>
                                        <td className="p-4 text-sm font-bold text-[#0e141b]">{row.meaning}</td>
                                        <td className="p-4 text-sm text-[#4e7397] hidden md:table-cell">{row.cause}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-[#4e7397] uppercase tracking-wider mb-2">Standard Error Response Shape</h4>
                        <CodeBlock
                            lang="json"
                            code={`{
  "message": "Human-readable error description",
  "code": "ERROR_CODE_SLUG"
}`}
                        />
                    </div>
                </Section>

                {/* ════════════════════════════════════════════════════════════ */}
                {/* SECTION 6 — SECURITY BEST PRACTICES                         */}
                {/* ════════════════════════════════════════════════════════════ */}
                <Section
                    id="security-best"
                    icon="verified_user"
                    badgeColor="bg-orange-100 text-orange-700"
                    badge="Security"
                    title="Security Best Practices"
                >
                    <InfoBox type="success">
                        Following these practices ensures your integration meets enterprise-grade SaaS security standards.
                    </InfoBox>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            {
                                icon: "check_circle",
                                color: "text-green-600",
                                bg: "bg-green-50 border-green-200",
                                title: "Always verify JWT signature",
                                desc: "Use the RS256 public key on every request — never skip signature verification.",
                            },
                            {
                                icon: "cancel",
                                color: "text-red-600",
                                bg: "bg-red-50 border-red-200",
                                title: "Never trust frontend permission checks",
                                desc: "Frontend checks improve UX only. All access decisions must be enforced server-side.",
                            },
                            {
                                icon: "check_circle",
                                color: "text-green-600",
                                bg: "bg-green-50 border-green-200",
                                title: "Always validate permission server-side",
                                desc: "Extract permissions from the verified token payload, not from req.body or query strings.",
                            },
                            {
                                icon: "check_circle",
                                color: "text-green-600",
                                bg: "bg-green-50 border-green-200",
                                title: "Store refresh tokens securely",
                                desc: "Use HttpOnly cookies or secure storage. Never store refresh tokens in localStorage.",
                            },
                            {
                                icon: "check_circle",
                                color: "text-green-600",
                                bg: "bg-green-50 border-green-200",
                                title: "Handle token expiry gracefully",
                                desc: "Implement background refresh logic. Show a re-login prompt only when refresh also fails.",
                            },
                            {
                                icon: "check_circle",
                                color: "text-green-600",
                                bg: "bg-green-50 border-green-200",
                                title: "Rotate public keys periodically",
                                desc: "Subscribe to TenantX JWKS endpoint for automatic key rotation without downtime.",
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className={`flex items-start gap-3 p-4 rounded-lg border ${item.bg} transition-shadow hover:shadow-sm`}
                            >
                                <span className={`material-symbols-outlined shrink-0 mt-0.5 ${item.color}`}>{item.icon}</span>
                                <div>
                                    <p className="text-sm font-bold text-[#0e141b]">{item.title}</p>
                                    <p className="text-xs text-[#4e7397] mt-0.5 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* ── Footer ── */}
                <div className="flex items-center justify-between text-xs text-[#4e7397] pb-4">
                    <span>TenantX Platform · JWT Integration Guide</span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        v1.2.0
                    </span>
                </div>
            </div>
        </DashboardLayout>
    );
}
