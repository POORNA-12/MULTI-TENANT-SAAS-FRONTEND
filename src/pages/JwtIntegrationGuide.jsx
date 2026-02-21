import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

/* ------------------------------- UI Helpers ------------------------------ */

const CodeBlock = ({ code, lang = "bash" }) => {
    const [copied, setCopied] = useState(false);

    const tone = {
        bash: "bg-[#0f172a] text-[#86efac]",
        python: "bg-[#111827] text-[#93c5fd]",
        json: "bg-[#1e1b4b] text-[#c4b5fd]",
    };

    const label = lang === "python" ? "Python" : lang === "json" ? "JSON" : "Shell";

    const copy = async () => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }
        } catch (_err) {
            setCopied(false);
        }
    };

    return (
        <div className="rounded-xl overflow-hidden border border-[#e5d7c7] shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-[#0b1324] border-b border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</span>
                <button
                    onClick={copy}
                    className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300 hover:text-white transition-colors"
                >
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>
            <pre className={`p-4 text-xs leading-relaxed overflow-x-auto custom-scrollbar ${tone[lang] || tone.bash}`}>
                <code>{code}</code>
            </pre>
        </div>
    );
};

const Notice = ({ type = "info", children }) => {
    const style = {
        info: "bg-sky-50 border-sky-200 text-sky-900",
        warning: "bg-amber-50 border-amber-200 text-amber-900",
        danger: "bg-rose-50 border-rose-200 text-rose-900",
        success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    };

    return <div className={`rounded-xl border p-4 text-sm leading-relaxed ${style[type]}`}>{children}</div>;
};

const Section = ({ id, badge, title, children }) => (
    <section id={id} className="scroll-mt-24 bg-white border border-[#e8dccd] rounded-2xl shadow-sm p-5 md:p-6">
        <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#9a6f3c]">{badge}</p>
        <h2 className="mt-1 text-xl font-black text-[#111827]">{title}</h2>
        <div className="mt-4 space-y-4">{children}</div>
    </section>
);

