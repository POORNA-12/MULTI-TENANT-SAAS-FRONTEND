export default function AuthFeaturePanel() {
    return (
        <div className="md:col-span-2 bg-slate-50 p-8 md:p-12 border-l border-[#d0dbe7] hidden md:block">
            <h3 className="text-lg font-bold mb-6 text-[#0e141b]">TenantX Platform Features</h3>
            <div className="space-y-6">
                <FeatureItem
                    icon="security"
                    iconColor="text-primary"
                    bg="bg-primary/10"
                    title="Dynamic RBAC"
                    desc="Granular role-based access control with attribute-driven policies."
                />
                <FeatureItem
                    icon="cloud_done"
                    iconColor="text-green-600"
                    bg="bg-green-500/10"
                    title="Tenant Isolation"
                    desc="Complete logical and physical separation of tenant data and compute resources."
                />
                <FeatureItem
                    icon="auto_mode"
                    iconColor="text-purple-600"
                    bg="bg-purple-500/10"
                    title="Workflow Engine"
                    desc="Automate tenant lifecycle events and infrastructure scaling."
                />
                <FeatureItem
                    icon="analytics"
                    iconColor="text-yellow-600"
                    bg="bg-yellow-500/10"
                    title="Audit & Compliance"
                    desc="Centralized logging and reporting for enterprise compliance standards."
                />
            </div>
            <div className="mt-12 p-4 bg-white rounded border border-[#d0dbe7]">
                <p className="text-[10px] font-bold text-[#4e7397] uppercase tracking-wider mb-2">
                    Platform Status
                </p>
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="text-xs font-medium text-[#0e141b]">All systems operational</span>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ icon, iconColor, bg, title, desc }) {
    return (
        <div className="flex gap-4">
            <div
                className={`size-10 shrink-0 ${bg} rounded flex items-center justify-center ${iconColor}`}
            >
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
                <h4 className="text-sm font-bold text-[#0e141b]">{title}</h4>
                <p className="text-xs text-[#4e7397] mt-1 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
