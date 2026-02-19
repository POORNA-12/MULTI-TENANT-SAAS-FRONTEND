import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="font-sans text-slate-custom bg-background-light">
      <Navbar />
      <main>
        {/* HERO */}
        <section className="pt-32 pb-20 bg-[radial-gradient(circle_at_50%_50%,_#f8fafc_0%,_#e2e8f0_100%)]">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
              <span className="text-[12px] font-bold text-blue-700 uppercase tracking-wider">
                Enterprise v2.4 Now Live
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-custom mb-6 tracking-tight leading-[1.1]">
              Next-Generation <br />
              <span className="text-primary">Multi-Tenant Workflow Engine</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-slate-500 mb-10 leading-relaxed">
              The infrastructure backbone for modern SaaS. Scale securely with
              automated tenant lifecycle management, dynamic RBAC, and
              high-performance workflow orchestration.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <button className="bg-orange-500 text-white px-8 py-4 rounded-md text-lg font-bold shadow-lg shadow-orange-500/20 hover:translate-y-[-2px] transition-all">
                  Get Started for Free
                </button>
              </Link>
              <button className="flex items-center gap-2 px-8 py-4 rounded-md text-lg font-bold text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 transition-all">
                <span className="material-symbols-outlined">play_circle</span>
                Request Demo
              </button>
            </div>
            <div className="mt-16 flex items-center justify-center gap-8 grayscale opacity-50">
              <span className="font-bold text-xl">
                TRUSTED BY INDUSTRY LEADERS
              </span>
            </div>
          </div>
        </section>

        {/* CORE MODULES */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">
                Core Modules
              </h2>
              <p className="text-3xl font-black text-slate-custom tracking-tight">
                Everything needed to run at scale
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <ModuleCard
                icon="corporate_fare"
                iconColor="text-primary"
                title="Tenant Management"
                desc="Complete lifecycle management from provisioning to teardown. Handle data isolation and resource quotas automatically across your fleet."
                hoverBorder="hover:border-primary/20"
                hoverBg="group-hover:bg-primary"
              />
              <ModuleCard
                icon="security"
                iconColor="text-green-600"
                title="Auth Services"
                desc="Enterprise-grade identity management with SSO (SAML/OIDC), MFA, and secure token rotation out of the box."
                hoverBorder="hover:border-green-500/20"
                hoverBg="group-hover:bg-green-600"
              />
              <ModuleCard
                icon="key"
                iconColor="text-purple-600"
                title="Role Management"
                desc="Dynamic RBAC and ABAC engines. Define granular permissions that scale with your tenants' organizational hierarchies."
                hoverBorder="hover:border-purple-500/20"
                hoverBg="group-hover:bg-purple-600"
              />
              <ModuleCard
                icon="schema"
                iconColor="text-yellow-600"
                title="Workflow Engine"
                desc="Low-code orchestration for complex business logic. Automate provisioning steps and cross-tenant operations with ease."
                hoverBorder="hover:border-yellow-500/20"
                hoverBg="group-hover:bg-yellow-600"
              />
            </div>
          </div>
        </section>

        {/* SECURITY SECTION */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-sm font-bold text-orange-500 uppercase tracking-[0.2em] mb-4">
                  Security First
                </h2>
                <h3 className="text-4xl font-black mb-6 tracking-tight">
                  Bulletproof Isolation &amp; Audit Compliance
                </h3>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  We understand that multi-tenancy is built on trust. TenantX
                  enforces cryptographic isolation at every layer of the stack,
                  ensuring no data ever leaks between tenants.
                </p>
                <ul className="space-y-4">
                  <SecurityFeature
                    title="Logical & Physical Isolation"
                    desc="Policy-enforced data partitioning and separate encryption keys per tenant."
                  />
                  <SecurityFeature
                    title="Immutable Audit Trails"
                    desc="Detailed compliance logs for every API call, role change, and workflow execution."
                  />
                  <SecurityFeature
                    title="Continuous Monitoring"
                    desc="Real-time threat detection and automated incident response workflows."
                  />
                </ul>
              </div>
              <div className="relative">
                <div className="bg-[#111827] rounded-xl p-6 border border-slate-800 shadow-2xl">
                  <div className="space-y-4 font-mono text-[11px]">
                    <LogEntry
                      time="14:20:11"
                      type="AUTH"
                      text="Tenant 'Acme-Corp' user 'admin_01' logged in via SAML"
                      typeColor="text-blue-400"
                      barColor="bg-blue-500"
                    />
                    <LogEntry
                      time="14:21:45"
                      type="RBAC"
                      text="Policy 'Reader-Access' updated for 'Global-Audit' group"
                      typeColor="text-purple-400"
                      barColor="bg-purple-500"
                    />
                    <LogEntry
                      time="14:22:02"
                      type="WORKFLOW"
                      text="Started 'Auto-Provisioning' for new tenant 'Globex'"
                      typeColor="text-orange-400"
                      barColor="bg-orange-500"
                    />
                  </div>
                </div>
                {/* Glow effects */}
                <div className="absolute -top-10 -right-10 size-40 bg-blue-500/10 blur-[80px] rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 size-40 bg-purple-500/10 blur-[80px] rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-[2rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
                  Ready to scale your SaaS?
                </h2>
                <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                  Join over 500+ engineering teams building on TenantX. Deploy
                  your first tenant in minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-orange-500 text-white px-8 py-4 rounded-md text-lg font-bold shadow-lg hover:translate-y-[-2px] transition-all">
                    Get Started Now
                  </button>
                  <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-md text-lg font-bold hover:bg-white/20 transition-all">
                    Contact Sales
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ModuleCard({ icon, iconColor, title, desc, hoverBorder, hoverBg }) {
  return (
    <div
      className={`p-8 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl ${hoverBorder} transition-all group`}
    >
      <div
        className={`size-12 bg-white rounded-lg shadow-sm flex items-center justify-center ${iconColor} mb-6 ${hoverBg} group-hover:text-white transition-colors`}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h3 className="text-lg font-bold mb-3 text-slate-custom">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function SecurityFeature({ title, desc }) {
  return (
    <li className="flex items-start gap-3">
      <span className="material-symbols-outlined text-green-500">
        check_circle
      </span>
      <div>
        <span className="font-bold block">{title}</span>
        <span className="text-sm text-slate-400">{desc}</span>
      </div>
    </li>
  );
}

function LogEntry({ time, type, text, typeColor, barColor }) {
  return (
    <div className="flex gap-4 p-3 bg-slate-900/50 rounded items-center">
      <div className={`h-8 w-1 shrink-0 rounded-full ${barColor}`}></div>
      <div className="flex gap-3">
        <span className="text-slate-500">{time}</span>
        <span className={typeColor}>{type}</span>
        <span className="text-slate-300">{text}</span>
      </div>
    </div>
  );
}