const DenseTable = ({ headers, rows }) => (
    <div className="overflow-x-auto border border-[#e8dccd] rounded-xl">
        <table className="w-full text-left text-xs md:text-sm bg-white">
            <thead>
                <tr className="bg-[#fff7ed]">
                    {headers.map((head) => (
                        <th
                            key={head}
                            className="px-3 py-2 text-[10px] md:text-[11px] uppercase tracking-[0.13em] font-bold text-[#9a6f3c]"
                        >
                            {head}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-[#f1e7d9] text-[#374151]">
                {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#fffdf8] transition-colors">
                        {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3 py-2 align-top">
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

/* --------------------------------- Page ---------------------------------- */

export default function JwtIntegrationGuide() {
    const sections = [
        { id: "snapshot", label: "Contract Snapshot" },
        { id: "endpoints", label: "Endpoint Reference" },
        { id: "claims", label: "JWT Claims" },
        { id: "enforcement", label: "Permission Enforcement" },
        { id: "refresh", label: "Refresh + perm_version" },
        { id: "errors", label: "Error Matrix" },
        { id: "security", label: "Security Checklist" },
    ];

    const [active, setActive] = useState(sections[0].id);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (visible?.target?.id) setActive(visible.target.id);
            },
            { rootMargin: "-25% 0px -60% 0px", threshold: [0.15, 0.4, 0.7] }
        );

        sections.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const go = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <DashboardLayout>
            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 8px; }
      `}</style>

            <div className="relative">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,#fed7aa55_0%,transparent_35%),radial-gradient(circle_at_85%_25%,#bae6fd55_0%,transparent_35%),linear-gradient(180deg,#fffdf8_0%,#f7efe3_100%)]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
                    <header className="rounded-2xl border border-[#eadfcf] bg-white/95 backdrop-blur p-6 shadow-sm">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] bg-[#ffedd5] text-[#b45309] border border-[#fed7aa]">
                            Multi-Tenant SaaS Docs
                        </span>
                        <h1
                            className="mt-3 text-3xl font-black text-[#111827] tracking-tight"
                            style={{ fontFamily: '"Space Grotesk","Poppins",sans-serif' }}
                        >
                            JWT Integration Guide
                        </h1>
                        <p className="mt-2 text-sm text-[#4b5563] max-w-3xl">
                            Backend-aligned documentation for your current Django + SimpleJWT implementation.
                        </p>

                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                ["Algorithm", "HS256 (SimpleJWT default)"],
                                ["Access TTL", "7 minutes"],
                                ["Refresh TTL", "5 days"],
                                ["Refresh policy", "Rotate + blacklist"],
                            ].map(([k, v]) => (
                                <div key={k} className="rounded-xl border border-[#efe3d3] bg-[#fffaf2] p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a6f3c]">{k}</p>
                                    <p className="text-sm font-bold text-[#111827] mt-1">{v}</p>
                                </div>
                            ))}
                        </div>
                    </header>

                    <div className="lg:grid lg:grid-cols-12 gap-6 items-start">
                        <aside className="lg:col-span-3 mb-4 lg:mb-0">
                            <div className="lg:sticky lg:top-6 rounded-2xl border border-[#e8dccd] bg-white p-4 shadow-sm">
                                <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#9a6f3c] mb-3">On this page</p>
                                <div className="space-y-1.5">
                                    {sections.map((s, i) => (
                                        <button
                                            key={s.id}
                                            onClick={() => go(s.id)}
                                            className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors border ${active === s.id
                                                    ? "bg-[#fff7ed] border-[#fdba74] text-[#9a3412]"
                                                    : "bg-white border-transparent text-[#4b5563] hover:bg-[#f8fafc] hover:text-[#111827]"
                                                }`}
                                        >
                                            <span className="inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold mr-2 bg-[#ffedd5] text-[#c2410c]">
                                                {i + 1}
                                            </span>
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        <main className="lg:col-span-9 space-y-5">
                            <Section id="snapshot" badge="1. Overview" title="Contract Snapshot">
                                <Notice type="warning">
                                    This guide is aligned to your current backend behavior. If you later switch to RS256/JWKS, update this page and token verification docs.
                                </Notice>
                                <DenseTable
                                    headers={["Setting", "Current Value", "Source"]}
                                    rows={[
                                        ["AUTH base path", <code>/tenant_auth/</code>, <code>Multi_Tenant_Saas/urls.py</code>],
                                        ["Access lifetime", "7 minutes", <code>SIMPLE_JWT.ACCESS_TOKEN_LIFETIME</code>],
                                        ["Refresh lifetime", "5 days", <code>SIMPLE_JWT.REFRESH_TOKEN_LIFETIME</code>],
                                        ["Refresh behavior", "Rotate + blacklist", <code>ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION</code>],
                                    ]}
                                />
                            </Section>

                            <Section id="endpoints" badge="2. API" title="Endpoint Reference">
                                <DenseTable
                                    headers={["Method", "Path", "Notes"]}
                                    rows={[
                                        [<code>POST</code>, <code>/tenant_auth/{`<tenant_slug>`}/signin</code>, "Returns message + data(access, refresh) + roles"],
                                        [<code>POST</code>, <code>/tenant_auth/{`<tenant_slug>`}/token-refresh</code>, "Requires refresh token in body"],
                                        [<code>POST</code>, <code>/tenant_auth/{`<tenant_slug>`}/signout</code>, "Blacklists refresh token"],
                                        [<code>POST</code>, <code>/tenant_auth/{`<tenant_slug>`}/change-password</code>, "Tenant JWT required"],
                                    ]}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <CodeBlock
                                        lang="bash"
                                        code={`curl -X POST "/tenant_auth/acme/signin" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "ops@acme.com",
    "password": "StrongPass123!"
  }'`}
                                    />
                                    <CodeBlock
                                        lang="json"
                                        code={`{
  "message": "Tenant signin successful",
  "data": {
    "access": "<access_token>",
    "refresh": "<refresh_token>"
  },
  "roles": ["manager"]
}`}
                                    />
                                </div>
                            </Section>

                            <Section id="claims" badge="3. JWT" title="JWT Claims in Use">
                                <DenseTable
                                    headers={["Claim", "Type", "Purpose"]}
                                    rows={[
                                        [<code>tenant_id</code>, "string", "Tenant isolation checks"],
                                        [<code>tenant_user_id</code>, "integer", "Lookup tenant user"],
                                        [<code>user_type</code>, "string", "Must be tenant-user for TenantJWTAuthentication"],
                                        [<code>roles</code>, "string[]", "Role labels for client/UI awareness"],
                                        [<code>perm_version</code>, "integer", "Reject stale tokens after permission changes"],
                                        [<code>exp / jti / token_type</code>, "standard", "Token expiration, identity, and type"],
                                    ]}
                                />
                                <Notice type="info">
                                    Permission authorization is DB-backed at request time, not trusted directly from a token \`permissions\` claim.
                                </Notice>
                            </Section>

                            <Section id="enforcement" badge="4. Authorization" title="Permission Enforcement Pattern">
                                <CodeBlock
                                    lang="python"
                                    code={`# tenants/permissions.py
class CanApproveWorkflow(BasePermission):
    def has_permission(self, request, view):
        if not request.auth:
            return False
        if request.auth.get("user_type") != "tenant-user":
            return False
        return has_permission(request, "workflow.approve")

# workflows/utils.py
def has_permission(request, permission_code):
    tenant_id = request.auth.get("tenant_id")
    tenant_user_id = request.auth.get("tenant_user_id")
    permissions, _ = get_tenant_user_permissions(
        tenant_id=tenant_id,
        tenant_user_id=tenant_user_id
    )
    return "*" in permissions or permission_code in permissions`}
                                />
                                <Notice type="success">
                                    Recommended client behavior: treat \`403\` as authorization failure, and \`401\` as token/session failure.
                                </Notice>
                            </Section>

                            <Section id="refresh" badge="5. Session" title="Refresh + perm_version Flow">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <CodeBlock
                                        lang="bash"
                                        code={`curl -X POST "/tenant_auth/acme/token-refresh" \\
  -H "Content-Type: application/json" \\
  -d '{ "refresh": "<refresh_token>" }'`}
                                    />
                                    <CodeBlock
                                        lang="json"
                                        code={`{
  "access": "<new_access_token>",
  "refresh": "<new_refresh_token>"
}`}
                                    />
                                </div>

                                <DenseTable
                                        headers={["Condition", "Status", "Response"]}
                                        rows={[
                                            [
                                                "Refresh token missing",
                                                "400",
                                                <code>{`{"message": "Refresh token is required"}`}</code>
                                            ],
                                            [
                                                "Refresh token invalid/expired",
                                                "400",
                                                <code>{`{"message": "Invalid or expired refresh token"}`}</code>
                                            ],
                                            [
                                                "User inactive",
                                                "401",
                                                <code>{`{"message": "User no longer active"}`}</code>
                                            ],
                                            [
                                                "perm_version mismatch",
                                                "401",
                                                <code>{`{"message": "Permissions changed. Please login again."}`}</code>
                                            ],
                                        ]}
                                    />
                            </Section>

                            <Section id="errors" badge="6. Client Handling" title="Error Matrix (Compact)">
                                <DenseTable
                                    headers={["HTTP", "Meaning", "Typical Action"]}
                                    rows={[
                                        ["200", "Success", "Continue flow"],
                                        ["400", "Bad input / invalid refresh", "Show message, fix request or re-login"],
                                        ["401", "Unauthenticated / stale permissions", "Clear tokens and sign in again"],
                                        ["403", "Permission denied", "Hide/disable action and show access error"],
                                        ["404", "Resource missing or tenant mismatch", "Show not found state"],
                                        ["500", "Server error", "Retry later and log request id"],
                                    ]}
                                />
                            </Section>

                            <Section id="security" badge="7. Security" title="Checklist">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        "Always send access token as Bearer token over HTTPS only.",
                                        "Prefer HttpOnly secure cookies for refresh tokens if feasible.",
                                        "On refresh success, replace both access and refresh tokens.",
                                        "Force full login on perm_version mismatch (401).",
                                        "Do not rely on frontend-only permission checks.",
                                        "Validate tenant isolation on every tenant-scoped API call.",
                                    ].map((item) => (
                                        <div key={item} className="rounded-xl border border-[#e8dccd] bg-[#fffaf2] px-4 py-3 text-sm text-[#374151]">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </Section>

                            <footer className="px-1 pb-2 text-xs text-[#6b7280] flex items-center justify-between">
                                <span>Multi-Tenant SaaS · JWT Integration Guide</span>
                                <span>Backend-aligned version</span>
                            </footer>
                        </main>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
