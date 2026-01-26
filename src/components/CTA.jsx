export default function CTA() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto bg-blue-600 rounded-2xl text-center py-16 px-6 text-white">
        <h2 className="text-4xl font-bold">
          Ready to scale your SaaS?
        </h2>
        <p className="mt-4 text-blue-100">
          Join over 500+ engineering teams building on TenantX.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button className="bg-orange-500 px-6 py-3 rounded-md font-semibold">
            Get Started Now
          </button>
          <button className="border border-white px-6 py-3 rounded-md">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
}
