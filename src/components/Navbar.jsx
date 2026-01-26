import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="h-14 flex items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3 font-bold text-xl mr-14">
            <svg
              width="28"
              height="28"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="64" height="64" rx="14" fill="#F97316" />
              <circle cx="32" cy="32" r="6" fill="white" />
              <circle cx="32" cy="14" r="4" fill="white" />
              <circle cx="32" cy="50" r="4" fill="white" />
              <circle cx="14" cy="32" r="4" fill="white" />
              <circle cx="50" cy="32" r="4" fill="white" />
            </svg>
            <span className="font-extrabold leading-none">TenantX</span>
          </div>

          {/* Links */}
          <ul className="hidden md:flex gap-8 text-gray-700 font-medium">
  <li>
    <Link to="/features" className="hover:text-black">
      Features
    </Link>
  </li>
  <li className="hover:text-black cursor-pointer">Solutions</li>
  <li className="hover:text-black cursor-pointer">Pricing</li>
  <li className="hover:text-black cursor-pointer">Documentation</li>
</ul>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-5">
            <button className="text-gray-600">Sign In</button>
            <button className="bg-orange-500 text-white px-5 py-2 rounded-md font-semibold">
              Get Started
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
