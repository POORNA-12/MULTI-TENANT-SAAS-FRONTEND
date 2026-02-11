import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-background-light pt-20 pb-10 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="size-8 bg-orange-500 rounded flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[24px]">hub</span>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                TenantX
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed pr-4">
              Enterprise-grade multi-tenant workflow engine for modern SaaS applications.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Workflows</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Customers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security Hub</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookie Settings</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 text-center">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            © 2024 TenantX Systems Inc. Built for Enterprises.
          </p>
        </div>
      </div>
    </footer>
  );
}
