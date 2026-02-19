import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AuthService from "../services/authService";

export default function SetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const { email } = location.state || {}; // Retrieve email from previous step

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Optional: Redirect if no email (or let user type it? Plan says pass in state)
    // If we want to be strict:
    useEffect(() => {
        if (!email) {
            // Maybe perform a check or just allow them to try if logic permits, 
            // but backend needs email. If we don't have it, we can't reset.
            // For now, if no email, maybe redirect or show error.
            // Let's assume flow requires it.
            // navigate("/reset-password");
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            await AuthService.resetPassword({
                email: email, // Must have email
                otp: otp,
                new_password: newPassword,
                confirm_password: confirmPassword
            });
            setMessage("Password reset successfully. Redirecting to login...");
            setTimeout(() => {
                navigate("/signin");
            }, 2000);
        } catch (err) {
            console.error("Set password failed", err);
            setError(err.response?.data?.message || "Failed to reset password. Invalid OTP or requirements not met.");
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <AuthLayout>
                <div className="text-center">
                    <p className="text-red-500 mb-4">No email provided for password reset.</p>
                    <Link to="/reset-password" className="text-primary hover:underline">Go back to request reset code</Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#0e141b]">
                    Set new password
                </h2>
                <p className="text-sm text-[#4e7397] mt-1">
                    Please enter the verification code sent to {email} and your new
                    password.
                </p>
            </div>
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                    {error}
                </div>
            )}
            {message && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded">
                    {message}
                </div>
            )}
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
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
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
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
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
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="pt-2">
                    <button
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm shadow-sm disabled:opacity-50"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
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
