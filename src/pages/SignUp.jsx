import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

export default function SignUp() {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate("/verify-email");
    };

    return (
        <AuthLayout>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#0e141b]">
                    Create your TenantX Account
                </h2>
                <p className="text-sm text-[#4e7397] mt-1">
                    Get started with our enterprise-grade multi-tenant platform.
                </p>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                    <label
                        className="block text-sm font-bold text-[#0e141b] mb-1"
                        htmlFor="email"
                    >
                        Email Address
                    </label>
                    <input
                        className="w-full h-10 px-3 py-2 text-sm border border-[#d0dbe7] rounded bg-white focus:ring-primary focus:border-primary"
                        id="email"
                        placeholder="name@company.com"
                        type="email"
                    />
                </div>
                <div>
                    <label
                        className="block text-sm font-bold text-[#0e141b] mb-1"
                        htmlFor="password"
                    >
                        Password
                    </label>
                    <input
                        className="w-full h-10 px-3 py-2 text-sm border border-[#d0dbe7] rounded bg-white focus:ring-primary focus:border-primary"
                        id="password"
                        placeholder="At least 8 characters"
                        type="password"
                    />
                    <div className="mt-2 flex gap-1">
                        <div className="h-1 flex-1 bg-aws-orange rounded-full"></div>
                        <div className="h-1 flex-1 bg-aws-orange rounded-full"></div>
                        <div className="h-1 flex-1 bg-gray-200 rounded-full"></div>
                        <div className="h-1 flex-1 bg-gray-200 rounded-full"></div>
                    </div>
                    <p className="text-[10px] text-[#4e7397] mt-1 font-medium">
                        Password strength: <span className="text-aws-orange">Medium</span>
                    </p>
                </div>
                <div>
                    <label
                        className="block text-sm font-bold text-[#0e141b] mb-1"
                        htmlFor="user-type"
                    >
                        User Type
                    </label>
                    <select
                        className="w-full h-10 px-3 py-2 text-sm border border-[#d0dbe7] rounded bg-white focus:ring-primary focus:border-primary"
                        id="user-type"
                    >
                        <option selected="" value="saas_user">
                            SaaS User
                        </option>
                        <option value="tenant_admin">Tenant Administrator</option>
                        <option value="developer">Developer</option>
                        <option value="auditor">Auditor</option>
                    </select>
                </div>
                <div className="pt-2">
                    <button
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm shadow-sm"
                        type="submit"
                    >
                        Sign Up
                    </button>
                </div>
                <p className="text-xs text-[#4e7397] text-center mt-4">
                    By signing up, you agree to the{" "}
                    <a className="text-primary hover:underline" href="#">
                        Customer Agreement
                    </a>{" "}
                    and{" "}
                    <a className="text-primary hover:underline" href="#">
                        Privacy Notice
                    </a>
                    .
                </p>
                <div className="border-t border-[#d0dbe7] pt-4 mt-6 flex flex-col items-center">
                    <p className="text-sm text-[#0e141b]">
                        Already have an account?
                    </p>
                    <Link
                        to="/signin"
                        className="mt-2 w-full text-center py-2 px-4 border border-[#d0dbe7] rounded text-sm font-bold hover:bg-gray-50 transition-colors"
                    >
                        Sign In
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
