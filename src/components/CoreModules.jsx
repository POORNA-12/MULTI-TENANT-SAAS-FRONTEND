const modules = [
  {
    title: "Tenant Management",
    desc: "Complete lifecycle management from provisioning to teardown."
  },
  {
    title: "Auth Services",
    desc: "Enterprise-grade identity management with SSO & MFA."
  },
  {
    title: "Role Management",
    desc: "Dynamic RBAC and ABAC engines for fine-grained access."
  },
  {
    title: "Workflow Engine",
    desc: "Low-code orchestration for complex business logic."
  }
];

export default function CoreModules() {
  return (
    <section className="py-20 bg-white">
      <div className="text-center mb-14">
        <p className="text-blue-600 font-semibold text-sm">CORE MODULES</p>
        <h2 className="text-3xl font-bold mt-2">
          Everything needed to run at scale
        </h2>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6 px-6">
        {modules.map((m, i) => (
          <div
            key={i}
            className="border rounded-xl p-6 hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-lg mb-3">{m.title}</h3>
            <p className="text-gray-600 text-sm">{m.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
