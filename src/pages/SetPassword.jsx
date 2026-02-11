import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

export default function SetPassword() {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate("/signin");
    };

    return (
        <AuthLayout>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#0e141b]">
                    Set new password
                </h2>
                <p className="text-sm text-[#4e7397] mt-1">
                    Please enter the verification code sent to your email and your new
                    password.
                </p>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-bold text-[#0e141b] mb-1">
                        Verification Code
                    </label>
                    <input
                        className="w-full h-10 px-3 py-2 text-sm border border-[#d0dbe7] rounded bg-white focus:ring-primary focus:border-primary"
                        id="verification-code"
                        placeholder="Enter 6-digit code"
                        type="text"
                    />
                    <p className="text-[10px] text-[#4e7397] mt-1">
                        Check your inbox for a code from TenantX Support.
                    </p>
                </div>
                <div>
                    <label
                        className="block text-sm font-bold text-[#0e141b] mb-1"
                        htmlFor="new-password"
                    >
                        New Password
                    </label>
                    <input
                        className="w-full h-10 px-3 py-2 text-sm border border-[#d0dbe7] rounded bg-white focus:ring-primary focus:border-primary"
                        id="new-password"
                        placeholder="At least 8 characters"
                        type="password"
                    />
                    <div className="mt-2 flex gap-1">
                        <div className="h-1.5 flex-1 bg-aws-orange rounded-full"></div>
                        <div className="h-1.5 flex-1 bg-aws-orange rounded-full"></div>
                        <div className="h-1.5 flex-1 bg-aws-orange rounded-full"></div>
                        <div className="h-1.5 flex-1 bg-gray-200 rounded-full"></div>
                    </div>
                    <p className="text-[10px] text-[#4e7397] mt-1 font-medium">
                        Password strength: <span className="text-aws-orange">Strong</span>
                    </p>
                </div>
                <div>
                    <label
                        className="block text-sm font-bold text-[#0e141b] mb-1"
                        htmlFor="confirm-password"
                    >
                        Confirm New Password
                    </label>
                    <input
                        className="w-full h-10 px-3 py-2 text-sm border border-[#d0dbe7] rounded bg-white focus:ring-primary focus:border-primary"
                        id="confirm-password"
                        placeholder="Repeat new password"
                        type="password"
                    />
                </div>
                <div className="pt-2">
                    <button
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm shadow-sm"
                        type="submit"
                    >
                        Reset Password
                    </button>
                </div>
                <div className="border-t border-[#d0dbe7] pt-4 mt-6 flex flex-col items-center">
                    <Link
                        to="/signin"
                        className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[16px]">
                            chevron_left
                        </span>
                        Back to Sign In
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
