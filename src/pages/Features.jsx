import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Features() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 bg-slate-50 border-b">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 mb-8">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
              Platform Capabilities
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Powerful Features for <br />
            <span className="text-blue-600">Modern SaaS</span>
          </h1>

          <p className="max-w-2xl mx-auto mt-6 text-xl text-slate-500">
            Everything you need to build, deploy, and scale enterprise-grade
            multi-tenant applications without architectural overhead.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-32">

          {/* 1 */}
          <FeatureRow
            title="Advanced Tenant Isolation"
            desc="Ensure zero data leakage with robust isolation using logical partitioning and physical silos."
            bullets={["Logical Partitioning", "Physical Silos"]}
            visual={<IsolationMock />}
          />

          {/* 2 */}
          <FeatureRow
            reverse
            title="Comprehensive Authentication Services"
            desc="JWT, MFA, OTP, automated token refresh and secure password hashing."
            bullets={[
              "Secure JWT Sessions",
              "Multi-factor Authentication (OTP)",
              "Automated Token Refresh",
              "Salted Password Hashing",
            ]}
            visual={<AuthMock />}
          />

          {/* 3 */}
          <FeatureRow
            title="Dynamic RBAC & ABAC"
            desc="Real-time permission evaluation using role and attribute based access control."
            bullets={[
              "Hierarchical Role Inheritance",
              "Attribute-Based Contextual Access",
              "Real-time Policy Synchronization",
            ]}
            visual={<RBACMock />}
          />

          {/* 4 */}
          <FeatureRow
            reverse
            title="Automated Workflow Orchestration"
            desc="Low-code orchestration for onboarding, billing, and cross-service automation."
            tags={["Event-Driven", "Scalable"]}
            visual={<WorkflowMock />}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ff9900_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-black mb-6">
            Ready to build your next SaaS?
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            Join thousands of developers building scalable, secure platforms.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-orange-500 px-8 py-4 rounded-lg font-bold">
              Get Started for Free
            </button>
            <button className="bg-white/10 px-8 py-4 rounded-lg font-bold border border-white/20">
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENTS                                  */
/* -------------------------------------------------------------------------- */

function FeatureRow({ title, desc, bullets = [], tags = [], visual, reverse }) {
  return (
    <div className="grid lg:grid-cols-2 gap-16 items-center">
      <div className={reverse ? "lg:order-2" : ""}>
        <h2 className="text-3xl font-extrabold mb-6">{title}</h2>
        <p className="text-lg text-slate-600 mb-8">{desc}</p>

        {bullets.length > 0 && (
          <ul className="space-y-3">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-3 items-center">
                <span className="text-green-500">✔</span>
                <span className="font-medium">{b}</span>
              </li>
            ))}
          </ul>
        )}

        {tags.length > 0 && (
          <div className="flex gap-4 mt-6">
            {tags.map((t, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-purple-50 text-purple-700 rounded text-sm font-bold border"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={reverse ? "lg:order-1" : ""}>{visual}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              MOCK UI CARDS                                 */
/* -------------------------------------------------------------------------- */

function IsolationMock() {
  return (
    <MockFrame>
      <div className="space-y-4">
        <MiniCard dot="green" />
        <MiniCard active />
        <MiniCard dot="red" />
      </div>
    </MockFrame>
  );
}

function MiniCard({ active, dot }) {
  return (
    <div
      className={`bg-white rounded-xl p-4 border transition-all
        ${active ? "border-blue-500 shadow-md scale-105" : "border-slate-200 shadow-sm"}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span
          className={`h-2 w-2 rounded-full ${
            dot === "green"
              ? "bg-green-500"
              : dot === "red"
              ? "bg-red-400"
              : "bg-blue-500 animate-pulse"
          }`}
        />
        <div className="h-2 w-24 bg-slate-200 rounded" />
      </div>
      <div className="h-2 w-full bg-slate-100 rounded" />
    </div>
  );
}

function AuthMock() {
  return (
    <MockFrame>
      <div className="bg-white rounded-2xl shadow-lg border p-6 w-[300px]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-3 items-center">
            <div className="h-8 w-8 bg-orange-100 rounded-full" />
            <div>
              <div className="h-2 w-20 bg-slate-200 rounded mb-1" />
              <div className="h-1.5 w-12 bg-slate-100 rounded" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            AUTHENTICATED
          </span>
        </div>

        <div className="flex justify-between items-center bg-slate-50 border rounded-lg px-3 py-2 mb-4">
          <span className="text-[10px] font-mono text-slate-500">
            JWT_TOKEN_HEADER
          </span>
          <span className="text-green-500">🔒</span>
        </div>

        <div className="grid grid-cols-6 gap-2 mb-4">
          {[5, 2, 9, 1].map((n) => (
            <div
              key={n}
              className="h-8 flex items-center justify-center bg-orange-50 border border-orange-200 rounded font-bold text-orange-600"
            >
              {n}
            </div>
          ))}
          <div className="h-8 bg-slate-100 rounded" />
          <div className="h-8 bg-slate-100 rounded" />
        </div>

        <button className="w-full bg-orange-500 text-white text-xs font-bold py-2 rounded-lg">
          Verify OTP
        </button>
      </div>
    </MockFrame>
  );
}

function RBACMock() {
  return (
    <MockFrame grid>
      {["👤", "🔑", "🛡️", "⚙️"].map((icon, i) => (
        <div
          key={i}
          className={`bg-white p-6 rounded-2xl shadow-md border ${
            i % 2 ? "mt-6" : "-mt-2"
          }`}
        >
          <div className="text-orange-500 text-xl mb-3">{icon}</div>
          <div className="h-2 w-16 bg-slate-200 rounded mb-2" />
          <div className="h-1.5 w-full bg-slate-100 rounded" />
        </div>
      ))}
    </MockFrame>
  );
}

function WorkflowMock() {
  return (
    <MockFrame>
      <div className="flex items-center gap-6">
        <Step icon="▶️" active />
        <DashedLine />
        <Step icon="⚙️" />
        <DashedLine gray />
        <Step icon="✅" disabled />
      </div>

      <div className="bg-white mt-6 p-4 rounded-xl border shadow-inner text-[11px] font-mono text-slate-500 w-full max-w-sm">
        <div className="flex justify-between border-b pb-2 mb-2">
          <span>POST /v1/onboard</span>
          <span className="text-green-500">200 OK</span>
        </div>
        <div className="space-y-1">
          <div className="h-1.5 w-full bg-slate-100 rounded" />
          <div className="h-1.5 w-3/4 bg-slate-100 rounded" />
        </div>
      </div>
    </MockFrame>
  );
}

/* -------------------------------------------------------------------------- */

function Step({ icon, active, disabled }) {
  return (
    <div
      className={`h-16 w-16 flex items-center justify-center rounded-2xl shadow border
        ${
          active
            ? "bg-white border-purple-500"
            : disabled
            ? "bg-slate-200 text-slate-400"
            : "bg-white"
        }`}
    >
      {icon}
    </div>
  );
}

function DashedLine({ gray }) {
  return (
    <div
      className={`flex-1 border-t-2 border-dashed ${
        gray ? "border-slate-300" : "border-purple-400"
      }`}
    />
  );
}

function MockFrame({ children, grid }) {
  return (
    <div className="relative bg-slate-50 border border-slate-200 rounded-3xl p-8 h-[400px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#197fe6_1px,transparent_1px)] [background-size:20px_20px]" />
      <div
        className={`relative z-10 ${
          grid ? "grid grid-cols-2 gap-4" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}
