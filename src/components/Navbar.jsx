import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const linkClasses = ({ isActive }) =>
    isActive
      ? "text-orange-500 font-bold"
      : "text-gray-700 hover:text-black font-medium transition-colors";

  return (
    <nav className="w-full bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">

        <div className="h-14 flex items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mr-14">
            <div className="size-8 bg-orange-500 rounded flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[24px]">hub</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">TenantX</span>
          </Link>

          {/* Links */}
          <ul className="hidden md:flex gap-8">
            <li>
              <NavLink to="/features" className={linkClasses}>
                Features
              </NavLink>
            </li>
            <li>
              <NavLink to="/solutions" className={linkClasses}>
                Solutions
              </NavLink>
            </li>
            <li className="text-gray-700 font-medium hover:text-black cursor-pointer">Pricing</li>
            <li className="text-gray-700 font-medium hover:text-black cursor-pointer">Documentation</li>
          </ul>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-5">
            <Link to="/signin" className="text-gray-600 font-semibold hover:text-black">Sign In</Link>
            <Link to="/signup" className="bg-orange-500 text-white px-5 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors">
              Get Started
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}
