export default function Hero() {
  return (
    <section className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">

        <span className="text-blue-600 text-sm font-semibold">
          ● ENTERPRISE v2.4 NOW LIVE
        </span>

        <h1 className="mt-6 text-5xl md:text-6xl font-extrabold leading-tight">
          Next-Generation <br />
          <span className="text-blue-600">
            Multi-Tenant Workflow Engine
          </span>
        </h1>

        <p className="mt-6 text-gray-600 max-w-3xl mx-auto">
          The infrastructure backbone for modern SaaS. Scale securely with
          automated tenant lifecycle management, dynamic RBAC, and
          high-performance workflow orchestration.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <button className="bg-orange-500 text-white px-8 py-3 rounded-md font-semibold">
            Get Started for Free
          </button>
          <button className="border px-8 py-3 rounded-md font-semibold">
            ▶ Request Demo
          </button>
        </div>

        <p className="mt-14 text-sm text-gray-400 tracking-widest">
          TRUSTED BY INDUSTRY LEADERS
        </p>
      </div>
    </section>
  );
}
