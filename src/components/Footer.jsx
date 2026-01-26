export default function Footer() {
  return (
    <footer className="border-t py-12 text-sm text-gray-500">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
        <div>
          <p className="font-bold text-black">TenantX</p>
          <p className="mt-2">
            Enterprise-grade multi-tenant workflow engines.
          </p>
        </div>

        <div>
          <p className="font-semibold text-black">Product</p>
          <ul className="mt-2 space-y-1">
            <li>Features</li>
            <li>Security</li>
            <li>API</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-black">Company</p>
          <ul className="mt-2 space-y-1">
            <li>About</li>
            <li>Careers</li>
            <li>Contact</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-black">Legal</p>
          <ul className="mt-2 space-y-1">
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
