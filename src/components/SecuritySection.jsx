export default function SecuritySection() {
  return (
    <section className="bg-gradient-to-br from-[#0b1220] to-[#0f172a] text-white py-24">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

        {/* Left */}
        <div>
          <p className="text-orange-400 font-semibold text-sm">
            SECURITY FIRST
          </p>
          <h2 className="text-4xl font-bold mt-4">
            Bulletproof Isolation & Audit Compliance
          </h2>

          <ul className="mt-8 space-y-4 text-gray-300">
            <li>✅ Logical & Physical Isolation</li>
            <li>✅ Immutable Audit Trails</li>
            <li>✅ Continuous Monitoring</li>
          </ul>
        </div>

        {/* Right fake terminal */}
        <div className="bg-[#020617] rounded-xl p-6 text-sm font-mono text-green-400 shadow-lg">
          <p>[14:20:11] AUTH Tenant "Acme-Corp" user admin_01 logged in</p>
          <p>[14:21:05] RBAC Policy updated for Global-Audit</p>
          <p>[14:22:10] WORKFLOW Auto-Provisioning started</p>
        </div>

      </div>
    </section>
  );
}
