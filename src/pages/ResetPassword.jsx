import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

export default function ResetPassword() {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, this would verify email first, but for prototype we can go to signin or stay here
        // Let's assume it sends an email and stays here, or redirects to a confirmation page. 
        // For now, let's just alert or do nothing visible, but we could redirect to signin.
        // Let's redirect to SignIn for flow completion.
        navigate("/signin");
    };

    return (
        <AuthLayout>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#0e141b]">
                    Reset your password
                </h2>
                <p className="text-sm text-[#4e7397] mt-2">
                    Enter your email address and we'll send you a code to reset your
                    password.
                </p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                        required=""
                        type="email"
                    />
                </div>
                <div className="pt-2">
                    <button
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm shadow-sm"
                        type="submit"
                    >
                        Send Reset Code
                    </button>
                </div>
                <div className="border-t border-[#d0dbe7] pt-6 mt-6 flex flex-col items-center">
                    <Link
                        to="/signin"
                        className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            chevron_left
                        </span>
                        Back to Sign In
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
